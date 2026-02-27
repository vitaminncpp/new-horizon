import { SignJWT, jwtVerify } from "jose";
import type {
  AuthTokenPayload,
  TokenService,
} from "@/lib/application/security/token-service";

const encoder = new TextEncoder();
const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

export class JwtTokenService implements TokenService {
  constructor(private readonly secret: string) {}

  async sign(payload: AuthTokenPayload): Promise<string> {
    return new SignJWT({ email: payload.email })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(payload.sub)
      .setIssuedAt()
      .setExpirationTime(`${ONE_WEEK_SECONDS}s`)
      .sign(encoder.encode(this.secret));
  }

  async verify(token: string): Promise<AuthTokenPayload | null> {
    try {
      const { payload } = await jwtVerify(token, encoder.encode(this.secret));

      if (!payload.sub || typeof payload.email !== "string") {
        return null;
      }

      return {
        sub: payload.sub,
        email: payload.email,
      };
    } catch {
      return null;
    }
  }
}
