import ImagePool from '../../../Application/Frame/Services/ImagePool';

describe('ImagePool', () => {
  let imagePool;

  function createImagePool(options = undefined) {
    return new ImagePool(options);
  }

  beforeEach(() => {
    imagePool = createImagePool();
  });

  it('should provide image upon call the allocate', () => {
    expect(imagePool.allocate()).toEqual(jasmine.any(Image));
  });

  it('should take back image using free', () => {
    const image = imagePool.allocate();
    expect(() => imagePool.free(image)).not.toThrow();
  });

  it('should ignore outside image using free', () => {
    const image = new Image();
    expect(() => imagePool.free(image)).not.toThrow();
  });

  it('should take requested image from pool', () => {
    const poolSizeBeforeAllocation = imagePool.getPoolSize();
    imagePool.allocate();
    expect(imagePool.getPoolSize()).toEqual(poolSizeBeforeAllocation - 1);
    imagePool.allocate();
    expect(imagePool.getPoolSize()).toEqual(poolSizeBeforeAllocation - 2);
    imagePool.allocate();
    expect(imagePool.getPoolSize()).toEqual(poolSizeBeforeAllocation - 3);
    imagePool.allocate();
    expect(imagePool.getPoolSize()).toEqual(poolSizeBeforeAllocation - 4);
    imagePool.allocate();
    expect(imagePool.getPoolSize()).toEqual(poolSizeBeforeAllocation - 5);
  });

  it('should put freed image back into pool', () => {
    const poolSizeBeforeAllocation = imagePool.getPoolSize();
    const image = imagePool.allocate();
    imagePool.free(image);
    expect(imagePool.getPoolSize()).toEqual(poolSizeBeforeAllocation);
  });

  it('should not put external images back into the pool', () => {
    const poolSizeBeforeAllocation = imagePool.getPoolSize();
    imagePool.allocate();
    const outsideImage = new Image();
    imagePool.free(outsideImage);
    expect(imagePool.getPoolSize()).toEqual(poolSizeBeforeAllocation - 1);
  });

  it('should preallocate the configured number of images', () => {
    const preallocationSize = 423;
    const maximumPoolSize = 500;
    const imagePoolWithPreallocation = createImagePool({preallocationSize, maximumPoolSize});
    expect(imagePoolWithPreallocation.getPoolSize()).toEqual(preallocationSize);
  });

  it('should allocate on the fly if pool is empty', () => {
    const preallocationSize = 1;
    const smallImagePool = createImagePool({preallocationSize});
    smallImagePool.allocate();
    expect(smallImagePool.getPoolSize()).toEqual(0);
    expect(smallImagePool.allocate()).toEqual(jasmine.any(Image));
  });

  it('should take back over allocated images only if limit is not reached', () => {
    const preallocationSize = 1;
    const maximumPoolSize = 3;
    const smallImagePool = createImagePool({preallocationSize, maximumPoolSize});

    const firstPoolImage = smallImagePool.allocate();
    const secondPoolImage = smallImagePool.allocate();
    const thirdPoolImage = smallImagePool.allocate();
    const fourthPoolImage = smallImagePool.allocate();

    expect(smallImagePool.getPoolSize()).toEqual(0);

    smallImagePool.free(firstPoolImage);
    smallImagePool.free(secondPoolImage);
    smallImagePool.free(thirdPoolImage);
    smallImagePool.free(fourthPoolImage);

    expect(smallImagePool.getPoolSize()).toEqual(3);
  });

  using([
    ['alt', 'some alt text'],
    ['crossOrigin', 'use-credentials'],
    ['height', 1080],
    ['isMap', true],
    ['referrerPolicy', 'no-referrer'],
    ['useMap', '#someMap'],
    ['width', 1920],
  ], (propertyName, validValue) => {
    it('should cleanup Image properties once they are put back into the pool', () => {
      const preallocationSize = 1;
      const maximumPoolSize = 1;
      const smallImagePool = createImagePool({preallocationSize, maximumPoolSize});

      const initialImage = smallImagePool.allocate();
      const defaultValue = initialImage[propertyName];
      initialImage[propertyName] = validValue;
      smallImagePool.free(initialImage);

      const refurbishedImage = smallImagePool.allocate();

      expect(initialImage).toBe(refurbishedImage);
      expect(initialImage[propertyName]).toEqual(defaultValue);
    });
  });

  it('should not preallocate more images than allowed in the pool', () => {
    const preallocationSize = 100;
    const maximumPoolSize = 5;
    const smallImagePool = createImagePool({preallocationSize, maximumPoolSize});

    expect(smallImagePool.getPoolSize()).toEqual(5);
  });
});
