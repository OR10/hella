import LabelStructure from '../LabelStructure';
import LabelStructureThing from '../LabelStructureThing';

/**
 * LabelStructure used for RequirementsXML based structures
 *
 * Instantiation should only be triggered using the {@link LabelStructureService}, not directly, as certain
 * dependencies need to be injected.
 */
class RequirementsLabelStructure extends LabelStructure {
  /**
   * @param {string} requirementsData
   */
  constructor(requirementsData) {
    /**
     * @type {string}
     * @private
     */
    this._requirementsData = requirementsData;

    const domParser = new DOMParser();

    /**
     * @type {Document}
     * @private
     */
    this._document = parser.parseFromString(this._requirementsData, 'application/xml');

    /**
     * Cached namespace resolver function for the RequirementsXml namespace
     *
     * @type {Function|null}
     * @private
     */
    this._namespaceResolver = null;

    /**
     * Map containing all {@link LabelStructureThing} objects of this {@link LabelStructure} stored by their `id`.
     *
     * Will be lazily filled once, requested.
     * @type {Map|null}
     * @private
     */
    this._thingMap = null;
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
    //@TODO: implement
    throw new Error('to be implemented!');
  }

  /**
   * Retrieve a `Map` of all `Things` defined inside the {@link LabelStructure}.
   *
   * @abstract
   * @return {Map.<string, LabelStructureThing>}
   */
  getThings() {
    if (this._thingMap === null) {
      const thingMap = new Map();
      const thingsSnapshot = this._evaluateXPath('/r:thing', XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);

      for (let i = 0; i < thingsSnapshot.snapshotLength; i++) {
        const thingElement = thingsSnapshot.snapshotItem(i);
        const identifier = thingElement.attributes.id.value;
        const name = thingElement.attributes.name.value;
        const shape = thingElement.attributes.shape.value;

        thingMap.set(
          identifier,
          new LabelStructureThing(identifier, name, shape)
        );
      }

      this._thingMap = thingMap;
    }

    return this._thingMap;
  }

  /**
   * Evaluate an XPath query against the requirements.xml.
   *
   * The evaluation is using the correct namespace resolver and output configuration
   *
   * @param {string} query
   * @param {XPathResult} resultType
   * @returns {*}
   * @private
   */
  _evaluateXPath(query, resultType = XPathResult.ANY_TYPE) {
    return this._document.evaluate(
      query,
      this._document,
      this._getNamespaceResolverForRequirementsXml(),
      resultType,
      null
    );
  }

  /**
   * Get a namespace resolver for the requirements.xml namespace.
   *
   * @returns {Function}
   * @private
   */
  _getNamespaceResolverForRequirementsXml() {
    if (this._namespaceResolver === null) {
      this.namespaceResolver = prefix => {
        const mapping = {
          'r': 'http://weblabel.hella-aglaia.com/schema/requirements'
        };

        return mapping[prefix] || null;
      }
    }

    return this._namespaceResolver;
  }
}

export default RequirementsLabelStructure;
