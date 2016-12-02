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
                const structure = this._getLabelStructureByThingIdentifierFromRequirementsFile(requirementsFile, thingIdentifier);
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

    return this._labelStructureDataService.getTaskStructureType(task.taskConfigurationId).then(type => {
      switch (type) {
        case 'requirements':
          return this._labelStructureDataService.getRequirementsFile(task.taskConfigurationId).then(file => {
            const drawableThings = this._getDrawableThings(file);
            this._drawableThingsMapping.set(task.id, drawableThings);
            return drawableThings;
          });
        case 'simple':
        case 'legacy':
          const drawableThing = {
            id: task.drawingTool,
            name: task.drawingTool,
            shape: task.drawingTool,
          };
          this._drawableThingsMapping.set(task.id, [drawableThing]);
          return [drawableThing];
        default:
          throw new Error(`Unknown task structure type ${type}`);
      }
    });
  }

  /**
   * @param {string} taskConfigurationId
   * @param {string} thingId
   * @return {AbortablePromise<string>}
   */
  getToolByThingIdentifier(taskConfigurationId, thingId) {
    return this.getThingByThingIdentifier(taskConfigurationId, thingId).then(thing => {
      return thing.tool;
    });
  }

  /**
   * @param {string} task
   * @param {string} thingIdentifier
   * @return {AbortablePromise<{id, shape, tool}>}
   */
  getThingByThingIdentifier(task, thingIdentifier) {
    const cacheKey = `${task}-${thingIdentifier}`;
    if (this._thingIdentifierMapping.has(cacheKey)) {
      const thing = this._thingIdentifierMapping.get(cacheKey);
      return this._abortablePromise(this._$q.resolve(thing));
    }

    return this._labelStructureDataService.getTaskStructureType(task.taskConfigurationId).then(type => {
      switch (type) {
        case 'requirements':
          return this._labelStructureDataService.getRequirementsFile(task.taskConfigurationId).then(file => {
            const thing = this._getThingByThingIdentifier(file, thingId);
            this._thingIdentifierMapping.set(`${task.id}-${thingId}`, thing);

            return thing;
          });
        case 'simple':
        case 'legacy':
          return this.getDrawableThings(task).then(drawableThings => {
            return drawableThings[0];
          });
      }

    });
  }

  _getThingByThingIdentifier(file, thingId) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(file.data, 'application/xml');
    const thing = doc.getElementById(thingId);

    if (!thing) {
      throw new Error(`No thing with the given id ${thingId}`);
    }

    return {id: thing.attributes.id.value, shape: thing.attributes.shape.value, name: thing.attributes.name.value};
  }

  /**
   * @param {File} file
   * @private
   */
  _getDrawableThings(file) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(file.data, 'application/xml');

    const things = Array.from(doc.getElementsByTagName('thing'));

    return things.map(thing => {
      return {id: thing.attributes.id.value, shape: thing.attributes.shape.value, name: thing.attributes.name.value};
    });
  }

  _getLabelStructureFromRequirementsFile(file, thingIdentifier) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(file.data, 'application/xml');

    const structure = {name: 'root', children: []};
    const annotation = {};

    if (thingIdentifier === null) {
      return {structure, annotation};
    }

    const thing = doc.getElementById(thingIdentifier);

    Array.from(thing.children).forEach(classElement => {
      annotation[classElement.attributes.id.value] = {challenge: classElement.attributes.name.value};

      const classChildren = [];
      Array.from(classElement.children).forEach(valueElement => {
        annotation[valueElement.attributes.id.value] = {response: valueElement.attributes.name.value};

        classChildren.push({name: valueElement.attributes.id.value});
      });

      structure.children.push({
        name: classElement.attributes.id.value,
        children: classChildren,
      });
    });

    return {structure, annotation};
  }
}

LabelStructureService.$inject = [
  '$q',
  'abortablePromiseFactory',
  'labelStructureDataService'
];

export default LabelStructureService;