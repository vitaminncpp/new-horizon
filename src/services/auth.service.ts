import * as token from "@/src/services/token.service";
import * as userService from "@/src/services/user.service";
import { User } from "@/src/infra/models/user.model";
import { Exception } from "@/src/infra/exception/app.exception";
import ErrorCode from "@/src/infra/exception/error.enum";
import { AuthClaims } from "@/src/services/token.service";

export async function authenticate(access: string): Promise<User> {
  const claims = token.verifyAccess(access);
  if (!claims) {
    throw new Exception(ErrorCode.UNAUTHORIZED, "Unauthorized");
  }
  return getAuthenticatedUser(claims);
}

export async function register(email: string, name: string, password: string) {
  const pHash = await token.hash(password);
  return userService.createUser({
    email,
    name,
    password: pHash,
    role: "learner",
  } as User);
}

export async function login(email: string, password: string) {
  const user = await userService.getUserByEmail(email, true);
  assertActiveUser(user);

  const match = await token.comparePass(password, user.password!);
  if (!match) {
    throw new Exception(ErrorCode.INVALID_PASSWORD, "Invalid password", {
      email,
      password,
    });
  }

  return issueSession(user);
}

export async function refreshToken(refresh: string) {
  const claims = token.verifyRefresh(refresh);
  if (!claims) {
    throw new Exception(ErrorCode.INVALID_TOKEN, "Invalid Refresh Token");
  }
  return refreshSession(claims);
}

export async function refreshSession(claims: AuthClaims) {
  const user = await getAuthenticatedUserRecord(claims);
  return issueSession(user);
}

export async function getAuthenticatedUser(claims: AuthClaims) {
  const user = await getAuthenticatedUserRecord(claims);
  return sanitizeUser(user);
}

async function getAuthenticatedUserRecord(claims: AuthClaims) {
  const user = await userService.getUser(claims.sub, true);
  assertActiveUser(user);

  if ((user.session_version ?? 1) !== claims.sessionVersion) {
    throw new Exception(ErrorCode.UNAUTHORIZED, "Session expired");
  }

  if (user.role !== claims.role || user.email !== claims.email) {
    throw new Exception(ErrorCode.UNAUTHORIZED, "Session is no longer valid");
  }

  return user;
}

export async function logout(accessToken?: string, refreshToken?: string) {
  const accessClaims = accessToken ? token.verifyAccess(accessToken) : null;
  const refreshClaims = refreshToken ? token.verifyRefresh(refreshToken) : null;
  const claims = accessClaims ?? refreshClaims;

  if (!claims) {
    return;
  }

  await userService.incrementSessionVersion(claims.sub);
}

function issueSession(user: User) {
  const accessToken = token.accessToken(user);
  const refreshToken = token.refreshToken(user);
  return {
    accessToken,
    refreshToken,
    user: sanitizeUser(user),
  };
}

function sanitizeUser(user: User): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    created_at: user.created_at,
    is_deleted: user.is_deleted,
    deleted_at: user.deleted_at,
  } as User;
}

function assertActiveUser(user: User) {
  if (user.is_deleted) {
    throw new Exception(ErrorCode.UNAUTHORIZED, "User account is unavailable");
  }
}
