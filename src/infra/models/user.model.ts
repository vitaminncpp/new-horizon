export class User {
  id!: string;
  name!: string;
  email!: string;
  password?: string;
  role!: "learner" | "instructor" | "admin";
  session_version?: number;

  created_at!: Date;
  deleted_at!: Date | null;
  is_deleted!: boolean;
}
