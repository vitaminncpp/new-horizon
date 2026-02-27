import type { User } from "../entities/user";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(input: { email: string; passwordHash: string }): Promise<User>;
}
