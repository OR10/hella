import {inject} from 'angular-mocks';

import FrameGateway from 'Application/Frame/Gateways/FrameGateway';

fdescribe('FrameGateway', () => {
  let angularQ;
  let rootScope;
  let abortablePromiseFactoryMock;
  let imageFetcherMock;
  let imageCacheMock;

  function createFrameLocation(url = 'http://example.com/frame/23.png', frameIndex = 23, id = 'abc', type = 'source') {
    return {
      id,
      type,
      frameIndex,
      url
    };
  }

  function createImageCacheMock() {
    const imageCache = jasmine.createSpyObj('ImageCache', ['clear', 'addImage', 'addImages', 'hasImageForUrl', 'getImageForUrl']);
    imageCache.addImage.and.callFake(input => input);
    imageCache.addImages.and.callFake(input => input);
    return imageCache;
  }

  function createImageFetcherMock() {
    return jasmine.createSpyObj('ImageFetcher', ['fetch', 'fetchMultiple']);
  }

  function createAbortablePromiseFactoryMock() {
    const mock = jasmine.createSpy('abortablePromiseFactory');
    mock.and.callFake(input => input);
    return mock;
  }

  function createFrameGateway() {
    return new FrameGateway(
      angularQ,
      abortablePromiseFactoryMock,
      imageFetcherMock,
      imageCacheMock,
    );
  }

  beforeEach(inject(($q, $rootScope) => {
    angularQ = $q;
    rootScope = $rootScope;
  }));

  beforeEach(() => {
    abortablePromiseFactoryMock = createAbortablePromiseFactoryMock();
    imageFetcherMock = createImageFetcherMock();
    imageCacheMock = createImageCacheMock();
  });

  it('should be able to instantiate', () => {
    const gateway = createFrameGateway();
    expect(gateway).toEqual(jasmine.any(FrameGateway));
  });

  describe('getImage', () => {
    let imageFetcherResultDefer;

    beforeEach(() => {
      imageFetcherResultDefer = angularQ.defer();
      imageFetcherMock.fetch.and.returnValue(imageFetcherResultDefer.promise);
    });

    it('should delegate image loading request to image fetcher', () => {
      const location = createFrameLocation();
      const gateway = createFrameGateway();

      gateway.getImage(location);

      rootScope.$apply();

      expect(imageFetcherMock.fetch).toHaveBeenCalled();
    });

    it('should return abortable promise', () => {
      const location = createFrameLocation();
      const gateway = createFrameGateway();

      const abortablePromiseMock = {};
      abortablePromiseFactoryMock.and.returnValue(abortablePromiseMock);

      const returnValue = gateway.getImage(location);

      rootScope.$apply();

      expect(abortablePromiseFactoryMock).toHaveBeenCalled();
      expect(returnValue).toBe(abortablePromiseMock);
    });

    it('resolve with returned image from fetcher', () => {
      const location = createFrameLocation();
      const gateway = createFrameGateway();

      const returnValue = gateway.getImage(location);
      const resolveSpy = jasmine.createSpy('image loaded');
      returnValue.then(resolveSpy);

      const imageMock = {src: 'http://example.com/some-image-mock.png'};
      imageFetcherResultDefer.resolve(imageMock);

      rootScope.$apply();

      expect(resolveSpy).toHaveBeenCalledWith(imageMock);
    });

    it('should request url from location', () => {
      const location = createFrameLocation();
      const gateway = createFrameGateway();

      gateway.getImage(location);

      expect(imageFetcherMock.fetch).toHaveBeenCalledWith(location.url);
    });

    it('should store fetched image in cache', () => {
      const location = createFrameLocation();
      const gateway = createFrameGateway();

      gateway.getImage(location);

      const imageMock = {src: 'http://example.com/some-image-mock.png'};
      imageFetcherResultDefer.resolve(imageMock);

      rootScope.$apply();

      expect(imageCacheMock.addImage).toHaveBeenCalledWith(imageMock);
    });

    it('should provide image from cache if present', () => {
      const location = createFrameLocation();
      const gateway = createFrameGateway();

      const imageMock = {src: 'http://example.com/some-image-mock.png'};

      imageCacheMock.hasImageForUrl.and.returnValue(true);
      imageCacheMock.getImageForUrl.and.returnValue(imageMock);

      const returnValue = gateway.getImage(location);
      const resolveSpy = jasmine.createSpy('image loaded');
      returnValue.then(resolveSpy);

      rootScope.$apply();

      expect(resolveSpy).toHaveBeenCalledWith(imageMock);
      expect(imageCacheMock.hasImageForUrl).toHaveBeenCalledWith(location.url);
      expect(imageCacheMock.getImageForUrl).toHaveBeenCalledWith(location.url);
    });
  });

  describe('Image Preloading', () => {
    let imageFetcherResultDefer;

    beforeEach(() => {
      imageFetcherResultDefer = angularQ.defer();
      imageFetcherMock.fetchMultiple.and.returnValue(imageFetcherResultDefer.promise);
    });

    it('should use ImageFetcher#fetchMultiple to request images', () => {
      const location = createFrameLocation();
      const gateway = createFrameGateway();

      gateway.preloadImages([location]);

      rootScope.$apply();

      expect(imageFetcherMock.fetchMultiple).toHaveBeenCalled();
    });

    it('should supply given urls to fetchMultiple', () => {
      const firstLocation = createFrameLocation('http://example.com/foo.png');
      const secondLocation = createFrameLocation('http://example.com/bar.png');
      const gateway = createFrameGateway();

      gateway.preloadImages([firstLocation, secondLocation]);

      rootScope.$apply();

      expect(imageFetcherMock.fetchMultiple).toHaveBeenCalledWith([firstLocation.url, secondLocation.url]);
    });

    it('should add loaded images to cache', () => {
      const firstUrl = 'http://example.com/foo.png';
      const secondUrl = 'http://example.com/bar.png';
      const firstLocation = createFrameLocation(firstUrl);
      const secondLocation = createFrameLocation(secondUrl);
      const gateway = createFrameGateway();

      const firstImage = {src: firstUrl};
      const secondImage = {src: secondUrl};

      gateway.preloadImages([firstLocation, secondLocation]);

      imageFetcherResultDefer.resolve([firstImage, secondImage]);

      rootScope.$apply();

      expect(imageCacheMock.addImages).toHaveBeenCalledWith([firstImage, secondImage]);
    });

    it('should reject if fetching fails', () => {
      const location = createFrameLocation();
      const gateway = createFrameGateway();

      const imagesPromise = gateway.preloadImages([location]);
      const rejectSpy = jasmine.createSpy('reject image preload');
      imagesPromise.catch(rejectSpy);

      rootScope.$apply();

      const error = 'some really nasty error';
      imageFetcherResultDefer.reject(error);

      rootScope.$apply();

      expect(rejectSpy).toHaveBeenCalledWith(error);
    });

    it('should resolve with loaded images if load goes through', () => {
      const firstUrl = 'http://example.com/foo.png';
      const secondUrl = 'http://example.com/bar.png';
      const firstLocation = createFrameLocation(firstUrl);
      const secondLocation = createFrameLocation(secondUrl);
      const gateway = createFrameGateway();

      const firstImage = {src: firstUrl};
      const secondImage = {src: secondUrl};

      const imagesPromise = gateway.preloadImages([firstLocation, secondLocation]);
      const resolveSpy = jasmine.createSpy('resolve image preload');
      imagesPromise.then(resolveSpy);

      rootScope.$apply();

      imageFetcherResultDefer.resolve([firstImage, secondImage]);

      rootScope.$apply();

      expect(resolveSpy).toHaveBeenCalledWith([firstImage, secondImage]);
    });

    it('should only request images not inside the cache already', () => {
      const firstUrl = 'http://example.com/foo.png';
      const secondUrl = 'http://example.com/bar.png';
      const firstLocation = createFrameLocation(firstUrl);
      const secondLocation = createFrameLocation(secondUrl);
      const gateway = createFrameGateway();

      // Pretend second image is in cache
      imageCacheMock.hasImageForUrl.and.callFake(url => url === secondUrl);

      gateway.preloadImages([firstLocation, secondLocation]);

      rootScope.$apply();

      expect(imageFetcherMock.fetchMultiple).toHaveBeenCalledWith([firstUrl]);
    });

    it('should only resolve with images not inside the cache already', () => {
      const firstUrl = 'http://example.com/foo.png';
      const secondUrl = 'http://example.com/bar.png';
      const firstLocation = createFrameLocation(firstUrl);
      const secondLocation = createFrameLocation(secondUrl);
      const gateway = createFrameGateway();

      const firstImage = {src: firstUrl};
      const secondImage = {src: secondUrl};

      // Pretend second image is in cache
      imageCacheMock.hasImageForUrl.and.callFake(url => url === secondUrl);

      const imagesPromise = gateway.preloadImages([firstLocation, secondLocation]);
      const resolveSpy = jasmine.createSpy('resolve image preload');
      imagesPromise.then(resolveSpy);

      rootScope.$apply();

      imageFetcherResultDefer.resolve([firstImage]);

      rootScope.$apply();

      expect(resolveSpy).toHaveBeenCalledWith([firstImage]);
    });
  });
});
