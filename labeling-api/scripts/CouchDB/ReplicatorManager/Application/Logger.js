class Logger {
  logString(message) {
    const now = new Date();
    // eslint-disable-next-line no-console
    console.log(`[${now.toISOString()}] ${message}`);
  }
}

exports.Logger = Logger;
