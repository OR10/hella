import PaperTool from 'Application/Viewer/Tools/PaperTool';
import Tool from 'Application/Viewer/Tools/NewTool';

fdescribe('PaperTool test suite', function() {
  let drawContext;

  beforeEach(() => {
      drawContext = jasmine.createSpyObj('drawContext', ['withScope']);
      drawContext.withScope.and.callFake((callback) => callback());
  });

  it('is of type Tool', function() {
    const paperTool = new PaperTool(drawContext);
    expect(paperTool).toEqual(jasmine.any(Tool));
  });
});