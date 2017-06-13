import OuterDocumentVisitor from './JsonTemplateComparator/OuterDocumentVisitor';
import TemplateDictionaryExtractor from './JsonTemplateComparator/TemplateDictionaryExtractor';
import ValueComparator from './JsonTemplateComparator/ValueComparator';
import InnerDocumentVisitor from "./JsonTemplateComparator/InnerDocumentVisitor";

import levenshtein from 'fast-levenshtein';

class JsonTemplateComparator {
  constructor() {
    this._templateExtractor = new OuterDocumentVisitor(new TemplateDictionaryExtractor());
    this._reverseStructureValidator = new OuterDocumentVisitor(new InnerDocumentVisitor());
  }

  /**
   * Assert that two values are equal or matching the given template
   *
   * An exception is thrown in case the values do not match.
   *
   * @param {*} expectedTemplate
   * @param {*} actualDocument
   */
  assertIsEqual(expectedTemplate, actualDocument) {
    const templateDictionary = this._extractTemplateDictionary(expectedTemplate, actualDocument);
    this._compareTemplateAgainstActualWithDictionary(expectedTemplate, actualDocument, templateDictionary);
  }

  /**
   * Assert that a value is part of a given collection
   *
   * An exception is thrown in case the value is not part of the collection.
   *
   * @param {*} expectedTemplate
   * @param {*} actualDocument
   */
  assertDocumentIsInCollection(expectedTemplate, collection) {
    let distance = Infinity;
    let bestCandidate = {item: undefined, error: 'Collection is empty'};

    for (let index = 0; index < collection.length; index++) {
      const item = collection[index];
      try {
        this.assertIsEqual(expectedTemplate, item);
      } catch (error) {
        const levenshteinDistance = levenshtein.get(JSON.stringify(item), JSON.stringify(expectedTemplate));
        if (levenshteinDistance < distance) {
          distance = levenshteinDistance;
          bestCandidate = {item, error};
        }
        continue;
      }

      // Match found
      return true;
    }

    const message = `Could not find document in collection

Expected document:
${JSON.stringify(expectedTemplate, undefined, 2)}

Closest candidate found:
${bestCandidate.error}
${JSON.stringify(bestCandidate.item, undefined, 2)}

Documents in collection:
${JSON.stringify(collection, undefined, 2)}
`;
    throw new Error(message);
  }

  _extractTemplateDictionary(expectedTemplate, actualDocument) {
    return this._templateExtractor.visit(expectedTemplate, actualDocument);
  }

  _compareTemplateAgainstActualWithDictionary(expectedTemplate, actualDocument, templateDictionary) {
    const valueComparator = new OuterDocumentVisitor(new ValueComparator(templateDictionary));
    valueComparator.visit(expectedTemplate, actualDocument);
    this._reverseStructureValidator.visit(actualDocument, expectedTemplate);
  }
}

export default JsonTemplateComparator;