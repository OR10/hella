import CacheService from 'Application/LabelingData/Services/CacheService';
import DataContainer from 'Application/LabelingData/Support/DataContainer';

describe('CachingService', () => {
  let cache;
  beforeEach(() => {
    inject($injector => {
      cache = $injector.instantiate(CacheService);
    });
  });

  it('should allow access to different caches', () => {
    const cacheOne = cache.container('cacheOne');
    const cacheTwo = cache.container('cacheTwo');

    expect(cacheOne).not.toBe(cacheTwo);
  });

  it('should provide DataContainers', () => {
    const cacheOne = cache.container('cacheOne');
    expect(cacheOne instanceof DataContainer).toBeTruthy();
  });

  it('should provide the same caches for multiple calls', () => {
    expect(cache.container('cacheOne')).toBe(cache.container('cacheOne'));
  });
});
