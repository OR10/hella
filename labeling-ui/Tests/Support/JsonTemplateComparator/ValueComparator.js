import InnerDocumentVisitor from './InnerDocumentVisitor';
import TemplateString from './TemplateString';
import {isString} from 'lodash';

class ValueComparator extends InnerDocumentVisitor {
  constructor(dictionary) {
    super();
    /**
     * @type {Map.<string, *>}
     * @private
     */
    this._dictionary = dictionary;
  }

  visitScalar(firstNode, secondNode, path) {
    let expectedScalar = firstNode;
    let actualScalar = secondNode;

    if (isString(expectedScalar)) {
      const template = new TemplateString(expectedScalar);

      if (template.isTemplate()) {
        expectedScalar = template.expandWithDictionary(this._dictionary);
      }
    }

    switch (true) {
      case this._isFloat(expectedScalar) && this._isFloat(actualScalar):
        return this._assertFloatsAreMatching(expectedScalar, actualScalar, path);
      default:
        return this._assertScalarsAreMatching(expectedScalar, actualScalar, path);
    }
  }

  /**
   * @param {*} value
   * @returns {boolean}
   * @private
   */
  _isFloat(value) {
    return Number(value) === value && value % 1 !== 0;
  }

  /**
   * @param {Number} expectedValue
   * @param {Number} actualValue
   * @param {string} path
   * @param {Number?} precision
   * @private
   */
  _assertFloatsAreMatching(expectedValue, actualValue, path, precision = 10) {
    const delta = Math.pow(10, -precision) / 2;
    const difference = Math.abs(expectedValue - actualValue);

    if (difference < delta) {
      return;
    }

    throw new Error(`Floating point values differ by more than ${delta}: ${expectedValue} !== ${actualValue} (difference: ${difference}) at location ${path}`);
  }

  /**
   * @param {string} expectedString
   * @param {string} actualString
   * @param {string} path
   * @private
   */
  _assertStringsAreMatching(expectedString, actualString, path) {
    const template = new TemplateString(expectedString);

    if (!template.isTemplate()) {
      return this._assertScalarsAreMatching(expectedString, actualString, path);
    }

    return this._assertScalarsAreMatching(
      template.expandWithDictionary(this._dictionary),
      actualString,
      path,
    );
  }

  /**
   * @param {string|number|boolean|null|undefined} expectedScalar
   * @param {string|number|boolean|null|undefined} actualScalar
   * @param {string} path
   * @private
   */
  _assertScalarsAreMatching(expectedScalar, actualScalar, path) {
    if (expectedScalar === actualScalar) {
      return;
    }

    throw new Error(`Scalar values not identical: ${expectedScalar} !== ${actualScalar} at location ${path}`);
  }
}

export default ValueComparator;