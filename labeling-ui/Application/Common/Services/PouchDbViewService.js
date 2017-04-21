// TODO: This needs to be fixed to a nicer implementation! This is just a prototype!
class PouchDbViewService {
  /**
   * @param {LoggerService} logger
   * @param {PouchDbContextService} pouchDbContextService
   */
  constructor(logger, pouchDbContextService) {
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
   * @param {string} viewIdentifier
   * @return {{map: map}}
   */
  getViewFunctions(viewIdentifier) {
    if (PouchDbViewService.VIEWS[viewIdentifier] === undefined) {
      throw new Error(`Unknown view identifier ${viewIdentifier}`);
    }
    return PouchDbViewService.VIEWS[viewIdentifier];
  }

  getDesignDocumentViewName(viewIdentifier) {
    if (PouchDbViewService.VIEWS[viewIdentifier] === undefined) {
      throw new Error(`Unknown view identifier ${viewIdentifier}`);
    }
    return `${viewIdentifier}`;
  }

  get(viewIdentifier) {
    return this.getDesignDocumentViewName(viewIdentifier);
  }

  installDesignDocuments(taskId) {
    this._logger.groupStart('pouchdb:viewService', 'Installing design documents for taskId ', taskId);
    const db = this._pouchDbContextService.provideContextForTaskId(taskId);
    const designDocuments = [];

    return Promise.resolve()
      .then(
        () => Object.keys(PouchDbViewService.VIEWS).forEach(viewName => {
          const view = PouchDbViewService.VIEWS[viewName];
          const designDocument = this._buildDesignDocument(viewName, view.map, view.reduce);
          designDocuments.push(designDocument);
        })
      )
      .then(() => {
        let promise = Promise.resolve();
        designDocuments.forEach(designDocument => {
          const id = designDocument._id;
          promise = promise.then(
            () => db.get(id)
              .then(document => {
                designDocument._rev = document._rev;
              })
              .catch(() => {
              })
          );
        });
        return promise;
      })
      .then(() => Promise.all(
        designDocuments.map(designDocument => {
          this._logger.log('pouchdb:viewService', 'Storing design document: ', designDocument._id, designDocument);
          return db.put(designDocument)
        })
      ))
      .then(() => this._logger.groupEnd('pouchdb:viewService'));
  }

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
          map: mapFunctionString
        }
      }
    };

    if (reduceFunctionString !== null) {
      designDocument.views[viewName].reduce = reduceFunctionString;
    }

    return designDocument;
  }
}

PouchDbViewService.VIEWS = {
  'labeledThingInFrameByLabeledThingIdAndIncomplete': {
    map: function (doc) { // eslint-disable-line func-names
      if (doc.type === 'AppBundle.Model.LabeledThingInFrame') {
        emit(doc.labeledThingId, 0 + doc.incomplete); // eslint-disable-line no-undef
      }
    },
    reduce: '_sum',
  },
  'labeledThingInFrameByTaskIdAndFrameIndex': {
    map: function (doc) { // eslint-disable-line func-names
      if (doc.type === 'AppBundle.Model.LabeledThingInFrame') {
        emit([doc.taskId, doc.frameIndex]); // eslint-disable-line no-undef
      }
    },
  },
  'taskTimerByTaskIdAndUserId': {
    map: function (doc) { // eslint-disable-line func-names
      if (doc.type === 'AppBundle.Model.TaskTimer') {
        emit([doc.taskId, doc.userId]); // eslint-disable-line no-undef
      }
    },
  },
  'labeledThingIncomplete': {
    map: function (doc) { // eslint-disable-line func-names
      if (doc.type === 'AppBundle.Model.LabeledThing') {
        emit([doc.taskId, doc.incomplete]); // eslint-disable-line no-undef
      }
    },
  },
  'labeledThingInFrameIncomplete': {
    map: function (doc) { // eslint-disable-line func-names
      if (doc.type === 'AppBundle.Model.LabeledThingInFrame') {
        emit([doc.taskId, doc.incomplete]); // eslint-disable-line no-undef
      }
    },
  },
  'labeledThingInFrameByLabeledThingIdAndFrameIndex': {
    map: function (doc) { // eslint-disable-line func-names
      if (doc.type === 'AppBundle.Model.LabeledThingInFrame') {
        emit([doc.labeledThingId, doc.frameIndex]); // eslint-disable-line no-undef
      }
    },
  },
  'labeledThingGroupInFrameByTaskIdAndFrameIndex': {
    map: function (doc) { // eslint-disable-line func-names
      if (doc.type === 'AppBundle.Model.LabeledThing') {
        doc.groupIds.forEach(
          function (groupId) { // eslint-disable-line func-names
            for (var i = doc.frameRange.startFrameIndex; i <= doc.frameRange.endFrameIndex; i++) { // eslint-disable-line vars-on-top, no-var, id-length
              emit([doc.taskId, i], groupId); // eslint-disable-line no-undef
            }
          }
        );
      }
    },
  }
};

PouchDbViewService.$inject = [
  'loggerService',
  'pouchDbContextService',
];

export default PouchDbViewService;
