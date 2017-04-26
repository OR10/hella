import {inject} from 'angular-mocks';
import PouchDbLabeledFrameGateway from 'Application/LabelingData/Gateways/PouchDbLabeledFrameGateway';

fdescribe('PouchDbLabeledFrameGateway', () => {
  let rootScope;
  let angularQ;
  let packagingExecutor;
  let pouchDbContextService;
  let couchDbModelDeserializer;
  let pouchDbViewService;

  /**
   * @type {PouchDbLabeledFrameGateway}
   */
  let labeledFrameGateway;

  beforeEach(() => {
    packagingExecutor = jasmine.createSpyObj('packagingExecutor', ['execute']);
    packagingExecutor.execute.and.callFake(
      (queue, executionFn) => angularQ.resolve(executionFn())
    );
  });
  beforeEach(() => pouchDbContextService = jasmine.createSpyObj('pouchDbContextService', ['provideContextForTaskId']));
  beforeEach(() => couchDbModelDeserializer = jasmine.createSpyObj('couchDbModelDeserializer', ['deserializeLabeledFrame']));
  beforeEach(() => pouchDbViewService = jasmine.createSpyObj('pouchDbViewService', ['getDesignDocumentViewName']));

  beforeEach(inject($rootScope => rootScope = $rootScope));
  beforeEach(inject($q => angularQ = $q));

  beforeEach(
    () => labeledFrameGateway = new PouchDbLabeledFrameGateway(
      angularQ,
      packagingExecutor,
      pouchDbContextService,
      couchDbModelDeserializer,
      pouchDbViewService,
    )
  );

  it('should be able to instantiate', () => {
    expect(labeledFrameGateway).toEqual(jasmine.any(PouchDbLabeledFrameGateway));
  });

  describe('getLabeledFrame', () => {
    it('should use the packaging executor with the labeledFrame queue', () => {
      labeledFrameGateway.getLabeledFrame('TASK-ID', 42);
      rootScope.$apply();

      expect(packagingExecutor.execute).toHaveBeenCalledWith('labeledFrame', jasmine.any(Function));
    });

    it('should call the packaging executor once', () => {
      labeledFrameGateway.getLabeledFrame('TASK-ID', 42);
      rootScope.$apply();

      expect(packagingExecutor.execute).toHaveBeenCalledTimes(1);
    });

    it('should return the promise of the packaging executor', () => {
      const actualResult = labeledFrameGateway.getLabeledFrame('TASK-ID', 42);
      rootScope.$apply();

      const expectedResult = packagingExecutor.execute.calls.first().returnValue;
      expect(actualResult).toBe(expectedResult);
    });
  });
});
