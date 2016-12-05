import LegacyLabelStructure from '../Model/LabelStructure/LegacyLabelStructure';
import RequirementsLabelStructure from '../Model/LabelStructure/RequirementsLabelStructure';

class LabelStructureService {
  /**
   * @param {$q} $q
   * @param {AbortablePromiseFactory} abortablePromise
   * @param {LabelStructureDataService} labelStructureDataService
   * @param {LinearLabelStructureVisitor} linearLabelStructureVisitor
   * @param {AnnotationLabelStructureVisitor} annotationLabelStructureVisitor
   */
  constructor($q, abortablePromise, labelStructureDataService, linearLabelStructureVisitor, annotationLabelStructureVisitor) {
    /**
     * @type {$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {AbortablePromiseFactory}
     * @private
     */
    this._abortablePromise = abortablePromise;

    /**
     * @type {LabelStructureDataService}
     * @private
     */
    this._labelStructureDataService = labelStructureDataService;

    /**
     * @type {LinearLabelStructureVisitor}
     * @private
     */
    this._linearLabelStructureVisitor = linearLabelStructureVisitor;

    /**
     * @type {AnnotationLabelStructureVisitor}
     * @private
     */
    this._annotationLabelStructureVisitor = annotationLabelStructureVisitor;

    /**
     * @type {Map}
     * @private
     */
    this._labelStructureCache = new Map();
  }

  /**
   * Retrieve a {@link LabelStructure} object for the given {@link Task}
   *
   * @param {Task} task
   * @return {AbortablePromise<LabelStructure>}
   */
  getLabelStructure(task) {
    const cacheKey = `${task.id}`;

    if (this._labelStructureCache.has(cacheKey)) {
      const labelStructure = this._labelStructureCache.get(cacheKey);
      return this._abortablePromise(this._$q.resolve(labelStructure));
    }

    return this._labelStructureDataService.getLabelStructureTypeForTask(task.taskConfigurationId)
      .then(type => {
        switch (type) {
          case 'requirements':
            return this._getLabelStructureOfTypeRequirements(task);
          case 'simple':
            return this._getLabelStructureOfTypeLegacy(task);
          case 'legacy':
            return this._getLabelStructureOfTypeLegacy(task);
            break;
          default:
            throw new Error(`Unknown LabelStructure type '${type}' for task '${task.id}.`);
        }
      })
      .then(labelStructure => {
        this._labelStructureCache.set(cacheKey, labelStructure);
        return labelStructure;
      });
  }

  /**
   * Retrieve and return a {@link LegacyLabelStructure}
   *
   * The method assumes the given task is one with a legacy type label structure
   *
   * @param {Task} task
   * @returns {AbortablePromise.<LegacyLabelStructure>}
   * @private
   */
  _getLabelStructureOfTypeLegacy(task) {
    return this._labelStructureDataService.getLegacyLabelStructure(task.id)
      .then(legacyStructure => {
        return this._createLegacyLabelStructure(task.drawingTool, legacyStructure);
      });
  }

  /**
   * Retrieve and return a {@link RequirementsLabelStructure}
   *
   * The method assumes the given task is one with a requirements type label structure
   *
   * @param {Task} task
   * @returns {AbortablePromise.<RequirementsLabelStructure>}
   * @private
   */
  _getLabelStructureOfTypeRequirements(task) {
    return this._labelStructureDataService.getRequirementsFile(task.taskConfigurationId)
      .then(requirementsFile => {
        return this._createRequirementsLabelStructure(requirementsFile.data);
      });
  }

  /**
   * Create and return a new {@link LegacyLabelStructure}
   *
   * @param {string} drawingTool
   * @param {LegacyLabelStructureInterface} legacyStructure
   * @returns {LegacyLabelStructure}
   * @private
   */
  _createLegacyLabelStructure(drawingTool, legacyStructure) {
    return new LegacyLabelStructure(
      this._linearLabelStructureVisitor,
      this._annotationLabelStructureVisitor,
      drawingTool,
      legacyStructure
    );
  }

  /**
   * Create and return a new {@link RequirementsLabelStructure}
   *
   * @param {string} requirementsData
   * @returns {RequirementsLabelStructure}
   * @private
   */
  _createRequirementsLabelStructure(requirementsData) {
    return new RequirementsLabelStructure(requirementsData);
  }

  // /**
  //  * @param {{data: string}}requirementsFile
  //  * @param {string} thingIdentifier
  //  * @returns {{structure: {name: string, children: Array}, annotation: {}}}
  //  * @private
  //  */
  // _getLabelStructureAndAnnotationByThingIdentifierFromRequirementsFile(requirementsFile, thingIdentifier) {
  //   const parser = new DOMParser();
  //   const doc = parser.parseFromString(requirementsFile.data, 'application/xml');
  //
  //   const structure = {name: 'root', children: []};
  //   const annotation = {};
  //
  //   if (thingIdentifier === null) {
  //     // Return empty structure if no thingIdentifier is available
  //     return {structure, annotation};
  //   }
  //
  //   const thingElement = doc.getElementById(thingIdentifier);
  //   const classElements = Array.from(thingElement.children);
  //
  //   classElements.forEach(classElement => {
  //     annotation[classElement.attributes.id.value] = {challenge: classElement.attributes.name.value};
  //
  //     const labelStructureChildren = [];
  //     const valueElements = Array.from(classElement.children);
  //
  //     valueElements.forEach(valueElement => {
  //       annotation[valueElement.attributes.id.value] = {response: valueElement.attributes.name.value};
  //       labelStructureChildren.push({name: valueElement.attributes.id.value});
  //     });
  //
  //     structure.children.push({
  //       name: classElement.attributes.id.value,
  //       children: labelStructureChildren,
  //     });
  //   });
  //
  //   return {structure, annotation};
  // }
}

LabelStructureService.$inject = [
  '$q',
  'abortablePromiseFactory',
  'labelStructureDataService',
];

export default LabelStructureService;
