import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';

import LabeledFrameGateway from 'Application/LabelingData/Gateways/LabeledFrameGateway';
import LabeledFrame from 'Application/LabelingData/Models/LabeledFrame';

describe('LabeledFrameGateway', () => {
  let $httpBackend;
  let gateway;

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
    });

    inject($injector => {
      $httpBackend = $injector.get('$httpBackend');
      gateway = $injector.instantiate(LabeledFrameGateway);
    });
  });

  it('should be able to instantiate without non injected arguments', () => {
    expect(gateway instanceof LabeledFrameGateway).toEqual(true);
  });


  it('should get a labeled frame', done => {
    const taskId = '2';
    const frameNumber = 2;
    const expectedUrl = `/backend/api/task/${taskId}/labeledFrame/${frameNumber}`;
    const labeledFrame = new LabeledFrame({id: 'abc', rev: 'bcd', classes: ['a', 'b', 'c']});
    const expectedResult = {result: labeledFrame};

    $httpBackend
      .expect('GET', expectedUrl)
      .respond(200, expectedResult);

    gateway.getLabeledFrame(taskId, frameNumber)
      .then(result => {
        expect(result).toEqual(labeledFrame);
        done();
      });

    $httpBackend.flush();
  });

  it('should save a labeled frame', done => {
    const taskId = '2';
    const frameNumber = 2;
    const expectedUrl = `/backend/api/task/${taskId}/labeledFrame/${frameNumber}`;
    const labeledFrame = new LabeledFrame({id: 'abc', rev: 'bcd', classes: ['a', 'b', 'c']});
    const expectedResult = {result: labeledFrame};

    $httpBackend
      .expect('PUT', expectedUrl, labeledFrame)
      .respond(200, expectedResult);

    gateway.saveLabeledFrame(taskId, frameNumber, labeledFrame)
      .then(result => {
        expect(result).toEqual(labeledFrame);
        done();
      });

    $httpBackend.flush();
  });


  it('should delete a labeled thing in frame', done => {
    const taskId = '2';
    const frameNumber = 2;
    const expectedUrl = `/backend/api/task/${taskId}/labeledFrame/${frameNumber}`;
    const expectedResult = true;

    $httpBackend
      .expect('DELETE', expectedUrl)
      .respond(200, expectedResult);

    gateway.deleteLabeledFrame(taskId, frameNumber)
      .then(result => {
        expect(result).toEqual(expectedResult);
        done();
      });

    $httpBackend.flush();
  });
});
