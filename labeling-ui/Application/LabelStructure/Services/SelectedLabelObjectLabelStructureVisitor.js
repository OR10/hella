/**
 * Generate a object of active labels from a AnnotatedLabelStructure Tree
 *
 * The Object will contain a key/value mapping between the structural group (eg. "weather")
 * and its selected value (eg. "sunny").
 *
 * It is needed in order to create a proper model structure for angularjs radio choice implementation
 * from the labels stored in the database
 *
 * @implements LabelStructureVisitor
 */
export default class SelectedLabelObjectLabelStructureVisitor {
  /**
   * Extract the label object from the given {@link LabelStructure}
   *
   * @param {AnnotatedLabelStructure} node
   * @returns {Object<string, string>}
   */
  visit(node) {
    return this._visitNode(node);
  }

  /**
   * Visit a single node extracting its active label and its child labels
   *
   * @param {AnnotatedLabelStructure} node
   * @returns {Object<string, string>}
   * @private
   */
  _visitNode(node) {
    const labelMapping = {};
    if (node.metadata) {
      if (node.metadata.value) {
        labelMapping[node.name] = node.metadata.value;
      }
    }

    if (node.children) {
      node.children.forEach(
        childNode => Object.assign(labelMapping, this._visitNode(childNode))
      );
    }

    return labelMapping;
  }
}
