/**
 * Generate a list of active labels from a AnnotatedLabelStructure Tree
 *
 * The here generated list is identical to the label list the {@link LinearLabelStructureVisitor} is taking as context
 *
 * @implements LabelStructureVisitor
 */
export default class SelectedLabelListLabelStructureVisitor {
  /**
   * Extract the label list from the given {@link LabelStructure}
   *
   * @param {AnnotatedLabelStructure} node
   * @returns {Array<string>}
   */
  visit(node) {
    return this._makeUnique(this._visitNode(node));
  }

  /**
   * Visit a single node extracting its active label and its child labels
   *
   * @param {AnnotatedLabelStructure} node
   * @returns {Array<string>}
   * @private
   */
  _visitNode(node) {
    const selectedLabels = [];
    if (node.metadata) {
      if (node.metadata.value) {
        selectedLabels.push(node.metadata.value);
      }
    }

    if (node.children) {
      node.children.forEach(
        childNode => selectedLabels.push(...this._visitNode(childNode))
      );
    }

    return selectedLabels;
  }

  _makeUnique(list) {
    return [...new Set(list)];
  }
}
