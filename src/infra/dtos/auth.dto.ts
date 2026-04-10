import { User } from "@/src/infra/models/user.model";

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  email: string;
  name: string;
  password: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ErrorResponseDto {
  error: string;
}
