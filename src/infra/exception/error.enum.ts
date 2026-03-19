enum ErrorCode {
  VALIDATION_FAILED = "common.validation.failed",

  USERNAME_ALREADY_PRESENT = "auth.username.exists",
  USERNAME_NOT_EXIST = "auth.username.not_found",
  USER_NOT_EXIST = "auth.user.not_found",

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
  GAME_IS_NOT_ACTIVE = "game.not_active",
  GAME_UPDATE_FAILED = "game.update_failed",
  INVALID_GAME_ID = "game.invalid_id",

  REQUEST_ALREADY_PROCESSING = "request.already_processing",
  REQUEST_NOT_FOUND = "request.not_found",

  INVALID_CONNECTION_ID = "connection.invalid_id",

  ENV_ERROR = "system.env.error",
  INTERNAL_SERVER_ERROR = "system.internal_error",
  NOT_APPLICABLE = "common.not_applicable",
}

export default ErrorCode;
