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
            ltgifDocument.labeledThingGroup = new LabeledThingGroup(Object.assign({}, labeledThingGroupDocument, {task}));

            return new LabeledThingGroupInFrame(ltgifDocument);
          });
        }

        throw new Error('Received malformed response when requesting labeled thing groups in frame.');
      });
  }

  /**
   * Deletes a labeled thing group with the given id.
   *
   * @param {LabeledThingGroup} labeledThingGroup
   * @return {AbortablePromise}
   */
  deleteLabeledThingGroup(labeledThingGroup) {
    const task = labeledThingGroup.task;
    const url = this._apiService.getApiUrl(`/task/${task.id}/labeledThingGroup/${labeledThingGroup.id}`);

    return this._bufferedHttp.delete(url, undefined, 'LabeledThingGroup')
      .then(response => {
        if (response.data && response.data && response.data.success === true) {
          return true;
        }

        throw new Error('Received malformed response when deleting labeled thing group.');
      });
  }

  /**
   * Create a labeled thing group of the given type.
   *
   * @param {Task} task
   * @param {LabeledThingGroup} labeledThingGroup
   * @return {AbortablePromise}
   */
  createLabeledThingGroup(task, labeledThingGroup) {
    const url = this._apiService.getApiUrl(`/task/${task.id}/labeledThingGroup`);
    const {type, lineColor} = labeledThingGroup;

    const body = {
      lineColor,
      groupType: type,
    };

    return this._bufferedHttp.post(url, body, undefined, 'labeledThingGroup')
      .then(response => {
        if (response.data && response.data.result) {
          return new LabeledThingGroup(Object.assign({}, response.data.result, {task}));
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
      if (labeledThing.groupIds.indexOf(labeledThingGroup.id) === -1) {
        labeledThing.groupIds.push(labeledThingGroup.id);
      }
      return labeledThing;
    });

    const promises = [];

    modifiedLabeledThings.forEach(labeledThing => {
      promises.push(this._labeledThingGateway.saveLabeledThing(labeledThing));
    });

    return this._abortablePromisFactory(this._$q.all(promises));
  }

  /**
   * Remove group assignment from the labeled thing
   *
   * @param {Array.<LabeledThing>} labeledThings
   * @param {LabeledThingGroup} labeledThingGroup
   */
  unassignLabeledThingsToLabeledThingGroup(labeledThings, labeledThingGroup) {
    const modifiedLabeledThings = labeledThings.map(labeledThing => {
      const index = labeledThing.groupIds.indexOf(labeledThingGroup.id);
      if (index !== -1) {
        labeledThing.groupIds.splice(index, 1);
      }
      return labeledThing;
    });

    const promises = [];

    modifiedLabeledThings.forEach(labeledThing => {
      promises.push(this._labeledThingGateway.saveLabeledThing(labeledThing));
    });

    return this._abortablePromisFactory(this._$q.all(promises));
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
