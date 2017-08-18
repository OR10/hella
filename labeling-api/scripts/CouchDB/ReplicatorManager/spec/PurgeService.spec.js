const PromiseMock = require('promise-mock');
const {PurgeService} = require('../Application/PurgeService');
const uuid = require('uuid');

describe('PurgeService', () => {
  let nanoAdminMock;
  let nanoDbMock;
  let loggerMock;

  beforeEach(() => {
    PromiseMock.install();
  });

  beforeEach(() => {
    nanoAdminMock = jasmine.createSpyObj('nanoAdmin', ['use', 'request']);

    nanoDbMock = jasmine.createSpyObj('nanoDB', ['get', 'destroy']);
    nanoDbMock.config = {};

    nanoAdminMock.use.and.returnValue(nanoDbMock);

    loggerMock = jasmine.createSpyObj('Logger', ['logString']);
  });

  function createPurgeService() {
    return new PurgeService(loggerMock, nanoAdminMock);
  }

  function createLeafRevisionsBody(documentId, revisionCount, deleted = false, okResultsCount = 1) {
    const revisionIds = [];
    for (let i = 0; i < revisionCount; i++) {
      revisionIds.push(uuid.v4().replace('-', ''));
    }

    const leafRevisionsBody = [];
    for (let i = 0; i < okResultsCount; i++) {
      leafRevisionsBody.push({
        ok: {
          _id: documentId,
          _deleted: deleted,
          _revisions: {
            ids: revisionIds,
            start: revisionIds.length,
          }
        }
      });
    }

    return leafRevisionsBody;
  }

  function createPurgeRequestBodyFromOkResult(okResult) {
    const revisions = okResult.ok._revisions.ids.map(
      (hash, index) => `${okResult.ok._revisions.start - index}-${hash}`
    );

    return {
      [okResult.ok._id]: revisions,
    };
  }

  function createCallbackResolver(...resolveValues) {
    return function(...args) {
      const callback = args[args.length - 1];
      callback(undefined, ...resolveValues);
    }
  }

  function createCallbackRejector(rejectValue) {
    return function(...args) {
      const callback = args[args.length - 1];
      callback(rejectValue, undefined);
    }
  }

  it('should be instantiable', () => {
    const service = createPurgeService();
    expect(service).toEqual(jasmine.any(PurgeService));
  });


  describe('purgeDocument', () => {
    it('should work on the database with the given name', () => {
      const service = createPurgeService();
      const databaseName = 'some-database';
      const documentId = 'some-document-id';

      service.purgeDocument(databaseName, documentId);

      PromiseMock.runAll();

      expect(nanoAdminMock.use).toHaveBeenCalledWith(databaseName);
    });

    it('should request all leaf revisions of the document to purge', () => {
      const service = createPurgeService();
      const databaseName = 'some-database';
      const documentId = 'some-document-id';

      service.purgeDocument(databaseName, documentId);

      PromiseMock.runAll();

      expect(nanoDbMock.get).toHaveBeenCalledWith(
        documentId,
        {revs: true, open_revs: 'all'},
        jasmine.any(Function)
      );
    });

    it('should return promise', () => {
      const service = createPurgeService();
      const databaseName = 'some-database';
      const documentId = 'some-document-id';

      const returnValue = service.purgeDocument(databaseName, documentId);

      expect(returnValue.then).toEqual(jasmine.any(Function));
    });

    it('should reject if leaf revisions could not be fetched', () => {
      const service = createPurgeService();
      const databaseName = 'some-database';
      const documentId = 'some-document-id';

      const error = new Error('Some strange get document error');

      nanoDbMock.get.and.callFake(
        createCallbackRejector(error)
      );

      const returnValue = service.purgeDocument(databaseName, documentId);
      const rejectSpy = jasmine.createSpy('purgeDocument rejected');
      returnValue.catch(rejectSpy);

      PromiseMock.runAll();

      expect(rejectSpy).toHaveBeenCalledWith(error);
    });

    it('should purge already deleted document', () => {
      const service = createPurgeService();
      const databaseName = 'some-database';
      const documentId = 'some-document-id';

      const leafRevisionsBody = createLeafRevisionsBody(documentId, 3, true);
      nanoDbMock.get.and.callFake(createCallbackResolver(leafRevisionsBody));
      nanoDbMock.config.db = databaseName;

      service.purgeDocument(databaseName, documentId);

      PromiseMock.runAll();

      const expectedPurgeBody = createPurgeRequestBodyFromOkResult(leafRevisionsBody[0]);
      expect(nanoAdminMock.request).toHaveBeenCalledWith(
        {
          db: databaseName,
          method: 'post',
          path: '_purge',
          body: expectedPurgeBody
        },
        jasmine.any(Function)
      );
    });

    it('should fail if already deleted document could not be purged due to request error', () => {
      const service = createPurgeService();
      const databaseName = 'some-database';
      const documentId = 'some-document-id';

      const leafRevisionsBody = createLeafRevisionsBody(documentId, 3, true);
      nanoDbMock.get.and.callFake(createCallbackResolver(leafRevisionsBody));
      nanoDbMock.config.db = databaseName;

      const error = new Error('Something went terribly wrong');
      nanoAdminMock.request.and.callFake(createCallbackRejector(error));

      const resultValue = service.purgeDocument(databaseName, documentId);
      const rejectSpy = jasmine.createSpy('purgeDocument reject');
      resultValue.catch(rejectSpy);

      PromiseMock.runAll();

      expect(rejectSpy).toHaveBeenCalledWith(error);
    });

    it('should fail if already deleted document could not be purged due to missing revision', () => {
      const service = createPurgeService();
      const databaseName = 'some-database';
      const documentId = 'some-document-id';

      const leafRevisionsBody = createLeafRevisionsBody(documentId, 3, true);
      nanoDbMock.get.and.callFake(createCallbackResolver(leafRevisionsBody));
      nanoDbMock.config.db = databaseName;

      nanoAdminMock.request.and.callFake(createCallbackResolver({purged: []}));

      const resultValue = service.purgeDocument(databaseName, documentId);
      const rejectSpy = jasmine.createSpy('purgeDocument reject');
      resultValue.catch(rejectSpy);

      PromiseMock.runAll();

      expect(rejectSpy).toHaveBeenCalled();
    });

    it('should delete existing document', () => {
      const service = createPurgeService();
      const databaseName = 'some-database';
      const documentId = 'some-document-id';

      const leafRevisionsBody = createLeafRevisionsBody(documentId, 3, false);
      const latestRevision = `${leafRevisionsBody[0].ok._revisions.start}-${leafRevisionsBody[0].ok._revisions.ids[0]}`;

      nanoDbMock.get.and.callFake(createCallbackResolver(leafRevisionsBody));
      nanoDbMock.config.db = databaseName;

      service.purgeDocument(databaseName, documentId);

      PromiseMock.runAll();

      expect(nanoDbMock.destroy).toHaveBeenCalledWith(
        documentId,
        latestRevision,
        jasmine.any(Function)
      );
    });

    it('should fail if existing document could not be deleted', () => {
      const service = createPurgeService();
      const databaseName = 'some-database';
      const documentId = 'some-document-id';

      const leafRevisionsBody = createLeafRevisionsBody(documentId, 3, false);
      const latestRevision = `${leafRevisionsBody[0].ok._revisions.start}-${leafRevisionsBody[0].ok._revisions.ids[0]}`;

      nanoDbMock.get.and.callFake(createCallbackResolver(leafRevisionsBody));
      nanoDbMock.config.db = databaseName;

      const error = new Error('Something terrible happened. Everybody run!');
      nanoDbMock.destroy.and.callFake(createCallbackRejector(error));

      const resultValue = service.purgeDocument(databaseName, documentId);
      const rejectSpy = jasmine.createSpy('purgeDocument reject');
      resultValue.catch(rejectSpy);

      PromiseMock.runAll();

      expect(rejectSpy).toHaveBeenCalledWith(error);
    });

    it('should purge existing document after it has been deleted', () => {
      const service = createPurgeService();
      const databaseName = 'some-database';
      const documentId = 'some-document-id';

      const leafRevisionsBody = createLeafRevisionsBody(documentId, 3, false);
      const latestRevision = `${leafRevisionsBody[0].ok._revisions.start}-${leafRevisionsBody[0].ok._revisions.ids[0]}`;

      nanoDbMock.get.and.callFake(createCallbackResolver(leafRevisionsBody));
      nanoDbMock.config.db = databaseName;

      const deleteRevision = '123-abcdefg';
      nanoDbMock.destroy.and.callFake(
        createCallbackResolver({
          ok: true,
          id: documentId,
          rev: deleteRevision,
        })
      );

      service.purgeDocument(databaseName, documentId);

      PromiseMock.runAll();

      expect(nanoAdminMock.request).toHaveBeenCalled();
    });

    it('should purge existing document after it has been deleted with added removal revision', () => {
      const service = createPurgeService();
      const databaseName = 'some-database';
      const documentId = 'some-document-id';

      const leafRevisionsBody = createLeafRevisionsBody(documentId, 3, false);
      const latestRevision = `${leafRevisionsBody[0].ok._revisions.start}-${leafRevisionsBody[0].ok._revisions.ids[0]}`;

      nanoDbMock.get.and.callFake(createCallbackResolver(leafRevisionsBody));
      nanoDbMock.config.db = databaseName;

      const deleteRevision = '123-abcdefg';
      nanoDbMock.destroy.and.callFake(
        createCallbackResolver({
          ok: true,
          id: documentId,
          rev: deleteRevision,
        })
      );

      service.purgeDocument(databaseName, documentId);

      PromiseMock.runAll();

      const expectedPurgeBody = createPurgeRequestBodyFromOkResult(leafRevisionsBody[0]);
      expectedPurgeBody[documentId].unshift(deleteRevision);

      expect(nanoAdminMock.request).toHaveBeenCalledWith(
        {
          db: databaseName,
          method: 'post',
          path: '_purge',
          body: expectedPurgeBody
        },
        jasmine.any(Function)
      );
    });

    it('should purge multiple leafs of the same document', () => {
      const service = createPurgeService();
      const databaseName = 'some-database';
      const documentId = 'some-document-id';

      const leafRevisionsBody = createLeafRevisionsBody(documentId, 3, true, 2);
      const latestRevision = `${leafRevisionsBody[0].ok._revisions.start}-${leafRevisionsBody[0].ok._revisions.ids[0]}`;

      nanoDbMock.get.and.callFake(createCallbackResolver(leafRevisionsBody));
      nanoDbMock.config.db = databaseName;

      nanoAdminMock.request.and.callFake(
        createCallbackResolver({purged: [latestRevision]})
      );

      service.purgeDocument(databaseName, documentId);

      PromiseMock.runAll();

      expect(nanoAdminMock.request).toHaveBeenCalledTimes(2);
    });

    it('should resolve after purging is completed', () => {
      const service = createPurgeService();
      const databaseName = 'some-database';
      const documentId = 'some-document-id';

      const leafRevisionsBody = createLeafRevisionsBody(documentId, 3, true);
      const latestRevision = `${leafRevisionsBody[0].ok._revisions.start}-${leafRevisionsBody[0].ok._revisions.ids[0]}`;

      nanoDbMock.get.and.callFake(createCallbackResolver(leafRevisionsBody));
      nanoDbMock.config.db = databaseName;

      nanoAdminMock.request.and.callFake(
        createCallbackResolver({purged: [latestRevision]})
      );

      const returnValue = service.purgeDocument(databaseName, documentId);
      const resolveSpy = jasmine.createSpy('purgeDocument resolve');
      returnValue.then(resolveSpy);
      PromiseMock.runAll();

      expect(resolveSpy).toHaveBeenCalled();
    });

    it('should resolve after deleting and purging is completed', () => {
      const service = createPurgeService();
      const databaseName = 'some-database';
      const documentId = 'some-document-id';

      const leafRevisionsBody = createLeafRevisionsBody(documentId, 3, false);
      const latestRevision = `${leafRevisionsBody[0].ok._revisions.start}-${leafRevisionsBody[0].ok._revisions.ids[0]}`;

      nanoDbMock.get.and.callFake(createCallbackResolver(leafRevisionsBody));
      nanoDbMock.config.db = databaseName;

      const deleteRevision = '123-abcdefg';
      nanoDbMock.destroy.and.callFake(
        createCallbackResolver({
          ok: true,
          id: documentId,
          rev: deleteRevision,
        })
      );

      nanoAdminMock.request.and.callFake(
        createCallbackResolver({purged: [latestRevision]})
      );

      const returnValue = service.purgeDocument(databaseName, documentId);
      const resolveSpy = jasmine.createSpy('purgeDocument resolve');
      returnValue.then(resolveSpy);
      PromiseMock.runAll();

      expect(resolveSpy).toHaveBeenCalled();
    });
  });

  afterEach(() => {
    PromiseMock.uninstall();
  });
});