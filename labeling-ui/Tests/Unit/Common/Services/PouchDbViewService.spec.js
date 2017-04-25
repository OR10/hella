import PouchDbViewService from 'Application/Common/Services/PouchDbViewService';

fdescribe('PouchDbViewService specs', () => {
  let service;
  let logger;
  let pouchDbContext;
  let pouchDbContextService;

  beforeEach(() => {
    logger = jasmine.createSpyObj(['log', 'groupStart', 'groupEnd']);
  });
  beforeEach(() => {
    pouchDbContext = undefined;
  });
  beforeEach(() => {
    pouchDbContextService = jasmine.createSpyObj(['provideContextForTaskId']);
    pouchDbContextService.provideContextForTaskId.and.returnValue(pouchDbContext);
  });
  beforeEach(() => service = new PouchDbViewService(logger, pouchDbContextService));

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

});
