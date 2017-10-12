import {inject} from 'angular-mocks';
import PopupPanelController from 'Application/Task/Directives/PopupPanelController';

describe('PopupPanelController', () => {
  /**
   * @type {PopupPanelController}
   */
  let controller;
  let element;
  let scope;
  let rootScope;
  let context;
  let drawingContextService;
  let drawingScope;
  let animationFrameService;
  let window;
  let resizeDebounced;
  let shapeSelectionService;
  let shapeInboxService;

  beforeEach(inject(($compile, $rootScope) => {
    rootScope = $rootScope;
    scope = $rootScope.$new();
    element = $compile('<div></div>')(scope);

    context = jasmine.createSpyObj('context', ['setup', 'withScope']);
    drawingContextService = jasmine.createSpyObj('drawingContextService', ['createContext']);
    drawingScope = jasmine.createSpyObj('drawingScope', ['Layer']);
    animationFrameService = jasmine.createSpyObj('animationFrameService', ['debounce']);
    window = jasmine.createSpyObj('$window', ['addEventListener']);
    resizeDebounced = jasmine.createSpy('resizeDebounced');
    shapeSelectionService = jasmine.createSpyObj('shapeSelectionService', ['afterAnySelectionChange', 'getAllShapes']);
    shapeInboxService = jasmine.createSpyObj('shapeInboxService', ['getAllShapes', 'addShape', 'addShapes', 'clear', 'removeShape']);

    drawingContextService.createContext.and.returnValue(context);
    context.withScope.and.callFake(callback => callback(drawingScope));
    animationFrameService.debounce.and.returnValue(resizeDebounced);
  }));

  beforeEach(() => {
    controller = new PopupPanelController(
      scope,
      window,
      element,
      rootScope,
      animationFrameService,
      drawingContextService,
      null, // frameGateway,
      null, // frameLocationGateway,
      null, // abortablePromiseFactory,
      null, // $timeout,
      null, // labelStructureService,
      shapeSelectionService,
      shapeInboxService
    );
  });

  it('can be created', () => {
    expect(controller).toEqual(jasmine.any(PopupPanelController));
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
    it('simply returns getAllShapes of the shapeInboxService', () => {
      const allShapes = [];
      shapeInboxService.getAllShapes.and.returnValue(allShapes);

      const savedObjects = controller.savedObjects;

      expect(savedObjects).toBe(allShapes);
      expect(shapeInboxService.getAllShapes).toHaveBeenCalled();
    });
  });

  describe('hasSelectedObjects', () => {
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

  describe('hasSavedObjects', () => {
    it('returns false by if shapeInboxService has no shapes', () => {
      shapeInboxService.getAllShapes.and.returnValue([]);
      const hasSavedObjects = controller.hasSavedObjects();
      expect(hasSavedObjects).toEqual(false);
    });

    it('returns true if shapeInboxService has at least one shape', () => {
      shapeInboxService.getAllShapes.and.returnValue([1337]);
      const hasSavedObjects = controller.hasSavedObjects();
      expect(hasSavedObjects).toEqual(true);
    });
  });

  describe('addToInbox', () => {
    it('passes the shape to the shapeInboxService', () => {
      shapeSelectionService.getAllShapes.and.returnValue([]);
      const shape = {iama: 'shape'};

      controller.addToInbox(shape);

      expect(shapeInboxService.addShape).toHaveBeenCalledWith(shape);
      expect(shapeSelectionService.getAllShapes).toHaveBeenCalled();
    });
  });

  describe('addAllToInbox', () => {
    it('passes the shapes to the shapeInboxService', () => {
      shapeSelectionService.getAllShapes.and.returnValue([]);
      controller._selectedObjects = {iama: 'shape', bernd: 'dasbrot'};

      controller.addAllToInbox();

      expect(shapeInboxService.addShapes).toHaveBeenCalledWith(['shape', 'dasbrot']);
      expect(shapeSelectionService.getAllShapes).toHaveBeenCalled();
    });
  });

  describe('removeAllFromInbox', () => {
    it('it clears the shapeInboxService', () => {
      shapeSelectionService.getAllShapes.and.returnValue([]);

      controller.removeAllFromInbox();

      expect(shapeInboxService.clear).toHaveBeenCalled();
      expect(shapeSelectionService.getAllShapes).toHaveBeenCalled();
    });
  });

  describe('removeFromInbox', () => {
    it('passes the shape to the shapeInboxService', () => {
      shapeSelectionService.getAllShapes.and.returnValue([]);
      const shape = {iama: 'shape'};

      controller.removeFromInbox(shape);

      expect(shapeInboxService.removeShape).toHaveBeenCalledWith(shape);
      expect(shapeSelectionService.getAllShapes).toHaveBeenCalled();
    });
  });
});
