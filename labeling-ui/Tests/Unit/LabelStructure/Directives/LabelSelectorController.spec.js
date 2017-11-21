import {inject} from 'angular-mocks';
import LabelSelectorController from 'Application/LabelStructure/Directives/LabelSelectorController';
import LabelStructureThing from '../../../../Application/Task/Model/LabelStructureThing';
import LabelStructureGroup from '../../../../Application/Task/Model/LabelStructureGroup';
import LabelStructureObject from '../../../../Application/Task/Model/LabelStructureObject';
import PaperMeasurementRectangle from '../../../../Application/Viewer/Shapes/PaperMeasurementRectangle';
import TaskFixture from '../../../Fixtures/Models/Frontend/Task';
import paper from 'paper';

describe('LabelSelectorController tests', () => {
  let angularQ;

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

  /**
   * @type {KeyboardShortcutService}
   */
  let keyboardShortcutService;

  /**
   * @type {LabelStructureService}
   */
  let labelStructureService;

  beforeEach(inject(($rootScope, $q) => {
    rootScope = $rootScope;
    angularQ = $q;
    scope = $rootScope.$new();
  }));

  beforeEach(() => {
    shapeSelectionService = jasmine.createSpyObj('shapeSelectionService', ['count']);
    shapeSelectionService.count.and.returnValue(1);
    keyboardShortcutService = jasmine.createSpyObj('keyboardShortcutService', ['addHotkey', 'registerOverlay']);
    labelStructureService = jasmine.createSpyObj('labelStructureService', ['getLabelStructure']);
    labelStructureService.getLabelStructure.and.returnValue(angularQ.resolve());
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
      shapeSelectionService,
      keyboardShortcutService,
      labelStructureService,
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

    it('return false if selectedPaperShape is type of PaperMeasurementRectangle', () => {
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

  describe('pages', () => {
    let controller;

    beforeEach(() => {
      controller = createController();
      controller.selectedLabelStructureObject = new LabelStructureThing('1', 'foobar', 'tea-time');

      const labeledObjectMock = jasmine.createSpyObj('LabeledObject', ['extractClassList']);
      labeledObjectMock.extractClassList.and.returnValue(['Yellow']);

      spyOn(controller, '_getSelectedLabeledObject').and.returnValue(labeledObjectMock);
      spyOn(controller, '_labelStructureFitsLabeledObject').and.returnValue(true);

      const labelStructure = jasmine.createSpyObj(
        'requirementsLabelStructure',
        ['getEnabledClassesForLabeledObjectAndClassList']
      );
      labelStructure.getEnabledClassesForLabeledObjectAndClassList.and.returnValue(
        [
          {
            name: 'street_light',
            metadata: {
              challenge: 'Street Light',
              value: 'Yellow',
            },
            children: [
              {
                name: 'Off',
                metadata: {
                  response: 'Off',
                },
              },
              {
                name: 'Red',
                metadata: {
                  response: 'Red',
                },
              },
              {
                name: 'Yellow',
                metadata: {
                  response: 'Yellow',
                },
              },
            ],
          },
          {
            name: 'road_type',
            metadata: {
              challenge: 'Road Type',
              value: 'City',
            },
            children: [
              {
                name: 'City',
                metadata: {
                  response: 'City',
                },
              },
              {
                name: 'Highway',
                metadata: {
                  response: 'Highway',
                },
              },
              {
                name: 'Highway Exit',
                metadata: {
                  response: 'Highway Exit',
                },
              },
            ],
          },
        ]
      );
      controller.labelStructure = labelStructure;
    });

    it('Update label selector pages', () => {
      controller._updatePagesAndChoices();

      const challenges = controller.pages.map(page => {
        return page.challenge;
      });

      const values = {};
      controller.pages.forEach(page => {
        values[page.id] = page.responses.map(res => {
          return res.response;
        });
      });

      expect(challenges).toEqual(['Street Light', 'Road Type']);
      expect(values).toEqual({street_light: ['Off', 'Red', 'Yellow'], road_type: ['City', 'Highway', 'Highway Exit']});
    });

    it('Update label selector pages with search query for challenges', () => {
      controller.searchAttributes = 'Road';
      controller._updatePagesAndChoices();

      const challenges = controller.pages.map(page => {
        return page.challenge;
      });

      const values = {};
      controller.pages.forEach(page => {
        values[page.id] = page.responses.map(res => {
          return res.response;
        });
      });

      expect(challenges).toEqual(['Road Type']);
      expect(values).toEqual({road_type: ['City', 'Highway', 'Highway Exit']});
    });

    it('Update label selector pages with search query for values', () => {
      controller.searchAttributes = 'Exit';
      controller._updatePagesAndChoices();

      const challenges = controller.pages.map(page => {
        return page.challenge;
      });

      const values = {};
      controller.pages.forEach(page => {
        values[page.id] = page.responses.map(res => {
          return res.response;
        });
      });

      expect(challenges).toEqual(['Road Type']);
      expect(values).toEqual({road_type: ['Highway Exit']});
    });
  });
});
