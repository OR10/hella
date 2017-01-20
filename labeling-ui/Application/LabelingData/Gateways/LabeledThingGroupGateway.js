class LabeledThingGroupGateway {
  /**
   * @param {$q} $q
   * @param {ApiService} apiService
   * @param {RevisionManager} revisionManager
   * @param {BufferedHttp} bufferedHttp
   * @param {LabeledThingGateway} labeledThingGateway
   * @param {AbortablePromiseFactory} abortablePromiseFactory
   */
  constructor($q, apiService, revisionManager, bufferedHttp, labeledThingGateway, abortablePromiseFactory) {
    /**
     * @type {$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {ApiService}
     * @private
     */
    this._apiService = apiService;

    /**
     * @type {RevisionManager}
     * @private
     */
    this._revisionManager = revisionManager;

    /**
     * @type {BufferedHttp}
     * @private
     */
    this._bufferedHttp = bufferedHttp;

    /**
     * @type {LabeledThingGateway}
     * @private
     */
    this._labeledThingGateway = labeledThingGateway;

    /**
     * @type {AbortablePromiseFactory}
     * @private
     */
    this._abortablePromisFactory = abortablePromiseFactory;
  }

  /**
   * Requests labeled thing groups for the given frame index.
   *
   * Response looks like:
   * `{labeledThingGroups, labeledThingInFrameGroups}`
   *
   * @param {int} frameIndex
   * @return {AbortablePromise}
   */
  getLabeledThingGroupsInGrameForFrameIndex(frameIndex) {
    const url = this._apiService.getApiUrl(`/labeledThingGroupInFrame/${frameIndex}`);

    return this._bufferedHttp.get(url, undefined, 'LabeledThingGroup')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Received malformed response when requesting labeled thing groups in frame.');
      });
  }

  /**
   * Deletes a labeld thing group with the given id.
   *
   * @param {string} groupId
   * @return {AbortablePromise}
   */
  deleteLabeledThingGroupById(groupId) {
    const url = this._apiService.getApiUrl(`/labeledThingGroup/${groupId}`);

    return this._bufferedHttp.delete(url, undefined, 'LabeledThingGroup')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Received malformed response when deleting labeled thing group.');
      });
  }

  /**
   * Create a labeled thing group of the given type.
   *
   * @param {string} type
   */
  createLabeledThingGroupOfType(type) {
    const url = this._apiService.getApiUrl(`/labeledThingGroup`);
    const body = {type};

    return this._bufferedHttp.post(url, body, 'LabeledThingGroup')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Received malformed response when createing labeled thing group of type "${type}"`);
      });
  }

  /**
   * Assign the given labeled thing to the given group.
   *
   * @param {Array.<LabeledThing>} labeledThings
   * @param {LabeledThingGroup} group
   */
  assignLabeledThingsToLabeledThingGroup(labeledThings, group) {
    const modifiedLabeledThings = labeledThings.map(labeledThing => {
      labeledThing.groupIds.push(group.id);
    });

    const promises = [];

    modifiedLabeledThings.forEach(labeledThing => {
      promises.push(this._labeledThingGateway.saveLabeledThing(labeledThing));
    });

    return this._abortablePromisFactory(this._$q.all(promises));
  }

  /**
   * Creates a group of the given type and assigns the given labeled things to this group.
   *
   * @param {string} type
   * @param {Array.<LabeledThing>}labeledThings
   */
  createGroupOfTypeWithLabeledThings(type, labeledThings) {
    return this.createLabeledThingGroupOfType(type).then(group => {
      return this.assignLabeledThingsToLabeledThingGroup(labeledThings, group);
    });
  }
}

LabeledThingGroupGateway.$inject = [
  '$q',
  'apiService',
  'revisionManager',
  'bufferedHttp',
  'labeledThingGateway',
  'abortablePromiseFactory',
];

export default LabeledThingGroupGateway;
