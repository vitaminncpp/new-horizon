import { AuthError } from "./errors";
import { credentialsSchema, type CredentialsInput } from "./schemas";
import type { UserRepository } from "@/lib/domain/repositories/user-repository";
import type { PasswordHasher } from "@/lib/application/security/password-hasher";
import type { TokenService } from "@/lib/application/security/token-service";

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
  ) {}

  async register(rawInput: CredentialsInput) {
    const input = credentialsSchema.parse(rawInput);
    const existingUser = await this.userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new AuthError("Email is already registered", 409);
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = await this.userRepository.create({
      email: input.email,
      passwordHash,
    });

    const token = await this.tokenService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async login(rawInput: CredentialsInput) {
    const input = credentialsSchema.parse(rawInput);
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new AuthError("Invalid email or password", 401);
    }

    const validPassword = await this.passwordHasher.verify(
      input.password,
      user.passwordHash,
    );

    if (!validPassword) {
      throw new AuthError("Invalid email or password", 401);
    }

    const token = await this.tokenService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
}
