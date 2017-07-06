import ImageCache from '../../../Application/Frame/Services/ImageCache';

fdescribe('ImageCache', () => {
  function createImageCache() {
    return new ImageCache();
  }

  function createImage(url = 'http://example.com/foobar.png') {
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

  it('should instantiate', () => {
    const cache = createImageCache();
    expect(cache).toEqual(jasmine.any(ImageCache));
  });

  it('should store single image in cache', () => {
    const cache = createImageCache();
    const url = 'http://example.com/wurstbrot.png';
    const image = createImage(url);

    cache.addImage(image);
    expect(cache.hasImageForUrl(url)).toBeTruthy();
  });

  it('should store multiple image in cache with separate calls', () => {
    const cache = createImageCache();

    const urlOne = 'http://example.com/wurstbrot.png';
    const urlTwo = 'http://example.com/bernd-das-brot.png';
    const urlThree = 'http://example.com/kaese-brot.png';

    const imageOne = createImage(urlOne);
    const imageTwo = createImage(urlTwo);
    const imageThree = createImage(urlThree);

    cache.addImage(imageOne);
    cache.addImage(imageTwo);
    cache.addImage(imageThree);

    expect(cache.hasImageForUrl(urlOne)).toBeTruthy();
    expect(cache.hasImageForUrl(urlTwo)).toBeTruthy();
    expect(cache.hasImageForUrl(urlThree)).toBeTruthy();
  });

  it('should store multiple image in cache with combined call', () => {
    const cache = createImageCache();

    const urlOne = 'http://example.com/wurstbrot.png';
    const urlTwo = 'http://example.com/bernd-das-brot.png';
    const urlThree = 'http://example.com/kaese-brot.png';

    const imageOne = createImage(urlOne);
    const imageTwo = createImage(urlTwo);
    const imageThree = createImage(urlThree);

    cache.addImages([imageOne, imageTwo, imageThree]);

    expect(cache.hasImageForUrl(urlOne)).toBeTruthy();
    expect(cache.hasImageForUrl(urlTwo)).toBeTruthy();
    expect(cache.hasImageForUrl(urlThree)).toBeTruthy();
  });

  it('should report not added image as not cached', () => {
    const cache = createImageCache();
    const url = 'http://example.com/wurstbrot.png';

    expect(cache.hasImageForUrl(url)).toBeFalsy();
  });

  it('should return cached image', () => {
    const cache = createImageCache();

    const url = 'http://example.com/wurstbrot.png';
    const image = createImage(url);
    cache.addImage(image);

    expect(cache.getImageForUrl(url)).toBe(image);
  });

  it('should return correct cached image with multiple images in cache', () => {
    const cache = createImageCache();

    const urlOne = 'http://example.com/wurstbrot.png';
    const urlTwo = 'http://example.com/bernd-das-brot.png';
    const urlThree = 'http://example.com/kaese-brot.png';

    const imageOne = createImage(urlOne);
    const imageTwo = createImage(urlTwo);
    const imageThree = createImage(urlThree);

    cache.addImages([imageOne, imageTwo, imageThree]);

    expect(cache.getImageForUrl(urlOne)).toBe(imageOne);
    expect(cache.getImageForUrl(urlTwo)).toBe(imageTwo);
    expect(cache.getImageForUrl(urlThree)).toBe(imageThree);
  });

  it('should throw if unknown image is requested', () => {
    const cache = createImageCache();

    const url = 'http://example.com/wurstbrot.png';

    expect(() => cache.getImageForUrl(url)).toThrow();
  });

  it('should clear cache upon request', () => {
    const cache = createImageCache();
    const url = 'http://example.com/wurstbrot.png';
    const image = createImage(url);

    cache.addImage(image);
    expect(cache.hasImageForUrl(url)).toBeTruthy();
    cache.clear();
    expect(cache.hasImageForUrl(url)).toBeFalsy();
  });

  it('should overwrite existing image for url with new image with same url', () => {
    const cache = createImageCache();

    const urlOne = 'http://example.com/wurstbrot.png';
    const urlTwo = 'http://example.com/bernd-das-brot.png';
    const urlThree = 'http://example.com/wurstbrot.png';

    const imageOne = createImage(urlOne);
    const imageTwo = createImage(urlTwo);
    const imageThree = createImage(urlThree);

    cache.addImage(imageOne);
    cache.addImage(imageTwo);
    cache.addImage(imageThree);

    expect(cache.getImageForUrl(urlOne)).toBe(imageThree);
  });

  using([
    ['http://example.com/wurstbrot.png', 'http://example.com/wurstbrot.png?'],
    ['http://example.com/wurstbrot.png', 'http://example.com:80/wurstbrot.png'],
    ['http://example.com/wurstbrot.png', 'http://example.com//wurstbrot.png'],
    ['http://example.com/wurstbrot.png', 'http://example.com/./././wurstbrot.png'],
    ['http://example.com/images/wurstbrot.png', 'http://example.com/images/large/../wurstbrot.png'],
  ], (urlOne, urlTwo) => {
    it('should cache based on normalized urls', () => {
      const cache = createImageCache();

      const imageOne = createImage(urlOne);
      const imageTwo = createImage(urlTwo);

      cache.addImage(imageOne);
      cache.addImage(imageTwo);

      expect(cache.hasImageForUrl(urlOne)).toBeTruthy();
      expect(cache.hasImageForUrl(urlTwo)).toBeTruthy();
      expect(cache.getImageForUrl(urlOne)).toBe(imageTwo);
    })
  });
});