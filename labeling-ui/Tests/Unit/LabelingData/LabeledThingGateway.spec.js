import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';

import Common from 'Application/Common/Common';
import LabelingData from 'Application/LabelingData/LabelingData';

import LabeledThingGateway from 'Application/LabelingData/Gateways/LabeledThingGateway';
import LabeledThing from 'Application/LabelingData/Models/LabeledThing';

describe('LabeledThingGateway', () => {
  let $httpBackend;
  let gateway;
  let revisionManager;

  beforeEach(() => {
    const featureFlags = {
      pouchdb: false,
    };

    const commonModule = new Common();
    commonModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.Common');

    const labelingDataModule = new LabelingData();
    labelingDataModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.LabelingData');

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
      gateway = $injector.instantiate(LabeledThingGateway);
      revisionManager = $injector.get('revisionManager');
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
      projectId: 'some-project',
      id: '123',
      rev: '1-abcdef',
      frameRange: {startFrameIndex: 23, endFrameIndex: 42},
      classes: ['foo', 'bar'],
    });

    $httpBackend
      .expect('GET', expectedUrl)
      .respond(200, {result: expectedResult.toJSON()});

    gateway.getLabeledThing(task, labeledThingId)
      .then(result => {
        expect(result).toEqual(expectedResult);
        done();
      });

    $httpBackend.flush();
  });

  it('should save a labeled thing', done => {
    const task = {id: '456'};
    const labeledThingId = '123';
    const expectedUrl = `/backend/api/task/${task.id}/labeledThing/${labeledThingId}`;

    const labeledThing = new LabeledThing({
      task,
      projectId: 'some-project',
      id: labeledThingId,
      rev: '1-abcdef',
      frameRange: {startFrameIndex: 23, endFrameIndex: 42},
      classes: ['foo', 'bar'],
    });

    $httpBackend
      .expect('PUT', expectedUrl, labeledThing)
      .respond(200, {result: labeledThing.toJSON()});

    gateway.saveLabeledThing(labeledThing)
      .then(result => {
        expect(result).toEqual(labeledThing);
        done();
      });

    $httpBackend.flush();
  });

  it('should delete a labeled thing', done => {
    const task = {id: '456'};
    const labeledThingId = '123';
    const expectedUrl = `/backend/api/task/${task.id}/labeledThing/${labeledThingId}?rev=1-abcdef`;

    revisionManager.updateRevision(labeledThingId, '1-abcdef');

    const labeledThing = new LabeledThing({
      task,
      projectId: 'some-project',
      id: labeledThingId,
      rev: '1-xyz',
      frameRange: {startFrameIndex: 23, endFrameIndex: 42},
      classes: ['foo', 'bar'],
    });

    const expectedResult = {
      result: {
        success: true,
      },
    };

    $httpBackend
      .expect('DELETE', expectedUrl)
      .respond(200, expectedResult);

    gateway.deleteLabeledThing(labeledThing)
      .then(result => {
        expect(result).toBeTruthy();
        done();
      });

    $httpBackend.flush();
  });

  it('should receive the labeled thing incomplete count', done => {
    const taskResponse = {
      result: {count: 1234},
    };

    $httpBackend.expectGET('/backend/api/task/9a8zsdhfion/labeledThingsIncompleteCount').respond(taskResponse);

    gateway.getIncompleteLabeledThingCount({id: '9a8zsdhfion'}).then(result => {
      expect(result).toEqual(taskResponse.result);
      done();
    });

    $httpBackend.flush();
  });
});
