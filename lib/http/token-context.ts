import { authEnv } from "@/lib/config/env";
import { JwtTokenService } from "@/lib/infrastructure/security/jwt-token-service";

export function createTokenService() {
  return new JwtTokenService(authEnv.AUTH_SECRET);
}
