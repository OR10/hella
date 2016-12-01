class LabelStructureDataService {

  /**
   * @param {$q} $q
   * @param {LabelStructureGateway} labelStructureGateway
   */
  constructor($q, labelStructureGateway) {
    /**
     * @type {$q}
     * @private
     */
    this._$q = $q;
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
  getTaskStructureType(taskConfigurationId) {
    if (this._taskStructureTypeMapping.has(taskConfigurationId)) {
      const deferred = this._$q.defer();
      deferred.resolve(this._taskStructureTypeMapping.get(taskConfigurationId));

      return deferred.promise;
    }

    if (taskConfigurationId === null) {
      const deferred = this._$q.defer();
      this._taskStructureTypeMapping.set(taskConfigurationId, 'legacy');
      deferred.resolve('legacy');

      return deferred.promise;
    }

    return this._labelStructureGateway.getTaskStructureData(taskConfigurationId).then(taskStructureData => {
      this._taskStructureTypeMapping.set(taskConfigurationId, taskStructureData.type);

      return taskStructureData.type;
    });
  }

  /**
   * @param taskId
   * @return {AbortablePromise<{structure, annotation}>}
   */
  getLabelStructure(taskId) {
    if (this._labelStructureDataMapping.has(taskId)) {
      const deferred = this._$q.defer();
      deferred.resolve(this._labelStructureDataMapping.get(taskId));

      return deferred.promise;
    }

    return this._labelStructureGateway.getLabelStructureData(taskId).then(labelStructureData => {
      this._labelStructureDataMapping.set(taskId, labelStructureData);

      return labelStructureData;
    });
  }

  /**
   * @param {string }taskConfigurationId
   * @return {File}
   */
  getRequirementsFile(taskConfigurationId) {
    if (this._requirementsFileMapping.has(taskConfigurationId)) {
      const deferred = this._$q.defer();
      deferred.resolve(this._requirementsFileMapping.get(taskConfigurationId));

      return deferred.promise;
    }

    return this._labelStructureGateway.getRequirementsFile(taskConfigurationId).then(file => {
      this._requirementsFileMapping.set(taskConfigurationId, file);

      return file;
    });
  }
}

LabelStructureDataService.$inject = ['$q', 'labelStructureGateway'];

export default LabelStructureDataService;
