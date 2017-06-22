import angular from 'angular';
import Task from 'Application/Task/Model/Task';
import LabeledThing from 'Application/LabelingData/Models/LabeledThing';
import LabeledThingInFrame from 'Application/LabelingData/Models/LabeledThingInFrame';
import LabeledThingGroup from 'Application/LabelingData/Models/LabeledThingGroup';
import LabeledThingGroupInFrame from 'Application/LabelingData/Models/LabeledThingGroupInFrame';
import LabeledFrame from 'Application/LabelingData/Models/LabeledFrame';

/**
 * The CouchDbModelDeserializer is capable of converting CouchDb document into our internal models.
 *
 * It does not implement the serialization of models into their CouchDb Documents.
 */
class CouchDbModelDeserializer {
  /**
   * Deserialize a labeledThing to our frontend model
   *
   * In order to create a {@link LabeledThing} the corresponding video document is needed as a dependency.
   * The video document does not have a corresponding frontend model and is directly used as couchdb document.
   *
   * The video document needs to correspond to the `videoId` property of the given `taskDocument`.
   *
   * Optionally a `userMapping` may be provided. The `userMapping` is a key-value-object containing mappings between
   * userIds and their corresponding {@link User} models.
   *
   * If a `userMapping` is provided it needs to be a mapping for all {@link User}s used inside the tasks
   * `assignmentHistory`.
   *
   * @param {object} taskDocument
   * @param {object} videoDocument
   * @param {object.<string, User>?} userMapping
   * @return {Task}
   */
  deserializeTask(taskDocument, videoDocument, userMapping = {}) {
    const document = this._cloneDocument(taskDocument);
    const video = this._cloneDocument(videoDocument);

    this._removePrefixFromIdAndRevision(document);
    this._removePrefixFromIdAndRevision(video);

    if (document.videoId !== video.id) {
      throw new Error(`Can not deserialize task with non corresponding video document: ${document.videoId} !== ${video.id}`);
    }

    // Remove video attributes, which should not be in frontend model
    // Attributes are already prefix free!
    [
      'type',
      'rev',
    ].forEach(property => {
      if (video[property] !== undefined) {
        delete video[property];
      }
    });

    return new Task(
      Object.assign({}, document, {video}),
      userMapping
    );
  }

  /**
   * Deserialize a labeledThing to our frontend model
   *
   * In order to create a {@link LabeledThing} the corresponding {@link Task}
   * is needed as a dependency. The dependency needs to be provided as {@link Task} instance.
   * In order to create this model from a CouchDb document {@link CouchDbModelDeserializer#deserializeTask}
   * may be used.
   *
   * @param {object} labeledThingDocument
   * @param {Task} task
   * @return {LabeledThing}
   */
  deserializeLabeledThing(labeledThingDocument, task) {
    const document = this._cloneDocument(labeledThingDocument);
    this._removePrefixFromIdAndRevision(document);

    // Embedded document frameRange has a type, which should not exist in frontend model
    if (document.frameRange !== undefined && document.frameRange.type !== undefined) {
      delete document.frameRange.type;
    }

    delete document.taskId;

    return new LabeledThing(
      Object.assign({}, document, {task})
    );
  }

  /**
   * Deserialize a labeledThingGroup to our frontend model
   *
   * In order to create a {@link LabeledThingGroup} the corresponding {@link Task}
   * is needed as a dependency. The dependency needs to be provided as {@link Task} instance.
   * In order to create this model from a CouchDb document {@link CouchDbModelDeserializer#deserializeTask}
   * may be used.
   *
   * @param {object} labeledThingGroupDocument
   * @param {Task} task
   * @return {LabeledThingGroup}
   */
  deserializeLabeledThingGroup(labeledThingGroupDocument, task) {
    const document = this._cloneDocument(labeledThingGroupDocument);
    this._removePrefixFromIdAndRevision(document);

    delete document.taskId;

    return new LabeledThingGroup(
      Object.assign({}, document, {task})
    );
  }

  /**
   * Deserialize a labeledThingGroupInFrame to our frontend model
   *
   * @param {object} labeledThingGroupInFrameDocument
   * @param {LabeledThingGroup} labeledThingGroup
   * @return {LabeledThingGroup}
   */
  deserializeLabeledThingGroupInFrame(labeledThingGroupInFrameDocument, labeledThingGroup) {
    const document = this._cloneDocument(labeledThingGroupInFrameDocument);
    this._removePrefixFromIdAndRevision(document);

    return new LabeledThingGroupInFrame(Object.assign({}, document, {labeledThingGroup, task: labeledThingGroup.task}));
  }


  /**
   * Deserialize a labeledThingInFrame to our frontend model
   *
   * In order to create a {@link LabeledThingInFrame} the corresponding {@link LabeledThing}
   * is needed as a dependency. The dependency needs to be provided as {@link LabeledThing} instance.
   * In order to create this model from a CouchDb document {@link CouchDbModelDeserializer#deserializeLabeledThing}
   * may be used.
   *
   * @param {Object} labeledThingInFrameDocument
   * @param {LabeledThing} labeledThing
   * @return {LabeledThingInFrame}
   */
  deserializeLabeledThingInFrame(labeledThingInFrameDocument, labeledThing) {
    const model = this._cloneDocument(labeledThingInFrameDocument);
    this._removePrefixFromIdAndRevision(model);
    model.ghost = false;
    model.ghostClasses = null;

    return new LabeledThingInFrame(
      Object.assign({}, model, {labeledThing, task: labeledThing.task})
    );
  }

  /**
   * Deserialize a labeledFrame to our frontend model
   *
   * @param {object} labeledFrameDocument
   * @param {Task} task
   * @return {LabeledFrame}
   */
  deserializeLabeledFrame(labeledFrameDocument, task) {
    const document = this._cloneDocument(labeledFrameDocument);
    this._removePrefixFromIdAndRevision(document);

    delete document.taskId;

    return new LabeledFrame(Object.assign({}, document, {task}));
  }

  /**
   * Remove the prefix the `_id` and `_rev` properties in the given document
   *
   * The default prefix is the *underscore*, which CouchDb sets by default.
   *
   * If `_id` or `_rev` are not present, they will be silently ignored.
   *
   * @param {object} document
   * @param {string?} prefix
   * @private
   */
  _removePrefixFromIdAndRevision(document, prefix = '_') {
    if (document[`${prefix}id`] !== undefined && typeof document[`${prefix}id`] === 'string') {
      document.id = document[`${prefix}id`];
      delete document[`${prefix}id`];
    }

    if (document[`${prefix}rev`] !== undefined && typeof document[`${prefix}rev`] === 'string') {
      document.rev = document[`${prefix}rev`];
      delete document[`${prefix}rev`];
    }
  }

  /**
   * Create a deep clone of a CouchDB document.
   *
   * @param {Object} document
   * @return {Object}
   * @private
   */
  _cloneDocument(document) {
    // Replace with framework agnostic version in case of usage outside of angular.
    return angular.copy(document);
  }
}

CouchDbModelDeserializer.$inject = [];

export default CouchDbModelDeserializer;
