class ToolAbortedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ToolAbortedError';
    this.message = message;
  }
}

export default ToolAbortedError;
