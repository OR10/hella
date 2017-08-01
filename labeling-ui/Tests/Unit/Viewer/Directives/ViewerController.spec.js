import ViewerController from 'Application/Viewer/Directives/ViewerController';

class ViewerControllerTestable extends ViewerController {

}
ViewerControllerTestable.prototype.task = {
  requiredImageTypes: ['source'],
};

ViewerControllerTestable.prototype.video = {
  metaData: {},
};

ViewerControllerTestable.prototype.framePosition = {
  beforeFrameChangeAlways: () => {},
  afterFrameChangeAlways: () => {},
  afterFrameChangeOnce: () => {},
};

fdescribe('ViewerController tests', () => {
  let rootScope;
  let scope;

  beforeEach(inject(($rootScope) => {
    rootScope = $rootScope;
    scope = $rootScope.$new();
  }));

  it('can be created', () => {
    const viewerMouseCursorService = jasmine.createSpyObj('viewerMouseCursorService', ['on']);
    const debouncerService = jasmine.createSpyObj('debouncerService', ['multiplexDebounce']);
    const element = {
      0: {},
      find: () => {
        return {
          0: {
            addEventListener: () => {}
          },
          on: () => {},
        }
      }
    };
    const frameIndexLimits = {upperLimit: 0, lowerLimit: 1};
    const frameIndexService = jasmine.createSpyObj('frameIndexService', ['getFrameIndexLimits']);
    const frameLocationGateway = jasmine.createSpyObj('frameLocationGateway', ['getFrameLocations']);
    const drawingContextService = jasmine.createSpyObj('drawingContextService', ['createContext']);
    const animationFrameService = jasmine.createSpyObj('animationFrameService', ['debounce']);
    const window = jasmine.createSpyObj('$window', ['addEventListener']);
    window.document = jasmine.createSpyObj('window.document', ['addEventListener']);
    const keyboardShortcutService = jasmine.createSpyObj('keyboardShortcutService', ['addHotkey']);
    const pouchDbSyncManager = jasmine.createSpyObj('pouchDbSyncManager', ['on']);
    const applicationState = jasmine.createSpyObj('applicationState', ['$watch']);

    frameIndexService.getFrameIndexLimits.and.returnValue(frameIndexLimits);
    const context = {
      setup: () => {},
      withScope: () => {},
    };
    drawingContextService.createContext.and.returnValue(context);

    const controller = new ViewerControllerTestable(
      scope,
      rootScope,
      element,
      window,
      null, // $injector,
      drawingContextService,
      frameLocationGateway,
      null, // frameGateway,
      null, // labeledThingInFrameGateway,
      null, // labeledThingGroupGateway,
      null, // entityIdService,
      null, // paperShapeFactory,
      null, // applicationConfig,
      null, // $interval,
      null, // labeledThingGateway,
      null, // abortablePromiseFactory,
      animationFrameService,
      null, // $q,
      null, // entityColorService,
      null, // logger,
      null, // $timeout,
      applicationState,
      null, // lockService,
      keyboardShortcutService,
      null, // toolService,
      debouncerService,
      frameIndexService,
      null, // modalService,
      null, // $state,
      viewerMouseCursorService,
      null, // labeledThingGroupService,
      null, // inProgressService,
      pouchDbSyncManager
    );
    expect(controller).toEqual(jasmine.any(ViewerController));
  });
});