/**
 * Visit and transform LabelStructures
 *
 * The visitor interface allows the transformation into arbitrary results based on the structure definition for labels
 *
 * @interface LabelStructureVisitor
 **/

/**
 * Visit the LabelStructure and return the generated result
 *
 * The result may be fully chosen by the corresponding implementation of this interface.
 *
 * The provided context is an arbitrary object providing further visitation information
 *
 * @interface LabelStructureVisitor
 * @method visit
 * @param {LabelStructure} node
 * @param {Object} context
 * @return {*}
 **/
