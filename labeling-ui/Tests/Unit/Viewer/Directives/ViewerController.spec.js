import {inject} from 'angular-mocks';
import ViewerController from 'Application/Viewer/Directives/ViewerController';
import GroupToolActionStruct from 'Application/Viewer/Tools/ToolActionStructs/GroupToolActionStruct';

describe('ViewerController tests', () => {
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
  let groupSelectionDialogFactory;

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
    groupSelectionDialogFactory = jasmine.createSpyObj('GroupSelectionDialogFactory', ['createAsync']);
    groupSelectionDialogFactory.createAsync.and.returnValue(angularQ.resolve());
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
      hierarchyCreationService,
      groupSelectionDialogFactory
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
    let thingLayerContext;
    let labelStructureObject;
    let shapes;
    let ltg;
    let ltgif;
    let group;
    let controller;

    beforeEach(() => {
      toolSelectorListener.addListener.and.callFake(callback => {
        groupListener = callback;
      });
    });

    beforeEach(() => {
      thingLayerContext = jasmine.createSpyObj('thingLayerContext', ['withScope']);
      labelStructureObject = {id: 'lso-id'};
      shapes = [{some: 'shape'}];
      ltg = {labeled: 'thing-group'};
      ltgif = {group: 'id', labeledThingGroup: ltg};
      group = jasmine.createSpyObj('PaperGroupRectangleMulti', ['sendToBack', 'select']);
      controller = createController();
    });

    it('does nothing if there are no shapes selected', () => {
      shapeSelectionService.count.and.returnValue(0);

      groupListener();

      expect(shapeSelectionService.getAllShapes).not.toHaveBeenCalled();
      expect(hierarchyCreationService.createLabeledThingGroupInFrameWithHierarchy).not.toHaveBeenCalled();
    });

    describe('group creation', () => {
      beforeEach(() => {
        controller._thingLayerContext = thingLayerContext;
        group.labeledThingGroupInFrame = ltgif;
        thingLayerContext.withScope.and.callFake(callback => callback());
        labeledThingGroupGateway.createLabeledThingGroup.and.returnValue(angularQ.resolve());
        shapeSelectionService.count.and.returnValue(1);
        shapeSelectionService.getAllShapes.and.returnValue(shapes);
        hierarchyCreationService.createLabeledThingGroupInFrameWithHierarchy.and.returnValue(ltgif);
        paperShapeFactory.createPaperGroupShape.and.returnValue(group);
      });

      it('creates a group around the selected shapes if there is at least one selected shape', () => {
        groupListener(null, labelStructureObject);

        expect(hierarchyCreationService.createLabeledThingGroupInFrameWithHierarchy).toHaveBeenCalledWith(jasmine.any(GroupToolActionStruct));
        expect(paperShapeFactory.createPaperGroupShape).toHaveBeenCalledWith(ltgif, shapes);
        expect(group.sendToBack).toHaveBeenCalled();
        expect(thingLayerContext.withScope).toHaveBeenCalled();
        expect(labeledThingGroupGateway.createLabeledThingGroup).toHaveBeenCalledWith(task, ltg);
      });

      it('clears all selected paper shapes and selects the group', () => {
        groupListener(null, labelStructureObject);
        expect(group.select).toHaveBeenCalled();
        expect(shapeSelectionService.clear).toHaveBeenCalled();
      });

      it('sets the group shape as selected paper shape', () => {
        groupListener(null, labelStructureObject);
        expect(controller.selectedPaperShape).toBe(group);
      });

      it('adds the group shape to the known paperGroupShapes', () => {
        groupListener(null, labelStructureObject);
        expect(controller.paperGroupShapes).toEqual([group]);
      });
    });
    describe('group creation multi', () => {
      beforeEach(() => {
        shapes =
        [
          {
            labeledThingInFrame: {
              id: '4711',
              labeledThing: {
                id: 'lt1',
                groupIds: ['1', '2'],
              },
            },
          },
          {
            labeledThingInFrame: {
              id: '4711',
              labeledThing: {
                id: 'lt1',
                groupIds: [],
              },
            },
          },
        ];
        controller._thingLayerContext = thingLayerContext;
        group.labeledThingGroupInFrame = ltgif;
        thingLayerContext.withScope.and.callFake(callback => callback());
        labeledThingGroupGateway.createLabeledThingGroup.and.returnValue(angularQ.resolve());
        shapeSelectionService.count.and.returnValue(1);
        shapeSelectionService.getAllShapes.and.returnValue(shapes);
        hierarchyCreationService.createLabeledThingGroupInFrameWithHierarchy.and.returnValue(ltgif);
        paperShapeFactory.createPaperGroupShape.and.returnValue(group);
      });
      it('creates a group around the selected shapes if there are at least two selected shape', () => {
        groupListener(null, labelStructureObject);

        expect(groupSelectionDialogFactory.createAsync).toHaveBeenCalled();
      });
      it('should provide the dialog factory with the given task', () => {
        groupListener(null, labelStructureObject);

        expect(groupSelectionDialogFactory.createAsync.calls.mostRecent().args[0]).toBe(task);
      });
      it('should provide the dialog factory with the groupIds of the given shape', () => {
        groupListener(null, labelStructureObject);

        expect(groupSelectionDialogFactory.createAsync.calls.mostRecent().args[1]).toEqual(['1', '2']);
      });
    });
  });
});
