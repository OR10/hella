import MultiTool from 'Application/Viewer/Tools/MultiTool';
import PaperShape from "Application/Viewer/Shapes/PaperShape";
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

  beforeEach(() => {
    drawingContext = jasmine.createSpyObj('drawingContext', ['withScope']);
    drawingContext.withScope.and.callFake(callback => callback());

    shapeSelectionService = jasmine.createSpyObj('shapeSelectionService', ['clear', 'setSelectedShape', 'toggleShape']);
    viewerMouseCursorService = jasmine.createSpyObj('viewerMouseCursorService', ['isCrosshairShowing', 'setMouseCursor']);
  });

  /**
   * @returns {MultiTool}
   */
  function createMultiTool() {
    return new MultiTool(
      drawingContext,
      null, // $rootScope,
      null, // $q,
      null, // loggerService,
      null, // toolService,
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

    const multiSelectEvent = {
      shiftKey: false,
      ctrlKey: true,
    };

    const singleSelectEvent = {
      shiftKey: false,
      ctrlKey: false,
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
      const event = { event: multiSelectEvent };
      multiTool.onMouseDown(event);

      expect(shapeSelectionService.clear).toHaveBeenCalled();
    });

    it('sets the selected shape if ctrl was not held while clicking', () => {
      const event = { event: singleSelectEvent };
      const shape = new PaperShape();
      shape.getCursor = () => {};
      project.hitTest.and.returnValue({ item: shape });

      multiTool.onMouseDown(event);

      expect(shapeSelectionService.setSelectedShape).toHaveBeenCalledWith(shape);
    });

    it('toggles the selected shape if ctrl was held while clicking', () => {
      const event = { event: multiSelectEvent };
      const shape = new PaperShape();
      shape.getCursor = () => {};
      project.hitTest.and.returnValue({ item: shape });

      multiTool.onMouseDown(event);

      expect(shapeSelectionService.toggleShape).toHaveBeenCalledWith(shape);
    });
  });
});