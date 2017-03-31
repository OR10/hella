import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';

import Common from 'Application/Common/Common';

import LabeledThing from 'Application/LabelingData/Models/LabeledThing';
import LabeledThingGroup from 'Application/LabelingData/Models/LabeledThingGroup';

import PouchDbLabeledThingGroupGateway from 'Application/LabelingData/Gateways/PouchDbLabeledThingGroupGateway';

describe('PouchDbLabeledThingGroupGateway', () => {
  /**
   * @param {PouchDbLabeledThingGroupGateway}
   */
  let groupGateway;
  /**
   * @param {PouchDbLabeledThingGateway}
   */
  let thingGateway;
  let pouchDbContext;
  let $rootScope;
  let $q;
  let labeledThingGroupResponse;
  let queryResponse;

  beforeEach(() => {
    const featureFlags = {
      pouchdb: true,
    };

    queryResponse = {
      'total_rows': 6,
      'offset': 0,
      'rows': [
        {
          'id': '60950e57-5e93-4f7f-9196-6821eaaa74d3',
          'key': ['e2c029002f1375ec4c10f55d4b2618c3', 0],
          'value': 'e2c029002f1375ec4c10f55d4b2d43a7',
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
    };

    const commonModule = new Common();
    commonModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.Common');

    pouchDbContext = jasmine.createSpyObj('pouchDbContext', ['query', 'get', 'remove', 'put']);
    thingGateway = jasmine.createSpyObj('pouchDbLabeledThingGateway', ['saveLabeledThing']);

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
      pouchDbContextServiceMock.provideContextForTaskId
        .and.returnValue(pouchDbContext);
      $provide.value('pouchDbContextService', pouchDbContextServiceMock);
      $provide.value('pouchDbLabeledThingGateway', thingGateway);
      // $provide.value('applicationConfig', mockConfig);
    });

    inject($injector => {
      $q = $injector.get('$q');
      $rootScope = $injector.get('$rootScope');
      groupGateway = $injector.instantiate(PouchDbLabeledThingGroupGateway);
    });
  });

  it('should load labeled thing groups and group in frames for frame index', () => {
    const task = {id: 'TASK-ID'};
    const frameIndex = 0;

    groupGateway.getLabeledThingGroupsInFrameForFrameIndex(task, frameIndex);

    $rootScope.$apply();

    expect(pouchDbContext.query)
      .toHaveBeenCalledWith({ map: jasmine.any(Function) }, {
        key: [task.id, frameIndex],
      });
    expect(pouchDbContext.get).toHaveBeenCalledWith(labeledThingGroupResponse._id);
  });

  it('should delete a labeled thing group', () => {
    const task = {id: 'TASK-ID'};

    const labeledThingGroup = new LabeledThingGroup({
      id: 'LABELED-THING-GROUP-ID',
      task,
      groupType: 'extension-sign-group',
      lineColor: 1,
      groupIds: [],
    });

    const serializedGroup = {
      _id: 'LABELED-THING-GROUP-ID',
      groupType: 'extension-sign-group',
      lineColor: 1,
      groupIds: [],
      type: 'AppBundle.Model.LabeledThingGroup',
    };

    groupGateway.deleteLabeledThingGroup(labeledThingGroup);

    $rootScope.$apply();

    expect(pouchDbContext.remove)
      .toHaveBeenCalledWith(serializedGroup);
  });

  it('should create a labeled thing group', () => {
    const task = {id: 'TASK-ID'};

    const labeledThingGroup = new LabeledThingGroup({
      id: 'LABELED-THING-GROUP-ID',
      task,
      groupType: 'extension-sign-group',
      lineColor: 1,
      groupIds: [],
    });

    const serializedGroup = {
      _id: 'LABELED-THING-GROUP-ID',
      groupType: 'extension-sign-group',
      lineColor: 1,
      groupIds: [],
      type: 'AppBundle.Model.LabeledThingGroup',
    };

    groupGateway.createLabeledThingGroup(task, labeledThingGroup);

    $rootScope.$apply();

    expect(pouchDbContext.put)
      .toHaveBeenCalledWith(serializedGroup);
    expect(pouchDbContext.get)
      .toHaveBeenCalledWith('PUT-LABELED-THING-GROUP-ID');
  });

  it('should assign labeled things to a labeled thing group', () => {
    const task = {id: 'TASK-ID'};

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
      taskId: 'TASK-ID',
      projectId: 'PROJECT-ID',
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
    const task = {id: 'TASK-ID'};

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
      taskId: 'TASK-ID',
      projectId: 'PROJECT-ID',
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
      taskId: 'TASK-ID',
      projectId: 'PROJECT-ID',
      lineColor: 8,
      task,
    });

    groupGateway.unassignLabeledThingsToLabeledThingGroup([labeledThing], labeledThingGroup);

    $rootScope.$apply();

    expect(thingGateway.saveLabeledThing)
      .toHaveBeenCalledWith(labeledThingCalled);
  });
});