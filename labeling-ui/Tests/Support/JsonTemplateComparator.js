import OuterDocumentVisitor from './JsonTemplateComparator/OuterDocumentVisitor';
import TemplateDictionaryExtractor from './JsonTemplateComparator/TemplateDictionaryExtractor';
import ValueComparator from './JsonTemplateComparator/ValueComparator';
import InnerDocumentVisitor from "./JsonTemplateComparator/InnerDocumentVisitor";

class JsonTemplateComparator {
  constructor() {
    this._templateExtractor = new OuterDocumentVisitor(new TemplateDictionaryExtractor());
    this._reverseStructureValidator = new OuterDocumentVisitor(new InnerDocumentVisitor());
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
    this._reverseStructureValidator.visit(actualDocument, expectedTemplate);
  }
}

export default JsonTemplateComparator;