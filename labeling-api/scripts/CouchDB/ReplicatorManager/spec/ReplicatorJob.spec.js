const {Replicator} = require('../Application/Jobs/Replicator');
const PromiseMock = require('promise-mock');
const md5 = require('md5');

describe('Replicator Job', () => {
  let nanoAdminMock;
  let replicatorDbMock;
  let loggerMock;
  let purgeServiceMock;

  function createReplicator(
    sourceBaseUrl = 'http://example.com',
    sourceDatabase = 'some-database',
    targetUrl = 'http://some-other.couch:5984/foobar-db'
  ) {
    return new Replicator(loggerMock, nanoAdminMock, purgeServiceMock, sourceBaseUrl, sourceDatabase, targetUrl);
  }

  beforeEach(() => {
    PromiseMock.install();
  });

  beforeEach(() => {
    loggerMock = jasmine.createSpyObj('Logger', ['logString']);

    purgeServiceMock = jasmine.createSpyObj('PurgeService', ['purgeDocument']);
    purgeServiceMock.purgeDocument.and.returnValue(Promise.resolve());

    nanoAdminMock = jasmine.createSpyObj('nanoAdmin', ['use']);
    nanoAdminMock.db = jasmine.createSpyObj('nanoAdmin.db', ['get']);
    nanoAdminMock.db.get.and.callFake(
      (database, callback) => callback(undefined, {db_name: database})
    );

    replicatorDbMock = jasmine.createSpyObj('replicatorDb', ['insert']);
    replicatorDbMock.insert.and.callFake(
      (database, id, callback) => callback(undefined, {ok: true, _id: id, _rev: '1-abcdefgh'})
    );
    nanoAdminMock.use.and.returnValue(replicatorDbMock);
  });

  it('should instantiate', () => {
    const replicator = createReplicator();
    expect(replicator).toEqual(jasmine.any(Replicator));
  });

  it('should construct sourceUrl from base and dbname', () => {
    const replicator = createReplicator('http://some.couch', 'source-db', 'target-db');
    expect(replicator.sourceUrl).toEqual('http://some.couch/source-db');
  });

  it('should remove extra slash at the end of baseUrl', () => {
    const replicator = createReplicator('http://some.couch/', 'source-db', 'target-db');
    expect(replicator.sourceUrl).toEqual('http://some.couch/source-db');
  });

  it('should remove multiple extra slashes at the end of baseUrl', () => {
    const replicator = createReplicator('http://some.couch//////', 'source-db', 'target-db');
    expect(replicator.sourceUrl).toEqual('http://some.couch/source-db');
  });

  describe('Run Cycle', () => {
    let replicator;

    beforeEach(() => {
      replicator = createReplicator('http://some.couch', 'source', 'target');
    });

    it('should return a promise', () => {
      expect(replicator.run()).toEqual(jasmine.any(Promise));
    });


    it('should check if database exists', () => {
      replicator.run();
      Promise.runAll();
      expect(nanoAdminMock.db.get).toHaveBeenCalledWith('source', jasmine.any(Function));
    });

    it('should insert replication document into _replicator db', () => {
      const replicationDocument = {
        worker_batch_size: 50,
        source: 'http://some.couch/source',
        target: 'target',
        continuous: false,
        create_target: true,
      };

      replicator.run();
      Promise.runAll();
      expect(replicatorDbMock.insert).toHaveBeenCalledWith(
        replicationDocument,
        `replication-manager-${md5(replicationDocument.source + replicationDocument.target)}`,
        jasmine.any(Function)
      );
    });

    it('should check if database exists before inserting replication document', () => {
      let callOrder = [];
      nanoAdminMock.db.get.and.callFake(
        (database, callback) => {
          callOrder.push('db.get');
          callback(undefined, {db_name: database})
        }
      );

      replicatorDbMock.insert.and.callFake(
        (database, id, callback) => {
          callOrder.push('insert');
          callback(undefined, {ok: true, _id: id, _rev: '1-abcdefgh'})
        }
      );

      replicator.run();
      Promise.runAll();

      expect(callOrder).toEqual(['db.get', 'insert']);
    });

    it('should not insert replication document if database is not existent', () => {
      nanoAdminMock.db.get.and.callFake(
        (database, callback) => {
          callback(new Error('Error: no_db_file'), undefined)
        }
      );

      replicator.run();
      Promise.runAll();

      expect(replicatorDbMock.insert).not.toHaveBeenCalled();
    });

    it('should not insert replication document if database is not existent', () => {
      nanoAdminMock.db.get.and.callFake(
        (database, callback) => {
          callback(new Error('Error: no_db_file'), undefined)
        }
      );

      const resultPromise = replicator.run();
      const resultPromiseSpy = jasmine.createSpy('resultPromiseSpy');
      resultPromise.then(resultPromiseSpy);
      Promise.runAll();

      expect(resultPromiseSpy).toHaveBeenCalled();
    });
  });

  afterEach(() => {
    PromiseMock.uninstall();
  });
});
