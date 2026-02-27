import bcrypt from "bcryptjs";
import type { PasswordHasher } from "@/lib/application/security/password-hasher";

const SALT_ROUNDS = 12;

export class BcryptPasswordHasher implements PasswordHasher {
  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, SALT_ROUNDS);
  }

  async verify(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}
