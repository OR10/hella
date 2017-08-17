import {inject} from 'angular-mocks';
import ViewerController from 'Application/Viewer/Directives/ViewerController';
import GroupToolActionStruct from 'Application/Viewer/Tools/ToolActionStructs/GroupToolActionStruct';

fdescribe('ViewerController tests', () => {
  let angularQ;
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
  let imagePreloader;
  let task;
  let shapeSelectionService;
  let toolSelectorListener;
  let hierarchyCreationService;
  let paperShapeFactory;
  let labeledThingGroupGateway;

  // Extend the original class, because there are variables that are implictly set by angular which are already
  // used in the constructor (task e.g.)
  class ViewerControllerTestable extends ViewerController {
  }

  beforeEach(() => {
    task = {
      requiredImageTypes: ['source'],
    };

    ViewerControllerTestable.prototype.task = task;

    ViewerControllerTestable.prototype.video = {
      metaData: {},
    };

    frameLocation = jasmine.createSpyObj(
      'FramePosition',
      [
        'beforeFrameChangeAlways',
        'afterFrameChangeAlways',
        'beforeFrameChangeOnce',
        'afterFrameChangeOnce',
      ]
    );

    ViewerControllerTestable.prototype.framePosition = frameLocation;
  });

  beforeEach(inject(($q, $rootScope) => {
    angularQ = $q;
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
    imagePreloader = jasmine.createSpyObj('ImagePreloader', ['preloadImages']);
    shapeSelectionService = jasmine.createSpyObj('shapeSelectionService', ['count', 'clear', 'getAllShapes']);
    toolSelectorListener = jasmine.createSpyObj('toolSelectorListener', ['addListener']);
    hierarchyCreationService = jasmine.createSpyObj('hierarchyCreationService', ['createLabeledThingGroupInFrameWithHierarchy']);
    paperShapeFactory = jasmine.createSpyObj('paperShapeFactory', ['createPaperGroupShape']);
    labeledThingGroupGateway = jasmine.createSpyObj('labeledThingGroupGateway', ['createLabeledThingGroup']);
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

    const context = jasmine.createSpyObj('PaperContext', ['setup', 'withScope']);
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
      labeledThingGroupGateway,
      null, // entityIdService,
      paperShapeFactory,
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
      pouchDbSyncManager,
      imagePreloader,
      shapeSelectionService,
      toolSelectorListener,
      hierarchyCreationService
    );
  }

  it('can be created', () => {
    const controller = createController();
    expect(controller).toEqual(jasmine.any(ViewerController));
  });

  describe('Events', () => {
    it('framerange:change:after (TTANNO-1923)', () => {
      const debouncedThingOnUpdate = jasmine.createSpyObj('debouncedThingOnUpdate', ['triggerImmediately']);
      debouncedThingOnUpdate.triggerImmediately.and.returnValue(angularQ.resolve());

      debouncerService.multiplexDebounce.and.returnValue(debouncedThingOnUpdate);
      createController();
      rootScope.$emit('framerange:change:after');

      expect(debouncedThingOnUpdate.triggerImmediately).toHaveBeenCalled();
    });
  });

  describe('ImagePreloading', () => {
    it('should call the ImagePreloader once after the viewer is ready', () => {
      let imagePreloaderReadyCallback;
      frameLocation.afterFrameChangeOnce.and.callFake((name, callback) => {
        if (name === 'resumeImagePreloading') {
          imagePreloaderReadyCallback = callback;
        }
      });

      createController();

      expect(frameLocation.afterFrameChangeOnce).toHaveBeenCalled();
      imagePreloaderReadyCallback();
      expect(imagePreloader.preloadImages).toHaveBeenCalledTimes(1);
    });

    it('should call the ImagePreloader with chunksize of 1', () => {
      let imagePreloaderReadyCallback;
      frameLocation.afterFrameChangeOnce.and.callFake((name, callback) => {
        if (name === 'resumeImagePreloading') {
          imagePreloaderReadyCallback = callback;
        }
      });

      createController();
      imagePreloaderReadyCallback();

      expect(imagePreloader.preloadImages).toHaveBeenCalledWith(task, undefined, 1);
    });
  });

  describe('Group Tool Selection', () => {
    let groupListener;

    beforeEach(() => {
      toolSelectorListener.addListener.and.callFake(callback => {
        groupListener = callback;
      });
    });

    it('does nothing if there are no shapes selected', () => {
      shapeSelectionService.count.and.returnValue(0);

      createController();
      groupListener();

      expect(shapeSelectionService.getAllShapes).not.toHaveBeenCalled();
      expect(hierarchyCreationService.createLabeledThingGroupInFrameWithHierarchy).not.toHaveBeenCalled();
    });

    it('creates a group around the selected shapes if there is at least one selected shape', () => {
      const thingLayerContext = jasmine.createSpyObj('thingLayerContext', ['withScope']);
      const labelStructureObject = {id: 'lso-id'};
      const shapes = [{some: 'shape'}];
      const ltg = {labeled: 'thing-group'};
      const ltgif = {group: 'id', labeledThingGroup: ltg};
      const group = jasmine.createSpyObj('PaperGroupRectangleMulti', ['sendToBack', 'select']);
      const controller = createController();

      controller._thingLayerContext = thingLayerContext;
      group.labeledThingGroupInFrame = ltgif;
      thingLayerContext.withScope.and.callFake(callback => callback());
      labeledThingGroupGateway.createLabeledThingGroup.and.returnValue(angularQ.resolve());
      shapeSelectionService.count.and.returnValue(1);
      shapeSelectionService.getAllShapes.and.returnValue(shapes);
      hierarchyCreationService.createLabeledThingGroupInFrameWithHierarchy.and.returnValue(ltgif);
      paperShapeFactory.createPaperGroupShape.and.returnValue(group);


      groupListener(null, labelStructureObject);

      expect(hierarchyCreationService.createLabeledThingGroupInFrameWithHierarchy).toHaveBeenCalledWith(jasmine.any(GroupToolActionStruct));
      expect(paperShapeFactory.createPaperGroupShape).toHaveBeenCalledWith(ltgif, shapes);
      expect(group.sendToBack).toHaveBeenCalled();
      expect(group.select).toHaveBeenCalled();
      expect(shapeSelectionService.clear).toHaveBeenCalled();
      expect(thingLayerContext.withScope).toHaveBeenCalled();
      expect(labeledThingGroupGateway.createLabeledThingGroup).toHaveBeenCalledWith(task, ltg);
      expect(controller.selectedPaperShape).toBe(group);
      expect(controller.paperGroupShapes).toEqual([group]);
    });
  });
});
