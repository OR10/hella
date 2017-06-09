class TemplateString {
  /**
   * @param {string} rawString
   */
  constructor(rawString) {
    /**
     * @type {string}
     * @private
     */
    this._raw = rawString;

    /**
     * @type {string}
     * @private
     */
    this._templateValuePattern = '\\{\\{(:?)([a-zA-Z0-9-_]+)\\}\\}';

    /**
     * @type {string}
     * @private
     */
    this._anythingPattern = '(.*)';

    /**
     * @type {{isSetter: boolean, prefix: string, identifier: string|null, suffix: string}}
     * @private
     */
    this._templateInformation = this._getTemplateInformation(this._raw);
  }

  /**
   * @returns {boolean}
   */
  isTemplate() {
    return this._templateInformation.identifier !== null;
  }

  /**
   * @returns {boolean}
   */
  isGetter() {
    return this.isTemplate() && !this._isSetter();
  }

  /**
   * @returns {boolean}
   */
  isSetter() {
    return this._templateInformation.isSetter;
  }

  /**
   * @returns {string|null}
   */
  getIdentifier() {
    return this._templateInformation.identifier;
  }

  /**
   * @param {string} valueString
   * @return {string|null}
   */
  extractValue(valueString) {
    const {prefix, suffix} = this._templateInformation;
    const prefixPattern = this._createPatternFromString(prefix);
    const suffixPattern = this._createPatternFromString(suffix);

    const valueExtractor = this._buildRegexpFromParts(
      '^',
      prefixPattern,
      this._anythingPattern,
      suffixPattern,
      '$',
    );

    const valueMatches = valueExtractor.exec(valueString);

    if (valueMatches === null) {
      return null;
    }

    const [, value] = valueMatches;
    return value;
  }

  /**
   * @param {Map.<string,*>} dictionary
   */
  expandWithDictionary(dictionary) {
    const {identifier} = this._templateInformation;
    if (identifier === null) {
      return this._raw;
    }

    if (!dictionary.has(identifier)) {
      throw new Error(`Identifier "${identifier}" needed for template expansion not found in dictionary.`);
    }

    const identifierPattern = this._createPatternFromString(identifier);
    const replacementExpression = this._buildRegexpFromParts(
      '\\{\\{:?',
      identifierPattern,
      '\\}\\}',
    );

    return this._raw.replace(
      replacementExpression,
      dictionary.get(identifier),
    );
  }

  /**
   * Create information about the template string, like prefix, identifier and suffix
   *
   * @param {string} raw
   * @returns {{isSetter: boolean, prefix: string, identifier: string|null, suffix: string}}
   * @private
   */
  _getTemplateInformation(raw) {
    const templateExtractor = this._buildRegexpFromParts(
      '^',
      this._anythingPattern,
      this._templateValuePattern,
      this._anythingPattern,
      '$',
    );

    const matches = templateExtractor.exec(raw);

    if (matches === null) {
      return {
        prefix: raw,
        identifier: null,
        suffix: '',
        isSetter: false,
      };
    }

    const [, prefix, setterIndicator, identifier, suffix] = matches;
    return {
      prefix,
      identifier,
      suffix,
      isSetter: setterIndicator === ':',
    };
  }

  /**
   * Escape a string to not include any special regexp values anymore.
   *
   * @param {string} str
   * @return {string}
   * @private
   */
  _createPatternFromString(str) {
    return str
      .replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  /**
   * Build a regexp consisting of multiple patterns
   *
   * @param {string} parts
   * @returns {RegExp}
   * @private
   */
  _buildRegexpFromParts(...parts) {
    const pattern = parts.join('');
    return new RegExp(`${pattern}`);
  }
}

export default TemplateString;
