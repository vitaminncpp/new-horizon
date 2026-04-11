type RouteAccessRule = {
  prefix: string;
};

export const publicRoutes: string[] = ["/", "/login", "/register"];

export const authRoutes: string[] = ["/login", "/register"];

export const protectedRouteRules: RouteAccessRule[] = [
  { prefix: "/dashboard" },
  { prefix: "/courses" },
  { prefix: "/course" },
  { prefix: "/profile" },
];
