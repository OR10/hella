import ViewerController from 'Application/Viewer/Directives/ViewerController';

// Extend the original class, because there are variables that are implictly set by angular which are already
// used in the constructor (task e.g.)
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

describe('ViewerController tests', () => {
  let rootScope;
  let scope;
  let debouncerService;

  beforeEach(inject(($rootScope) => {
    rootScope = $rootScope;
    scope = $rootScope.$new();
  }));

  beforeEach(() => {
    debouncerService = jasmine.createSpyObj('debouncerService', ['multiplexDebounce']);
  });

  function createController() {
    const viewerMouseCursorService = jasmine.createSpyObj('viewerMouseCursorService', ['on']);
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

    return new ViewerControllerTestable(
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
  }

  it('can be created', () => {
    const controller = createController();
    expect(controller).toEqual(jasmine.any(ViewerController));
  });

  describe('Events', () => {
    it('framerange:change:after (TTANNO-1923)', () => {
      const debouncedThingOnUpdate = jasmine.createSpyObj('debouncedThingOnUpdate', ['triggerImmediately']);
      debouncedThingOnUpdate.triggerImmediately.and.returnValue({ then: () => {} });

      debouncerService.multiplexDebounce.and.returnValue(debouncedThingOnUpdate);
      const controller = createController();

      rootScope.$emit('framerange:change:after');

      expect(debouncedThingOnUpdate.triggerImmediately).toHaveBeenCalled();
    });
  });
});