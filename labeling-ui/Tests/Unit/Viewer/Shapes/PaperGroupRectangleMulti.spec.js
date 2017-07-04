import paper from 'paper';
import PaperGroupRectangleMulti from 'Application/Viewer/Shapes/PaperGroupRectangleMulti';

fdescribe('PaperGroupRectangleMulti Test Suite', () => {
  function setupPaperJs() {
    const canvas = document.createElement('canvas');
    paper.setup(canvas);
  }

  beforeEach(setupPaperJs);

  it('can be created', () => {
    const shapes = [];
    const group = new PaperGroupRectangleMulti(null, null, shapes, null);
    expect(group).toEqual(jasmine.any(PaperGroupRectangleMulti));
  });
});