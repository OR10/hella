import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';

import Common from 'Application/Common/Common';
import LabelingData from 'Application/LabelingData/LabelingData';

import PouchDbHelper from 'Tests/Support/PouchDb/PouchDbHelper';
import LabeledThing from 'Application/LabelingData/Models/LabeledThing';
import LinearBackendInterpolation from 'Application/LabelingData/Interpolations/LinearBackendInterpolation'
import InterpolationService from "Application/LabelingData/Services/InterpolationService";
import TaskModule from "Application/Task/TaskModule";
import OrganisationModule from "Application/Organisation/Organisation";
// import PouchDbTimerGateway from 'Application/Header/Gateways/TimerGateway';

// import taskTimerCouchDbModel from 'Tests/Fixtures/Models/CouchDb/TaskTimer';

fdescribe('PouchDbInterpolation', () => {
  let pouchDbHelper;
  let injector;
  let rootScope;
  let angularQ;
  let httpBackend;
  
  const featureFlags = { pouchdb: true };
  const appConfig = {Common: {backendPrefix: '', apiPrefix: ''}};
  let pouchDbContextService;
  let interpolationService;
  
  beforeEach(() => {
    const commonModule = new Common();
    commonModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.Common');
    
    const labelingDataModule = new LabelingData();
    labelingDataModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.LabelingData');
    
    const applicationTaskModule = new TaskModule();
    applicationTaskModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.Task');
  
    const orgaModule = new OrganisationModule();
    orgaModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.Organisation');
  });
  beforeEach(() => {
    const app = angular.module('AnnoStation.Common');
    app.constant('featureFlags', featureFlags);
    app.constant('applicationConfig', appConfig);
  });
  
  beforeEach(done => {
    Promise.resolve()
      .then(() => {
        pouchDbHelper = new PouchDbHelper();
        return pouchDbHelper.initialize();
      })
      .then(() => done());
  });
  beforeEach(() => {
    const pouchDbContextServiceMock = jasmine.createSpyObj('pouchDbContextService', ['provideContextForTaskId', 'queryTaskIdForContext']);
    pouchDbContextServiceMock.provideContextForTaskId.and.returnValue(pouchDbHelper.database);
    pouchDbContextServiceMock.queryTaskIdForContext.and.returnValue('some-task-id');
    
    module($provide => {
       $provide.value('pouchDbContextService', pouchDbContextServiceMock);
    });
    inject(($injector, $rootScope, $q, $httpBackend) => {
      injector = $injector;
      rootScope = $rootScope;
      angularQ = $q;
      httpBackend = $httpBackend;
    
      interpolationService = injector.instantiate(InterpolationService);
    
    });
  });
  
  function createLabeledThing(startFrameIndex = 0, endFrameIndex = 99, task = {id: 'some-task-id'}, id = 'some-labeled-thing-id') {
    return new LabeledThing({
      id,
      task,
      classes: [],
      incomplete: false,
      frameRange: {startFrameIndex, endFrameIndex},
    });
  }
  
  it('should be able to instantiate without non injected arguments', () => {
    expect(interpolationService instanceof InterpolationService).toEqual(true);
  });
  
  it('It doesnt throw when interpolating', () => {
    const db = pouchDbHelper.database;
    const task = {id: 'some-task-id'};
    const labeledThingId = 'some-labeled-thing-id';
    const labeledThing = createLabeledThing(0, 200, task, labeledThingId);
    httpBackend.expectGET('/task/some-task-id/replication').respond(500);
    function throwWrapper() {
      interpolationService.interpolate('default', task, labeledThing);
      rootScope.$apply();
    }
    throwWrapper();
    expect(throwWrapper).not.toThrow();
    httpBackend.flush();
  });
  afterEach(done => {
    Promise.resolve()
      .then(() => pouchDbHelper.destroy())
      .then(() => done());
  });
});
