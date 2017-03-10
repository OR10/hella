import PouchDbSyncManager from 'Application/Common/Services/PouchDbSyncManager';
import {inject} from 'angular-mocks';

fdescribe('PouchDbSyncManager', () => {
  const taskId = 'TASK-ID-abcdefg';
  let $qMock;

  beforeEach(() => {

  });

  beforeEach(inject($q => {
    $qMock = $q;
  }));

  it('should instantiate', () => {
    const instance = new PouchDbSyncManager();
    expect(instance).toEqual(jasmine.any(PouchDbSyncManager));
  });

  describe('pullUpdatesForContext', () => {
    let syncManager;
    let pouchDbContextServiceMock;
    beforeEach(() => {
      const loggerMock = undefined;

      pouchDbContextServiceMock = jasmine.createSpyObj('PouchDbContextService', [
        'queryTaskIdForContext',
      ]);
      pouchDbContextServiceMock.queryTaskIdForContext.and.returnValue(taskId);

      syncManager = new PouchDbSyncManager(null, loggerMock, $qMock, pouchDbContextServiceMock);
    });

    it('should return a promise', () => {
      const context = {};

      const actual = syncManager.pullUpdatesForContext(context);

      // $q does not use native promises but their own. There is now feasible way
      // to get the reference, so let's just test, that there is a then function
      expect(actual.then).toEqual(jasmine.any(Function));
    });
  });
});
