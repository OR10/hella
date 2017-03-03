import PaperTool from 'Application/Viewer/Tools/PaperTool';
import Tool from 'Application/Viewer/Tools/NewTool';

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