import PouchDbViewService from 'Application/Common/Services/PouchDbViewService';
import {inject} from 'angular-mocks';

describe('PouchDbViewService specs', () => {
  let angularQ;
  let rootScope;
  let service;
  let logger;
  let pouchDbContext;
  let pouchDbContextService;

  beforeEach(inject(($q, $rootScope) => {
    angularQ = $q;
    rootScope = $rootScope;
  }));

  beforeEach(() => {
    logger = jasmine.createSpyObj(['log', 'groupStart', 'groupEnd']);
  });
  beforeEach(() => {
    pouchDbContext = jasmine.createSpyObj(['get', 'put']);
  });
  beforeEach(() => {
    pouchDbContextService = jasmine.createSpyObj(['provideContextForTaskId']);
    pouchDbContextService.provideContextForTaskId.and.returnValue(pouchDbContext);
  });
  beforeEach(() => service = new PouchDbViewService(angularQ, logger, pouchDbContextService));

  it('can be created', () => {
    expect(service).toEqual(jasmine.any(PouchDbViewService));
  });

  describe('getViewFunctions', () => {
    it('throws if the viewIdentifier is unknown', () => {
      function throwWrapper() {
        service.getViewFunctions('Wurstbrot');
      }

      expect(throwWrapper).toThrowError('Unknown view identifier Wurstbrot');
    });

    it('returns an object with a map function if the viewIdentifier exists', () => {
      const expected = {
        map: jasmine.any(Function),
      };

      const view = service.getViewFunctions('labeledThingGroupInFrameByTaskIdAndFrameIndex');

      expect(view).toEqual(expected);
    });
  });

  describe('getDesignDocumentViewName', () => {
    it('throws if the viewIdentifier is unknown', () => {
      function throwWrapper() {
        service.getDesignDocumentViewName('Wurstbrot');
      }

      expect(throwWrapper).toThrowError('Unknown view identifier Wurstbrot');
    });

    it('return pouchdb usable view name viewIdentifier exists', () => {
      // if the design document and viewname are identical pouchdb allows the shorthand of only specifying one!
      const expected = 'labeledThingGroupInFrameByTaskIdAndFrameIndex';

      const view = service.getDesignDocumentViewName('labeledThingGroupInFrameByTaskIdAndFrameIndex');
      expect(view).toEqual(expected);
    });
  });

  describe('installDesignDocuments', () => {
    it('should PUT one design document for each registered VIEW', () => {
      // No design document is previously present in the db
      pouchDbContext.get.and.returnValue(angularQ.reject());

      // All puts are accepted
      pouchDbContext.put.and.callFake(designDocument => angularQ.resolve(designDocument));

      service.installDesignDocuments();

      rootScope.$apply();

      expect(pouchDbContext.put.calls.count()).toEqual(Object.keys(PouchDbViewService.VIEWS).length);
    });

    it('should PUT design documents with same name as view for each registered VIEW', () => {
      // No design document is previously present in the db
      pouchDbContext.get.and.returnValue(angularQ.reject());

      // All puts are accepted
      pouchDbContext.put.and.callFake(designDocument => angularQ.resolve(designDocument));

      service.installDesignDocuments();

      rootScope.$apply();

      const actualDesignDocumentIds = pouchDbContext.put.calls.all().map(callInfo => callInfo.args[0]._id);
      const expectedDesignDocumentIds = Object.keys(PouchDbViewService.VIEWS).map(viewName => `_design/${viewName}`);
      expect(actualDesignDocumentIds).toEqual(expectedDesignDocumentIds);
    });

    it('should PUT design documents with correct view names', () => {
      // No design document is previously present in the db
      pouchDbContext.get.and.returnValue(angularQ.reject());

      // All puts are accepted
      pouchDbContext.put.and.callFake(designDocument => angularQ.resolve(designDocument));

      service.installDesignDocuments();

      rootScope.$apply();

      const actualDesignDocumentViews = pouchDbContext.put.calls.all().map(callInfo => callInfo.args[0].views);
      const actualDesignDocumentViewNames = actualDesignDocumentViews.map(views => Object.keys(views)[0]);
      const expectedDesignDocumentViewNames = Object.keys(PouchDbViewService.VIEWS);
      expect(actualDesignDocumentViewNames).toEqual(expectedDesignDocumentViewNames);
    });

    it('should PUT design documents with stringified map functions', () => {
      // No design document is previously present in the db
      pouchDbContext.get.and.returnValue(angularQ.reject());

      // All puts are accepted
      pouchDbContext.put.and.callFake(designDocument => angularQ.resolve(designDocument));

      service.installDesignDocuments();

      rootScope.$apply();

      const actualDesignDocumentViews = pouchDbContext.put.calls.all().map(callInfo => callInfo.args[0].views);
      const actualDesignDocumentMapFunctions = actualDesignDocumentViews.map(views => views[Object.keys(views)[0]].map);
      const expectedDesignDocumentMapFunctions = Object.keys(PouchDbViewService.VIEWS).map(viewName => PouchDbViewService.VIEWS[viewName].map.toString());
      expect(actualDesignDocumentMapFunctions).toEqual(expectedDesignDocumentMapFunctions);
    });

    it('should PUT design documents with stringified reduce functions', () => {
      // No design document is previously present in the db
      pouchDbContext.get.and.returnValue(angularQ.reject());

      // All puts are accepted
      pouchDbContext.put.and.callFake(designDocument => angularQ.resolve(designDocument));

      service.installDesignDocuments();

      rootScope.$apply();

      const actualDesignDocumentViews = pouchDbContext.put.calls.all().map(callInfo => callInfo.args[0].views);
      const actualDesignDocumentReduceFunctions = actualDesignDocumentViews.map(views => views[Object.keys(views)[0]].reduce);
      const expectedDesignDocumentReduceFunctions = Object.keys(PouchDbViewService.VIEWS).map(
        viewName => PouchDbViewService.VIEWS[viewName].reduce ? PouchDbViewService.VIEWS[viewName].reduce.toString() : undefined
      );
      expect(actualDesignDocumentReduceFunctions).toEqual(expectedDesignDocumentReduceFunctions);
    });

    it('should update design documents which already exist', () => {
      // One document does already exist.
      const existingRevision = '123-abcdefghijklmnopqrstuvwxyz';
      const existingId = '_design/labeledThingGroupInFrameByTaskIdAndFrameIndex';
      pouchDbContext.get.and.callFake(documentId => {
        if (documentId === '_design/labeledThingGroupInFrameByTaskIdAndFrameIndex') {
          return angularQ.resolve({
            _id: existingId,
            _rev: existingRevision,
            views: {},
          });
        }

        return angularQ.reject();
      });

      // All puts are accepted
      pouchDbContext.put.and.callFake(designDocument => angularQ.resolve(designDocument));

      service.installDesignDocuments();

      rootScope.$apply();

      const actualUpdatedDesignDocument = pouchDbContext.put.calls.all().filter(
        callInfo => callInfo.args[0]._id === existingId
      )[0].args[0];

      expect(actualUpdatedDesignDocument._rev).toEqual(existingRevision);
    });
  });
});
