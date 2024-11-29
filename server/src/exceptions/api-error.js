class ApiError extends Error {
  status;

  constructor(status, message) {
    super(message);
    this.status = status;
  }

  static BadRequest(message) {
    return new ApiError(400, message);
  }

  static UnauthorizedError() {
    return new ApiError(401, 'Not authorized');
  }

  static ForbiddenError() {
    return new ApiError(403, 'Forbidden');
  }
}

export default ApiError;
