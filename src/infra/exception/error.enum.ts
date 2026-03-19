enum ErrorCode {
  // Common Errors
  VALIDATION_FAILED = "common.validation.failed",
  // Validation Errors
  VALIDATION_NO_BODY = "validation.req.no_body",

  // User Errors
  USERNAME_DUPLICATE = "user.username.duplicate",
  USERNAME_NOT_FOUND = "user.username.not_found",
  USER_NOT_FOUND = "user.user.not_found",

  // Auth Errors
  AUTH_JWT_SIGN = "auth.jwt.sign",
  AUTH_JWT_VERIFY = "auth.jwt.verify",
  AUTH_PASS_HASH = "auth.password.hash",
  AUTH_PASS_COMP = "auth.password.compare",
  INVALID_PASSWORD = "auth.password.invalid",
  INVALID_TOKEN = "auth.token.invalid",
  USER_INSERTION_FAILED = "auth.user.insert_failed",
  UNAUTHORIZED = "auth.user.unauthorized",

  PROJECT_NOT_EXIST = "auth.project.not_found",

  RECORD_INSERTION_FAILED = "db.record.insert_failed",
  ROLE_NOT_EXIST = "db.role.not_found",
  ROLE_INSERTION_FAILED = "db.role.insert_failed",

  ERROR_FETCHING_DATA = "data.fetch_error",
  RESOURCE_NOT_FOUND = "resource.not_found",

  GAME_NOT_FOUND = "game.not_found",
  GAME_NOT_ACTIVE = "game.not_active",
  GAME_UPDATE_FAILED = "game.update_failed",
  INVALID_GAME_ID = "game.invalid_id",

  REQUEST_ALREADY_PROCESSING = "request.already_processing",
  REQUEST_NOT_FOUND = "request.not_found",

  INVALID_CONNECTION_ID = "connection.invalid_id",

  ENV_ERROR = "system.env.error",
  INTERNAL_SERVER_ERROR = "system.internal_error",
  // DATABASE_ERROR = "system.database_error",
  NOT_APPLICABLE = "common.not_applicable",

  // Database errors
  DB_INTERNAL_ERROR = "db.internal.error",
  DB_USER_NOT_FOUND = "db.user.not_found",
  DB_USER_DUPLICATE = "db.user.duplicate",
  DB_USER_VALIDATION = "db.user.validation",

  // WS
  WS_AUTH_FAILED = "ws.auth.failed",

  // Chat Errors
  CHAT_REQUEST_NOT_FOUND = "chat.request.not_found",
  CHAT_SAME_SENDER_RECEIVER = "chat.user.same",
  CHAT_REQUEST_PENDING = "chat.request.pending",
  CHAT_USER_NOT_PARTICIPANT = "chat.user.not_participant",
  CHAT_USER_NOT_SENDER = "chat.user.not_sender",
}

export default ErrorCode;
