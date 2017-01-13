import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';
import TaskModule from 'Application/Task/TaskModule';
import LabelingData from 'Application/LabelingData/LabelingData';

import LabeledThingGateway from 'Application/LabelingData/Gateways/LabeledThingGateway';
import CachingLabeledThingGateway from 'Application/LabelingData/Gateways/CachingLabeledThingGateway';

import LabeledThing from 'Application/LabelingData/Models/LabeledThing';

describe('CachingLabeledThingGateway', () => {
  let $q;
  let gateway;
  let frameIndexService;

  let ltCache;
  let ltifCache;
  let ltifGhostCache;

  let proto;
  let $rootScope;

  let labeledThingMock;

  beforeEach(() => {
    let cache;

    proto = LabeledThingGateway.prototype;

    labeledThingMock = new LabeledThing({
      task: {id: 'some-task'},
      id: 'some-labeled-thing',
      rev: '1-abcdef',
      frameRange: {startFrameIndex: 23, endFrameIndex: 42},
      classes: ['foo', 'bar'],
    });

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
      gateway = $injector.instantiate(CachingLabeledThingGateway);
      frameIndexService = $injector.get('frameIndexService');
    });

    ltifCache = cache.container('labeledThingsInFrame-by-frame');
    ltifGhostCache = cache.container('ghosted-labeledThingsInFrame-by-id');
    ltCache = cache.container('labeledThing-by-id');

    ltCache.invalidate();
    ltifCache.invalidate();
    ltifGhostCache.invalidate();
  })
  ;

  it('should be able to instantiate without non injected arguments', () => {
    expect(gateway instanceof CachingLabeledThingGateway).toEqual(true);
  });

  describe('getLabeledThing', () => {
    let task;

    beforeEach(() => {
      spyOn(proto, [
        'getLabeledThing',
      ]).and.callFake(() => $q.resolve(labeledThingMock));

      task = {id: 'some-task'};
    });

    it('should by default call through', () => {
      gateway.getLabeledThing(task, 'some-labeled-thing');
      expect(proto.getLabeledThing).toHaveBeenCalledWith(task, 'some-labeled-thing');
    });

    it('should use cache if present', done => {
      ltCache.store(`${task.id}.some-labeled-thing`, labeledThingMock.toJSON());
      gateway.getLabeledThing(task, 'some-labeled-thing').then(labeledThing => {
        expect(labeledThing).toEqual(labeledThingMock);
        done();
      });
      expect(proto.getLabeledThing).not.toHaveBeenCalled();

      $rootScope.$digest();
    });

    it('should store fetched data to cache', done => {
      gateway.getLabeledThing(task, 'some-labeled-thing').then(() => {
        expect(ltCache.get('some-task.some-labeled-thing')).toEqual(labeledThingMock.toJSON());
        done();
      });
      $rootScope.$digest();
    });
  });

  describe('saveLabeledThing', () => {
    beforeEach(() => {
      spyOn(proto, [
        'saveLabeledThing',
      ]).and.callFake(() => $q.resolve(labeledThingMock));
    });

    it('should by default call through', () => {
      gateway.saveLabeledThing(labeledThingMock);
      expect(proto.saveLabeledThing).toHaveBeenCalledWith(labeledThingMock);
    });

    it('should call through even if cache exists', done => {
      ltCache.store('some-task.some-labeled-thing', labeledThingMock.toJSON());
      gateway.saveLabeledThing(labeledThingMock).then(() => {
        expect(proto.saveLabeledThing).toHaveBeenCalledWith(labeledThingMock);
        done();
      });

      $rootScope.$digest();
    });

    it('should update cache with newly stored data', done => {
      const ltCacheKey = 'some-task.some-labeled-thing';
      ltCache.store(ltCacheKey, {
        id: 'some-labeled-thing',
        taskId: 'some-task',
        frameRange: {startFrameIndex: 23, endFrameIndex: 42},
        classes: ['other', 'classes', 'then', 'mock'],
        lineColor: 23,
      });

      gateway.saveLabeledThing(labeledThingMock).then(() => {
        expect(ltCache.get(ltCacheKey)).toEqual(labeledThingMock.toJSON());
        done();
      });

      $rootScope.$digest();
    });

    it('should invalidate cache before storing data', () => {
      proto.saveLabeledThing.and.callFake(
        () => new $q(() => {
        })
      );

      const ltCacheKey = 'some-task.some-labeled-thing';
      ltCache.store(ltCacheKey, {
        id: 'some-labeled-thing',
        taskId: 'some-task',
        frameRange: {startFrameIndex: 23, endFrameIndex: 42},
        classes: ['foo', 'bar'],
        lineColor: 42,
      });

      gateway.saveLabeledThing(labeledThingMock);

      expect(ltCache.get(ltCacheKey)).toBeUndefined();
    });

    describe('FrameRange Invalidation', () => {
      beforeEach(() => {
        const task = {
          id: 'task-id',
          frameNumberMapping: new Array(100).fill(null).map((ignore, index) => index + 1),
        };
        frameIndexService.setTask(task);
      });

      it('should invalidate ltif cache when frameRange startFrameIndex was moved forward', () => {
        const ltCacheKey = 'task-id.some-labeled-thing';
        const ltBefore = {
          id: 'some-labeled-thing',
          taskId: 'task-id',
          frameRange: {startFrameIndex: 23, endFrameIndex: 42},
          classes: ['foo', 'bar'],
          lineColor: 42,
        };
        const ltAfter = new LabeledThing({
          id: 'some-labeled-thing',
          task: {id: 'task-id'},
          frameRange: {startFrameIndex: 27, endFrameIndex: 42},
          classes: ['foo', 'bar'],
          lineColor: 42,
        });
        const ltif24 = {
          id: 'ltif24-id',
          frameIndex: 24,
          ghost: false,
          shapes: [],
          ghostClasses: null,
          labeledThingId: 'some-labeled-thing',
          classes: ['aaa', 'bbb'],
        };
        const ltif24CacheKey = `${ltAfter.task.id}.${ltif24.frameIndex}.${ltif24.id}`;
        const ltif26 = {
          id: 'ltif26-id',
          frameIndex: 26,
          ghost: false,
          shapes: [],
          ghostClasses: null,
          labeledThingId: 'some-labeled-thing',
          classes: ['aaa', 'bbb'],
        };
        const ltif26CacheKey = `${ltAfter.task.id}.${ltif26.frameIndex}.${ltif26.id}`;

        ltCache.store(ltCacheKey, ltBefore);
        ltifCache.store(ltif24CacheKey, ltif24);
        ltifCache.store(ltif26CacheKey, ltif26);
        gateway.saveLabeledThing(ltAfter);

        $rootScope.$digest();

        expect(ltifCache.get(ltif24CacheKey)).toBeUndefined();
        expect(ltifCache.get(ltif26CacheKey)).toBeUndefined();
      });

      it('should invalidate ltif cache when frameRange endFrameIndex was moved backwards', () => {
        const ltCacheKey = 'task-id.some-labeled-thing';
        const ltBefore = {
          id: 'some-labeled-thing',
          taskId: 'task-id',
          frameRange: {startFrameIndex: 23, endFrameIndex: 42},
          classes: ['foo', 'bar'],
          lineColor: 42,
        };
        const ltAfter = new LabeledThing({
          id: 'some-labeled-thing',
          task: {id: 'task-id'},
          frameRange: {startFrameIndex: 23, endFrameIndex: 37},
          classes: ['foo', 'bar'],
          lineColor: 42,
        });
        const ltif39 = {
          id: 'ltif39-id',
          frameIndex: 39,
          ghost: false,
          shapes: [],
          ghostClasses: null,
          labeledThingId: 'some-labeled-thing',
          classes: ['aaa', 'bbb'],
        };
        const ltif39CacheKey = `${ltAfter.task.id}.${ltif39.frameIndex}.${ltif39.id}`;
        const ltif41 = {
          id: 'ltif41-id',
          frameIndex: 41,
          ghost: false,
          shapes: [],
          ghostClasses: null,
          labeledThingId: 'some-labeled-thing',
          classes: ['aaa', 'bbb'],
        };
        const ltif41CacheKey = `${ltAfter.task.id}.${ltif41.frameIndex}.${ltif41.id}`;

        ltCache.store(ltCacheKey, ltBefore);
        ltifCache.store(ltif39CacheKey, ltif39);
        ltifCache.store(ltif41CacheKey, ltif41);
        gateway.saveLabeledThing(ltAfter);

        $rootScope.$digest();

        expect(ltifCache.get(ltif39CacheKey)).toBeUndefined();
        expect(ltifCache.get(ltif41CacheKey)).toBeUndefined();
      });

      it('should invalidate ltif cache when frameRange start- and endFrameIndex was moved inwards', () => {
        const ltCacheKey = 'task-id.some-labeled-thing';
        const ltBefore = {
          id: 'some-labeled-thing',
          taskId: 'task-id',
          frameRange: {startFrameIndex: 23, endFrameIndex: 42},
          classes: ['foo', 'bar'],
          lineColor: 42,
        };
        const ltAfter = new LabeledThing({
          id: 'some-labeled-thing',
          task: {id: 'task-id'},
          frameRange: {startFrameIndex: 27, endFrameIndex: 37},
          classes: ['foo', 'bar'],
          lineColor: 42,
        });
        const ltif24 = {
          id: 'ltif24-id',
          frameIndex: 24,
          ghost: false,
          shapes: [],
          ghostClasses: null,
          labeledThingId: 'some-labeled-thing',
          classes: ['aaa', 'bbb'],
        };
        const ltif24CacheKey = `${ltAfter.task.id}.${ltif24.frameIndex}.${ltif24.id}`;
        const ltif26 = {
          id: 'ltif26-id',
          frameIndex: 26,
          ghost: false,
          shapes: [],
          ghostClasses: null,
          labeledThingId: 'some-labeled-thing',
          classes: ['aaa', 'bbb'],
        };
        const ltif26CacheKey = `${ltAfter.task.id}.${ltif26.frameIndex}.${ltif26.id}`;
        const ltif39 = {
          id: 'ltif39-id',
          frameIndex: 39,
          ghost: false,
          shapes: [],
          ghostClasses: null,
          labeledThingId: 'some-labeled-thing',
          classes: ['aaa', 'bbb'],
        };
        const ltif39CacheKey = `${ltAfter.task.id}.${ltif39.frameIndex}.${ltif39.id}`;
        const ltif41 = {
          id: 'ltif41-id',
          frameIndex: 41,
          ghost: false,
          shapes: [],
          ghostClasses: null,
          labeledThingId: 'some-labeled-thing',
          classes: ['aaa', 'bbb'],
        };
        const ltif41CacheKey = `${ltAfter.task.id}.${ltif41.frameIndex}.${ltif41.id}`;

        ltCache.store(ltCacheKey, ltBefore);
        ltifCache.store(ltif24CacheKey, ltif24);
        ltifCache.store(ltif26CacheKey, ltif26);
        ltifCache.store(ltif39CacheKey, ltif39);
        ltifCache.store(ltif41CacheKey, ltif41);
        gateway.saveLabeledThing(ltAfter);

        $rootScope.$digest();

        expect(ltifCache.get(ltif24CacheKey)).toBeUndefined();
        expect(ltifCache.get(ltif26CacheKey)).toBeUndefined();
        expect(ltifCache.get(ltif39CacheKey)).toBeUndefined();
        expect(ltifCache.get(ltif41CacheKey)).toBeUndefined();
      });

      it('should only invalidate ltif cache with matching labeled thing within framerange', () => {
        const task = {id: 'task-id', frameNumberMapping: new Array(100).fill(null).map((ignore, index) => index + 1)};
        frameIndexService.setTask(task);
        const ltCacheKey = 'task-id.some-labeled-thing';
        const ltBefore = {
          id: 'some-labeled-thing',
          taskId: 'task-id',
          frameRange: {startFrameIndex: 23, endFrameIndex: 42},
          classes: ['foo', 'bar'],
          lineColor: 42,
        };
        const ltAfter = new LabeledThing({
          id: 'some-labeled-thing',
          task: task,
          frameRange: {startFrameIndex: 27, endFrameIndex: 37},
          classes: ['foo', 'bar'],
          lineColor: 42,
        });
        const ltif24 = {
          id: 'ltif24-id',
          frameIndex: 24,
          ghost: false,
          shapes: [],
          ghostClasses: null,
          labeledThingId: 'some-other-labeled-thing',
          classes: ['aaa', 'bbb'],
        };
        const ltif24CacheKey = `${ltAfter.task.id}.${ltif24.frameIndex}.${ltif24.id}`;

        const ltif26 = {
          id: 'ltif26-id',
          frameIndex: 26,
          ghost: false,
          shapes: [],
          ghostClasses: null,
          labeledThingId: 'some-labeled-thing',
          classes: ['aaa', 'bbb'],
        };
        const ltif26CacheKey = `${ltAfter.task.id}.${ltif26.frameIndex}.${ltif26.id}`;

        const ltif39 = {
          id: 'ltif39-id',
          frameIndex: 39,
          ghost: false,
          shapes: [],
          ghostClasses: null,
          labeledThingId: 'some-labeled-thing',
          classes: ['aaa', 'bbb'],
        };
        const ltif39CacheKey = `${ltAfter.task.id}.${ltif39.frameIndex}.${ltif39.id}`;

        const ltif41 = {
          id: 'ltif41-id',
          frameIndex: 41,
          ghost: false,
          shapes: [],
          ghostClasses: null,
          labeledThingId: 'some-other-labeled-thing',
          classes: ['aaa', 'bbb'],
        };
        const ltif41CacheKey = `${ltAfter.task.id}.${ltif41.frameIndex}.${ltif41.id}`;

        ltCache.store(ltCacheKey, ltBefore);
        ltifCache.store(ltif24CacheKey, ltif24);
        ltifCache.store(ltif26CacheKey, ltif26);
        ltifCache.store(ltif39CacheKey, ltif39);
        ltifCache.store(ltif41CacheKey, ltif41);
        gateway.saveLabeledThing(ltAfter);

        $rootScope.$digest();

        expect(ltifCache.get(ltif24CacheKey)).not.toBeUndefined();
        expect(ltifCache.get(ltif26CacheKey)).toBeUndefined();
        expect(ltifCache.get(ltif39CacheKey)).toBeUndefined();
        expect(ltifCache.get(ltif41CacheKey)).not.toBeUndefined();
      });

      it('should invalidate ltif ghost cache for labeled thing within framerange', () => {
        const task = {id: 'task-id', frameNumberMapping: new Array(100).fill(null).map((ignore, index) => index + 1)};
        frameIndexService.setTask(task);
        const ltCacheKey = 'task-id.some-labeled-thing';
        const ltBefore = {
          id: 'some-labeled-thing',
          taskId: 'task-id',
          frameRange: {startFrameIndex: 23, endFrameIndex: 42},
          classes: ['foo', 'bar'],
          lineColor: 42,
        };
        const ltAfter = new LabeledThing({
          id: 'some-labeled-thing',
          task: task,
          frameRange: {startFrameIndex: 27, endFrameIndex: 37},
          classes: ['foo', 'bar'],
          lineColor: 42,
        });

        const ltifGhost24 = {
          id: 'ltif24-id',
          frameIndex: 24,
          ghost: true,
          shapes: [],
          ghostClasses: null,
          labeledThingId: 'some-other-labeled-thing',
          classes: ['aaa', 'bbb'],
        };
        const ltifGhost24CacheKey = `${ltAfter.task.id}.${ltifGhost24.frameIndex}.${ltAfter.id}`;

        const ltifGhost39 = {
          id: 'ltif39-id',
          frameIndex: 39,
          ghost: true,
          shapes: [],
          ghostClasses: null,
          labeledThingId: 'some-labeled-thing',
          classes: ['aaa', 'bbb'],
        };
        const ltifGhost39CacheKey = `${ltAfter.task.id}.${ltifGhost39.frameIndex}.${ltAfter.id}`;


        ltCache.store(ltCacheKey, ltBefore);
        ltifGhostCache.store(ltifGhost24CacheKey, ltifGhost24);
        ltifGhostCache.store(ltifGhost39CacheKey, ltifGhost39);
        gateway.saveLabeledThing(ltAfter);

        $rootScope.$digest();

        expect(ltifGhostCache.get(ltifGhost24CacheKey)).toBeUndefined();
        expect(ltifGhostCache.get(ltifGhost39CacheKey)).toBeUndefined();
      });

      it('should invalidate ltif ghost cache for labeled thing outside of framerange', () => {
        const task = {id: 'task-id', frameNumberMapping: new Array(100).fill(null).map((ignore, index) => index + 1)};
        frameIndexService.setTask(task);
        const ltCacheKey = 'task-id.some-labeled-thing';
        const ltBefore = {
          id: 'some-labeled-thing',
          taskId: 'task-id',
          frameRange: {startFrameIndex: 23, endFrameIndex: 42},
          classes: ['foo', 'bar'],
          lineColor: 42,
        };
        const ltAfter = new LabeledThing({
          id: 'some-labeled-thing',
          task: task,
          frameRange: {startFrameIndex: 27, endFrameIndex: 37},
          classes: ['foo', 'bar'],
          lineColor: 42,
        });
        const ltifGhost12 = {
          id: 'ltif12-id',
          frameIndex: 12,
          ghost: true,
          shapes: [],
          ghostClasses: null,
          labeledThingId: 'some-labeled-thing',
          classes: ['aaa', 'bbb'],
        };
        const ltifGhost12CacheKey = `${ltAfter.task.id}.${ltifGhost12.frameIndex}.${ltAfter.id}`;

        const ltifGhost86 = {
          id: 'ltif86-id',
          frameIndex: 86,
          ghost: true,
          shapes: [],
          ghostClasses: null,
          labeledThingId: 'some-labeled-thing',
          classes: ['aaa', 'bbb'],
        };
        const ltifGhost86CacheKey = `${ltAfter.task.id}.${ltifGhost86.frameIndex}.${ltAfter.id}`;

        ltCache.store(ltCacheKey, ltBefore);
        ltifGhostCache.store(ltifGhost12CacheKey, ltifGhost12);
        ltifGhostCache.store(ltifGhost86CacheKey, ltifGhost86);
        gateway.saveLabeledThing(ltAfter);

        $rootScope.$digest();

        expect(ltifGhostCache.get(ltifGhost12CacheKey)).toBeUndefined();
        expect(ltifGhostCache.get(ltifGhost86CacheKey)).toBeUndefined();
      });

      it('should not invalidate ltif ghost cache for other labeled things within framerange', () => {
        const task = {id: 'task-id', frameNumberMapping: new Array(100).fill(null).map((ignore, index) => index + 1)};
        frameIndexService.setTask(task);
        const ltCacheKey = 'task-id.some-labeled-thing';
        const ltBefore = {
          id: 'some-labeled-thing',
          taskId: 'task-id',
          frameRange: {startFrameIndex: 23, endFrameIndex: 42},
          classes: ['foo', 'bar'],
          lineColor: 42,
        };
        const ltAfter = new LabeledThing({
          id: 'some-labeled-thing',
          task: task,
          frameRange: {startFrameIndex: 27, endFrameIndex: 37},
          classes: ['foo', 'bar'],
          lineColor: 42,
        });

        const ltifGhost24 = {
          id: 'ltif24-id',
          frameIndex: 24,
          ghost: true,
          shapes: [],
          ghostClasses: null,
          labeledThingId: 'some-other-labeled-thing',
          classes: ['aaa', 'bbb'],
        };
        const ltifGhost24CacheKey = `${ltAfter.task.id}.${ltifGhost24.frameIndex}.other-lt-id`;

        const ltifGhost39 = {
          id: 'ltif39-id',
          frameIndex: 39,
          ghost: true,
          shapes: [],
          ghostClasses: null,
          labeledThingId: 'some-labeled-thing',
          classes: ['aaa', 'bbb'],
        };
        const ltifGhost39CacheKey = `${ltAfter.task.id}.${ltifGhost39.frameIndex}.other-lt-id`;


        ltCache.store(ltCacheKey, ltBefore);
        ltifGhostCache.store(ltifGhost24CacheKey, ltifGhost24);
        ltifGhostCache.store(ltifGhost39CacheKey, ltifGhost39);
        gateway.saveLabeledThing(ltAfter);

        $rootScope.$digest();

        expect(ltifGhostCache.get(ltifGhost24CacheKey)).not.toBeUndefined();
        expect(ltifGhostCache.get(ltifGhost39CacheKey)).not.toBeUndefined();
      });
    });
  });

  describe('deleteLabeledThing', () => {
    beforeEach(() => {
      spyOn(proto, [
        'deleteLabeledThing',
      ]).and.callFake(() => $q.resolve());
    });

    it('should by default call through', () => {
      gateway.deleteLabeledThing(labeledThingMock);
      expect(proto.deleteLabeledThing).toHaveBeenCalledWith(labeledThingMock);
    });

    it('should call through even if cache exists', done => {
      ltCache.store('some-task.some-labeled-thing', labeledThingMock.toJSON());
      gateway.deleteLabeledThing(labeledThingMock).then(() => {
        expect(proto.deleteLabeledThing).toHaveBeenCalledWith(labeledThingMock);
        done();
      });

      $rootScope.$digest();
    });

    describe('invalidation before deletion', () => {
      let ltCacheKeys;
      let ltifGhostCacheKeys;
      let ltifCacheKeys;

      beforeEach(() => {
        proto.deleteLabeledThing
          .and.callFake(() => new $q(
          () => {
          }
        ));

        ltCacheKeys = {
          invalid: 'some-task.some-labeled-thing',
          valid: 'some-task.some-other-labeled-thing',
        };

        ltCache.store(ltCacheKeys.invalid, {old: 'data'});
        ltCache.store(ltCacheKeys.valid, {important: 'data'});

        ltifGhostCacheKeys = {
          invalids: [
            'some-task.23.some-labeled-thing',
            'some-task.42.some-labeled-thing',
          ],
          valids: [
            'some-task.23.some-other-labeled-thing',
            'some-task.123.some-other-labeled-thing',
          ],
        };

        ltifGhostCache.store(ltifGhostCacheKeys.invalids[0], {labeledThingId: 'some-labeled-thing'});
        ltifGhostCache.store(ltifGhostCacheKeys.invalids[1], {labeledThingId: 'some-labeled-thing'});
        ltifGhostCache.store(ltifGhostCacheKeys.valids[0], {labeledThingId: 'some-other-labeled-thing'});
        ltifGhostCache.store(ltifGhostCacheKeys.valids[1], {labeledThingId: 'some-other-labeled-thing'});

        ltifCacheKeys = {
          invalids: [
            'some-task.1.p',
            'some-task.99.q',
          ],
          valids: [
            'some-task.23.r',
            'some-task.123.s',
          ],
        };

        ltifCache.store(ltifCacheKeys.invalids[0], {labeledThingId: 'some-labeled-thing'});
        ltifCache.store(ltifCacheKeys.invalids[1], {labeledThingId: 'some-labeled-thing'});
        ltifCache.store(ltifCacheKeys.valids[0], {labeledThingId: 'some-other-labeled-thing'});
        ltifCache.store(ltifCacheKeys.valids[1], {labeledThingId: 'some-other-labeled-thing'});
      });

      it('should clean ltCache', () => {
        gateway.deleteLabeledThing(labeledThingMock);
        expect(ltCache.get(ltCacheKeys.invalid)).toBeUndefined();
        expect(ltCache.get(ltCacheKeys.valid)).not.toBeUndefined();
      });

      it('should clean ltifGhostCache', () => {
        gateway.deleteLabeledThing(labeledThingMock);
        expect(ltifGhostCache.get(ltifGhostCacheKeys.invalids[0])).toBeUndefined();
        expect(ltifGhostCache.get(ltifGhostCacheKeys.invalids[1])).toBeUndefined();
        expect(ltifGhostCache.get(ltifGhostCacheKeys.valids[0])).not.toBeUndefined();
        expect(ltifGhostCache.get(ltifGhostCacheKeys.valids[1])).not.toBeUndefined();
      });

      it('should clean ltifCache', () => {
        gateway.deleteLabeledThing(labeledThingMock);
        expect(ltifCache.get(ltifCacheKeys.invalids[0])).toBeUndefined();
        expect(ltifCache.get(ltifCacheKeys.invalids[1])).toBeUndefined();
        expect(ltifCache.get(ltifCacheKeys.valids[0])).not.toBeUndefined();
        expect(ltifCache.get(ltifCacheKeys.valids[1])).not.toBeUndefined();
      });
    });
  });
})
;
