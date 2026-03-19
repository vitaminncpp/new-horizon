export class User {
  id!: string;
  name!: string;
  email!: string;
  password!: string;

  created_at!: Date;
  deleted_at!: Date | null;
  is_deleted!: boolean;
}
