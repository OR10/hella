import ViewerTitleBarController from 'Application/Header/Directives/ViewerTitleBarController';

describe('ViewerTitleBarController tests', () => {
  let rootScope;
  let scope;
  let frameIndexService;

  beforeEach(inject(($rootScope) => {
    rootScope = $rootScope;
    scope = $rootScope.$new();
  }));

  function createController() {
    frameIndexService = jasmine.createSpyObj('frameIndexService', ['getFrameNumberLimits']);

    return new ViewerTitleBarController(
      null, // $timeout
      scope, // $scope
      rootScope, // $rootScope
      null, // $state
      null, // $q
      null, // modalService
      null, // applicationState
      null, // taskGateway
      null, // labeledThingGateway
      null, // labeledThingInFrameGateway
      null, // labeledFrameGateway
      frameIndexService, // frameIndexService
      null, // pouchDbSyncManager
      null, // pouchDbContextService
      null, // applicationLoadingMaskService
      null, // imageCache
    );
  }

  it('can be created', () => {
    const controller = createController();
    expect(controller).toEqual(jasmine.any(ViewerTitleBarController));
  });

  describe('Events', () => {
    describe('framerange:change:after (TTANNO-1923)', () => {
      it('refreshes the incomplete count', () => {
        const controller = createController();
        spyOn(controller, 'refreshIncompleteCount');

        rootScope.$emit('framerange:change:after');

        expect(controller.refreshIncompleteCount).toHaveBeenCalled();
      });
    });
  });
});