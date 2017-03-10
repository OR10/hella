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

    it('should start replication with the correct options', done => {
      const contextReplicate = jasmine.createSpyObj('context.replicate', ['from']);
      contextReplicate.from.and.returnValue(angularQ.resolve());
      const context = {replicate: contextReplicate};

      const replication = syncManager.pullUpdatesForContext(context);
      const replicationOptions = {
        live: false,
        retry: true,
      };

      replication.then(() => {
        expect(contextReplicate.from).toHaveBeenCalledWith(jasmine.any(PouchDb), replicationOptions);
        done();
      });

      rootScope.$apply();
    });

    it('should start replication with correct remote url', done => {
      const taskReplicationUrl = `${taskReplicationInformation.databaseServer}/${taskReplicationInformation.databaseName}`;
      let pouchDb;

      const contextReplicate = jasmine.createSpyObj('context.replicate', ['from']);
      contextReplicate.from.and.returnValue(angularQ.resolve());

      const context = {replicate: contextReplicate};

      const replication = syncManager.pullUpdatesForContext(context);

      replication.then(() => {
        pouchDb = contextReplicate.from.calls.argsFor(0)[0];
        expect(pouchDb.name).toEqual(taskReplicationUrl);
        done();
      });

      rootScope.$apply();
    });

    it('should return same replication for multiple calls while it is still running', () => {
      const contextReplicate = jasmine.createSpyObj('context.replicate', ['from']);
      const contextReplicateFromDeferred = angularQ.defer();
      contextReplicate.from.and.returnValue(contextReplicateFromDeferred.promise);

      const context = {replicate: contextReplicate};

      const firstReplication = syncManager.pullUpdatesForContext(context);
      rootScope.$apply();
      const secondReplication = syncManager.pullUpdatesForContext(context);

      expect(firstReplication).toBe(secondReplication);
    });

    it('should start second replication once first succeeded ', () => {
      const contextReplicate = jasmine.createSpyObj('context.replicate', ['from']);
      const contextReplicateFromDeferred = angularQ.defer();
      contextReplicate.from.and.returnValue(contextReplicateFromDeferred.promise);

      const context = {replicate: contextReplicate};

      const firstReplication = syncManager.pullUpdatesForContext(context);
      contextReplicateFromDeferred.resolve();
      rootScope.$apply();
      const secondReplication = syncManager.pullUpdatesForContext(context);

      expect(firstReplication).not.toBe(secondReplication);
    });

    it('should start second replication once first failed', () => {
      const contextReplicate = jasmine.createSpyObj('context.replicate', ['from']);
      const contextReplicateFromDeferred = angularQ.defer();
      contextReplicate.from.and.returnValue(contextReplicateFromDeferred.promise);

      const context = {replicate: contextReplicate};

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

    it('should start pull replication with the correct options', done => {
      const contextReplicate = jasmine.createSpyObj('context.replicate', ['from', 'to']);
      contextReplicate.from.and.returnValue(angularQ.resolve());
      contextReplicate.to.and.returnValue(angularQ.resolve());
      const context = {replicate: contextReplicate};

      const replication = syncManager.startDuplexLiveReplication(context);
      const replicationOptions = {
        live: true,
        retry: true,
      };

      replication.then(() => {
        expect(contextReplicate.from).toHaveBeenCalledWith(jasmine.any(PouchDb), replicationOptions);
        done();
      });

      rootScope.$apply();
    });

    it('should start push replication with the correct options', done => {
      const contextReplicate = jasmine.createSpyObj('context.replicate', ['from', 'to']);
      contextReplicate.from.and.returnValue(angularQ.resolve());
      contextReplicate.to.and.returnValue(angularQ.resolve());
      const context = {replicate: contextReplicate};

      const replication = syncManager.startDuplexLiveReplication(context);
      const replicationOptions = {
        live: true,
        retry: true,
      };

      replication.then(() => {
        expect(contextReplicate.to).toHaveBeenCalledWith(jasmine.any(PouchDb), replicationOptions);
        done();
      });

      rootScope.$apply();
    });

    it('should start pull replication with correct remote url', done => {
      const taskReplicationUrl = `${taskReplicationInformation.databaseServer}/${taskReplicationInformation.databaseName}`;
      let pouchDb;

      const contextReplicate = jasmine.createSpyObj('context.replicate', ['from', 'to']);
      contextReplicate.from.and.returnValue(angularQ.resolve());
      contextReplicate.to.and.returnValue(angularQ.resolve());

      const context = {replicate: contextReplicate};

      const replication = syncManager.startDuplexLiveReplication(context);

      replication.then(() => {
        pouchDb = contextReplicate.from.calls.argsFor(0)[0];
        expect(pouchDb.name).toEqual(taskReplicationUrl);
        done();
      });

      rootScope.$apply();
    });

    it('should start push replication with correct remote url', done => {
      const taskReplicationUrl = `${taskReplicationInformation.databaseServer}/${taskReplicationInformation.databaseName}`;
      let pouchDb;

      const contextReplicate = jasmine.createSpyObj('context.replicate', ['from', 'to']);
      contextReplicate.from.and.returnValue(angularQ.resolve());
      contextReplicate.to.and.returnValue(angularQ.resolve());

      const context = {replicate: contextReplicate};

      const replication = syncManager.startDuplexLiveReplication(context);

      replication.then(() => {
        pouchDb = contextReplicate.to.calls.argsFor(0)[0];
        expect(pouchDb.name).toEqual(taskReplicationUrl);
        done();
      });

      rootScope.$apply();
    });

    it('should return same replication promise for multiple calls while it is still running', () => {
      const contextReplicate = jasmine.createSpyObj('context.replicate', ['from', 'to']);
      const contextReplicateFromDeferred = angularQ.defer();
      contextReplicate.from.and.returnValue(contextReplicateFromDeferred.promise);
      const contextReplicateToDeferred = angularQ.defer();
      contextReplicate.to.and.returnValue(contextReplicateToDeferred.promise);

      const context = {replicate: contextReplicate};

      const firstReplication = syncManager.startDuplexLiveReplication(context);
      rootScope.$apply();
      const secondReplication = syncManager.startDuplexLiveReplication(context);

      expect(firstReplication).toBe(secondReplication);
    });

    it('should return the same replication promise as long as the pull part is still active', () => {
      const contextReplicate = jasmine.createSpyObj('context.replicate', ['from', 'to']);
      const contextReplicateFromDeferred = angularQ.defer();
      contextReplicate.from.and.returnValue(contextReplicateFromDeferred.promise);
      const contextReplicateToDeferred = angularQ.defer();
      contextReplicate.to.and.returnValue(contextReplicateToDeferred.promise);

      const context = {replicate: contextReplicate};

      const firstReplication = syncManager.startDuplexLiveReplication(context);
      contextReplicateToDeferred.resolve();
      rootScope.$apply();
      const secondReplication = syncManager.startDuplexLiveReplication(context);

      expect(firstReplication).toBe(secondReplication);
    });

    it('should return the same replication promise as long as the push part is still active', () => {
      const contextReplicate = jasmine.createSpyObj('context.replicate', ['from', 'to']);
      const contextReplicateFromDeferred = angularQ.defer();
      contextReplicate.from.and.returnValue(contextReplicateFromDeferred.promise);
      const contextReplicateToDeferred = angularQ.defer();
      contextReplicate.to.and.returnValue(contextReplicateToDeferred.promise);

      const context = {replicate: contextReplicate};

      const firstReplication = syncManager.startDuplexLiveReplication(context);
      contextReplicateFromDeferred.resolve();
      rootScope.$apply();
      const secondReplication = syncManager.startDuplexLiveReplication(context);

      expect(firstReplication).toBe(secondReplication);
    });

    it('should start second replication once first was ended successfully', () => {
      const contextReplicate = jasmine.createSpyObj('context.replicate', ['from', 'to']);
      const contextReplicateFromDeferred = angularQ.defer();
      contextReplicate.from.and.returnValue(contextReplicateFromDeferred.promise);
      const contextReplicateToDeferred = angularQ.defer();
      contextReplicate.to.and.returnValue(contextReplicateToDeferred.promise);

      const context = {replicate: contextReplicate};

      const firstReplication = syncManager.startDuplexLiveReplication(context);
      contextReplicateFromDeferred.resolve();
      contextReplicateToDeferred.resolve();
      rootScope.$apply();
      const secondReplication = syncManager.startDuplexLiveReplication(context);

      expect(firstReplication).not.toBe(secondReplication);
    });

    it('should start second replication once the pull part of the first one failed', () => {
      const contextReplicate = jasmine.createSpyObj('context.replicate', ['from', 'to']);
      const contextReplicateFromDeferred = angularQ.defer();
      contextReplicate.from.and.returnValue(contextReplicateFromDeferred.promise);
      const contextReplicateToDeferred = angularQ.defer();
      contextReplicate.to.and.returnValue(contextReplicateToDeferred.promise);

      const context = {replicate: contextReplicate};

      const firstReplication = syncManager.startDuplexLiveReplication(context);
      contextReplicateFromDeferred.reject();
      rootScope.$apply();
      const secondReplication = syncManager.startDuplexLiveReplication(context);

      expect(firstReplication).not.toBe(secondReplication);
    });

    it('should start second replication once the push part of the first one failed', () => {
      const contextReplicate = jasmine.createSpyObj('context.replicate', ['from', 'to']);
      const contextReplicateFromDeferred = angularQ.defer();
      contextReplicate.from.and.returnValue(contextReplicateFromDeferred.promise);
      const contextReplicateToDeferred = angularQ.defer();
      contextReplicate.to.and.returnValue(contextReplicateToDeferred.promise);

      const context = {replicate: contextReplicate};

      const firstReplication = syncManager.startDuplexLiveReplication(context);
      contextReplicateToDeferred.reject();
      rootScope.$apply();
      const secondReplication = syncManager.startDuplexLiveReplication(context);

      expect(firstReplication).not.toBe(secondReplication);
    });

    it('should start second replication once both (push/pull) parts of the first one failed', () => {
      const contextReplicate = jasmine.createSpyObj('context.replicate', ['from', 'to']);
      const contextReplicateFromDeferred = angularQ.defer();
      contextReplicate.from.and.returnValue(contextReplicateFromDeferred.promise);
      const contextReplicateToDeferred = angularQ.defer();
      contextReplicate.to.and.returnValue(contextReplicateToDeferred.promise);

      const context = {replicate: contextReplicate};

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
      const context = {};

      const actual = syncManager.stopReplicationsForContext(context);

      // $q does not use native promises but their own. There is now feasible way
      // to get the reference, so let's just test, that there is a then function
      expect(actual.then).toEqual(jasmine.any(Function));
    });

    it('should resolve if no replication is running for given context', () => {
      const context = {};

      const promise = syncManager.stopReplicationsForContext(context);

      const stopReplicationsForContextResolved = jasmine.createSpy('stopReplicationsForContextResolved');
      promise.then(stopReplicationsForContextResolved);

      rootScope.$apply();
      expect(stopReplicationsForContextResolved).toHaveBeenCalled();
    });

    it('should cancel uni-directional pull replication', () => {
      const contextReplicate = jasmine.createSpyObj('context.replicate', ['from']);
      const contextReplicateFromDeferred = angularQ.defer();
      const contextReplicateFromPromise = contextReplicateFromDeferred.promise;
      contextReplicateFromPromise.cancel = jasmine.createSpy('context.replicate.from.cancel');
      contextReplicate.from.and.returnValue(contextReplicateFromPromise);

      const context = {replicate: contextReplicate};

      syncManager.pullUpdatesForContext(context);
      rootScope.$apply();
      syncManager.stopReplicationsForContext(context);

      rootScope.$apply();

      expect(contextReplicateFromPromise.cancel).toHaveBeenCalled();
    });

    it('should only cancel uni-directional pull replication from given context', () => {
      const firstContextReplicate = jasmine.createSpyObj('context.replicate', ['from']);
      const firstContextReplicateFromDeferred = angularQ.defer();
      const firstContextReplicateFromPromise = firstContextReplicateFromDeferred.promise;
      firstContextReplicateFromPromise.cancel = jasmine.createSpy('context.replicate.from.cancel');
      firstContextReplicate.from.and.returnValue(firstContextReplicateFromPromise);

      const secondContextReplicate = jasmine.createSpyObj('context.replicate', ['from']);
      const secondContextReplicateFromDeferred = angularQ.defer();
      const secondContextReplicateFromPromise = secondContextReplicateFromDeferred.promise;
      secondContextReplicateFromPromise.cancel = jasmine.createSpy('context.replicate.from.cancel');
      secondContextReplicate.from.and.returnValue(secondContextReplicateFromPromise);

      const firstContext = {replicate: firstContextReplicate};
      const secondContext = {replicate: secondContextReplicate};

      syncManager.pullUpdatesForContext(firstContext);
      syncManager.pullUpdatesForContext(secondContext);
      rootScope.$apply();
      syncManager.stopReplicationsForContext(firstContext);

      rootScope.$apply();

      expect(firstContextReplicateFromPromise.cancel).toHaveBeenCalled();
      expect(secondContextReplicateFromPromise.cancel).not.toHaveBeenCalled();
    });
  });
});
