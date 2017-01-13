import forEach from 'lodash.foreach';

/**
 * This service handles the heating of database views
 */
class PouchDbViewHeater {
  /**
   * @param {$q} $q
   * @param {LoggerService} loggerService
   */
  constructor($q, loggerService) {
    /**
     * @type {$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {LoggerService}
     * @private
     */
    this._logger = loggerService;
  }

  /**
   * Heats a single view in the pouchDB
   *
   * @param {object} context
   * @param {String} viewName
   * @return {Promise}
   */
  heatView(context, viewName) {
    this._logger.log('pouchdb:viewHeater', 'Heating view %s', viewName);
    return context.query(
      viewName,
      {
        include_docs: false,
        limit: 1,
      }
    );
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

  heatAllViewsForDesignDocument(context, designDocument) {
    const promises = [];
    const viewNames = this._getViewNamesFromDesignDocument(designDocument);
    viewNames.forEach(
      viewName => promises.push(this.heatView(context, viewName))
    );

    return this._$q.all(promises);
  }

  /**
   * Heats all views in the database
   *
   * If a prefix is given only views beginning with this prefix will be heated.
   *
   * @param {object} context
   * @param {string?} prefix
   */
  heatAllViews(context, prefix = '') {
    this._logger.groupStart('pouchdb:viewHeater', 'Heating all views');
    // Get all view documents
    return context.allDocs({
      include_docs: true,
      startkey: '_design/',
      endkey: '_design0',
    }).then(response => {
      const promises = [];

      response.rows.forEach(row => {
        const documentName = row.key.replace(/^_design\//, '');
        if (documentName.indexOf(prefix) !== 0) {
          return;
        }
        const document = row.doc;
        promises.push(this.heatAllViewsForDesignDocument(context, document));
      });

      return this._$q.all(promises)
        .then(() => this._logger.groupEnd('pouchdb:viewHeater'));
    });
  }

  _getViewNamesFromDesignDocument(designDocument) {
    const viewNames = [];
    if (typeof designDocument.views !== 'object') {
      return viewNames;
    }

    forEach(
      designDocument.views,
      (view, viewName) => {
        const documentName = designDocument._id.replace(/^_design\//, '');
        const fullyQualifiedViewName = `${documentName}/${viewName}`;
        viewNames.push(fullyQualifiedViewName);
      }
    );

    return viewNames;
  }
}

PouchDbViewHeater.$inject = [
  '$q',
  'loggerService',
];

export default PouchDbViewHeater;
