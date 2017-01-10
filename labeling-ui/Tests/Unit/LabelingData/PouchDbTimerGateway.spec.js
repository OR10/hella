import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';

import Common from 'Application/Common/Common';
import LabelingData from 'Application/LabelingData/LabelingData';

import PouchDbHelper from 'Tests/Support/PouchDb/PouchDbHelper';

import PouchDbTimerGateway from 'Application/Header/Gateways/TimerGateway';

import taskTimerCouchDbModel from 'Tests/Fixtures/Models/CouchDb/TaskTimer';

describe('PouchDbLabeledThingGateway', () => {
  /**
   * @type {$rootScope}
   */
  let $rootScope; // eslint-disable-line no-unused-vars

  /**
   * @type {PouchDbLabeledThingGateway}
   */
  let gateway; // eslint-disable-line no-unused-vars

  /**
   * @type {RevisionManager}
   */
  let revisionManager; // eslint-disable-line no-unused-vars

  /**
   * @type {PouchDbHelper}
   */
  let pouchDbHelper;

  /**
   * @type {CouchDbModelDeserializer}
   */
  let couchDbModelDeserializer; // eslint-disable-line no-unused-vars

  /**
   * @type {CouchDbModelSerializer}
   */
  let couchDbModelSerializer; // eslint-disable-line no-unused-vars

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
         * @type {PouchDBContextService}
         */
        const pouchDbContextServiceMock = jasmine.createSpyObj('pouchDbContextService', ['provideContextForTaskId']);
        pouchDbContextServiceMock.provideContextForTaskId
          .and.returnValue(pouchDbHelper.database);

        module($provide => {
          $provide.value('pouchDbContextService', pouchDbContextServiceMock);
        });

        // Clean model fixtures
        delete taskTimerCouchDbModel._rev;
      })
      .then(() => {
        inject($injector => {
          $rootScope = $injector.get('$rootScope');
          gateway = $injector.instantiate(PouchDbTimerGateway);
          revisionManager = $injector.get('revisionManager');
          couchDbModelSerializer = $injector.get('couchDbModelSerializer');
          couchDbModelDeserializer = $injector.get('couchDbModelDeserializer');
        });
      })
      .then(() => done());
  });

  xit('should load stored timing from database', done => {
    done();
    // @TODO: Adapt for testcase
    // const db = pouchDbHelper.database;
    // const labeledThingId = labeledThingCouchDbModel._id;
    // Promise.resolve()
    // // Prepare document in database
    //   .then(() => db.put(labeledThingCouchDbModel))
    //   .then(() => {
    //     return pouchDbHelper.waitForPouchDb(
    //       $rootScope,
    //       gateway.getLabeledThing(taskFrontendModel, labeledThingId)
    //     );
    //   })
    //   .then(retrievedLabeledThingDocument => {
    //     expect(retrievedLabeledThingDocument).toEqual(labeledThingFrontendModel);
    //   })
    //   .then(() => done());
  });

  xit('should provide zero timing if database document is not available', done => {
    done();
    // @TODO: Adapt for testcase
    // const db = pouchDbHelper.database;
    // const labeledThingId = labeledThingCouchDbModel._id;
    // Promise.resolve()
    // // Prepare document in database
    //   .then(() => db.put(labeledThingCouchDbModel))
    //   .then(() => {
    //     return pouchDbHelper.waitForPouchDb(
    //       $rootScope,
    //       gateway.getLabeledThing(taskFrontendModel, labeledThingId)
    //     );
    //   })
    //   .then(retrievedLabeledThingDocument => {
    //     expect(retrievedLabeledThingDocument).toEqual(labeledThingFrontendModel);
    //   })
    //   .then(() => done());
  });

  xit('should update a timer in the database', done => {
    done();
  });

  xit('should create new timer if update of a non existent entry is requested', done => {
    done();
  });

  afterEach(done => {
    Promise.resolve()
      .then(() => pouchDbHelper.destroy())
      .then(() => done());
  });
});
