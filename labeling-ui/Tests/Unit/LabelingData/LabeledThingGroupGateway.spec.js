import 'jquery';
import angular from 'angular';
import {inject, module} from 'angular-mocks';
import {cloneDeep} from 'lodash';

import Common from 'Application/Common/Common';

import LabeledThing from 'Application/LabelingData/Models/LabeledThing';
import LabeledThingGroup from 'Application/LabelingData/Models/LabeledThingGroup';

import LabeledThingGroupGateway from 'Application/LabelingData/Gateways/LabeledThingGroupGateway';

import Task from 'Application/Task/Model/Task';
import TaskFrontendModel from 'Tests/Fixtures/Models/Frontend/Task';

import labeledThingGroupFixture from 'Tests/Fixtures/Models/Frontend/LabeledThingGroup';
import labeledThingGroupDocumentFixture from 'Tests/Fixtures/Models/CouchDb/LabeledThingGroup';
import labeledThingGroupInFrameFixture from 'Tests/Fixtures/Models/Frontend/LabeledThingGroupInFrame';
import labeledThingGroupInFrameDocumentFixture from 'Tests/Fixtures/Models/CouchDb/LabeledThingGroupInFrame';

describe('LabeledThingGroupGateway', () => {
  /**
   * @param {LabeledThingGroupGateway}
   */
  let groupGateway;
  /**
   * @param {LabeledThingGateway}
   */
  let thingGateway;
  let pouchDbContext;
  let $rootScope;
  let $q;
  let labeledThingGroupResponse;
  let queryResponse;
  let couchDbModelDeserializer;
  let couchDbModelSerializer;
  let packagingExecutor;
  let revisionManager;

  let labeledThingGroup;
  let labeledThingGroupDocument;
  let labeledThingGroupInFrame;
  let labeledThingGroupInFrameDocument;

  function createTask(id = 'TASK-ID') {
    return new Task(Object.assign({}, TaskFrontendModel.toJSON(), {id}));
  }

  beforeEach(() => {
    labeledThingGroup = labeledThingGroupFixture.clone();
    labeledThingGroupDocument = cloneDeep(labeledThingGroupDocumentFixture);
    labeledThingGroupInFrame = labeledThingGroupInFrameFixture.clone();
    labeledThingGroupInFrameDocument = cloneDeep(labeledThingGroupInFrameDocumentFixture);
  });

  beforeEach(() => {
    const featureFlags = {};

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

    labeledThingGroupResponse = {
      '_id': 'e2c029002f1375ec4c10f55d4b2e71c9',
      '_rev': '1-579bff7e19f986e0dfab7a58fe7362dd',
      'type': 'AnnoStationBundle.Model.LabeledThingGroup',
      'groupType': 'extension-sign-group',
      'lineColor': '15',
      'groupIds': null,
      'classes': [],
      'incomplete': true,
      'taskId': 'TASK-ID',
    };

    const commonModule = new Common();
    commonModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.Common');

    pouchDbContext = jasmine.createSpyObj('pouchDbContext', ['query', 'get', 'remove', 'put', 'allDocs']);
    thingGateway = jasmine.createSpyObj('LabeledThingGateway', ['saveLabeledThing']);

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

    thingGateway.saveLabeledThing.and.callFake(doc => {
      const deferred = $q.defer();
      deferred.resolve(doc);
      return deferred.promise;
    });

    module($provide => {
      const pouchDbContextServiceMock = jasmine.createSpyObj('storageContextService', ['provideContextForTaskId']);
      pouchDbContextServiceMock.provideContextForTaskId.and.returnValue(pouchDbContext);

      $provide.value('pouchDbContextService', pouchDbContextServiceMock);
      $provide.value('labeledThingGateway', thingGateway);
      // $provide.value('applicationConfig', mockConfig);
    });

    inject($injector => {
      $q = $injector.get('$q');
      $rootScope = $injector.get('$rootScope');
      couchDbModelDeserializer = $injector.get('couchDbModelDeserializer');
      couchDbModelSerializer = $injector.get('couchDbModelSerializer');
      packagingExecutor = $injector.get('packagingExecutor');
      revisionManager = $injector.get('revisionManager');
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
  });

  it('should load labeled thing groups and group in frames for frame index', () => {
    const task = createTask();
    const frameIndex = 0;

    groupGateway.getLabeledThingGroupsInFrameForFrameIndex(task, frameIndex);

    $rootScope.$apply();

    expect(pouchDbContext.query)
      .toHaveBeenCalledWith('labeledThingGroupOnFrameByTaskIdAndFrameIndex', {
        key: [task.id, frameIndex],
      });
    expect(pouchDbContext.get).toHaveBeenCalledWith(labeledThingGroupResponse._id);
  });

  describe('getLabeledThingGroupsByIds', () => {
    let task;
    let ids;
    let labeledThingGroupDocument;
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
        groupType: 'lights-group',
        lineColor: '10',
        type: 'AnnoStationBundle.Model.LabeledThingGroup',
        groupIds: [],
      };

      pouchDbContext.allDocs.and.returnValue($q.resolve({
        offset: 0,
        total_rows: 1,
        rows: [{
          id: '3224971765fa4f728ea25009576db0bc',
          key: '3224971765fa4f728ea25009576db0bc',
          value: {
            rev: '1-5c6dbbf287f44c5f92420ff4c3e5d59d',
          },
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

  it('should create a labeled thing group', () => {
    spyOn(couchDbModelDeserializer, 'deserializeLabeledThingGroup').and.callThrough();

    const task = createTask();

    const labeledThingGroup = new LabeledThingGroup({
      task,
      id: 'LABELED-THING-GROUP-ID',
      groupType: 'extension-sign-group',
      lineColor: 1,
      groupIds: [],
      classes: [],
      incomplete: true,
      createdAt: '2017-09-05 16:11:56.000000',
      lastModifiedAt: '2017-09-05 16:11:56.000000',
    });
    spyOn(labeledThingGroup, '_getCurrentDate').and.returnValue('2017-09-05 16:11:56.000000');

    const serializedGroup = {
      _id: 'LABELED-THING-GROUP-ID',
      groupType: 'extension-sign-group',
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

    groupGateway.createLabeledThingGroup(task, labeledThingGroup);

    $rootScope.$apply();

    expect(pouchDbContext.put).toHaveBeenCalledWith(serializedGroup);
    expect(pouchDbContext.get).toHaveBeenCalledWith('PUT-LABELED-THING-GROUP-ID');
    expect(couchDbModelDeserializer.deserializeLabeledThingGroup).toHaveBeenCalledWith(labeledThingGroupResponse, task);
  });

  it('should assign labeled things to a labeled thing group', () => {
    const task = createTask();

    const labeledThingGroup = new LabeledThingGroup({
      id: 'LABELED-THING-GROUP-ID',
      task,
      groupType: 'extension-sign-group',
      lineColor: 1,
      groupIds: [],
    });

    const labeledThing = new LabeledThing({
      id: 'LABELED-THING-ID',
      frameRange: {
        startFrameIndex: 0,
        endFrameIndex: 3,
      },
      groupIds: [],
      classes: ['foo', 'bar', 'baz'],
      incomplete: false,
      lineColor: 8,
      task,
    });

    const labeledThingCalled = new LabeledThing({
      id: 'LABELED-THING-ID',
      frameRange: {
        startFrameIndex: 0,
        endFrameIndex: 3,
      },
      groupIds: ['LABELED-THING-GROUP-ID'],
      classes: ['foo', 'bar', 'baz'],
      incomplete: false,
      taskId: 'TASK-ID',
      projectId: 'PROJECT-ID',
      lineColor: 8,
      task,
    });

    groupGateway.assignLabeledThingsToLabeledThingGroup([labeledThing], labeledThingGroup);

    $rootScope.$apply();

    expect(thingGateway.saveLabeledThing)
      .toHaveBeenCalledWith(labeledThingCalled);
  });

  it('should unassign labeled things from a labeled thing group', () => {
    const task = createTask();

    const labeledThingGroup = new LabeledThingGroup({
      id: 'LABELED-THING-GROUP-ID',
      task,
      groupType: 'extension-sign-group',
      lineColor: 1,
      groupIds: [],
    });

    const labeledThing = new LabeledThing({
      id: 'LABELED-THING-ID',
      frameRange: {
        startFrameIndex: 0,
        endFrameIndex: 3,
      },
      groupIds: ['LABELED-THING-GROUP-ID'],
      classes: ['foo', 'bar', 'baz'],
      incomplete: false,
      lineColor: 8,
      task,
    });

    const labeledThingCalled = new LabeledThing({
      id: 'LABELED-THING-ID',
      frameRange: {
        startFrameIndex: 0,
        endFrameIndex: 3,
      },
      groupIds: [],
      classes: ['foo', 'bar', 'baz'],
      incomplete: false,
      lineColor: 8,
      task,
    });

    groupGateway.unassignLabeledThingsFromLabeledThingGroup([labeledThing], labeledThingGroup);

    $rootScope.$apply();

    expect(thingGateway.saveLabeledThing)
      .toHaveBeenCalledWith(labeledThingCalled);
  });

  describe('deleteLabeledThingGroup', () => {
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
});
