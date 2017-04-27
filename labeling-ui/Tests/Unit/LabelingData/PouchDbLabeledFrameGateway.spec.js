import {inject} from 'angular-mocks';
import PouchDbLabeledFrameGateway from 'Application/LabelingData/Gateways/PouchDbLabeledFrameGateway';

import LabeledFrameCouchDbModel from 'Tests/Fixtures/Models/CouchDb/LabeledFrame';
import LabeledFrameFrontendDbModel from 'Tests/Fixtures/Models/Frontend/LabeledFrame';

fdescribe('PouchDbLabeledFrameGateway', () => {
  let rootScope;
  let angularQ;
  let packagingExecutor;
  let pouchDb;
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
  beforeEach(() => pouchDb = jasmine.createSpyObj('pouchDb', ['query']));
  beforeEach(() => {
    pouchDbContextService = jasmine.createSpyObj('pouchDbContextService', ['provideContextForTaskId'])
    pouchDbContextService.provideContextForTaskId.and.returnValue(pouchDb);
  });
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
    beforeEach(() => {
      pouchDb.query.and.returnValue({
        rows: [{
          doc: LabeledFrameCouchDbModel,
        }],
      });
    });

    beforeEach(() => {
      couchDbModelDeserializer.deserializeLabeledFrame.and.returnValue(
        LabeledFrameFrontendDbModel
      );
    });

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

    it('should use the context of the given taskId', () => {
      const givenTaskId = 'some-task-id-42';
      labeledFrameGateway.getLabeledFrame(givenTaskId, 42);
      rootScope.$apply();

      expect(pouchDbContextService.provideContextForTaskId).toHaveBeenCalledWith(givenTaskId);
    });

    it('should utilize the "labeledFrameByTaskIdAndFrameIndex" couchdb view through the view service', () => {
      labeledFrameGateway.getLabeledFrame('TASK-ID', 42);
      rootScope.$apply();

      expect(pouchDbViewService.getDesignDocumentViewName).toHaveBeenCalledWith('labeledFrameByTaskIdAndFrameIndex');
    });

    it('should query the view using the given taskId and frameIndex', () => {
      const givenTaskId = 'some-task-id-42';
      const givenFrameIndex = 423;
      labeledFrameGateway.getLabeledFrame(givenTaskId, givenFrameIndex);
      rootScope.$apply();

      expect(pouchDb.query).toHaveBeenCalled();

      const actualQueryOptionsObject = pouchDb.query.calls.argsFor(0)[1];
      expect(actualQueryOptionsObject.key).toEqual([givenTaskId, givenFrameIndex]);
    });

    it('should deserialize the received document', () => {
      labeledFrameGateway.getLabeledFrame('TASK-ID', 42);
      rootScope.$apply();

      expect(couchDbModelDeserializer.deserializeLabeledFrame).toHaveBeenCalledWith(LabeledFrameCouchDbModel);
    });

    it('should return the deserialized model labeledFrame model', () => {
      const actualResponse = labeledFrameGateway.getLabeledFrame('TASK-ID', 42);
      rootScope.$apply();
      const responsePromiseSpy = jasmine.createSpy();
      actualResponse.then(responsePromiseSpy);
      rootScope.$apply();
      expect(responsePromiseSpy).toHaveBeenCalledWith(LabeledFrameFrontendDbModel);
    });
  });
});
