import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';

import VideoGateway from 'Application/Video/Gateways/VideoGateway';

describe('VideoGateway', () => {
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
      gateway = $injector.instantiate(VideoGateway);
    });
  });

  it('should be able to instantiate without non injected arguments', () => {
    expect(gateway instanceof VideoGateway).toEqual(true);
  });

  it('should load all videos', done => {
    const videoResponse = {
      'result': [{
        'id': '16b00780792d045c496513f01f006f09',
        'name': 'anno_shortBotrxV',
        'metaData': {},
        'imageTypeConvertedStatus': {},
      }, {
        'id': '16b00780792d045c496513f01f006f09',
        'name': 'anno_shortBotrxV',
        'metaData': {},
        'imageTypeConvertedStatus': {},
      }],
    };

    $httpBackend.expectGET('/backend/api/video').respond(videoResponse);

    gateway.getVideos().then(videos => {
      expect(videos).toEqual(videoResponse.result);
      done();
    });

    $httpBackend.flush();
  });

  it('should load information for a single video', done => {
    const videoResponse = {
      'result': {
        'id': '16b00780792d045c496513f01f006f09',
        'name': 'anno_shortBotrxV',
        'metaData': {},
        'imageTypeConvertedStatus': {},
      },
    };

    $httpBackend.expectGET('/backend/api/video/16b00780792d045c496513f01f006f09').respond(videoResponse);

    gateway.getVideo('16b00780792d045c496513f01f006f09').then(response => {
      expect(response).toEqual(videoResponse.result);
      done();
    });

    $httpBackend.flush();
  });
});
