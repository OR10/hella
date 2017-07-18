class Logger {
  logString(string) {
    this.string = string;
    // eslint-disable-next-line no-console
    console.log(this.string);
  }
}

exports.Logger = Logger;
