import {inject} from 'angular-mocks';
import ViewerController from 'Application/Viewer/Directives/ViewerController';
import GroupToolActionStruct from 'Application/Viewer/Tools/ToolActionStructs/GroupToolActionStruct';
import PaperMeasurementRectangle from '../../../../Application/Viewer/Shapes/PaperMeasurementRectangle';
import PaperGroupRectangleMulti from '../../../../Application/Viewer/Shapes/PaperGroupRectangleMulti';
import GroupNameService from '../../../../Application/Viewer/Services/GroupNameService';
import TaskFixture from '../../../Fixtures/Models/Frontend/Task';
import paper from 'paper';

describe('ViewerController tests', () => {
  let angularQ;
  let rootScope;
  let scope;
  let debouncerService;
  let frameIndexService;
  let modalService;
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
  let groupSelectionDialogFactory;
  let groupCreationService;
  let lockService;
  let abortablePromise;
  let labeledThingGroupGateway;
  let labeledThingInFrameGateway;
  let thingLayerScopeView;
  let labeledThingGateway;
  let inProgressService;
  let pouchDbContextService;
  let rootScopeEventRegistrationService;

  // Extend the original class, because there are variables that are implictly set by angular which are already
  // used in the constructor (task e.g.)
  class ViewerControllerTestable extends ViewerController {
  }

  function setupPaperJs() {
    const canvas = document.createElement('canvas');
    paper.setup(canvas);
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
    abortablePromise.aborted = () => {
    };
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
    modalService = jasmine.createSpyObj('modalService', ['show', 'info']);
    frameLocationGateway = jasmine.createSpyObj('frameLocationGateway', ['getFrameLocations']);
    drawingContextService = jasmine.createSpyObj('drawingContextService', ['createContext']);
    animationFrameService = jasmine.createSpyObj('animationFrameService', ['debounce']);
    window = jasmine.createSpyObj('$window', ['addEventListener', 'removeEventListener']);
    window.document = jasmine.createSpyObj('window.document', ['addEventListener']);
    keyboardShortcutService = jasmine.createSpyObj('keyboardShortcutService', ['addHotkey']);
    pouchDbSyncManager = jasmine.createSpyObj('pouchDbSyncManager', ['on', 'stopReplicationsForContext']);
    applicationState = jasmine.createSpyObj('applicationState', ['$watch']);
    imagePreloader = jasmine.createSpyObj('ImagePreloader', ['preloadImages']);
    shapeSelectionService = jasmine.createSpyObj('shapeSelectionService', ['count', 'clear', 'getAllShapes', 'getSelectedShape']);
    toolSelectorListener = jasmine.createSpyObj('toolSelectorListener', ['addListener', 'removeAllListeners']);
    hierarchyCreationService = jasmine.createSpyObj(
      'hierarchyCreationService',
      ['createLabeledThingGroupInFrameWithHierarchy']
    );
    paperShapeFactory = jasmine.createSpyObj('paperShapeFactory', ['createPaperGroupShape']);
    groupSelectionDialogFactory = jasmine.createSpyObj('GroupSelectionDialogFactory', ['createAsync']);
    groupSelectionDialogFactory.createAsync.and.returnValue(angularQ.resolve());
    labeledThingGroupGateway = jasmine.createSpyObj(
      'labeledThingGroupGateway',
      ['createLabeledThingGroup', 'assignLabeledThingsToLabeledThingGroup', 'getLabeledThingGroupsInFrameForFrameIndex']
    );
    groupCreationService = jasmine.createSpyObj('groupCreationService', ['showGroupSelector']);
    lockService = jasmine.createSpyObj('lockService', ['acquire']);
    labeledThingInFrameGateway = jasmine.createSpyObj(
      'labeledThingInFrameGateway',
      ['listLabeledThingInFrame', 'getLabeledThingInFrame']
    );
    thingLayerScopeView = jasmine.createSpyObj('thinglayer.withScope().view', ['update']);
    labeledThingGateway = jasmine.createSpyObj('LabeledThingGateway', ['assignLabeledThingsToLabeledThingGroup']);
    inProgressService = jasmine.createSpyObj('inProgressService', ['start', 'end']);
    pouchDbContextService = jasmine.createSpyObj('PouchDbContextService', ['provideContextForTaskId']);

    let registeredRootEvents = [];
    rootScopeEventRegistrationService = jasmine.createSpyObj(
      'RootScopeEventRegistrationService',
      ['register', 'deregister']
    );

    rootScopeEventRegistrationService.register.and.callFake(
      (identifier, event, handler) => registeredRootEvents.push(
        rootScope.$on(event, handler)
      )
    );
    rootScopeEventRegistrationService.deregister.and.callFake(
      () => {
        registeredRootEvents.forEach(deregister => deregister());
        registeredRootEvents = [];
      }
    );
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
      labeledThingGateway,
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
      modalService, // modalService,
      null, // $state,
      viewerMouseCursorService,
      null, // labeledThingGroupService,
      inProgressService,
      pouchDbSyncManager,
      imagePreloader,
      shapeSelectionService,
      toolSelectorListener,
      hierarchyCreationService,
      groupCreationService,
      groupSelectionDialogFactory,
      null,
      null,
      pouchDbContextService,
      rootScopeEventRegistrationService
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
      toolSelectorListener.addListener.and.callFake((callback, type) => {
        if (type === 'group-rectangle') {
          groupListener = callback;
        }
      });

      animationFrameService.debounce.and.returnValue(() => {
      });
    });

    beforeEach(() => {
      thingLayerContext = jasmine.createSpyObj('thingLayerContext', ['withScope']);
      labelStructureObject = {id: 'lso-id'};
      lt = {id: 'labeled-thing-id', groupIds: []};
      ltif = {labeledThing: lt};
      shapes = [{some: 'shape', labeledThingInFrame: ltif}];
      ltg = {id: 'labeled-thing-group', labeled: 'thing-group'};
      ltgif = {group: 'id', labeledThingGroup: ltg};
      group = jasmine.createSpyObj('PaperGroupRectangleMulti', ['sendToBack', 'select', 'update']);
      controller = createController();
    });

    it('does nothing if there are no shapes selected', () => {
      shapeSelectionService.count.and.returnValue(0);
      shapeSelectionService.getAllShapes.and.returnValue([]);

      groupListener();

      expect(hierarchyCreationService.createLabeledThingGroupInFrameWithHierarchy).not.toHaveBeenCalled();
    });

    it('does nothing if there is a group selected', () => {
      setupPaperJs();

      const paperGroupRectangleMulti = new PaperGroupRectangleMulti(new GroupNameService(), null, null, [], null);

      shapeSelectionService.getAllShapes.and.returnValue([paperGroupRectangleMulti]);
      shapeSelectionService.count.and.returnValue(0);

      groupListener();

      expect(hierarchyCreationService.createLabeledThingGroupInFrameWithHierarchy).not.toHaveBeenCalled();
    });

    it('does nothing if there is a measurement rectangle selected', () => {
      setupPaperJs();
      const topLeft = {x: 1, y: 1};
      const bottomRight = {x: 200, y: 200};
      const color = {primary: 'yellow', secondary: 'black'};
      const entityIdService = jasmine.createSpyObj('EntityIdService', ['getUniqueId']);
      const measurementRectangle = new PaperMeasurementRectangle(
        TaskFixture.clone(),
        'foobar',
        topLeft,
        bottomRight,
        color,
        entityIdService
      );

      shapeSelectionService.getAllShapes.and.returnValue([measurementRectangle]);
      shapeSelectionService.count.and.returnValue(0);

      groupListener();

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

        expect(hierarchyCreationService.createLabeledThingGroupInFrameWithHierarchy)
          .toHaveBeenCalledWith(jasmine.any(GroupToolActionStruct));
        expect(paperShapeFactory.createPaperGroupShape).toHaveBeenCalledWith(ltgif, shapes, undefined);
        expect(group.sendToBack).toHaveBeenCalled();
        expect(thingLayerContext.withScope).toHaveBeenCalled();
        expect(groupCreationService.showGroupSelector).toHaveBeenCalled();
      });

      it('clears all selected paper shapes', () => {
        groupListener(null, labelStructureObject);
        expect(shapeSelectionService.clear).toHaveBeenCalled();
      });

      it('does not directly select the group', () => {
        groupListener(null, labelStructureObject);
        expect(controller.selectedPaperShape).toBe(null);
      });

      it('adds the group shape to the known paperGroupShapes', () => {
        groupListener(null, labelStructureObject);
        expect(controller.paperGroupShapes).toEqual([group]);
      });

      it('does nothing in readOnly mode', () => {
        controller.readOnly = true;
        groupListener(null, labelStructureObject);
        expect(controller.paperGroupShapes).toEqual([]);
      });

      describe('storing the group', () => {
        let selectedGroup;
        let showGroupSelectorPromise;
        let createLabeledThingGroupPromise;
        let assignLtToLtgPromise;

        beforeEach(() => {
          selectedGroup = {id: 'selected-group-id'};
          showGroupSelectorPromise = angularQ.resolve(selectedGroup);
          createLabeledThingGroupPromise = angularQ.resolve(ltg);
          assignLtToLtgPromise = angularQ.resolve();

          spyOn(rootScope, '$emit');
          groupCreationService.showGroupSelector.and.returnValue(showGroupSelectorPromise);
          labeledThingGroupGateway.createLabeledThingGroup.and.returnValue(createLabeledThingGroupPromise);
          labeledThingGateway.assignLabeledThingsToLabeledThingGroup.and.returnValue(assignLtToLtgPromise);
          scope.vm = {filters: {filters: []}};
          group.labeledThingInFrame = ltif;
        });

        it('stores the group after showing the group selector', () => {
          groupListener(null, labelStructureObject);
          scope.$apply();

          expect(labeledThingGroupGateway.createLabeledThingGroup).toHaveBeenCalledWith(task, ltg);
          expect(labeledThingGateway.assignLabeledThingsToLabeledThingGroup).toHaveBeenCalledWith([lt], ltg);
          expect(rootScope.$emit).toHaveBeenCalledWith('shape:add:after', group);
        });

        it('updates the group and the view after storing the group', () => {
          groupListener(null, labelStructureObject);
          scope.$apply();

          expect(group.update).toHaveBeenCalled();
          expect(thingLayerScopeView.update).toHaveBeenCalled();
        });

        it('should select the group after storage', () => {
          groupListener(null, labelStructureObject);
          scope.$apply();

          expect(controller.selectedPaperShape).toBe(group);
        });

        it('sets the current frame position as bookmarkedFrameIndex', () => {
          groupListener(null, labelStructureObject);
          scope.$apply();

          expect(controller.bookmarkedFrameIndex).toEqual(controller.framePosition.position);
        });
      });
    });

    describe('group creation multi', () => {
      beforeEach(() => {
        shapes = [
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

  describe('Tool selection (TTANNO-2052)', () => {
    let toolSelectionListener;

    beforeEach(() => {
      toolSelectorListener.addListener.and.callFake((callback, type) => {
        if (type === undefined) {
          toolSelectionListener = callback;
        }
      });
    });

    it('clears the selection if the labeledStructureObject has changed', () => {
      const newLabelStructureObject = {};
      const oldLabelStructureObject = {};

      createController();
      toolSelectionListener(null, newLabelStructureObject, oldLabelStructureObject);

      expect(shapeSelectionService.clear).toHaveBeenCalled();
    });

    it('does not the selection if the labeledStructureObject has not changed', () => {
      const newLabelStructureObject = {};

      createController();
      toolSelectionListener(null, newLabelStructureObject, newLabelStructureObject);

      expect(shapeSelectionService.clear).not.toHaveBeenCalled();
    });
  });

  describe('scope destroy', () => {
    it('removes all tool selector listeners', () => {
      createController();

      scope.$emit('$destroy');

      expect(toolSelectorListener.removeAllListeners).toHaveBeenCalled();
    });

    it('removes the window listeners', () => {
      createController();

      scope.$emit('$destroy');

      expect(window.removeEventListener).toHaveBeenCalledWith('resize', undefined);
      expect(window.removeEventListener).toHaveBeenCalledWith('visibilitychange', jasmine.any(Function));
    });
  });

  describe('unauthorized access', () => {
    it('stop replication', () => {
      createController();

      scope.$emit('pouchdb:replication:unauthorized');

      expect(pouchDbSyncManager.stopReplicationsForContext).toHaveBeenCalled();
    });
  });
});
