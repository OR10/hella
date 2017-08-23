import {inject} from 'angular-mocks';
import {cloneDeep} from 'lodash';
import sourceJpgFrameLocationsFixture from '../../Fixtures/Models/Frontend/FrameLocationsSourceJpg';
import thumbnailFrameLocationsFixture from '../../Fixtures/Models/Frontend/FrameLocationsThumbnail';
import taskFixture from '../../Fixtures/Models/Frontend/Task';
import ImagePreloader from '../../../Application/Frame/Services/ImagePreloader';

describe('ImagePreloader', () => {
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
    imageCacheMock = jasmine.createSpyObj('ImageCache', ['hasImageForUrl', 'addImages', 'addImage']);
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
    imageCacheMock.addImage.and.callFake(image => image);

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

    it('should request frame locations for task specified source image type', () => {
      const preloader = createImagePreloader();
      preloader.preloadImages(task);

      rootScope.$apply();

      expect(frameLocationGatewayMock.getFrameLocations).toHaveBeenCalledWith(task.id, 'sourceJpg', 0, 592);
    });

    it('should request frame locations for task specified thumbnail image type', () => {
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
        [...sourceJpgUrls, ...thumbnailUrls],
        undefined,
        jasmine.anything()
      );
    });

    it('should propagate chunkSize to fetchMultiple if given', () => {
      const sourceJpgUrls = sourceJpgLocations.map(location => location.url);
      const thumbnailUrls = thumbnailLocations.map(location => location.url);

      const preloader = createImagePreloader();
      preloader.preloadImages(task, undefined, 42);

      rootScope.$apply();

      expect(imageFetcherMock.fetchMultiple).toHaveBeenCalledWith(
        [...sourceJpgUrls, ...thumbnailUrls],
        42,
        jasmine.anything()
      );
    });

    it('should write images to cache once loaded', () => {
      const sourceJpgUrls = sourceJpgLocations.map(location => location.url);
      const thumbnailUrls = thumbnailLocations.map(location => location.url);

      const images = [].concat(
        sourceJpgUrls.map(url => ({src: url})),
        thumbnailUrls.map(url => ({src: url}))
      );

      const fetchMultipleDeferred = angularQ.defer();
      imageFetcherMock.fetchMultiple.and.returnValue(fetchMultipleDeferred.promise);

      const preloader = createImagePreloader();
      preloader.preloadImages(task);

      rootScope.$apply();

      images.forEach(
        image => fetchMultipleDeferred.notify(image)
      );

      rootScope.$apply();

      images.forEach(
        image => expect(imageCacheMock.addImage).toHaveBeenCalledWith(image)
      );
    });

    it('should resolve with images provided by fetchMultiple', () => {
      const sourceJpgUrls = sourceJpgLocations.map(location => location.url);
      const thumbnailUrls = thumbnailLocations.map(location => location.url);

      const images = [].concat(
        sourceJpgUrls.map(url => ({src: url})),
        thumbnailUrls.map(url => ({src: url}))
      );

      imageFetcherMock.fetchMultiple.and.returnValue(angularQ.resolve(images));

      const preloader = createImagePreloader();
      const returnValue = preloader.preloadImages(task);
      const returnValueSpy = jasmine.createSpy('preloadImages resolve');
      returnValue.then(returnValueSpy);

      rootScope.$apply();

      expect(returnValueSpy).toHaveBeenCalledWith(images);
    });

    it('should reject if fetchMultiple fails', () => {
      const error = 'Some really nasty error';
      imageFetcherMock.fetchMultiple.and.returnValue(angularQ.reject(error));

      const preloader = createImagePreloader();
      const returnValue = preloader.preloadImages(task);
      const returnValueSpy = jasmine.createSpy('preloadImages reject');
      returnValue.catch(returnValueSpy);

      rootScope.$apply();

      expect(returnValueSpy).toHaveBeenCalledWith(error);
    });

    it('should not fetch images, which are already in the cache', () => {
      const sourceJpgUrls = sourceJpgLocations.map(location => location.url);
      const thumbnailUrls = thumbnailLocations.map(location => location.url);

      // All images above 44 are in the cache!
      imageCacheMock.hasImageForUrl.and.callFake(url => {
        const imageNumber = parseInt(/([0-9]+)\.jpg$/.exec(url)[1], 10);
        return (imageNumber > 44);
      });

      const preloader = createImagePreloader();
      preloader.preloadImages(task);

      rootScope.$apply();

      expect(imageFetcherMock.fetchMultiple).toHaveBeenCalledWith(
        [sourceJpgUrls[0], sourceJpgUrls[1], thumbnailUrls[0], thumbnailUrls[1]],
        undefined,
        jasmine.anything()
      );
    });

    it('should fetch only images up to the given limit', () => {
      const sourceJpgUrls = sourceJpgLocations.map(location => location.url);
      const thumbnailUrls = thumbnailLocations.map(location => location.url);

      const preloader = createImagePreloader();
      preloader.preloadImages(task, 2);

      rootScope.$apply();

      expect(imageFetcherMock.fetchMultiple).toHaveBeenCalledWith(
        [sourceJpgUrls[0], sourceJpgUrls[1], thumbnailUrls[0], thumbnailUrls[1]],
        undefined,
        jasmine.anything(),
      );
    });

    it('should resume fetching, where it stopped if limit is given', () => {
      const sourceJpgUrls = sourceJpgLocations.map(location => location.url);
      const thumbnailUrls = thumbnailLocations.map(location => location.url);

      const preloader = createImagePreloader();
      preloader.preloadImages(task, 2);

      rootScope.$apply();

      expect(imageFetcherMock.fetchMultiple).toHaveBeenCalledWith(
        [sourceJpgUrls[0], sourceJpgUrls[1], thumbnailUrls[0], thumbnailUrls[1]],
        undefined,
        jasmine.anything()
      );

      preloader.preloadImages(task, 2);

      rootScope.$apply();

      expect(imageFetcherMock.fetchMultiple).toHaveBeenCalledWith(
        [sourceJpgUrls[2], sourceJpgUrls[3], thumbnailUrls[2], thumbnailUrls[3]],
        undefined,
        jasmine.anything()
      );
    });

    it('should do nothing if all images have already been fetched', () => {
      const preloader = createImagePreloader();
      preloader.preloadImages(task);

      rootScope.$apply();

      preloader.preloadImages(task, 10);

      rootScope.$apply();

      expect(imageFetcherMock.fetchMultiple).toHaveBeenCalledTimes(1);
    });
  });

  describe('Events', () => {
    it('should allow multiple event registrations', () => {
      const preloadStartedSpyOne = jasmine.createSpy('preload:started event 1');
      const preloadStartedSpyTwo = jasmine.createSpy('preload:started event 2');

      const preloader = createImagePreloader();
      preloader.on('preload:started', preloadStartedSpyOne);
      preloader.on('preload:started', preloadStartedSpyTwo);
      preloader.preloadImages(task);

      rootScope.$apply();

      expect(preloadStartedSpyOne).toHaveBeenCalledTimes(1);
      expect(preloadStartedSpyTwo).toHaveBeenCalledTimes(1);
    });

    it('should allow deregistration with given handle', () => {
      const preloadStartedSpyOne = jasmine.createSpy('preload:started event 1');
      const preloadStartedSpyTwo = jasmine.createSpy('preload:started event 2');

      const preloader = createImagePreloader();
      const eventHandle = preloader.on('preload:started', preloadStartedSpyOne);
      preloader.on('preload:started', preloadStartedSpyTwo);
      preloader.removeListener(eventHandle);
      preloader.preloadImages(task);

      rootScope.$apply();

      expect(preloadStartedSpyOne).not.toHaveBeenCalled();
      expect(preloadStartedSpyTwo).toHaveBeenCalledTimes(1);
    });

    it('should report via event for started preload', () => {
      const preloadStartedSpy = jasmine.createSpy('preload:started event');

      const preloader = createImagePreloader();
      preloader.on('preload:started', preloadStartedSpy);
      preloader.preloadImages(task);

      rootScope.$apply();

      expect(preloadStartedSpy).toHaveBeenCalledTimes(1);
      expect(preloadStartedSpy).toHaveBeenCalledWith({
        locationsInChunk: [...sourceJpgLocations, ...thumbnailLocations],
        imageCountInChunk: sourceJpgLocations.length + thumbnailLocations.length,
      });
    });

    it('should report via event for finished preload', () => {
      const sourceJpgUrls = sourceJpgLocations.map(location => location.url);
      const thumbnailUrls = thumbnailLocations.map(location => location.url);

      const images = [].concat(
        sourceJpgUrls.map(url => ({src: url})),
        thumbnailUrls.map(url => ({src: url}))
      );

      imageFetcherMock.fetchMultiple.and.returnValue(angularQ.resolve(images));

      const preloadFinishedSpy = jasmine.createSpy('preload:finished event');

      const preloader = createImagePreloader();
      preloader.on('preload:finished', preloadFinishedSpy);
      preloader.preloadImages(task);

      rootScope.$apply();

      expect(preloadFinishedSpy).toHaveBeenCalledTimes(1);
      expect(preloadFinishedSpy).toHaveBeenCalledWith({
        locationsInChunk: [...sourceJpgLocations, ...thumbnailLocations],
        imageCountInChunk: sourceJpgLocations.length + thumbnailLocations.length,
        images,
      });
    });

    it('should report progress via event for each image', () => {
      const sourceJpgUrls = sourceJpgLocations.map(location => location.url);
      const thumbnailUrls = thumbnailLocations.map(location => location.url);

      const expectedLocations = [sourceJpgLocations[0], sourceJpgLocations[1], thumbnailLocations[0], thumbnailLocations[1]];
      const images = [{src: sourceJpgUrls[0]}, {src: sourceJpgUrls[1]}, {src: thumbnailUrls[0]}, {src: thumbnailUrls[1]}];

      const fetchMultipleDeferred = angularQ.defer();

      imageFetcherMock.fetchMultiple.and.returnValue(fetchMultipleDeferred.promise);

      const imageLoadedSpy = jasmine.createSpy('image:loaded event');

      const preloader = createImagePreloader();
      preloader.on('image:loaded', imageLoadedSpy);
      preloader.preloadImages(task, 2);

      rootScope.$apply();

      images.forEach(
        image => fetchMultipleDeferred.notify(image)
      );

      rootScope.$apply();

      expect(imageLoadedSpy).toHaveBeenCalledTimes(4);
      expect(imageLoadedSpy).toHaveBeenCalledWith({
        image: images[0],
        locationsInChunk: expectedLocations,
        imageCountInChunk: 4,
        imageCountInChunkCompleted: 1,
      });
      expect(imageLoadedSpy).toHaveBeenCalledWith({
        image: images[1],
        locationsInChunk: expectedLocations,
        imageCountInChunk: 4,
        imageCountInChunkCompleted: 2,
      });
      expect(imageLoadedSpy).toHaveBeenCalledWith({
        image: images[2],
        locationsInChunk: expectedLocations,
        imageCountInChunk: 4,
        imageCountInChunkCompleted: 3,
      });
      expect(imageLoadedSpy).toHaveBeenCalledWith({
        image: images[3],
        locationsInChunk: expectedLocations,
        imageCountInChunk: 4,
        imageCountInChunkCompleted: 4,
      });
    });
  });
});

