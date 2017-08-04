import {inject} from 'angular-mocks';
import LabelSelectorController from 'Application/LabelStructure/Directives/LabelSelectorController';

describe('LabelSelectorController tests', () => {
  /**
   * @type {$rootScope}
   */
  let rootScope;

  /**
   * @type {$scope}
   */
  let scope;

  /**
   * @type {ShapeSelectionService}
   */
  let shapeSelectionService;

  beforeEach(inject(($rootScope) => {
    rootScope = $rootScope;
    scope = $rootScope.$new();
  }));

  beforeEach(() => {
    shapeSelectionService = jasmine.createSpyObj('shapeSelectionService', ['count']);
  });

  function createController() {
    return new LabelSelectorController(
      scope,
      rootScope,
      null, // $location
      null, // linearLabelStructureVisitor
      null, // annotationLabelStructureVisitor
      null, // labeledFrameGateway
      null, // labeledThingGateway
      null, // labeledThingInFrameGateway
      null, // entityIdService
      null, // modalService
      null, // applicationState
      null, // taskGateway
      shapeSelectionService
    );
  }

  it('can be created', () => {
    const controller = createController();
    expect(controller).toEqual(jasmine.any(LabelSelectorController));
  });

  describe('show', () => {
    it('returns false and shapeSelectionService.count() is 2', () => {
      const controller = createController();
      shapeSelectionService.count.and.returnValue(2);

      const show = controller.show();
      expect(show).toBe(false);
    });

    it('returns false and shapeSelectionService.count() > 1', () => {
      const controller = createController();
      shapeSelectionService.count.and.returnValue(42);

      const show = controller.show();
      expect(show).toBe(false);
    });

    it('returns false if shapeSelectionService.count() is 0', () => {
      const controller = createController();
      shapeSelectionService.count.and.returnValue(0);

      const show = controller.show();
      expect(show).toBe(false);
    });

    it('returns true if shapeSelectionService.count() is 1', () => {
      const controller = createController();
      shapeSelectionService.count.and.returnValue(1);

      const show = controller.show();
      expect(show).toBe(true);
    });
  });
});