import 'jquery';
import angular from 'angular';
import {inject, module} from 'angular-mocks';
import {cloneDeep} from 'lodash';

import Common from 'Application/Common/Common';

import LabeledThingGroup from 'Application/LabelingData/Models/LabeledThingGroup';

import LabeledThingGroupGateway from 'Application/LabelingData/Gateways/LabeledThingGroupGateway';

import Task from 'Application/Task/Model/Task';
import TaskFrontendModel from 'Tests/Fixtures/Models/Frontend/Task';

import labeledThingGroupFixture from 'Tests/Fixtures/Models/Frontend/LabeledThingGroup';
import labeledThingGroupDocumentFixture from 'Tests/Fixtures/Models/CouchDb/LabeledThingGroup';
import labeledThingGroupInFrameFixture from 'Tests/Fixtures/Models/Frontend/LabeledThingGroupInFrame';
import labeledThingGroupInFrameTwoFixture from 'Tests/Fixtures/Models/Frontend/LabeledThingGroupInFrameTwo';
import labeledThingGroupInFrameDocumentFixture from 'Tests/Fixtures/Models/CouchDb/LabeledThingGroupInFrame';
import labeledThingGroupInFrameDocumentTwoFixture from 'Tests/Fixtures/Models/CouchDb/LabeledThingGroupInFrameTwo';

describe('LabeledThingGroupGateway', () => {
  /**
   * @param {LabeledThingGroupGateway}
   */
  let groupGateway;
  /**
   * @param {LabeledThingGateway}
   */
  let pouchDbContext;
  let $rootScope;
  let $q;
  let labeledThingGroupResponse;
  let queryResponse;
  let couchDbModelDeserializer;
  let couchDbModelSerializer;
  let packagingExecutor;
  let revisionManager;
  let pouchDbViewService;
  let ghostingServiceMock;

  let labeledThingGroup;
  let labeledThingGroupDocument;
  let labeledThingGroupInFrame;
  let labeledThingGroupInFrameTwo;
  let labeledThingGroupInFrameDocument;
  let labeledThingGroupInFrameTwoDocument;

  function createTask(id = 'TASK-ID') {
    return new Task(Object.assign({}, TaskFrontendModel.toJSON(), {id}));
  }

  beforeEach(() => {
    labeledThingGroup = labeledThingGroupFixture.clone();
    labeledThingGroupDocument = cloneDeep(labeledThingGroupDocumentFixture);
    labeledThingGroupInFrame = labeledThingGroupInFrameFixture.clone();
    labeledThingGroupInFrameTwo = labeledThingGroupInFrameTwoFixture.clone();
    labeledThingGroupInFrameDocument = cloneDeep(labeledThingGroupInFrameDocumentFixture);
    labeledThingGroupInFrameTwoDocument = cloneDeep(labeledThingGroupInFrameDocumentTwoFixture);
  });

  beforeEach(() => {
    const featureFlags = {};

    queryResponse = {
      'total_rows': 0,
      'offset': 0,
      'rows': [],
    };

    labeledThingGroupResponse = {
      '_id': 'e2c029002f1375ec4c10f55d4b2e71c9',
      '_rev': '1-579bff7e19f986e0dfab7a58fe7362dd',
      'type': 'AnnoStationBundle.Model.LabeledThingGroup',
      'identifierName': 'extension-sign-group',
      'lineColor': '15',
      'groupIds': null,
      'classes': [],
      'incomplete': true,
      'taskId': 'TASK-ID',
    };

    const commonModule = new Common();
    commonModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.Common');

    pouchDbContext = jasmine.createSpyObj('pouchDbContext', ['query', 'get', 'remove', 'put', 'allDocs', 'bulkDocs']);
    ghostingServiceMock = jasmine.createSpyObj(
      'GhostingService',
      ['calculateClassGhostsForLabeledThingGroupsAndFrameIndex']
    );

    pouchDbContext.query.and.callFake(() => {
      const deferred = $q.defer();
      deferred.resolve(queryResponse);
      return deferred.promise;
    });

    pouchDbContext.get.and.callFake(() => {
      const deferred = $q.defer();
      deferred.resolve(labeledThingGroupResponse);
      return deferred.promise;
    });

    pouchDbContext.remove.and.callFake(() => {
      const deferred = $q.defer();
      deferred.resolve({ok: true});
      return deferred.promise;
    });

    pouchDbContext.put.and.callFake(() => {
      const deferred = $q.defer();
      deferred.resolve({id: 'PUT-LABELED-THING-GROUP-ID'});
      return deferred.promise;
    });

    module($provide => {
      const pouchDbContextServiceMock = jasmine.createSpyObj('storageContextService', ['provideContextForTaskId']);
      pouchDbContextServiceMock.provideContextForTaskId.and.returnValue(pouchDbContext);

      $provide.value('pouchDbContextService', pouchDbContextServiceMock);
      $provide.value('ghostingService', ghostingServiceMock);
    });

    inject($injector => {
      $q = $injector.get('$q');
      $rootScope = $injector.get('$rootScope');
      couchDbModelDeserializer = $injector.get('couchDbModelDeserializer');
      couchDbModelSerializer = $injector.get('couchDbModelSerializer');
      packagingExecutor = $injector.get('packagingExecutor');
      revisionManager = $injector.get('revisionManager');
      pouchDbViewService = $injector.get('pouchDbViewService');
      groupGateway = $injector.instantiate(LabeledThingGroupGateway);
    });
  });

  beforeEach(() => {
    pouchDbContext.allDocs.and.returnValue(
      $q.resolve({
        'offset': 0,
        'total_rows': 0,
        'rows': [],
      })
    );

    pouchDbContext.bulkDocs.and.returnValue($q.resolve([]));
  });

  describe('getLabeledThingGroupsInFrameForFrameIndex', () => {
    beforeEach(() => {
      queryResponse = {
        'total_rows': 6,
        'offset': 0,
        'rows': [
          {
            'id': '60950e57-5e93-4f7f-9196-6821eaaa74d3',
            'key': ['e2c029002f1375ec4c10f55d4b2618c3', 0],
            'value': 'e2c029002f1375ec4c10f55d4b2e71c9',
          },
          {
            'id': '32dd14b4-12c4-4888-b60b-53afcc49de5f',
            'key': ['e2c029002f1375ec4c10f55d4b2618c3', 4],
            'value': 'e2c029002f1375ec4c10f55d4b2e71c9',
          },
        ],
      };
    });

    it('should return promise', () => {
      const task = createTask();
      const frameIndex = 0;

      const returnValue = groupGateway.getLabeledThingGroupsInFrameForFrameIndex(task, frameIndex);

      expect(returnValue.then).toEqual(jasmine.any(Function));
    });

    it('should utilize packaging executor', () => {
      const task = createTask();
      const frameIndex = 0;

      spyOn(packagingExecutor, 'execute').and.callThrough();

      groupGateway.getLabeledThingGroupsInFrameForFrameIndex(task, frameIndex);

      $rootScope.$apply();

      expect(packagingExecutor.execute).toHaveBeenCalled();
    });

    it('should return packaging executor provided promise', () => {
      const task = createTask();
      const frameIndex = 0;

      spyOn(packagingExecutor, 'execute').and.callThrough();

      const returnValue = groupGateway.getLabeledThingGroupsInFrameForFrameIndex(task, frameIndex);

      $rootScope.$apply();

      expect(returnValue).toBe(
        packagingExecutor.execute.calls.mostRecent().returnValue
      );
    });

    it('should request LTGs for the given frame and load their documents', () => {
      const task = createTask();
      const frameIndex = 0;

      groupGateway.getLabeledThingGroupsInFrameForFrameIndex(task, frameIndex);

      $rootScope.$apply();

      expect(pouchDbContext.query).toHaveBeenCalledWith(
        'labeledThingGroupOnFrameByTaskIdAndFrameIndex',
        {
          key: [task.id, frameIndex],
        }
      );

      expect(pouchDbContext.get).toHaveBeenCalledWith(labeledThingGroupResponse._id);
    });

    it('should request LTGs only once even though the view returns the ids multiple times', () => {
      const task = createTask();
      const frameIndex = 0;

      groupGateway.getLabeledThingGroupsInFrameForFrameIndex(task, frameIndex);

      $rootScope.$apply();

      expect(pouchDbContext.get).toHaveBeenCalledTimes(1);
    });

    it('should deserialize loaded LTGs', () => {
      const task = createTask();
      const frameIndex = 0;

      spyOn(couchDbModelDeserializer, 'deserializeLabeledThingGroup').and.callThrough();

      groupGateway.getLabeledThingGroupsInFrameForFrameIndex(task, frameIndex);

      $rootScope.$apply();

      expect(couchDbModelDeserializer.deserializeLabeledThingGroup).toHaveBeenCalledWith(
        labeledThingGroupResponse,
        task
      );
    });

    it('should feed the revision manager with loaded LTGs revision', () => {
      const task = createTask();
      const frameIndex = 0;

      spyOn(revisionManager, 'extractRevision').and.callThrough();

      groupGateway.getLabeledThingGroupsInFrameForFrameIndex(task, frameIndex);

      $rootScope.$apply();

      expect(revisionManager.extractRevision).toHaveBeenCalledWith(
        labeledThingGroupResponse
      );
    });

    it('should pump loaded LTGs into ghostingService', () => {
      const task = createTask();
      const frameIndex = 0;

      spyOn(couchDbModelDeserializer, 'deserializeLabeledThingGroup').and.callThrough();

      groupGateway.getLabeledThingGroupsInFrameForFrameIndex(task, frameIndex);

      $rootScope.$apply();

      expect(ghostingServiceMock.calculateClassGhostsForLabeledThingGroupsAndFrameIndex).toHaveBeenCalledWith(
        [couchDbModelDeserializer.deserializeLabeledThingGroup.calls.mostRecent().returnValue],
        frameIndex
      );
    });

    it('should pass through the results provided by the ghosting service', () => {
      const task = createTask();
      const frameIndex = 0;

      const expectedLabeledThingGroupInFrames = [
        labeledThingGroupInFrame,
        labeledThingGroupInFrameTwo,
      ];

      ghostingServiceMock.calculateClassGhostsForLabeledThingGroupsAndFrameIndex.and.returnValue(
        $q.resolve(expectedLabeledThingGroupInFrames)
      );

      const returnValue = groupGateway.getLabeledThingGroupsInFrameForFrameIndex(task, frameIndex);
      const returnValueSpy = jasmine.createSpy('returnValue resolved');
      returnValue.then(returnValueSpy);

      $rootScope.$apply();

      expect(returnValueSpy).toHaveBeenCalledWith(expectedLabeledThingGroupInFrames);
    });

    it('should reject if LTG on frame query fails', () => {
      const task = createTask();
      const frameIndex = 0;

      const error = 'Listen up, Jennis, Denise, Tiffany, Whitney, Houston!';

      pouchDbContext.query.and.returnValue(
        $q.reject(error)
      );

      const returnValue = groupGateway.getLabeledThingGroupsInFrameForFrameIndex(task, frameIndex);
      const returnValueSpy = jasmine.createSpy('returnValue rejected');
      returnValue.catch(returnValueSpy);

      $rootScope.$apply();

      expect(returnValueSpy).toHaveBeenCalledWith(error);
    });

    it('should reject if get of specific LTG fails', () => {
      const task = createTask();
      const frameIndex = 0;

      const error = 'Shall be lifted—nevermore!';

      pouchDbContext.get.and.returnValue(
        $q.reject(error)
      );

      const returnValue = groupGateway.getLabeledThingGroupsInFrameForFrameIndex(task, frameIndex);
      const returnValueSpy = jasmine.createSpy('returnValue rejected');
      returnValue.catch(returnValueSpy);

      $rootScope.$apply();

      expect(returnValueSpy).toHaveBeenCalledWith(error);
    });
  });

  describe('getLabeledThingGroupsByIds', () => {
    let task;
    let ids;
    let deserializedLabeledThingGroup;

    beforeEach(() => {
      task = createTask();

      ids = [
        'id-1',
        'id-2',
        'id-3',
      ];

      labeledThingGroupDocument = {
        _id: '3224971765fa4f728ea25009576db0bc',
        _rev: '1-5c6dbbf287f44c5f92420ff4c3e5d59d',
        projectId: '1ddd13ede9a21be5a63943362a015487',
        taskId: '1ddd13ede9a21be5a63943362a04382b',
        identifierName: 'lights-group',
        lineColor: '10',
        type: 'AnnoStationBundle.Model.LabeledThingGroup',
        groupIds: [],
      };

      pouchDbContext.allDocs.and.returnValue($q.resolve({
        offset: 0,
        total_rows: 1,
        rows: [{
          doc: labeledThingGroupDocument,
        }],
      }));

      deserializedLabeledThingGroup = new LabeledThingGroup(
        Object.assign({}, labeledThingGroupDocument, {id: labeledThingGroupDocument._id}, {task})
      );
    });

    it('should fetch labeledThingGroups from pouchdb by list of ids', () => {
      groupGateway.getLabeledThingGroupsByIds(task, ids);
      $rootScope.$apply();

      expect(pouchDbContext.allDocs).toHaveBeenCalledWith({
        include_docs: true,
        keys: ids,
      });
    });


    it('should deserialize fetched labeledThingGroups by list of ids', () => {
      spyOn(couchDbModelDeserializer, 'deserializeLabeledThingGroup').and.callThrough();

      groupGateway.getLabeledThingGroupsByIds(task, ids);
      $rootScope.$apply();

      expect(couchDbModelDeserializer.deserializeLabeledThingGroup).toHaveBeenCalledWith(
        labeledThingGroupDocument,
        task
      );
    });

    it('should return deserialized labeledThingGroups by list of ids', () => {
      const resultPromise = groupGateway.getLabeledThingGroupsByIds(task, ids);
      const resultSpy = jasmine.createSpy('resultPromise resolved');
      resultPromise.then(resultSpy);
      $rootScope.$apply();

      expect(resultSpy).toHaveBeenCalledWith([deserializedLabeledThingGroup]);
    });

    it('should fail if a requested id is missing', () => {
      pouchDbContext.allDocs.and.returnValue($q.resolve({
        offset: 0,
        total_rows: 2,
        rows: [
          {
            id: '3224971765fa4f728ea25009576db0bc',
            key: '3224971765fa4f728ea25009576db0bc',
            value: {
              rev: '1-5c6dbbf287f44c5f92420ff4c3e5d59d',
            },
            doc: labeledThingGroupDocument,
          },
          {
            id: '123456',
            error: 'not_found',
          },
        ],
      }));

      const resultPromise = groupGateway.getLabeledThingGroupsByIds(task, ids);
      const resultSpy = jasmine.createSpy('resultPromise rejected');
      resultPromise.catch(resultSpy);
      $rootScope.$apply();

      expect(resultSpy).toHaveBeenCalledWith(jasmine.any(Error));
    });

    it('should fail if a requested id is deleted', () => {
      pouchDbContext.allDocs.and.returnValue($q.resolve({
        offset: 0,
        total_rows: 2,
        rows: [
          {
            id: '3224971765fa4f728ea25009576db0bc',
            key: '3224971765fa4f728ea25009576db0bc',
            value: {
              rev: '1-5c6dbbf287f44c5f92420ff4c3e5d59d',
            },
            doc: labeledThingGroupDocument,
          },
          {
            id: '123456',
            deleted: true,
          },
        ],
      }));

      const resultPromise = groupGateway.getLabeledThingGroupsByIds(task, ids);
      const resultSpy = jasmine.createSpy('resultPromise rejected');
      resultPromise.catch(resultSpy);
      $rootScope.$apply();

      expect(resultSpy).toHaveBeenCalledWith(jasmine.any(Error));
    });
  });

  it('should delete a labeled thing group', () => {
    const task = createTask();

    const labeledThingGroupToDelete = new LabeledThingGroup({
      task,
      id: 'LABELED-THING-GROUP-ID',
      identifierName: 'extension-sign-group',
      lineColor: 1,
      groupIds: [],
      classes: [],
      incomplete: true,
      createdAt: '2017-09-05 16:11:56.000000',
      lastModifiedAt: '2017-09-05 16:11:56.000000',
    });
    spyOn(labeledThingGroupToDelete, '_getCurrentDate').and.returnValue('2017-09-05 16:11:56.000000');


    const serializedGroup = {
      _id: 'LABELED-THING-GROUP-ID',
      identifierName: 'extension-sign-group',
      lineColor: 1,
      groupIds: [],
      type: 'AnnoStationBundle.Model.LabeledThingGroup',
      classes: [],
      incomplete: true,
      createdAt: '2017-09-05 16:11:56.000000',
      lastModifiedAt: '2017-09-05 16:11:56.000000',
      taskId: task.id,
      projectId: task.projectId,
    };

    groupGateway.deleteLabeledThingGroup(labeledThingGroupToDelete);

    $rootScope.$apply();

    expect(pouchDbContext.remove)
      .toHaveBeenCalledWith(serializedGroup);
  });

  it('should create a labeled thing group', () => {
    spyOn(couchDbModelDeserializer, 'deserializeLabeledThingGroup').and.callThrough();

    const task = createTask();

    const labeledThingGroupToCreate = new LabeledThingGroup({
      task,
      id: 'LABELED-THING-GROUP-ID',
      identifierName: 'extension-sign-group',
      lineColor: 1,
      groupIds: [],
      classes: [],
      incomplete: true,
      createdAt: '2017-09-05 16:11:56.000000',
      lastModifiedAt: '2017-09-05 16:11:56.000000',
    });
    spyOn(labeledThingGroupToCreate, '_getCurrentDate').and.returnValue('2017-09-05 16:11:56.000000');

    const serializedGroup = {
      _id: 'LABELED-THING-GROUP-ID',
      identifierName: 'extension-sign-group',
      lineColor: 1,
      groupIds: [],
      type: 'AnnoStationBundle.Model.LabeledThingGroup',
      classes: [],
      incomplete: true,
      taskId: task.id,
      projectId: task.projectId,
      createdAt: '2017-09-05 16:11:56.000000',
      lastModifiedAt: '2017-09-05 16:11:56.000000',
    };

    groupGateway.createLabeledThingGroup(task, labeledThingGroupToCreate);

    $rootScope.$apply();

    expect(pouchDbContext.put).toHaveBeenCalledWith(serializedGroup);
    expect(pouchDbContext.get).toHaveBeenCalledWith('PUT-LABELED-THING-GROUP-ID');
    expect(couchDbModelDeserializer.deserializeLabeledThingGroup).toHaveBeenCalledWith(labeledThingGroupResponse, task);
  });

  describe('deleteLabeledThingGroup', () => {
    beforeEach(() => {
      pouchDbContext.query.and.returnValue($q.resolve({
        rows: [],
      }));
    });

    it('should return a promise', () => {
      const returnValue = groupGateway.deleteLabeledThingGroup(labeledThingGroup);
      expect(returnValue.then).toEqual(jasmine.any(Function));
    });

    it('should utilize the packaging exeuctor', () => {
      spyOn(packagingExecutor, 'execute');
      const returnValue = groupGateway.deleteLabeledThingGroup(labeledThingGroup);

      expect(packagingExecutor.execute).toHaveBeenCalled();
      expect(returnValue).toBe(
        packagingExecutor.execute.calls.mostRecent().returnValue
      );
    });

    it('should use the serializer to retrieve the document to remove', () => {
      spyOn(labeledThingGroup, '_getCurrentDate').and.returnValue('2017-09-05 16:11:56.000000');
      spyOn(revisionManager, 'injectRevision').and.callFake(
        document => document._rev = labeledThingGroupDocument._rev
      );
      spyOn(couchDbModelSerializer, 'serialize');

      groupGateway.deleteLabeledThingGroup(labeledThingGroup);

      $rootScope.$apply();

      expect(couchDbModelSerializer.serialize).toHaveBeenCalledWith(labeledThingGroup);
    });

    it('should inject and use the known revision of the document', () => {
      const revision = '42-TheAnswerToTheUniverseLifeAndEverythingElse';

      spyOn(labeledThingGroup, '_getCurrentDate').and.returnValue('2017-09-05 16:11:56.000000');
      spyOn(revisionManager, 'injectRevision').and.callFake(
        document => document._rev = revision
      );
      spyOn(couchDbModelSerializer, 'serialize').and.callThrough();

      groupGateway.deleteLabeledThingGroup(labeledThingGroup);

      $rootScope.$apply();

      expect(revisionManager.injectRevision).toHaveBeenCalledWith(
        couchDbModelSerializer.serialize.calls.mostRecent().returnValue
      );

      expect(pouchDbContext.remove.calls.mostRecent().args[0]._rev).toEqual(revision);
    });

    it('should delete the corresponding labeled thing group', () => {
      spyOn(labeledThingGroup, '_getCurrentDate').and.returnValue('2017-09-05 16:11:56.000000');
      spyOn(revisionManager, 'injectRevision').and.callFake(
        document => document._rev = labeledThingGroupDocument._rev
      );
      groupGateway.deleteLabeledThingGroup(labeledThingGroup);

      $rootScope.$apply();

      expect(pouchDbContext.remove)
        .toHaveBeenCalledWith(labeledThingGroupDocumentFixture);
    });

    it('should resolve returned promise once deletion is complete', () => {
      const deferred = $q.defer();
      pouchDbContext.remove.and.returnValue(deferred.promise);

      const returnValue = groupGateway.deleteLabeledThingGroup(labeledThingGroup);
      const returnValuePromise = jasmine.createSpy('returnValue resolved');
      returnValue.then(returnValuePromise);

      $rootScope.$apply();

      expect(returnValuePromise).not.toHaveBeenCalled();
      deferred.resolve({ok: true});

      $rootScope.$apply();

      expect(returnValuePromise).toHaveBeenCalled();
    });

    it('should reject returned promise if deletion could not be executed correctly', () => {
      const deferred = $q.defer();
      pouchDbContext.remove.and.returnValue(deferred.promise);

      const returnValue = groupGateway.deleteLabeledThingGroup(labeledThingGroup);
      const returnValuePromise = jasmine.createSpy('returnValue rejected');
      returnValue.catch(returnValuePromise);

      $rootScope.$apply();

      expect(returnValuePromise).not.toHaveBeenCalled();
      deferred.resolve({ok: false, error: 'The most gruesome thing just occured!'});

      $rootScope.$apply();

      expect(returnValuePromise).toHaveBeenCalled();
    });

    it('should reject returned promise if deletion went horribly wrong', () => {
      const deferred = $q.defer();
      pouchDbContext.remove.and.returnValue(deferred.promise);

      const returnValue = groupGateway.deleteLabeledThingGroup(labeledThingGroup);
      const returnValuePromise = jasmine.createSpy('returnValue rejected');
      returnValue.catch(returnValuePromise);

      $rootScope.$apply();

      expect(returnValuePromise).not.toHaveBeenCalled();
      deferred.reject({ok: false, error: 'Some error'});

      $rootScope.$apply();

      expect(returnValuePromise).toHaveBeenCalled();
    });

    it('should reject returned promise if deletion horribly went wrong', () => {
      const deferred = $q.defer();
      pouchDbContext.remove.and.returnValue(deferred.promise);

      const returnValue = groupGateway.deleteLabeledThingGroup(labeledThingGroup);
      const returnValuePromise = jasmine.createSpy('returnValue rejected');
      returnValue.catch(returnValuePromise);

      $rootScope.$apply();

      expect(returnValuePromise).not.toHaveBeenCalled();
      deferred.reject({ok: false, error: 'Some error'});

      $rootScope.$apply();

      expect(returnValuePromise).toHaveBeenCalled();
    });

    it('should request associated ltgifs for given lt', () => {
      groupGateway.deleteLabeledThingGroup(labeledThingGroup);
      $rootScope.$apply();

      expect(pouchDbContext.query).toHaveBeenCalledWith(
        'labeledThingGroupInFrameByLabeledThingGroupIdAndFrameIndex',
        {
          include_docs: true,
          startkey: [labeledThingGroup.id, 0],
          endkey: [labeledThingGroup.id, {}],
        }
      );
    });

    it('should remove associated ltgifs for given lt using bulk operation', () => {
      pouchDbContext.query.and.returnValue($q.resolve({
        rows: [
          {doc: labeledThingGroupInFrameDocument},
          {doc: labeledThingGroupInFrameTwoDocument},
        ],
      }));

      const expectedBulkActions = [
        {
          _id: labeledThingGroupInFrameDocument._id,
          _rev: labeledThingGroupInFrameDocument._rev,
          _deleted: true,
        },
        {
          _id: labeledThingGroupInFrameTwoDocument._id,
          _rev: labeledThingGroupInFrameTwoDocument._rev,
          _deleted: true,
        },
      ];

      revisionManager.updateRevision(labeledThingGroupInFrameDocument._id, labeledThingGroupInFrameDocument._rev);
      revisionManager.updateRevision(labeledThingGroupInFrameTwoDocument._id, labeledThingGroupInFrameTwoDocument._rev);

      groupGateway.deleteLabeledThingGroup(labeledThingGroup);
      $rootScope.$apply();

      expect(pouchDbContext.bulkDocs).toHaveBeenCalledWith(
        expectedBulkActions
      );
    });

    it('should remove associated ltgifs for before removing ltg', () => {
      pouchDbContext.query.and.returnValue($q.resolve({
        rows: [
          {doc: labeledThingGroupInFrameDocument},
          {doc: labeledThingGroupInFrameTwoDocument},
        ],
      }));

      revisionManager.updateRevision(labeledThingGroupInFrameDocument._id, labeledThingGroupInFrameDocument._rev);
      revisionManager.updateRevision(labeledThingGroupInFrameTwoDocument._id, labeledThingGroupInFrameTwoDocument._rev);

      const bulkDocsDeferred = $q.defer();
      pouchDbContext.bulkDocs.and.returnValue(bulkDocsDeferred.promise);

      groupGateway.deleteLabeledThingGroup(labeledThingGroup);
      $rootScope.$apply();

      expect(pouchDbContext.bulkDocs).toHaveBeenCalled();
      expect(pouchDbContext.remove).not.toHaveBeenCalled();

      bulkDocsDeferred.resolve([]);

      $rootScope.$apply();

      expect(pouchDbContext.remove).toHaveBeenCalled();
    });

    it('should not remove ltg if removal of ltgifs failed catastrophically', () => {
      pouchDbContext.query.and.returnValue($q.resolve({
        rows: [
          {doc: labeledThingGroupInFrameDocument},
          {doc: labeledThingGroupInFrameTwoDocument},
        ],
      }));

      revisionManager.updateRevision(labeledThingGroupInFrameDocument._id, labeledThingGroupInFrameDocument._rev);
      revisionManager.updateRevision(labeledThingGroupInFrameTwoDocument._id, labeledThingGroupInFrameTwoDocument._rev);

      const bulkDocsDeferred = $q.defer();
      pouchDbContext.bulkDocs.and.returnValue(bulkDocsDeferred.promise);

      const error = '!noisnemid rorrim a ni ma I ,on hO';

      groupGateway.deleteLabeledThingGroup(labeledThingGroup);
      $rootScope.$apply();

      expect(pouchDbContext.bulkDocs).toHaveBeenCalled();

      bulkDocsDeferred.reject(error);

      $rootScope.$apply();

      expect(pouchDbContext.remove).not.toHaveBeenCalled();
    });

    it('should not remove ltg if one of the ltgif removals failed', () => {
      pouchDbContext.query.and.returnValue($q.resolve({
        rows: [
          {doc: labeledThingGroupInFrameDocument},
          {doc: labeledThingGroupInFrameTwoDocument},
        ],
      }));

      revisionManager.updateRevision(labeledThingGroupInFrameDocument._id, labeledThingGroupInFrameDocument._rev);
      revisionManager.updateRevision(labeledThingGroupInFrameTwoDocument._id, labeledThingGroupInFrameTwoDocument._rev);

      const bulkDocsDeferred = $q.defer();
      pouchDbContext.bulkDocs.and.returnValue(bulkDocsDeferred.promise);

      const error = '¡uʍop ǝpᴉsdn sᴉ ƃuᴉɥʇʎɹǝʌǝ ʍou \'dɐɹƆ';

      groupGateway.deleteLabeledThingGroup(labeledThingGroup);
      $rootScope.$apply();

      expect(pouchDbContext.bulkDocs).toHaveBeenCalled();

      bulkDocsDeferred.resolve([
        {ok: true},
        {error: error},
      ]);

      $rootScope.$apply();

      expect(pouchDbContext.remove).not.toHaveBeenCalled();
    });

    it('should reject operations promise if removal of ltgifs failed catastrophically', () => {
      pouchDbContext.query.and.returnValue($q.resolve({
        rows: [
          {doc: labeledThingGroupInFrameDocument},
          {doc: labeledThingGroupInFrameTwoDocument},
        ],
      }));

      revisionManager.updateRevision(labeledThingGroupInFrameDocument._id, labeledThingGroupInFrameDocument._rev);
      revisionManager.updateRevision(labeledThingGroupInFrameTwoDocument._id, labeledThingGroupInFrameTwoDocument._rev);

      const bulkDocsDeferred = $q.defer();
      pouchDbContext.bulkDocs.and.returnValue(bulkDocsDeferred.promise);

      const error = 'Still not home. Now everything is here twice | eciwt ereh si gnihtyreve woN .emoh ton llitS';

      const resultValue = groupGateway.deleteLabeledThingGroup(labeledThingGroup);
      const resultValuePromise = jasmine.createSpy('resultValue rejected');
      resultValue.catch(resultValuePromise);

      bulkDocsDeferred.reject(error);
      $rootScope.$apply();

      expect(resultValuePromise).toHaveBeenCalled();
    });

    it('should reject operations promise if one of the ltgif removals failed', () => {
      pouchDbContext.query.and.returnValue($q.resolve({
        rows: [
          {doc: labeledThingGroupInFrameDocument},
          {doc: labeledThingGroupInFrameTwoDocument},
        ],
      }));

      revisionManager.updateRevision(labeledThingGroupInFrameDocument._id, labeledThingGroupInFrameDocument._rev);
      revisionManager.updateRevision(labeledThingGroupInFrameTwoDocument._id, labeledThingGroupInFrameTwoDocument._rev);

      const bulkDocsDeferred = $q.defer();
      pouchDbContext.bulkDocs.and.returnValue(bulkDocsDeferred.promise);

      const error = 'Smethinog is stlil not rghit!';

      const resultValue = groupGateway.deleteLabeledThingGroup(labeledThingGroup);
      const resultValuePromise = jasmine.createSpy('resultValue rejected');
      resultValue.catch(resultValuePromise);

      bulkDocsDeferred.resolve([
        {ok: true},
        {error: error},
      ]);

      $rootScope.$apply();

      expect(resultValuePromise).toHaveBeenCalled();
    });
  });

  describe('saveLabeledThingGroupInFrame', () => {
    it('should return a promise', () => {
      const returnValue = groupGateway.saveLabeledThingGroupInFrame(labeledThingGroupInFrame);
      expect(returnValue.then).toEqual(jasmine.any(Function));
    });

    it('should utilize the packaging executor', () => {
      spyOn(packagingExecutor, 'execute').and.callThrough();
      const returnValue = groupGateway.saveLabeledThingGroupInFrame(labeledThingGroupInFrame);

      expect(packagingExecutor.execute).toHaveBeenCalled();
      expect(returnValue).toBe(packagingExecutor.execute.calls.mostRecent().returnValue);
    });

    it('should serialize the given ltgif', () => {
      spyOn(couchDbModelSerializer, 'serialize').and.callThrough();
      groupGateway.saveLabeledThingGroupInFrame(labeledThingGroupInFrame);

      expect(couchDbModelSerializer.serialize).toHaveBeenCalledWith(
        labeledThingGroupInFrame
      );
    });

    it('should try to inject the revision before updating', () => {
      spyOn(couchDbModelSerializer, 'serialize').and.callThrough();
      spyOn(revisionManager, 'injectRevision').and.callThrough();
      groupGateway.saveLabeledThingGroupInFrame(labeledThingGroupInFrame);

      expect(revisionManager.injectRevision).toHaveBeenCalledWith(
        couchDbModelSerializer.serialize.calls.mostRecent().returnValue
      );
    });

    it('should put the updated ltgif to the database', () => {
      spyOn(couchDbModelSerializer, 'serialize').and.callThrough();

      groupGateway.saveLabeledThingGroupInFrame(labeledThingGroupInFrame);
      $rootScope.$apply();

      expect(pouchDbContext.put).toHaveBeenCalledWith(
        couchDbModelSerializer.serialize.calls.mostRecent().returnValue
      );
    });

    it('should retrieve the stored ltgif after putting for revision extraction', () => {
      pouchDbContext.put.and.callFake(() => {
        const deferred = $q.defer();
        deferred.resolve({id: labeledThingGroupInFrame.id});
        return deferred.promise;
      });

      groupGateway.saveLabeledThingGroupInFrame(labeledThingGroupInFrame);
      $rootScope.$apply();

      expect(pouchDbContext.get).toHaveBeenCalledWith(labeledThingGroupInFrame.id);
    });

    it('should extract revision after storage of ltgif', () => {
      spyOn(revisionManager, 'extractRevision').and.callThrough();
      pouchDbContext.get.and.callFake(() => {
        const deferred = $q.defer();
        deferred.resolve(labeledThingGroupInFrameDocument);
        return deferred.promise;
      });

      pouchDbContext.put.and.callFake(() => {
        const deferred = $q.defer();
        deferred.resolve({id: labeledThingGroupInFrame.id});
        return deferred.promise;
      });

      groupGateway.saveLabeledThingGroupInFrame(labeledThingGroupInFrame);
      $rootScope.$apply();

      expect(revisionManager.extractRevision).toHaveBeenCalledWith(labeledThingGroupInFrameDocument);
    });

    it('should resolve with the loaded and deserialized document after storing', () => {
      spyOn(couchDbModelDeserializer, 'deserializeLabeledThingGroupInFrame').and.callThrough();
      pouchDbContext.get.and.callFake(() => {
        const deferred = $q.defer();
        deferred.resolve(labeledThingGroupInFrameDocument);
        return deferred.promise;
      });

      pouchDbContext.put.and.callFake(() => {
        const deferred = $q.defer();
        deferred.resolve({id: labeledThingGroupInFrame.id});
        return deferred.promise;
      });

      const returnValue = groupGateway.saveLabeledThingGroupInFrame(labeledThingGroupInFrame);
      const returnValueSpy = jasmine.createSpy('returnValue resolve');
      returnValue.then(returnValueSpy);
      $rootScope.$apply();

      expect(returnValueSpy).toHaveBeenCalledWith(
        couchDbModelDeserializer.deserializeLabeledThingGroupInFrame.calls.mostRecent().returnValue
      );
    });
  });

  describe('getFrameIndexRangeForLabeledThingGroup', () => {
    it('should return promise', () => {
      const returnValue = groupGateway.getFrameIndexRangeForLabeledThingGroup(labeledThingGroup);
      expect(returnValue.then).toEqual(jasmine.any(Function));
    });

    it('should utilize packaging executor', () => {
      spyOn(packagingExecutor, 'execute').and.callThrough();

      const returnValue = groupGateway.getFrameIndexRangeForLabeledThingGroup(labeledThingGroup);

      expect(packagingExecutor.execute).toHaveBeenCalled();
      expect(returnValue).toBe(
        packagingExecutor.execute.calls.mostRecent().returnValue
      );
    });

    it('should utilize the labeledThingGroupFrameRange view', () => {
      spyOn(pouchDbViewService, 'getDesignDocumentViewName').and.callThrough();
      groupGateway.getFrameIndexRangeForLabeledThingGroup(labeledThingGroup);

      $rootScope.$apply();

      expect(pouchDbViewService.getDesignDocumentViewName).toHaveBeenCalledWith(
        'labeledThingGroupFrameRange'
      );

      const queriedViewName = pouchDbContext.query.calls.mostRecent().args[0];
      expect(queriedViewName).toEqual(
        pouchDbViewService.getDesignDocumentViewName.calls.mostRecent().returnValue
      );
    });

    it('should query the view with correct group options', () => {
      groupGateway.getFrameIndexRangeForLabeledThingGroup(labeledThingGroup);

      $rootScope.$apply();

      const queryOptions = pouchDbContext.query.calls.mostRecent().args[1];
      expect(queryOptions.group).toBeTruthy();
      expect(queryOptions.group_level).toEqual(1);
    });

    it('should query the view with correct key', () => {
      groupGateway.getFrameIndexRangeForLabeledThingGroup(labeledThingGroup);

      $rootScope.$apply();

      const queryOptions = pouchDbContext.query.calls.mostRecent().args[1];
      expect(queryOptions.key).toEqual([labeledThingGroup.id]);
    });

    it('should query the view without requesting document includes', () => {
      groupGateway.getFrameIndexRangeForLabeledThingGroup(labeledThingGroup);

      $rootScope.$apply();

      const queryOptions = pouchDbContext.query.calls.mostRecent().args[1];
      expect(queryOptions.include_docs).toBeFalsy();
    });

    it('should reject if the query failed catastrophically', () => {
      const error = 'We are writing the year 5 billion, the day the sun explodes!';

      pouchDbContext.query.and.returnValue($q.reject(error));

      const returnValue = groupGateway.getFrameIndexRangeForLabeledThingGroup(labeledThingGroup);
      const returnValueSpy = jasmine.createSpy('returnValue rejected');
      returnValue.catch(returnValueSpy);

      $rootScope.$apply();

      expect(returnValueSpy).toHaveBeenCalledWith(error);
    });

    it('should reject if the query does not provide an answer', () => {
      pouchDbContext.query.and.returnValue(
        $q.resolve({
          offset: 0,
          total_rows: 0,
          rows: [],
        })
      );

      const returnValue = groupGateway.getFrameIndexRangeForLabeledThingGroup(labeledThingGroup);
      const returnValueSpy = jasmine.createSpy('returnValue rejected');
      returnValue.catch(returnValueSpy);

      $rootScope.$apply();

      expect(returnValueSpy).toHaveBeenCalled();
    });

    it('should resolve with the correct frame indices', () => {
      pouchDbContext.query.and.returnValue(
        $q.resolve({
          offset: 0,
          total_rows: 0,
          rows: [
            {
              id: labeledThingGroup.id,
              key: labeledThingGroup.id,
              value: [23, 42],
            },
          ],
        })
      );

      const returnValue = groupGateway.getFrameIndexRangeForLabeledThingGroup(labeledThingGroup);
      const returnValueSpy = jasmine.createSpy('returnValue resolved');
      returnValue.then(returnValueSpy);

      $rootScope.$apply();

      const expectedReturnValue = {
        startFrameIndex: 23,
        endFrameIndex: 42,
      };
      expect(returnValueSpy).toHaveBeenCalledWith(expectedReturnValue);
    });
  });

  describe('deleteLabeledThingGroupsInFrameOutsideOfFrameIndexRange', () => {
    let frameIndexRange;

    function createQueryResponseWithTwoLtgifs(frameIndexOne = 0, frameIndexTwo = 1) {
      return {
        offset: 0,
        total_rows: 2,
        rows: [
          {
            id: labeledThingGroupInFrameDocument._id,
            key: [labeledThingGroup.id, frameIndexOne],
            doc: Object.assign({}, labeledThingGroupInFrameDocument, {frameIndex: frameIndexOne}),
          },
          {
            id: labeledThingGroupInFrameTwoDocument._id,
            key: [labeledThingGroup.id, frameIndexTwo],
            doc: Object.assign({}, labeledThingGroupInFrameTwoDocument, {frameIndex: frameIndexTwo}),
          },
        ],
      };
    }

    beforeEach(() => {
      frameIndexRange = {
        startFrameIndex: 23,
        endFrameIndex: 42,
      };
    });

    beforeEach(() => {
      revisionManager.updateRevision(labeledThingGroupInFrameDocument._id, labeledThingGroupInFrameDocument._rev);
      revisionManager.updateRevision(labeledThingGroupInFrameTwoDocument._id, labeledThingGroupInFrameTwoDocument._rev);
    });

    it('should return a promise', () => {
      const returnValue = groupGateway.deleteLabeledThingGroupsInFrameOutsideOfFrameIndexRange(
        labeledThingGroup,
        frameIndexRange
      );

      expect(returnValue.then).toEqual(jasmine.any(Function));
    });

    it('should utilize packaging executor', () => {
      spyOn(packagingExecutor, 'execute').and.callThrough();

      groupGateway.deleteLabeledThingGroupsInFrameOutsideOfFrameIndexRange(
        labeledThingGroup,
        frameIndexRange
      );

      expect(packagingExecutor.execute).toHaveBeenCalledWith(
        'labeledThingGroup',
        jasmine.any(Function)
      );
    });

    it('should return packaging executor return value', () => {
      spyOn(packagingExecutor, 'execute').and.callThrough();

      const returnValue = groupGateway.deleteLabeledThingGroupsInFrameOutsideOfFrameIndexRange(
        labeledThingGroup,
        frameIndexRange
      );

      expect(returnValue).toBe(
        packagingExecutor.execute.calls.mostRecent().returnValue
      );
    });

    it('should use the labeledThingGroupInFrameByLabeledThingGroupIdAndFrameIndex view', () => {
      spyOn(pouchDbViewService, 'getDesignDocumentViewName').and.callThrough();

      groupGateway.deleteLabeledThingGroupsInFrameOutsideOfFrameIndexRange(
        labeledThingGroup,
        frameIndexRange
      );

      $rootScope.$apply();

      expect(pouchDbViewService.getDesignDocumentViewName).toHaveBeenCalledWith(
        'labeledThingGroupInFrameByLabeledThingGroupIdAndFrameIndex'
      );

      const queriedViewName = pouchDbContext.query.calls.mostRecent().args[0];
      expect(queriedViewName).toBe(
        pouchDbViewService.getDesignDocumentViewName.calls.mostRecent().returnValue
      );
    });

    it('should resolve if there are no ltgifs outside of the given range', () => {
      pouchDbContext.query.and.returnValue(
        $q.resolve(createQueryResponseWithTwoLtgifs(30, 40))
      );

      const returnValue = groupGateway.deleteLabeledThingGroupsInFrameOutsideOfFrameIndexRange(
        labeledThingGroup,
        frameIndexRange
      );
      const returnValueSpy = jasmine.createSpy('returnValue resolved');
      returnValue.then(returnValueSpy);

      $rootScope.$apply();

      expect(returnValueSpy).toHaveBeenCalled();
      expect(pouchDbContext.bulkDocs).not.toHaveBeenCalled();
      expect(pouchDbContext.remove).not.toHaveBeenCalled();
    });

    it('should resolve if there are no ltgifs outside of the given range (frameRange border)', () => {
      pouchDbContext.query.and.returnValue(
        $q.resolve(createQueryResponseWithTwoLtgifs(23, 42))
      );

      const returnValue = groupGateway.deleteLabeledThingGroupsInFrameOutsideOfFrameIndexRange(
        labeledThingGroup,
        frameIndexRange
      );
      const returnValueSpy = jasmine.createSpy('returnValue resolved');
      returnValue.then(returnValueSpy);

      $rootScope.$apply();

      expect(returnValueSpy).toHaveBeenCalled();
      expect(pouchDbContext.bulkDocs).not.toHaveBeenCalled();
      expect(pouchDbContext.remove).not.toHaveBeenCalled();
    });

    it('should reject if the query failed catastrophically', () => {
      const error = 'If you are going to Zhahadum, you will die!';

      pouchDbContext.query.and.returnValue($q.reject(error));

      const returnValue = groupGateway.deleteLabeledThingGroupsInFrameOutsideOfFrameIndexRange(
        labeledThingGroup,
        frameIndexRange
      );
      const returnValueSpy = jasmine.createSpy('returnValue rejected');
      returnValue.catch(returnValueSpy);

      $rootScope.$apply();

      expect(returnValueSpy).toHaveBeenCalledWith(error);
    });

    it('should resolve if there are no matching ltgifs', () => {
      pouchDbContext.query.and.returnValue(
        $q.resolve({
          offset: 0,
          total_rows: 0,
          rows: [],
        })
      );

      const returnValue = groupGateway.deleteLabeledThingGroupsInFrameOutsideOfFrameIndexRange(
        labeledThingGroup,
        frameIndexRange
      );
      const returnValueSpy = jasmine.createSpy('returnValue resolved');
      returnValue.then(returnValueSpy);

      $rootScope.$apply();

      expect(returnValueSpy).toHaveBeenCalled();
    });

    it('should batch remove all ltgifs outside the given range', () => {
      pouchDbContext.query.and.returnValue(
        $q.resolve(createQueryResponseWithTwoLtgifs(20, 50))
      );

      groupGateway.deleteLabeledThingGroupsInFrameOutsideOfFrameIndexRange(
        labeledThingGroup,
        frameIndexRange
      );

      $rootScope.$apply();

      expect(pouchDbContext.bulkDocs).toHaveBeenCalledWith(
        [
          {
            _id: labeledThingGroupInFrameDocument._id,
            _rev: labeledThingGroupInFrameDocument._rev,
            _deleted: true,
          },
          {
            _id: labeledThingGroupInFrameTwoDocument._id,
            _rev: labeledThingGroupInFrameTwoDocument._rev,
            _deleted: true,
          },
        ]
      );
    });

    it('should batch remove all ltgifs outside the given range (near range)', () => {
      pouchDbContext.query.and.returnValue(
        $q.resolve(createQueryResponseWithTwoLtgifs(22, 43))
      );

      groupGateway.deleteLabeledThingGroupsInFrameOutsideOfFrameIndexRange(
        labeledThingGroup,
        frameIndexRange
      );

      $rootScope.$apply();

      expect(pouchDbContext.bulkDocs).toHaveBeenCalledWith(
        [
          {
            _id: labeledThingGroupInFrameDocument._id,
            _rev: labeledThingGroupInFrameDocument._rev,
            _deleted: true,
          },
          {
            _id: labeledThingGroupInFrameTwoDocument._id,
            _rev: labeledThingGroupInFrameTwoDocument._rev,
            _deleted: true,
          },
        ]
      );
    });

    it('should only batch remove ltgifs outside not inside', () => {
      pouchDbContext.query.and.returnValue(
        $q.resolve(createQueryResponseWithTwoLtgifs(30, 100))
      );

      groupGateway.deleteLabeledThingGroupsInFrameOutsideOfFrameIndexRange(
        labeledThingGroup,
        frameIndexRange
      );

      $rootScope.$apply();

      expect(pouchDbContext.bulkDocs).toHaveBeenCalledWith(
        [
          {
            _id: labeledThingGroupInFrameTwoDocument._id,
            _rev: labeledThingGroupInFrameTwoDocument._rev,
            _deleted: true,
          },
        ]
      );
    });
  });
});
