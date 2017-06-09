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

    if (!isString(expectedScalar) || !isString(actualScalar)) {
      return this._assertScalarsAreMatching(expectedScalar, actualScalar, path);
    }

    this._assertStringsAreMatching(expectedScalar, actualScalar, path);
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

    const identifier = template.getIdentifier();

    if (!this._dictionary.has(identifier)) {
      throw new Error(`Template identifier ${identifier} used at location ${path} not found in dictionary. Did you not define it?`);
    }

    return this._assertScalarsAreMatching(
      template.expandWithDictionary(this._dictionary),
      actualString,
      path
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