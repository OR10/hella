import 'jquery';
import 'angular';
import angularMocks from 'angular-mocks';

import TaskFrameLocationService from 'Application/Frame/Services/TaskFrameLocationService';

describe('TaskFrameLocationService', () => {
  let $httpBackend;
  let $httpParamSerializer;
  let service;

  beforeEach(angularMocks.inject($injector => {
    $httpBackend = $injector.get('$httpBackend');
    $httpParamSerializer = $injector.get('$httpParamSerializer');
    service = $injector.instantiate(TaskFrameLocationService);
  }));

  it('should be able to instantiate without non injected arguments', () => {
    expect(service instanceof TaskFrameLocationService).toEqual(true);
  });

  it('should by default request offset 0 with 1 frame', (done) => {
    const taskId = 'someTaskId423';
    const type = 'source';
    const path = `/api/task/${taskId}/frameLocations/${type}`;
    const expectedQuery = $httpParamSerializer({offset: 0, length: 1});
    const expectedUrl = `${path}?${expectedQuery}`;

    $httpBackend
      .expect('GET', expectedUrl)
      .respond(200, {result: []});

    service.getFrameLocations(taskId, type)
      .then(done);

    $httpBackend.flush();
  });

  using([
    [undefined, undefined, 0, 1],
    [undefined, 3, 0, 3],
    [42, undefined, 42, 1],
    [0, 1, 0, 1],
    [23, 3, 23, 3],
  ], (offset, length, expectedOffset, expectedLength) => {
    let taskId;
    let type;
    let expectedUrl;
    let expectedResult;

    beforeEach(() => {
      taskId = 'someTaskId423';
      type = 'source';

      const path = `/api/task/${taskId}/frameLocations/${type}`;
      const expectedQuery = $httpParamSerializer({offset: expectedOffset, length: expectedLength});

      expectedUrl = `${path}?${expectedQuery}`;

      expectedResult = [
        {id: 'xyz', frameNumber: 1, url: 'http://example.com', type: 'source'},
        {id: 'abc', frameNumber: 2, url: 'http://example.com', type: 'source'},
      ];
    });
    it('should request frame ranges as specified', done => {
      $httpBackend
        .expect('GET', expectedUrl)
        .respond(200, {result: expectedResult});

      service.getFrameLocations(taskId, type, offset, length)
        .then(done);

      $httpBackend.flush();
    });

    it('should receive the extracted response', done => {
      $httpBackend
        .expect('GET', expectedUrl)
        .respond(200, {result: expectedResult});

      service.getFrameLocations(taskId, type, offset, length)
        .then(result => {
          expect(result).toEqual(expectedResult);
          done();
        });

      $httpBackend.flush();
    });
  });

  using([
    ['source'],
    ['thumbnail'],
    ['foo'],
    ['bar'],
  ], (type) => {
    let taskId;
    let expectedUrl;

    beforeEach(() => {
      taskId = 'someTaskId423';
      const path = `/api/task/${taskId}/frameLocations/${type}`;
      const expectedQuery = $httpParamSerializer({offset: 0, length: 1});
      expectedUrl = `${path}?${expectedQuery}`;
    });
    it('should request type as specified', done => {
      $httpBackend
        .expect('GET', expectedUrl)
        .respond(200, {result: []});

      service.getFrameLocations(taskId, type)
        .then(done);

      $httpBackend.flush();
    });
  });

  using([
    ['abc'],
    ['1234'],
    ['taskIdUndSo'],
  ], (taskId) => {
    let type;
    let expectedUrl;

    beforeEach(() => {
      type = 'source';
      const path = `/api/task/${taskId}/frameLocations/${type}`;
      const expectedQuery = $httpParamSerializer({offset: 0, length: 1});
      expectedUrl = `${path}?${expectedQuery}`;
    });
    it('should request taskId as specified', done => {
      $httpBackend
        .expect('GET', expectedUrl)
        .respond(200, {result: []});

      service.getFrameLocations(taskId, type)
        .then(done);

      $httpBackend.flush();
    });
  });
});
