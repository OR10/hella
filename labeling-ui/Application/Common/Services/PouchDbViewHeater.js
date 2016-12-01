/**
 * This service handles the heating of database views
 */
class PouchDbViewHeater {
  /**
   * @param {$q} $q
   * @param {PouchDbContextService} pouchDbContextService
   */
  constructor($q, pouchDbContextService) {
    /**
     * @type {$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {PouchDbContextService}
     * @private
     */
    this._pouchDbContextService = pouchDbContextService;
  }

  /**
   * Heats a single view in the pouchDB
   *
   * @param {object} context
   * @param {String} viewName
   * @return {Promise}
   */
  heatView(context, viewName) {
    // @TODO: Maybe optimize by not transfering all documents into js space
    return context.query(viewName);
  }

  /**
   * Heats multiple views in the database
   *
   * @param {object} context
   * @param {Array} viewNames
   */
  heatViews(context, viewNames) {
    const promises = [];
    viewNames.forEach(viewName => {
      promises.push(this.heatView(context, viewName));
    });

    return this._$q.all(promises);
  }

  /**
   * Heats all views in the database
   *
   * @param {object} context
   */
  heatAllViews(context) {
    // Get all view documents
    return context.allDocs({
      include_docs: true,
      startkey: '_design/',
      endkey: '_design0',
    }).then(documents => {
      const promises = [];

      documents.forEach(document => {
        promises.push(this.heatView(context, document.key));
      });

      return this._$q.all(promises);
    });
  }
}

PouchDbViewHeater.$inject = [
  '$q',
  'pouchDbContextService'
];

export default PouchDbViewHeater;
