import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';

import Common from 'Application/Common/Common';
import LabelingData from 'Application/LabelingData/LabelingData';

import PouchDbHelper from 'Tests/Support/PouchDb/PouchDbHelper';

import PouchDbLabeledThingGateway from 'Application/LabelingData/Gateways/PouchDbLabeledThingGateway';
import LabeledThing from 'Application/LabelingData/Models/LabeledThing';

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

  beforeEach(done => {
    Promise.resolve()
      .then(() => {
        const commonModule = new Common();
        commonModule.registerWithAngular(angular);
        module('AnnoStation.Common');

        const labelingDataModule = new LabelingData();
        labelingDataModule.registerWithAngular(angular);
        module('AnnoStation.LabelingData');
      })
      .then(() => {
        pouchDbHelper = new PouchDbHelper();
        return pouchDbHelper.initialize();
      })
      .then(() => {
        /**
         * @type {StorageContextService}
         */
        const storageContextServiceMock = jasmine.createSpyObj('storageContextService', [
          'provideContextForTaskId'
        ]);
        storageContextServiceMock.provideContextForTaskId
          .and.returnValue(pouchDbHelper.database);

        module($provide => {
          $provide.value('storageContextService', storageContextServiceMock);
        });

        // Clean model fixtures
        delete labeledThingCouchDbModel._rev;
      })
      .then(() => {
        inject($injector => {
          $rootScope = $injector.get('$rootScope');
          gateway = $injector.instantiate(PouchDbLabeledThingGateway);
          revisionManager = $injector.get('revisionManager');
        });
      })
      .then(() => done());
  });

  it('should receive a labeled thing by id', done => {
    const db = pouchDbHelper.database;
    const labeledThingId = labeledThingCouchDbModel._id;
    Promise.resolve()
      .then(() => {
        // Prepare document in database
        db.put(labeledThingCouchDbModel);
      })
      .then(() => {
          return pouchDbHelper.waitForPouchDb(
            $rootScope,
            gateway.getLabeledThing(taskFrontendModel, labeledThingId)
          );
        }
      )
      .then(retrievedLabeledThingDocument => {
        // The revisions can't match of course therefore we inject the newly retrieved revision into the expected model
        expect(retrievedLabeledThingDocument.rev).toBeDefined();
        labeledThingFrontendModel.rev = retrievedLabeledThingDocument.rev;

        expect(retrievedLabeledThingDocument).toEqual(labeledThingFrontendModel);
      })
      .then(() => done());
  });

  xit('should save a labeled thing', done => {
  });

  xit('should delete a labeled thing', done => {
  });

  xit('should receive the labeled thing incomplete count', done => {
  });

  afterEach(done => {
    Promise.resolve()
      .then(() => pouchDbHelper.destroy())
      .then(() => done());
  })
});
