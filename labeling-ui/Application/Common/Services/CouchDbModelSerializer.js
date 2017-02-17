import LabeledThing from 'Application/LabelingData/Models/LabeledThing';
import LabeledThingInFrame from 'Application/LabelingData/Models/LabeledThingInFrame';

import {cloneDeep} from 'lodash';

/**
 * The CouchDbModelSerializer is capable of converting our internal application models into their corresponding couchdb
 * document representation for storage.
 *
 * It does not implement the deserialization of CouchDB Documents into our model structure.
 */
class CouchDbModelSerializer {
  constructor() {
    /**
     * Map of model class constructors to their couchdb type identifier
     *
     * @type {Map}
     * @private
     */

    this._modelClassToDocumentTypeMapping = new Map([
      [LabeledThing, CouchDbModelSerializer.TYPE_LABELED_THING],
      [LabeledThingInFrame, CouchDbModelSerializer.TYPE_LABELED_THING_IN_FRAME],
    ]);
  }

  /**
   * Serialize a given model object
   *
   * The method tries to automatically identify the type by looking at the instanceof type of the given model.
   * If automatic identification fails an execption will the thrown.
   *
   * The automatic identification process can be overridden using the second argument `type`.
   *
   * @param {*} model
   * @param {string|null} type
   */
  serialize(model, type = null) {
    if (type === null) {
      type = this._guessModelType(model); // eslint-disable-line no-param-reassign
    }

    const serializerDelegate = this._getSerializerDelegateForType(type);
    return this[serializerDelegate](model);
  }

  /**
   * Serialize a LabeledThing Model
   *
   * @param {LabeledThing} labeledThing
   *
   * @return {object}
   *
   * @private
   */
  _serializeAppBundleModelLabeledThing(labeledThing) {
    const document = labeledThing.toJSON();
    this._prefixIdAndRevision(document);

    // Type annotation
    document.type = CouchDbModelSerializer.TYPE_LABELED_THING;

    // Nested FrameRange
    document.frameRange = this.serialize(labeledThing.frameRange, CouchDbModelSerializer.TYPE_FRAME_RANGE);

    return document;
  }

  /**
   * Serialize a LabeledThingInFrame Model
   *
   * @param {LabeledThingInFrame} labeledThingInFrameModel
   *
   * @return {object}
   *
   * @private
   */
  _serializeAppBundleModelLabeledThingInFrame(labeledThingInFrameModel) {
    const documentJson = labeledThingInFrameModel.toJSON();
    this._prefixIdAndRevision(documentJson);

    // Type annotation
    documentJson.type = CouchDbModelSerializer.TYPE_LABELED_THING_IN_FRAME;

    // Nested FrameRange
    documentJson.labeledThingId = labeledThingInFrameModel._labeledThing.id;
    documentJson.taskId = labeledThingInFrameModel.labeledThing.task.id;
    documentJson.projectId = labeledThingInFrameModel.labeledThing.task.projectId;
    documentJson.classes = JSON.parse(JSON.stringify(labeledThingInFrameModel.classes));

    return documentJson;
  }
  /**
   * Serialize a FrameRange Model
   *
   * @param {object} frameRange
   *
   * @return {object}
   *
   * @private
   */
  _serializeAppBundleModelFrameIndexRange(frameRange) {
    const document = cloneDeep(frameRange);

    // Type annotation
    document.type = CouchDbModelSerializer.TYPE_FRAME_RANGE;

    return document;
  }

  /**
   * Try to determine the type of the given model using the `_modelClassToDocumentTypeMapping` table.
   *
   * @param {*} model
   * @private
   */
  _guessModelType(model) {
    if (typeof model !== 'object') {
      throw new Error(`Tried to serialize non object into CouchDB document: ${typeof model}`);
    }

    for (const [constructor, type] of this._modelClassToDocumentTypeMapping) {
      if (model instanceof constructor) {
        return type;
      }
    }

    throw new Error(`Unknown Model constructor: Unable to determine corresponding CouchDB model type: ${JSON.stringify(model)}`);
  }

  /**
   * Get the name of a serializer delegate method for a specific type
   *
   * @param type
   * @returns {*|{all}}
   * @private
   */
  _getSerializerDelegateForType(type) {
    const cleanType = type.replace(/[^a-zA-Z]/g, '');
    return `_serialize${cleanType}`;
  }

  /**
   * Prefix the `id` and `rev` properties in the given document
   *
   * The default prefix is the *underscore*, which CouchDb needs by default.
   *
   * If `id` or `rev` are not present, they will be silently ignored.
   *
   * @param {object} document
   * @param {string?} prefix
   * @private
   */
  _prefixIdAndRevision(document, prefix = '_') {
    if (document.id !== undefined && typeof document.id === 'string') {
      document[`${prefix}id`] = document.id;
      delete document.id;
    }

    if (document.rev !== undefined && typeof document.rev === 'string') {
      document[`${prefix}rev`] = document.rev;
      delete document.rev;
    }
  }
}

CouchDbModelSerializer.TYPE_LABELED_THING = 'AppBundle.Model.LabeledThing';
CouchDbModelSerializer.TYPE_LABELED_THING_IN_FRAME = 'AppBundle.Model.LabeledThingInFrame';
CouchDbModelSerializer.TYPE_FRAME_RANGE = 'AppBundle.Model.FrameIndexRange';

CouchDbModelSerializer.$inject = [];

export default CouchDbModelSerializer;
