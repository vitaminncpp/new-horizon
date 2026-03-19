import { User } from "@/src/infra/models/user.model";

export default class AuthToken {
  accessToken!: string;
  refreshToken!: string;
  user!: User;
}
