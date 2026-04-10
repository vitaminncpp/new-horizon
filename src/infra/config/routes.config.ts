import { User } from "@/src/infra/models/user.model";

export type RouteRole = User["role"];

type RouteAccessRule = {
  prefix: string;
  allowedRoles?: RouteRole[];
};

export const publicRoutes: string[] = ["/", "/login", "/register"];

export const authRoutes: string[] = ["/login", "/register"];

export const protectedRouteRules: RouteAccessRule[] = [
  { prefix: "/workspace", allowedRoles: ["learner", "instructor", "admin"] },
  { prefix: "/learn", allowedRoles: ["learner", "instructor", "admin"] },
  { prefix: "/instructor", allowedRoles: ["instructor", "admin"] },
  { prefix: "/admin", allowedRoles: ["admin"] },
];
