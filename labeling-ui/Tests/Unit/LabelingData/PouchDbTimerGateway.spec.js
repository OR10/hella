import PouchDbTimerGateway from 'Application/Header/Gateways/PouchDbTimerGateway';
import angular from 'angular';
import {inject} from 'angular-mocks';

fdescribe('PouchDbTimerGateway Test suite', () => {
  /**
   * @type {PouchDbContextService}
   */
  let pouchDbContextServiceMock;

  /**
   * @type {PackagingExecutor}
   */
  let packagingExecutorMock;

  /**
   * @type {RevisionManager}
   */
  let revisionManagerMock;

  /**
   * @type {CouchDbModelDeserializer}
   */
  let couchDbModelDeserializer;

  /**
   * @type {angular.$q}
   */
  let qMock;

  /**
   * @type {angular.$rootScope}
   */
  let rootScope;

  /**
   * @type {PouchDbTimerGateway}
   */
  let gateway;

  /**
   * @type {Object}
   */
  let pouchTimerDocument;

  /**
   * @type {PouchDb}
   */
  let pouchDbMock;

  function setupSuccessfulPouchFetchQuery() {
    pouchTimerDocument = {
      type: 'AppBundle.Model.TaskTimer',
      taskId: '',
      projectId: '',
      userId: '',
      timeInSeconds: {
        labeling: 0,
      },
    };

    const pouchResponse = {
      rows: [{doc: pouchTimerDocument}, {doc: {}}],
    };
    pouchDbMock.query.and.returnValue(qMock.resolve(pouchResponse));
  }

  function setupEmptyPouchFetchQuery() {
    const pouchResponse = {
      rows: [],
    };
    pouchDbMock.query.and.returnValue(qMock.resolve(pouchResponse));
  }

  beforeEach(inject(($q, $rootScope) => {
    qMock = $q;
    rootScope = $rootScope;
  }));

  beforeEach(() => {
    pouchDbMock = jasmine.createSpyObj('PouchDb', ['post', 'put', 'query']);
  });

  beforeEach(() => {
    pouchDbContextServiceMock = jasmine.createSpyObj('PouchDbContextService', ['provideContextForTaskId']);
    pouchDbContextServiceMock.provideContextForTaskId.and.returnValue(pouchDbMock);
    packagingExecutorMock = jasmine.createSpyObj('PackagingExecutor', ['execute']);
    packagingExecutorMock.execute.and.callFake((queueIdentifier, callback) => {
      return callback();
    });
    revisionManagerMock = jasmine.createSpyObj('RevisionManager', ['extractRevision', 'injectRevision']);
    couchDbModelDeserializer = jasmine.createSpyObj('CouchDbModelDeserializer', ['deserializeTimer']);
    const pouchDbViewServiceMock = jasmine.createSpyObj('PouchDbViewService', ['get']);

    gateway = new PouchDbTimerGateway(
      pouchDbContextServiceMock,
      packagingExecutorMock,
      couchDbModelDeserializer,
      revisionManagerMock,
      pouchDbViewServiceMock,
      qMock
    );
  });

  it('can be instantiated', () => {
    expect(gateway).toEqual(jasmine.any(PouchDbTimerGateway));
  });

  describe('createTimerDocument()', () => {
    it('gets the pouch instance from the context service', () => {
      const task = {id: 'Bluth'};

      gateway.createTimerDocument({}, task, {});

      expect(pouchDbContextServiceMock.provideContextForTaskId).toHaveBeenCalledWith(task.id);
    });

    it('creates the timer document with the given ids', (done) => {
      const project = {id: 'George'};
      const task = {id: 'Michael'};
      const user = {id: 'Bluth'};
      const expectedDocument = {
        type: 'AppBundle.Model.TaskTimer',
        taskId: task.id,
        projectId: project.id,
        userId: user.id,
        timeInSeconds: {
          labeling: 0,
        },
      };

      packagingExecutorMock.execute.and.callFake((queueIdentifier, callback) => {
        callback();
        expect(queueIdentifier).toEqual('timer');
        expect(pouchDbMock.post).toHaveBeenCalledWith(expectedDocument);
        done();
      });

      gateway.createTimerDocument(project, task, user);
    });

    it('returns whatever the packacking executor returns', () => {
      const packagingExecutorReturn = {};
      packagingExecutorMock.execute.and.returnValue(packagingExecutorReturn);

      const actual = gateway.createTimerDocument({}, {}, {});

      expect(actual).toBe(packagingExecutorReturn);
    });
  });

  describe('readOrCreateTimerIfMissingWithIdentification()', () => {
    const project = {id: 'Game'};
    const task = {id: 'of'};
    const user = {id: 'Thrones'};
    let timerDocument;

    beforeEach(() => {
      timerDocument = {
        type: 'AppBundle.Model.TaskTimer',
        taskId: task.id,
        projectId: project.id,
        userId: user.id,
        timeInSeconds: {
          labeling: 0,
        },
      };
    });

    it('Creates a new Timer Document and passes it to the revision manager if no timer document is available yet', done => {
      setupEmptyPouchFetchQuery();

      const document = gateway.readOrCreateTimerIfMissingWithIdentification(project, task, user);
      document.then(timerDocument => {
        expect(timerDocument).toEqual(timerDocument);
        expect(revisionManagerMock.extractRevision).toHaveBeenCalledWith(timerDocument);
        done();

      });

      rootScope.$apply();
    });

    it('returns the Pouch Document and passes it to the revision manager', done => {
      setupSuccessfulPouchFetchQuery();
      spyOn(gateway, 'createTimerDocument');

      const document = gateway.readOrCreateTimerIfMissingWithIdentification(project, task, user);
      document.then(timerDocument => {
        expect(timerDocument).toEqual(timerDocument);
        expect(revisionManagerMock.extractRevision).toHaveBeenCalledWith(timerDocument);
        expect(gateway.createTimerDocument).not.toHaveBeenCalled();
        done();

      });

      rootScope.$apply();
    });
  });

  describe('getTime()', () => {
    it('runs the Timer Document through the timer deserializer', () => {
      const phase = {foo: 'bar'};
      const task = jasmine.createSpyObj('task', ['getPhase']);
      task.getPhase.and.returnValue(phase);
      setupSuccessfulPouchFetchQuery();

      gateway.getTime(task, {});
      rootScope.$apply();

      expect(couchDbModelDeserializer.deserializeTimer).toHaveBeenCalledWith(pouchTimerDocument, phase);
    });
  });

  describe('updateTime()', () => {
    const phase = 'some-phase';
    const time = 9038434;

    let task;
    let expectedTimerDocument;

    beforeEach(() => {
      task = jasmine.createSpyObj('task', ['getPhase']);
      task.getPhase.and.returnValue(phase);

      expectedTimerDocument = angular.copy(pouchTimerDocument);
      expectedTimerDocument.timeInSeconds[phase] = time;

      setupSuccessfulPouchFetchQuery();
    });


    it('updates the Timer Document with the given time', () => {
      gateway.updateTime(task, {}, time);
      rootScope.$apply();

      expect(pouchDbMock.put).toHaveBeenCalledWith(expectedTimerDocument);
    });

    it('injects the revision using the revision manager', () => {
      gateway.updateTime(task, {}, time);
      rootScope.$apply();

      expect(revisionManagerMock.injectRevision).toHaveBeenCalledWith(expectedTimerDocument);
    });

    it('extracts the revision based on the response of the put request', () => {
      const putResponse = 'blasfdsf';
      pouchDbMock.put.and.returnValue(putResponse);

      gateway.updateTime(task, {}, time);
      rootScope.$apply();

      expect(revisionManagerMock.extractRevision).toHaveBeenCalledWith(putResponse);
    });
  });
});