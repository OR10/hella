import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';

import Common from 'Application/Common/Common';
import FrameGateway from 'Application/Frame/Gateways/FrameGateway';

describe('FrameGateway', () => {
  let gateway;
  let createImageMock;
  let frameLocation;
  let $rootScope;

  beforeEach(() => {
    const featureFlags = {
      pouchdb: false,
    };

    const commonModule = new Common();
    commonModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.Common');

    module($provide => {
      $provide.value('applicationConfig', {
        Common: {
          apiPrefix: '/api',
          backendPrefix: '/backend',
        },
      });
    });

    inject($injector => {
      frameLocation = {id: 'abc', type: 'source', frameIndex: 23, url: 'http://example.com/frame/23.png'};

      createImageMock = (error = false) => {
        const OriginalImage = Image;
        const retVal = {
          restore() {
            window.Image = OriginalImage;
          },
          instance: null,
        };

        class ImageMockImpl {
          constructor() {
            this.__srcSpy = jasmine.createSpy();
            this.addEventListener = jasmine.createSpy().and.callFake((name, fn) => {
              if (name === 'load' && error !== true) {
                fn();
              } else if (name === 'error' && error === true) {
                fn('error!!1elf!!');
              }
            });
            retVal.instance = this;
          }

          set src(value) {
            this.__srcSpy(value);
          }
        }

        window.Image = ImageMockImpl;
        return retVal;
      };

      gateway = $injector.instantiate(FrameGateway);
      $rootScope = $injector.get('$rootScope');
    });
  });

  it('should be able to instantiate without non injected arguments', () => {
    expect(gateway instanceof FrameGateway).toEqual(true);
  });

  it('should request the url from the given location and return the image once loaded', done => {
    const mock = createImageMock(false);
    gateway.getImage(frameLocation)
      .then(image => {
        expect(image.__srcSpy).toHaveBeenCalled();
        expect(image.__srcSpy).toHaveBeenCalledWith(frameLocation.url);
        done();
      });

    $rootScope.$digest();

    mock.restore();
  });

  it('should reject in case an image loading error occurs', done => {
    const mock = createImageMock(true);
    gateway.getImage(frameLocation)
      .catch(error => {
        expect(error).toEqual('error!!1elf!!');
        done();
      });

    $rootScope.$digest();

    mock.restore();
  });
});
