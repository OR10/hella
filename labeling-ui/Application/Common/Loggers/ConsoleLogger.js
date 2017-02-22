/**
 * @implements Logger
 */
class ConsoleLogger {
  log(context, ...args) {
    console.log(...this._incorporateContext(context, ...args)); // eslint-disable-line no-console
  }

  warn(context, ...args) {
    console.warn(...this._incorporateContext(context, ...args)); // eslint-disable-line no-console
  }

  groupStart(context, ...args) {
    console.groupCollapsed(...this._incorporateContext(context, ...args)); // eslint-disable-line no-console
  }

  groupStartOpened(context, ...args) {
    console.group(...this._incorporateContext(context, ...args)); // eslint-disable-line no-console
  }

  groupEnd(context) { // eslint-disable-line no-unused-vars
    console.groupEnd(); // eslint-disable-line no-console
  }

  _incorporateContext(context, ...args) {
    const newArgs = [];
    const {formatString, formatArguments} = this._getFormatStringFromValue(args.shift());
    newArgs.push(
      `[%c${context}%c] ${formatString}`
    );
    newArgs.push(
      'color: goldenrod'
    );
    newArgs.push(
      'color: inherit'
    );
    formatArguments.forEach(arg => newArgs.push(arg));
    args.forEach(arg => newArgs.push(arg));
    return newArgs;
  }

  _getFormatStringFromValue(value) {
    if (typeof value === 'string') {
      return {formatString: value, formatArguments: []};
    }

    if (Array.isArray(value)) {
      return {formatString: '%O', formatArguments: [value]};
    }

    if (typeof value === 'object') {
      return {formatString: '%O', formatArguments: [value]};
    }

    if (typeof value === 'object') {
      return {formatString: '%O', formatArguments: [value]};
    }

    if (value instanceof HTMLElement) {
      return {formatString: '%o', formatArguments: [value]};
    }

    if (Number.parseInt(value, 10) === value) {
      return {formatString: '%i', formatArguments: [value]};
    }

    if (Number.parseFloat(value) === value) {
      return {formatString: '%f', formatArguments: [value]};
    }

    throw new Error('What the hell did you give me to log?');
  }
}

export default ConsoleLogger;
