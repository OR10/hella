import ImageFetcher from '../../../Application/Frame/Services/ImageFetcher';

describe('ImageFetcher', () => {
  let angularQ;
  let rootScope;
  let imageFactory;

  function createImageFactoryMock() {
    return jasmine.createSpyObj('ImageFactory', ['createImage']);
  }

  function createImageFetcher() {
    return new ImageFetcher(angularQ, imageFactory);
  }

  function createImage(url = '') {
    const image = jasmine.createSpyObj('Image', ['addEventListener']);
    image.alt = '';
    image.crossOrigin = null;
    image.height = 0;
    image.isMap = false;
    image.referrerPolicy = '';
    image.useMap = '';
    image.width = 0;
    image.src = url;

    return image;
  }

  beforeEach(inject(($q, $rootScope) => {
    angularQ = $q;
    rootScope = $rootScope;
  }));

  beforeEach(() => {
    imageFactory = createImageFactoryMock();
  });

  it('should instantiate', () => {
    const fetcher = createImageFetcher();
    expect(fetcher).toEqual(jasmine.any(ImageFetcher));
  });

  describe('Single Image Fetching', () => {
    let image;
    let url;
    let imageFetcher;
    let registeredEvents;

    beforeEach(() => {
      image = createImage();

      registeredEvents = {};
      image.addEventListener.and.callFake((eventName, listenerFn) => {
        registeredEvents[eventName] = listenerFn;
      });

      imageFactory.createImage.and.returnValue(image);

      imageFetcher = createImageFetcher();

      url = 'http://example.com/wurstbrot.png';
    });

    it('should request single image by setting the "src" attribute', () => {
      imageFetcher.fetch(url);

      rootScope.$apply();

      expect(image.src).toEqual(url);
    });

    it('should return promise when fetching single image', () => {
      const fetchPromise = imageFetcher.fetch(url);

      expect(fetchPromise.then).toEqual(jasmine.any(Function));
    });

    it('should resolve promise when single image is loaded', () => {
      const resolveSpy = jasmine.createSpy('fetch promise resolved');
      const fetchPromise = imageFetcher.fetch(url);
      fetchPromise.then(resolveSpy);

      expect(registeredEvents.load).toEqual(jasmine.any(Function));

      rootScope.$apply();

      expect(resolveSpy).not.toHaveBeenCalled();

      registeredEvents.load();
      rootScope.$apply();

      expect(resolveSpy).toHaveBeenCalledWith(image);
    });

    it('should reject promise when single image is loaded with error', () => {
      const rejectSpy = jasmine.createSpy('fetch promise rejected');
      const fetchPromise = imageFetcher.fetch(url);
      fetchPromise.catch(rejectSpy);

      expect(registeredEvents.error).toEqual(jasmine.any(Function));

      rootScope.$apply();

      expect(rejectSpy).not.toHaveBeenCalled();
      const error = 'Some error!';
      registeredEvents.error(error);
      rootScope.$apply();

      expect(rejectSpy).toHaveBeenCalledWith(error);
    });
  });

  describe('Multiple Parallel Image Fetching', () => {
    const IMAGE_COUNT = 10;
    const APPLY_REPETITION = IMAGE_COUNT * 3;

    let images;
    let registeredEvents;
    let urls;

    function applyAsync() {
      Array.from(new Array(APPLY_REPETITION).keys()).forEach(index => {
        rootScope.$apply();
        jasmine.clock().tick(100);
      });
    }

    function loadAllImages() {
      // Images may be loaded in chunks of 1 therefore we need to loop over all images in cycles.
      Array.from(new Array(IMAGE_COUNT).keys()).forEach(index => {
        registeredEvents.forEach(imageEvents => imageEvents.load && imageEvents.load());
        applyAsync();
      });
    }

    function expectTheFollowingImagesToHaveBeenTriggered(imageIndexList) {
      Array.from(new Array(IMAGE_COUNT).keys()).forEach(index => {
        if (imageIndexList.includes(index)) {
          expect(images[index].src).not.toEqual('');
        } else {
          expect(images[index].src).toEqual('');
        }
      });
    }

    beforeEach(() => jasmine.clock().install());

    beforeEach(() => {
      // Create fully embedded set of mocked images
      images = [];
      registeredEvents = [];
      urls = [];
      Array.from(new Array(IMAGE_COUNT).keys()).forEach(index => {
        const image = createImage();
        image.addEventListener.and.callFake((eventName, listenerFn) => {
          registeredEvents[index][eventName] = listenerFn;
        });
        images.push(image);
        registeredEvents.push({});
        urls.push(`http://example.com/photos/${index}.jpg`);
      });

      imageFactory.createImage.and.returnValues(...images);
    });

    it('should return promise', () => {
      const imageFetcher = createImageFetcher();

      const returnValue = imageFetcher.fetchMultiple(urls);
      expect(returnValue.then).toEqual(jasmine.any(Function));
    });

    it('should load single image', () => {
      const imageFetcher = createImageFetcher();

      const imagesPromise = imageFetcher.fetchMultiple([urls[0]]);
      const resolveSpy = jasmine.createSpy('image loaded');
      imagesPromise.then(resolveSpy);

      applyAsync();

      expect(resolveSpy).not.toHaveBeenCalled();

      loadAllImages();

      expect(resolveSpy).toHaveBeenCalledWith([images[0]]);
    });

    it('should load two images', () => {
      const imageFetcher = createImageFetcher();

      const imagesPromise = imageFetcher.fetchMultiple([urls[0], urls[1]]);
      const resolveSpy = jasmine.createSpy('image loaded');
      imagesPromise.then(resolveSpy);

      applyAsync();

      expect(resolveSpy).not.toHaveBeenCalled();

      loadAllImages();

      expect(resolveSpy).toHaveBeenCalledWith([images[0], images[1]]);
    });

    it('should resolve and return fetched images', () => {
      const imageFetcher = createImageFetcher();

      const imagesPromise = imageFetcher.fetchMultiple(urls);
      const resolveSpy = jasmine.createSpy('images loaded');
      imagesPromise.then(resolveSpy);

      applyAsync();

      expect(resolveSpy).not.toHaveBeenCalled();

      loadAllImages();

      expect(resolveSpy).toHaveBeenCalledWith(images);
    });

    it('should reject if any image failed to load', () => {
      const imageFetcher = createImageFetcher();

      const imagesPromise = imageFetcher.fetchMultiple(urls);
      const rejectSpy = jasmine.createSpy('images load error');
      imagesPromise.catch(rejectSpy);

      applyAsync();

      expect(rejectSpy).not.toHaveBeenCalled();

      const error = "Some uncool error!";
      registeredEvents[2].error(error);

      applyAsync();

      expect(rejectSpy).toHaveBeenCalledWith(error);
    });

    it('should load a maximum of "chunkSize" images in parallel', () => {
      const imageFetcher = createImageFetcher();

      const imagesPromise = imageFetcher.fetchMultiple(urls, 4);

      applyAsync();

      expectTheFollowingImagesToHaveBeenTriggered([0, 1, 2, 3]);
      registeredEvents[1].load();
      applyAsync();
      expectTheFollowingImagesToHaveBeenTriggered([0, 1, 2, 3, 4]);
      registeredEvents[0].load();
      registeredEvents[3].load();
      applyAsync();
      expectTheFollowingImagesToHaveBeenTriggered([0, 1, 2, 3, 4, 5, 6]);
      registeredEvents[6].load();
      registeredEvents[5].load();
      applyAsync();
      expectTheFollowingImagesToHaveBeenTriggered([0, 1, 2, 3, 4, 5, 6, 7, 8]);
      registeredEvents[2].load();
      registeredEvents[8].load();
      applyAsync();
      expectTheFollowingImagesToHaveBeenTriggered([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should provide loaded images in the same order as the given urls regardless of load order', () => {
      const imageFetcher = createImageFetcher();

      const imagesPromise = imageFetcher.fetchMultiple(urls, 4);
      const resolveSpy = jasmine.createSpy('images loaded');
      imagesPromise.then(resolveSpy);

      applyAsync();

      registeredEvents[1].load();
      applyAsync();
      registeredEvents[0].load();
      registeredEvents[3].load();
      applyAsync();
      registeredEvents[4].load();
      registeredEvents[6].load();
      registeredEvents[5].load();
      applyAsync();
      registeredEvents[2].load();
      registeredEvents[8].load();
      applyAsync();
      registeredEvents[7].load();
      registeredEvents[9].load();
      applyAsync();
      expect(resolveSpy).toHaveBeenCalledWith(images);
    });

    afterEach(() => jasmine.clock().uninstall());
  });
});