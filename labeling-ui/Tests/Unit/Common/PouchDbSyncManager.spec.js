import PouchDbSyncManager from 'Application/Common/Services/PouchDbSyncManager';

fdescribe('PouchDbSyncManager', () => {
  const taskId = 'TASK-ID-abcdefg';

  beforeEach(() => {

  });

  it('should instantiate', () => {
    const instance = new PouchDbSyncManager();
    expect(instance).toEqual(jasmine.any(PouchDbSyncManager));
  });

  describe('pullUpdatesForContext', () => {
    let syncManager;
    let $qMock;
    let pouchDbContextServiceMock;
    beforeEach(() => {
      const configurationMock = {
        Common: {
          storage: {
            remote: {
              baseUrl: '',
              taskDatabaseNameTemplate: '',
            }
          },
        },
      };
      const loggerMock = undefined;

      $qMock = jasmine.createSpyObj('$q', [
        'all',
        'resolve',
      ]);

      pouchDbContextServiceMock = jasmine.createSpyObj('PouchDbContextService', [
        'queryTaskIdForContext',
      ]);
      pouchDbContextServiceMock.queryTaskIdForContext.and.returnValue(taskId);

      syncManager = new PouchDbSyncManager(configurationMock, loggerMock, $qMock, pouchDbContextServiceMock);
    });

    it('should return a promise', () => {
      const allReturn = {};
      $qMock.all.and.returnValue(allReturn);
      const context = {};

      const actual = syncManager.pullUpdatesForContext(context);
      expect(actual).toBe(allReturn);
    })
  });
});
