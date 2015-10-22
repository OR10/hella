import 'jquery';
import 'angular';
import angularMocks from 'angular-mocks';

import FrameService from 'Application/Frame/Services/FrameService';

describe('FrameService', () => {
  let service;
  let createImageMock;
  let frameLocation;

  beforeEach(angularMocks.inject($injector => {
    frameLocation = {id: 'abc', type: 'source', frameNumber: 23, url: 'http://example.com/frame/23.png'};

    createImageMock = (error = false) => {
      const OriginalImage = Image;
      const retVal = {
        restore() {window.Image = OriginalImage;},
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

        set src(value) {this.__srcSpy(value);}
      }

      window.Image = ImageMockImpl;
      return retVal;
    };

    service = $injector.instantiate(FrameService);
  }));

  it('should be able to instantiate without non injected arguments', () => {
    expect(service instanceof FrameService).toEqual(true);
  });

  it('should request the url from the given location and return the image once loaded', done => {
    const mock = createImageMock(false);
    service.getImage(frameLocation)
      .then((image) => {
        expect(image.__srcSpy).toHaveBeenCalled();
        expect(image.__srcSpy).toHaveBeenCalledWith(frameLocation.url);
        done();
      });
    mock.restore();
  });

  it('should reject in case an image loading error occurs', done => {
    const mock = createImageMock(true);
    service.getImage(frameLocation)
      .catch((error) => {
        expect(error).toEqual('error!!1elf!!');
        done();
      });
    mock.restore();
  });
});
