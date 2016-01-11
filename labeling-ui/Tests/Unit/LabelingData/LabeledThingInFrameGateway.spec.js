import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';
import LabelingData from 'Application/LabelingData/LabelingData';

import LabeledThingInFrameGateway from 'Application/LabelingData/Gateways/LabeledThingInFrameGateway';
import LabeledThingInFrame from 'Application/LabelingData/Models/LabeledThingInFrame';
import LabeledThing from 'Application/LabelingData/Models/LabeledThing';

describe('LabeledThingInFrameGateway', () => {
  let $httpBackend;
  let gateway;
  let bufferedHttp;
  let $q;
  let $rootScope;
  let labeledThingInFrameData;
  let labeledThingData;

  beforeEach(() => {
    const commonModule = new Common();
    commonModule.registerWithAngular(angular);
    module('AnnoStation.Common');

    const labelingDataModule = new LabelingData();
    labelingDataModule.registerWithAngular(angular);
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
      bufferedHttpProvider.enableFlushFunctionality();
    });

    inject($injector => {
      $httpBackend = $injector.get('$httpBackend');
      gateway = $injector.instantiate(LabeledThingInFrameGateway);
      bufferedHttp = $injector.get('bufferedHttp');
      $q = $injector.get('$q');
      $rootScope = $injector.get('$rootScope');
      labeledThingInFrameData = $injector.get('labeledThingInFrameData');
      labeledThingData = $injector.get('labeledThingData');
    });
  });

  it('should be able to instantiate without non injected arguments', () => {
    expect(gateway instanceof LabeledThingInFrameGateway).toEqual(true);
  });

  it('should receive the list of labeled thing in frame objects', done => {
    const task = {id: 'someTaskId234'};
    const frameNumber = 2;
    const expectedUrl = `/backend/api/task/${task.id}/labeledThingInFrame/${frameNumber}`;
    const response = {
      labeledThingsInFrame: [
        {id: 'abc', rev: 'bcd', shapes: [{type: 'rectangle'}], labeledThingId: 'uvw'},
        {id: 'cde', rev: 'def', shapes: [{type: 'circle'}], labeledThingId: 'xyz'},
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

    gateway.listLabeledThingInFrame(task, frameNumber)
      .then(result => {
        expect(result).toEqual(expectedResult);
        done();
      });

    bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
  });

  it('should save a labeled thing in frame', done => {
    const labeledThingInFrame = new LabeledThingInFrame({
      id: 'abc',
      rev: 'bcd',
      shapes: [{type: 'rectangle'}],
      classes: [],
      incomplete: true,
      frameNumber: 23,
      ghost: false,
      labeledThing: new LabeledThing({
        id: 'some-labeled-thing-id',
        task: {id: 'task-xyz'},
      }),
    });

    const expectedUrl = `/backend/api/labeledThingInFrame/${labeledThingInFrame.id}`;
    const expectedResult = {
      result: {
        labeledThingInFrame: {
          id: 'abc',
          rev: 'bcd',
          shapes: [{type: 'rectangle'}],
          classes: [],
          incomplete: true,
          frameNumber: 23,
          ghost: false,
          labeledThingId: 'some-labeled-thing-id',
        },
        labeledThing: {
          taskId: 'task-xyz',
          id: 'some-labeled-thing-id',
          rev: '2-abc',
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
        expect(result.toJSON()).toEqual(expectedResult.result.labeledThingInFrame);
        expect(result.labeledThing.toJSON()).toEqual(expectedResult.result.labeledThing);
        done();
      });

    bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
  });

  it('should error if trying to save a Ghosted LabeledThingInFrame', done => {
    const labeledThinIngFrame = new LabeledThingInFrame({
      id: 'abc',
      rev: 'bcd',
      shapes: [{type: 'rectangle'}],
      ghost: true,
    });

    gateway.saveLabeledThingInFrame(labeledThinIngFrame)
      .then(() => {
        done(new Error('Ghost was saved but should not have been.'));
      })
      .catch(() => {
        done();
      });

    $rootScope.$digest();
  });

  it('should delete a labeled thing in frame', done => {
    const labeledThingInFrameId = '2';
    const expectedUrl = `/backend/api/labeledThingInFrame/${labeledThingInFrameId}`;
    const expectedResult = true;

    $httpBackend
      .expect('DELETE', expectedUrl)
      .respond(200, expectedResult);

    gateway.deleteLabeledThingInFrame(labeledThingInFrameId)
      .then(result => {
        expect(result).toEqual(expectedResult);
        done();
      });

    bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
  });

  using([
    [{id: 'task1'}],
    [{id: 'task2'}],
    [{id: 'task3'}],
    [{id: 'task4'}],
  ], (task) => {
    const frameNumber = 1;
    const expectedUrl = `/backend/api/task/${task.id}/labeledThingInFrame/${frameNumber}`;

    it('should request the task id as specified', done => {
      $httpBackend
        .expect('GET', expectedUrl)
        .respond(200, {
          result: {
            labeledThingsInFrame: [],
            labeledThings: {},
          },
        });

      gateway.listLabeledThingInFrame(task, frameNumber)
        .then(done);

      bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
    });
  });

  using([
    [1],
    [2],
    [3],
    [4],
  ], (frameNumber) => {
    const task = {id: 'abc'};
    const expectedUrl = `/backend/api/task/${task.id}/labeledThingInFrame/${frameNumber}`;

    it('should request the frame number as specified', done => {
      $httpBackend
        .expect('GET', expectedUrl)
        .respond(200, {
          result: {
            labeledThingsInFrame: [],
            labeledThings: {},
          },
        });

      gateway.listLabeledThingInFrame(task, frameNumber)
        .then(done);

      bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
    });
  });

  using([
    ['abc', 23, 'def', undefined, undefined, 0, 1],
    ['foo', 42, 'xyz', 5, undefined, 5, 1],
    ['abc', 23, 'def', 0, 5, 0, 5],
    ['foo', 42, 'xyz', -5, undefined, -5, 1],
    ['foo', 423, 'xyz', -23, 100, -23, 100],
  ], (taskId, frameNumber, labeledThingId, limit, offset, expectedOffset, expectedLimit) => {
    const task = {id: taskId};
    const labeledThing = new LabeledThing({task, id: labeledThingId});
    const expectedUrl = `/backend/api/task/${task.id}/labeledThingInFrame/${frameNumber}/${labeledThingId}?limit=${expectedLimit}&offset=${expectedOffset}`;
    const response = [{labeledThingId, id: 'testResult'}];
    const expectedResult = response.map(
      () => new LabeledThingInFrame({labeledThing, id: 'testResult'})
    );

    it('should request labeledThings by task, frameNumber and labeledThingId', done => {
      $httpBackend
        .expect('GET', expectedUrl)
        .respond(200, {result: response});

      gateway.getLabeledThingInFrame(task, frameNumber, labeledThing, limit, offset)
        .then(result => {
          expect(result).toEqual(expectedResult);
          done();
        });

      bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
    });
  });

  it('should fetch frame data from cache where available', done => {
    const expectedResult = {foo: 'bar'};
    const task = {id: 123};
    const frameNumber = 1;

    labeledThingInFrameData.set(frameNumber, expectedResult);

    gateway.listLabeledThingInFrame(task, frameNumber)
      .then(result => {
        expect(result).toEqual(expectedResult);
        done();
      });

    $rootScope.$digest();
  });

  it('should fetch LabeledThing data from cache where available', done => {
    const data = [
      {frameNumber: 1},
      {frameNumber: 2},
      {frameNumber: 3},
      {frameNumber: 4},
      {frameNumber: 5},
      {frameNumber: 6},
      {frameNumber: 7},
    ];

    const expectedResult = [
      {frameNumber: 3},
      {frameNumber: 4},
      {frameNumber: 5},
    ];

    const task = {id: 123};
    const labeledThing = {id: 4711};
    const frameNumber = 3;

    labeledThingData.set(labeledThing.id, data);

    gateway.getLabeledThingInFrame(task, frameNumber, labeledThing, 0, 3)
      .then(result => {
        expect(result).toEqual(expectedResult);
        done();
      });

    $rootScope.$digest();
  });

  using([
    ['abc', 23, 1],
    ['foo', 42, 5],
    ['abc', 23, 15],
  ], (taskId, frameNumber, limit) => {
    const task = {id: taskId};
    const expectedUrl = `/backend/api/task/${task.id}/labeledThingInFrame/${frameNumber}?limit=${limit}&offset=0`;
    const response = [{labeledThingId, id: 'testResult'}];
    const expectedResult = response.map(
      () => new LabeledThingInFrame({labeledThing, id: 'testResult'})
    );
    pending('WIP');

    it('should request labeledThings by task, frameNumber and labeledThingId', done => {
      $httpBackend
        .expect('GET', expectedUrl)
        .respond(200, {result: response});

      gateway.bulkFetchLabeledThingsInFrame(task, frameNumber, limit)
        .then(result => {
          expect(result).toEqual(expectedResult);
          done();
        });

      bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
    });
  });
});
