class LabelStructureService {
  /**
   * @param {$q} $q
   * @param {LabelStructureDataService} labelStructureDataService
   */
  constructor($q, labelStructureDataService) {
    /**
     * @type {$q}
     * @private
     */
    this._$q = $q;
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
    if (this._labelStructureMapping.has(`${task.id}-${thingIdentifier}`)) {
      const deferred = this._$q.defer();
      deferred.resolve(this._labelStructureMapping.get(`${task.id}-${thingIdentifier}`));

      return deferred.promise;
    }

    return this._labelStructureDataService.getTaskStructureType(task.taskConfigurationId).then(type => {
      switch (type) {
        case 'requirements':
          return this._labelStructureDataService.getRequirementsFile(task.taskConfigurationId).then(file => {
            return this._getLabelStructureFromRequirementsFile(file, thingIdentifier);
          });
        case 'simple':
        case 'legacy':
          return this._labelStructureDataService.getLabelStructure(task.id).then(structure => {
            this._labelStructureMapping.set(task.id, structure);
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
    if (this._drawableThingsMapping.has(task.id)) {
      const deferred = this._$q.defer();
      deferred.resolve(this._drawableThingsMapping.get(task.id));

      return deferred.promise;
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
   * @param {string} thingId
   * @return {AbortablePromise<{id, shape, tool}>}
   */
  getThingByThingIdentifier(task, thingId) {
    if (this._thingIdentifierMapping.has(`${task}-${thingId}`)) {
      const deferred = this._$q.defer();
      deferred.resolve(this._thingIdentifierMapping.get(`${task}-${thingId}`));

      return deferred.promise;
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

LabelStructureService.$inject = ['$q', 'labelStructureDataService'];

export default LabelStructureService;