import {inject} from 'angular-mocks';
import {cloneDeep} from 'lodash';
import sourceJpgFrameLocationsFixture from '../../Fixtures/Models/Frontend/FrameLocationsSourceJpg';
import thumbnailFrameLocationsFixture from '../../Fixtures/Models/Frontend/FrameLocationsThumbnail';
import taskFixture from '../../Fixtures/Models/Frontend/Task';
import ImagePreloader from '../../../Application/Frame/Services/ImagePreloader';

fdescribe('ImagePreloader', () => {
  let angularQ;
  let rootScope;

  let imageFetcherMock;
  let imageCacheMock;
  let frameLocationGatewayMock;
  let frameIndexServiceMock;

  let sourceJpgLocations;
  let thumbnailLocations;
  let task;

  beforeEach(inject(($rootScope, $q) => {
    angularQ = $q;
    rootScope = $rootScope;
  }));

  beforeEach(() => {
    imageFetcherMock = jasmine.createSpyObj('ImageFetcher', ['fetch', 'fetchMultiple']);
    imageCacheMock = jasmine.createSpyObj('ImageCache', ['hasImageForUrl', 'addImages']);
    frameLocationGatewayMock = jasmine.createSpyObj('FrameLocationGateway', ['getFrameLocations']);
    frameIndexServiceMock = jasmine.createSpyObj('FrameIndexService', ['getFrameIndexLimits']);
  });

  beforeEach(() => {
    sourceJpgLocations = cloneDeep(sourceJpgFrameLocationsFixture);
    thumbnailLocations = cloneDeep(thumbnailFrameLocationsFixture);
    task = taskFixture.clone();
  });

  beforeEach(() => {
    imageFetcherMock.fetch.and.returnValue(angularQ.resolve());
    imageFetcherMock.fetchMultiple.and.returnValue(angularQ.resolve());

    imageCacheMock.hasImageForUrl.and.returnValue(false);
    imageCacheMock.addImages.and.callFake(images => images);

    frameLocationGatewayMock.getFrameLocations.and.callFake((taskId, imageType) => {
      switch (imageType) {
        case 'sourceJpg':
          return sourceJpgLocations;
        case 'thumbnail':
          return thumbnailLocations;
        default:
          throw new Error(`Unknown imageType: ${imageType}`);
      }
    });

    frameIndexServiceMock.getFrameIndexLimits.and.returnValue({
      lowerLimit: 0,
      upperLimit: 591,
    });
  });

  function createImagePreloader() {
    return new ImagePreloader(
      angularQ,
      imageFetcherMock,
      imageCacheMock,
      frameLocationGatewayMock,
      frameIndexServiceMock
    );
  }

  it('should be instantiable', () => {
    const preloader = createImagePreloader();
    expect(preloader).toEqual(jasmine.any(ImagePreloader));
  });

  describe('preloadImages', () => {
    it('should return promise', () => {
      const preloader = createImagePreloader();
      const returnValue = preloader.preloadImages(task);
      expect(returnValue.then).toEqual(jasmine.any(Function));
    });

    it('should request frame locations for task specified source image type',  () => {
      const preloader = createImagePreloader();
      preloader.preloadImages(task);

      rootScope.$apply();

      expect(frameLocationGatewayMock.getFrameLocations).toHaveBeenCalledWith(task.id, 'sourceJpg', 0, 592);
    });

    it('should request frame locations for task specified thumbnail image type',  () => {
      const preloader = createImagePreloader();
      preloader.preloadImages(task);

      rootScope.$apply();

      expect(frameLocationGatewayMock.getFrameLocations).toHaveBeenCalledWith(task.id, 'thumbnail', 0, 592);
    });

    it('should fetch all image locations if no limit is given', () => {
      const sourceJpgUrls = sourceJpgLocations.map(location => location.url);
      const thumbnailUrls = thumbnailLocations.map(location => location.url);

      const preloader = createImagePreloader();
      preloader.preloadImages(task);

      rootScope.$apply();

      expect(imageFetcherMock.fetchMultiple).toHaveBeenCalledWith(
        [...sourceJpgUrls, ...thumbnailUrls]
      );
    });
  });
});

