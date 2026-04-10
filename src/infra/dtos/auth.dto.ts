import { z } from "zod";
import { User } from "@/src/infra/models/user.model";

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export const registerRequestSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(2).max(100),
  password: z.string().min(8).max(72),
});

export type LoginRequestDto = z.infer<typeof loginRequestSchema>;
export type RegisterRequestDto = z.infer<typeof registerRequestSchema>;

export interface AuthResponseDto {
  user: User;
}

export interface ErrorResponseDto {
  error: string;
  code?: string;
  details?: unknown;
}
