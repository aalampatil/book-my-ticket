class ApiError extends Error {

  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "bad request") {
    return new ApiError(400, message);
  }

  static unauthorisedRequest(
    message = "unauthorised request",
  ) {
    return new ApiError(401, message);
  }

  static unauthorised(message = "unauthrised") {
    return new ApiError(401, message);
  }

  static Conflict(message = "Conflict - user already exist") {
    return new ApiError(409, message);
  }

  static forbidden(message = "forbidden") {
    return new ApiError(409, message);
  }
  static notfound(message = "not found") {
    return new ApiError(412, message);
  }
}

export default ApiError;