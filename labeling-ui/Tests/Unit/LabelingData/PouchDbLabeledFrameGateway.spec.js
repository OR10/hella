import {inject} from 'angular-mocks';
import PouchDbLabeledFrameGateway from 'Application/LabelingData/Gateways/PouchDbLabeledFrameGateway';

import LabeledFrame from 'Application/LabelingData/Models/LabeledFrame';
import LabeledFrameCouchDbModel from 'Tests/Fixtures/Models/CouchDb/LabeledFrame';
import LabeledFrameFrontendModel from 'Tests/Fixtures/Models/Frontend/LabeledFrame';

describe('PouchDbLabeledFrameGateway', () => {
  let rootScope;
  let angularQ;
  let packagingExecutor;
  let pouchDb;
  let pouchDbContextService;
  let couchDbModelDeserializer;
  let couchDbModelSerializer;
  let pouchDbViewService;
  let revisionManager;
  let entityIdService;

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
  beforeEach(() => pouchDb = jasmine.createSpyObj('pouchDb', ['query', 'put', 'get', 'remove']));
  beforeEach(() => {
    pouchDbContextService = jasmine.createSpyObj('pouchDbContextService', ['provideContextForTaskId']);
    pouchDbContextService.provideContextForTaskId.and.returnValue(pouchDb);
  });
  beforeEach(() => couchDbModelDeserializer = jasmine.createSpyObj('couchDbModelDeserializer', ['deserializeLabeledFrame']));
  beforeEach(() => couchDbModelSerializer = jasmine.createSpyObj('couchDbModelSerializer', ['serialize']));
  beforeEach(() => pouchDbViewService = jasmine.createSpyObj('pouchDbViewService', ['getDesignDocumentViewName']));
  beforeEach(() => revisionManager = jasmine.createSpyObj('revisionManager', ['injectRevision', 'extractRevision']));
  beforeEach(() => entityIdService = jasmine.createSpyObj('entityIdService', ['getUniqueId']));

  beforeEach(inject($rootScope => rootScope = $rootScope));
  beforeEach(inject($q => angularQ = $q));

  beforeEach(
    () => labeledFrameGateway = new PouchDbLabeledFrameGateway(
      angularQ,
      packagingExecutor,
      pouchDbContextService,
      couchDbModelDeserializer,
      couchDbModelSerializer,
      pouchDbViewService,
      revisionManager,
      entityIdService
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
        LabeledFrameFrontendModel
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

    it('should extract the revision from the loaded document', () => {
      labeledFrameGateway.getLabeledFrame('TASK-ID', 42);
      rootScope.$apply();

      expect(revisionManager.extractRevision).toHaveBeenCalledWith(LabeledFrameCouchDbModel);
    });

    it('should return the deserialized model labeledFrame model', () => {
      const actualResponse = labeledFrameGateway.getLabeledFrame('TASK-ID', 42);
      rootScope.$apply();
      const responsePromiseSpy = jasmine.createSpy();
      actualResponse.then(responsePromiseSpy);
      rootScope.$apply();
      expect(responsePromiseSpy).toHaveBeenCalledWith(LabeledFrameFrontendModel);
    });
  });

  describe('saveLabeledFrame', () => {
    beforeEach(() => {
      pouchDb.put.and.callFake(
        document => angularQ.resolve({
          "ok": true,
          "id": document._id,
          "rev": "1-A6157A5EA545C99B00FF904EEF05FD9F"
        })
      );

      pouchDb.get.and.returnValue(
        angularQ.resolve(LabeledFrameCouchDbModel)
      );
    });

    beforeEach(() => {
      couchDbModelSerializer.serialize.and.returnValue(LabeledFrameCouchDbModel);
    });

    it('should use the packaging executor with the labeledFrame queue', () => {
      labeledFrameGateway.saveLabeledFrame('TASK-ID', 42, LabeledFrameFrontendModel);
      rootScope.$apply();

      expect(packagingExecutor.execute).toHaveBeenCalledWith('labeledFrame', jasmine.any(Function));
    });

    it('should call the packaging executor once', () => {
      labeledFrameGateway.saveLabeledFrame('TASK-ID', 42, LabeledFrameFrontendModel);
      rootScope.$apply();

      expect(packagingExecutor.execute).toHaveBeenCalledTimes(1);
    });

    it('should return the promise of the packaging executor', () => {
      const actualResult = labeledFrameGateway.saveLabeledFrame('TASK-ID', 42, LabeledFrameFrontendModel);
      rootScope.$apply();

      const expectedResult = packagingExecutor.execute.calls.first().returnValue;
      expect(actualResult).toBe(expectedResult);
    });

    it('should use the context of the given taskId', () => {
      const givenTaskId = 'some-task-id-42';
      labeledFrameGateway.saveLabeledFrame(givenTaskId, 42, LabeledFrameFrontendModel);
      rootScope.$apply();

      expect(pouchDbContextService.provideContextForTaskId).toHaveBeenCalledWith(givenTaskId);
    });

    it('should serialize the given document', () => {
      labeledFrameGateway.saveLabeledFrame('TASK-ID', 42, LabeledFrameFrontendModel);
      rootScope.$apply();

      expect(couchDbModelSerializer.serialize).toHaveBeenCalledWith(LabeledFrameFrontendModel);
    });

    it('should set the id before storage if it is not explicitly provided', () => {
      entityIdService.getUniqueId.and.returnValue('UNIQUE-ID');

      const labeledFrameWithoutId = new LabeledFrame({
        id: undefined,
        classes: ['foo', 'bar'],
        incomplete: true,
        taskId: 'TASK-ID',
        frameIndex: 42
      });
      couchDbModelSerializer.serialize.and.returnValue(labeledFrameWithoutId);

      labeledFrameGateway.saveLabeledFrame('TASK-ID', 42, LabeledFrameFrontendModel);
      rootScope.$apply();

      expect(entityIdService.getUniqueId).toHaveBeenCalled();
      const storedDocument = pouchDb.put.calls.argsFor(0)[0];
      expect(storedDocument._id).toEqual('UNIQUE-ID');
    });

    it('should store the serialized document', () => {
      couchDbModelSerializer.serialize.and.returnValue(LabeledFrameCouchDbModel);

      labeledFrameGateway.saveLabeledFrame('TASK-ID', 42, LabeledFrameFrontendModel);
      rootScope.$apply();

      expect(pouchDb.put).toHaveBeenCalledWith(LabeledFrameCouchDbModel);
    });

    it('should provide revisionManager with new revision after storage', () => {
      const putResponse = {
        'ok': true,
        'id': 'ec2ea67f3ff92d563b9e4bc1af019a04',
        'rev': '1-A6157A5EA545C99B00FF904EEF05FD9F',
      };

      pouchDb.put.and.returnValue(angularQ.resolve(putResponse));
      labeledFrameGateway.saveLabeledFrame('TASK-ID', 42, LabeledFrameFrontendModel);
      rootScope.$apply();

      expect(revisionManager.extractRevision).toHaveBeenCalledWith(putResponse);
    });

    it('should store new frameIndex', () => {
      labeledFrameGateway.saveLabeledFrame('TASK-ID', 423, LabeledFrameFrontendModel);
      rootScope.$apply();

      const storedDocument = pouchDb.put.calls.argsFor(0)[0];
      expect(storedDocument.frameIndex).toEqual(423);
    });

    it('should update and store labeledFrame', done => {
      const labeledFrame = new LabeledFrame({
        id: 'LT-ID',
        classes: ['foo', 'bar', 'baz'],
        incomplete: false,
        taskId: 'TASK-ID',
        frameIndex: 42
      });

      const serializedLabeledFrame = {
        "_id": "LT-ID",
        "type": "AppBundle.Model.LabeledFrame",
        "frameIndex": 42,
        "classes": [
          "foo",
          "bar",
          "baz",
        ],
        ghostClasses: null,
        "taskId": "TASK-ID",
        "incomplete": false
      };

      const updatedLabeledFrameDocument = {
        "_id": "LT-ID",
        "_rev": "1-abcdefgh",
        "type": "AppBundle.Model.LabeledFrame",
        "frameIndex": 42,
        "classes": [
          "foo",
          "bar",
          "baz",
        ],
        ghostClasses: null,
        "taskId": "TASK-ID",
        "incomplete": false
      };

      const expectedLabeledFrame = new LabeledFrame({
        id: 'LT-ID',
        classes: ['foo', 'bar', 'baz'],
        incomplete: false,
        taskId: 'TASK-ID',
        frameIndex: 42
      });

      couchDbModelSerializer.serialize.and.returnValue(serializedLabeledFrame);
      pouchDb.get.and.returnValue(angularQ.resolve(updatedLabeledFrameDocument));
      couchDbModelDeserializer.deserializeLabeledFrame.and.returnValue(expectedLabeledFrame);

      const returnPromise = labeledFrameGateway.saveLabeledFrame('TASK-ID', 42, labeledFrame);
      rootScope.$apply();

      expect(couchDbModelSerializer.serialize).toHaveBeenCalledWith(labeledFrame);
      expect(pouchDb.put).toHaveBeenCalledWith(serializedLabeledFrame);
      expect(pouchDb.get).toHaveBeenCalledWith('LT-ID');
      expect(couchDbModelDeserializer.deserializeLabeledFrame).toHaveBeenCalledWith(updatedLabeledFrameDocument);
      returnPromise.then(labeledFrame => {
        expect(labeledFrame).toBe(expectedLabeledFrame);
        done();
      });

      rootScope.$apply();
    });
  });

  describe('deleteLabeledFrame', () => {
    beforeEach(() => {
      pouchDb.query.and.returnValue({
        rows: [{
          doc: LabeledFrameCouchDbModel,
        }],
      });
    });

    beforeEach(() => {
      pouchDb.remove.and.returnValue(angularQ.resolve({
        "ok": true,
        "id": "mydoc",
        "rev": "2-9AF304BE281790604D1D8A4B0F4C9ADB"
      }));
    });

    it('should use the packaging executor with the labeledFrame queue', () => {
      labeledFrameGateway.deleteLabeledFrame('TASK-ID', 42);
      rootScope.$apply();

      expect(packagingExecutor.execute).toHaveBeenCalledWith('labeledFrame', jasmine.any(Function));
    });

    it('should call the packaging executor once', () => {
      labeledFrameGateway.deleteLabeledFrame('TASK-ID', 42);
      rootScope.$apply();

      expect(packagingExecutor.execute).toHaveBeenCalledTimes(1);
    });

    it('should return the promise of the packaging executor', () => {
      const actualResult = labeledFrameGateway.deleteLabeledFrame('TASK-ID', 42);
      rootScope.$apply();

      const expectedResult = packagingExecutor.execute.calls.first().returnValue;
      expect(actualResult).toBe(expectedResult);
    });

    it('should use the context of the given taskId', () => {
      const givenTaskId = 'some-task-id-42';
      labeledFrameGateway.deleteLabeledFrame(givenTaskId, 42);
      rootScope.$apply();

      expect(pouchDbContextService.provideContextForTaskId).toHaveBeenCalledWith(givenTaskId);
    });

    it('should utilize the "labeledFrameByTaskIdAndFrameIndex" couchdb view through the view service', () => {
      labeledFrameGateway.deleteLabeledFrame('TASK-ID', 42);
      rootScope.$apply();

      expect(pouchDbViewService.getDesignDocumentViewName).toHaveBeenCalledWith('labeledFrameByTaskIdAndFrameIndex');
    });

    it('should query the view using the given taskId and frameIndex', () => {
      const givenTaskId = 'some-task-id-42';
      const givenFrameIndex = 423;
      labeledFrameGateway.deleteLabeledFrame(givenTaskId, givenFrameIndex);
      rootScope.$apply();

      expect(pouchDb.query).toHaveBeenCalled();

      const actualQueryOptionsObject = pouchDb.query.calls.argsFor(0)[1];
      expect(actualQueryOptionsObject.key).toEqual([givenTaskId, givenFrameIndex]);
    });

    it('should remove document with retrieved labeledFrame id', () => {
      labeledFrameGateway.deleteLabeledFrame('TASK-ID', 42);
      rootScope.$apply();

      const removedId = pouchDb.remove.calls.argsFor(0)[0];
      expect(removedId).toEqual(LabeledFrameCouchDbModel._id);
    });

    it('should remove document with retrieved labeledFrame revision', () => {
      labeledFrameGateway.deleteLabeledFrame('TASK-ID', 42);
      rootScope.$apply();

      const removedRevision = pouchDb.remove.calls.argsFor(0)[1];
      expect(removedRevision).toEqual(LabeledFrameCouchDbModel._rev);
    });

    it('should work if requested document is not actually stored', done => {
      pouchDb.query.and.returnValue(angularQ.resolve({
        rows: [],
      }));

      const resultPromise = labeledFrameGateway.deleteLabeledFrame('TASK-ID', 42);
      rootScope.$apply();

      resultPromise.then(result => {
        expect(result).toBeTruthy();
        done();
      });
      rootScope.$apply();
    });
  });
});
