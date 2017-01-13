import 'jquery';
import {module, inject} from 'angular-mocks';
import _PouchDbLabeledThingInFrameGateway_ from 'Application/LabelingData/Gateways/PouchDbLabeledThingInFrameGateway';

import taskModel from 'Tests/Fixtures/Models/Frontend/Task';
import labeledThingInFrameModel from 'Tests/Fixtures/Models/Frontend/LabeledThingInFrame';
import labeledThingModel from 'Tests/Fixtures/Models/Frontend/LabeledThing';

import LabeledThing from 'Application/LabelingData/Models/LabeledThing';
import LabeledThingInFrame from 'Application/LabelingData/Models/LabeledThingInFrame';

xdescribe('PouchDbLabeledThingInFrameGateway', () => {
  let packagingExecutorMock;
  let storageContextMock;
  let pouchLabeledThingGatewayMock;
  let dbMock;
  let PouchDbLabeledThingInFrameGateway;
  let couchDbModelDeserializer;

  function createDbMock() {
    return {
      query: viewName => {
        if (viewName === 'annostation_labeled_thing_in_frame/by_taskId_frameIndex') {
          return;
        }
      },
    };
  }

  function createStorageContextMock() {
    return {
      provideContextForTaskId: () => {
        return dbMock;
      },
    };
  }

  function revisionManagerMock() {
    return {};
  }

  function createPackagingExecutorMock() {
    return {
      execute: () => {
        return new Promise(function foo(resolve) {
          const mockQuery = {
            rows: [{doc: labeledThingInFrameModel}],
          };
          resolve(JSON.parse(JSON.stringify(mockQuery)));
        });
      },
    };
  }

  function createDeserializerMock() {
    return {
      deserializeLabeledThingInFrame: (document, labeledThing) => {
        return new LabeledThingInFrame(Object.assign({}, document, {labeledThing}));
      },
    };
  }

  function createLabeledThingGateWayMock() {
    return {
      getLabeledThing: task => {
        const rawThing = JSON.parse(JSON.stringify(labeledThingModel));
        return new LabeledThing(Object.assign({}, rawThing, {task}));
      },
    };
  }

  beforeEach(module($provide => {
    dbMock = createDbMock();
    packagingExecutorMock = createPackagingExecutorMock();
    storageContextMock = createStorageContextMock();
    couchDbModelDeserializer = createDeserializerMock();
    pouchLabeledThingGatewayMock = createLabeledThingGateWayMock();

    spyOn(packagingExecutorMock, 'execute').and.callThrough();
    spyOn(storageContextMock, 'provideContextForTaskId').and.callThrough();
    spyOn(couchDbModelDeserializer, 'deserializeLabeledThingInFrame').and.callThrough();
    spyOn(pouchLabeledThingGatewayMock, 'getLabeledThing').and.callThrough();

    $provide.value('packagingExecutor', packagingExecutorMock);
    $provide.value('pouchDbContextService', storageContextMock);
    $provide.value('revisionManager', revisionManagerMock());
    $provide.value('couchDbModelSerializer', {});
    $provide.value('couchDbModelDeserializer', couchDbModelDeserializer);
    $provide.value('pouchLabeledThingGateway', pouchLabeledThingGatewayMock);
    $provide.value('abortablePromise', {});
  }));

  beforeEach(inject($injector => {
    PouchDbLabeledThingInFrameGateway = $injector.instantiate(_PouchDbLabeledThingInFrameGateway_);
  }));

  it('should be able to be instantiated', () => {
    expect(PouchDbLabeledThingInFrameGateway).toBeDefined();
  });

  describe('function listLabeledThingInFrame', () => {
    it('should be defined', () => {
      expect(PouchDbLabeledThingInFrameGateway.listLabeledThingInFrame).toBeDefined();
    });

    it('should utilize external services', () => {
      const task = taskModel;
      const gatewayPromise = PouchDbLabeledThingInFrameGateway.listLabeledThingInFrame(task, 0);
      gatewayPromise.then(result => {
        expect(packagingExecutorMock.execute).toHaveBeenCalled();
        expect(pouchLabeledThingGatewayMock.getLabeledThing).toHaveBeenCalled();
        expect(couchDbModelDeserializer.deserializeLabeledThingInFrame).toHaveBeenCalled();

        expect(result.id).toBe('d07235d9-92df-414d-a38a-694580ac7d6e');
        expect(typeof result).toBe('object');
      });
    });
  });

  describe('function getLabeledThingInFrame', () => {
    it('should be defined', () => {
      expect(PouchDbLabeledThingInFrameGateway.getLabeledThingInFrame).toBeDefined();
    });
  });

  describe('function getNextIncomplete', () => {
    it('should be defined', () => {
      expect(PouchDbLabeledThingInFrameGateway.getNextIncomplete).toBeDefined();
    });
  });

  describe('function saveLabeledThingInFrame', () => {
    it('should be defined', () => {
      expect(PouchDbLabeledThingInFrameGateway.saveLabeledThingInFrame).toBeDefined();
    });
  });
});
