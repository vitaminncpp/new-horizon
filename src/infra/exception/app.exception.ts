import ErrorCode from "@/src/infra/exception/error.enum";

export class Exception<Data = any> extends Error {
  public readonly code: ErrorCode;
  public readonly data?: Data;

  constructor(code: ErrorCode, message?: string, data?: Data) {
    super(message || "Internal Server Error");
    this.name = "Exception";
    this.code = code;
    this.data = data;
    Object.setPrototypeOf(this, Exception.prototype);
  }
}
