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
  });
});
