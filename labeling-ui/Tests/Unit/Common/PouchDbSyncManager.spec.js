import 'jquery';
import 'angular';
import {module, inject} from 'angular-mocks';

import _PouchDbSyncManager_ from 'Application/Common/Services/PouchDbSyncManager';

describe('pouchDbSyncManager', () => {
  const MOCK_TASK_ID = 'mock-task-id';

  let PouchDbSyncManager;
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
      replicate: {
        from: () => {
          return {
            on: (eventName, callback) => {
              expect(eventName).toBe('complete');
              callback();
              return this;
            },
            cancel: function cancel() {
              spies.syncCancelSpy();
            },
          };
        },
      },
      sync: () => {
        return {
          _callbacks: {},
          on: (eventName, callback) => {
            if (eventName === 'complete') {
              this._callbacks[eventName] = callback;
            } else {
              expect(eventName).toBe('paused');
              callback();
            }
            return this;
          },
          cancel: function cancel() {
            spies.syncCancelSpy();
            this._callbacks.complete();
          },
        };
      },
    };
  }


  beforeEach(module($provide => {
    spies = {
      syncCancelSpy: () => {
      },
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
    $provide.value('pouchDbContextService', createContextServiceMock());
    $provide.value('PouchDB', createPouchDBMock());
  }));

  beforeEach(inject($injector => {
    PouchDbSyncManager = $injector.instantiate(_PouchDbSyncManager_);
  }));

  it('should be able to be instantiated', () => {
    expect(PouchDbSyncManager).toBeDefined();
  });

  describe('function startContinousReplicationForContext', () => {
    it('should be defined', () => {
      expect(PouchDbSyncManager.startContinousReplicationForContext).toBeDefined();
    });

    it('should return null if no context was given', () => {
      const result = PouchDbSyncManager.startContinousReplicationForContext(123, 123);
      expect(result).toBe(null);
    });

    it('should return null if no callback was given', () => {
      const result = PouchDbSyncManager.startContinousReplicationForContext(123);
      expect(result).toBe(null);
    });

    it('should bind callback parameter to onchange event', () => {
      const obj = {
        onCompleteCallback: () => {
        },
      };

      spyOn(obj, 'onCompleteCallback');
      PouchDbSyncManager.startContinousReplicationForContext({}, obj.onCompleteCallback);
      expect(obj.onCompleteCallback).toHaveBeenCalled();
    });


    it('should use filter settings from common/config', () => {
      const obj = {
        onCompleteCallback: () => {
        },
      };
      PouchDbSyncManager.startContinousReplicationForContext({}, obj.onCompleteCallback);
      expect(spies.filterSettingSpy).toHaveBeenCalled();
    });
  });

  describe('function stopReplicationForContext', () => {
    it('should be defined', () => {
      expect(PouchDbSyncManager.stopReplicationForContext).toBeDefined();
    });

    it('should return null of context is no instance of object', () => {
      const result = PouchDbSyncManager.stopReplicationForContext('no valid context object');
      expect(result).toBe(null);
    });

    it('should return null if context has not been sync enabled earlier', () => {
      const noSyncEnabledContext = {};
      const result = PouchDbSyncManager.stopReplicationForContext(noSyncEnabledContext);
      expect(result).toBe(null);
    });

    it('should cancel sync if context has been sync enabled earlier', () => {
      const context = {};
      PouchDbSyncManager.startContinousReplicationForContext(context, () => {
      });
      PouchDbSyncManager.stopReplicationForContext(context);
      expect(spies.syncCancelSpy).toHaveBeenCalled();
    });
  });

  describe('function isReplicationOnContextEnabled', () => {
    it('should be defined', () => {
      expect(PouchDbSyncManager.isReplicationOnContextEnabled).toBeDefined();
    });

    it('should return true if context is currently replicating', () => {
      const dummyContext = {};
      const obj = {
        onCompleteCallback: () => {
        },
      };
      PouchDbSyncManager.startContinousReplicationForContext(dummyContext, obj.onCompleteCallback);
      expect(PouchDbSyncManager.isReplicationOnContextEnabled(dummyContext)).toBe(true);
    });

    it('should return false if context has stopped replicating', () => {
      const dummyContext = {};
      const obj = {
        onCompleteCallback: () => {
        },
      };
      PouchDbSyncManager.startContinousReplicationForContext(dummyContext, obj.onCompleteCallback);
      expect(PouchDbSyncManager.isReplicationOnContextEnabled(dummyContext)).toBe(true);
      PouchDbSyncManager.stopReplicationForContext(dummyContext);
      expect(PouchDbSyncManager.isReplicationOnContextEnabled(dummyContext)).toBe(false);
    });
  });

  describe('function _removeContextFromCache', () => {
    it('should exist', () => {
      expect(PouchDbSyncManager._removeContextFromCache).toBeDefined();
    });

    it('should remove context from cache manager', () => {
      const dummyContext = {};
      const obj = {
        onCompleteCallback: () => {
        },
      };
      PouchDbSyncManager.startContinousReplicationForContext(dummyContext, obj.onCompleteCallback);
      expect(PouchDbSyncManager.isReplicationOnContextEnabled(dummyContext)).toBe(true);
      PouchDbSyncManager._removeContextFromCache(dummyContext);
      expect(PouchDbSyncManager.isReplicationOnContextEnabled(dummyContext)).toBe(false);
    });
  });

  describe('function pullUpdatesForContext', () => {
    it('should exist', () => {
      expect(PouchDbSyncManager.pullUpdatesForContext).toBeDefined();
    });

    it('should start filtered read replication and wait for completeness', () => {
      const dummyContext = createPouchDBMock();
      const obj = {
        onCompleteCallback: () => {
        },
      };

      spyOn(obj, 'onCompleteCallback');
      PouchDbSyncManager.pullUpdatesForContext(dummyContext, obj.onCompleteCallback);
      expect(obj.onCompleteCallback).toHaveBeenCalled();
    });

    it('should return null if no context was given', () => {
      const result = PouchDbSyncManager.pullUpdatesForContext(123, 123);
      expect(result).toBe(null);
    });

    it('should return null if no callback was given', () => {
      const result = PouchDbSyncManager.pullUpdatesForContext(123);
      expect(result).toBe(null);
    });

    it('should use filter settings from common/config', () => {
      const dummyContext = createPouchDBMock();
      const obj = {
        onCompleteCallback: () => {
        },
      };
      PouchDbSyncManager.pullUpdatesForContext(dummyContext, obj.onCompleteCallback);
      expect(spies.filterSettingSpy).toHaveBeenCalled();
    });
  });

  describe('function pushUpdatesForContext', () => {
    it('should exist', () => {
      expect(PouchDbSyncManager.pushUpdatesForContext).toBeDefined();
    });
  });

  describe('function waitForRemoteToConfirm(document)', () => {
    const MOCK_DOCUMENT = {_id: 'asdasdasd'};
    const MOCK_CONTEXT = {};

    it('should exist', () => {
      expect(PouchDbSyncManager.waitForRemoteToConfirm).toBeDefined();
    });

    it('should return a promise', () => {
      const result = PouchDbSyncManager.waitForRemoteToConfirm(MOCK_CONTEXT, MOCK_DOCUMENT);
      expect(typeof result.then).toBe('function');
    });

    it('should return null when document is empty', () => {
      const result = PouchDbSyncManager.waitForRemoteToConfirm(MOCK_CONTEXT, null);
      expect(result).toBe(null);
    });

    it('should return null when document has no id', () => {
      const result = PouchDbSyncManager.waitForRemoteToConfirm(MOCK_CONTEXT, {});
      expect(result).toBe(null);
    });

    it('should resolve the promise when remote replication has confirmed arrival of the document', done => {
      const confirmationPromise = PouchDbSyncManager.waitForRemoteToConfirm(MOCK_CONTEXT, MOCK_DOCUMENT);
      confirmationPromise.then(response => {
        expect(response._id).toBe(MOCK_DOCUMENT._id);
        done();
      });
    });

    it('should resolve with error, when replication exceeds X seconds', done => {
      const confirmationPromise = PouchDbSyncManager.waitForRemoteToConfirm(MOCK_CONTEXT, MOCK_DOCUMENT, 1);
      const callbacks = {
        onSuccess: () => {
          expect(callbacks.onTimeout).toHaveBeenCalled();
          done();
        },
        onTimeout: () => {
          expect(callbacks.onSuccess).not.toHaveBeenCalled();
          done();
        },
      };
      spyOn(callbacks, 'onSuccess').and.callThrough();
      spyOn(callbacks, 'onTimeout').and.callThrough();

      confirmationPromise.then(callbacks.onSuccess, callbacks.onTimeout);
    });
  });
});
