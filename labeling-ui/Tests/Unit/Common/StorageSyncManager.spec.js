import 'jquery';
import 'angular';
import {module, inject} from 'angular-mocks';

import _StorageSyncManager_ from 'Application/Common/Services/StorageSyncManager';

describe('StorageSyncManager', () => {
  const MOCK_TASK_ID = 'mock-task-id';

  let StorageSyncManager;
  let spies;
  let mockConfig;

  function createContextServiceMock() {
    return {
      queryTaskIdForContext: () => {
        return MOCK_TASK_ID;
      },
    };
  }

  function createPouchDBMock() {
    return {
      sync: () => {
        return {
          on: (eventName, callback) => {
            expect(eventName).toBe('paused');
            callback();
          },
          cancel: spies.syncCancelSpy,
        };
      },
    };
  }


  beforeEach(module($provide => {
    spies = {
      syncCancelSpy: () => {},
      filterSettingSpy: () => 'designdocumentName/filterName',
    };
    spyOn(spies, 'syncCancelSpy');
    spyOn(spies, 'filterSettingSpy');

    mockConfig = {
      Common: {
        storage: {
          local: {
            databaseName: 'AnnoStation',
          },
          remote: {
            baseUrl: 'http://localhost:5984/',
            databaseName: 'AnnoStation',
          },
        },
      },
    };
    Object.defineProperty(mockConfig.Common.storage.remote, 'filter', {
      get: spies.filterSettingSpy,
    });

    $provide.value('applicationConfig', mockConfig);
    $provide.value('StorageContextService', createContextServiceMock());
    $provide.value('PouchDB', createPouchDBMock());
  }));

  beforeEach(inject($injector => {
    StorageSyncManager = $injector.instantiate(_StorageSyncManager_);
  }));

  it('should be able to be instantiated', () => {
    expect(StorageSyncManager).toBeDefined();
  });

  describe('function startReplicationForContext', () => {
    it('should be defined', () => {
      expect(StorageSyncManager.startReplicationForContext).toBeDefined();
    });

    it('should return null if no context was given', () => {
      const result = StorageSyncManager.startReplicationForContext(123, 123);
      expect(result).toBe(null);
    });

    it('should return null if no callback was given', () => {
      const result = StorageSyncManager.startReplicationForContext(123);
      expect(result).toBe(null);
    });

    it('should bind callback parameter to onchange event', () => {
      const obj = {
        onPauseCallback: () => {
        },
      };

      spyOn(obj, 'onPauseCallback');
      StorageSyncManager.startReplicationForContext({}, obj.onPauseCallback);
      expect(obj.onPauseCallback).toHaveBeenCalled();
    });

    it('should use filter settings from common/config', () => {
      const obj = {
        onPauseCallback: () => {
        },
      };
      StorageSyncManager.startReplicationForContext({}, obj.onPauseCallback);
      expect(spies.filterSettingSpy).toHaveBeenCalled();
    });
  });

  describe('function stopReplicationForContext', () => {
    it('should be defined', () => {
      expect(StorageSyncManager.stopReplicationForContext).toBeDefined();
    });

    it('should return null of context is no instance of object', () => {
      const result = StorageSyncManager.stopReplicationForContext('no valid context object');
      expect(result).toBe(null);
    });

    it('should return null if context has not been sync enabled earlier', () => {
      const noSyncEnabledContext = {};
      const result = StorageSyncManager.stopReplicationForContext(noSyncEnabledContext);
      expect(result).toBe(null);
    });

    it('should cancel sync if context has been sync enabled earlier', () => {
      const context = {};
      StorageSyncManager.startReplicationForContext(context, () => {
      });
      StorageSyncManager.stopReplicationForContext(context);
      expect(spies.syncCancelSpy).toHaveBeenCalled();
    });
  });
});
