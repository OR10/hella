import {inject} from 'angular-mocks';
import PouchDbLabeledFrameGateway from 'Application/LabelingData/Gateways/PouchDbLabeledFrameGateway';

import {cloneDeep} from 'lodash';

import LabeledFrame from 'Application/LabelingData/Models/LabeledFrame';
import Task from 'Application/Task/Model/Task';
import LabeledFrameCouchDbModel from 'Tests/Fixtures/Models/CouchDb/LabeledFrame';
import LabeledFrameFrontendModel from 'Tests/Fixtures/Models/Frontend/LabeledFrame';
import TaskFrontendModel from 'Tests/Fixtures/Models/Frontend/Task';

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

  let labeledFrameFrontendModel;
  let labeledFrameCouchDbModel;

  /**
   * @type {PouchDbLabeledFrameGateway}
   */
  let labeledFrameGateway;

  function createTask(id = 'TASK-ID') {
    return new Task(Object.assign({}, TaskFrontendModel.toJSON(), {id}));
  }

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

  beforeEach(() => {
    labeledFrameFrontendModel = new LabeledFrame(LabeledFrameFrontendModel.toJSON());
    labeledFrameCouchDbModel = cloneDeep(LabeledFrameCouchDbModel);
  });

  it('should be able to instantiate', () => {
    expect(labeledFrameGateway).toEqual(jasmine.any(PouchDbLabeledFrameGateway));
  });

  describe('getLabeledFrame', () => {
    beforeEach(() => {
      pouchDb.query.and.returnValue({
        rows: [{
          doc: labeledFrameCouchDbModel,
        }],
      });
    });

    beforeEach(() => {
      couchDbModelDeserializer.deserializeLabeledFrame.and.returnValue(
        labeledFrameFrontendModel
      );
    });

    it('should use the packaging executor with the labeledFrame queue', () => {
      labeledFrameGateway.getLabeledFrame(createTask(), 42);
      rootScope.$apply();

      expect(packagingExecutor.execute).toHaveBeenCalledWith('labeledFrame', jasmine.any(Function));
    });

    it('should call the packaging executor once', () => {
      labeledFrameGateway.getLabeledFrame(createTask(), 42);
      rootScope.$apply();

      expect(packagingExecutor.execute).toHaveBeenCalledTimes(1);
    });

    it('should return the promise of the packaging executor', () => {
      const actualResult = labeledFrameGateway.getLabeledFrame(createTask(), 42);
      rootScope.$apply();

      const expectedResult = packagingExecutor.execute.calls.first().returnValue;
      expect(actualResult).toBe(expectedResult);
    });

    it('should use the context of the given taskId', () => {
      const givenTaskId = 'some-task-id-42';
      labeledFrameGateway.getLabeledFrame(createTask(givenTaskId), 42);
      rootScope.$apply();

      expect(pouchDbContextService.provideContextForTaskId).toHaveBeenCalledWith(givenTaskId);
    });

    it('should utilize the labeledFrameByTaskIdAndFrameIndex couchdb view through the view service', () => {
      labeledFrameGateway.getLabeledFrame(createTask(), 42);
      rootScope.$apply();

      expect(pouchDbViewService.getDesignDocumentViewName).toHaveBeenCalledWith('labeledFrameByTaskIdAndFrameIndex');
    });

    it('should query the view starting at the given taskId and frameIndex', () => {
      const givenTaskId = 'some-task-id-42';
      const givenFrameIndex = 423;
      labeledFrameGateway.getLabeledFrame(createTask(givenTaskId), givenFrameIndex);
      rootScope.$apply();

      expect(pouchDb.query).toHaveBeenCalled();

      const actualQueryOptionsObject = pouchDb.query.calls.argsFor(0)[1];
      expect(actualQueryOptionsObject.startkey).toEqual([givenTaskId, givenFrameIndex]);
    });

    it('should query the view ending at the first frameIndex', () => {
      const givenTaskId = 'some-task-id';
      labeledFrameGateway.getLabeledFrame(createTask(givenTaskId), 42);
      rootScope.$apply();

      expect(pouchDb.query).toHaveBeenCalled();

      const actualQueryOptionsObject = pouchDb.query.calls.argsFor(0)[1];
      expect(actualQueryOptionsObject.endkey).toEqual([givenTaskId, 0]);
    });

    it('should query the view descending to map downwards to the beginning from the starting frame', () => {
      labeledFrameGateway.getLabeledFrame(createTask(), 42);
      rootScope.$apply();

      expect(pouchDb.query).toHaveBeenCalled();

      const actualQueryOptionsObject = pouchDb.query.calls.argsFor(0)[1];
      expect(actualQueryOptionsObject.descending).toBeTruthy();
    });

    it('should query the view with a limit of 1 document', () => {
      labeledFrameGateway.getLabeledFrame(createTask(), 42);
      rootScope.$apply();

      expect(pouchDb.query).toHaveBeenCalled();

      const actualQueryOptionsObject = pouchDb.query.calls.argsFor(0)[1];
      expect(actualQueryOptionsObject.limit).toEqual(1);
    });

    it('should deserialize the received document', () => {
      const givenTask = createTask();
      labeledFrameGateway.getLabeledFrame(givenTask, 42);
      rootScope.$apply();

      expect(couchDbModelDeserializer.deserializeLabeledFrame).toHaveBeenCalledWith(labeledFrameCouchDbModel, givenTask);
    });

    it('should extract the revision from the loaded document', () => {
      labeledFrameGateway.getLabeledFrame(createTask(), 42);
      rootScope.$apply();

      expect(revisionManager.extractRevision).toHaveBeenCalledWith(labeledFrameCouchDbModel);
    });

    it('should return the deserialized model labeledFrame model', () => {
      const actualResponse = labeledFrameGateway.getLabeledFrame(createTask(), 42);
      rootScope.$apply();
      const responsePromiseSpy = jasmine.createSpy();
      actualResponse.then(responsePromiseSpy);
      rootScope.$apply();
      expect(responsePromiseSpy).toHaveBeenCalledWith(labeledFrameFrontendModel);
    });

    it('should return the deserialized model labeledFrame model', () => {
      const actualResponse = labeledFrameGateway.getLabeledFrame(createTask(), 42);
      rootScope.$apply();
      const responsePromiseSpy = jasmine.createSpy();
      actualResponse.then(responsePromiseSpy);
      rootScope.$apply();
      expect(responsePromiseSpy).toHaveBeenCalledWith(labeledFrameFrontendModel);
    });

    it('should return a new empty LabeledFrame if nothing is stored in the database', () => {
      const newUniqueId = 'some-new-ultra-unique-id';
      const givenFrameIndex = 42;
      const givenTask = createTask('ultra-cool-task-id');

      const expectedLabeledFrame = new LabeledFrame({
        id: newUniqueId,
        frameIndex: givenFrameIndex,
        incomplete: true,
        task: givenTask,
        classes: [],
      });

      pouchDb.query.and.returnValue({
        rows: [],
      });

      entityIdService.getUniqueId.and.returnValue(newUniqueId);

      const actualResponse = labeledFrameGateway.getLabeledFrame(givenTask, givenFrameIndex);
      rootScope.$apply();
      const responsePromiseSpy = jasmine.createSpy();
      actualResponse.then(responsePromiseSpy);
      rootScope.$apply();

      const actualLabeledFrame = responsePromiseSpy.calls.argsFor(0)[0];

      expect(actualLabeledFrame).toEqual(expectedLabeledFrame);
    });

    it('should return the first found LabeledThing before the requested one with new id and adapted frameindex if requested one is not stored in the database', () => {
      const newUniqueId = 'some-new-ultra-unique-id';
      const givenFrameIndex = 42;
      const givenTaskId = 'ultra-cool-task-id';

      const expectedLabeledFrame = new LabeledFrame({
        id: newUniqueId,
        frameIndex: givenFrameIndex,
        incomplete: true,
        taskId: givenTaskId,
        classes: ['foo', 'bar'],
      });

      const foundDocumentInDb = {
        _id: 'some-other-id',
        _rev: '1-abcdefg',
        frameIndex: 9999,
        incomplete: false,
        taskId: givenTaskId,
        class: ['foo', 'bar'],
      };

      const modifiedDocument = {
        _id: newUniqueId,
        frameIndex: 42,
        incomplete: false,
        taskId: givenTaskId,
        class: ['foo', 'bar'],
      };

      pouchDb.query.and.returnValue({
        rows: [{
          doc: foundDocumentInDb,
        }],
      });

      entityIdService.getUniqueId.and.returnValue(newUniqueId);

      couchDbModelDeserializer.deserializeLabeledFrame.and.returnValue(expectedLabeledFrame);

      const actualResponse = labeledFrameGateway.getLabeledFrame(createTask(givenTaskId), givenFrameIndex);
      rootScope.$apply();
      const responsePromiseSpy = jasmine.createSpy();
      actualResponse.then(responsePromiseSpy);
      rootScope.$apply();

      const actualLabeledFrame = responsePromiseSpy.calls.argsFor(0)[0];

      expect(actualLabeledFrame).toEqual(expectedLabeledFrame);
      expect(couchDbModelDeserializer.deserializeLabeledFrame).toHaveBeenCalled();

      const deserializedDocument = couchDbModelDeserializer.deserializeLabeledFrame.calls.argsFor(0)[0];
      expect(deserializedDocument).toEqual(modifiedDocument);
    });
  });

  describe('saveLabeledFrame', () => {
    beforeEach(() => {
      pouchDb.put.and.callFake(
        document => angularQ.resolve({
          'ok': true,
          'id': document._id,
          'rev': '1-A6157A5EA545C99B00FF904EEF05FD9F',
        })
      );

      pouchDb.get.and.returnValue(
        angularQ.resolve(labeledFrameCouchDbModel)
      );
    });

    beforeEach(() => {
      couchDbModelSerializer.serialize.and.returnValue(labeledFrameCouchDbModel);
    });

    beforeEach(() => {
      pouchDb.query.and.returnValue({
        rows: [{
          doc: labeledFrameCouchDbModel,
        }],
      });
    });

    beforeEach(() => {
      couchDbModelDeserializer.deserializeLabeledFrame.and.returnValue(
        labeledFrameFrontendModel
      );
    });

    it('should use the packaging executor with the labeledFrame queue', () => {
      labeledFrameGateway.saveLabeledFrame(createTask(), 42, labeledFrameFrontendModel);
      rootScope.$apply();

      expect(packagingExecutor.execute).toHaveBeenCalledWith('labeledFrame', jasmine.any(Function));
    });

    it('should call the packaging executor once', () => {
      labeledFrameGateway.saveLabeledFrame(createTask(), 42, labeledFrameFrontendModel);
      rootScope.$apply();

      expect(packagingExecutor.execute).toHaveBeenCalledTimes(1);
    });

    it('should return the promise of the packaging executor', () => {
      const actualResult = labeledFrameGateway.saveLabeledFrame(createTask(), 42, labeledFrameFrontendModel);
      rootScope.$apply();

      const expectedResult = packagingExecutor.execute.calls.first().returnValue;
      expect(actualResult).toBe(expectedResult);
    });

    it('should use the context of the given taskId', () => {
      const givenTaskId = 'some-task-id-42';
      labeledFrameGateway.saveLabeledFrame(createTask(givenTaskId), 42, labeledFrameFrontendModel);
      rootScope.$apply();

      expect(pouchDbContextService.provideContextForTaskId).toHaveBeenCalledWith(givenTaskId);
    });

    it('should serialize the given document', () => {
      labeledFrameGateway.saveLabeledFrame(createTask(), 42, labeledFrameFrontendModel);
      rootScope.$apply();

      expect(couchDbModelSerializer.serialize).toHaveBeenCalledWith(labeledFrameFrontendModel);
    });

    it('should throw error if for some reason storing will be done without an ID', () => {
      const labeledFrameWithoutId = new LabeledFrame({
        id: undefined,
        classes: ['foo', 'bar'],
        incomplete: true,
        taskId: 'TASK-ID',
        frameIndex: 42,
      });
      couchDbModelSerializer.serialize.and.returnValue(labeledFrameWithoutId);

      function throwWrapper() {
        labeledFrameGateway.saveLabeledFrame(createTask('TASK-ID'), 42, labeledFrameFrontendModel);
        rootScope.$apply();
      }

      expect(throwWrapper).toThrowError('Labeled Frame is not as it should be');
    });

    it('should store the serialized document', () => {
      couchDbModelSerializer.serialize.and.returnValue(labeledFrameCouchDbModel);

      labeledFrameGateway.saveLabeledFrame(createTask('TASK-ID'), 42, labeledFrameFrontendModel);
      rootScope.$apply();

      expect(pouchDb.put).toHaveBeenCalledWith(labeledFrameCouchDbModel);
    });

    it('should provide revisionManager with new revision after storage', () => {
      const putResponse = {
        'ok': true,
        'id': 'ec2ea67f3ff92d563b9e4bc1af019a04',
        'rev': '1-A6157A5EA545C99B00FF904EEF05FD9F',
      };

      pouchDb.put.and.returnValue(angularQ.resolve(putResponse));
      labeledFrameGateway.saveLabeledFrame(createTask(), 42, labeledFrameFrontendModel);
      rootScope.$apply();

      expect(revisionManager.extractRevision).toHaveBeenCalledWith(putResponse);
    });

    it('should store new frameIndex and id', () => {
      const newUniqueId = 'some-generated-uuid';
      entityIdService.getUniqueId.and.returnValue(newUniqueId);
      couchDbModelSerializer.serialize.and.returnValue(labeledFrameCouchDbModel);
      labeledFrameGateway.saveLabeledFrame(createTask('TASK-ID'), 423, labeledFrameFrontendModel);
      rootScope.$apply();

      const storedDocument = pouchDb.put.calls.argsFor(0)[0];
      expect(storedDocument.frameIndex).toEqual(423);
      expect(storedDocument._id).toEqual(newUniqueId);
    });

    it('should update and store labeledFrame', done => {
      const givenTask = createTask('TASK-ID');
      const labeledFrame = new LabeledFrame({
        id: 'LT-ID',
        classes: ['foo', 'bar', 'baz'],
        incomplete: false,
        task: givenTask,
        frameIndex: 42,
      });

      const serializedLabeledFrame = {
        '_id': 'LT-ID',
        'type': 'AppBundle.Model.LabeledFrame',
        'frameIndex': 42,
        'classes': [
          'foo',
          'bar',
          'baz',
        ],
        ghostClasses: null,
        'taskId': 'TASK-ID',
        'incomplete': false,
      };

      const updatedLabeledFrameDocument = {
        '_id': 'LT-ID',
        '_rev': '1-abcdefgh',
        'type': 'AppBundle.Model.LabeledFrame',
        'frameIndex': 42,
        'classes': [
          'foo',
          'bar',
          'baz',
        ],
        ghostClasses: null,
        'taskId': 'TASK-ID',
        'incomplete': false,
      };

      const expectedLabeledFrame = new LabeledFrame({
        id: 'LT-ID',
        classes: ['foo', 'bar', 'baz'],
        incomplete: false,
        taskId: 'TASK-ID',
        frameIndex: 42,
      });

      couchDbModelSerializer.serialize.and.returnValue(serializedLabeledFrame);
      pouchDb.get.and.returnValue(angularQ.resolve(updatedLabeledFrameDocument));
      couchDbModelDeserializer.deserializeLabeledFrame.and.returnValue(expectedLabeledFrame);

      const returnPromise = labeledFrameGateway.saveLabeledFrame(givenTask, 42, labeledFrame);
      rootScope.$apply();

      expect(couchDbModelSerializer.serialize).toHaveBeenCalledWith(labeledFrame);
      expect(pouchDb.put).toHaveBeenCalledWith(serializedLabeledFrame);
      expect(pouchDb.get).toHaveBeenCalledWith('LT-ID');
      expect(couchDbModelDeserializer.deserializeLabeledFrame).toHaveBeenCalledWith(updatedLabeledFrameDocument, givenTask);
      returnPromise.then(actualLabeledFrame => {
        expect(actualLabeledFrame).toBe(expectedLabeledFrame);
        done();
      });

      rootScope.$apply();
    });
  });

  describe('deleteLabeledFrame', () => {
    beforeEach(() => {
      pouchDb.query.and.returnValue({
        rows: [{
          doc: labeledFrameCouchDbModel,
        }],
      });
    });

    beforeEach(() => {
      pouchDb.remove.and.returnValue(angularQ.resolve({
        'ok': true,
        'id': 'mydoc',
        'rev': '2-9AF304BE281790604D1D8A4B0F4C9ADB',
      }));
    });

    it('should use the packaging executor with the labeledFrame queue', () => {
      labeledFrameGateway.deleteLabeledFrame(createTask(), 42);
      rootScope.$apply();

      expect(packagingExecutor.execute).toHaveBeenCalledWith('labeledFrame', jasmine.any(Function));
    });

    it('should call the packaging executor once', () => {
      labeledFrameGateway.deleteLabeledFrame(createTask(), 42);
      rootScope.$apply();

      expect(packagingExecutor.execute).toHaveBeenCalledTimes(1);
    });

    it('should return the promise of the packaging executor', () => {
      const actualResult = labeledFrameGateway.deleteLabeledFrame(createTask(), 42);
      rootScope.$apply();

      const expectedResult = packagingExecutor.execute.calls.first().returnValue;
      expect(actualResult).toBe(expectedResult);
    });

    it('should use the context of the given taskId', () => {
      const givenTaskId = 'some-task-id-42';
      labeledFrameGateway.deleteLabeledFrame(createTask(givenTaskId), 42);
      rootScope.$apply();

      expect(pouchDbContextService.provideContextForTaskId).toHaveBeenCalledWith(givenTaskId);
    });

    it('should utilize the labeledFrameByTaskIdAndFrameIndex couchdb view through the view service', () => {
      labeledFrameGateway.deleteLabeledFrame(createTask(), 42);
      rootScope.$apply();

      expect(pouchDbViewService.getDesignDocumentViewName).toHaveBeenCalledWith('labeledFrameByTaskIdAndFrameIndex');
    });

    it('should query the view using the given taskId and frameIndex', () => {
      const givenTaskId = 'some-task-id-42';
      const givenFrameIndex = 423;
      labeledFrameGateway.deleteLabeledFrame(createTask(givenTaskId), givenFrameIndex);
      rootScope.$apply();

      expect(pouchDb.query).toHaveBeenCalled();

      const actualQueryOptionsObject = pouchDb.query.calls.argsFor(0)[1];
      expect(actualQueryOptionsObject.key).toEqual([givenTaskId, givenFrameIndex]);
    });

    it('should remove document with retrieved labeledFrame id', () => {
      labeledFrameGateway.deleteLabeledFrame(createTask(), 42);
      rootScope.$apply();

      const removedId = pouchDb.remove.calls.argsFor(0)[0];
      expect(removedId).toEqual(labeledFrameCouchDbModel._id);
    });

    it('should remove document with retrieved labeledFrame revision', () => {
      labeledFrameGateway.deleteLabeledFrame(createTask(), 42);
      rootScope.$apply();

      const removedRevision = pouchDb.remove.calls.argsFor(0)[1];
      expect(removedRevision).toEqual(labeledFrameCouchDbModel._rev);
    });

    it('should work if requested document is not actually stored', done => {
      pouchDb.query.and.returnValue(angularQ.resolve({
        rows: [],
      }));

      const resultPromise = labeledFrameGateway.deleteLabeledFrame(createTask(), 42);
      rootScope.$apply();

      resultPromise.then(result => {
        expect(result).toBeTruthy();
        done();
      });
      rootScope.$apply();
    });
  });
});
