import cloneDeep from 'lodash.clonedeep';

import LabelStructure from '../LabelStructure';
import LabelStructureThing from '../LabelStructureThing';
import XMLClassElement from '../XMLClassElement';

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
    super();

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
    this._document = domParser.parseFromString(this._requirementsData, 'application/xml');

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
  getEnabledThingClassesForThingAndClassList(thing, classList) {
    const identifier = thing.id;
    if (!this.isThingDefinedById(identifier)) {
      throw new Error(`Thing with identifier '${identifier}' could not be found in LabelStructure`);
    }

    const thingElement = this._getThingElementById(identifier);
    const enabledElements = this._getEnabledElementsByStartingElementAndClassList(thingElement, classList);
    const enabledThingClasses = enabledElements.map(
      enabledElement => this._annotateClassJsonWithActiveValue(
        this._convertClassElementToClassJson(enabledElement),
        classList
      )
    );

    return enabledThingClasses;
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
      const thingsSnapshot = this._evaluateXPath('/r:requirements/r:thing', null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);

      for (let index = 0; index < thingsSnapshot.snapshotLength; index++) {
        const thingElement = thingsSnapshot.snapshotItem(index);
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
   * @param {Node} contextNode
   * @param {XPathResult} resultType
   * @returns {*}
   * @private
   */
  _evaluateXPath(query, contextNode = null, resultType = XPathResult.ANY_TYPE) {
    const usedContextNode = contextNode === null ? this._document : contextNode;

    return this._document.evaluate(
      query,
      usedContextNode,
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
      this._namespaceResolver = prefix => {
        const mapping = {
          'r': 'http://weblabel.hella-aglaia.com/schema/requirements',
        };

        return mapping[prefix] || null;
      };
    }

    return this._namespaceResolver;
  }

  /**
   * Retrieve a list of enabled XMLClassElements based on a starting point in the DOM and a classList
   *
   * @param {Node} rootElement
   * @param {Array.<string>} classList
   * @param {int} depth
   * @private
   */
  _getEnabledElementsByStartingElementAndClassList(rootElement, classList, depth = 1) {
    const classElementsPath = `./r:class`;
    const classElementsSnapshot = this._evaluateXPath(classElementsPath, rootElement, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);
    if (classElementsPath.snapshotLength === 0) {
      return [];
    }

    let xmlClassElements = [];
    for (let index = 0; index < classElementsSnapshot.snapshotLength; index++) {
      let xmlClass = new XMLClassElement(classElementsSnapshot.snapshotItem(index), depth);

      if (!this._isClassElementEnabled(xmlClass, classList)) {
        continue;
      }

      // If classElement is a reference node, replace with the referenced class node
      if (this._isRefElement(xmlClass)) {
        xmlClass = this._getReferencedClassElement(xmlClass);
      }

      xmlClassElements.push(xmlClass);

      const valueElements = this._getValueElementsFromClassElement(xmlClass);
      valueElements.forEach(valueElement => { // eslint-disable-line no-loop-func
        // Recursive search for further nodes in the tree below every value element
        const enabledChildXMLClasses = this._getEnabledElementsByStartingElementAndClassList(valueElement, classList, depth + 1);
        xmlClassElements = [...xmlClassElements, ...enabledChildXMLClasses];
      });
    }

    // Filter through all found elements and only keep unique ids with the lowest depth
    const uniqueMap = new Map();
    xmlClassElements.forEach(xmlClass => {
      if (!uniqueMap.has(xmlClass.element.attributes.id)) {
        uniqueMap.set(xmlClass.element.attributes.id, xmlClass);
        return;
      }
      if (xmlClass.depth < uniqueMap.get(xmlClass.element.attributes.id).depth) {
        uniqueMap.delete(xmlClass.element.attributes.id);
        uniqueMap.set(xmlClass.element.attributes.id, xmlClass);
      }
    });

    return [...uniqueMap.values()];
  }

  /**
   * Check if a specific `<class>` element is a class reference.
   *
   * A class reference element has the `ref` attribute to reference an other class by id.
   *
   * @param {XMLClassElement} xmlClass
   * @return {boolean}
   * @private
   */
  _isRefElement(xmlClass) {
    return xmlClass.element.attributes.ref !== undefined;
  }

  /**
   * Takes a class reference node and returns the referenced class node.
   *
   * If either the id is not set or no class with the given ref id could be found an error will be thrown.
   *
   * @param {XMLClassElement} xmlClass
   * @return {XMLClassElement}
   * @private
   */
  _getReferencedClassElement(xmlClass) {
    const referencedClassId = xmlClass.element.attributes.ref.value;
    if (!referencedClassId) {
      throw new Error('The class reference need to be an id of an other class');
    }

    const referencedClassElement = this._getClassElementById(referencedClassId);
    if (!referencedClassElement) {
      throw new Error(`No class with id "${referencedClassId}" could be found in the document.`);
    }

    return new XMLClassElement(referencedClassElement, xmlClass.depth);
  }

  /**
   * Check for a specific `<class>` element if it is enabled based on the given `classList`.
   *
   * An element is considered enabled, if it does not have a value as parent or if the `<value>` parent is part of the
   * `classList`.
   *
   * @param {XMLClassElement} xmlClass
   * @param {Array.<string>} classList
   * @private
   */
  _isClassElementEnabled(xmlClass, classList) {
    const parentElement = xmlClass.element.parentNode;

    if (parentElement.tagName !== 'value') {
      return true;
    }

    return classList.includes(parentElement.attributes.id.value);
  }

  /**
   * Retrieve all <value> elements, which are direct children of a given classElement.
   *
   * @param {XMLClassElement} xmlClass
   * @return {Array.<Node>}
   * @private
   */
  _getValueElementsFromClassElement(xmlClass) {
    const valueElementsPath = `./r:value`;
    const valueElementsSnapshot = this._evaluateXPath(valueElementsPath, xmlClass.element, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);

    const valueElements = [];
    for (let index = 0; index < valueElementsSnapshot.snapshotLength; index++) {
      const valueElement = valueElementsSnapshot.snapshotItem(index);
      valueElements.push(valueElement);
    }
    return valueElements;
  }

  /**
   * Get the Thing DOMElement of thing with a specific identifier
   *
   * If a node with the given identifier could not be found an exception will be thrown.
   *
   * @param {string} identifier
   * @returns {Node}
   * @private
   */
  _getThingElementById(identifier) {
    const searchNodePath = `/r:requirements/r:thing[@id="${identifier}"]`;
    const searchSnapshot = this._evaluateXPath(searchNodePath, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);

    if (searchSnapshot.snapshotLength !== 1) {
      throw new Error(`Expected to find one thing node with a specific id, but found ${searchSnapshot.snapshotLength}.`);
    }

    const thingElement = searchSnapshot.snapshotItem(0);
    return thingElement;
  }

  /**
   * Get the Class DOMElement of class with a specific identifier
   *
   * If a node with the given identifier could not be found an exception will be thrown
   *
   * @param {string} identifier
   * @return {Node}
   * @private
   */
  _getClassElementById(identifier) {
    const searchNodePath = `//r:class[@id="${identifier}"]`;
    const searchSnapshot = this._evaluateXPath(searchNodePath, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);

    if (searchSnapshot.snapshotLength !== 1) {
      throw new Error(`Expected to find one thing node with a specific id, but found ${searchSnapshot.snapshotLength}.`);
    }

    const thingElement = searchSnapshot.snapshotItem(0);
    return thingElement;
  }

  /**
   * Convert a `<class>` Element into the json structure used for internal representation inside the view
   *
   * The conversion is flat. Nested `<class>` elements will be ignored.
   *
   * @param {XMLClassElement} xmlClass
   * @private
   */
  _convertClassElementToClassJson(xmlClass) {
    const valueElements = this._getValueElementsFromClassElement(xmlClass);
    const classJson = {
      name: xmlClass.element.attributes.id.value,
      metadata: {
        challenge: xmlClass.element.attributes.name.value,
      },
      children: [],
    };

    valueElements.forEach(valueElement => {
      const valueJson = {
        name: valueElement.attributes.id.value,
        metadata: {
          response: valueElement.attributes.name.value,
        },
      };
      classJson.children.push(valueJson);
    });

    return classJson;
  }

  /**
   * Inject the selected value from the given `classList` into the `metadata` object of the given class json.
   *
   * The decision is based on the "child" values of the class. If no corresponding value is available from the `classList`
   * `null` will be set as `value`.
   *
   * @param {object} classJson
   * @param {Array.<string>} classList
   * @return {object}
   * @private
   */
  _annotateClassJsonWithActiveValue(classJson, classList) {
    const clonedClassJson = cloneDeep(classJson);
    clonedClassJson.metadata.value = null;

    for (const valueJson of clonedClassJson.children) {
      if (classList.includes(valueJson.name)) {
        clonedClassJson.metadata.value = valueJson.name;
        return clonedClassJson;
      }
    }

    return clonedClassJson;
  }
}

export default RequirementsLabelStructure;