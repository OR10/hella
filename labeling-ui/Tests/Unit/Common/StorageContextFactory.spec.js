import 'jquery';
import 'angular';
import {module, inject} from 'angular-mocks';
import PouchDB from 'pouchdb';

import _StorageContextFactory_ from 'Application/Common/Services/StorageContextFactory';

describe('StorageContextFactory', () => {
  let StorageContextFactory;
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
    StorageContextFactory = $injector.instantiate(_StorageContextFactory_);
  }));

  it('should be able to be instantiated', () => {
    expect(StorageContextFactory).toBeDefined();
  });

  describe('function createContextForTaskName', () => {
    it('should be defined', () => {
      expect(StorageContextFactory.createContextForTaskName).toBeDefined();
    });

    it('should return an object', () => {
      const contextA = StorageContextFactory.createContextForTaskName('first');
      expect(typeof contextA).toBe('object');
    });

    it('should return null if first parameter is no string', () => {
      const contextA = StorageContextFactory.createContextForTaskName(123123);
      expect(contextA).toBe(null);
    });

    it('should return an new instance for different names', () => {
      const contextA = StorageContextFactory.createContextForTaskName('first');
      const contextB = StorageContextFactory.createContextForTaskName('second');
      expect(contextA !== contextB).toEqual(true);
    });

    it('should return different instance for the same name', () => {
      const contextA = StorageContextFactory.createContextForTaskName('first');
      const contextB = StorageContextFactory.createContextForTaskName('first');
      expect(contextA !== contextB).toEqual(true);
    });
  });

  describe('function generateStoreIdentifierForTaskName', () => {
    const testTaskName = 'pedestrians-123';

    it('should be defined', () => {
      expect(StorageContextFactory.generateStoreIdentifierForTaskName).toBeDefined();
    });

    it('should return a string', () => {
      const storeIdentifier = StorageContextFactory.generateStoreIdentifierForTaskName(testTaskName);
      expect(typeof storeIdentifier).toBe('string');
    });

    it('should return null if first parameter is no string', () => {
      const contextA = StorageContextFactory.createContextForTaskName(123123);
      expect(contextA).toBe(null);
    });

    it('should generate a well formed store identifier', () => {
      const storeIdentifier = StorageContextFactory.generateStoreIdentifierForTaskName(testTaskName);
      const expectedIdentifier = `${testTaskName}-${mockConfig.Common.storage.local.databaseName}`;
      expect(storeIdentifier).toBe(expectedIdentifier);
    });
  });
});
