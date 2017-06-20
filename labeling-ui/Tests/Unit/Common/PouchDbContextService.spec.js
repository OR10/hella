import 'jquery';
import 'angular';
import {module, inject} from 'angular-mocks';
import PouchDB from 'pouchdb';

import _PouchDbContextService_ from 'Application/Common/Services/PouchDbContextService';

describe('PouchDbContextService', () => {
  let toBeCleanedContexts;

  let PouchDbContextService;
  let pouchDbLiveMigrationMock;

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

  beforeEach(() => {
    toBeCleanedContexts = [];

    pouchDbLiveMigrationMock = jasmine.createSpyObj('PouchDbLiveMigration', ['install']);

    module($provide => {
      $provide.value('PouchDB', PouchDB);
      $provide.value('pouchDbLiveMigration', pouchDbLiveMigrationMock);
      $provide.value('applicationConfig', mockConfig);
    });

    inject($injector => {
      PouchDbContextService = $injector.instantiate(_PouchDbContextService_);
    });
  });

  it('should be able to be instantiated', () => {
    expect(PouchDbContextService).toBeDefined();
  });

  describe('function provideContextForTaskId', () => {
    it('should be defined', () => {
      expect(PouchDbContextService.provideContextForTaskId).toBeDefined();
    });

    it('should return an object', () => {
      const contextA = PouchDbContextService.provideContextForTaskId('a-new-context-please');

      expect(typeof contextA).toBe('object');

      toBeCleanedContexts.push(contextA);
    });

    it('should throw exception if the taskId parameter is no string', () => {
      expect(
        () => PouchDbContextService.provideContextForTaskId(123123)
      ).toThrow();
    });

    it('should return an new instance for different taskId', () => {
      const contextA = PouchDbContextService.provideContextForTaskId('first');
      const contextB = PouchDbContextService.provideContextForTaskId('second');

      toBeCleanedContexts.push(contextA);
      toBeCleanedContexts.push(contextB);

      expect(contextA !== contextB).toEqual(true);
    });

    it('should return the same instance for the same taskId', () => {
      const contextA = PouchDbContextService.provideContextForTaskId('same');
      const contextB = PouchDbContextService.provideContextForTaskId('same');

      toBeCleanedContexts.push(contextA);

      expect(contextA === contextB).toEqual(true);
    });

    it('should install live migrations on newly created context', () => {
      const context = PouchDbContextService.provideContextForTaskId('some-task-id');
      toBeCleanedContexts.push(context);

      expect(pouchDbLiveMigrationMock.install).toHaveBeenCalledWith(context);
    });

    it('should not install live migrations on cached context again', () => {
      const contextA = PouchDbContextService.provideContextForTaskId('same');
      PouchDbContextService.provideContextForTaskId('same');
      toBeCleanedContexts.push(contextA);

      expect(pouchDbLiveMigrationMock.install).toHaveBeenCalledTimes(1);
    });
  });

  // @TODO: Why is method public?
  describe('function generateStoreIdentifierForTaskId', () => {
    const testTaskId = 'pedestrians-123';

    it('should be defined', () => {
      expect(PouchDbContextService.generateStoreIdentifierForTaskId).toBeDefined();
    });

    it('should return a string', () => {
      const storeIdentifier = PouchDbContextService.generateStoreIdentifierForTaskId(testTaskId);
      expect(typeof storeIdentifier).toBe('string');
    });

    it('should throw if first parameter is no string', () => {
      expect(
        () => PouchDbContextService.generateStoreIdentifierForTaskId(123123)
      ).toThrow();
    });

    it('should generate a well formed store identifier', () => {
      const storeIdentifier = PouchDbContextService.generateStoreIdentifierForTaskId(testTaskId);
      const expectedIdentifier = `${testTaskId}-${mockConfig.Common.storage.local.databaseName}`;
      expect(storeIdentifier).toBe(expectedIdentifier);
    });
  });

  describe('function queryTaskNameForContext', () => {
    it('should be defined', () => {
      expect(PouchDbContextService.queryTaskIdForContext).toBeDefined();
    });

    it('should lookup the taskName for a previously provided context', () => {
      const randomTaskId = `random-task-id-${Date.now()}`;
      const origContext = PouchDbContextService.provideContextForTaskId(randomTaskId);

      toBeCleanedContexts.push(origContext);

      const resolvedTaskId = PouchDbContextService.queryTaskIdForContext(origContext);

      expect(resolvedTaskId).toBeDefined(randomTaskId);
    });

    it('should return null if the given parameter could not be matched with a task id', () => {
      const invalidContext = {};
      const taskId = PouchDbContextService.queryTaskIdForContext(invalidContext);
      expect(taskId).toBe(null);
    });
  });

  afterEach(done => {
    Promise.all(
      toBeCleanedContexts.map(context => context.destroy())
    )
      .then(() => done());
  });
});
