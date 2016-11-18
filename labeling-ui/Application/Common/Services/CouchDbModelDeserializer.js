import LabeledThingInFrame from 'Application/LabelingData/Models/LabeledThingInFrame';

/**
 * The CouchDbModelDeserializer is capable of converting CouchDb document into our internal models.
 *
 * It does not implement the serialization of models into their CouchDb Documents.
 */
class CouchDbModelDeserializer {
  /**
   * Deserialize a labeledThingInFrame to our internal model
   *
   * @param {Object} labeledThingInFrameDocument
   * @param {LabeledThing} labeledThingModel
   */
  deserializeLabeledThingInFrame(labeledThingInFrameDocument, labeledThingModel) {
    this._removePrefixFromIdAndRevision(labeledThingInFrameDocument);

    labeledThingInFrameDocument.labeledThing = labeledThingModel;

    return new LabeledThingInFrame(labeledThingInFrameDocument);
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
}

CouchDbModelDeserializer.TYPE_LABELED_THING_IN_FRAME = 'AppBundle.Model.LabeledThingInFrame';

CouchDbModelDeserializer.$inject = [];

export default CouchDbModelDeserializer;
