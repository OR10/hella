import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';

import VideoGateway from 'Application/Video/Gateways/VideoGateway';

describe('VideoGateway', () => {
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

      bufferedHttpProvider.enableFlushFunctionality();
      bufferedHttpProvider.disableAutoExtractionAndInjection();
    });

    inject($injector => {
      $httpBackend = $injector.get('$httpBackend');
      gateway = $injector.instantiate(VideoGateway);
      bufferedHttp = $injector.get('bufferedHttp');
    });
  });

  it('should be able to instantiate without non injected arguments', () => {
    expect(gateway instanceof VideoGateway).toEqual(true);
  });

  it('should load all videos', (done) => {
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

    gateway.getVideos().then((videos) => {
      expect(videos).toEqual(videoResponse.result);
      done();
    });

    bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
  });

  it('should load information for a single video', (done) => {
    const videoResponse = {
      'result': {
        'id': '16b00780792d045c496513f01f006f09',
        'name': 'anno_shortBotrxV',
        'metaData': {},
        'imageTypeConvertedStatus': {},
      },
    };

    $httpBackend.expectGET('/backend/api/video/16b00780792d045c496513f01f006f09').respond(videoResponse);

    gateway.getVideo('16b00780792d045c496513f01f006f09').then((response) => {
      expect(response).toEqual(videoResponse.result);
      done();
    });

    bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
  });
});
