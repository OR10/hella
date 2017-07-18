import 'jquery';
import angular from 'angular';
import {inject, module} from 'angular-mocks';
import Common from 'Application/Common/Common';

import StatusGateway from 'Application/Common/Gateways/StatusGateway';

describe('StatusGateway', () => {
  let $httpBackend;
  let $timeout;
  let gateway;
  let job;

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
      $timeout = $injector.get('$timeout');
      gateway = $injector.instantiate(StatusGateway);
    });

    job = {
      type: 'someAwesomeJobType',
      id: '423-or-what?',
    };
  });

  it('should be able to instantiate without non injected arguments', () => {
    expect(gateway instanceof StatusGateway).toEqual(true);
  });


  it('should get status for job', done => {
    const expectedUrl = `/backend/api/status/${job.type}/${job.id}`;
    const status = {status: 'success'};
    const expectedResult = {result: status};

    $httpBackend
      .expect('GET', expectedUrl)
      .respond(200, expectedResult);

    gateway.getStatus(job)
      .then(result => {
        expect(result).toEqual(status);
        done();
      });

    $httpBackend.flush();
  });

  it('should get status for errored jobs without failing', done => {
    const expectedUrl = `/backend/api/status/${job.type}/${job.id}`;
    const status = {status: 'error'};
    const expectedResult = {result: status};

    $httpBackend
      .expect('GET', expectedUrl)
      .respond(200, expectedResult);

    gateway.getStatus(job)
      .then(result => {
        expect(result).toEqual(status);
        done();
      });

    $httpBackend.flush();
  });

  it('should poll for jobs while not finished', done => {
    const expectedUrl = `/backend/api/status/${job.type}/${job.id}`;
    const statusInProgress = {status: 'running'};
    const statusFinished = {status: 'success'};
    const resultInProgress = {result: statusInProgress};
    const resultFinished = {result: statusFinished};

    gateway.waitForJob(job)
      .then(result => {
        expect(result).toEqual(statusFinished);
        done();
      });

    $httpBackend
      .expect('GET', expectedUrl)
      .respond(200, resultInProgress);
    $httpBackend.flush();

    $httpBackend
      .expect('GET', expectedUrl)
      .respond(200, resultInProgress);
    $timeout.flush();
    $httpBackend.flush();

    $httpBackend
      .expect('GET', expectedUrl)
      .respond(200, resultFinished);
    $timeout.flush();
    $httpBackend.flush();
  });

  it('should rejected failed jobs while polling', done => {
    const expectedUrl = `/backend/api/status/${job.type}/${job.id}`;
    const statusInProgress = {status: 'running'};
    const statusError = {status: 'error'};
    const resultInProgress = {result: statusInProgress};
    const resultError = {result: statusError};

    gateway.waitForJob(job)
      .catch(result => {
        expect(result).toEqual(statusError);
        done();
      });

    $httpBackend
      .expect('GET', expectedUrl)
      .respond(200, resultInProgress);
    $httpBackend.flush();

    $httpBackend
      .expect('GET', expectedUrl)
      .respond(200, resultInProgress);
    $timeout.flush();
    $httpBackend.flush();

    $httpBackend
      .expect('GET', expectedUrl)
      .respond(200, resultError);
    $timeout.flush();
    $httpBackend.flush();
  });

  it('should only wait specified maxWait while polling for jobs to be finished', done => { // eslint-disable-line jasmine/missing-expect
    const expectedUrl = `/backend/api/status/${job.type}/${job.id}`;
    const statusInProgress = {status: 'running'};
    const resultInProgress = {result: statusInProgress};

    gateway.waitForJob(job, 7000)
      .catch(() => {
        done();
      });

    $httpBackend
      .expect('GET', expectedUrl)
      .respond(200, resultInProgress);
    $httpBackend.flush();

    $httpBackend
      .expect('GET', expectedUrl)
      .respond(200, resultInProgress);
    $timeout.flush();
    $httpBackend.flush();

    $httpBackend
      .expect('GET', expectedUrl)
      .respond(200, resultInProgress);
    $timeout.flush();
    $httpBackend.flush();
  });

  it('should adhere to given interval', done => {
    const expectedUrl = `/backend/api/status/${job.type}/${job.id}`;
    const statusInProgress = {status: 'running'};
    const statusFinished = {status: 'success'};
    const resultInProgress = {result: statusInProgress};
    const resultFinished = {result: statusFinished};

    gateway.waitForJob(job, 1000)
      .then(result => {
        expect(result).toEqual(statusFinished);
        done();
      });

    $httpBackend
      .expect('GET', expectedUrl)
      .respond(200, resultInProgress);
    $httpBackend.flush();
    $timeout.flush(800);

    $httpBackend
      .expect('GET', expectedUrl)
      .respond(200, resultFinished);
    $timeout.flush(500);
    $httpBackend.flush();
  });
});
