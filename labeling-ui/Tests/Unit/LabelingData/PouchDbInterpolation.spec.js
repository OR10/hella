import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';

import Common from 'Application/Common/Common';
import LabelingData from 'Application/LabelingData/LabelingData';

import PouchDbHelper from 'Tests/Support/PouchDb/PouchDbHelper';
import LabeledThing from 'Application/LabelingData/Models/LabeledThing';
import LinearBackendInterpolation from 'Application/LabelingData/Interpolations/LinearBackendInterpolation'
import InterpolationService from "Application/LabelingData/Services/InterpolationService";

// import PouchDbTimerGateway from 'Application/Header/Gateways/TimerGateway';

// import taskTimerCouchDbModel from 'Tests/Fixtures/Models/CouchDb/TaskTimer';

fdescribe('PouchDbInterpolation', () => {
  let pouchDbHelper;
  let injector;
  let rootScope;
  let angularQ;
  
  let labeledThingGateway;
  let cache;
  let cacheHeater;
  let featureFlags;
  let pouchDbSyncManager;
  let pouchDbContextService;
  let interpolations;
  let interpolationService;
  let containerMock;
  
  beforeEach(done => {
    Promise.resolve()
        .then(() => {
          pouchDbHelper = new PouchDbHelper();
          return pouchDbHelper.initialize();
        })
        .then(() => done());
    
  });
  beforeEach(() => {
    featureFlags = {
      pouchdb: true,
    };
    
    const labelingDataModule = new LabelingData();
    labelingDataModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.LabelingData');
  
    const pouchDbContextServiceMock = jasmine.createSpyObj('pouchDbContextService', ['provideContextForTaskId']);
    pouchDbContextServiceMock.provideContextForTaskId.and.returnValue(pouchDbHelper.database);
  
    module($provide => {
       $provide.value('pouchDbContextService', pouchDbContextServiceMock);
       //labeledThingGateway = jasmine.createSpy('labeledThingGateway');
    });
    inject(($injector, $rootScope, $q) => {
      injector = $injector;
      rootScope = $rootScope;
      angularQ = $q;
    
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
  
  fit('should be able to instantiate without non injected arguments', () => {
    expect(interpolationService instanceof InterpolationService).toEqual(true);
  });
  
  
  it('should interpolate something',() => {
    const db = pouchDbHelper.database;
    const task = {id: 'some-task-id'};
    const labeledThingId = 'some-labeled-thing-id';
    const labeledThing = createLabeledThing(0, 200, task, labeledThingId);
    expect(db).not.toBeNull();
    expect(labeledThing).not.toBeNull();
    
    expect(interpolationService).not.toBeNull();
    interpolationService.interpolate('default', task, labeledThing);
    rootScope.$apply();
  });

  afterEach(done => {
    Promise.resolve()
      .then(() => pouchDbHelper.destroy())
      .then(() => done());
  });
});
