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
   * @param {LegacyLabelStructureInterface} node
   * @param {Object<string,string>|Array<string>} context
   * @returns {LegacyLabelStructureInterface}
   */
  visit(node, context) {
    let contextArray;
    if (context.constructor === {}.constructor) {
      contextArray = Object.values(context);
    } else {
      contextArray = context;
    }

    return {
      name: 'linear-root',
      children: this._visitLabelStructures(node.children, contextArray),
    };
  }

  /**
   * Visit an array of {@link LegacyLabelStructureInterface}s returning a list representation of their contents
   *
   * @param {Array<LegacyLabelStructureInterface>} nodes
   * @param {Array<string>} context
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
   * @param {LegacyLabelStructureInterface} node
   * @param {Array<string>} context
   * @returns {Array<AnnotatedLabelStructure>}
   * @private
   */
  _visitLabelStructure(node, context) {
    const selectedNode = this._calculateSelectedChildForNode(node, context);
    const value = selectedNode ? selectedNode.name : null;
    const linearNode = {name: node.name, metadata: {value}};

    // Attach children, but only one level of them
    if (node.children) {
      linearNode.children = node.children.map(childNode => ({name: childNode.name}));
    }

    if (selectedNode === null) {
      return [linearNode];
    }

    if (!selectedNode.children) {
      return [linearNode];
    }

    return [linearNode, ...this._visitLabelStructure(selectedNode, context)];
  }

  /**
   * Retrieve selected child for a given node based on a context
   *
   * The value is based on the context as well as the children of the given node,
   * which determine what value the current node has
   *
   * @param {LegacyLabelStructureInterface} node
   * @param {Array<string>} context
   * @returns {LabelStructure|null}
   * @private
   */
  _calculateSelectedChildForNode(node, context) {
    if (!node.children) {
      // Without children a node essentially can't have a child
      return null;
    }

    const selectedChildren = node.children
      .filter(childNode => context.indexOf(childNode.name) !== -1);

    if (selectedChildren.length === 0) {
      return null;
    }

    return selectedChildren[0];
  }
}
