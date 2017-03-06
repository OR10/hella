import PaperTool from 'Application/Viewer/Tools/PaperTool';
import Tool from 'Application/Viewer/Tools/NewTool';
import Paper from 'paper';

fdescribe('PaperTool test suite', function() {
  let drawContext;
  let rootScope;

  beforeEach(() => {
      drawContext = jasmine.createSpyObj('drawContext', ['withScope']);
      rootScope = jasmine.createSpyObj('$rootScope', ['$evalAsync']);
      drawContext.withScope.and.callFake((callback) => callback());
  });

  function createPaperToolInstance() {
    return new PaperTool(drawContext, rootScope);
  }

  it('is of type Tool', function() {
    const paperTool = createPaperToolInstance();
    expect(paperTool).toEqual(jasmine.any(Tool));
  });

  describe('#delegateMouseEvent()', () => {
    it('rounds the x and y point coordinates and creates a paper.Point', () => {
      const mockedCoordinate = 42;
      spyOn(Math, 'round').and.returnValue(mockedCoordinate);
      const event = {
        point: { x: 0, y: 0}
      };
      const paperTool = createPaperToolInstance();
      paperTool.delegateMouseEvent('drag', event);
      expect(event.point).toEqual(jasmine.any(Paper.Point));
      expect(event.point.x).toEqual(mockedCoordinate);
      expect(event.point.y).toEqual(mockedCoordinate);
    });

    it('throws if the event type does not exit', () => {
      const paperTool = createPaperToolInstance();
      const event = {point: {x: 0, y: 0}};
      spyOn(paperTool, 'onMouseDown');

      function throwWrapper() {
        paperTool.delegateMouseEvent('bernddasbrot', event);
      }

      expect(throwWrapper).toThrow();
    });

    describe('down', () => {
      it('calls the delegation target', () => {
        const paperTool = createPaperToolInstance();
        const event = {point: {x: 0, y: 0}};
        spyOn(paperTool, 'onMouseDown');

        paperTool.delegateMouseEvent('down', event);

        expect(paperTool.onMouseDown).toHaveBeenCalledWith(event);
      });
    });

    describe('up', () => {
      it('calls the delegation target', () => {
        const paperTool = createPaperToolInstance();
        const event = {point: {x: 0, y: 0}};
        spyOn(paperTool, 'onMouseUp');

        paperTool.delegateMouseEvent('up', event);

        expect(paperTool.onMouseUp).toHaveBeenCalledWith(event);
      });

      it('calls onMouseClick', () => {
        const paperTool = createPaperToolInstance();
        const event = {point: {x: 0, y: 0}};
        spyOn(paperTool, 'onMouseClick');

        paperTool.delegateMouseEvent('up', event);

        expect(paperTool.onMouseClick).toHaveBeenCalledWith(event);
      });
    });

    describe('move', () => {
      it('calls the delegation target from the rootScope', () => {
        const paperTool = createPaperToolInstance();
        const event = {point: {x: 0, y: 0}};
        spyOn(paperTool, 'onMouseMove');
        rootScope.$evalAsync.and.callFake((callback) => {
          callback();
        });

        paperTool.delegateMouseEvent('move', event);

        expect(paperTool.onMouseMove).toHaveBeenCalledWith(event);
        expect(rootScope.$evalAsync).toHaveBeenCalled();
      });
    });

    describe('drag', () => {
      it('does not break if there is no last drag point', () => {
        const paperTool = createPaperToolInstance();
        const event = {
          point: { x: 0, y: 0}
        };

        function throwWrapper() {
          paperTool.delegateMouseEvent('drag', event);
        }

        expect(throwWrapper).not.toThrow();
      });

      describe('Drag event state "initial"', () => {
        const event = {point: {x: 0, y: 0}};
        const dragDistanceOne = 1;
        const dragDistanceZero = 0;

        let paperTool;
        let lastDragPoint;
        let toolActionStruct;

        beforeEach(() => {
          paperTool = createPaperToolInstance();
          lastDragPoint = jasmine.createSpyObj('_lastDragPoint', ['getDistance']);

          paperTool._lastDragPoint = lastDragPoint;

          toolActionStruct = {
            options: {
              initialDragDistance: null
            }
          };
          paperTool._toolActionStruct = toolActionStruct;

          spyOn(paperTool, 'onMouseDrag');
        });

        it('calls the delegation target if last drag point is larger than initialDragDistance', () => {
          lastDragPoint.getDistance.and.returnValue(dragDistanceOne);
          toolActionStruct.options.initialDragDistance = dragDistanceZero;

          paperTool.delegateMouseEvent('drag', event);

          expect(paperTool.onMouseDrag).toHaveBeenCalledWith(event);
        });

        it('calls the delegation target if last drag point and initialDragDistance are equal', () => {
          lastDragPoint.getDistance.and.returnValue(dragDistanceOne);
          toolActionStruct.options.initialDragDistance = dragDistanceOne;

          paperTool.delegateMouseEvent('drag', event);

          expect(paperTool.onMouseDrag).toHaveBeenCalledWith(event);
        });

        it('does not call the delegation target if last drag point is smaller than initialDragDistance', () => {
          lastDragPoint.getDistance.and.returnValue(dragDistanceZero);
          toolActionStruct.options.initialDragDistance = dragDistanceOne;

          paperTool.delegateMouseEvent('drag', event);

          expect(paperTool.onMouseDrag).not.toHaveBeenCalled();
        });

      });
    });
  });
});