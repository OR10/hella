class LabelStructureService {
  /**
   * @param {$q} $q
   * @param {AbortablePromiseFactory} abortablePromise
   * @param {LabelStructureDataService} labelStructureDataService
   */
  constructor($q, abortablePromise, labelStructureDataService) {
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
     * @type {Map}
     * @private
     */
    this._labelStructureMapping = new Map();

    /**
     * @type {Map}
     * @private
     */
    this._drawableThingsMapping = new Map();

    /**
     * @type {Map}
     * @private
     */
    this._thingIdentifierMapping = new Map();
  }

  /**
   * @param {Task} task
   * @param {LabeledThingInFrame} thingIdentifier
   * @return {AbortablePromise<{structure, annotation}>}
   */
  getLabelStructure(task, thingIdentifier = null) {
    const cacheKey = `${task.id}-${thingIdentifier}`;

    if (this._labelStructureMapping.has(cacheKey)) {
      const labelStructure = this._labelStructureMapping.get(cacheKey);
      return this._abortablePromise(this._$q.resolve(labelStructure));
    }

    return this._labelStructureDataService.getTaskStructureType(task.taskConfigurationId)
      .then(type => {
        switch (type) {
          case 'requirements':
            return this._labelStructureDataService.getRequirementsFile(task.taskConfigurationId)
              .then(requirementsFile => {
                const structure = this._getLabelStructureAndAnnotationByThingIdentifierFromRequirementsFile(requirementsFile, thingIdentifier);
                this._labelStructureMapping.set(cacheKey, structure);
                return structure;
              });
          case 'simple':
          case 'legacy':
            return this._labelStructureDataService.getLabelStructure(task.id)
              .then(structure => {
                this._labelStructureMapping.set(cacheKey, structure);
                return structure;
              });
          default:
            throw new Error(`Unknown task structure type "${type}"`);
        }
      });
  }


  /**
   * @param {Task} task
   * @return {AbortablePromise<[{id, tool, name}]>}
   */
  getDrawableThings(task) {
    const cacheKey = task.id;
    if (this._drawableThingsMapping.has(cacheKey)) {
      const drawableThings = this._drawableThingsMapping.get(cacheKey);
      return this._abortablePromise(this._$q.resolve(drawableThings));
    }

    return this._labelStructureDataService.getTaskStructureType(task.taskConfigurationId)
      .then(type => {
        switch (type) {
          case 'requirements':
            return this._labelStructureDataService.getRequirementsFile(task.taskConfigurationId)
              .then(requirementsFile => {
                const drawableThings = this._getDrawableThingsFromRequirementsFile(requirementsFile);
                this._drawableThingsMapping.set(cacheKey, drawableThings);
                return drawableThings;
              });
          case 'simple':
          case 'legacy':
            const legacyThing = {
              id: task.drawingTool,
              name: task.drawingTool,
              shape: task.drawingTool,
            };
            const drawableThings = [legacyThing];
            this._drawableThingsMapping.set(cacheKey, drawableThings);
            return drawableThings;
          default:
            throw new Error(`Unknown task structure type ${type}`);
        }
      });
  }

  /**
   * @param {string} taskConfigurationId
   * @param {string} thingIdentifier
   * @return {AbortablePromise<string>}
   */
  getToolByThingIdentifier(taskConfigurationId, thingIdentifier) {
    return this.getThingByThingIdentifier(taskConfigurationId, thingIdentifier)
      .then(thing => {
        return thing.tool;
      });
  }

  /**
   * @param {Task} task
   * @param {string} thingIdentifier
   * @return {AbortablePromise<{id, shape, tool}>}
   */
  getThingByThingIdentifier(task, thingIdentifier) {
    const cacheKey = `${task}-${thingIdentifier}`;
    if (this._thingIdentifierMapping.has(cacheKey)) {
      const thing = this._thingIdentifierMapping.get(cacheKey);
      return this._abortablePromise(this._$q.resolve(thing));
    }

    return this._labelStructureDataService.getTaskStructureType(task.taskConfigurationId)
      .then(type => {
        switch (type) {
          case 'requirements':
            return this._labelStructureDataService.getRequirementsFile(task.taskConfigurationId)
              .then(file => {
                const thing = this._getThingByThingIdentifierFromRequirementsFile(file, thingIdentifier);
                this._thingIdentifierMapping.set(cacheKey, thing);
                return thing;
              });
          case 'simple':
          case 'legacy':
            return this.getDrawableThings(task)
              .then(drawableThings => {
                const legacyThing = drawableThings[0];
                return legacyThing;
              });
          default:
            throw new Error(`Unknown Task structure type: ${type}.`);
        }
      });
  }

  /**
   * @param {{data: string}} requirementsFile
   * @param {string} thingIdentifier
   * @returns {{id: *, shape: *, name: *}}
   * @private
   */
  _getThingByThingIdentifierFromRequirementsFile(requirementsFile, thingIdentifier) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(requirementsFile.data, 'application/xml');
    const thing = doc.getElementById(thingIdentifier);

    if (!thing) {
      throw new Error(`No thing with the given id ${thingIdentifier}`);
    }

    return {
      id: thing.attributes.id.value,
      shape: thing.attributes.shape.value,
      name: thing.attributes.name.value,
    };
  }

  /**
   * @param {{data:string}} requirementsFile
   * @private
   */
  _getDrawableThingsFromRequirementsFile(requirementsFile) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(requirementsFile.data, 'application/xml');

    const thingElements = Array.from(doc.getElementsByTagName('thing'));

    const drawableThings = thingElements.map(thingElement => {
      return {
        id: thingElement.attributes.id.value,
        shape: thingElement.attributes.shape.value,
        name: thingElement.attributes.name.value,
      };
    });

    return drawableThings;
  }

  /**
   * @param {{data: string}}requirementsFile
   * @param {string} thingIdentifier
   * @returns {{structure: {name: string, children: Array}, annotation: {}}}
   * @private
   */
  _getLabelStructureAndAnnotationByThingIdentifierFromRequirementsFile(requirementsFile, thingIdentifier) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(requirementsFile.data, 'application/xml');

    const structure = {name: 'root', children: []};
    const annotation = {};

    if (thingIdentifier === null) {
      // Return empty structure if no thingIdentifier is available
      return {structure, annotation};
    }

    const thingElement = doc.getElementById(thingIdentifier);
    const classElements = Array.from(thingElement.children);

    classElements.forEach(classElement => {
      annotation[classElement.attributes.id.value] = {challenge: classElement.attributes.name.value};

      const labelStructureChildren = [];
      const valueElements = Array.from(classElement.children);

      valueElements.forEach(valueElement => {
        annotation[valueElement.attributes.id.value] = {response: valueElement.attributes.name.value};
        labelStructureChildren.push({name: valueElement.attributes.id.value});
      });

      structure.children.push({
        name: classElement.attributes.id.value,
        children: labelStructureChildren,
      });
    });

    return {structure, annotation};
  }
}

LabelStructureService.$inject = [
  '$q',
  'abortablePromiseFactory',
  'labelStructureDataService',
];

export default LabelStructureService;
