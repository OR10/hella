class LabelStructureDataService {

  /**
   * @param {$q} $q
   * @param {AbortablePromiseFactory} abortablePromise
   * @param {LabelStructureGateway} labelStructureGateway
   */
  constructor($q, abortablePromise, labelStructureGateway) {
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
     * @type {LabelStructureGateway}
     * @private
     */
    this._labelStructureGateway = labelStructureGateway;

    /**
     * @type {Map}
     * @private
     */
    this._taskStructureTypeMapping = new Map();

    /**
     * @type {Map}
     * @private
     */
    this._labelStructureDataMapping = new Map();

    /**
     * @type {Map}
     * @private
     */
    this._requirementsFileMapping = new Map();
  }

  /**
   * @param {string} taskConfigurationId
   * @return {AbortablePromise<string>}
   */
  getLabelStructureTypeForTask(taskConfigurationId) {
    const cacheKey = taskConfigurationId;
    if (this._taskStructureTypeMapping.has(cacheKey)) {
      const type = this._taskStructureTypeMapping.get(cacheKey);
      return this._abortablePromise(this._$q.resolve(type));
    }

    if (taskConfigurationId === null) {
      const type = 'legacy';
      this._taskStructureTypeMapping.set(taskConfigurationId, type);
      return this._abortablePromise(this._$q.resolve(type));
    }

    return this._labelStructureGateway.getTaskStructureData(taskConfigurationId)
      .then(taskStructureData => {
        const type = taskStructureData.type;
        this._taskStructureTypeMapping.set(cacheKey, type);
        return type;
      });
  }

  /**
   * @param taskId
   * @return {AbortablePromise<{structure: LegacyLabelStructureInterface, annotation: object}>}
   */
  getLegacyLabelStructureAndAnnotation(taskId) {
    const cacheKey = taskId;
    if (this._labelStructureDataMapping.has(cacheKey)) {
      const labelStructure = this._labelStructureDataMapping.get(cacheKey);
      return this._abortablePromise(this._$q.resolve(labelStructure));
    }

    return this._labelStructureGateway.getLabelStructureData(taskId)
      .then(labelStructureData => {
        this._labelStructureDataMapping.set(cacheKey, labelStructureData);
        return labelStructureData;
      });
  }

  /**
   * @param {string} taskConfigurationId
   * @return {File}
   */
  getRequirementsFile(taskConfigurationId) {
    const cacheKey = taskConfigurationId;
    if (this._requirementsFileMapping.has(cacheKey)) {
      const requirementsFile = this._requirementsFileMapping.get(cacheKey);
      return this._abortablePromise(this._$q.resolve(requirementsFile));
    }

    return this._labelStructureGateway.getRequirementsFile(taskConfigurationId)
      .then(requirementsFile => {
        this._requirementsFileMapping.set(cacheKey, requirementsFile);
        return requirementsFile;
      });
  }
}

LabelStructureDataService.$inject = [
  '$q',
  'abortablePromiseFactory',
  'labelStructureGateway',
];

export default LabelStructureDataService;
