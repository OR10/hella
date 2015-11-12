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
   * Inject the revision into the given model
   *
   * The model needs to have a proper `id` property.
   *
   * The model will be modified in place. The revision will be stored as `rev` property.
   *
   * @param {{id: string}} model
   * @throws {Error} if given `model` does not have an `id`
   */
  injectRevision(model) {
    if (!model.id) {
      throw new Error(`Could not inject revision for model, as model does not have an id: ${model}`);
    }

    const revision = this.getRevision(model.id);
    model.rev = revision;
  }

  /**
   * Extract the Revision from a given model updating the mapping in the background
   *
   * The `model` needs to provide a proper `id` as well as `rev` property.
   *
   * @param {{id: string, rev: string}} model
   * @throws {Error} if `id` or `rev` is missing in the model
   */
  extractRevision(model) {
    const {id, rev} = model;
    if (!id || !rev) {
      throw new Error(`Revision could not be extracted from model: id: ${id}, rev: ${rev}`);
    }

    this.updateRevision(id, rev);
    delete model.rev;
  }
}

export default RevisionManager;
