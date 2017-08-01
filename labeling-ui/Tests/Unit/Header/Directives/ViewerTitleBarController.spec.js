import ViewerTitleBarController from 'Application/Header/Directives/ViewerTitleBarController';

fdescribe('ViewerTitleBarController tests', () => {
  let rootScope;
  let scope;
  let frameIndexService;

  beforeEach(inject(($rootScope) => {
    rootScope = $rootScope;
    scope = $rootScope.$new();
  }));

  it('can be created', () => {
    frameIndexService = jasmine.createSpyObj('frameIndexService', ['getFrameNumberLimits']);

    const controller = new ViewerTitleBarController(
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
    expect(controller).toEqual(jasmine.any(ViewerTitleBarController));
  });
});