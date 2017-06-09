import InnerDocumentVisitor from './InnerDocumentVisitor';
import TemplateString from './TemplateString';
import {isString} from 'lodash';

class TemplateDictionaryExtractor extends InnerDocumentVisitor {
  constructor() {
    super();

    /**
     * @type {Map}
     * @private
     */
    this._dictionary = new Map();
  }

  visitDocumentBefore(firstDocument, secondDocument, path) {
    this._dictionary = new Map();
  }

  visitDocumentAfter(firstDocument, secondDocument, path) {
    return this._dictionary;
  }

  visitScalar(firstScalar, secondScalar, path) {
    if (!isString(firstScalar)) {
      return;
    }

    const template = new TemplateString(firstScalar);
    if (!template.isSetter()) {
      return;
    }

    const value = template.extractValue(secondScalar);
    if (value === null) {
      throw new Error(`Unable to perform template string extraction due to mismatching values: The string "${secondScalar}" could not be matched against "${firstScalar}" at location ${path}`);
    }

    const identifier = template.getIdentifier();
    this._dictionary.set(identifier, value);
  }
}

export default TemplateDictionaryExtractor;