import {inject} from 'angular-mocks';
import ViewerController from 'Application/Viewer/Directives/ViewerController';

describe('ViewerController tests', () => {
  let rootScope;
  let scope;
  let debouncerService;
  let frameIndexService;
  let frameLocationGateway;
  let drawingContextService;
  let animationFrameService;
  let window;
  let keyboardShortcutService;
  let pouchDbSyncManager;
  let applicationState;
  let viewerMouseCursorService;
  let element;
  let frameLocation;

  // Extend the original class, because there are variables that are implictly set by angular which are already
  // used in the constructor (task e.g.)
  class ViewerControllerTestable extends ViewerController {}

  beforeEach(() => {
    ViewerControllerTestable.prototype.task = {
      requiredImageTypes: ['source'],
    };

    ViewerControllerTestable.prototype.video = {
      metaData: {},
    };

    frameLocation = jasmine.createSpyObj(
      'FramePosition',
      [
        'beforeFrameChangeAlways',
        'afterFrameChangeAlways',
        'beforeFrameChangeOnce',
        'afterFrameChangeOnce'
      ]
    );

    ViewerControllerTestable.prototype.framePosition = frameLocation;
  });

  beforeEach(inject($rootScope => {
    rootScope = $rootScope;
    scope = $rootScope.$new();
  }));

  beforeEach(() => {
    debouncerService = jasmine.createSpyObj('debouncerService', ['multiplexDebounce']);
  });

  beforeEach(() => {
    viewerMouseCursorService = jasmine.createSpyObj('viewerMouseCursorService', ['on']);
    element = jasmine.createSpyObj('element', ['find']);
    frameIndexService = jasmine.createSpyObj('frameIndexService', ['getFrameIndexLimits']);
    frameLocationGateway = jasmine.createSpyObj('frameLocationGateway', ['getFrameLocations']);
    drawingContextService = jasmine.createSpyObj('drawingContextService', ['createContext']);
    animationFrameService = jasmine.createSpyObj('animationFrameService', ['debounce']);
    window = jasmine.createSpyObj('$window', ['addEventListener']);
    window.document = jasmine.createSpyObj('window.document', ['addEventListener']);
    keyboardShortcutService = jasmine.createSpyObj('keyboardShortcutService', ['addHotkey']);
    pouchDbSyncManager = jasmine.createSpyObj('pouchDbSyncManager', ['on']);
    applicationState = jasmine.createSpyObj('applicationState', ['$watch']);
  });

  beforeEach(() => {
    element[0] = {};
    element.find.and.returnValue({
      0: {
        addEventListener: () => {
        },
      },
      on: () => {
      },
    });

    const frameIndexLimits = {upperLimit: 0, lowerLimit: 1};
    frameIndexService.getFrameIndexLimits.and.returnValue(frameIndexLimits);

    const context = {
      setup: () => {
      }, withScope: () => {
      }
    };
    drawingContextService.createContext.and.returnValue(context);
  });

  function createController() {
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
      debouncedThingOnUpdate.triggerImmediately.and.returnValue({
        then: () => {
        }
      });

      debouncerService.multiplexDebounce.and.returnValue(debouncedThingOnUpdate);
      createController();
      rootScope.$emit('framerange:change:after');

      expect(debouncedThingOnUpdate.triggerImmediately).toHaveBeenCalled();
    });
  });
});
