import PaperTool from 'Application/Viewer/Tools/PaperTool';
import Tool from 'Application/Viewer/Tools/NewTool';
import Paper from 'paper';

fdescribe('PaperTool test suite', function() {
  let drawContext;

  beforeEach(() => {
      drawContext = jasmine.createSpyObj('drawContext', ['withScope']);
      drawContext.withScope.and.callFake((callback) => callback());
  });

  function createPaperToolInstance() {
    return new PaperTool(drawContext);
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
    });
  });
});