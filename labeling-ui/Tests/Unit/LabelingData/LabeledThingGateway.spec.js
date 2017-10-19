import 'jquery';
import angular from 'angular';
import {inject, module} from 'angular-mocks';
import {clone} from 'lodash';

import Common from 'Application/Common/Common';
import LabelingData from 'Application/LabelingData/LabelingData';

import PouchDbHelper from 'Tests/Support/PouchDb/PouchDbHelper';

import LabeledThingGateway from 'Application/LabelingData/Gateways/LabeledThingGateway';

import labeledThingCouchDbModel from 'Tests/Fixtures/Models/CouchDb/LabeledThing';
import labeledThingInFrameCouchDbModel from 'Tests/Fixtures/Models/CouchDb/LabeledThingInFrame';
import labeledThingFrontendModel from 'Tests/Fixtures/Models/Frontend/LabeledThing';
import taskFrontendModel from 'Tests/Fixtures/Models/Frontend/Task';
import LabeledThingGroup from '../../../Application/LabelingData/Models/LabeledThingGroup';
import LabeledThing from '../../../Application/LabelingData/Models/LabeledThing';

describe('LabeledThingGateway', () => {
  let $rootScope;

  let angularQ;

  /**
   * @type {LabeledThingGateway}
   */
  let gateway;

  /**
   * @type {RevisionManager}
   */
  let revisionManager;

  /**
   * @type {PouchDbHelper}
   */
  let pouchDbHelper;

  /**
   * @type {CouchDbModelDeserializer}
   */
  let couchDbModelDeserializer;

  /**
   * @type {CouchDbModelSerializer}
   */
  let couchDbModelSerializer;

  /**
   * @type {Object}
   */
  let labeledThingPouchDbModel;

  /**
   * @type {Object}
   */
  let labeledThingInFramePouchDbModel;

  /**
   * @type {PouchDbContextServiceMock}
   */
  let pouchDbContextServiceMock;

  beforeEach(done => {
    const featureFlags = {};

    Promise.resolve()
      .then(() => {
        const commonModule = new Common();
        commonModule.registerWithAngular(angular, featureFlags);
        module('AnnoStation.Common');

        const labelingDataModule = new LabelingData();
        labelingDataModule.registerWithAngular(angular, featureFlags);
        module('AnnoStation.LabelingData');
      })
      .then(() => {
        pouchDbHelper = new PouchDbHelper();
        return pouchDbHelper.initialize();
      })
      .then(() => pouchDbHelper.installViews())
      .then(() => {
        /**
         * @type {PouchDBContextService}
         */
        pouchDbContextServiceMock = jasmine.createSpyObj('storageContextService', ['provideContextForTaskId']);
        pouchDbContextServiceMock.provideContextForTaskId
          .and.returnValue(pouchDbHelper.database);

        module($provide => {
          $provide.value('pouchDbContextService', pouchDbContextServiceMock);
        });

        // Clean model fixtures
        delete labeledThingCouchDbModel._rev;
        delete labeledThingInFrameCouchDbModel._rev;
      })
      .then(() => {
        inject($injector => {
          $rootScope = $injector.get('$rootScope');
          angularQ = $injector.get('$q');
          gateway = $injector.instantiate(LabeledThingGateway);
          spyOn(gateway._currentUserService, 'get').and.returnValue({id: 'ffa2a4a7f72e5765eb5d1b09d40094e5'});
          revisionManager = $injector.get('revisionManager');
          couchDbModelSerializer = $injector.get('couchDbModelSerializer');
          couchDbModelDeserializer = $injector.get('couchDbModelDeserializer');
        });
      })
      .then(() => done());
  });

  beforeEach(() => {
    // PouchDB updates the incomplete status after saving
    labeledThingPouchDbModel = angular.copy(labeledThingCouchDbModel);
    labeledThingInFramePouchDbModel = angular.copy(labeledThingInFrameCouchDbModel);
  });

  it('should receive a labeled thing by id', done => {
    const db = pouchDbHelper.database;
    const labeledThingId = labeledThingCouchDbModel._id;
    Promise.resolve()
    // Prepare document in database
      .then(() => db.put(labeledThingCouchDbModel))
      .then(() => {
        return pouchDbHelper.waitForPouchDb(
          $rootScope,
          gateway.getLabeledThing(taskFrontendModel, labeledThingId)
        );
      })
      .then(retrievedLabeledThingDocument => {
        expect(retrievedLabeledThingDocument).toEqual(labeledThingFrontendModel);
      })
      .then(() => done());
  });

  it('should fail if a requested labeledThing is not available by id', done => {
    const labeledThingId = 'some-non-existent-labeled-thing-id';
    Promise.resolve()
      .then(() => {
        return pouchDbHelper.waitForPouchDb(
          $rootScope,
          gateway.getLabeledThing(taskFrontendModel, labeledThingId)
        );
      })
      .catch(error => {
        expect(error.status).toBeDefined();
        expect(error.status).toBe(404);
      })
      .then(() => done());
  });

  it('should save a new labeled thing', done => {
    // By default now a LT without any LTIF is incomplete (TTANNO-1924)
    const incompleteLabeledThingFrontendModel = clone(labeledThingFrontendModel);
    const expectedIncompleteLabeledThingFrontendModel = clone(labeledThingFrontendModel);
    const incompleteLabeledThingPouchDbModel = clone(labeledThingPouchDbModel);
    incompleteLabeledThingFrontendModel.incomplete = true;
    incompleteLabeledThingPouchDbModel.incomplete = true;
    expectedIncompleteLabeledThingFrontendModel.incomplete = true;
    spyOn(incompleteLabeledThingFrontendModel, '_getCurrentDate').and.returnValue('2017-09-05 16:11:56.000000');

    const db = pouchDbHelper.database;
    Promise.resolve()
      .then(() => {
        return pouchDbHelper.waitForPouchDb(
          $rootScope,
          gateway.saveLabeledThing(incompleteLabeledThingFrontendModel)
        );
      })
      .then(storedLabeledThing => {
        expect(storedLabeledThing).toEqual(expectedIncompleteLabeledThingFrontendModel);
      })
      .then(() => {
        // Check if document is really stored correctly in the db.
        return db.get(labeledThingCouchDbModel._id);
      })
      .then(loadedLabeledThingDocument => {
        delete loadedLabeledThingDocument._rev;
        expect(loadedLabeledThingDocument).toEqual(incompleteLabeledThingPouchDbModel);
      })
      .then(() => done());
  });

  it('should update an existing labeled thing', done => {
    const db = pouchDbHelper.database;
    const changedLabeledThingCouchDbModel = Object.assign(
      {},
      angular.copy(labeledThingCouchDbModel),
      {
        frameRange: {
          startFrameIndex: 0,
          endFrameIndex: 100,
        },
        lineColor: '42',
        // By default now a LT without any LTIF is incomplete (TTANNO-1924)
        incomplete: true,
      }
    );
    const changedLabeledThingFrontendModel = couchDbModelDeserializer.deserializeLabeledThing(
      changedLabeledThingCouchDbModel,
      taskFrontendModel
    );

    const expectedChangedLabeledThingFrontendModel = clone(changedLabeledThingFrontendModel);
    spyOn(changedLabeledThingFrontendModel, '_getCurrentDate').and.returnValue('2017-09-05 16:11:56.000000');

    Promise.resolve()
    // Prepare document in database
      .then(() => db.put(labeledThingCouchDbModel))
      .then(response => revisionManager.extractRevision(response))
      .then(() => {
        return pouchDbHelper.waitForPouchDb(
          $rootScope,
          gateway.saveLabeledThing(changedLabeledThingFrontendModel)
        );
      })
      .then(storedLabeledThing => {
        expect(storedLabeledThing).toEqual(expectedChangedLabeledThingFrontendModel);
      })
      // Check if document is really stored correctly in the db.
      .then(() => db.get(changedLabeledThingCouchDbModel._id))
      .then(loadedLabeledThingDocument => {
        delete loadedLabeledThingDocument._rev;
        expect(loadedLabeledThingDocument).toEqual(couchDbModelSerializer.serialize(changedLabeledThingFrontendModel));
      })
      .then(() => done());
  });

  it('should update revision in manager once a new labeled thing is saved', done => {
    const db = pouchDbHelper.database;
    Promise.resolve()
      .then(() => {
        expect(() => revisionManager.getRevision(labeledThingCouchDbModel._id)).toThrow();
      })
      .then(() => {
        return pouchDbHelper.waitForPouchDb(
          $rootScope,
          gateway.saveLabeledThing(labeledThingFrontendModel)
        );
      })
      .then(() => {
        // Check if document is really stored correctly in the db.
        return db.get(labeledThingCouchDbModel._id);
      })
      .then(loadedLabeledThingDocument => {
        expect(revisionManager.getRevision(labeledThingCouchDbModel._id)).toEqual(loadedLabeledThingDocument._rev);
      })
      .then(() => done());
  });

  it('should update revision in manager once an updated labeled thing is saved', done => {
    const db = pouchDbHelper.database;
    const changedLabeledThingCouchDbModel = Object.assign(
      {},
      angular.copy(labeledThingCouchDbModel),
      {
        frameRange: {
          startFrameIndex: 0,
          endFrameIndex: 100,
        },
        lineColor: '42',
      }
    );
    const changedLabeledThingFrontendModel = couchDbModelDeserializer.deserializeLabeledThing(
      changedLabeledThingCouchDbModel,
      taskFrontendModel
    );

    Promise.resolve()
    // Prepare document in database
      .then(() => db.put(labeledThingCouchDbModel))
      .then(response => revisionManager.extractRevision(response))
      .then(() => {
        return pouchDbHelper.waitForPouchDb(
          $rootScope,
          gateway.saveLabeledThing(changedLabeledThingFrontendModel)
        );
      })
      .then(() => db.get(changedLabeledThingCouchDbModel._id))
      .then(loadedLabeledThingDocument => {
        expect(revisionManager.getRevision(changedLabeledThingCouchDbModel._id)).toEqual(loadedLabeledThingDocument._rev);
      })
      .then(() => done());
  });

  it('should delete a labeled thing', done => {
    const db = pouchDbHelper.database;
    const labeledThingId = labeledThingCouchDbModel._id;
    Promise.resolve()
    // Prepare document in database
      .then(() => db.put(labeledThingCouchDbModel))
      .then(response => revisionManager.extractRevision(response))
      .then(() => {
        return pouchDbHelper.waitForPouchDb(
          $rootScope,
          gateway.deleteLabeledThing(labeledThingFrontendModel)
        );
      })
      .then(status => {
        expect(status).toBeTruthy();
      })
      // Ensure the document is really gone
      .then(() => db.get(labeledThingId))
      .catch(error => {
        expect(error.status).toBeDefined();
        expect(error.status).toEqual(404);
        expect(error.reason).toBeDefined();
        expect(error.reason).toEqual('deleted');
      })
      .then(() => done());
  });

  it('should delete a labeled thing and all corresponding ltif', done => {
    const db = pouchDbHelper.database;
    const labeledThingId = labeledThingPouchDbModel._id;
    const labeledThingInFrameId = labeledThingInFramePouchDbModel._id;
    Promise.resolve()
    // Prepare document in database
      .then(() => db.put(labeledThingPouchDbModel))
      .then(response => revisionManager.extractRevision(response))
      .then(() => db.put(labeledThingInFramePouchDbModel))
      .then(response => revisionManager.extractRevision(response))
      .then()
      .then(() => {
        return pouchDbHelper.waitForPouchDb(
          $rootScope,
          gateway.deleteLabeledThing(labeledThingFrontendModel)
        );
      })
      .then(status => {
        expect(status).toBeTruthy();
      })
      // Ensure the document is really gone
      .then(() => db.get(labeledThingId))
      .catch(error => {
        expect(error.status).toBeDefined();
        expect(error.status).toEqual(404);
        expect(error.reason).toBeDefined();
        expect(error.reason).toEqual('deleted');
      })
      .then(() => db.get(labeledThingInFrameId))
      .catch(error => {
        expect(error.status).toBeDefined();
        expect(error.status).toEqual(404);
        expect(error.reason).toBeDefined();
        expect(error.reason).toEqual('deleted');
      })
      .then(() => done());
  });

  it('should resolve promise after lt and ltif has been deleted', () => {
    const pouchDbMock = jasmine.createSpyObj('PouchDB', ['query', 'bulkDocs', 'remove']);
    pouchDbContextServiceMock.provideContextForTaskId
      .and.returnValue(pouchDbMock);

    pouchDbMock.query.and.returnValue(angularQ.resolve({
      rows: [],
    }));

    const bulkDocsDeferred = angularQ.defer();
    pouchDbMock.bulkDocs.and.returnValue(bulkDocsDeferred.promise);

    const removeDeferred = angularQ.defer();
    pouchDbMock.remove.and.returnValue(removeDeferred.promise);

    const returnValue = gateway.deleteLabeledThing(labeledThingFrontendModel);
    const resolveSpy = jasmine.createSpy('promise resolved');
    returnValue.then(resolveSpy);

    $rootScope.$apply();

    expect(resolveSpy).not.toHaveBeenCalled();

    removeDeferred.resolve(); // lt removal
    $rootScope.$apply();

    expect(resolveSpy).not.toHaveBeenCalled();

    expect(pouchDbMock.bulkDocs).toHaveBeenCalled();

    bulkDocsDeferred.resolve(); // ltif removal
    $rootScope.$apply();

    expect(resolveSpy).toHaveBeenCalled();
  });

  it('should resolve promise after lt and ltif has been deleted in reverse order', () => {
    const pouchDbMock = jasmine.createSpyObj('PouchDB', ['query', 'bulkDocs', 'remove']);
    pouchDbContextServiceMock.provideContextForTaskId
      .and.returnValue(pouchDbMock);

    pouchDbMock.query.and.returnValue(angularQ.resolve({
      rows: [],
    }));

    const bulkDocsDeferred = angularQ.defer();
    pouchDbMock.bulkDocs.and.returnValue(bulkDocsDeferred.promise);

    const removeDeferred = angularQ.defer();
    pouchDbMock.remove.and.returnValue(removeDeferred.promise);

    const returnValue = gateway.deleteLabeledThing(labeledThingFrontendModel);
    const resolveSpy = jasmine.createSpy('promise resolved');
    returnValue.then(resolveSpy);

    $rootScope.$apply();

    expect(resolveSpy).not.toHaveBeenCalled();

    bulkDocsDeferred.resolve(); // ltif removal
    $rootScope.$apply();

    expect(resolveSpy).not.toHaveBeenCalled();

    expect(pouchDbMock.bulkDocs).toHaveBeenCalled();

    removeDeferred.resolve(); // lt removal
    $rootScope.$apply();

    expect(resolveSpy).toHaveBeenCalled();
  });

  it('should assign labeled things to a labeled thing group', () => {
    const task = taskFrontendModel;

    spyOn(gateway, '_saveLabeledThingWithoutPackagingExecutor').and.callThrough();

    const labeledThingGroup = new LabeledThingGroup({
      id: 'LABELED-THING-GROUP-ID',
      task,
      groupType: 'extension-sign-group',
      lineColor: 1,
      groupIds: [],
    });

    const labeledThing = new LabeledThing({
      id: 'LABELED-THING-ID',
      frameRange: {
        startFrameIndex: 0,
        endFrameIndex: 3,
      },
      groupIds: [],
      classes: ['foo', 'bar', 'baz'],
      incomplete: false,
      lineColor: 8,
      task,
    });

    const labeledThingCalled = new LabeledThing({
      id: 'LABELED-THING-ID',
      frameRange: {
        startFrameIndex: 0,
        endFrameIndex: 3,
      },
      groupIds: ['LABELED-THING-GROUP-ID'],
      classes: ['foo', 'bar', 'baz'],
      incomplete: false,
      taskId: 'TASK-ID',
      projectId: 'PROJECT-ID',
      lineColor: 8,
      task,
    });

    gateway.assignLabeledThingsToLabeledThingGroup([labeledThing], labeledThingGroup);

    $rootScope.$apply();

    const storedLabeledThing = gateway._saveLabeledThingWithoutPackagingExecutor.calls.mostRecent().args[0];
    const storedLabeledThingDocument = storedLabeledThing.toJSON();
    delete storedLabeledThingDocument.createdAt;
    delete storedLabeledThingDocument.lastModifiedAt;

    const labeledThingCalledDocument = labeledThingCalled.toJSON();
    delete labeledThingCalledDocument.createdAt;
    delete labeledThingCalledDocument.lastModifiedAt;

    expect(storedLabeledThingDocument).toEqual(labeledThingCalledDocument);
  });

  it('should unassign labeled things from a labeled thing group', () => {
    const task = taskFrontendModel;

    spyOn(gateway, '_saveLabeledThingWithoutPackagingExecutor').and.callThrough();

    const labeledThingGroup = new LabeledThingGroup({
      id: 'LABELED-THING-GROUP-ID',
      task,
      groupType: 'extension-sign-group',
      lineColor: 1,
      groupIds: [],
    });

    const labeledThing = new LabeledThing({
      id: 'LABELED-THING-ID',
      frameRange: {
        startFrameIndex: 0,
        endFrameIndex: 3,
      },
      groupIds: ['LABELED-THING-GROUP-ID'],
      classes: ['foo', 'bar', 'baz'],
      incomplete: false,
      lineColor: 8,
      task,
    });

    const labeledThingCalled = new LabeledThing({
      id: 'LABELED-THING-ID',
      frameRange: {
        startFrameIndex: 0,
        endFrameIndex: 3,
      },
      groupIds: [],
      classes: ['foo', 'bar', 'baz'],
      incomplete: false,
      lineColor: 8,
      task,
    });

    gateway.unassignLabeledThingGroupFromLabeledThings([labeledThing], labeledThingGroup);

    $rootScope.$apply();

    const storedLabeledThing = gateway._saveLabeledThingWithoutPackagingExecutor.calls.mostRecent().args[0];
    const storedLabeledThingDocument = storedLabeledThing.toJSON();
    delete storedLabeledThingDocument.createdAt;
    delete storedLabeledThingDocument.lastModifiedAt;

    const labeledThingCalledDocument = labeledThingCalled.toJSON();
    delete labeledThingCalledDocument.createdAt;
    delete labeledThingCalledDocument.lastModifiedAt;

    expect(storedLabeledThingDocument).toEqual(labeledThingCalledDocument);
  });

  afterEach(done => {
    Promise.resolve()
      .then(() => pouchDbHelper.destroy())
      .then(() => done());
  });
});
