// TODO: This needs to be fixed to a nicer implementation! This is just a prototype!
class PouchDbViewService {
  /**
   * @param {$q} $q
   * @param {LoggerService} logger
   * @param {PouchDbContextService} pouchDbContextService
   */
  constructor($q, logger, pouchDbContextService) {
    /**
     * @type {$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {LoggerService}
     * @private
     */
    this._logger = logger;

    /**
     * @type {PouchDbContextService}
     * @private
     */
    this._pouchDbContextService = pouchDbContextService;
  }

  /**
   * Get a map/reduce function for a specific `viewIdentifier`
   *
   * This method returns the **real** javascript functions.
   *
   * Those should not be used directly for view queries! Instead use
   * {@link PouchDbViewService#getDesignDocumentViewName} to utilize a prepared view.
   *
   * @param {string} viewIdentifier
   * @return {{map: function, reduce: function?}}
   */
  getViewFunctions(viewIdentifier) {
    if (PouchDbViewService.VIEWS[viewIdentifier] === undefined) {
      throw new Error(`Unknown view identifier ${viewIdentifier}`);
    }
    return PouchDbViewService.VIEWS[viewIdentifier];
  }

  /**
   * Get a design document identifier for a specific `viewIdentifier`.
   *
   * This identifier can be used directly inside {@link PouchDB#query} calls to utilize the corresponding
   * prepared view.
   *
   * @param {string} viewIdentifier
   * @return {string}
   */
  getDesignDocumentViewName(viewIdentifier) {
    if (PouchDbViewService.VIEWS[viewIdentifier] === undefined) {
      throw new Error(`Unknown view identifier ${viewIdentifier}`);
    }
    return `${viewIdentifier}`;
  }

  /**
   * Install the design documents containing prepared views for the given `taskId`.
   *
   * The installed documents will be automatically updated on changes.
   *
   * They will not be heated! Use the {@link PouchDbViewHeater} for this.
   *
   * The returned Promise is resolved once the views are properly installed.
   *
   * @param {string} taskId
   * @return {Promise}
   */
  installDesignDocuments(taskId) {
    this._logger.groupStart('pouchdb:viewService', 'Installing design documents for taskId ', taskId);
    const db = this._pouchDbContextService.provideContextForTaskId(taskId);
    const designDocuments = [];

    return this._$q.resolve()
      .then(
        () => Object.keys(PouchDbViewService.VIEWS).forEach(viewName => {
          const view = PouchDbViewService.VIEWS[viewName];
          const designDocument = this._buildDesignDocument(viewName, view.map, view.reduce);
          designDocuments.push(designDocument);
        })
      )
      .then(() => {
        let promise = this._$q.resolve();
        designDocuments.forEach(designDocument => {
          const id = designDocument._id;
          promise = promise.then(() => {
            return db.get(id)
              .then(document => {
                designDocument._rev = document._rev;
              })
              .catch(() => {
                // Skip non existing documents
                return this._$q.resolve();
              });
          });
        });
        return promise;
      })
      .then(() => {
        this._$q.all(
          designDocuments.map(designDocument => {
            this._logger.log('pouchdb:viewService', 'Storing design document: ', designDocument._id, designDocument);
            return db.put(designDocument);
          })
        );
      })
      .then(() => this._logger.groupEnd('pouchdb:viewService'));
  }

  /**
   * @param {string} viewName
   * @param {function} mapFunction
   * @param {function?} reduceFunction
   */
  _buildDesignDocument(viewName, mapFunction = null, reduceFunction = null) {
    let mapFunctionString = 'function() {}';
    if (mapFunction !== null) {
      if (typeof mapFunction === 'function') {
        mapFunctionString = mapFunction.toString();
      } else {
        mapFunctionString = mapFunction;
      }
    }

    let reduceFunctionString = null;
    if (reduceFunction !== null) {
      if (typeof reduceFunction === 'function') {
        reduceFunctionString = reduceFunction.toString();
      } else {
        reduceFunctionString = reduceFunction;
      }
    }

    const designDocument = {
      _id: `_design/${viewName}`,
      views: {
        [viewName]: {
          map: mapFunctionString,
        },
      },
    };

    if (reduceFunctionString !== null) {
      designDocument.views[viewName].reduce = reduceFunctionString;
    }

    return designDocument;
  }
}

/**
 * List of Views to be installed for usage in PouchDB task databases.
 */
PouchDbViewService.VIEWS = {
  /* eslint-disable no-undef, func-names, no-var */
  'labeledThingInFrameByLabeledThingIdAndIncomplete': {
    map: function(doc) {
      if (doc.type === 'AppBundle.Model.LabeledThingInFrame') {
        emit([doc.labeledThingId, doc.frameIndex], 0 + doc.incomplete);
      }
    },
    reduce: '_sum',
  },
  'labeledThingInFrameByTaskIdAndFrameIndex': {
    map: function(doc) {
      if (doc.type === 'AppBundle.Model.LabeledThingInFrame') {
        emit([doc.taskId, doc.frameIndex]);
      }
    },
  },
  'taskTimerByTaskIdAndUserId': {
    map: function(doc) { // eslint-disable-line func-names
      if (doc.type === 'AppBundle.Model.TaskTimer') {
        emit([doc.taskId, doc.userId]);
      }
    },
  },
  'labeledThingIncomplete': {
    map: function(doc) {
      if (doc.type === 'AppBundle.Model.LabeledThing') {
        emit([doc.taskId, doc.incomplete]);
      }
    },
  },
  'labeledThingInFrameIncomplete': {
    map: function(doc) {
      if (doc.type === 'AppBundle.Model.LabeledThingInFrame') {
        emit([doc.taskId, doc.incomplete]);
      }
    },
  },
  'labeledFrameIncomplete': {
    map: function(doc) {
      if (doc.type === 'AppBundle.Model.LabeledFrame') {
        emit([doc.taskId, doc.incomplete]);
      }
    },
  },
  'labeledThingInFrameByLabeledThingIdAndFrameIndex': {
    map: function(doc) {
      if (doc.type === 'AppBundle.Model.LabeledThingInFrame') {
        emit([doc.labeledThingId, doc.frameIndex]);
      }
    },
  },
  'labeledThingGroupOnFrameByTaskIdAndFrameIndex': {
    map: function(doc) {
      if (doc.type === 'AppBundle.Model.LabeledThing' && doc.groupIds) {
        doc.groupIds.forEach(
          function(groupId) { // eslint-disable-line func-names
            var frameIndex;
            for (frameIndex = doc.frameRange.startFrameIndex; frameIndex <= doc.frameRange.endFrameIndex; frameIndex++) {
              emit([doc.taskId, frameIndex], groupId);
            }
          }
        );
      }
    },
  },
  'labeledThingByLabeledThingGroupId': {
    map: function(doc) {
      if (doc.type === 'AppBundle.Model.LabeledThing') {
        doc.groupIds.forEach(groupId => {
          emit([groupId], doc._id);
        });
      }
    },
  },
  'labeledThingGroupInFrameByLabeledThingGroupIdAndFrameIndex': {
    map: function(doc) {
      if (doc.type === 'AnnoStationBundle.Model.LabeledThingGroupInFrame') {
        emit([doc.labeledThingGroupId, doc.frameIndex]);
      }
    },
  },
  'labeledThingGroupFrameRange': {
    map: function(doc) {
      if (doc.type === 'AppBundle.Model.LabeledThing') {
        doc.groupIds.forEach(
          function(groupId) {
            var frameIndex;
            for (frameIndex = doc.frameRange.startFrameIndex; frameIndex <= doc.frameRange.endFrameIndex; frameIndex++) {
              emit([groupId], [frameIndex, frameIndex]);
            }
          }
        );
      }
    },
    reduce: function(key, values) { // eslint-disable-line func-names
      var min = Infinity;
      var max = -Infinity;
      var index;

      for (index = 0; index < values.length; index++) {
        min = Math.min(values[index][0], min);
        max = Math.max(values[index][1], max);
      }

      return [min, max];
    },
  },
  'labeledFrameByTaskIdAndFrameIndex': {
    map: function(doc) {
      if (doc.type === 'AppBundle.Model.LabeledFrame') {
        emit([doc.taskId, doc.frameIndex]);
      }
    },
  },
  'labeledThingInFrameByFrameIndexWithClasses': {
    map: function(doc) {
      if (doc.type === 'AppBundle.Model.LabeledThingInFrame') {
        if (doc.classes.length > 0) {
          emit([doc.labeledThingId, doc.frameIndex]);
        }
      }
    },
  },
  /* eslint-enable no-undef, func-names, no-var */
};

PouchDbViewService.$inject = [
  '$q',
  'loggerService',
  'pouchDbContextService',
];

export default PouchDbViewService;
