// import 'jquery';
// import {module, inject} from 'angular-mocks';
//
// import Common from 'Application/Common/Common';
// import LabelingData from 'Application/LabelingData/LabelingData';
//
// import PouchDbHelper from 'Tests/Support/PouchDb/PouchDbHelper';
//
// import PouchDbLabeledThingInFrameGateway from 'Application/LabelingData/Gateways/PouchDbLabeledThingInFrameGateway';

describe('PouchDbLabeledThingInFrameGateway', () => {
  // let $rootScope;
  //
  // /**
  //  * @type {PouchDbLabeledThingInFrameGateway}
  //  */
  // let gateway;
  //
  // /**
  //  * @type {RevisionManager}
  //  */
  // let revisionManager;
  //
  // /**
  //  * @type {PouchDbHelper}
  //  */
  // let pouchDbHelper;
  //
  // /**
  //  * @type {CouchDbModelDeserializer}
  //  */
  // let couchDbModelDeserializer;
  //
  // /**
  //  * @type {CouchDbModelSerializer}
  //  */
  // let couchDbModelSerializer;
  //
  // beforeEach(done => {
  //   const featureFlags = {
  //     pouchdb: true,
  //   };
  //
  //   Promise.resolve()
  //     .then(() => {
  //       const commonModule = new Common();
  //       commonModule.registerWithAngular(angular, featureFlags);
  //       module('AnnoStation.Common');
  //
  //       const labelingDataModule = new LabelingData();
  //       labelingDataModule.registerWithAngular(angular, featureFlags);
  //       module('AnnoStation.LabelingData');
  //     })
  //     .then(() => {
  //       pouchDbHelper = new PouchDbHelper();
  //       return pouchDbHelper.initialize();
  //     })
  //     .then(() => pouchDbHelper.installViews())
  //     .then(() => {
  //       /**
  //        * @type {PouchDBContextService}
  //        */
  //       const pouchDbContextServiceMock = jasmine.createSpyObj('storageContextService', ['provideContextForTaskId']);
  //       pouchDbContextServiceMock.provideContextForTaskId
  //         .and.returnValue(pouchDbHelper.database);
  //
  //       module($provide => {
  //         $provide.value('pouchDbContextService', pouchDbContextServiceMock);
  //       });
  //     })
  //     .then(() => {
  //       inject($injector => {
  //         $rootScope = $injector.get('$rootScope');
  //         gateway = $injector.instantiate(PouchDbLabeledThingInFrameGateway);
  //         revisionManager = $injector.get('revisionManager');
  //         couchDbModelSerializer = $injector.get('couchDbModelSerializer');
  //         couchDbModelDeserializer = $injector.get('couchDbModelDeserializer');
  //       });
  //     })
  //     .then(() => done());
  // });
  //
  // it('should be able to be instantiated', () => {
  //   expect(gateway).toBeDefined();
  //   expect(gateway instanceof PouchDbLabeledThingInFrameGateway).toBeTruthy();
  // });
});
