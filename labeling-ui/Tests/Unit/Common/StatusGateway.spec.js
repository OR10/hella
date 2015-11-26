import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';

import StatusGateway from 'Application/Common/Gateways/StatusGateway';

describe('Status', () => {
  let $httpBackend;
  let $timeout;
  let gateway;
  let bufferedHttp;
  let job;

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

      bufferedHttpProvider.enableFlushFunctionality();
      bufferedHttpProvider.disableAutoExtractionAndInjection();
    });

    inject($injector => {
      $httpBackend = $injector.get('$httpBackend');
      $timeout = $injector.get('$timeout');
      gateway = $injector.instantiate(StatusGateway);
      bufferedHttp = $injector.get('bufferedHttp');
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

    bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
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

    bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
  });

  it('should poll for jobs while not finished', done => {
    const expectedUrl = `/backend/api/status/${job.type}/${job.id}`;
    const statusInProgress = {status: 'running'};
    const statusFinished = {status: 'success'};
    const resultInProgress = {result: statusInProgress};
    const resultFinished = {result: statusFinished};

    const flush = (timeoutFlush = true) => bufferedHttp.flushBuffers()
      .then(() => {
        $httpBackend.flush();
        if (timeoutFlush) {
          return $timeout.flush();
        }
      });

    Promise.resolve()
      .then(() => {
        $httpBackend
          .expect('GET', expectedUrl)
          .respond(200, resultInProgress);

        gateway.waitForJob(job)
          .then(result => {
            expect(result).toEqual(statusFinished);
            done();
          });
        return flush();
      })
      .then(() => {
        $httpBackend
          .expect('GET', expectedUrl)
          .respond(200, resultInProgress);

        return flush();
      })
      .then(() => {
        $httpBackend
          .expect('GET', expectedUrl)
          .respond(200, resultFinished);

        return flush(false);
      });
  });

  it('should rejected failed jobs while polling', done => {
    const expectedUrl = `/backend/api/status/${job.type}/${job.id}`;
    const statusInProgress = {status: 'running'};
    const statusError = {status: 'error'};
    const resultInProgress = {result: statusInProgress};
    const resultError = {result: statusError};

    const flush = (timeoutFlush = true) => bufferedHttp.flushBuffers()
      .then(() => {
        $httpBackend.flush();
        if (timeoutFlush) {
          return $timeout.flush();
        }
      });

    Promise.resolve()
      .then(() => {
        $httpBackend
          .expect('GET', expectedUrl)
          .respond(200, resultInProgress);

        gateway.waitForJob(job)
          .catch(result => {
            expect(result).toEqual(statusError);
            done();
          });
        return flush();
      })
      .then(() => {
        $httpBackend
          .expect('GET', expectedUrl)
          .respond(200, resultInProgress);

        return flush();
      })
      .then(() => {
        $httpBackend
          .expect('GET', expectedUrl)
          .respond(200, resultError);

        return flush(false);
      });
  });

  it('should only wait specified maxWait while polling for jobs to be finished', done => {
    const expectedUrl = `/backend/api/status/${job.type}/${job.id}`;
    const statusInProgress = {status: 'running'};
    const statusFinished = {status: 'success'};
    const resultInProgress = {result: statusInProgress};
    const resultFinished = {result: statusFinished};

    const flush = (timeoutFlush = true) => bufferedHttp.flushBuffers()
      .then(() => {
        $httpBackend.flush();
        if (timeoutFlush) {
          return $timeout.flush();
        }
      });

    Promise.resolve()
      .then(() => {
        $httpBackend
          .expect('GET', expectedUrl)
          .respond(200, resultInProgress);

        gateway.waitForJob(job, 7000)
          .catch((error) => {
            done();
          });

        return flush();
      })
      .then(() => {
        $httpBackend
          .expect('GET', expectedUrl)
          .respond(200, resultInProgress);

        return flush();
      })
      .then(() => {
        $httpBackend
          .expect('GET', expectedUrl)
          .respond(200, resultInProgress);

        return flush(false);
      });
  });

  it('should adhere to given interval', done => {
    const expectedUrl = `/backend/api/status/${job.type}/${job.id}`;
    const statusInProgress = {status: 'running'};
    const statusFinished = {status: 'success'};
    const resultInProgress = {result: statusInProgress};
    const resultFinished = {result: statusFinished};

    const flushHttp = () => bufferedHttp.flushBuffers()
      .then(() => {
        $httpBackend.flush();
      });

    Promise.resolve()
      .then(() => {
        $httpBackend
          .expect('GET', expectedUrl)
          .respond(200, resultInProgress);

        gateway.waitForJob(job, 1000)
          .then((result) => {
            expect(result).toEqual(statusFinished);
            done();
          });

        return flushHttp().then(() => $timeout.flush(800));
      })
      .then(() => {
        return $timeout.flush(500);
      })
      .then(() => {
        $httpBackend
          .expect('GET', expectedUrl)
          .respond(200, resultFinished);

        return flushHttp();
      });
  });

});
