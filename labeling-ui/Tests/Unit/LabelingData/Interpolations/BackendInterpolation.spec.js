import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';

import BackendInterpolation from 'Application/LabelingData/Interpolations/BackendInterpolation';
import LabeledThing from 'Application/LabelingData/Models/LabeledThing';

describe('BackendInterpolation', () => {
  let $httpBackend;
  let interpolation;
  let statusGateway;
  let labeledThingGateway;
  let $q;
  let $rootScope;

  class MockedBackendInterpolation extends BackendInterpolation {
    _getRemoteType() {
      return 'mocked-interpolation-type';
    }
  }

  function createLabeledThing(startFrameIndex = 0, endFrameIndex = 99, task = {id: 'some-task-id'}, id = 'some-labeled-thing-id') {
    return new LabeledThing({
      id,
      task,
      classes: [],
      incomplete: false,
      frameRange: {startFrameIndex, endFrameIndex},
    });
  }

  beforeEach(() => {
    const featureFlags = {
      pouchdb: false,
    };
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

      statusGateway = {};
      $provide.value('statusGateway', statusGateway);
      labeledThingGateway = {};
      $provide.value('labeledThingGateway', labeledThingGateway);
    });

    inject($injector => {
      $httpBackend = $injector.get('$httpBackend');
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
    const task = {id: 'some-task-id'};
    const labeledThingId = 'some-labeled-thing-id';
    const labeledThing = createLabeledThing(0, 200, task, labeledThingId);
    const expectedUrl = `/backend/api/task/${task.id}/interpolate/${labeledThingId}`;
    const frameRange = {startFrameIndex: 0, endFrameIndex: 10};
    const status = {status: 'success'};
    const expectedResult = {result: status};

    $httpBackend
      .expect('POST', expectedUrl, {type: 'mocked-interpolation-type', offset: 0, limit: 11})
      .respond(200, expectedResult);

    interpolation.execute(task, labeledThing, frameRange)
      .then(result => {
        expect(result).toEqual(status);
        done();
      });

    $rootScope.$digest();
    $httpBackend.flush();
  });

  it('should calculate limit and offset', done => {
    const task = {id: 'some-task-id'};
    const labeledThingId = 'some-labeled-thing-id';
    const labeledThing = createLabeledThing(50, 200, task, labeledThingId);
    const expectedUrl = `/backend/api/task/${task.id}/interpolate/${labeledThingId}`;
    const frameRange = {startFrameIndex: 100, endFrameIndex: 150};
    const status = {status: 'success'};
    const expectedResult = {result: status};

    labeledThingGateway.getLabeledThing = jasmine.createSpy('LabeledThingGateway#getLabeledThing')
      .and.returnValue(
        $q.resolve(labeledThing)
      );

    $httpBackend
      .expect('POST', expectedUrl, {type: 'mocked-interpolation-type', offset: 50, limit: 51})
      .respond(200, expectedResult);

    interpolation.execute(task, labeledThing, frameRange)
      .then(result => {
        expect(result).toEqual(status);
        done();
      });

    $rootScope.$digest();
    $httpBackend.flush();
  });
});
