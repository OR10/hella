import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';

import BackendInterpolation from 'Application/LabelingData/Interpolations/BackendInterpolation';
import LabeledThing from 'Application/LabelingData/Models/LabeledThing';

describe('BackendInterpolation', () => {
  let $httpBackend;
  let interpolation;
  let bufferedHttp;
  let statusGateway;
  let labeledThingGateway;
  let $q;
  let $rootScope;

  class MockedBackendInterpolation extends BackendInterpolation {
    _getRemoteType() {
      return 'mocked-interpolation-type';
    }
  }

  function createLabeledThing(startFrameNumber = 1, endFrameNumber = 100, taskId = 'some-task-id', id = 'some-labeled-thing-id') {
    return new LabeledThing({
      id,
      taskId,
      classes: [],
      incomplete: false,
      frameRange: {startFrameNumber, endFrameNumber},
    });
  }

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

      statusGateway = {};
      $provide.value('statusGateway', statusGateway);
      labeledThingGateway = {};
      $provide.value('labeledThingGateway', labeledThingGateway);
    });

    inject($injector => {
      $httpBackend = $injector.get('$httpBackend');
      bufferedHttp = $injector.get('bufferedHttp');
      $q = $injector.get('$q');
      $rootScope = $injector.get('$rootScope');

      statusGateway.waitForJob = jasmine.createSpy('StatusGateway#waitForJob')
        .and.returnValue(
          $q.resolve({status: 'success'})
        );

      labeledThingGateway.getLabeledThing = jasmine.createSpy('LabeledThingGateway#getLabeledThing')
        .and.returnValue(
          $q.resolve(createLabeledThing())
        );

      interpolation = $injector.instantiate(MockedBackendInterpolation);
    });
  });

  it('should be able to instantiate without non injected arguments', () => {
    expect(interpolation instanceof BackendInterpolation).toEqual(true);
  });

  it('should communicate with backend', done => {
    const taskId = 'some-task-id';
    const labeledThingId = 'some-labeled-thing-id';
    const expectedUrl = `/backend/api/${taskId}/interpolate/${labeledThingId}`;
    const frameRange = {startFrameNumber: 1, endFrameNumber: 100};
    const status = {status: 'success'};
    const expectedResult = {result: status};

    $httpBackend
      .expect('POST', expectedUrl, {type: 'mocked-interpolation-type', offset: 0, limit: 100})
      .respond(200, expectedResult);

    interpolation.execute(taskId, labeledThingId, frameRange)
      .then(result => {
        expect(result).toEqual(status);
        done();
      });

    $rootScope.$digest();
    bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
  });

  it('should calculate limit and offset', done => {
    const taskId = 'some-task-id';
    const labeledThingId = 'some-labeled-thing-id';
    const expectedUrl = `/backend/api/${taskId}/interpolate/${labeledThingId}`;
    const frameRange = {startFrameNumber: 101, endFrameNumber: 150};
    const status = {status: 'success'};
    const expectedResult = {result: status};

    labeledThingGateway.getLabeledThing = jasmine.createSpy('LabeledThingGateway#getLabeledThing')
      .and.returnValue(
        $q.resolve(createLabeledThing(50, 200))
      );

    $httpBackend
      .expect('POST', expectedUrl, {type: 'mocked-interpolation-type', offset: 51, limit: 50})
      .respond(200, expectedResult);

    interpolation.execute(taskId, labeledThingId, frameRange)
      .then(result => {
        expect(result).toEqual(status);
        done();
      });

    $rootScope.$digest();
    bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
  });
});
