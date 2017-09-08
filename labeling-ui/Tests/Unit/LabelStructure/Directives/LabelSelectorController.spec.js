import {inject} from 'angular-mocks';
import LabelSelectorController from 'Application/LabelStructure/Directives/LabelSelectorController';
import LabelStructureThing from '../../../../Application/Task/Model/LabelStructureThing';
import LabelStructureGroup from '../../../../Application/Task/Model/LabelStructureGroup';
import LabelStructureObject from '../../../../Application/Task/Model/LabelStructureObject';

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

  beforeEach(inject($rootScope => {
    rootScope = $rootScope;
    scope = $rootScope.$new();
  }));

  beforeEach(() => {
    shapeSelectionService = jasmine.createSpyObj('shapeSelectionService', ['count']);
    shapeSelectionService.count.and.returnValue(1);
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
    it('returns false by default (selectedPaperShape = undefined)', () => {
      const controller = createController();
      const show = controller.show();
      expect(show).toBe(false);
    });

    it('returns false if selectedPaperShape is null', () => {
      const controller = createController();
      controller.selectedPaperShape = null;
      const show = controller.show();
      expect(show).toBe(false);
    });

    it('returns true if selectedPaperShape is set', () => {
      const controller = createController();
      controller.selectedPaperShape = {};
      const show = controller.show();
      expect(show).toBe(true);
    });

    it('returns false if selectedPaperShape is undefined but shapeSelectionService.count() > 0', () => {
      const controller = createController();
      shapeSelectionService.count.and.returnValue(3);

      const show = controller.show();
      expect(show).toBe(false);
    });

    it('returns false if selectedPaperShape is null but shapeSelectionService.count() > 0', () => {
      const controller = createController();
      controller.selectedPaperShape = null;
      shapeSelectionService.count.and.returnValue(42);

      const show = controller.show();
      expect(show).toBe(false);
    });

    it('returns false if selectedPaperShape is set and shapeSelectionService.count() > 0', () => {
      const controller = createController();
      controller.selectedPaperShape = {};
      shapeSelectionService.count.and.returnValue(3);

      const show = controller.show();
      expect(show).toBe(false);
    });

    it('returns true if selectedPaperShape is set but shapeSelectionService.count() is 0', () => {
      const controller = createController();
      controller.selectedPaperShape = {};
      shapeSelectionService.count.and.returnValue(0);

      const show = controller.show();
      expect(show).toBe(true);
    });

    it('returns true if selectedPaperShape is set and shapeSelectionService.count() is 1', () => {
      const controller = createController();
      controller.selectedPaperShape = {};
      shapeSelectionService.count.and.returnValue(1);

      const show = controller.show();
      expect(show).toBe(true);
    });
  });

  describe('getLabelSelectorTitle', () => {
    let controller;

    beforeEach(() => {
      controller = createController();
    });

    it('should provide default title if no LabelStructure is available (null)', () => {
      controller.selectedLabelStructureObject = null;
      const returnValue = controller.getLabelSelectorTitle();

      expect(returnValue).toEqual('Properties');
    });

    it('should provide default title if no LabelStructure is available (undefined)', () => {
      controller.selectedLabelStructureObject = undefined;
      const returnValue = controller.getLabelSelectorTitle();

      expect(returnValue).toEqual('Properties');
    });

    it('should return name of LabelStructureThings', () => {
      const id = 'very-very-unique-id';
      const name = 'Atticus O\'Sullivan - The Iron Druid';
      const shape = 'cup-of-tea';

      controller.selectedLabelStructureObject = new LabelStructureThing(id, name, shape);
      const returnValue = controller.getLabelSelectorTitle();

      expect(returnValue).toEqual(name);
    });

    it('should return name of LabelStructureGroups', () => {
      const id = 'very-very-unique-id';
      const name = 'Atticus O\'Sullivan - The Iron Druid';
      const shape = 'cup-of-tea';

      controller.selectedLabelStructureObject = new LabelStructureGroup(id, name, shape);
      const returnValue = controller.getLabelSelectorTitle();

      expect(returnValue).toEqual(name);
    });

    it('should return the id of LabelStructureObjects without a name', () => {
      const id = 'very-very-unique-id';

      controller.selectedLabelStructureObject = new LabelStructureObject(id);
      const returnValue = controller.getLabelSelectorTitle();

      expect(returnValue).toEqual(id);
    });
  });
});
