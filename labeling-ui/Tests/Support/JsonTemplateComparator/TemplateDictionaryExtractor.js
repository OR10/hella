import InnerDocumentVisitor from './InnerDocumentVisitor';

class TemplateDictionaryExtractor extends InnerDocumentVisitor {
  constructor() {
    super();

    /**
     * @type {Map}
     * @private
     */
    this._dictionary = new Map();

    /**
     * @type {RegExp}
     * @private
     */
    this._valueSetterRegExp = /\{\{:([a-zA-Z0-9-_]+)\}\}/;
  }

  visitDocumentBefore(firstDocument, secondDocument, path) {
    this._dictionary = new Map();
  }

  visitDocumentAfter(firstDocument, secondDocument, path) {
    return this._dictionary;
  }

  visitScalar(firstScalar, secondScalar, path) {
    const matches = this._valueSetterRegExp.exec(firstScalar);

    if (matches === null) {
      // No dictionaryIdentifier found
      return;
    }

    const [, identifier] = matches;
    const value = secondScalar;

    this._dictionary.set(identifier, value);
  }
}

export default TemplateDictionaryExtractor;