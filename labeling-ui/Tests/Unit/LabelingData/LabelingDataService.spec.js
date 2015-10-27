import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';

import LabelingDataService from 'Application/LabelingData/Services/LabelingDataService';

describe('LabelingDataService', () => {
  let $httpBackend;
  let $httpParamSerializer;
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
      $httpParamSerializer = $injector.get('$httpParamSerializer');
      service = $injector.instantiate(LabelingDataService);
    });
  });

  it('should be able to instantiate without non injected arguments', () => {
    expect(service instanceof LabelingDataService).toEqual(true);
  });

  it('should receive the extracted response', done => {
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

    service.getLabeledThingsInFrame(task, frameNumber)
      .then(result => {
        expect(result).toEqual(expectedResult);
        done();
      });

    $httpBackend.flush();
  });

  it('should save a labeling data object', done => {
    const task = {id: 'someTaskId234'};
    const frameNumber = 2;
    const expectedUrl = `/backend/api/task/${task.id}/labeledThingInFrame/${frameNumber}`;
    const labelingDataObject = {id: 'abc', rev: 'bcd', shapes: [{type: 'rectangle'}]};
    const expectedResult = {success: true};

    $httpBackend
      .expect('POST', expectedUrl)
      .respond(200, expectedResult);

    service.createLabeledThingsInFrame(task, frameNumber, labelingDataObject)
      .then(result => {
        expect(result).toEqual(true);
        done();
      });

    $httpBackend.flush();
  });

  it('should update a labeling data objects', done => {
    const task = {id: 'someTaskId234'};
    const frameNumber = 2;
    const expectedUrl = `/backend/api/task/${task.id}/labeledThingInFrame/${frameNumber}`;
    const labelingDataObjects = [
      {id: 'abc', rev: 'bcd', shapes: [{type: 'rectangle'}]},
      {id: 'cde', rev: 'def', shapes: [{type: 'circle'}]},
    ];
    const expectedResult = {success: true};

    $httpBackend
      .expect('PUT', expectedUrl)
      .respond(200, expectedResult);

    service.updateLabeledThingsInFrame(task, frameNumber, labelingDataObjects)
      .then(result => {
        expect(result).toEqual(true);
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

    it('should request the task as specified', done => {
      $httpBackend
        .expect('GET', expectedUrl)
        .respond(200, {result: []});

      service.getLabeledThingsInFrame(task, frameNumber)
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

    it('should request the frame as specified', done => {
      $httpBackend
        .expect('GET', expectedUrl)
        .respond(200, {result: []});

      service.getLabeledThingsInFrame(task, frameNumber)
        .then(done);

      $httpBackend.flush();
    });
  });
});
