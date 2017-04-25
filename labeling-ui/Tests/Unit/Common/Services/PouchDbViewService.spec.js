import PouchDbViewService from 'Application/Common/Services/PouchDbViewService';

fdescribe('PouchDbViewService specs', () => {
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
  });
});
