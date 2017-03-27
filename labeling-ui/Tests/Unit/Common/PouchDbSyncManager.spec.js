import PouchDbSyncManager from 'Application/Common/Services/PouchDbSyncManager';
import {inject} from 'angular-mocks';
import PouchDb from 'pouchdb';

describe('PouchDbSyncManager', () => {
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
    const loggerMock = jasmine.createSpyObj('loggerService', ['log', 'groupStart', 'groupEnd', 'warn']);

    pouchDbContextServiceMock = jasmine.createSpyObj('PouchDbContextService', [
      'queryTaskIdForContext',
    ]);
    pouchDbContextServiceMock.queryTaskIdForContext.and.returnValue(taskId);

    taskGateway = jasmine.createSpyObj('TaskGateway', ['getTaskReplicationInformationForTaskId']);
    taskReplicationInformation = {
      databaseServer: 'foobar',
      databaseName: 'heinz',
    };
    taskGateway.getTaskReplicationInformationForTaskId.and.returnValue(taskReplicationInformation);

    syncManager = new PouchDbSyncManager(loggerMock, angularQ, pouchDbContextServiceMock, taskGateway);
  });

  beforeEach(() => {
    contextReplicate = jasmine.createSpyObj('context.replicate', ['from', 'to']);
    contextReplicateFromDeferred = angularQ.defer();
    contextReplicateFromPromise = contextReplicateFromDeferred.promise;
    contextReplicateFromPromise.cancel = jasmine.createSpy('context.replicate.from.cancel');
    contextReplicateFromPromise.cancel.and.callFake(() => {
      contextReplicateFromDeferred.resolve();
    });
    contextReplicateFromPromise.on = jasmine.createSpy('context.replicate.from.on');
    contextReplicateFromEvents = new Map([
      ['change', []],
      ['complete', []],
      ['paused', []],
      ['active', []],
      ['denied', []],
      ['error', []],
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
    contextReplicateToPromise.cancel.and.callFake(() => {
      contextReplicateToDeferred.resolve();
    });
    contextReplicateToPromise.on = jasmine.createSpy('context.replicate.to.on');
    contextReplicateToEvents = new Map([
      ['change', []],
      ['complete', []],
      ['paused', []],
      ['active', []],
      ['denied', []],
      ['error', []],
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
    secondContextReplicateFromPromise.cancel.and.callFake(() => {
      secondContextReplicateFromDeferred.resolve();
    });
    secondContextReplicateFromPromise.on = jasmine.createSpy('context.replicate.from.on');
    secondContextReplicateFromEvents = new Map([
      ['change', []],
      ['complete', []],
      ['paused', []],
      ['active', []],
      ['denied', []],
      ['error', []],
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
    secondContextReplicateToPromise.cancel.and.callFake(() => {
      secondContextReplicateToDeferred.resolve();
    });
    secondContextReplicateToPromise.on = jasmine.createSpy('context.replicate.to.on');
    secondContextReplicateToEvents = new Map([
      ['change', []],
      ['complete', []],
      ['paused', []],
      ['active', []],
      ['denied', []],
      ['error', []],
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

  describe('pullUpdatesForContext()', () => {
    it('should return a promise', () => {
      const emptyContext = {};

      const actual = syncManager.pullUpdatesForContext(emptyContext);

      // $q does not use native promises but their own. There is now feasible way
      // to get the reference, so let's just test, that there is a then function
      expect(actual.then).toEqual(jasmine.any(Function));
    });

    it('should start replication with the correct options', () => {
      syncManager.pullUpdatesForContext(context);
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

      syncManager.pullUpdatesForContext(context);

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

  describe('pushUpdatesForContext()', () => {
    it('should return a promise', () => {
      const emptyContext = {};

      const actual = syncManager.pushUpdatesForContext(emptyContext);

      // $q does not use native promises but their own. There is now feasible way
      // to get the reference, so let's just test, that there is a then function
      expect(actual.then).toEqual(jasmine.any(Function));
    });

    it('should start replication with the correct options', () => {
      syncManager.pushUpdatesForContext(context);
      const replicationOptions = {
        live: false,
        retry: true,
      };

      rootScope.$apply();

      expect(contextReplicate.to).toHaveBeenCalledWith(jasmine.any(PouchDb), replicationOptions);
    });

    it('should start replication with correct remote url', () => {
      const taskReplicationUrl = `${taskReplicationInformation.databaseServer}/${taskReplicationInformation.databaseName}`;
      let pouchDb;

      syncManager.pushUpdatesForContext(context);

      rootScope.$apply();

      pouchDb = contextReplicate.to.calls.argsFor(0)[0];
      expect(pouchDb.name).toEqual(taskReplicationUrl);
    });

    it('should return same replication for multiple calls while it is still running', () => {
      const firstReplication = syncManager.pushUpdatesForContext(context);
      rootScope.$apply();
      const secondReplication = syncManager.pushUpdatesForContext(context);

      expect(firstReplication).toBe(secondReplication);
    });

    it('should start second replication once first succeeded ', () => {
      const firstReplication = syncManager.pushUpdatesForContext(context);
      contextReplicateToDeferred.resolve();
      rootScope.$apply();
      const secondReplication = syncManager.pushUpdatesForContext(context);

      expect(firstReplication).not.toBe(secondReplication);
    });

    it('should start second replication once first failed', () => {
      const firstReplication = syncManager.pushUpdatesForContext(context);

      contextReplicateToDeferred.reject();
      rootScope.$apply();

      const secondReplication = syncManager.pushUpdatesForContext(context);

      expect(firstReplication).not.toBe(secondReplication);
    });
  });

  describe('startDuplexLiveReplication', () => {
    it('should return a promise', () => {
      const emptyContext = {};

      const actual = syncManager.startDuplexLiveReplication(emptyContext);

      // $q does not use native promises but their own. There is now feasible way
      // to get the reference, so let's just test, that there is a then function
      expect(actual.then).toEqual(jasmine.any(Function));
    });

    it('should start pull replication with the correct options', () => {
      syncManager.startDuplexLiveReplication(context);
      const replicationOptions = {
        live: true,
        retry: true,
      };

      rootScope.$apply();
      expect(contextReplicate.from).toHaveBeenCalledWith(jasmine.any(PouchDb), replicationOptions);
    });

    it('should start push replication with the correct options', () => {
      syncManager.startDuplexLiveReplication(context);
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

      syncManager.startDuplexLiveReplication(context);

      rootScope.$apply();

      pouchDb = contextReplicate.from.calls.argsFor(0)[0];
      expect(pouchDb.name).toEqual(taskReplicationUrl);
    });

    it('should start push replication with correct remote url', () => {
      const taskReplicationUrl = `${taskReplicationInformation.databaseServer}/${taskReplicationInformation.databaseName}`;
      let pouchDb;

      syncManager.startDuplexLiveReplication(context);

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

    it('should cancel uni-directional push replication', () => {
      syncManager.pushUpdatesForContext(context);
      rootScope.$apply();
      syncManager.stopReplicationsForContext(context);

      rootScope.$apply();

      expect(contextReplicateToPromise.cancel).toHaveBeenCalled();
    });

    it('should only cancel uni-directional push replication from given context', () => {
      syncManager.pushUpdatesForContext(context);
      syncManager.pushUpdatesForContext(secondContext);
      rootScope.$apply();
      syncManager.stopReplicationsForContext(context);

      rootScope.$apply();

      expect(contextReplicateToPromise.cancel).toHaveBeenCalled();
      expect(secondContextReplicateToPromise.cancel).not.toHaveBeenCalled();
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

    it('returns a promise that does not resolve if only no replication is cancelled', done => {
      contextReplicateFromPromise.cancel.and.stub();
      contextReplicateToPromise.cancel.and.stub();

      syncManager.pullUpdatesForContext(context);
      syncManager.pushUpdatesForContext(context);
      syncManager.startDuplexLiveReplication(context);
      rootScope.$apply();

      const stopPromise = syncManager.stopReplicationsForContext(context);
      stopPromise.then(() => {
        expect('Promise should not have been resolved').toEqual('');
      });
      rootScope.$apply();
      done();
    });

    it('returns a promise that does not resolve if only push replications are cancelled', done => {
      contextReplicateToPromise.cancel.and.stub();

      syncManager.pullUpdatesForContext(context);
      syncManager.pushUpdatesForContext(context);
      syncManager.startDuplexLiveReplication(context);
      rootScope.$apply();

      const stopPromise = syncManager.stopReplicationsForContext(context);
      stopPromise.then(() => {
        expect('Promise should not have been resolved').toEqual('');
      });
      rootScope.$apply();
      done();
    });

    it('returns a promise that does not resolve if only pull replications are cancelled', done => {
      contextReplicateFromPromise.cancel.and.stub();

      syncManager.pullUpdatesForContext(context);
      syncManager.pushUpdatesForContext(context);
      syncManager.startDuplexLiveReplication(context);
      rootScope.$apply();

      const stopPromise = syncManager.stopReplicationsForContext(context);
      stopPromise.then(() => {
        expect('Promise should not have been resolved').toEqual('');
      });
      rootScope.$apply();
      done();
    });

    it('returns a promise that resolves if only all replications are cancelled', done => {
      syncManager.pullUpdatesForContext(context);
      syncManager.pushUpdatesForContext(context);
      syncManager.startDuplexLiveReplication(context);
      rootScope.$apply();

      const stopPromise = syncManager.stopReplicationsForContext(context);
      stopPromise.then(() => {
        // I don't really like this tbh
        expect(true).toBe(true);
        done();
      });
      rootScope.$apply();
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
        const throwWrapper = () => {
          syncManager.on(eventName, eventSpy);
        };
        expect(throwWrapper).not.toThrow();
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

      it('should fire "transfer" event once replication started', () => {
        const transferEventSpy = jasmine.createSpy('event:transfer');

        syncManager.on('transfer', transferEventSpy);
        syncManager.pullUpdatesForContext(context);

        rootScope.$apply();
        contextReplicateFromEvents.get('active').forEach(callback => callback());

        expect(transferEventSpy).toHaveBeenCalled();
      });
    });

    describe('pushUpdatesForContext', () => {
      it('should fire "alive" event on start of replication', () => {
        const aliveEventSpy = jasmine.createSpy('event:alive');

        syncManager.on('alive', aliveEventSpy);
        syncManager.pushUpdatesForContext(context);

        rootScope.$apply();

        expect(aliveEventSpy).toHaveBeenCalled();
      });

      it('should fire "transfer" event once replication started', () => {
        const transferEventSpy = jasmine.createSpy('event:transfer');

        syncManager.on('transfer', transferEventSpy);
        syncManager.pushUpdatesForContext(context);

        rootScope.$apply();
        contextReplicateToEvents.get('active').forEach(callback => callback());

        expect(transferEventSpy).toHaveBeenCalled();
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

      it('should fire "alive" event once "from" replication wents into "paused" state', () => {
        const aliveEventSpy = jasmine.createSpy('event:alive');

        syncManager.on('alive', aliveEventSpy);
        syncManager.startDuplexLiveReplication(context);
        rootScope.$apply();
        contextReplicateFromEvents.get('active').forEach(callback => callback());
        contextReplicateFromEvents.get('paused').forEach(callback => callback());
        rootScope.$apply();

        expect(aliveEventSpy.calls.count()).toEqual(3);
      });

      it('should fire "alive" event once "to" replication wents into "paused" state', () => {
        const aliveEventSpy = jasmine.createSpy('event:alive');

        syncManager.on('alive', aliveEventSpy);
        syncManager.startDuplexLiveReplication(context);
        rootScope.$apply();
        contextReplicateToEvents.get('active').forEach(callback => callback());
        contextReplicateToEvents.get('paused').forEach(callback => callback());
        rootScope.$apply();

        expect(aliveEventSpy.calls.count()).toEqual(3);
      });

      it('should fire "offline" event once "from" replication wents into "paused" state with an error', () => {
        const offlineEventSpy = jasmine.createSpy('event:offline');
        const error = {};

        syncManager.on('offline', offlineEventSpy);
        syncManager.startDuplexLiveReplication(context);
        rootScope.$apply();
        contextReplicateFromEvents.get('paused').forEach(callback => callback(error));
        rootScope.$apply();

        expect(offlineEventSpy.calls.count()).toEqual(1);
      });

      it('should fire "offline" event once "to" replication wents into "paused" state with an error', () => {
        const offlineEventSpy = jasmine.createSpy('event:offline');
        const error = {};

        syncManager.on('offline', offlineEventSpy);
        syncManager.startDuplexLiveReplication(context);
        rootScope.$apply();
        contextReplicateToEvents.get('paused').forEach(callback => callback(error));
        rootScope.$apply();

        expect(offlineEventSpy.calls.count()).toEqual(1);
      });

      it('should fire "transfer" event once "from" replication wents into "active"', () => {
        const transferEventSpy = jasmine.createSpy('event:transfer');

        syncManager.on('transfer', transferEventSpy);
        syncManager.startDuplexLiveReplication(context);
        rootScope.$apply();
        contextReplicateFromEvents.get('active').forEach(callback => callback());
        rootScope.$apply();

        expect(transferEventSpy.calls.count()).toEqual(1);
      });

      it('should fire "transfer" event once "to" replication wents into "active"', () => {
        const transferEventSpy = jasmine.createSpy('event:transfer');

        syncManager.on('transfer', transferEventSpy);
        syncManager.startDuplexLiveReplication(context);
        rootScope.$apply();
        contextReplicateToEvents.get('active').forEach(callback => callback());
        rootScope.$apply();

        expect(transferEventSpy.calls.count()).toEqual(1);
      });
    });
  });

  describe('#doesReplicationExistForContext()', () => {
    it('is false by default', () => {
      const hasReplication = syncManager.doesReplicationExistForContext(context);
      expect(hasReplication).toBe(false);
    });

    describe('pull replication', () => {
      beforeEach(() => {
        syncManager.pullUpdatesForContext(context);
      });

      it('is true if a pull replication for the context has been started', () => {
        rootScope.$apply();

        const hasReplication = syncManager.doesReplicationExistForContext(context);
        expect(hasReplication).toBe(true);
      });

      it('is false if a pull replication is finished', () => {
        contextReplicateFromDeferred.resolve();
        rootScope.$apply();

        const hasReplication = syncManager.doesReplicationExistForContext(context);
        expect(hasReplication).toBe(false);
      });

      it('is false if a pull replication fails', () => {
        contextReplicateFromDeferred.reject();
        rootScope.$apply();

        const hasReplication = syncManager.doesReplicationExistForContext(context);
        expect(hasReplication).toBe(false);
      });

      it('is false if pull replication is stopped', () => {
        rootScope.$apply();
        syncManager.stopReplicationsForContext(context);
        rootScope.$apply();

        const hasReplication = syncManager.doesReplicationExistForContext(context);
        expect(hasReplication).toBe(false);
      });
    });

    describe('push replication', () => {
      beforeEach(() => {
        syncManager.pushUpdatesForContext(context);
      });

      it('is true if a push replication for the context has been started', () => {
        rootScope.$apply();

        const hasReplication = syncManager.doesReplicationExistForContext(context);
        expect(hasReplication).toBe(true);
      });

      it('is false if a push replication is finished', () => {
        contextReplicateToDeferred.resolve();
        rootScope.$apply();

        const hasReplication = syncManager.doesReplicationExistForContext(context);
        expect(hasReplication).toBe(false);
      });

      it('is false if a push replication fails', () => {
        contextReplicateToDeferred.reject();
        rootScope.$apply();

        const hasReplication = syncManager.doesReplicationExistForContext(context);
        expect(hasReplication).toBe(false);
      });

      it('is false if push replication is stopped', () => {
        rootScope.$apply();
        syncManager.stopReplicationsForContext(context);
        rootScope.$apply();

        const hasReplication = syncManager.doesReplicationExistForContext(context);
        expect(hasReplication).toBe(false);
      });
    });

    describe('Push and pull combined', () => {
      beforeEach(() => {
        syncManager.pushUpdatesForContext(context);
        syncManager.pullUpdatesForContext(context);
      });

      it('returns true if there is one active push and one active pull replication', () => {
        rootScope.$apply();

        const hasReplication = syncManager.doesReplicationExistForContext(context);
        expect(hasReplication).toBe(true);
      });

      it('returns false if both replications are finished', () => {
        contextReplicateToDeferred.resolve();
        contextReplicateFromDeferred.resolve();
        rootScope.$apply();

        const hasReplication = syncManager.doesReplicationExistForContext(context);
        expect(hasReplication).toBe(false);
      });

      it('returns false if both replications fail', () => {
        contextReplicateToDeferred.reject();
        contextReplicateFromDeferred.reject();
        rootScope.$apply();

        const hasReplication = syncManager.doesReplicationExistForContext(context);
        expect(hasReplication).toBe(false);
      });

      it('returns true if the push replications fails', () => {
        contextReplicateToDeferred.reject();
        rootScope.$apply();

        const hasReplication = syncManager.doesReplicationExistForContext(context);
        expect(hasReplication).toBe(true);
      });

      it('returns true if the pull replications fails', () => {
        contextReplicateFromDeferred.reject();
        rootScope.$apply();

        const hasReplication = syncManager.doesReplicationExistForContext(context);
        expect(hasReplication).toBe(true);
      });

      it('returns true if the push replications finishes', () => {
        contextReplicateToDeferred.resolve();
        rootScope.$apply();

        const hasReplication = syncManager.doesReplicationExistForContext(context);
        expect(hasReplication).toBe(true);
      });

      it('returns true if the pull replications finishes', () => {
        contextReplicateFromDeferred.resolve();
        rootScope.$apply();

        const hasReplication = syncManager.doesReplicationExistForContext(context);
        expect(hasReplication).toBe(true);
      });

      it('returns false if push finishes but pull fails', () => {
        contextReplicateToDeferred.resolve();
        contextReplicateFromDeferred.reject();
        rootScope.$apply();

        const hasReplication = syncManager.doesReplicationExistForContext(context);
        expect(hasReplication).toBe(false);
      });

      it('returns false if push fails but pull finishes', () => {
        contextReplicateToDeferred.reject();
        contextReplicateFromDeferred.resolve();
        rootScope.$apply();

        const hasReplication = syncManager.doesReplicationExistForContext(context);
        expect(hasReplication).toBe(false);
      });

      it('is true if replication is stopped', () => {
        rootScope.$apply();
        syncManager.stopReplicationsForContext(context);
        rootScope.$apply();

        const hasReplication = syncManager.doesReplicationExistForContext(context);
        expect(hasReplication).toBe(false);
      });
    });

    describe('Duplex replication', () => {
      beforeEach(() => {
        syncManager.startDuplexLiveReplication(context);
      });

      it('returns true if there is one active push and one active pull replication (duplex)', () => {
        rootScope.$apply();

        const hasReplication = syncManager.doesReplicationExistForContext(context);
        expect(hasReplication).toBe(true);
      });

      it('returns false if both replications are finished (duplex)', () => {
        contextReplicateToDeferred.resolve();
        contextReplicateFromDeferred.resolve();
        rootScope.$apply();

        const hasReplication = syncManager.doesReplicationExistForContext(context);
        expect(hasReplication).toBe(false);
      });

      it('returns false if both replications fail (duplex)', () => {
        contextReplicateToDeferred.reject();
        contextReplicateFromDeferred.reject();
        rootScope.$apply();

        const hasReplication = syncManager.doesReplicationExistForContext(context);
        expect(hasReplication).toBe(false);
      });

      it('returns true if the push replications fails (duplex)', () => {
        contextReplicateToDeferred.reject();
        rootScope.$apply();

        const hasReplication = syncManager.doesReplicationExistForContext(context);
        expect(hasReplication).toBe(true);
      });

      it('returns true if the pull replications fails (duplex)', () => {
        contextReplicateFromDeferred.reject();
        rootScope.$apply();

        const hasReplication = syncManager.doesReplicationExistForContext(context);
        expect(hasReplication).toBe(true);
      });

      it('returns true if the push replications finishes (duplex)', () => {
        contextReplicateToDeferred.resolve();
        rootScope.$apply();

        const hasReplication = syncManager.doesReplicationExistForContext(context);
        expect(hasReplication).toBe(true);
      });

      it('returns true if the pull replications finishes (duplex)', () => {
        contextReplicateFromDeferred.resolve();
        rootScope.$apply();

        const hasReplication = syncManager.doesReplicationExistForContext(context);
        expect(hasReplication).toBe(true);
      });

      it('returns false if push finishes but pull fails (duplex)', () => {
        contextReplicateToDeferred.resolve();
        contextReplicateFromDeferred.reject();
        rootScope.$apply();

        const hasReplication = syncManager.doesReplicationExistForContext(context);
        expect(hasReplication).toBe(false);
      });

      it('returns false if push fails but pull finishes (duplex)', () => {
        contextReplicateToDeferred.reject();
        contextReplicateFromDeferred.resolve();
        rootScope.$apply();

        const hasReplication = syncManager.doesReplicationExistForContext(context);
        expect(hasReplication).toBe(false);
      });

      it('is true if replication is stopped (duplex)', () => {
        rootScope.$apply();
        syncManager.stopReplicationsForContext(context);
        rootScope.$apply();

        const hasReplication = syncManager.doesReplicationExistForContext(context);
        expect(hasReplication).toBe(false);
      });
    });
  });
});
