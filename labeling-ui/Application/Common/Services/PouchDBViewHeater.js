/**
 * This service handles the heating of database views
 */
class PouchDBViewHeater {
  /**
   * @param {$q} $q
   * @param {StorageContextFactory} storageContextFactory
   */
  constructor($q, storageContextFactory) {
    /**
     * @type {$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {StorageContextFactory}
     * @private
     */
    this._storageContextFactory = storageContextFactory;
  }

  /**
   * Heats a single view in the pouchDB
   *
   * @param {string} taskId
   * @param {String} viewName
   */
  heatView(taskId, viewName) {
    const db = this._storageContextFactory.getContextForTaskName(taskId);

    return db.query(viewName);
  }

  /**
   * Heats multiple views in the database
   *
   * @param {string} taskId
   * @param {Array} viewNames
   */
  heatViews(taskId, viewNames) {
    const promises = [];
    viewNames.forEach(viewName => {
      promises.push(this.heatView(taskId, viewName));
    });

    return this._$q.all(promises);
  }

  /**
   * Heats all views in the database
   *
   * @param {string} taskId
   */
  heatAllViews(taskId) {
    const db = this._storageContextFactory.getContextForTaskName(taskId);

    // Get all view documents
    return db.allDocs({
      include_docs: true,
      startkey: '_design/',
      endkey: '_design0',
    }).then(documents => {
      const promises = [];

      documents.forEach(document => {
        promises.push(this.heatView(taskId, document.key));
      });

      return this._$q.all(promises);
    });
  }
}

PouchDBViewHeater.$inject = ['$q', 'storageContextFactory'];

export default PouchDBViewHeater;
