import {inject} from 'angular-mocks';
import InterpolationService from 'Application/LabelingData/Services/InterpolationService';

describe('Interpolation with PouchDB', () => {
  let interpolationService;
  let firstInterpolation;
  let interpolations;

  let pouchDbContextServiceMock;
  let pouchDBSyncManagerMock;

  function createInterpolationService() {
    interpolationService = new InterpolationService(null, null,pouchDBSyncManagerMock, pouchDbContextServiceMock, interpolations);
  }

  beforeEach(() => {
    firstInterpolation = jasmine.createSpyObj('firstInterpolation', ['execute']);
    firstInterpolation.execute.and.returnValue({then: () => {}});

    interpolations = firstInterpolation;
  });

  it('It can be instantiate', () => {
    createInterpolationService();
    expect(interpolationService).toEqual(jasmine.any(InterpolationService));
  });

  describe('interpolate()', () => {
    const labeledThing = {id: 'thing-id', task: {id: 'some-task-id'}};
    const frameRange = {startFrameIndex: 17, endFrameIndex: 18};
    const task = {id: 'task-id'};

    let rootScope;
    let angularQ;

    beforeEach(inject(($rootScope, $q) => {
      rootScope = $rootScope;
      angularQ = $q;
    }));

    describe('pouchDB interpolation', () => {
      let pouchDbMock;

      beforeEach(() => {
        pouchDbMock = {};

        pouchDbContextServiceMock = jasmine.createSpyObj('pouchDbContextService', ['provideContextForTaskId']);
        pouchDbContextServiceMock.provideContextForTaskId.and.returnValue(pouchDbMock);

        pouchDBSyncManagerMock = jasmine.createSpyObj('pouchDBSyncManagerMock', [
          'stopReplicationsForContext',
          'pushUpdatesForContext',
          'pullUpdatesForContext',
          'startDuplexLiveReplication',
        ]);
        pouchDBSyncManagerMock.stopReplicationsForContext.and.returnValue(angularQ.resolve());
        pouchDBSyncManagerMock.pushUpdatesForContext.and.returnValue(angularQ.resolve());
        pouchDBSyncManagerMock.pullUpdatesForContext.and.returnValue(angularQ.resolve());
        pouchDBSyncManagerMock.startDuplexLiveReplication.and.returnValue(angularQ.resolve());

        firstInterpolation.execute.and.returnValue(angularQ.resolve());
      });

      it('calls the context service with correct parameter', () => {
        createInterpolationService();
        interpolationService.interpolate(task, labeledThing, frameRange);

        expect(pouchDbContextServiceMock.provideContextForTaskId).toHaveBeenCalledWith(task.id);
      });

      it('calls the SyncManager correctly', () => {
        createInterpolationService();
        interpolationService.interpolate(task, labeledThing, frameRange);
        rootScope.$apply();

        expect(pouchDBSyncManagerMock.stopReplicationsForContext).toHaveBeenCalledWith(pouchDbMock);
        expect(pouchDBSyncManagerMock.pushUpdatesForContext).toHaveBeenCalledWith(pouchDbMock);
        expect(pouchDBSyncManagerMock.pullUpdatesForContext).toHaveBeenCalledWith(pouchDbMock);
        expect(pouchDBSyncManagerMock.startDuplexLiveReplication).toHaveBeenCalledWith(pouchDbMock);
      });
    });
  });
});
