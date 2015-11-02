/**
 * Visitor transforming LabelStructure objects in conjunction with a value context into a linearized list
 *
 * This Visitor is used to retrieve flat lists for asking Label questions to the user.
 *
 * @implements LabelStructureVisitor
 */
export default class LinearLabelStructureVisitor {
  /**
   * Visit the given LabelStructure and output a linearized list based on the given context
   *
   * @param {LabelStructure} node
   * @param {Object<string,string>} context
   * @returns {AnnotatedLabelStructure}
   */
  visit(node, context) {
    return {
      name: 'linear-root',
      children: this._visitLabelStructures(node.children, context),
    };
  }

  /**
   * Visit an array of {@link LabelStructure}s returning a list representation of their contents
   *
   * @param {Array<LabelStructure>} nodes
   * @param {Object<string, string>} context
   * @returns {Array<{name: string, value: string|null}>}
   * @private
   */
  _visitLabelStructures(nodes, context) {
    return nodes
      .map(node => this._visitLabelStructure(node, context))
      .reduce(
        (flattened, entry) => flattened.concat(entry), []
      );
  }

  /**
   * Visit a specific LabelStructure
   *
   * This method joins the context with the given node to determine the next path to take.
   *
   * @param {LabelStructure} node
   * @param {Object<string,string>} context
   * @returns {Array<AnnotatedLabelStructure>}
   * @private
   */
  _visitLabelStructure(node, context) {
    const value = context[node.name] ? context[node.name] : null;
    const linearNode = {name: node.name, metadata: {value}};

    // Attach children, but only one level of them
    if (node.children) {
      linearNode.children = node.children.map(childNode => ({name: childNode.name}));
    }

    if (value === null) {
      return [linearNode];
    }

    const selectedNode = node.children.find(childNode => childNode.name === value);

    if (selectedNode === undefined) {
      throw new Error(`Selected node could not be found: ${node.name} -> ${value}`);
    }

    if (!selectedNode.children) {
      return [linearNode];
    }

    return [linearNode, ...this._visitLabelStructure(selectedNode, context)];
  }
}
