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
  let groupCreationService;
  let lockService;
  let abortablePromise;
  let labeledThingInFrameGateway;
  let thingLayerScopeView;

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
    abortablePromise = angularQ.resolve();
    abortablePromise.aborted = () => {};
    abortablePromise.then = () => abortablePromise;

    debouncerService = jasmine.createSpyObj('debouncerService', ['multiplexDebounce']);
    const debouncedThingOnUpdate = jasmine.createSpyObj('debouncedThingOnUpdate', ['triggerImmediately']);
    debouncedThingOnUpdate.triggerImmediately.and.returnValue(angularQ.resolve());
    debouncerService.multiplexDebounce.and.returnValue(debouncedThingOnUpdate);
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
    labeledThingGroupGateway = jasmine.createSpyObj('labeledThingGroupGateway', ['createLabeledThingGroup', 'assignLabeledThingsToLabeledThingGroup', 'getLabeledThingGroupsInFrameForFrameIndex']);
    groupCreationService = jasmine.createSpyObj('groupCreationService', ['showGroupSelector']);
    lockService = jasmine.createSpyObj('lockService', ['acquire']);
    labeledThingInFrameGateway = jasmine.createSpyObj('labeledThingInFrameGateway', ['listLabeledThingInFrame', 'getLabeledThingInFrame']);
    thingLayerScopeView = jasmine.createSpyObj('thinglayer.withScope().view', ['update']);
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

    groupCreationService.showGroupSelector.and.returnValue(angularQ.resolve());
    frameLocationGateway.getFrameLocations.and.returnValue(abortablePromise);
    labeledThingInFrameGateway.listLabeledThingInFrame.and.returnValue(abortablePromise);
    labeledThingInFrameGateway.getLabeledThingInFrame.and.returnValue(abortablePromise);
    labeledThingGroupGateway.getLabeledThingGroupsInFrameForFrameIndex.and.returnValue(abortablePromise);
  });

  function createController() {
    const controller = new ViewerControllerTestable(
      scope,
      rootScope,
      element,
      window,
      null, // $injector,
      drawingContextService,
      frameLocationGateway,
      null, // frameGateway,
      labeledThingInFrameGateway,
      labeledThingGroupGateway,
      null, // entityIdService,
      paperShapeFactory,
      null, // applicationConfig,
      null, // $interval,
      null, // labeledThingGateway,
      null, // abortablePromiseFactory,
      animationFrameService,
      angularQ,
      null, // entityColorService,
      null, // logger,
      null, // $timeout,
      applicationState,
      lockService,
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
      groupCreationService,
    );

    controller.framePosition.lock = lockService;

    return controller;
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
    let lt;
    let ltif;
    let ltg;
    let ltgif;
    let group;
    let controller;
    let thingLayerScope;

    beforeEach(() => {
      toolSelectorListener.addListener.and.callFake(callback => {
        groupListener = callback;
      });

      animationFrameService.debounce.and.returnValue(() => {});
    });

    beforeEach(() => {
      thingLayerContext = jasmine.createSpyObj('thingLayerContext', ['withScope']);
      labelStructureObject = {id: 'lso-id'};
      lt = { id: 'labeled-thing-id', groupIds: [] };
      ltif = { labeledThing: lt };
      shapes = [{some: 'shape', labeledThingInFrame: ltif }];
      ltg = {id: 'labeled-thing-group', labeled: 'thing-group'};
      ltgif = {group: 'id', labeledThingGroup: ltg};
      group = jasmine.createSpyObj('PaperGroupRectangleMulti', ['sendToBack', 'select', 'update']);
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
        thingLayerScope = {view: thingLayerScopeView};
        thingLayerContext.withScope.and.callFake(callback => callback(thingLayerScope));
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
        expect(groupCreationService.showGroupSelector).toHaveBeenCalled();
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

      describe('storing the group', () => {
        let selectedGroup;
        let showGroupSelectorPromise;
        let createLabeledThingGroupPromise;
        let assignLtToLtgPromise;

        beforeEach(() => {
          selectedGroup = { id: 'selected-group-id' };
          showGroupSelectorPromise = angularQ.resolve(selectedGroup);
          createLabeledThingGroupPromise = angularQ.resolve(ltg);
          assignLtToLtgPromise = angularQ.resolve();

          spyOn(rootScope, '$emit');
          groupCreationService.showGroupSelector.and.returnValue(showGroupSelectorPromise);
          labeledThingGroupGateway.createLabeledThingGroup.and.returnValue(createLabeledThingGroupPromise);
          labeledThingGroupGateway.assignLabeledThingsToLabeledThingGroup.and.returnValue(assignLtToLtgPromise);
          scope.vm = { filters: { filters: [] } };
          group.labeledThingInFrame = ltif;
        });

        it('stores the group after showing the group selector', () => {
          groupListener(null, labelStructureObject);
          scope.$apply();

          expect(labeledThingGroupGateway.createLabeledThingGroup).toHaveBeenCalledWith(task, ltg);
          expect(labeledThingGroupGateway.assignLabeledThingsToLabeledThingGroup).toHaveBeenCalledWith([lt], ltg);
          expect(rootScope.$emit).toHaveBeenCalledWith('shape:add:after', group);
        });

        it('updates the group and the view after storing the group', () => {
          groupListener(null, labelStructureObject);
          scope.$apply();

          expect(group.update).toHaveBeenCalled();
          expect(thingLayerScopeView.update).toHaveBeenCalled();
        });
      });
    });
  });
});
