import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';

import DimensionPredictionGateway from 'Application/ThirdDimension/Gateways/DimensionPredictionGateway';
import CuboidDimensionPrediction from 'Application/ThirdDimension/Models/DimensionPrediction/Cuboid';

import LabeledThingFrontendModel from 'Tests/Fixtures/Models/Frontend/LabeledThing';

describe('DimensionPredictionGateway', () => {
  let $httpBackend;
  let gateway;
  let labeledThingFrontendModel;

  beforeEach(() => {
    labeledThingFrontendModel = LabeledThingFrontendModel.clone();
  });

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
      gateway = $injector.instantiate(DimensionPredictionGateway);
    });
  });

  it('should be instantiatable', () => {
    expect(gateway instanceof DimensionPredictionGateway).toBe(true);
  });

  it('should load a prediction', done => { // eslint-disable-line jasmine/missing-expect
    const predictionResponse = {
      result: {
        type: 'cuboid',
        prediction: {
          width: 123,
          height: 456,
          depth: 789,
        },
      },
    };

    $httpBackend.expectGET(`/backend/api/dimensionPrediction/${labeledThingFrontendModel.id}/42`).respond(predictionResponse);

    gateway.predictDimensionsFor(labeledThingFrontendModel, 42).then(() => done());

    $httpBackend.flush();
  });

  it('should return proper DimensionPrediction model', done => {
    const predictionResponse = {
      result: {
        type: 'cuboid',
        prediction: {
          width: 123,
          height: 456,
          depth: 789,
        },
      },
    };

    $httpBackend.expectGET(`/backend/api/dimensionPrediction/${labeledThingFrontendModel.id}/42`).respond(predictionResponse);

    gateway.predictDimensionsFor(labeledThingFrontendModel, 42).then(prediction => {
      const {width, height, depth} = prediction;

      expect(width).toEqual(123);
      expect(height).toEqual(456);
      expect(depth).toEqual(789);

      expect(prediction instanceof CuboidDimensionPrediction).toBeTruthy();

      done();
    });

    $httpBackend.flush();
  });

  it('should error on unknown prediction', done => {
    const predictionResponse = {
      result: {
        type: 'unknown-prediction-type',
        prediction: {
          foo: 'bar',
        },
      },
    };

    $httpBackend.expectGET(`/backend/api/dimensionPrediction/${labeledThingFrontendModel.id}/23`).respond(predictionResponse);

    gateway.predictDimensionsFor(labeledThingFrontendModel, 23)
      .then(() => fail('Promise should not be fulfilled'))
      .catch(error => {
        expect(error.message).toBe('Unknown dimensionPrediction#type: unknown-prediction-type');
        done();
      });

    $httpBackend.flush();
  });
});
