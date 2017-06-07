import InnerDocumentVisitor from './InnerDocumentVisitor';

class ValueComparator extends InnerDocumentVisitor {
  constructor(dictionary) {
    super();
    /**
     * @type {Map.<string, *>}
     * @private
     */
    this._dictionary = dictionary;

    /**
     * @type {RegExp}
     * @private
     */
    this._dictionaryKeyRegExp = /\{\{:?([a-zA-Z0-9-_]+)\}\}/;
  }

  visitScalar(firstNode, secondNode, path) {
    let expectedScalar = firstNode;
    let actualScalar = secondNode;

    const matches = this._dictionaryKeyRegExp.exec(expectedScalar);

    if (matches !== null) {
      const [, identifier] = matches;

      if (!this._dictionary.has(identifier)) {
        throw new Error(`Template identifier ${identifier} not found in template dictionary at location ${path}. Did you not define it?`);
      }

      expectedScalar = this._dictionary.get(identifier);
    }

    if (expectedScalar === actualScalar) {
      return;
    }

    throw new Error(`Scalar values not identical: ${expectedScalar} !== ${actualScalar} at location ${path}`);
  }
}

export default ValueComparator;