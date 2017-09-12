import MultiTool from 'Application/Viewer/Tools/MultiTool';
import PaperShape from 'Application/Viewer/Shapes/PaperShape';
import paper from 'paper';

describe('MultiTool tests', () => {
  let drawingContext;

  /**
   * @type {ShapeSelectionService}
   */
  let shapeSelectionService;

  /**
   * @type {ViewerMouseCursorService}
   */
  let viewerMouseCursorService;

  /**
   * @type {ToolService}
   */
  let toolService;

  /**
   * @type {$q}
   */
  let angularQ;

  beforeEach(inject(($q) => {
    angularQ = $q;
  }));

  beforeEach(() => {
    drawingContext = jasmine.createSpyObj('drawingContext', ['withScope']);
    drawingContext.withScope.and.callFake(callback => callback());

    shapeSelectionService = jasmine.createSpyObj('shapeSelectionService', ['clear', 'setSelectedShape', 'getSelectedShape', 'toggleShape']);
    viewerMouseCursorService = jasmine.createSpyObj('viewerMouseCursorService', ['isCrosshairShowing', 'setMouseCursor']);
    toolService = jasmine.createSpyObj('toolService', ['getTool']);
  });

  /**
   * @returns {MultiTool}
   */
  function createMultiTool() {
    return new MultiTool(
      drawingContext,
      null, // $rootScope,
      angularQ,
      null, // loggerService,
      toolService,
      viewerMouseCursorService,
      null, // labeledFrameGateway,
      shapeSelectionService
    );
  }

  it('can be created', () => {
    const multiTool = createMultiTool();
    expect(multiTool).toEqual(jasmine.any(MultiTool));
  });

  describe('onMouseDown', () => {
    /**
     * @type {MultiTool}
     */
    let multiTool;
    let project;
    let toolActionStruct;

    const emptyEvent = {};

    const multiSelectModifiers = {
      control: true,
    };

    const singleSelectModifiers = {
      control: false
    };

    beforeEach(() => {
      const canvas = document.createElement('canvas');
      paper.setup(canvas);
    });

    beforeEach(() => {
      multiTool = createMultiTool();
      project = jasmine.createSpyObj('project', ['hitTest']);
      const scope = {project};
      drawingContext.withScope.and.callFake(callback => callback(scope));
      toolActionStruct = {options: {}};
      multiTool._toolActionStruct = toolActionStruct;
    });

    it('clears the selection of nothing was hit', () => {
      const event = { event: emptyEvent, modifiers: singleSelectModifiers };
      const someShapeCreationTool = jasmine.createSpyObj('ShapeCreationTool', ['invokeShapeCreation', 'delegateMouseEvent']);

      multiTool._toolActionStruct.requirementsShape = 'rectangle';
      toolService.getTool.and.returnValue(someShapeCreationTool);
      someShapeCreationTool.invokeShapeCreation.and.returnValue(angularQ.resolve());

      multiTool.onMouseDown(event);

      expect(shapeSelectionService.clear).toHaveBeenCalled();
    });

    it('sets the selected shape if ctrl was not held while clicking', () => {
      const event = { event: emptyEvent, modifiers: singleSelectModifiers };
      const shape = new PaperShape();
      shape.getCursor = () => {};
      project.hitTest.and.returnValue({ item: shape });

      multiTool.onMouseDown(event);

      expect(shapeSelectionService.setSelectedShape).toHaveBeenCalledWith(shape, false);
    });

    it('toggles the selected shape if ctrl was held while clicking', () => {
      const event = { event: {}, modifiers: multiSelectModifiers };
      const shape = new PaperShape();
      shape.getCursor = () => {};
      project.hitTest.and.returnValue({ item: shape });

      multiTool.onMouseDown(event);

      expect(shapeSelectionService.toggleShape).toHaveBeenCalledWith(shape, false);
    });
  });
});
