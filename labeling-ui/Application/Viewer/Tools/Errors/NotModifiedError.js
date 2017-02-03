class NotModifiedError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotModifiedError";
    this.message = message;
  }
}

export default NotModifiedError;
