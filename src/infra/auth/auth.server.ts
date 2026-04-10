import { NextRequest, NextResponse } from "next/server";
import { User } from "@/src/infra/models/user.model";
import { AUTH_COOKIE } from "@/src/infra/auth/auth-cookie";
import { Exception } from "@/src/infra/exception/app.exception";
import ErrorCode from "@/src/infra/exception/error.enum";
import * as authService from "@/src/services/auth.service";
import { AuthClaims, verifyAccessClaims, verifyRefreshClaims } from "@/src/services/token.service";

export type UserRole = User["role"];

export async function requireSessionUser(req: NextRequest) {
  const accessToken = req.cookies.get(AUTH_COOKIE.ACCESS)?.value;
  const refreshToken = req.cookies.get(AUTH_COOKIE.REFRESH)?.value;

  if (!accessToken && !refreshToken) {
    throw new Exception(ErrorCode.UNAUTHORIZED, "Authentication required");
  }

  const accessClaims = accessToken ? verifyAccessClaims(accessToken) : null;
  if (accessClaims) {
    return authService.getAuthenticatedUser(accessClaims);
  }

  const refreshClaims = refreshToken ? verifyRefreshClaims(refreshToken) : null;
  if (!refreshClaims) {
    throw new Exception(ErrorCode.UNAUTHORIZED, "Authentication required");
  }

  return authService.getAuthenticatedUser(refreshClaims);
}

export async function requireRoles(req: NextRequest, roles: UserRole[]) {
  const user = await requireSessionUser(req);
  if (!roles.includes(user.role)) {
    throw new Exception(ErrorCode.FORBIDDEN, "Insufficient permissions", {
      requiredRoles: roles,
      actualRole: user.role,
    });
  }
  return user;
}

export async function getRouteUser(req: NextRequest) {
  const accessToken = req.cookies.get(AUTH_COOKIE.ACCESS)?.value;
  if (!accessToken) {
    return null;
  }

  const claims = verifyAccessClaims(accessToken);
  if (!claims) {
    return null;
  }

  try {
    return await authService.getAuthenticatedUser(claims);
  } catch {
    return null;
  }
}

export function isRoleAllowed(role: UserRole, allowedRoles?: UserRole[]) {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }
  return allowedRoles.includes(role);
}

export function getClaimsFromRequest(req: NextRequest): AuthClaims | null {
  const accessToken = req.cookies.get(AUTH_COOKIE.ACCESS)?.value;
  if (!accessToken) {
    return null;
  }
  return verifyAccessClaims(accessToken);
}
