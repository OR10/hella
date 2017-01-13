import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';
import LabelingData from 'Application/LabelingData/LabelingData';

import FrameLocationGateway from 'Application/Frame/Gateways/FrameLocationGateway';
import CachingFrameLocationGateway from 'Application/Frame/Gateways/CachingFrameLocationGateway';

describe('CachingFrameLocationGateway', () => {
  let gateway;
  let locationCache;
  let proto;
  let $rootScope;

  beforeEach(() => {
    let cache;

    proto = FrameLocationGateway.prototype;
    spyOn(proto, [
      'getFrameLocations',
    ]).and.callFake(() => Promise.resolve([
      {frameIndex: 0, url: 'http://example.com/1'},
      {frameIndex: 1, url: 'http://example.com/2'},
    ]));

    const featureFlags = {
      pouchdb: true,
    };

    const commonModule = new Common();
    commonModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.Common');

    const labelingDataModule = new LabelingData();
    labelingDataModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.LabelingData');

    module($provide => {
      $provide.value('applicationConfig', {
        Common: {},
      });
    });

    inject($injector => {
      $rootScope = $injector.get('$rootScope');
      cache = $injector.get('cacheService');
      gateway = $injector.instantiate(CachingFrameLocationGateway);
    });

    locationCache = cache.container('framelocation-by-frame');
    locationCache.invalidate();
  });

  it('should be able to instantiate without non injected arguments', () => {
    expect(gateway instanceof CachingFrameLocationGateway).toEqual(true);
  });

  it('should by default call through', () => {
    gateway.getFrameLocations('some-task', 'some-type', 23, 42);
    expect(proto.getFrameLocations).toHaveBeenCalledWith('some-task', 'some-type', 23, 42);
  });

  it('should by default call through with offset 0 with 1 frame', () => {
    gateway.getFrameLocations('some-task', 'some-type');
    expect(proto.getFrameLocations).toHaveBeenCalledWith('some-task', 'some-type', 0, 1);
  });

  it('should use cache if present', done => {
    const location = {frameIndex: 0, url: 'http://example.com'};
    locationCache.store('some-task.some-type.0', location);
    gateway.getFrameLocations('some-task', 'some-type', 0, 1).then(locations => {
      expect(proto.getFrameLocations).not.toHaveBeenCalled();
      expect(locations).toEqual([location]);
      done();
    });

    $rootScope.$digest();
  });

  it('should store results in cache', done => {
    gateway.getFrameLocations('some-task', 'some-type', 0, 2).then(locations => {
      expect(locationCache.get('some-task.some-type.0')).toEqual(locations[0]);
      expect(locationCache.get('some-task.some-type.1')).toEqual(locations[1]);
      done();
    });

    $rootScope.$digest();
  });

  it('should call through if cache has gaps', done => {
    const expectedLocations = [
      {frameIndex: 0, url: 'http://example.com/1'},
      {frameIndex: 1, url: 'http://example.com/2'},
    ];

    locationCache.store('some-task.some-type.1', expectedLocations[1]);
    gateway.getFrameLocations('some-task', 'some-type', 0, 2).then(locations => {
      expect(proto.getFrameLocations).toHaveBeenCalled();
      expect(locations).toEqual(expectedLocations);
      done();
    });

    $rootScope.$digest();
  });
});
