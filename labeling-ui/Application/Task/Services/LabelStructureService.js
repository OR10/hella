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
   * Get the classes for a given Task and LabeledThingInFrame
   *
   * @param {Task} task
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @returns {AbortablePromise}
   */
  getClassesForLabeledThingInFrame(labeledThingInFrame) {
    return this.getLabelStructure(labeledThingInFrame.labeledThing.task).then(labelStructure => {
      return this._getClassesFromLabelStructureByLabeledThingInFrame(labelStructure, labeledThingInFrame);
    });
  }

  /**
   * Get the classes from a given LabelStructure for a LabeledThingInFrame
   *
   * @private
   * @param {LabelStructure} labelStructure
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @returns {{name, metadata, children}|*|Array.<Object>}
   */
  _getClassesFromLabelStructureByLabeledThingInFrame(labelStructure, labeledThingInFrame) {
    const labelStructureThingArray = Array.from(labelStructure.getThings().values());
    const filteredThings = labelStructureThingArray.filter(thing => {
      return thing.id === labeledThingInFrame.identifierName;
    });
    const currentThing = filteredThings[0];

    return labelStructure.getEnabledThingClassesForThingAndClassList(
      currentThing,
      labeledThingInFrame.extractClassList()
    );
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
    return this._labelStructureDataService.getLegacyLabelStructureAndAnnotation(task.id)
      .then(legacyStructureAndAnnotation => {
        const {structure, annotation} = legacyStructureAndAnnotation;
        return this._createLegacyLabelStructure(task.drawingTool, structure, annotation);
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
   * @param {object} legacyAnnotation
   * @returns {LegacyLabelStructure}
   * @private
   */
  _createLegacyLabelStructure(drawingTool, legacyStructure, legacyAnnotation) {
    return new LegacyLabelStructure(
      this._linearLabelStructureVisitor,
      this._annotationLabelStructureVisitor,
      drawingTool,
      legacyStructure,
      legacyAnnotation
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
}

LabelStructureService.$inject = [
  '$q',
  'abortablePromiseFactory',
  'labelStructureDataService',
  'linearLabelStructureVisitor',
  'annotationLabelStructureVisitor',
];

export default LabelStructureService;
