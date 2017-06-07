import OuterDocumentVisitor from './JsonTemplateComparator/OuterDocumentVisitor';
import TemplateDictionaryExtractor from './JsonTemplateComparator/TemplateDictionaryExtractor';
import ValueComparator from './JsonTemplateComparator/ValueComparator';

class JsonTemplateComparator {
  constructor() {
    this._templateExtractor = new OuterDocumentVisitor(new TemplateDictionaryExtractor());
  }

  assertIsEqual(expectedTemplate, actualDocument) {
    const templateDictionary = this._extractTemplateDictionary(expectedTemplate, actualDocument);
    this._compareTemplateAgainstActualWithDictionary(expectedTemplate, actualDocument, templateDictionary);
  }

  _extractTemplateDictionary(expectedTemplate, actualDocument) {
    return this._templateExtractor.visit(expectedTemplate, actualDocument);
  }

  _compareTemplateAgainstActualWithDictionary(expectedTemplate, actualDocument, templateDictionary) {
    const valueComparator = new OuterDocumentVisitor(new ValueComparator(templateDictionary));
    valueComparator.visit(expectedTemplate, actualDocument);
  }
}

export default JsonTemplateComparator;