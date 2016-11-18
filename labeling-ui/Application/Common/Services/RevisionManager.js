/**
 * Service to Manage the correct Revision of any Object currently available and shared with the Backend
 */
class RevisionManager {
  constructor() {
    /**
     * Object id to current Revision Mapping
     *
     * @type {Map.<string, string>}
     * @private
     */
    this._revisionMap = new Map();
  }

  /**
   * Update the Revision currently stored for a certain id
   *
   * If the `id` does not exist yet it will be created inside of the mapping
   *
   * @param {string} id
   * @param {string} revision
   */
  updateRevision(id, revision) {
    this._revisionMap.set(id, revision);
  }

  /**
   * Get the stored revision for a certain id
   *
   * @param {string} id
   * @returns {string}
   * @throws {Error} if requested `id` does not have an assigned Revision
   */
  getRevision(id) {
    if (!this._revisionMap.has(id)) {
      throw new Error(`Requested revision for model (${id}) is not available.`);
    }

    return this._revisionMap.get(id);
  }

  /**
   * Check if a revision is available for a specific id
   *
   * @param {string} id
   * @returns {boolean}
   */
  hasRevision(id) {
    return this._revisionMap.has(id);
  }

  /**
   * Inject the revision into the given model
   *
   * The model needs to have a proper `id` property.
   *
   * The model will be modified in place. The revision will be stored as `rev` property.
   *
   * @param {{id: string}|{_id: string}} model
   * @throws {Error} if given `model` does not have an `id`
   */
  injectRevision(model) {
    if (!this._modelHasId(model)) {
      throw new Error(`Could not inject revision for model, as model does not have an id: ${model}`);
    }
    const id = this._getIdFromModel(model);
    const revision = this.getRevision(id);

    this._setRevisionOnModel(model, revision);
  }

  /**
   * Determine if a model has a valid id property
   *
   * @param {object} model
   * @returns {boolean}
   * @private
   */
  _modelHasId(model) {
    return (
      (model.id !== undefined && typeof model.id === 'string') ||
      (model._id !== undefined && typeof model._id === 'string')
    );
  }

  /**
   * Determine if a model has a valid revision property
   *
   * @param {object} model
   * @returns {boolean}
   * @private
   */
  _modelHasRevision(model) {
    return (
      (model.rev !== undefined && typeof model.rev === 'string') ||
      (model._rev !== undefined && typeof model._rev === 'string')
    );
  }

  /**
   * Return the id of a model object or `null`, if it does not have an id
   *
   * @param {object} model
   * @returns {string|null}
   * @private
   */
  _getIdFromModel(model) {
    if (model.id !== undefined) {
      return model.id;
    } else if (model._id !== undefined) {
      return model._id;
    }

    return null;
  }

  /**
   * Return the revision of a model object or `null`, if it does not have an revision
   *
   * @param {object} model
   * @returns {string|null}
   * @private
   */
  _getRevisionFromModel(model) {
    if (model.rev !== undefined) {
      return model.rev;
    } else if (model._rev !== undefined) {
      return model._rev;
    }

    return null;
  }

  /**
   * Set the revision on a given model.
   *
   * Based on the existence of an `id` or `_id` property the revision property will be prefixed with or without an
   * underscore automatically.
   *
   * @param {object} model
   * @param {string} revision
   * @private
   */
  _setRevisionOnModel(model, revision) {
    if (model.id !== undefined) {
      model.rev = revision;
    } else {
      model._rev = revision;
    }
  }

  /**
   * Extract the Revision from a given model updating the mapping in the background
   *
   * The `model` needs to provide a proper `id` as well as `rev` property.
   *
   * @param {{id: string, rev: string}|{_id: string, _rev: string}} model
   * @throws {Error} if `id` or `rev` is missing in the model
   */
  extractRevision(model) {
    if (!this._modelHasId(model) || !this._modelHasRevision(model)) {
      throw new Error(`Revision could not be extracted from model: ${model}`);
    }

    const id = this._getIdFromModel(model);
    const revision = this._getRevisionFromModel(model);

    this.updateRevision(id, revision);
  }
}

export default RevisionManager;
