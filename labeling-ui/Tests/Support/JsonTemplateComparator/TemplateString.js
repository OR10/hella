import {isString} from 'lodash';

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
    this._templateValuePattern = '\\{\\{(:?)([a-zA-Z0-9-_]+?)\\}\\}';

    /**
     * @type {string}
     * @private
     */
    this._anythingPattern = '(.*?)';

    /**
     * @type {Array.<{isGetter: boolean, isSetter: boolean, value: string}>}}
     * @private
     */
    this._templateParts = this._getTemplateParts(this._raw);
  }

  /**
   * @returns {boolean}
   */
  isTemplate() {
    return this._templateParts.reduce((isTemplate, part) => {
      return isTemplate || part.isSetter || part.isGetter;
    }, false);
  }

  /**
   * @returns {boolean}
   */
  isGetter() {
    return this._templateParts.reduce((isGetter, part) => {
      return isGetter || part.isGetter;
    }, false);
  }

  /**
   * @returns {boolean}
   */
  isSetter() {
    return this._templateParts.reduce((isSetter, part) => {
      return isSetter || part.isSetter;
    }, false);
  }

  /**
   * @returns {Array.<string>}}
   */
  getIdentifiers() {
    return this._templateParts
      .filter(part => part.isGetter || part.isSetter)
      .map(part => part.value);
  }

  /**
   * @param {string|number|boolean|undefined|null} valueScalar
   * @return {Map.<string, string>}
   */
  extractDictionary(valueScalar) {
    const patterns = this._templateParts.map(part => {
      switch (true) {
        case part.isGetter:
        case part.isSetter:
          return this._anythingPattern;
        default:
          return this._createPatternFromString(part.value);
      }
    });

    // Handle values that are not strings
    if (!isString(valueScalar)) {
      // Match is impossible if we have a non complex template string with a non string scalar
      if (patterns.length > 1) {
        return new Map();
      }

      return new Map([[this._templateParts[0].value, valueScalar]]);
    }

    const valueExtractor = this._buildRegexpFromParts(
      '^',
      ...patterns,
      '$',
    );

    const matches = valueExtractor.exec(valueScalar);

    if (matches === null) {
      return new Map();
    }

    const [, ...values] = matches;

    const dictionary = new Map();
    values.forEach((value, index) => {
      const part = this._templateParts[index];
      if (part.isSetter) {
        dictionary.set(part.value, value);
      }
    });

    return dictionary;
  }

  /**
   * @param {Map.<string,string>} dictionary
   * @return {string}
   */
  expandWithDictionary(dictionary) {
    const expandedParts = this._templateParts.map(part => {
      switch(true) {
        case part.isGetter:
        case part.isSetter:
          if (!dictionary.has(part.value)) {
            throw new Error(`Identifier "${part.value}" needed for template expansion not found in dictionary.`);
          }
          return dictionary.get(part.value);
        default:
          return part.value;
      }
    });

    // Ensure non string expansion is possible in non complex form.
    if (expandedParts.length === 1) {
      return expandedParts[0];
    }

    return expandedParts.join('');
  }

  /**
   * Create a lexed version of the template string
   *
   * @param {string} raw
   * @returns {Array.<{isGetter: boolean, isSetter: boolean, value: string}>}}
   * @private
   */
  _getTemplateParts(raw) {
    const templateExtractor = new RegExp(this._templateValuePattern, 'g');

    const templateExpansions = [];
    let matches;
    while ((matches = templateExtractor.exec(raw)) !== null) {
      const [fullMatch, setterIndicator, identifier] = matches;
      const index = matches.index;

      templateExpansions.push({
        isSetter: setterIndicator === ':',
        length: fullMatch.length,
        identifier,
        index,
      });
    }

    const parts = [];
    let leftOverRaw = raw;
    let rawIndex = 0;
    while (leftOverRaw !== '') {
      if (templateExpansions.length === 0) {
        parts.push({
          isSetter: false,
          isGetter: false,
          value: leftOverRaw,
        });
        break;
      }

      if (templateExpansions[0].index > rawIndex) {
        const distance = templateExpansions[0].index - rawIndex;
        parts.push({
          isSetter: false,
          isGetter: false,
          value: leftOverRaw.substr(0, distance),
        });
        rawIndex += distance;
        leftOverRaw = leftOverRaw.substr(distance);
      }

      const expansion = templateExpansions.shift();
      parts.push({
        isGetter: !expansion.isSetter,
        isSetter: expansion.isSetter,
        value: expansion.identifier,
      });

      rawIndex += expansion.length;
      leftOverRaw = leftOverRaw.substr(expansion.length);
    }

    return parts;
  }

  /**
   * Escape a string to not include any special regexp values anymore.
   *
   * The string will furthermore be surrounded by a matching group.
   *
   * @param {string} str
   * @return {string}
   * @private
   */
  _createPatternFromString(str) {
    const escapedString = str
      .replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

    return `(${escapedString})`;
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
