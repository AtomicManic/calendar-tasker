class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 401;
  }
}

class UnableToCreateUserError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

module.exports = { UnauthorizedError, UnableToCreateUserError };