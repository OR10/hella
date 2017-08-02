import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';

import FrameLocationGateway from 'Application/Frame/Gateways/FrameLocationGateway';

describe('FrameLocationGateway', () => {
  let $httpBackend;
  let $httpParamSerializer;
  let gateway;

  beforeEach(() => {
    const featureFlags = {};

    const commonModule = new Common();
    commonModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.Common');

    module(($provide, bufferedHttpProvider) => {
      $provide.value('applicationConfig', {
        Common: {
          apiPrefix: '/api',
          backendPrefix: '/backend',
        },
      });

      bufferedHttpProvider.disableAutoExtractionAndInjection();
    });

    inject($injector => {
      $httpBackend = $injector.get('$httpBackend');
      $httpParamSerializer = $injector.get('$httpParamSerializer');
      gateway = $injector.instantiate(FrameLocationGateway);
    });
  });

  it('should be able to instantiate without non injected arguments', () => {
    expect(gateway instanceof FrameLocationGateway).toEqual(true);
  });

  it('should by default request offset 0 with 1 frame', done => { // eslint-disable-line jasmine/missing-expect
    const taskId = 'someTaskId423';
    const type = 'source';
    const path = `/backend/api/v1/task/${taskId}/frameLocations/${type}`;
    const expectedQuery = $httpParamSerializer({offset: 0, limit: 1});
    const expectedUrl = `${path}?${expectedQuery}`;

    $httpBackend
      .expect('GET', expectedUrl)
      .respond(200, {result: []});

    gateway.getFrameLocations(taskId, type)
      .then(done);

    $httpBackend.flush();
  });

  using([
    [undefined, undefined, 0, 1],
    [undefined, 3, 0, 3],
    [42, undefined, 42, 1],
    [0, 1, 0, 1],
    [23, 3, 23, 3],
  ], (offset, limit, expectedOffset, expectedLimit) => {
    let taskId;
    let type;
    let expectedUrl;
    let expectedResult;

    beforeEach(() => {
      taskId = 'someTaskId423';
      type = 'source';

      const path = `/backend/api/v1/task/${taskId}/frameLocations/${type}`;
      const expectedQuery = $httpParamSerializer({offset: expectedOffset, limit: expectedLimit});

      expectedUrl = `${path}?${expectedQuery}`;

      expectedResult = [
        {id: 'xyz', frameIndex: 0, url: 'http://example.com', type: 'source'},
        {id: 'abc', frameIndex: 1, url: 'http://example.com', type: 'source'},
      ];
    });

    it('should request frame ranges as specified', done => { // eslint-disable-line jasmine/missing-expect
      $httpBackend
        .expect('GET', expectedUrl)
        .respond(200, {result: expectedResult});

      gateway.getFrameLocations(taskId, type, offset, limit)
        .then(done);

      $httpBackend.flush();
    });

    it('should receive the extracted response', done => {
      $httpBackend
        .expect('GET', expectedUrl)
        .respond(200, {result: expectedResult});

      gateway.getFrameLocations(taskId, type, offset, limit)
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
  ], type => {
    let taskId;
    let expectedUrl;

    beforeEach(() => {
      taskId = 'someTaskId423';
      const path = `/backend/api/v1/task/${taskId}/frameLocations/${type}`;
      const expectedQuery = $httpParamSerializer({offset: 0, limit: 1});
      expectedUrl = `${path}?${expectedQuery}`;
    });

    it('should request type as specified', done => { // eslint-disable-line jasmine/missing-expect
      $httpBackend
        .expect('GET', expectedUrl)
        .respond(200, {result: []});

      gateway.getFrameLocations(taskId, type)
        .then(done);

      $httpBackend.flush();
    });
  });

  using([
    ['abc'],
    ['1234'],
    ['taskIdUndSo'],
  ], taskId => {
    let type;
    let expectedUrl;

    beforeEach(() => {
      type = 'source';
      const path = `/backend/api/v1/task/${taskId}/frameLocations/${type}`;
      const expectedQuery = $httpParamSerializer({offset: 0, limit: 1});
      expectedUrl = `${path}?${expectedQuery}`;
    });

    it('should request taskId as specified', done => { // eslint-disable-line jasmine/missing-expect
      $httpBackend
        .expect('GET', expectedUrl)
        .respond(200, {result: []});

      gateway.getFrameLocations(taskId, type)
        .then(done);

      $httpBackend.flush();
    });
  });
});
