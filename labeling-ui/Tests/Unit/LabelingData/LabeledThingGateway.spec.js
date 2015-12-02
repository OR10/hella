import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';

import LabeledThingGateway from 'Application/LabelingData/Gateways/LabeledThingGateway';
import LabeledThing from 'Application/LabelingData/Models/LabeledThing';

describe('LabeledThingGateway', () => {
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
      gateway = $injector.instantiate(LabeledThingGateway);
      bufferedHttp = $injector.get('bufferedHttp');
    });
  });

  it('should be able to instantiate without non injected arguments', () => {
    expect(gateway instanceof LabeledThingGateway).toEqual(true);
  });

  it('should receive a labeled thing by id', done => {
    const task = {id: 'someTaskId234'};
    const labeledThingId = '123';
    const expectedUrl = `/backend/api/task/${task.id}/labeledThing/${labeledThingId}`;

    const expectedResult = new LabeledThing({
      task,
      id: '123',
      rev: '1-abcdef',
      frameRange: {startFrameNumber: 23, endFrameNumber: 42},
      classes: ['foo', 'bar'],
    });

    $httpBackend
      .expect('GET', expectedUrl)
      .respond(200, {result: expectedResult});

    gateway.getLabeledThing(task, labeledThingId)
      .then(result => {
        expect(result).toEqual(expectedResult);
        done();
      });

    bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
  });

  it('should save a labeled thing', done => {
    const task = {id: '456'};
    const labeledThingId = '123';
    const expectedUrl = `/backend/api/task/${task.id}/labeledThing/${labeledThingId}`;

    const labeledThing = new LabeledThing({
      task,
      id: labeledThingId,
      rev: '1-abcdef',
      frameRange: {startFrameNumber: 23, endFrameNumber: 42},
      classes: ['foo', 'bar'],
    });

    const expectedResult = {result: labeledThing};

    $httpBackend
      .expect('PUT', expectedUrl, labeledThing)
      .respond(200, expectedResult);

    gateway.saveLabeledThing(labeledThing)
      .then(result => {
        expect(result).toEqual(labeledThing);
        done();
      });

    bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
  });
});
