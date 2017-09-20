import {inject} from 'angular-mocks';
import LabelSelectorController from 'Application/LabelStructure/Directives/LabelSelectorController';
import LabelStructureThing from '../../../../Application/Task/Model/LabelStructureThing';
import LabelStructureGroup from '../../../../Application/Task/Model/LabelStructureGroup';
import LabelStructureObject from '../../../../Application/Task/Model/LabelStructureObject';
import PaperMeasurementRectangle from '../../../../Application/Viewer/Shapes/PaperMeasurementRectangle';
import TaskFixture from '../../../Fixtures/Models/Frontend/Task';
import paper from 'paper';

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
      null, // labeledThingGroupInFrameGateway
      null, // entityIdService
      null, // modalService
      null, // applicationState
      null, // taskGateway
      shapeSelectionService
    );
  }

  function setupPaperJs() {
    const canvas = document.createElement('canvas');
    paper.setup(canvas);
  }

  it('can be created', () => {
    const controller = createController();
    expect(controller).toEqual(jasmine.any(LabelSelectorController));
  });

  describe('show', () => {
    using([
      [undefined, 1, false],
      [undefined, 23, false],
      [null, 1, false],
      [null, 42, false],
      [{}, 0, true],
      [{}, 1, true],
      [{}, 3, false],
    ], (selectedPaperShape, shapeSelectionServiceCount, expectedResult) => {
      it('should return correct value for selectedPaperShapes', () => {
        const controller = createController();
        controller.selectedPaperShape = selectedPaperShape;
        shapeSelectionService.count.and.returnValue(shapeSelectionServiceCount);

        const show = controller.show();
        expect(show).toBe(expectedResult);
      });
    });

    it('returns false if selectedPaperShape is type of PaperMeasurementRectangle', () => {
      setupPaperJs();
      const controller = createController();
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
      controller.selectedPaperShape = measurementRectangle;
      shapeSelectionService.count.and.returnValue(1);

      const show = controller.show();
      expect(show).toBe(false);
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
