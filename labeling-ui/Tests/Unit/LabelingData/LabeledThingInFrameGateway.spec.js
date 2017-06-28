import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';
import LabelingData from 'Application/LabelingData/LabelingData';

import LabeledThingInFrameGateway from 'Application/LabelingData/Gateways/LabeledThingInFrameGateway';
import LabeledThingInFrame from 'Application/LabelingData/Models/LabeledThingInFrame';
import LabeledThing from 'Application/LabelingData/Models/LabeledThing';

import Task from 'Application/Task/Model/Task';
import TaskFrontendModel from 'Tests/Fixtures/Models/Frontend/Task';

describe('LabeledThingInFrameGateway', () => {
  let $httpBackend;
  let gateway;
  let $q;
  let $rootScope;

  function createTask(id = 'TASK-ID') {
    return new Task(Object.assign({}, TaskFrontendModel.toJSON(), {id}));
  }

  beforeEach(() => {
    const featureFlags = {
      pouchdb: false,
    };

    const commonModule = new Common();
    commonModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.Common');

    const labelingDataModule = new LabelingData();
    labelingDataModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.LabelingData');

    module(($provide, bufferedHttpProvider) => {
      $provide.value('applicationConfig', {
        Common: {
          apiPrefix: '/api',
          backendPrefix: '/backend',
        },
      });

      $provide.value('labeledThingGateway', {
        getLabeledThing(task, labeledThingId) {
          return $q.resolve(new LabeledThing({task, id: labeledThingId}));
        },
      });

      bufferedHttpProvider.disableAutoExtractionAndInjection();
    });

    inject($injector => {
      $httpBackend = $injector.get('$httpBackend');
      gateway = $injector.instantiate(LabeledThingInFrameGateway);
      $q = $injector.get('$q');
      $rootScope = $injector.get('$rootScope');
    });
  });

  it('should be able to instantiate without non injected arguments', () => {
    expect(gateway instanceof LabeledThingInFrameGateway).toEqual(true);
  });

  it('should receive the list of labeled thing in frame objects', done => {
    const task = createTask('someTaskId234');
    const frameIndex = 2;
    const expectedUrl = `/backend/api/task/${task.id}/labeledThingInFrame/${frameIndex}?limit=1&offset=0`;
    const response = {
      labeledThingsInFrame: [
        {id: 'abc', shapes: [{type: 'rectangle'}], labeledThingId: 'uvw'},
        {id: 'cde', shapes: [{type: 'circle'}], labeledThingId: 'xyz'},
      ],
      labeledThings: {
        uvw: {task, id: 'uvw'},
        xyz: {task, id: 'xyz'},
      },
    };

    const expectedResult = response.labeledThingsInFrame.map(
      data => new LabeledThingInFrame(
        Object.assign({}, data, {
          labeledThing: new LabeledThing(
            {task, id: data.labeledThingId}
          ),
        })
      )
    );

    $httpBackend
      .expect('GET', expectedUrl)
      .respond(200, {result: response});

    gateway.listLabeledThingInFrame(task, frameIndex)
      .then(result => {
        expect(result).toEqual(expectedResult);
        done();
      });

    $httpBackend.flush();
  });

  it('should save a labeled thing in frame without classes', done => {
    const task = createTask();

    const labeledThingInFrame = new LabeledThingInFrame({
      id: 'abc',
      shapes: [{type: 'rectangle'}],
      classes: [],
      incomplete: true,
      frameIndex: 23,
      ghostClasses: ['foo', 'bar'],
      ghost: false,
      identifierName: 'rectangle',
      labeledThing: new LabeledThing({
        task,
        id: 'some-labeled-thing-id',
        groupIds: [],
      }),
    });

    const expectedUrl = `/backend/api/labeledThingInFrame/${labeledThingInFrame.id}`;
    const expectedResult = {
      result: {
        labeledThingInFrame: {
          id: 'abc',
          shapes: [{type: 'rectangle'}],
          incomplete: true,
          frameIndex: 23,
          ghost: false,
          identifierName: 'rectangle',
          classes: [],
          ghostClasses: ['foo', 'bar'],
          labeledThingId: 'some-labeled-thing-id',
        },
        labeledThing: {
          taskId: task.id,
          projectId: task.projectId,
          id: 'some-labeled-thing-id',
          classes: [],
          groupIds: [],
          incomplete: false,
          frameRange: undefined,
          lineColor: undefined,
        },
      },
    };

    $httpBackend
      .expect('PUT', expectedUrl)
      .respond(200, expectedResult);

    gateway.saveLabeledThingInFrame(labeledThingInFrame)
      .then(result => {
        expect(result.toJSON()).toEqual(
          Object.assign({}, expectedResult.result.labeledThingInFrame, {taskId: task.id, projectId: task.projectId})
        );
        expect(result.labeledThing.toJSON()).toEqual(expectedResult.result.labeledThing);
        done();
      });

    $httpBackend.flush();
  });

  it('should save a labeled thing in frame with classes', done => {
    const task = createTask();

    const labeledThingInFrame = new LabeledThingInFrame({
      id: 'abc',
      shapes: [{type: 'rectangle'}],
      classes: ['a', 'b'],
      ghostClasses: null,
      incomplete: true,
      frameIndex: 23,
      identifierName: 'rectangle',
      ghost: false,
      labeledThing: new LabeledThing({
        task,
        id: 'some-labeled-thing-id',
        projectId: 'some-project',
        groupIds: [],
      }),
    });

    const expectedUrl = `/backend/api/labeledThingInFrame/${labeledThingInFrame.id}`;
    const expectedResult = {
      result: {
        labeledThingInFrame: {
          id: 'abc',
          shapes: [{type: 'rectangle'}],
          classes: ['a', 'b'],
          ghostClasses: null,
          incomplete: true,
          frameIndex: 23,
          identifierName: 'rectangle',
          ghost: false,
          labeledThingId: 'some-labeled-thing-id',
        },
        labeledThing: {
          taskId: task.id,
          projectId: task.projectId,
          id: 'some-labeled-thing-id',
          groupIds: [],
          classes: [],
          incomplete: false,
          frameRange: undefined,
          lineColor: undefined,
        },
      },
    };

    $httpBackend
      .expect('PUT', expectedUrl)
      .respond(200, expectedResult);

    gateway.saveLabeledThingInFrame(labeledThingInFrame)
      .then(result => {
        expect(result.toJSON()).toEqual(
          Object.assign({}, expectedResult.result.labeledThingInFrame, {taskId: task.id, projectId: task.projectId})
        );
        expect(result.labeledThing.toJSON()).toEqual(expectedResult.result.labeledThing);
        done();
      });

    $httpBackend.flush();
  });

  it('should error if trying to save a Ghosted LabeledThingInFrame', () => {
    const task = createTask();

    const labeledThinIngFrame = new LabeledThingInFrame({
      id: 'abc',
      shapes: [{type: 'rectangle'}],
      ghost: true,
      labeledThing: new LabeledThing({
        task,
        id: 'some-labeled-thing-id',
        projectId: 'some-project',
        groupIds: [],
      }),
    });

    expect(() => gateway.saveLabeledThingInFrame(labeledThinIngFrame))
      .toThrow();

    $rootScope.$digest();
  });

  using([
    [createTask('task1')],
    [createTask('task2')],
    [createTask('task3')],
    [createTask('task4')],
  ], task => {
    const frameIndex = 1;
    const expectedUrl = `/backend/api/task/${task.id}/labeledThingInFrame/${frameIndex}?limit=1&offset=0`;

    it('should request the task id as specified', done => { // eslint-disable-line jasmine/missing-expect
      $httpBackend
        .expect('GET', expectedUrl)
        .respond(200, {
          result: {
            labeledThingsInFrame: [],
            labeledThings: {},
          },
        });

      gateway.listLabeledThingInFrame(task, frameIndex)
        .then(done);

      $httpBackend.flush();
    });
  });

  using([
    [1],
    [2],
    [3],
    [4],
  ], frameIndex => {
    const task = createTask();
    const expectedUrl = `/backend/api/task/${task.id}/labeledThingInFrame/${frameIndex}?limit=1&offset=0`;

    it('should request the frame number as specified', done => { // eslint-disable-line jasmine/missing-expect
      $httpBackend
        .expect('GET', expectedUrl)
        .respond(200, {
          result: {
            labeledThingsInFrame: [],
            labeledThings: {},
          },
        });

      gateway.listLabeledThingInFrame(task, frameIndex)
        .then(done);

      $httpBackend.flush();
    });
  });

  using([
    ['abc', 23, 'def', undefined, undefined, 0, 1],
    ['foo', 42, 'xyz', 5, undefined, 5, 1],
    ['abc', 23, 'def', 0, 5, 0, 5],
    ['foo', 42, 'xyz', -5, undefined, -5, 1],
    ['foo', 423, 'xyz', -23, 100, -23, 100],
  ], (taskId, frameIndex, labeledThingId, limit, offset, expectedOffset, expectedLimit) => {
    const task = createTask(taskId);
    const labeledThing = new LabeledThing({task, id: labeledThingId});
    const expectedUrl = `/backend/api/task/${task.id}/labeledThingInFrame/${frameIndex}/${labeledThingId}?limit=${expectedLimit}&offset=${expectedOffset}`;
    const response = [{labeledThingId, id: 'testResult', shapes: []}];
    const expectedResult = response.map(
      () => new LabeledThingInFrame({labeledThing, id: 'testResult', shapes: []})
    );

    it('should request labeledThings by task, frameIndex and labeledThingId', done => {
      $httpBackend
        .expect('GET', expectedUrl)
        .respond(200, {result: response});

      gateway.getLabeledThingInFrame(task, frameIndex, labeledThing, limit, offset)
        .then(result => {
          expect(result).toEqual(expectedResult);
          done();
        });

      $httpBackend.flush();
    });
  });

  using([
    ['abc', 23, 1],
    ['foo', 42, 5],
    ['abc', 23, 15],
  ], (taskId, frameIndex, limit) => {
    const expectedUrl = `/backend/api/task/${taskId}/labeledThingInFrame/${frameIndex}?limit=${limit}&offset=0`;
    const task = createTask(taskId);
    const labeledThingId = 1;
    const labeledThingResponseData = {task, id: labeledThingId};
    const labeledThing = new LabeledThing(labeledThingResponseData);
    const labeledThings = {1: labeledThingResponseData};
    const response = {labeledThingsInFrame: [{labeledThingId, id: 'testResult', shapes: []}], labeledThings};
    const expectedResult = response.labeledThingsInFrame.map(
      () => new LabeledThingInFrame({labeledThing, id: 'testResult', shapes: []})
    );

    it('should request labeledThingsInFrame for multiple frames at once', done => {
      $httpBackend
        .expect('GET', expectedUrl)
        .respond(200, {result: response});

      gateway.listLabeledThingInFrame(task, frameIndex, 0, limit)
        .then(result => {
          expect(result).toEqual(expectedResult);
          done();
        });

      $httpBackend.flush();
    });
  });

  it('should fetch the next incomplete LabeledThingInFrame', done => {
    const task = createTask('someTaskId234');
    const expectedUrl = `/backend/api/task/${task.id}/labeledThingInFrame?incompleteOnly=true&limit=1`;

    const response = [{
      frameIndex: 1,
      classes: [],
      incomplete: true,
      ghost: false,
    }];

    $httpBackend
      .expect('GET', expectedUrl)
      .respond(200, {result: response});

    gateway.getNextIncomplete(task)
      .then(result => {
        expect(result).toEqual(response);
        done();
      });

    $httpBackend.flush();
  });
});
