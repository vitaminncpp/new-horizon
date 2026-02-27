import { createTokenService } from "@/lib/http/token-context";
import { readSessionToken } from "@/lib/http/session";

export async function getCurrentSession() {
  const token = await readSessionToken();

  if (!token) {
    return null;
  }

  const payload = await createTokenService().verify(token);

  if (!payload) {
    return null;
  }

  return {
    userId: payload.sub,
    email: payload.email,
  };
}
