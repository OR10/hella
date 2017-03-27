import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';

import Common from 'Application/Common/Common';
import LabelingData from 'Application/LabelingData/LabelingData';

import PouchDbHelper from 'Tests/Support/PouchDb/PouchDbHelper';
import LabeledThing from '../../../Application/LabelingData/Models/LabeledThing';
import InterpolationService from "../../../Application/LabelingData/Services/InterpolationService";

// import PouchDbTimerGateway from 'Application/Header/Gateways/TimerGateway';

// import taskTimerCouchDbModel from 'Tests/Fixtures/Models/CouchDb/TaskTimer';

fdescribe('PouchDbInterpolation', () => {
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
  
  let interpolationService;
  
  
  function createLabeledThing(startFrameIndex = 0, endFrameIndex = 99, task = {id: 'some-task-id'}, id = 'some-labeled-thing-id') {
    return new LabeledThing({
      id,
      task,
      classes: [],
      incomplete: false,
      frameRange: {startFrameIndex, endFrameIndex},
    });
  }

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
        // delete taskTimerCouchDbModel._rev;
      })
      .then(() => {
        inject($injector => {
          $rootScope = $injector.get('$rootScope');
          // gateway = $injector.instantiate(PouchDbTimerGateway);
          revisionManager = $injector.get('revisionManager');
          couchDbModelSerializer = $injector.get('couchDbModelSerializer');
          couchDbModelDeserializer = $injector.get('couchDbModelDeserializer');
          // interpolationService = $injector.instantiate(MockedCouchDBInterpolation);
        });
      })
      .then(() => done());
  });

  it('should interpolate something', done => {
    const db = pouchDbHelper.database;
    const task = {id: 'some-task-id'};
    const labeledThingId = 'some-labeled-thing-id';
    const labeledThing = createLabeledThing(0, 200, task, labeledThingId);
    expect(db).not.toBeNull();
    expect(labeledThing).not.toBeNull();
    // expect(interpolationService).not.toBeNull();
    done();
  });

  afterEach(done => {
    Promise.resolve()
      .then(() => pouchDbHelper.destroy())
      .then(() => done());
  });
});
