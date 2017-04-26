import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';

import Common from 'Application/Common/Common';
import LabelingData from 'Application/LabelingData/LabelingData';

import PouchDbViewService from 'Application/Common/Services/PouchDbViewService';
import PouchDbHelper from 'Tests/Support/PouchDb/PouchDbHelper';

import PouchDbLabeledThingGateway from 'Application/LabelingData/Gateways/PouchDbLabeledThingGateway';

import labeledThingCouchDbModel from 'Tests/Fixtures/Models/CouchDb/LabeledThing';
import labeledThingFrontendModel from 'Tests/Fixtures/Models/Frontend/LabeledThing';
import taskFrontendModel from 'Tests/Fixtures/Models/Frontend/Task';

describe('PouchDbLabeledThingGateway', () => {
  let $rootScope;

  /**
   * @type {PouchDbLabeledThingGateway}
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

  beforeEach(done => {
    const featureFlags = {
      pouchdb: true,
    };

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
        const pouchDbContextServiceMock = jasmine.createSpyObj('storageContextService', ['provideContextForTaskId']);
        pouchDbContextServiceMock.provideContextForTaskId
          .and.returnValue(pouchDbHelper.database);

        module($provide => {
          $provide.value('pouchDbContextService', pouchDbContextServiceMock);
        });

        // Clean model fixtures
        delete labeledThingCouchDbModel._rev;
      })
      .then(() => {
        inject($injector => {
          $rootScope = $injector.get('$rootScope');
          gateway = $injector.instantiate(PouchDbLabeledThingGateway);
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
    labeledThingPouchDbModel.incomplete = true;
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
    const db = pouchDbHelper.database;
    Promise.resolve()
      .then(() => {
        return pouchDbHelper.waitForPouchDb(
          $rootScope,
          gateway.saveLabeledThing(labeledThingFrontendModel)
        );
      })
      .then(storedLabeledThing => {
        expect(storedLabeledThing).toEqual(labeledThingFrontendModel);
      })
      .then(() => {
        // Check if document is really stored correctly in the db.
        return db.get(labeledThingCouchDbModel._id);
      })
      .then(loadedLabeledThingDocument => {
        delete loadedLabeledThingDocument._rev;
        expect(loadedLabeledThingDocument).toEqual(labeledThingPouchDbModel);
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
      });
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
      .then(storedLabeledThing => {
        expect(storedLabeledThing).toEqual(changedLabeledThingFrontendModel);
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

  // @TODO: Needs to be implemented as soon as incomplete calculation was moved to the frontend.
  // Currently the incomplete information is not calculated at all.
  xit('should receive the labeled thing incomplete count', done => {
    done();
  });

  afterEach(done => {
    Promise.resolve()
      .then(() => pouchDbHelper.destroy())
      .then(() => done());
  });
});
