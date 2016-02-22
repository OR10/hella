import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';
import LabelingData from 'Application/LabelingData/LabelingData';

import LabeledThingInFrameGateway from 'Application/LabelingData/Gateways/LabeledThingInFrameGateway';
import CachingLabeledThingInFrameGateway from 'Application/LabelingData/Gateways/CachingLabeledThingInFrameGateway';

import LabeledThing from 'Application/LabelingData/Models/LabeledThing';
import LabeledThingInFrame from 'Application/LabelingData/Models/LabeledThingInFrame';


describe('CachingLabeledThingInFrameGateway', () => {
  let gateway;

  let ltCache;
  let ltifCache;
  let ltifGhostCache;

  let proto;
  let $rootScope;

  let labeledThingMock;

  function ltif(task, id, frameNumber, ghost = false, labeledThingId = 'some-labeled-thing') {
    const raw = {
      frameNumber,
      ghost,
      labeledThingId,
      id: !!id ? id : `labeled-thing-in-frame-${Math.round(Math.random() * Number.MAX_SAFE_INTEGER)}`,
      rev: `1-${Math.round(Math.random() * Number.MAX_SAFE_INTEGER)}`,
      shapes: [{type: 'rectangle'}],
    };

    return new LabeledThingInFrame(
      Object.assign({}, raw, {
        labeledThing: new LabeledThing(
          {task, id: raw.labeledThingId}
        ),
      })
    );
  }

  function storeInCache(completeFrames, ...labeledObjects) {
    labeledObjects.forEach(labeledObject => {
      switch (true) {
        case labeledObject instanceof LabeledThingInFrame && labeledObject.ghost === false:
          ltifCache.store(`${labeledObject.labeledThing.task.id}.${labeledObject.frameNumber}.${labeledObject.id}`, labeledObject.toJSON());
          ltCache.store(`${labeledObject.labeledThing.task.id}.${labeledObject.labeledThing.id}`, labeledObject.labeledThing.toJSON());
          if (completeFrames) {
            ltifCache.store(`${labeledObject.labeledThing.task.id}.${labeledObject.frameNumber}.complete`, true);
          }
          break;
        case labeledObject instanceof LabeledThingInFrame && labeledObject.ghost === true:
          ltifGhostCache.store(`${labeledObject.labeledThing.task.id}.${labeledObject.frameNumber}.${labeledObject.labeledThing.id}`, labeledObject.toJSON());
          ltCache.store(`${labeledObject.labeledThing.task.id}.${labeledObject.labeledThing.id}`, labeledObject.labeledThing.toJSON());
          break;
        case labeledObject instanceof LabeledThing:
          ltCache.store(`${labeledObject.task.id}.${labeledObject.id}`, labeledObject.toJSON());
          break;
        default:
          throw new Error('Unknown LabeledObject type ' + JSON.stringify(labeledObject));
      }
    });
  }

  beforeEach(() => {
    let cache;

    proto = LabeledThingInFrameGateway.prototype;

    const commonModule = new Common();
    commonModule.registerWithAngular(angular);
    module('AnnoStation.Common');

    const labelingDataModule = new LabelingData();
    labelingDataModule.registerWithAngular(angular);
    module('AnnoStation.LabelingData');

    module($provide => {
      $provide.value('applicationConfig', {
        Common: {},
      });
    });

    inject($injector => {
      $rootScope = $injector.get('$rootScope');
      cache = $injector.get('cacheService');
      gateway = $injector.instantiate(CachingLabeledThingInFrameGateway);
    });

    ltifCache = cache.container('labeledThingsInFrame-by-frame');
    ltifGhostCache = cache.container('ghosted-labeledThingsInFrame-by-id');
    ltCache = cache.container('labeledThing-by-id');

    ltCache.invalidate();
    ltifCache.invalidate();
    ltifGhostCache.invalidate();
  });

  it('should be able to instantiate without non injected arguments', () => {
    expect(gateway instanceof CachingLabeledThingInFrameGateway).toEqual(true);
  });

  describe('listLabeledThingInFrame', () => {
    let task;
    let labeledThingsInFrame;
    beforeEach(() => {
      task = {id: 'some-task'};

      labeledThingsInFrame = [
        ltif(task, 'xyz', 42),
        ltif(task, 'uvw', 43),
      ];

      spyOn(proto, [
        'listLabeledThingInFrame',
      ]).and.callFake(() => Promise.resolve(labeledThingsInFrame));
    });

    it('should by default call through', () => {
      gateway.listLabeledThingInFrame(task, 42, 0, 1);
      expect(proto.listLabeledThingInFrame).toHaveBeenCalledWith(task, 42, 0, 1);
    });

    it('should by default call through with offset 0 and limit 1', () => {
      gateway.listLabeledThingInFrame(task, 42);
      expect(proto.listLabeledThingInFrame).toHaveBeenCalledWith(task, 42, 0, 1);
    });

    it('should use cache if present', () => {
      storeInCache(true, ...labeledThingsInFrame);
      gateway.listLabeledThingInFrame(task, 42, 0, 1);
      expect(proto.listLabeledThingInFrame).not.toHaveBeenCalled();
    });

    it('should output data from cache', done => {
      storeInCache(true, ...labeledThingsInFrame);
      gateway.listLabeledThingInFrame(task, 42, 0, 2).then(results => {
        expect(results).toEqual(labeledThingsInFrame);
        done();
      });

      $rootScope.$digest();
    });

    it('should output data from cache with offset', done => {
      storeInCache(true, ...labeledThingsInFrame);
      gateway.listLabeledThingInFrame(task, 39, 3, 2).then(results => {
        expect(results).toEqual(labeledThingsInFrame);
        done();
      });

      $rootScope.$digest();
    });

    it('should call through if cache has gaps', () => {
      storeInCache(true, ...labeledThingsInFrame);
      storeInCache(true, ltif(task, 'ijk', 45));
      gateway.listLabeledThingInFrame(task, 42, 0, 4);
      expect(proto.listLabeledThingInFrame).toHaveBeenCalledWith(task, 42, 0, 4);
    });

    it('should call through if cache frames are incomplete', () => {
      storeInCache(true, ...labeledThingsInFrame);
      storeInCache(false, ltif(task, 'ijk', 44));
      gateway.listLabeledThingInFrame(task, 42, 0, 3);
      expect(proto.listLabeledThingInFrame).toHaveBeenCalledWith(task, 42, 0, 3);
    });

    it('should store retrieved information in cache', done => {
      gateway.listLabeledThingInFrame(task, 42, 0, 2).then(result => {
        expect(ltifCache.get(`${task.id}.42.${labeledThingsInFrame[0].id}`)).toBeDefined();
        expect(ltifCache.get(`${task.id}.43.${labeledThingsInFrame[1].id}`)).toBeDefined();
        done();
      });
    });

    it('should mark retrieved frames as being completed', done => {
      gateway.listLabeledThingInFrame(task, 42, 0, 2).then(result => {
        expect(ltifCache.get(`${task.id}.42.complete`)).toBeTruthy();
        expect(ltifCache.get(`${task.id}.43.complete`)).toBeTruthy();
        done();
      });
    });

    it('should save multiple labeledThingInFrames on the same frame to cache', done => {
      proto.listLabeledThingInFrame
        .and.callFake(() => Promise.resolve([
          ltif(task, 'x', 42, false, '1'),
          ltif(task, 'y', 42, false, '2'),
          ltif(task, 'z', 42, false, '3'),
        ]));
      gateway.listLabeledThingInFrame(task, 42).then(result => {
        expect(ltifCache.get(`${task.id}.42.x`)).toEqual(result[0].toJSON());
        expect(ltifCache.get(`${task.id}.42.y`)).toEqual(result[1].toJSON());
        expect(ltifCache.get(`${task.id}.42.z`)).toEqual(result[2].toJSON());
        done();
      });
    });
  });

  describe('getLabeledThingInFrame', () => {
    beforeEach(() => {
      spyOn(proto, [
        'getLabeledThingInFrame',
      ]).and.callFake(() => Promise.resolve());
    });

    // @TODO: Test getLabeledThingInFrame
  });

  describe('saveLabeledThingInFrame', () => {
    beforeEach(() => {
      spyOn(proto, [
        'saveLabeledThingInFrame',
      ]).and.callFake(() => Promise.resolve());

      // @TODO: Test saveLabeledThingInFrame
    });
  });
});
