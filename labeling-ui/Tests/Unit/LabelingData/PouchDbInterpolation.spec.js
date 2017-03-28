import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';

import Common from 'Application/Common/Common';
import LabelingData from 'Application/LabelingData/LabelingData';

import PouchDbHelper from 'Tests/Support/PouchDb/PouchDbHelper';
import LabeledThing from '../../../Application/LabelingData/Models/LabeledThing';
import LinearBackendInterpolation from '../../../Application/LabelingData/Interpolations/LinearBackendInterpolation'
import InterpolationService from "../../../Application/LabelingData/Services/InterpolationService";

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
  
  beforeEach(done => {
    featureFlags = {
      pouchdb: true,
    };

    Promise.resolve()
      .then(() => {
        pouchDbHelper = new PouchDbHelper();
        return pouchDbHelper.initialize();
      })
      .then(() => {
        const commonModule = new Common();
        commonModule.registerWithAngular(angular, featureFlags);
        module('AnnoStation.Common');
      
        const pouchDbContextServiceMock = jasmine.createSpyObj('pouchDbContextService', ['provideContextForTaskId']);
        pouchDbContextServiceMock.provideContextForTaskId
          .and.returnValue(pouchDbHelper.database);

        module($provide => {
          $provide.value('pouchDbContextService', pouchDbContextServiceMock);
          labeledThingGateway = jasmine.createSpyObj('labeledThingGateway', ['']);
          
          cache = jasmine.createSpy('cacheService');
          cache.container = jasmine.createSpyObj('container', ['invalidate']);
          
          cacheHeater = jasmine.createSpy('cacheHeaterService');
  
          pouchDbSyncManager = jasmine.createSpy('pouchDbSyncManager');
  
          pouchDbContextService = jasmine.createSpy('pouchDbContextService');
          interpolations = jasmine.createSpy('linearBackendInterpolation')
          
        });
      })
      .then(() => {
        inject(($injector, $rootScope, $q) => {
          injector = $injector;
          rootScope = $rootScope;
          angularQ = $q;
        });
      })
      .then(() => done());
  });
  
  function createInterpolationServiceInstance() {
    return new InterpolationService(angularQ, labeledThingGateway, cache, cacheHeater, featureFlags, pouchDbSyncManager, pouchDbContextService, interpolations);
  }
  function createLabeledThing(startFrameIndex = 0, endFrameIndex = 99, task = {id: 'some-task-id'}, id = 'some-labeled-thing-id') {
    return new LabeledThing({
      id,
      task,
      classes: [],
      incomplete: false,
      frameRange: {startFrameIndex, endFrameIndex},
    });
  }
  
  it('should interpolate something', done => {
    const db = pouchDbHelper.database;
    const task = {id: 'some-task-id'};
    const labeledThingId = 'some-labeled-thing-id';
    const labeledThing = createLabeledThing(0, 200, task, labeledThingId);
    expect(db).not.toBeNull();
    expect(labeledThing).not.toBeNull();
    const ips = createInterpolationServiceInstance();
    expect(ips).not.toBeNull();
    ips.interpolate('default', task, labeledThing);
    
    // expect(interpolationService).not.toBeNull();
    done();
  });

  afterEach(done => {
    Promise.resolve()
      .then(() => pouchDbHelper.destroy())
      .then(() => done());
  });
});
