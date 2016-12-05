/**
 * Annotate an arbitrary {@link LabelStructure} with metadata
 *
 * The metadata consists of arbitrary key/value information attached to specific LabelStructure items
 *
 * @implements LabelStructureVisitor
 */
export default class AnnotationLabelStructureVisitor {
  /**
   * Annotate the given LabelStructure by a AnnotationDictionary as input.
   *
   * The AnnotationDictionary is a simple Object<string, *> structure, which maps from {@link LabelStructure#name}
   * properties to the respective metadata to be attached.
   *
   * @param {LegacyLabelStructureInterface} node
   * @param {Object<string,*>} annotation
   */
  visit(node, annotation) {
    return this._visitNode(node, annotation);
  }

  /**
   * Visit a single node annotating it with the corresponding information
   *
   * @param {LegacyLabelStructureInterface} node
   * @param {Object<string,*>} annotation
   * @returns {AnnotatedLabelStructure}
   * @private
   */
  _visitNode(node, annotation) {
    const oldMetadata = node.metadata || {};
    const metadata = Object.assign({}, oldMetadata, annotation[node.name]);
    const annotatedNode = {metadata, name: node.name};

    if (node.children) {
      annotatedNode.children = node.children.map(childNode => this._visitNode(childNode, annotation));
    }

    return annotatedNode;
  }
}
