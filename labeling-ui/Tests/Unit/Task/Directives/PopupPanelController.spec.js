import {inject} from 'angular-mocks';
import PopupPanelController from 'Application/Task/Directives/PopupPanelController';
import AbortablePromise from 'Application/Common/Support/AbortablePromise';

const taskMock = {
  requiredImageTypes: ['source'],
};

const framePositionMock = {
  position: 0,
  afterFrameChangeOnce: jasmine.createSpy('framePosition.afterFrameChangeOnce()'),
  goto: jasmine.createSpy('framePosition.goto'),
};

class PopupPanelControllerTestable extends PopupPanelController {
}

PopupPanelControllerTestable.prototype.task = taskMock;
PopupPanelControllerTestable.prototype.framePosition = framePositionMock;

describe('PopupPanelController', () => {
  /**
   * @type {PopupPanelController}
   */
  let controller;
  let element;
  let scope;
  let rootScope;
  let angularQ;
  let context;
  let drawingContextService;
  let drawingScope;
  let animationFrameService;
  let window;
  let resizeDebounced;
  let shapeSelectionService;
  let shapeInboxService;
  let frameLocationGateway;
  let labelStructureService;
  let labelStructure;
  let shapeMergeService;
  let applicationState;
  let rootScopeEventRegistrationService;
  let ghostBustListener;

  function createAbortablePromise(inputPromise) {
    return new AbortablePromise(angularQ, inputPromise, angularQ.defer());
  }

  beforeEach(inject(($compile, $rootScope, $q) => {
    rootScope = $rootScope;
    scope = $rootScope.$new();
    element = $compile('<div></div>')(scope);
    angularQ = $q;

    context = jasmine.createSpyObj('context', ['setup', 'withScope']);
    drawingContextService = jasmine.createSpyObj('drawingContextService', ['createContext']);
    drawingScope = jasmine.createSpyObj('drawingScope', ['Layer']);
    animationFrameService = jasmine.createSpyObj('animationFrameService', ['debounce']);
    window = jasmine.createSpyObj('$window', ['addEventListener']);
    resizeDebounced = jasmine.createSpy('resizeDebounced');
    shapeSelectionService = jasmine.createSpyObj(
      'shapeSelectionService',
      ['afterAnySelectionChange', 'getAllShapes', 'setSelectedShape', 'clear']
    );
    shapeInboxService = jasmine.createSpyObj(
      'shapeInboxService',
      ['getAllShapeInformations', 'addShape', 'addShapes', 'clear', 'removeShape', 'hasShape', 'getInboxObject']
    );
    shapeInboxService.getAllShapeInformations.and.returnValue(angularQ.resolve([]));
    shapeInboxService.getInboxObject.and.returnValue(angularQ.resolve({}));
    frameLocationGateway = jasmine.createSpyObj('frameLocationGateway', ['getFrameLocations']);
    labelStructureService = jasmine.createSpyObj('labelStructureService', ['getLabelStructure']);
    labelStructure = jasmine.createSpyObj('labelStructure', ['getThingById']);
    shapeMergeService = jasmine.createSpyObj('shapeMergeService', ['mergeShapes']);
    applicationState = jasmine.createSpyObj('applicationState', ['disableAll', 'enableAll']);
    rootScopeEventRegistrationService = jasmine.createSpyObj('rootScopeEventRegistrationService', ['register']);

    drawingContextService.createContext.and.returnValue(context);
    context.withScope.and.callFake(callback => callback(drawingScope));
    animationFrameService.debounce.and.returnValue(resizeDebounced);
    frameLocationGateway.getFrameLocations.and.returnValue(createAbortablePromise(angularQ.reject()));
    labelStructureService.getLabelStructure.and.returnValue(angularQ.resolve(labelStructure));
    rootScopeEventRegistrationService.register.and.callFake((
      listenerScope,
      eventName,
      listener
    ) => ghostBustListener = listener);
  }));

  beforeEach(() => {
    controller = new PopupPanelControllerTestable(
      scope,
      angularQ,
      window,
      element,
      rootScope,
      animationFrameService,
      drawingContextService,
      null, // frameGateway,
      frameLocationGateway,
      null, // abortablePromiseFactory,
      null, // $timeout,
      labelStructureService,
      shapeSelectionService,
      shapeInboxService,
      shapeMergeService,
      applicationState,
      rootScopeEventRegistrationService
    );
  });

  it('can be created', () => {
    expect(controller).toEqual(jasmine.any(PopupPanelController));
  });

  it('recalculates the selectedObjects when a shape has been ghostbusted (TTANNO-2152)', () => {
    const shape = {id: '1', labeledThingInFrame: {}};
    const labelStructureObject = {name: 'Bernd das Brot'};
    const inboxObject = {
      shape: shape,
      labelStructureObject: labelStructureObject,
      label: 'Bernd das Brot #1',
    };

    labelStructure.getThingById.and.returnValue(labelStructureObject);
    shapeSelectionService.getAllShapes.and.returnValue([shape]);
    shapeInboxService.hasShape.and.returnValue(false);
    shapeInboxService.getAllShapeInformations.and.returnValue(angularQ.resolve([]));
    shapeInboxService.getInboxObject.and.returnValue(angularQ.resolve(inboxObject));

    ghostBustListener();
    scope.$apply();

    const expectedSelectedObjects = [inboxObject];

    expect(controller.selectedObjects).toEqual(expectedSelectedObjects);
  });

  describe('selectedObjects', () => {
    it('is an empty array by default', () => {
      const selectedObjects = controller.selectedObjects;
      expect(selectedObjects).toEqual([]);
    });

    it('returns the object values of ._selectedObjects', () => {
      controller._selectedObjects = {
        foo: 'bar',
        bla: 'blubb',
      };

      const selectedObjects = controller.selectedObjects;
      expect(selectedObjects).toEqual(['bar', 'blubb']);
    });
  });

  describe('savedObjects', () => {
    it('returns internal copy of getAllShapeInformations of the shapeInboxService', () => {
      const allShapes = [];
      shapeInboxService.getAllShapeInformations.and.returnValue(angularQ.resolve(allShapes));

      controller._refreshSavedObjects();
      rootScope.$apply();

      const savedObjects = controller.savedObjects;

      expect(savedObjects).toBe(allShapes);
      expect(shapeInboxService.getAllShapeInformations).toHaveBeenCalled();
    });
  });

  describe('hasSelectedObjects()', () => {
    it('returns false by default', () => {
      const hasSelectedObjects = controller.hasSelectedObjects();
      expect(hasSelectedObjects).toEqual(false);
    });

    it('returns true if at least one shape is selected', () => {
      controller._selectedObjects = {foo: 'bar'};
      const hasSelectedObjects = controller.hasSelectedObjects();
      expect(hasSelectedObjects).toEqual(true);
    });
  });

  describe('hasSavedObjects()', () => {
    it('returns false by if shapeInboxService has no shapes', () => {
      shapeInboxService.getAllShapeInformations.and.returnValue(angularQ.resolve([]));
      const hasSavedObjects = controller.hasSavedObjects();
      expect(hasSavedObjects).toEqual(false);
    });

    it('returns true if shapeInboxService has at least one shape', () => {
      shapeInboxService.getAllShapeInformations.and.returnValue(angularQ.resolve([1337]));

      controller._refreshSavedObjects();
      rootScope.$apply();

      const hasSavedObjects = controller.hasSavedObjects();
      expect(hasSavedObjects).toEqual(true);
    });
  });

  describe('addToInbox()', () => {
    it('passes the shape to the shapeInboxService', () => {
      shapeSelectionService.getAllShapes.and.returnValue([]);
      const shape = {iama: 'shape'};
      const inboxObject = {shape, labelStructureObject: {}};

      controller.addToInbox(inboxObject);

      expect(shapeInboxService.addShape).toHaveBeenCalledWith(shape);
      expect(shapeSelectionService.getAllShapes).toHaveBeenCalled();
    });

    it('recalculates the selectedObjects', () => {
      const shape = {id: '1', labeledThingInFrame: {}};
      const labelStructureObject = {name: 'Bernd das Brot'};
      const inboxObject = {
        shape: shape,
        labelStructureObject: labelStructureObject,
      };
      labelStructure.getThingById.and.returnValue(labelStructureObject);
      shapeSelectionService.getAllShapes.and.returnValue([shape]);
      shapeInboxService.hasShape.and.returnValue(false);
      shapeInboxService.getInboxObject.and.returnValue(angularQ.resolve(inboxObject));

      controller.addToInbox(inboxObject);
      scope.$apply();

      const expectedSelectedObjects = [
        inboxObject,
      ];

      expect(controller.selectedObjects).toEqual(expectedSelectedObjects);
    });

    it('recalculates the selectedObjects, emptying the selected objects', () => {
      const shape = {id: '1', labeledThingInFrame: {}};
      const labelStructureObject = {name: 'Bernd das Brot'};

      controller._selectedObjects = [
        {
          shape: shape,
          labelStructureObject: labelStructureObject,
          label: 'Bernd das Brot #1',
        },
      ];

      labelStructure.getThingById.and.returnValue(labelStructureObject);
      shapeSelectionService.getAllShapes.and.returnValue([shape]);
      shapeInboxService.hasShape.and.returnValue(true);
      shapeInboxService.getAllShapeInformations.and.returnValue(angularQ.resolve([]));

      controller.addToInbox(shape);
      scope.$apply();

      expect(controller.selectedObjects).toEqual([]);
    });

    it('updates whether the selected shapes are mergable (result: true)', () => {
      const firstShape = {
        labeledThingInFrame: {
          identifierName: 'portal-gun',
        },
      };
      const secondShape = {
        labeledThingInFrame: {
          identifierName: 'portal-gun',
        },
      };
      const firstShapeInformation = {id: '1', labeledThingInFrame: firstShape.labeledThingInFrame, shape: firstShape};
      const secondShapeInformation = {
        id: '1',
        labeledThingInFrame: secondShape.labeledThingInFrame,
        shape: secondShape,
      };

      const labelStructureObject = {name: 'Bernd das Brot'};
      labelStructure.getThingById.and.returnValue(labelStructureObject);
      shapeSelectionService.getAllShapes.and.returnValue([firstShapeInformation, secondShapeInformation]);
      shapeInboxService.hasShape.and.returnValue(false);
      shapeInboxService.getAllShapeInformations.and.returnValue(angularQ.resolve([firstShapeInformation, secondShapeInformation]));

      controller.addToInbox(firstShapeInformation);
      scope.$apply();

      expect(controller.hasMergableObjects).toEqual(true);
    });

    it('updates whether the selected shapes are mergable (result: false, different constructors)', () => {
      const firstShape = {
        labeledThingInFrame: {
          identifierName: 'portal-gun',
        },
      };

      const secondShape = function() {// eslint-disable-next-line func-names
        // Noop
      };
      secondShape.labeledThingInFrame = {
        identifierName: 'portal-gun',
      };
      const firstShapeInformation = {id: '1', labeledThingInFrame: firstShape.labeledThingInFrame, shape: firstShape};
      const secondShapeInformation = {
        id: '1',
        labeledThingInFrame: secondShape.labeledThingInFrame,
        shape: secondShape,
      };

      const labelStructureObject = {name: 'Bernd das Brot'};
      labelStructure.getThingById.and.returnValue(labelStructureObject);
      shapeSelectionService.getAllShapes.and.returnValue([firstShapeInformation, secondShapeInformation]);
      shapeInboxService.hasShape.and.returnValue(false);
      shapeInboxService.getAllShapeInformations.and.returnValue(angularQ.resolve([firstShapeInformation, secondShapeInformation]));

      controller.hasMergableObjects = true;
      controller.addToInbox(firstShapeInformation);
      scope.$apply();

      expect(controller.hasMergableObjects).toEqual(false);
    });

    it('updates whether the selected shapes are mergable (result: false, different thing types) (TTANNO-2154)', () => {
      const firstShape = {
        labeledThingInFrame: {
          identifierName: 'companion-cube',
        },
      };
      const secondShape = {
        labeledThingInFrame: {
          identifierName: 'portal-gun',
        },
      };
      const firstShapeInformation = {id: '1', labeledThingInFrame: firstShape.labeledThingInFrame, shape: firstShape};
      const secondShapeInformation = {
        id: '1',
        labeledThingInFrame: secondShape.labeledThingInFrame,
        shape: secondShape,
      };

      const labelStructureObject = {name: 'Bernd das Brot'};
      labelStructure.getThingById.and.returnValue(labelStructureObject);
      shapeSelectionService.getAllShapes.and.returnValue([firstShapeInformation, secondShapeInformation]);
      shapeInboxService.hasShape.and.returnValue(false);
      shapeInboxService.getAllShapeInformations.and.returnValue(angularQ.resolve([firstShapeInformation, secondShapeInformation]));

      controller.hasMergableObjects = true;
      controller.addToInbox(firstShapeInformation);
      scope.$apply();

      expect(controller.hasMergableObjects).toEqual(false);
    });
  });

  describe('addAllToInbox()', () => {
    it('passes the shapes to the shapeInboxService', () => {
      shapeSelectionService.getAllShapes.and.returnValue([]);
      const inboxObjectOne = {shape: {iama: 'shape'}, labelStructureObject: {}};
      const inboxObjectTwo = {shape: {bernd: 'dasbrot'}, labelStructureObject: {}};
      controller._selectedObjects = {iama: inboxObjectOne, bernd: inboxObjectTwo};

      controller.addAllToInbox();

      expect(shapeInboxService.addShapes).toHaveBeenCalledWith([inboxObjectOne.shape, inboxObjectTwo.shape]);
      expect(shapeSelectionService.getAllShapes).toHaveBeenCalled();
    });
  });

  describe('removeAllFromInbox()', () => {
    it('it clears the shapeInboxService', () => {
      shapeSelectionService.getAllShapes.and.returnValue([]);

      controller.removeAllFromInbox();

      expect(shapeInboxService.clear).toHaveBeenCalled();
      expect(shapeSelectionService.getAllShapes).toHaveBeenCalled();
    });
  });

  describe('removeFromInbox()', () => {
    it('passes the shape to the shapeInboxService', () => {
      shapeSelectionService.getAllShapes.and.returnValue([]);

      const shape = {iama: 'shape'};
      const inboxObject = {shape, labelStructureObject: {}};

      controller.removeFromInbox(inboxObject);

      expect(shapeInboxService.removeShape).toHaveBeenCalledWith(shape);
      expect(shapeSelectionService.getAllShapes).toHaveBeenCalled();
    });
  });

  describe('jumpToShape()', () => {
    let frameIndex;
    let labeledThingInFrame;
    let shape;
    let shapeInformation;
    let viewer;

    beforeEach(() => {
      frameIndex = 5;
      labeledThingInFrame = {frameIndex: 5};
      shape = {id: 'bernd-das-brot', labeledThingInFrame};
      shapeInformation = {shape};

      viewer = jasmine.createSpyObj('viewer', ['work', 'finish']);
      applicationState.viewer = viewer;
    });

    it('only selects the shape if the shape already is on the current frame', () => {
      const originalFramePossiton = controller.framePosition.position;
      controller.framePosition.position = frameIndex;

      controller.jumpToShape(shapeInformation);

      expect(controller.selectedPaperShape).toBe(shape);
      expect(shapeSelectionService.setSelectedShape).toHaveBeenCalledWith(shape);
      expect(framePositionMock.goto).not.toHaveBeenCalled();
      expect(framePositionMock.afterFrameChangeOnce).not.toHaveBeenCalled();

      controller.framePosition.position = originalFramePossiton;
    });

    it('clears the selection before selecting a new shape', () => {
      controller.jumpToShape(shapeInformation);

      expect(framePositionMock.afterFrameChangeOnce).toHaveBeenCalled();
      expect(shapeSelectionService.clear).toHaveBeenCalled();
    });

    it('enables and disables the viewer', () => {
      let afterFrameChangeOnce;
      framePositionMock.afterFrameChangeOnce.and.callFake((name, callback) => afterFrameChangeOnce = callback);

      controller.jumpToShape(shapeInformation);

      expect(applicationState.viewer.work).toHaveBeenCalled();
      expect(applicationState.disableAll).toHaveBeenCalled();

      expect(applicationState.viewer.finish).not.toHaveBeenCalled();
      expect(applicationState.enableAll).not.toHaveBeenCalled();

      afterFrameChangeOnce();

      expect(applicationState.viewer.finish).toHaveBeenCalled();
      expect(applicationState.enableAll).toHaveBeenCalled();
    });

    it('selects the shape after the frame change of shape is on a different frame than the current frame', () => {
      let afterFrameChangeOnce;
      framePositionMock.afterFrameChangeOnce.and.callFake((name, callback) => afterFrameChangeOnce = callback);

      controller.jumpToShape(shapeInformation);

      expect(shapeSelectionService.setSelectedShape).not.toHaveBeenCalled();
      expect(controller.selectedPaperShape).toBeNull();

      afterFrameChangeOnce();

      expect(shapeSelectionService.setSelectedShape).toHaveBeenCalledWith(shape);
      expect(controller.selectedPaperShape).toBe(shape);
    });
  });
});
