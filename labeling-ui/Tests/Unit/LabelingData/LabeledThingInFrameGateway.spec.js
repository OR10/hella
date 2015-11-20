import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';

import LabeledThingInFrameGateway from 'Application/LabelingData/Gateways/LabeledThingInFrameGateway';
import LabeledThingInFrame from 'Application/LabelingData/Models/LabeledThingInFrame';

describe('LabeledThingInFrameGateway', () => {
  let $httpBackend;
  let gateway;
  let bufferedHttp;

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

      bufferedHttpProvider.disableAutoExtractionAndInjection();
      bufferedHttpProvider.enableFlushFunctionality();
    });

    inject($injector => {
      $httpBackend = $injector.get('$httpBackend');
      gateway = $injector.instantiate(LabeledThingInFrameGateway);
      bufferedHttp = $injector.get('bufferedHttp');
    });
  });

  it('should be able to instantiate without non injected arguments', () => {
    expect(gateway instanceof LabeledThingInFrameGateway).toEqual(true);
  });

  it('should receive the list of labeled thing in frame objects', done => {
    const task = {id: 'someTaskId234'};
    const frameNumber = 2;
    const expectedUrl = `/backend/api/task/${task.id}/labeledThingInFrame/${frameNumber}`;
    const expectedResult = [
      new LabeledThingInFrame({id: 'abc', rev: 'bcd', shapes: [{type: 'rectangle'}]}),
      new LabeledThingInFrame({id: 'cde', rev: 'def', shapes: [{type: 'circle'}]}),
    ];

    $httpBackend
      .expect('GET', expectedUrl)
      .respond(200, {result: expectedResult});

    gateway.listLabeledThingInFrame(task, frameNumber)
      .then(result => {
        expect(result).toEqual(expectedResult);
        done();
      });

    bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
  });

  it('should get a labeled thing in frame by id', done => {
    const labeledThingInFrameId = '2';
    const expectedUrl = `/backend/api/labeledThingInFrame/${labeledThingInFrameId}`;
    const labeledThingInFrame = new LabeledThingInFrame({id: 'abc', rev: 'bcd', shapes: [{type: 'rectangle'}]});
    const expectedResult = {result: labeledThingInFrame};

    $httpBackend
      .expect('GET', expectedUrl)
      .respond(200, expectedResult);

    gateway.getLabeledThingInFrameById(labeledThingInFrameId)
      .then(result => {
        expect(result).toEqual(labeledThingInFrame);
        done();
      });

    bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
  });

  it('should save a labeled thing in frame', done => {
    const labeledThinIngFrame = new LabeledThingInFrame({id: 'abc', rev: 'bcd', shapes: [{type: 'rectangle'}]});
    const expectedUrl = `/backend/api/labeledThingInFrame/${labeledThinIngFrame.id}`;
    const expectedResult = {result: labeledThinIngFrame};

    $httpBackend
      .expect('PUT', expectedUrl)
      .respond(200, expectedResult);

    gateway.saveLabeledThingInFrame(labeledThinIngFrame)
      .then(result => {
        expect(result).toEqual(labeledThinIngFrame);
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
        .respond(200, {result: []});

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
        .respond(200, {result: []});

      gateway.listLabeledThingInFrame(task, frameNumber)
        .then(done);

      bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
    });
  });
});
