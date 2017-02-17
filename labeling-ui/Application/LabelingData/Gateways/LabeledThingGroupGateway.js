import LabeledThingGroup from '../Models/LabeledThingGroup';
import LabeledThingGroupInFrame from '../Models/LabeledThingGroupInFrame';

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
   * Requests labeled thing groups for the given task and frame index.
   *
   * @param {Task} task
   * @param {int} frameIndex
   * @return {AbortablePromise}
   */
  getLabeledThingGroupsInFrameForFrameIndex(task, frameIndex) {
    const url = this._apiService.getApiUrl(`/task/${task.id}/labeledThingGroupInFrame/frame/${frameIndex}`);

    return this._bufferedHttp.get(url, undefined, 'LabeledThingGroup')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result.labeledThingGroupsInFrame.map(ltgifDocument => {
            const labeledThingGroupDocument = response.data.result.labeledThingGroups.find(ltg => ltg.id === ltgifDocument.labeledThingGroupId);
            ltgifDocument.labeledThingGroup = new LabeledThingGroup(labeledThingGroupDocument);

            return new LabeledThingGroupInFrame(ltgifDocument);
          });
        }

        throw new Error('Received malformed response when requesting labeled thing groups in frame.');
      });
  }

  /**
   * Deletes a labeled thing group with the given id.
   *
   * @param {Task} task
   * @param {string} labeledThingGroupId
   * @return {AbortablePromise}
   */
  deleteLabeledThingGroupById(task, labeledThingGroupId) {
    const url = this._apiService.getApiUrl(`/task/${task.id}/labeledThingGroup/${labeledThingGroupId}`);

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
   * @param {Task} task
   * @param {string} type
   * @return {AbortablePromise}
   */
  createLabeledThingGroupOfType(task, type) {
    const url = this._apiService.getApiUrl(`/task/${task.id}/labeledThingGroup`);
    const body = {groupType: type};

    return this._bufferedHttp.post(url, body, undefined, 'labeledThingGroup')
      .then(response => {
        if (response.data && response.data.result) {
          return new LabeledThingGroup(response.data.result);
        }

        throw new Error(`Received malformed response when creating labeled thing group of type "${type}"`);
      });
  }

  /**
   * Assign the given labeled thing to the given group.
   *
   * @param {Array.<LabeledThing>} labeledThings
   * @param {LabeledThingGroup} labeledThingGroup
   */
  assignLabeledThingsToLabeledThingGroup(labeledThings, labeledThingGroup) {
    const modifiedLabeledThings = labeledThings.map(labeledThing => {
      labeledThing.groupIds.push(labeledThingGroup.id);
      return labeledThing;
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
   * @param {Task} task
   * @param {string} type
   * @param {Array.<LabeledThing>}labeledThings
   */
  createGroupOfTypeWithLabeledThings(task, type, labeledThings) {
    return this.createLabeledThingGroupOfType(task, type).then(group => {
      return this.assignLabeledThingsToLabeledThingGroup(labeledThings, group);
    });
  }
}

LabeledThingGroupGateway.$inject = [
  '$q',
  'ApiService',
  'revisionManager',
  'bufferedHttp',
  'labeledThingGateway',
  'abortablePromiseFactory',
];

export default LabeledThingGroupGateway;
