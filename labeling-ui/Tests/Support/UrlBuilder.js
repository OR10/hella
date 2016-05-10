/**
 * Build e2e Test URLs based in active test options
 */
class UrlBuilder {
  /**
   * @param {Object} options
   */
  constructor(options = {}) {
    this._options = options;
  }

  set(key, value) {
    this._options[key] = value;
  }

  get(key) {
    return this._options[key];
  }

  url(path) {
    const optionStrings = [];
    for (const key in this._options) {
      if (!this._options.hasOwnProperty(key)) {
        continue;
      }
      const value = this._options[key];
      const encodedKey = encodeURIComponent(`TEST_${key}`);
      const encodedValue = encodeURIComponent(value);
      optionStrings.push(
        `${encodedKey}=${encodedValue}`
      );
    }

    const hash = optionStrings.join('&');
    if (hash === '') {
      return path;
    }

    return `${path}#${hash}`;
  }
}

export default UrlBuilder;
