import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';
import LabelingData from 'Application/LabelingData/LabelingData';
import TaskModule from 'Application/Task/TaskModule';

import LabeledThingInFrameGateway from 'Application/LabelingData/Gateways/LabeledThingInFrameGateway';
import CachingLabeledThingInFrameGateway from 'Application/LabelingData/Gateways/CachingLabeledThingInFrameGateway';

import LabeledThing from 'Application/LabelingData/Models/LabeledThing';
import LabeledThingInFrame from 'Application/LabelingData/Models/LabeledThingInFrame';

describe('CachingLabeledThingInFrameGateway', () => {
  let $q;
  let defaultTask;
  let gateway;
  let frameIndexService;

  let ltCache;
  let ltifCache;
  let ltifGhostCache;

  let proto;
  let $rootScope;

  let createdLtifs;
  let createdLts;

  function createTask(id, start, end, skip) {
    const frameNumberMapping = [];
    for (let frameNumber = start; frameNumber <= end; frameNumber += skip) {
      frameNumberMapping.push(frameNumber);
    }

    return {
      id,
      frameNumberMapping,
    };
  }

  function _lt(task, id, start = 0, end = 1000) {
    const ltKey = `${task.id}.${id}`;
    if (!createdLts.has(ltKey)) {
      const raw = {
        task,
        id,
        classes: [],
        rev: `1-${Math.round(Math.random() * Number.MAX_SAFE_INTEGER)}`,
        incomplete: true,
        frameRange: {
          startFrameIndex: start,
          endFrameIndex: end,
        },
        lineColor: 23,
      };

      createdLts.set(ltKey, new LabeledThing(raw));
    }

    return createdLts.get(ltKey);
  }

  function _ltif(task, id, frameIndex, ghost = false, labeledThingId = 'some-labeled-thing', classes = [], ghostClasses = null) {
    const ltifKey = `${task.id}.${id}.${frameIndex}.${labeledThingId}`;
    if (!createdLtifs.has(ltifKey)) {
      const raw = {
        frameIndex,
        ghost,
        labeledThingId,
        classes,
        ghostClasses,
        id: id !== undefined ? id : `labeled-thing-in-frame-${Math.round(Math.random() * Number.MAX_SAFE_INTEGER)}`,
        rev: `1-${Math.round(Math.random() * Number.MAX_SAFE_INTEGER)}`,
        shapes: [{type: 'rectangle'}],
      };

      createdLtifs.set(ltifKey, new LabeledThingInFrame(
        Object.assign({}, raw, {
          labeledThing: _lt(task, raw.labeledThingId),
        })
      ));
    }

    return createdLtifs.get(ltifKey);
  }

  function _ltifKey(ltif) {
    if (ltif.ghost) {
      return `${ltif.labeledThing.task.id}.${ltif.frameIndex}.${ltif.labeledThing.id}`;
    }

    return `${ltif.labeledThing.task.id}.${ltif.frameIndex}.${ltif.id}`;
  }

  function storeInCache(completeFrames, ...labeledObjects) {
    labeledObjects.forEach(labeledObject => {
      switch (true) {
        case labeledObject instanceof LabeledThingInFrame && labeledObject.ghost === false:
          ltifCache.store(`${labeledObject.labeledThing.task.id}.${labeledObject.frameIndex}.${labeledObject.id}`, labeledObject.toJSON());
          ltCache.store(`${labeledObject.labeledThing.task.id}.${labeledObject.labeledThing.id}`, labeledObject.labeledThing.toJSON());
          if (completeFrames) {
            ltifCache.store(`${labeledObject.labeledThing.task.id}.${labeledObject.frameIndex}.complete`, true);
          }
          break;
        case labeledObject instanceof LabeledThingInFrame && labeledObject.ghost === true:
          ltifGhostCache.store(`${labeledObject.labeledThing.task.id}.${labeledObject.frameIndex}.${labeledObject.labeledThing.id}`, labeledObject.toJSON());
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

    createdLtifs = new Map();
    createdLts = new Map();

    proto = LabeledThingInFrameGateway.prototype;

    const featureFlags = {
      pouchdb: false,
    };

    const commonModule = new Common();
    commonModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.Common');

    const labelingDataModule = new LabelingData();
    labelingDataModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.LabelingData');

    const taskModule = new TaskModule();
    taskModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.Task');

    module($provide => {
      $provide.value('applicationConfig', {
        Common: {},
      });
    });

    inject($injector => {
      $rootScope = $injector.get('$rootScope');
      $q = $injector.get('$q');
      cache = $injector.get('cacheService');
      gateway = $injector.instantiate(CachingLabeledThingInFrameGateway);
      frameIndexService = $injector.get('frameIndexService');
    });

    defaultTask = createTask('some-task', 0, 3000, 1);
    frameIndexService.setTask(defaultTask);

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
    let labeledThingsInFrame;
    beforeEach(() => {
      labeledThingsInFrame = [
        _ltif(defaultTask, 'xyz', 42),
        _ltif(defaultTask, 'uvw', 43),
      ];

      spyOn(proto, [
        'listLabeledThingInFrame',
      ]).and.callFake(() => $q.resolve(labeledThingsInFrame));
    });

    it('should by default call through', () => {
      gateway.listLabeledThingInFrame(defaultTask, 42, 0, 1);
      expect(proto.listLabeledThingInFrame).toHaveBeenCalledWith(defaultTask, 42, 0, 1);
    });

    it('should by default call through with offset 0 and limit 1', () => {
      gateway.listLabeledThingInFrame(defaultTask, 42);
      expect(proto.listLabeledThingInFrame).toHaveBeenCalledWith(defaultTask, 42, 0, 1);
    });

    it('should use cache if present', () => {
      storeInCache(true, ...labeledThingsInFrame);
      gateway.listLabeledThingInFrame(defaultTask, 42, 0, 1);
      expect(proto.listLabeledThingInFrame).not.toHaveBeenCalled();
    });

    it('should output data from cache', () => {
      storeInCache(true, ...labeledThingsInFrame);
      gateway.listLabeledThingInFrame(defaultTask, 42, 0, 2).then(results => {
        expect(results).toEqual(labeledThingsInFrame);
      });

      $rootScope.$digest();
    });

    it('should output data from cache with offset', () => {
      storeInCache(true, ...labeledThingsInFrame);
      gateway.listLabeledThingInFrame(defaultTask, 39, 3, 2).then(results => {
        expect(results).toEqual(labeledThingsInFrame);
      });

      $rootScope.$digest();
    });

    it('should call through if cache has gaps', () => {
      storeInCache(true, ...labeledThingsInFrame);
      storeInCache(true, _ltif(defaultTask, 'ijk', 45));
      gateway.listLabeledThingInFrame(defaultTask, 42, 0, 4);
      expect(proto.listLabeledThingInFrame).toHaveBeenCalledWith(defaultTask, 42, 0, 4);
    });

    it('should call through if cache frames are incomplete', () => {
      storeInCache(true, ...labeledThingsInFrame);
      storeInCache(false, _ltif(defaultTask, 'ijk', 44));
      gateway.listLabeledThingInFrame(defaultTask, 42, 0, 3);
      expect(proto.listLabeledThingInFrame).toHaveBeenCalledWith(defaultTask, 42, 0, 3);
    });

    it('should store retrieved information in cache', () => {
      gateway.listLabeledThingInFrame(defaultTask, 42, 0, 2).then(() => {
        expect(ltifCache.get(`${defaultTask.id}.42.${labeledThingsInFrame[0].id}`)).toBeDefined();
        expect(ltifCache.get(`${defaultTask.id}.43.${labeledThingsInFrame[1].id}`)).toBeDefined();
      });
      $rootScope.$digest();
    });

    it('should mark retrieved frames as being completed', () => {
      gateway.listLabeledThingInFrame(defaultTask, 42, 0, 2).then(() => {
        expect(ltifCache.get(`${defaultTask.id}.42.complete`)).toBeTruthy();
        expect(ltifCache.get(`${defaultTask.id}.43.complete`)).toBeTruthy();
      });
      $rootScope.$digest();
    });

    it('should save multiple labeledThingInFrames on the same frame to cache', () => {
      proto.listLabeledThingInFrame
        .and.callFake(
        () => $q.resolve([
          _ltif(defaultTask, 'x', 42, false, '1'),
          _ltif(defaultTask, 'y', 42, false, '2'),
          _ltif(defaultTask, 'z', 42, false, '3'),
        ])
      );
      gateway.listLabeledThingInFrame(defaultTask, 42).then(result => {
        expect(ltifCache.get(`${defaultTask.id}.42.x`)).toEqual(result[0].toJSON());
        expect(ltifCache.get(`${defaultTask.id}.42.y`)).toEqual(result[1].toJSON());
        expect(ltifCache.get(`${defaultTask.id}.42.z`)).toEqual(result[2].toJSON());
      });
      $rootScope.$digest();
    });
  });

  describe('getLabeledThingInFrame', () => {
    let labeledThing;
    let defaultResult;

    beforeEach(() => {
      labeledThing = _lt(defaultTask, 'lt-1');

      defaultResult = [
        _ltif(defaultTask, 'ltif-1', 10, false, 'lt-1'),
        _ltif(defaultTask, null, 11, true, 'lt-1'),
        _ltif(defaultTask, 'ltif-3', 12, false, 'lt-1'),
        _ltif(defaultTask, 'ltif-4', 13, false, 'lt-1'),
      ];

      spyOn(proto, [
        'getLabeledThingInFrame',
      ]).and.callFake(() => $q.resolve(defaultResult));
    });

    it('should call through by default', () => {
      gateway.getLabeledThingInFrame(defaultTask, 42, labeledThing, 0, 1);
      expect(proto.getLabeledThingInFrame).toHaveBeenCalledWith(defaultTask, 42, labeledThing, 0, 1);
    });

    it('should call through by default with offset 0 and limit 1', () => {
      gateway.getLabeledThingInFrame(defaultTask, 42, labeledThing);
      expect(proto.getLabeledThingInFrame).toHaveBeenCalledWith(defaultTask, 42, labeledThing, 0, 1);
    });

    it('should store labeledThing to cache after retrieval', () => {
      const lt1 = _lt(defaultTask, 'lt-1');
      gateway.getLabeledThingInFrame(defaultTask, 10, lt1, 0, 4)
        .then(() => {
          expect(ltCache.get(`${defaultTask.id}.lt-1`)).toEqual(lt1.toJSON());
        });
      $rootScope.$digest();
    });

    it('should store non ghost LabeledThingInFrame to cache after retrieval', () => {
      gateway.getLabeledThingInFrame(defaultTask, 10, labeledThing, 0, 4)
        .then(() => {
          [0, 2, 3].forEach(index => {
            expect(ltifCache.get(`${defaultTask.id}.${index + 10}.ltif-${index + 1}`)).toEqual(defaultResult[index].toJSON());
          });
        });
      $rootScope.$digest();
    });

    it('should store ghost LabeledThingInFrame to cache after retrieval', () => {
      gateway.getLabeledThingInFrame(defaultTask, 10, labeledThing, 0, 4)
        .then(() => {
          expect(ltifGhostCache.get(`${defaultTask.id}.11.lt-1`)).toEqual(defaultResult[1].toJSON());
        });
      $rootScope.$digest();
    });

    describe('cache result builder', () => {
      beforeEach(() => {
        storeInCache(
          false,
          _ltif(defaultTask, null, 8, true, 'lt-1'),
          _ltif(defaultTask, null, 9, true, 'lt-1'),
          _ltif(defaultTask, 'ltif-1-1', 10, false, 'lt-1'),
          _ltif(defaultTask, 'ltif-1-2', 11, false, 'lt-1'),
          _ltif(defaultTask, null, 12, true, 'lt-1'),
          _ltif(defaultTask, null, 13, true, 'lt-1'),
          _ltif(defaultTask, 'ltif-1-3', 14, false, 'lt-1'),
          // Hole
          _ltif(defaultTask, 'ltif-1-4', 18, false, 'lt-1'),
          _ltif(defaultTask, 'ltif-1-5', 19, false, 'lt-1'),
          _ltif(defaultTask, 'ltif-1-6', 20, false, 'lt-1'),

          // Second lt
          _ltif(defaultTask, null, 8, true, 'lt-2'),
          _ltif(defaultTask, null, 9, true, 'lt-2'),
          _ltif(defaultTask, 'ltif-2-1', 10, false, 'lt-2'),
          _ltif(defaultTask, 'ltif-2-2', 11, false, 'lt-2'),
          _ltif(defaultTask, null, 12, true, 'lt-2'),
          _ltif(defaultTask, null, 13, true, 'lt-2'),
          _ltif(defaultTask, 'ltif-2-3', 14, false, 'lt-2'),
          // Hole
          _ltif(defaultTask, 'ltif-2-4', 18, false, 'lt-2'),
          _ltif(defaultTask, 'ltif-2-5', 19, false, 'lt-2'),
          _ltif(defaultTask, 'ltif-2-6', 20, false, 'lt-2')
        );
      });

      it('should retrieve single ltifs from cache', () => {
        gateway.getLabeledThingInFrame(defaultTask, 10, labeledThing).then(result => {
          expect(result[0]).toEqual(_ltif(defaultTask, 'ltif-1-1', 10, false, 'lt-1'));
        });
        $rootScope.$digest();
      });

      it('should retrieve single ltifs from cache', () => {
        gateway.getLabeledThingInFrame(defaultTask, 10, labeledThing).then(result => {
          expect(result.length).toBe(1);
          expect(result[0]).toEqual(_ltif(defaultTask, 'ltif-1-1', 10, false, 'lt-1'));
        });

        $rootScope.$digest();
        expect(proto.getLabeledThingInFrame).not.toHaveBeenCalled();
      });

      it('should retrieve single ltifs from cache with offset', () => {
        gateway.getLabeledThingInFrame(defaultTask, 10, labeledThing, 1, 1).then(result => {
          expect(result.length).toBe(1);
          expect(result[0]).toEqual(_ltif(defaultTask, 'ltif-1-2', 11, false, 'lt-1'));
        });

        $rootScope.$digest();
        expect(proto.getLabeledThingInFrame).not.toHaveBeenCalled();
      });

      it('should retrieve single ghost ltif from cache', () => {
        gateway.getLabeledThingInFrame(defaultTask, 12, labeledThing).then(result => {
          expect(result.length).toBe(1);
          expect(result[0]).toEqual(_ltif(defaultTask, null, 12, true, 'lt-1'));
        });

        $rootScope.$digest();
        expect(proto.getLabeledThingInFrame).not.toHaveBeenCalled();
      });

      it('should retrieve single ghost ltif from cache with offset', () => {
        gateway.getLabeledThingInFrame(defaultTask, 12, labeledThing, 1, 1).then(result => {
          expect(result.length).toBe(1);
          expect(result[0]).toEqual(_ltif(defaultTask, null, 13, true, 'lt-1'));
        });

        $rootScope.$digest();
        expect(proto.getLabeledThingInFrame).not.toHaveBeenCalled();
      });

      it('should retrieve multiple ltifs from cache', () => {
        const lt2 = _lt(defaultTask, 'lt-2');
        gateway.getLabeledThingInFrame(defaultTask, 10, lt2, 0, 2).then(result => {
          expect(result.length).toBe(2);
          expect(result[0]).toEqual(_ltif(defaultTask, 'ltif-2-1', 10, false, 'lt-2'));
          expect(result[1]).toEqual(_ltif(defaultTask, 'ltif-2-2', 11, false, 'lt-2'));
        });

        $rootScope.$digest();
        expect(proto.getLabeledThingInFrame).not.toHaveBeenCalled();
      });

      it('should retrieve multiple ghost ltifs from cache', () => {
        const lt2 = _lt(defaultTask, 'lt-2');
        gateway.getLabeledThingInFrame(defaultTask, 12, lt2, 0, 2).then(result => {
          expect(result.length).toBe(2);
          expect(result[0]).toEqual(_ltif(defaultTask, null, 12, true, 'lt-2'));
          expect(result[1]).toEqual(_ltif(defaultTask, null, 13, true, 'lt-2'));
        });

        $rootScope.$digest();
        expect(proto.getLabeledThingInFrame).not.toHaveBeenCalled();
      });

      it('should retrieve multiple ghost/non-ghost ltif combinations from cache', () => {
        gateway.getLabeledThingInFrame(defaultTask, 10, labeledThing, 0, 5).then(result => {
          expect(result.length).toBe(5);
          expect(result[0]).toEqual(_ltif(defaultTask, 'ltif-1-1', 10, false, 'lt-1'));
          expect(result[1]).toEqual(_ltif(defaultTask, 'ltif-1-2', 11, false, 'lt-1'));
          expect(result[2]).toEqual(_ltif(defaultTask, null, 12, true, 'lt-1'));
          expect(result[3]).toEqual(_ltif(defaultTask, null, 13, true, 'lt-1'));
          expect(result[4]).toEqual(_ltif(defaultTask, 'ltif-1-3', 14, true, 'lt-1'));
        });

        $rootScope.$digest();
        expect(proto.getLabeledThingInFrame).not.toHaveBeenCalled();
      });

      it('should retrieve multiple ghost/non-ghost ltif combinations from cache with ghosts at the end', () => {
        gateway.getLabeledThingInFrame(defaultTask, 10, labeledThing, 0, 3).then(result => {
          expect(result.length).toBe(3);
          expect(result[0]).toEqual(_ltif(defaultTask, 'ltif-1-1', 10, false, 'lt-1'));
          expect(result[1]).toEqual(_ltif(defaultTask, 'ltif-1-2', 11, false, 'lt-1'));
          expect(result[2]).toEqual(_ltif(defaultTask, null, 12, true, 'lt-1'));
        });

        $rootScope.$digest();
        expect(proto.getLabeledThingInFrame).not.toHaveBeenCalled();
      });

      it('should retrieve multiple ghost/non-ghost ltif combinations from cache with ghosts at the beginning', () => {
        gateway.getLabeledThingInFrame(defaultTask, 8, labeledThing, 0, 3).then(result => {
          expect(result.length).toBe(3);
          expect(result[0]).toEqual(_ltif(defaultTask, null, 8, true, 'lt-1'));
          expect(result[1]).toEqual(_ltif(defaultTask, null, 9, true, 'lt-1'));
          expect(result[2]).toEqual(_ltif(defaultTask, 'ltif-1-1', 10, false, 'lt-1'));
        });

        $rootScope.$digest();
        expect(proto.getLabeledThingInFrame).not.toHaveBeenCalled();
      });

      it('should retrieve multiple ghost/non-ghost ltif combinations from cache with ghosts at the beginning as well as the end', () => {
        gateway.getLabeledThingInFrame(defaultTask, 8, labeledThing, 0, 5).then(result => {
          expect(result.length).toBe(5);
          expect(result[0]).toEqual(_ltif(defaultTask, null, 8, true, 'lt-1'));
          expect(result[1]).toEqual(_ltif(defaultTask, null, 9, true, 'lt-1'));
          expect(result[2]).toEqual(_ltif(defaultTask, 'ltif-1-1', 10, false, 'lt-1'));
          expect(result[3]).toEqual(_ltif(defaultTask, 'ltif-1-2', 11, false, 'lt-1'));
          expect(result[4]).toEqual(_ltif(defaultTask, null, 12, true, 'lt-1'));

          expect(proto.getLabeledThingInFrame).not.toHaveBeenCalled();
        });

        $rootScope.$digest();
      });

      it('should request backend if a hole is present in middle', () => {
        gateway.getLabeledThingInFrame(defaultTask, 14, labeledThing, 0, 5).then(() => {
          expect(proto.getLabeledThingInFrame).toHaveBeenCalledWith(defaultTask, 14, labeledThing, 0, 5);
        });
        $rootScope.$digest();
      });

      it('should request backend if a hole is present in the front', () => {
        gateway.getLabeledThingInFrame(defaultTask, 16, labeledThing, 0, 5).then(() => {
          expect(proto.getLabeledThingInFrame).toHaveBeenCalledWith(defaultTask, 16, labeledThing, 0, 5);
        });
        $rootScope.$digest();
      });

      it('should request backend if a hole is present in the end', () => {
        gateway.getLabeledThingInFrame(defaultTask, 11, labeledThing, 0, 5).then(() => {
          expect(proto.getLabeledThingInFrame).toHaveBeenCalledWith(defaultTask, 11, labeledThing, 0, 5);
        });
        $rootScope.$digest();
      });

      it('should request backend if a gap is requested', () => {
        gateway.getLabeledThingInFrame(defaultTask, 15, labeledThing, 0, 2).then(() => {
          expect(proto.getLabeledThingInFrame).toHaveBeenCalledWith(defaultTask, 15, labeledThing, 0, 2);
        });
        $rootScope.$digest();
      });
    });
  });

  describe('saveLabeledThingInFrame', () => {
    let labeledThingInFrame;

    beforeEach(() => {
      defaultTask = createTask('some-task', 0, 2500, 1);
      frameIndexService.setTask(defaultTask);

      labeledThingInFrame = _ltif(defaultTask, 'ltif-1-*3', 12, false, 'lt-1');

      storeInCache(
        false,
        _ltif(defaultTask, null, 8, true, 'lt-1'),
        _ltif(defaultTask, null, 9, true, 'lt-1'),
        _ltif(defaultTask, 'ltif-1-1', 10, false, 'lt-1'),
        _ltif(defaultTask, 'ltif-1-2', 11, false, 'lt-1'),
        _ltif(defaultTask, null, 12, true, 'lt-1'),
        _ltif(defaultTask, null, 13, true, 'lt-1'),
        _ltif(defaultTask, 'ltif-1-3', 14, false, 'lt-1'),
        // Hole
        _ltif(defaultTask, 'ltif-1-4', 18, false, 'lt-1'),
        _ltif(defaultTask, 'ltif-1-5', 19, false, 'lt-1'),
        _ltif(defaultTask, 'ltif-1-6', 20, false, 'lt-1'),

        // Second lt
        _ltif(defaultTask, null, 8, true, 'lt-2'),
        _ltif(defaultTask, null, 9, true, 'lt-2'),
        _ltif(defaultTask, 'ltif-2-1', 10, false, 'lt-2'),
        _ltif(defaultTask, 'ltif-2-2', 11, false, 'lt-2'),
        _ltif(defaultTask, null, 12, true, 'lt-2'),
        _ltif(defaultTask, null, 13, true, 'lt-2'),
        _ltif(defaultTask, 'ltif-2-3', 14, true, 'lt-2'),
        // Hole
        _ltif(defaultTask, 'ltif-2-4', 18, false, 'lt-2'),
        _ltif(defaultTask, 'ltif-2-5', 19, false, 'lt-2'),
        _ltif(defaultTask, 'ltif-2-6', 20, false, 'lt-2')
      );

      spyOn(proto, [
        'saveLabeledThingInFrame',
      ]).and.callFake(ltif => $q.resolve(ltif));
    });

    it('should call through', () => {
      gateway.saveLabeledThingInFrame(labeledThingInFrame);
      expect(proto.saveLabeledThingInFrame).toHaveBeenCalledWith(labeledThingInFrame);
    });

    it('should invalidate all ghosts left of saved LabeledThingInFrame until next non-ghost is found', () => {
      gateway.saveLabeledThingInFrame(_ltif(defaultTask, 'ltif-1-*1', 10, false, 'lt-1'));
      expect(ltifGhostCache.get(_ltifKey(_ltif(defaultTask, null, 8, true, 'lt-1')))).toBeUndefined();
      expect(ltifGhostCache.get(_ltifKey(_ltif(defaultTask, null, 9, true, 'lt-1')))).toBeUndefined();
    });

    it('should invalidate ghost on the frame of the LabeledThingInFrame itself', () => {
      gateway.saveLabeledThingInFrame(_ltif(defaultTask, 'ltif-1-*1', 8, false, 'lt-1'));
      expect(ltifGhostCache.get(_ltifKey(_ltif(defaultTask, null, 8, true, 'lt-1')))).toBeUndefined();
    });

    it('should invalidate all ghosts right of saved LabeledThingInFrame until next non-ghost is found', () => {
      gateway.saveLabeledThingInFrame(_ltif(defaultTask, 'ltif-1-*1', 8, false, 'lt-1'));
      expect(ltifGhostCache.get(_ltifKey(_ltif(defaultTask, null, 9, true, 'lt-1')))).toBeUndefined();
    });

    it('should not invalidate any ghosts if LabeledThingInFrame is surrounded by non ghosts', () => {
      gateway.saveLabeledThingInFrame(_ltif(defaultTask, 'ltif-1-*5', 19, false, 'lt-1'));
      expect(ltifGhostCache.get(_ltifKey(_ltif(defaultTask, null, 8, true, 'lt-1')))).toBeDefined();
      expect(ltifGhostCache.get(_ltifKey(_ltif(defaultTask, null, 9, true, 'lt-1')))).toBeDefined();
      expect(ltifGhostCache.get(_ltifKey(_ltif(defaultTask, null, 12, true, 'lt-1')))).toBeDefined();
      expect(ltifGhostCache.get(_ltifKey(_ltif(defaultTask, null, 13, true, 'lt-1')))).toBeDefined();
    });

    it('should not invalidate any ghosts belonging to other LabeledThings', () => {
      gateway.saveLabeledThingInFrame(_ltif(defaultTask, 'ltif-1-*2', 11, false, 'lt-1'));
      expect(ltifGhostCache.get(_ltifKey(_ltif(defaultTask, null, 8, true, 'lt-2')))).toBeDefined();
      expect(ltifGhostCache.get(_ltifKey(_ltif(defaultTask, null, 9, true, 'lt-2')))).toBeDefined();
      expect(ltifGhostCache.get(_ltifKey(_ltif(defaultTask, null, 12, true, 'lt-2')))).toBeDefined();
      expect(ltifGhostCache.get(_ltifKey(_ltif(defaultTask, null, 13, true, 'lt-2')))).toBeDefined();
    });

    it('should invalidate the stored ltif if classes did not change before saving', () => {
      gateway.saveLabeledThingInFrame(_ltif(defaultTask, 'ltif-1-*2', 11, false, 'lt-1')).then(() => {
        expect(ltifCache.get(_ltifKey(_ltif(defaultTask, 'ltif-1-2', 11, false, 'lt-2')))).toBeUndefined();
        expect(ltifCache.get(_ltifKey(_ltif(defaultTask, 'ltif-1-*2', 11, false, 'lt-2')))).toBeDefined();
      });
      expect(ltifCache.get(_ltifKey(_ltif(defaultTask, 'ltif-1-2', 11, true, 'lt-2')))).toBeUndefined();
      $rootScope.$digest();
    });

    it('should set the ltif frameIndex to incomplete before saving', () => {
      gateway.saveLabeledThingInFrame(_ltif(defaultTask, 'ltif-1-*2', 11, false, 'lt-1'))
        .then(() => {
          expect(ltifCache.get(`${defaultTask.id}.11.complete`)).toBeUndefined();
        });

      expect(ltifCache.get(`${defaultTask.id}.11.complete`)).toBeUndefined();
      $rootScope.$digest();
    });

    it('should restore the ltif frameIndex to complete after saving', () => {
      ltifCache.store(`${defaultTask.id}.11.complete`, true);
      gateway.saveLabeledThingInFrame(_ltif(defaultTask, 'ltif-1-*2', 11, false, 'lt-1'))
        .then(() => {
          expect(ltifCache.get(`${defaultTask.id}.11.complete`)).toBeTruthy();
        });

      expect(ltifCache.get(`${defaultTask.id}.11.complete`)).toBeUndefined();
      $rootScope.$digest();
    });

    it('should update the implicitly received LabeledThing', () => {
      gateway.saveLabeledThingInFrame(_ltif(defaultTask, 'ltif-1-*2', 11, false, 'lt-1'))
        .then(() => {
          expect(ltCache.get(`${defaultTask.id}.lt-1`)).toBeDefined();
        });
      ltCache.invalidate(`${defaultTask.id}.lt-1`);
      $rootScope.$digest();
    });

    it('should invalidate all ltifs right of the updated one if classes changed', () => {
      const updatedLtif = new LabeledThingInFrame({
        frameIndex: 11,
        ghost: false,
        classes: ['some', 'new', 'classes'],
        ghostClasses: null,
        id: 'ltif-1-2',
        rev: `1-${Math.round(Math.random() * Number.MAX_SAFE_INTEGER)}`,
        shapes: [{type: 'rectangle'}],
        labeledThing: new LabeledThing({id: 'lt-1', task: defaultTask}),
      });

      gateway.saveLabeledThingInFrame(updatedLtif);
      expect(ltifCache.get(_ltifKey(_ltif(defaultTask, 'ltif-1-3', 14, false, 'lt-1')))).toBeUndefined();
      expect(ltifCache.get(_ltifKey(_ltif(defaultTask, 'ltif-1-4', 18, false, 'lt-1')))).toBeUndefined();
      expect(ltifCache.get(_ltifKey(_ltif(defaultTask, 'ltif-1-5', 19, false, 'lt-1')))).toBeUndefined();
      expect(ltifCache.get(_ltifKey(_ltif(defaultTask, 'ltif-1-6', 20, false, 'lt-1')))).toBeUndefined();
    });

    it('should invalidate all ltifs right of the updated one if ghostClasses existed and classes were added', () => {
      const updatedLtif = new LabeledThingInFrame({
        frameIndex: 11,
        ghost: false,
        classes: [],
        ghostClasses: ['some', 'old', 'classes'],
        id: 'ltif-1-2',
        rev: `1-${Math.round(Math.random() * Number.MAX_SAFE_INTEGER)}`,
        shapes: [{type: 'rectangle'}],
        labeledThing: new LabeledThing({id: 'lt-1', task: defaultTask}),
      });

      ltifCache.store(`${defaultTask.id}.11.ltif-1-2`, updatedLtif.toJSON());

      updatedLtif.ghostClasses = null;
      updatedLtif.classes = ['some', 'old', 'classes', 'and', 'a', 'new'];

      gateway.saveLabeledThingInFrame(updatedLtif);
      expect(ltifCache.get(_ltifKey(_ltif(defaultTask, 'ltif-1-3', 14, false, 'lt-1')))).toBeUndefined();
      expect(ltifCache.get(_ltifKey(_ltif(defaultTask, 'ltif-1-4', 18, false, 'lt-1')))).toBeUndefined();
      expect(ltifCache.get(_ltifKey(_ltif(defaultTask, 'ltif-1-5', 19, false, 'lt-1')))).toBeUndefined();
      expect(ltifCache.get(_ltifKey(_ltif(defaultTask, 'ltif-1-6', 20, false, 'lt-1')))).toBeUndefined();
    });

    it('should not invalidate all ltifs right of the updated one if classes did not change', () => {
      const updatedLtif = new LabeledThingInFrame({
        frameIndex: 11,
        ghost: false,
        classes: ['some', 'new', 'classes'],
        ghostClasses: null,
        id: 'ltif-1-2',
        rev: `1-${Math.round(Math.random() * Number.MAX_SAFE_INTEGER)}`,
        shapes: [{type: 'rectangle'}],
        labeledThing: new LabeledThing({id: 'lt-1', task: defaultTask}),
      });

      ltifCache.store(`${defaultTask.id}.11.ltif-1-2`, updatedLtif.toJSON());
      gateway.saveLabeledThingInFrame(updatedLtif);

      expect(ltifCache.get(_ltifKey(_ltif(defaultTask, 'ltif-1-3', 14, false, 'lt-1')))).toBeDefined();
      expect(ltifCache.get(_ltifKey(_ltif(defaultTask, 'ltif-1-4', 18, false, 'lt-1')))).toBeDefined();
      expect(ltifCache.get(_ltifKey(_ltif(defaultTask, 'ltif-1-5', 19, false, 'lt-1')))).toBeDefined();
      expect(ltifCache.get(_ltifKey(_ltif(defaultTask, 'ltif-1-6', 20, false, 'lt-1')))).toBeDefined();
    });
  });
});
