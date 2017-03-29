import {inject} from 'angular-mocks';
import InterpolationService from 'Application/LabelingData/Services/InterpolationService';

describe('Interpolation with PouchDB Spec', () => {
  const interpolationTypeId = 'linear';

  const featureFlag = {pouchdb: false};
  let interpolationService;
  let firstInterpolation;
  let interpolations;

  let cacheMock;
  let pouchDbContextServiceMock;
  let pouchDBSyncManagerMock;
  let cacheHeaterMock;

  function createInterpolationService() {
    interpolationService = new InterpolationService(null, null, cacheMock, cacheHeaterMock, featureFlag, pouchDBSyncManagerMock, pouchDbContextServiceMock, interpolations);
  }

  beforeEach(() => {
    cacheMock = jasmine.createSpyObj('cache', ['container']);

    firstInterpolation = jasmine.createSpyObj('firstInterpolation', ['execute']);
    firstInterpolation.execute.and.returnValue({then: () => {}});
    firstInterpolation.id = interpolationTypeId;

    interpolations = firstInterpolation;
  });

  it('It can be instantiate', () => {
    createInterpolationService();
    expect(interpolationService).toEqual(jasmine.any(InterpolationService));
  });

  describe('interpolate()', () => {
    const labeledThing = {id: 'thing-id', task: {id: 'some-task-id'}};
    const frameRange = {startFrameIndex: 17, endFrameIndex: 18};
    const task = {id: 'task-id'};

    let rootScope;
    let angularQ;
    let cacheContainerMock;

    beforeEach(inject(($rootScope, $q) => {
      rootScope = $rootScope;
      angularQ = $q;
    }));

    beforeEach(() => {
      cacheContainerMock = jasmine.createSpyObj('container', ['invalidate', 'get']);
      cacheMock.container.and.returnValue(cacheContainerMock);
    });

    it('Throws if interpolation id is unknown', () => {
      const id = 'Unknown';

      createInterpolationService();

      function throwWrapper() {
        interpolationService.interpolate(id);
      }
      expect(throwWrapper).toThrowError(`Interpolation with id '${id}' is not currently registered on the InterpolationService.`);
    });

    it('invalidates the caches', () => {
      createInterpolationService();

      interpolationService.interpolate(interpolationTypeId, null, labeledThing, frameRange);
      expect(cacheContainerMock.invalidate).toHaveBeenCalledWith(`${labeledThing.task.id}.${frameRange.startFrameIndex}.${labeledThing.id}`);
      expect(cacheContainerMock.invalidate).toHaveBeenCalledWith(`${labeledThing.task.id}.${frameRange.startFrameIndex}.complete`);
      expect(cacheContainerMock.invalidate).toHaveBeenCalledWith(`${labeledThing.task.id}.${frameRange.endFrameIndex}.${labeledThing.id}`);
      expect(cacheContainerMock.invalidate).toHaveBeenCalledWith(`${labeledThing.task.id}.${frameRange.endFrameIndex}.complete`);
    });

    it('does not invalidates the caches for non-ghosts', () => {
      const cacheData = [{id: '1'}, {id: '2'}];
      cacheContainerMock.get.and.returnValue(cacheData);

      createInterpolationService();

      interpolationService.interpolate(interpolationTypeId, null, labeledThing, frameRange);
      expect(cacheContainerMock.invalidate).not.toHaveBeenCalledWith(`${labeledThing.task.id}.${frameRange.startFrameIndex}.1`);
      expect(cacheContainerMock.invalidate).not.toHaveBeenCalledWith(`${labeledThing.task.id}.${frameRange.startFrameIndex}.2`);
    });

    it('invalidates the caches for non-ghosts', () => {
      const cacheData = [{id: '1', labeledThingId: labeledThing.id}, {id: '2', labeledThingId: labeledThing.id}];
      cacheContainerMock.get.and.returnValue(cacheData);

      createInterpolationService();

      interpolationService.interpolate(interpolationTypeId, null, labeledThing, frameRange);
      expect(cacheContainerMock.invalidate).toHaveBeenCalledWith(`${labeledThing.task.id}.${frameRange.startFrameIndex}.1`);
      expect(cacheContainerMock.invalidate).toHaveBeenCalledWith(`${labeledThing.task.id}.${frameRange.startFrameIndex}.2`);
    });

    it('calls the cache heater correctly without pouchDB', () => {
      firstInterpolation.endFrameIndex = 19;
      firstInterpolation.execute.and.returnValue(angularQ.resolve());
      cacheHeaterMock = jasmine.createSpyObj('cacheHeaterMock', ['heatFrames']);

      createInterpolationService();
      interpolationService.interpolate(interpolationTypeId, task, labeledThing, frameRange);
      rootScope.$apply();

      expect(cacheHeaterMock.heatFrames).toHaveBeenCalledWith(task, frameRange.startFrameIndex, firstInterpolation.endFrameIndex);
      expect(cacheHeaterMock.heatFrames).toHaveBeenCalledTimes(1);
    });

    describe('pouchDB interpolation', () => {
      let pouchDbMock;

      beforeEach(() => {
        featureFlag.pouchdb = true;
        pouchDbMock = {};

        pouchDbContextServiceMock = jasmine.createSpyObj('pouchDbContextService', ['provideContextForTaskId']);
        pouchDbContextServiceMock.provideContextForTaskId.and.returnValue(pouchDbMock);

        pouchDBSyncManagerMock = jasmine.createSpyObj('pouchDBSyncManagerMock', [
          'stopReplicationsForContext',
          'pushUpdatesForContext',
          'pullUpdatesForContext',
          'startDuplexLiveReplication',
        ]);
        pouchDBSyncManagerMock.stopReplicationsForContext.and.returnValue(angularQ.resolve());
        pouchDBSyncManagerMock.pushUpdatesForContext.and.returnValue(angularQ.resolve());
        pouchDBSyncManagerMock.pullUpdatesForContext.and.returnValue(angularQ.resolve());
        pouchDBSyncManagerMock.startDuplexLiveReplication.and.returnValue(angularQ.resolve());

        cacheHeaterMock = jasmine.createSpyObj('cacheHeaterMock', ['heatFrames']);

        firstInterpolation.execute.and.returnValue(angularQ.resolve());
      });

      it('calls the context service with correct paramter', () => {
        createInterpolationService();
        interpolationService.interpolate(interpolationTypeId, task, labeledThing, frameRange);

        expect(pouchDbContextServiceMock.provideContextForTaskId).toHaveBeenCalledWith(task.id);
      });

      it('calls the SyncManager correctly', () => {
        createInterpolationService();
        interpolationService.interpolate(interpolationTypeId, task, labeledThing, frameRange);
        rootScope.$apply();

        expect(pouchDBSyncManagerMock.stopReplicationsForContext).toHaveBeenCalledWith(pouchDbMock);
        expect(pouchDBSyncManagerMock.pushUpdatesForContext).toHaveBeenCalledWith(pouchDbMock);
        expect(pouchDBSyncManagerMock.pullUpdatesForContext).toHaveBeenCalledWith(pouchDbMock);
        expect(pouchDBSyncManagerMock.startDuplexLiveReplication).toHaveBeenCalledWith(pouchDbMock);
      });

      it('calls the cache heater correctly', () => {
        firstInterpolation.endFrameIndex = 19;

        createInterpolationService();
        interpolationService.interpolate(interpolationTypeId, task, labeledThing, frameRange);
        rootScope.$apply();

        expect(cacheHeaterMock.heatFrames).toHaveBeenCalledWith(task, frameRange.startFrameIndex, firstInterpolation.endFrameIndex);
        expect(cacheHeaterMock.heatFrames).toHaveBeenCalledTimes(1);
      });
    });
  });
});
