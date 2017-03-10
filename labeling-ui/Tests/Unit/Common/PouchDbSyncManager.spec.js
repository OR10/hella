import PouchDbSyncManager from 'Application/Common/Services/PouchDbSyncManager';
import {inject} from 'angular-mocks';
import PouchDb from 'pouchdb';

fdescribe('PouchDbSyncManager', () => {
  const taskId = 'TASK-ID-abcdefg';
  let angularQ;
  let rootScope;
  let taskGateway;

  beforeEach(inject(($q, $rootScope) => {
    angularQ = $q;
    rootScope = $rootScope;
  }));

  it('should instantiate', () => {
    const instance = new PouchDbSyncManager();
    expect(instance).toEqual(jasmine.any(PouchDbSyncManager));
  });

  describe('pullUpdatesForContext', () => {
    let syncManager;
    let pouchDbContextServiceMock;
    let taskReplicationInformation;

    beforeEach(() => {
      const loggerMock = undefined;

      pouchDbContextServiceMock = jasmine.createSpyObj('PouchDbContextService', [
        'queryTaskIdForContext',
      ]);
      pouchDbContextServiceMock.queryTaskIdForContext.and.returnValue(taskId);

      syncManager = new PouchDbSyncManager(null, loggerMock, angularQ, pouchDbContextServiceMock, taskGateway);

      taskGateway = jasmine.createSpyObj('TaskGateway', ['getTaskReplicationInformationForTaskId']);
      taskReplicationInformation = {
        databaseServer: 'foobar',
        databaseName: 'heinz',
      };
      taskGateway.getTaskReplicationInformationForTaskId.and.returnValue(taskReplicationInformation);
    });

    it('should return a promise', () => {
      const context = {};

      const actual = syncManager.pullUpdatesForContext(context);

      // $q does not use native promises but their own. There is now feasible way
      // to get the reference, so let's just test, that there is a then function
      expect(actual.then).toEqual(jasmine.any(Function));
    });

    it('should start replication', done => {
      const contextReplicate = jasmine.createSpyObj('context.replicate', ['from']);
      contextReplicate.from.and.returnValue(angularQ.resolve());
      const context = {replicate: contextReplicate};

      const replication = syncManager.pullUpdatesForContext(context);

      replication.then(() => {
        expect(contextReplicate.from).toHaveBeenCalledWith(jasmine.any(PouchDb), jasmine.any(Object));
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

  });
});
