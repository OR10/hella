import PouchDbSyncManager from 'Application/Common/Services/PouchDbSyncManager';
import {inject} from 'angular-mocks';
import PouchDb from 'pouchdb';

fdescribe('PouchDbSyncManager', () => {
  const taskId = 'TASK-ID-abcdefg';
  let angularQ;
  let rootScope;
  let taskGateway;
  let syncManager;
  let pouchDbContextServiceMock;
  let taskReplicationInformation;
  let contextReplicate;
  let contextReplicateFromDeferred;
  let contextReplicateFromPromise;
  let contextReplicateFromEvents;
  let contextReplicateToDeferred;
  let contextReplicateToPromise;
  let contextReplicateToEvents;
  let context;
  let secondContextReplicate;
  let secondContextReplicateFromDeferred;
  let secondContextReplicateFromPromise;
  let secondContextReplicateFromEvents;
  let secondContextReplicateToDeferred;
  let secondContextReplicateToPromise;
  let secondContextReplicateToEvents;
  let secondContext;

  beforeEach(inject(($q, $rootScope) => {
    angularQ = $q;
    rootScope = $rootScope;
  }));

  beforeEach(() => {
    const loggerMock = undefined;

    pouchDbContextServiceMock = jasmine.createSpyObj('PouchDbContextService', [
      'queryTaskIdForContext',
    ]);
    pouchDbContextServiceMock.queryTaskIdForContext.and.returnValue(taskId);

    syncManager = new PouchDbSyncManager(loggerMock, angularQ, pouchDbContextServiceMock, taskGateway);

    taskGateway = jasmine.createSpyObj('TaskGateway', ['getTaskReplicationInformationForTaskId']);
    taskReplicationInformation = {
      databaseServer: 'foobar',
      databaseName: 'heinz',
    };
    taskGateway.getTaskReplicationInformationForTaskId.and.returnValue(taskReplicationInformation);
  });

  beforeEach(() => {
    contextReplicate = jasmine.createSpyObj('context.replicate', ['from', 'to']);
    contextReplicateFromDeferred = angularQ.defer();
    contextReplicateFromPromise = contextReplicateFromDeferred.promise;
    contextReplicateFromPromise.cancel = jasmine.createSpy('context.replicate.from.cancel');
    contextReplicateFromPromise.on = jasmine.createSpy('context.replicate.from.on');
    contextReplicateFromEvents = new Map([
      ['change', []],
      ['complete', []],
      ['paused', []],
      ['active', []],
      ['denied', []],
      ['error', []]
    ]);
    contextReplicateFromPromise.on.and.callFake((eventName, callback) => {
      if (contextReplicateFromEvents.has(eventName) === false) {
        throw new Error(`Unknown event ${eventName} registered.`);
      }
      contextReplicateFromEvents.set(eventName, [...contextReplicateFromEvents.get(eventName), callback]);
      return contextReplicateFromPromise;
    });
    contextReplicate.from.and.returnValue(contextReplicateFromPromise);

    contextReplicateToDeferred = angularQ.defer();
    contextReplicateToPromise = contextReplicateToDeferred.promise;
    contextReplicateToPromise.cancel = jasmine.createSpy('context.replicate.to.cancel');
    contextReplicateToPromise.on = jasmine.createSpy('context.replicate.to.on');
    contextReplicateToEvents = new Map([
      ['change', []],
      ['complete', []],
      ['paused', []],
      ['active', []],
      ['denied', []],
      ['error', []]
    ]);
    contextReplicateToPromise.on.and.callFake((eventName, callback) => {
      if (contextReplicateToEvents.has(eventName) === false) {
        throw new Error(`Unknown event ${eventName} registered.`);
      }
      contextReplicateToEvents.set(eventName, [...contextReplicateToEvents.get(eventName), callback]);
      return contextReplicateToPromise;
    });
    contextReplicate.to.and.returnValue(contextReplicateToPromise);

    context = {replicate: contextReplicate};

    secondContextReplicate = jasmine.createSpyObj('context.replicate', ['from', 'to']);
    secondContextReplicateFromDeferred = angularQ.defer();
    secondContextReplicateFromPromise = secondContextReplicateFromDeferred.promise;
    secondContextReplicateFromPromise.cancel = jasmine.createSpy('context.replicate.from.cancel');
    secondContextReplicateFromPromise.on = jasmine.createSpy('context.replicate.from.on');
    secondContextReplicateFromEvents = new Map([
      ['change', []],
      ['complete', []],
      ['paused', []],
      ['active', []],
      ['denied', []],
      ['error', []]
    ]);
    secondContextReplicateFromPromise.on.and.callFake((eventName, callback) => {
      if (secondContextReplicateFromEvents.has(eventName) === false) {
        throw new Error(`Unknown event ${eventName} registered.`);
      }
      secondContextReplicateFromEvents.set(eventName, [...secondContextReplicateFromEvents.get(eventName), callback]);
      return secondContextReplicateFromPromise;
    });
    secondContextReplicate.from.and.returnValue(secondContextReplicateFromPromise);

    secondContextReplicateToDeferred = angularQ.defer();
    secondContextReplicateToPromise = secondContextReplicateToDeferred.promise;
    secondContextReplicateToPromise.cancel = jasmine.createSpy('context.replicate.to.cancel');
    secondContextReplicateToPromise.on = jasmine.createSpy('context.replicate.to.on');
    secondContextReplicateToEvents = new Map([
      ['change', []],
      ['complete', []],
      ['paused', []],
      ['active', []],
      ['denied', []],
      ['error', []]
    ]);
    secondContextReplicateToPromise.on.and.callFake((eventName, callback) => {
      if (secondContextReplicateToEvents.has(eventName) === false) {
        throw new Error(`Unknown event ${eventName} registered.`);
      }
      secondContextReplicateToEvents.set(eventName, [...secondContextReplicateToEvents.get(eventName), callback]);
      return secondContextReplicateToPromise;
    });
    secondContextReplicate.to.and.returnValue(secondContextReplicateToPromise);

    secondContext = {replicate: secondContextReplicate};
  });

  it('should instantiate', () => {
    const instance = new PouchDbSyncManager();
    expect(instance).toEqual(jasmine.any(PouchDbSyncManager));
  });

  describe('pullUpdatesForContext', () => {
    it('should return a promise', () => {
      const context = {};

      const actual = syncManager.pullUpdatesForContext(context);

      // $q does not use native promises but their own. There is now feasible way
      // to get the reference, so let's just test, that there is a then function
      expect(actual.then).toEqual(jasmine.any(Function));
    });

    it('should start replication with the correct options', () => {
      const replication = syncManager.pullUpdatesForContext(context);
      const replicationOptions = {
        live: false,
        retry: true,
      };

      rootScope.$apply();

      expect(contextReplicate.from).toHaveBeenCalledWith(jasmine.any(PouchDb), replicationOptions);
    });

    it('should start replication with correct remote url', () => {
      const taskReplicationUrl = `${taskReplicationInformation.databaseServer}/${taskReplicationInformation.databaseName}`;
      let pouchDb;

      const replication = syncManager.pullUpdatesForContext(context);

      rootScope.$apply();

      pouchDb = contextReplicate.from.calls.argsFor(0)[0];
      expect(pouchDb.name).toEqual(taskReplicationUrl);
    });

    it('should return same replication for multiple calls while it is still running', () => {
      const firstReplication = syncManager.pullUpdatesForContext(context);
      rootScope.$apply();
      const secondReplication = syncManager.pullUpdatesForContext(context);

      expect(firstReplication).toBe(secondReplication);
    });

    it('should start second replication once first succeeded ', () => {
      const firstReplication = syncManager.pullUpdatesForContext(context);
      contextReplicateFromDeferred.resolve();
      rootScope.$apply();
      const secondReplication = syncManager.pullUpdatesForContext(context);

      expect(firstReplication).not.toBe(secondReplication);
    });

    it('should start second replication once first failed', () => {
      const firstReplication = syncManager.pullUpdatesForContext(context);

      contextReplicateFromDeferred.reject();
      rootScope.$apply();

      const secondReplication = syncManager.pullUpdatesForContext(context);

      expect(firstReplication).not.toBe(secondReplication);
    });
  });

  describe('startDuplexLiveReplication', () => {
    it('should return a promise', () => {
      const context = {};

      const actual = syncManager.startDuplexLiveReplication(context);

      // $q does not use native promises but their own. There is now feasible way
      // to get the reference, so let's just test, that there is a then function
      expect(actual.then).toEqual(jasmine.any(Function));
    });

    it('should start pull replication with the correct options', () => {
      const replication = syncManager.startDuplexLiveReplication(context);
      const replicationOptions = {
        live: true,
        retry: true,
      };

      rootScope.$apply();
      expect(contextReplicate.from).toHaveBeenCalledWith(jasmine.any(PouchDb), replicationOptions);
    });

    it('should start push replication with the correct options', () => {
      const replication = syncManager.startDuplexLiveReplication(context);
      const replicationOptions = {
        live: true,
        retry: true,
      };

      rootScope.$apply();

      expect(contextReplicate.to).toHaveBeenCalledWith(jasmine.any(PouchDb), replicationOptions);
    });

    it('should start pull replication with correct remote url', () => {
      const taskReplicationUrl = `${taskReplicationInformation.databaseServer}/${taskReplicationInformation.databaseName}`;
      let pouchDb;

      const replication = syncManager.startDuplexLiveReplication(context);

      rootScope.$apply();

      pouchDb = contextReplicate.from.calls.argsFor(0)[0];
      expect(pouchDb.name).toEqual(taskReplicationUrl);
    });

    it('should start push replication with correct remote url', () => {
      const taskReplicationUrl = `${taskReplicationInformation.databaseServer}/${taskReplicationInformation.databaseName}`;
      let pouchDb;

      const replication = syncManager.startDuplexLiveReplication(context);

      rootScope.$apply();

      pouchDb = contextReplicate.to.calls.argsFor(0)[0];
      expect(pouchDb.name).toEqual(taskReplicationUrl);
    });

    it('should return same replication promise for multiple calls while it is still running', () => {
      const firstReplication = syncManager.startDuplexLiveReplication(context);
      rootScope.$apply();
      const secondReplication = syncManager.startDuplexLiveReplication(context);

      expect(firstReplication).toBe(secondReplication);
    });

    it('should return the same replication promise as long as the pull part is still active', () => {
      const firstReplication = syncManager.startDuplexLiveReplication(context);
      contextReplicateToDeferred.resolve();
      rootScope.$apply();
      const secondReplication = syncManager.startDuplexLiveReplication(context);

      expect(firstReplication).toBe(secondReplication);
    });

    it('should return the same replication promise as long as the push part is still active', () => {
      const firstReplication = syncManager.startDuplexLiveReplication(context);
      contextReplicateFromDeferred.resolve();
      rootScope.$apply();
      const secondReplication = syncManager.startDuplexLiveReplication(context);

      expect(firstReplication).toBe(secondReplication);
    });

    it('should start second replication once first was ended successfully', () => {
      const firstReplication = syncManager.startDuplexLiveReplication(context);
      contextReplicateFromDeferred.resolve();
      contextReplicateToDeferred.resolve();
      rootScope.$apply();
      const secondReplication = syncManager.startDuplexLiveReplication(context);

      expect(firstReplication).not.toBe(secondReplication);
    });

    it('should start second replication once the pull part of the first one failed', () => {
      const firstReplication = syncManager.startDuplexLiveReplication(context);
      contextReplicateFromDeferred.reject();
      rootScope.$apply();
      const secondReplication = syncManager.startDuplexLiveReplication(context);

      expect(firstReplication).not.toBe(secondReplication);
    });

    it('should start second replication once the push part of the first one failed', () => {
      const firstReplication = syncManager.startDuplexLiveReplication(context);
      contextReplicateToDeferred.reject();
      rootScope.$apply();
      const secondReplication = syncManager.startDuplexLiveReplication(context);

      expect(firstReplication).not.toBe(secondReplication);
    });

    it('should start second replication once both (push/pull) parts of the first one failed', () => {
      const firstReplication = syncManager.startDuplexLiveReplication(context);
      contextReplicateFromDeferred.reject();
      contextReplicateToDeferred.reject();
      rootScope.$apply();
      const secondReplication = syncManager.startDuplexLiveReplication(context);

      expect(firstReplication).not.toBe(secondReplication);
    });
  });

  describe('stopReplicationsForContext', () => {
    it('should return a promise', () => {
      const actual = syncManager.stopReplicationsForContext(context);

      // $q does not use native promises but their own. There is now feasible way
      // to get the reference, so let's just test, that there is a then function
      expect(actual.then).toEqual(jasmine.any(Function));
    });

    it('should resolve if no replication is running for given context', () => {
      const promise = syncManager.stopReplicationsForContext(context);

      const stopReplicationsForContextResolved = jasmine.createSpy('stopReplicationsForContextResolved');
      promise.then(stopReplicationsForContextResolved);

      rootScope.$apply();
      expect(stopReplicationsForContextResolved).toHaveBeenCalled();
    });

    it('should cancel uni-directional pull replication', () => {
      syncManager.pullUpdatesForContext(context);
      rootScope.$apply();
      syncManager.stopReplicationsForContext(context);

      rootScope.$apply();

      expect(contextReplicateFromPromise.cancel).toHaveBeenCalled();
    });

    it('should only cancel uni-directional pull replication from given context', () => {
      syncManager.pullUpdatesForContext(context);
      syncManager.pullUpdatesForContext(secondContext);
      rootScope.$apply();
      syncManager.stopReplicationsForContext(context);

      rootScope.$apply();

      expect(contextReplicateFromPromise.cancel).toHaveBeenCalled();
      expect(secondContextReplicateFromPromise.cancel).not.toHaveBeenCalled();
    });

    it('should cancel bi-directional replication', () => {
      syncManager.startDuplexLiveReplication(context);
      rootScope.$apply();
      syncManager.stopReplicationsForContext(context);

      rootScope.$apply();

      expect(contextReplicateFromPromise.cancel).toHaveBeenCalled();
      expect(contextReplicateToPromise.cancel).toHaveBeenCalled();
    });

    it('should only cancel bi-directional replications from given context', () => {
      syncManager.startDuplexLiveReplication(context);
      syncManager.startDuplexLiveReplication(secondContext);
      rootScope.$apply();
      syncManager.stopReplicationsForContext(context);

      rootScope.$apply();

      expect(contextReplicateFromPromise.cancel).toHaveBeenCalled();
      expect(contextReplicateToPromise.cancel).toHaveBeenCalled();
      expect(secondContextReplicateFromPromise.cancel).not.toHaveBeenCalled();
      expect(secondContextReplicateToPromise.cancel).not.toHaveBeenCalled();
    });
  });

  describe('Events', () => {
    using([
      ['offline'],
      ['alive'],
      ['transfer'],
    ], eventName => {
      it('should allow registration of events via "on" function', () => {
        const eventSpy = jasmine.createSpy('onEvent');
        syncManager.on(eventName, eventSpy);
      });
    });

    describe('pullUpdatesForContext', () => {
      it('should fire "alive" event on start of replication', () => {
        const aliveEventSpy = jasmine.createSpy('event:alive');

        syncManager.on('alive', aliveEventSpy);
        syncManager.pullUpdatesForContext(context);

        rootScope.$apply();

        expect(aliveEventSpy).toHaveBeenCalled();
      });
    });

    describe('startDuplexLiveReplication', () => {
      it('should fire "alive" event on start of startDuplexLiveReplication', () => {
        const aliveEventSpy = jasmine.createSpy('event:alive');

        syncManager.on('alive', aliveEventSpy);
        syncManager.startDuplexLiveReplication(context);

        rootScope.$apply();

        expect(aliveEventSpy).toHaveBeenCalled();
      });

      it('should fire "alive" event twice on start of replication (once for each started replication)', () => {
        const aliveEventSpy = jasmine.createSpy('event:alive');

        syncManager.on('alive', aliveEventSpy);
        syncManager.startDuplexLiveReplication(context);

        rootScope.$apply();

        expect(aliveEventSpy.calls.count()).toEqual(2);
      });
    });
  });
});
