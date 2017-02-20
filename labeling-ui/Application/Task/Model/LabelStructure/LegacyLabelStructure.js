import LabelStructure from '../LabelStructure';
import LabelStructureThing from '../LabelStructureThing';

/**
 * LabelStructure used for legacy and SimpleXML LabelStructures
 *
 * Instantiation should only be triggered using the {@link LabelStructureService}, not directly, as certain
 * dependencies need to be injected.
 */
class LegacyLabelStructure extends LabelStructure {
  /**
   * @param {LinearLabelStructureVisitor} linearLabelStructureVisitor
   * @param {AnnotationLabelStructureVisitor} annotationStructureVisitor
   * @param {string} drawingTool
   * @param {LegacyLabelStructureInterface} legacyStructure
   * @param {object} legacyAnnotation
   */
  constructor(linearLabelStructureVisitor, annotationStructureVisitor, drawingTool, legacyStructure, legacyAnnotation) {
    super();

    /**
     * @type {LinearLabelStructureVisitor}
     * @private
     */
    this._linearLabelStructureVisitor = linearLabelStructureVisitor;

    /**
     * @type {AnnotationLabelStructureVisitor}
     * @private
     */
    this._annotationStructureVisitor = annotationStructureVisitor;

    /**
     * @type {string}
     * @private
     */
    this._drawingTool = drawingTool;

    /**
     * @type {LegacyLabelStructureInterface}
     * @private
     */
    this._legacyStructure = legacyStructure;

    /**
     * @type {Object}
     * @private
     */
    this._legacyAnnotation = legacyAnnotation;
  }

  /**
   * Based on a given set of `classes` (Ltif classes) create and return a list of active classes (requirements classes),
   * which should currently be displayed.
   *
   * The list does not contain any nested classes. It is a processed list, which takes into account all conditions
   * defined by the utilized {@link LabelStructure}.
   *
   * @abstract
   * @param {LabelStructureThing} thing
   * @param {Array.<string>} classList
   * @return {Array.<object>}
   */
  getEnabledThingClassesForThingAndClassList(thing, classList) { // eslint-disable-line no-unused-vars
    if (thing.id !== 'legacy') {
      throw new Error(`LegacyLabelStructures only know the 'legacy' thing. ${thing.id} was given!`);
    }

    const linearStructure = this._linearLabelStructureVisitor.visit(this._legacyStructure, classList);
    const annotatedStructure = this._annotationStructureVisitor.visit(linearStructure, this._legacyAnnotation);

    return annotatedStructure.children;
  }

  /**
   * Retrieve a `Map` of all `Things` defined inside the {@link LabelStructure}.
   *
   * @abstract
   * @return {Map.<string, LabelStructureThing>}
   */
  getThings() {
    const thingMap = new Map();
    thingMap.set(
      'legacy',
      new LabelStructureThing('legacy', this._drawingTool, this._drawingTool)
    );

    return thingMap;
  }

  /**
   * Retrieve a `Map` of all `Things` defined inside the {@link LabelStructure}
   *
   * As the LegacyLabelStructure does not support groups the map will be always empty.
   *
   * @return {Map.<string, LabelStructureGroup>}
   */
  getGroups() {
    return new Map();
  }
}

export default LegacyLabelStructure;
