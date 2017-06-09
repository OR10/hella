import {cloneDeep} from 'lodash';
import PouchDbLiveMigration from 'Application/Common/Services/PouchDbLiveMigration';

describe('PouchDbLiveMigration', () => {
  let dbMock;

  function createMigrationService(migrations = []) {
    return new PouchDbLiveMigration(...migrations);
  }

  function createMigration(fn = () => {
  }, supportedFn = () => true) {
    const migration = jasmine.createSpyObj('PouchDbMigration', ['supportsDocument', 'migrateDocument']);

    migration.supportsDocument.and.callFake(supportedFn);
    migration.migrateDocument.and.callFake(fn);

    return migration;
  }

  beforeEach(() => {
    dbMock = jasmine.createSpyObj('PouchDB#instance', ['transform']);
  });

  describe('Registration', () => {
    let migrationService;

    beforeEach(() => {
      migrationService = createMigrationService();
    });

    it('should utilize transform-pouch', () => {
      migrationService.install(dbMock);
      expect(dbMock.transform).toHaveBeenCalled();
    });

    it('should register outgoing transform upon install call', () => {
      migrationService.install(dbMock);

      const installedTransforms = dbMock.transform.calls.argsFor(0)[0];
      expect('outgoing' in installedTransforms).toBeTruthy();
    });
  });

  describe('Transformation', () => {
    let migrationService;
    let migration;
    let document;
    let migrationCallback;

    beforeEach(() => {
      document = {
        '_id': 'foobar',
        'some': 'cool',
        'document': 423,
        'with': {
          'nested': 'object',
          'and-stuff': true,
        },
      };

      migration = createMigration();
      dbMock.transform.and.callFake(configuration => migrationCallback = configuration.outgoing);
      migrationService = createMigrationService([migration]);
      migrationService.install(dbMock);
    });

    it('should ask for support of migration', () => {
      migration.supportsDocument.and.returnValue(false);
      migrationCallback(document);

      expect(migration.supportsDocument).toHaveBeenCalled();
    });

    it('should provide given document to support checker', () => {
      migration.supportsDocument.and.returnValue(false);
      migrationCallback(document);

      expect(migration.supportsDocument).toHaveBeenCalledWith(document);
    });

    it('should not call migrateDocument if support is denied', () => {
      migration.supportsDocument.and.returnValue(false);
      migrationCallback(document);

      expect(migration.migrateDocument).not.toHaveBeenCalled();
    });

    it('should call migrateDocument if support is acknowledged', () => {
      migration.supportsDocument.and.returnValue(true);
      migrationCallback(document);

      expect(migration.migrateDocument).toHaveBeenCalled();
    });

    it('should call migrateDocument with processed document', () => {
      migration.supportsDocument.and.returnValue(true);
      migrationCallback(document);

      expect(migration.migrateDocument).toHaveBeenCalledWith(document);
    });

    it('should return document unmodified if no migration matched', () => {
      const originalDocument = cloneDeep(document);

      migration.supportsDocument.and.returnValue(false);
      const migratedDocument = migrationCallback(document);

      expect(migratedDocument).toEqual(originalDocument);
    });

    it('should apply migration', () => {
      migration.supportsDocument.and.returnValue(true);
      migration.migrateDocument.and.callFake(
        doc => doc.addedProperty = 'foobar',
      );

      const migratedDocument = migrationCallback(document);

      expect(migratedDocument.addedProperty).toEqual('foobar');
    });

    it('should apply multiple migrations', () => {
      const firstMigration = createMigration(doc => doc.firstMigration = true);
      const secondMigration = createMigration(undefined, () => false);
      const thirdMigration = createMigration(doc => delete doc.with);

      const complexMigrationService = createMigrationService(
        [firstMigration, secondMigration, thirdMigration],
      );
      complexMigrationService.install(dbMock);

      const expectedMigratedDocument = {
        '_id': 'foobar',
        'some': 'cool',
        'document': 423,
        'firstMigration': true,
      };

      const migratedDocument = migrationCallback(document);

      expect(migratedDocument).toEqual(expectedMigratedDocument);
    });
  });
});
