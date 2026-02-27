import { AuthService } from "@/lib/application/auth/auth-service";
import { PrismaUserRepository } from "@/lib/infrastructure/repositories/prisma-user-repository";
import { BcryptPasswordHasher } from "@/lib/infrastructure/security/bcrypt-password-hasher";
import { createTokenService } from "@/lib/http/token-context";

export function createAuthService(): AuthService {
  return new AuthService(
    new PrismaUserRepository(),
    new BcryptPasswordHasher(),
    createTokenService(),
  );
}
