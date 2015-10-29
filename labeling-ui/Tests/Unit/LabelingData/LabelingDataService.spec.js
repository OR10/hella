import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';

import LabelingDataService from 'Application/LabelingData/Services/LabelingDataService';

describe('LabelingDataService', () => {
  let $httpBackend;
  let service;

  beforeEach(() => {
    const commonModule = new Common();
    commonModule.registerWithAngular(angular);
    module('AnnoStation.Common');

    module($provide => {
      $provide.value('applicationConfig', {
        Common: {
          apiPrefix: '/api',
          backendPrefix: '/backend',
        },
      });
    });

    inject($injector => {
      $httpBackend = $injector.get('$httpBackend');
      service = $injector.instantiate(LabelingDataService);
    });
  });

  it('should be able to instantiate without non injected arguments', () => {
    expect(service instanceof LabelingDataService).toEqual(true);
  });

  it('should receive the list of labeled thing in frame objects', done => {
    const task = {id: 'someTaskId234'};
    const frameNumber = 2;
    const expectedUrl = `/backend/api/task/${task.id}/labeledThingInFrame/${frameNumber}`;
    const expectedResult = [
      {id: 'abc', rev: 'bcd', shapes: [{type: 'rectangle'}]},
      {id: 'cde', rev: 'def', shapes: [{type: 'circle'}]},
    ];

    $httpBackend
      .expect('GET', expectedUrl)
      .respond(200, {result: expectedResult});

    service.listLabeledThingInFrame(task, frameNumber)
      .then(result => {
        expect(result).toEqual(expectedResult);
        done();
      });

    $httpBackend.flush();
  });

  it('should get a labeled thing in frame', done => {
    const labeledThingInFrameId = '2';
    const expectedUrl = `/backend/api/labeledThingInFrame/${labeledThingInFrameId}`;
    const labeledThingInFrame = {id: 'abc', rev: 'bcd', shapes: [{type: 'rectangle'}]};
    const expectedResult = {result: labeledThingInFrame};

    $httpBackend
      .expect('GET', expectedUrl)
      .respond(200, expectedResult);

    service.getLabeledThingInFrame(labeledThingInFrameId)
      .then(result => {
        expect(result).toEqual(labeledThingInFrame);
        done();
      });

    $httpBackend.flush();
  });

  it('should create a labeled thing in frame', done => {
    const task = {id: 'someTaskId234'};
    const frameNumber = 2;
    const expectedUrl = `/backend/api/task/${task.id}/labeledThingInFrame/${frameNumber}`;
    const labeledThingInFrame = {id: 'abc', rev: 'bcd', shapes: [{type: 'rectangle'}]};
    const expectedResult = {result: labeledThingInFrame};

    $httpBackend
      .expect('POST', expectedUrl)
      .respond(200, expectedResult);

    service.createLabeledThingInFrame(task, frameNumber, labeledThingInFrame)
      .then(result => {
        expect(result).toEqual(labeledThingInFrame);
        done();
      });

    $httpBackend.flush();
  });

  it('should update a labeled thing in frame', done => {
    const labeledThinIngFrame = {id: 'abc', rev: 'bcd', shapes: [{type: 'rectangle'}]};
    const expectedUrl = `/backend/api/labeledThingInFrame/${labeledThinIngFrame.id}`;
    const expectedResult = {result: labeledThinIngFrame};

    $httpBackend
      .expect('PUT', expectedUrl)
      .respond(200, expectedResult);

    service.updateLabeledThingInFrame(labeledThinIngFrame)
      .then(result => {
        expect(result).toEqual(labeledThinIngFrame);
        done();
      });

    $httpBackend.flush();
  });

  it('should delete a labeled thing in frame', done => {
    const labeledThingInFrameId = '2';
    const expectedUrl = `/backend/api/labeledThingInFrame/${labeledThingInFrameId}`;
    const expectedResult = true;

    $httpBackend
      .expect('DELETE', expectedUrl)
      .respond(200, expectedResult);

    service.deleteLabeledThingInFrame(labeledThingInFrameId)
      .then(result => {
        expect(result).toEqual(expectedResult);
        done();
      });

    $httpBackend.flush();
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

      service.listLabeledThingInFrame(task, frameNumber)
        .then(done);

      $httpBackend.flush();
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

      service.listLabeledThingInFrame(task, frameNumber)
        .then(done);

      $httpBackend.flush();
    });
  });

  using([
    ['1'],
    ['2'],
    ['3'],
    ['4'],
  ], (labeledThingInFrameId) => {
    const expectedUrl = `/backend/api/labeledThingInFrame/${labeledThingInFrameId}`;

    it('should request the labeled thing in frame id as specified', done => {
      $httpBackend
        .expect('GET', expectedUrl)
        .respond(200, {result: []});

      service.getLabeledThingInFrame(labeledThingInFrameId)
        .then(done);

      $httpBackend.flush();
    });
  });
});
