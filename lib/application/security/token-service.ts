export type AuthTokenPayload = {
  sub: string;
  email: string;
};

export interface TokenService {
  sign(payload: AuthTokenPayload): Promise<string>;
  verify(token: string): Promise<AuthTokenPayload | null>;
}
