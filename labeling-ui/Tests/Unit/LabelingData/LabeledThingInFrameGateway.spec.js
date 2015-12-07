import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';

import LabeledThingInFrameGateway from 'Application/LabelingData/Gateways/LabeledThingInFrameGateway';
import LabeledThingInFrame from 'Application/LabelingData/Models/LabeledThingInFrame';
import LabeledThing from 'Application/LabelingData/Models/LabeledThing';

describe('LabeledThingInFrameGateway', () => {
  let $httpBackend;
  let gateway;
  let bufferedHttp;
  let $q;
  let $rootScope;

  beforeEach(() => {
    const commonModule = new Common();
    commonModule.registerWithAngular(angular);
    module('AnnoStation.Common');

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
      labeledThing: {id: 'some-labeled-thing-id'},
    });
    const expectedUrl = `/backend/api/labeledThingInFrame/${labeledThingInFrame.id}`;
    const expectedResult = {
      result: {
        id: 'abc',
        rev: 'bcd',
        shapes: [{type: 'rectangle'}],
        classes: [],
        incomplete: true,
        frameNumber: 23,
        ghost: false,
        labeledThingId: 'some-labeled-thing-id',
      },
    };

    $httpBackend
      .expect('PUT', expectedUrl)
      .respond(200, expectedResult);

    gateway.saveLabeledThingInFrame(labeledThingInFrame)
      .then(result => {
        expect(result.toJSON()).toEqual(expectedResult.result);
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
      .catch(() => {
        done();
      });

    bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
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
        .respond(200, {result: {
          labeledThingsInFrame: [],
          labeledThings: {},
        }});

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
        .respond(200, {result: {
          labeledThingsInFrame: [],
          labeledThings: {},
        }});

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
});
