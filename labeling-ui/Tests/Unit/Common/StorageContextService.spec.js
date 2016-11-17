import 'jquery';
import 'angular';
import {module, inject} from 'angular-mocks';
import PouchDB from 'pouchdb';

import _StorageContextService_ from 'Application/Common/Services/StorageContextService';

describe('StorageContextService', () => {
  let StorageContextService;
  const mockConfig = {
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

  beforeEach(module($provide => {
    $provide.value('PouchDB', PouchDB);
    $provide.value('applicationConfig', mockConfig);
  }));

  beforeEach(inject($injector => {
    StorageContextService = $injector.instantiate(_StorageContextService_);
  }));

  it('should be able to be instantiated', () => {
    expect(StorageContextService).toBeDefined();
  });

  describe('function provideContextForTaskId', () => {
    it('should be defined', () => {
      expect(StorageContextService.provideContextForTaskId).toBeDefined();
    });

    it('should return an object', () => {
      const contextA = StorageContextService.provideContextForTaskId('a-new-context-please');
      expect(typeof contextA).toBe('object');
    });

    it('should return null if the taskId parameter is no string', () => {
      const contextA = StorageContextService.provideContextForTaskId(123123);
      expect(contextA).toBe(null);
    });

    it('should return an new instance for different taskId', () => {
      const contextA = StorageContextService.provideContextForTaskId('first');
      const contextB = StorageContextService.provideContextForTaskId('second');
      expect(contextA !== contextB).toEqual(true);
    });

    it('should return the same instance for the same taskId', () => {
      const contextA = StorageContextService.provideContextForTaskId('same');
      const contextB = StorageContextService.provideContextForTaskId('same');
      expect(contextA === contextB).toEqual(true);
    });
  });

  describe('function generateStoreIdentifierForTaskId', () => {
    const testTaskId = 'pedestrians-123';

    it('should be defined', () => {
      expect(StorageContextService.generateStoreIdentifierForTaskId).toBeDefined();
    });

    it('should return a string', () => {
      const storeIdentifier = StorageContextService.generateStoreIdentifierForTaskId(testTaskId);
      expect(typeof storeIdentifier).toBe('string');
    });

    it('should return null if first parameter is no string', () => {
      const contextA = StorageContextService.generateStoreIdentifierForTaskId(123123);
      expect(contextA).toBe(null);
    });

    it('should generate a well formed store identifier', () => {
      const storeIdentifier = StorageContextService.generateStoreIdentifierForTaskId(testTaskId);
      const expectedIdentifier = `${testTaskId}-${mockConfig.Common.storage.local.databaseName}`;
      expect(storeIdentifier).toBe(expectedIdentifier);
    });
  });

  describe('function queryTaskNameForContext', () => {
    it('should be defined', () => {
      expect(StorageContextService.queryTaskIdForContext).toBeDefined();
    });

    it('should lookup the taskName for a previously provided context', () => {
      const randomTaskId = `random-task-id-${Date.now()}`;
      const origContext = StorageContextService.provideContextForTaskId(randomTaskId);
      const resolvedTaskId = StorageContextService.queryTaskIdForContext(origContext);
      expect(resolvedTaskId).toBeDefined(randomTaskId);
    });

    it('should return null if the given parameter could not be matched with a task id', () => {
      const invalidContext = {};
      const taskId = StorageContextService.queryTaskIdForContext(invalidContext);
      expect(taskId).toBe(null);
    });
  });
});
