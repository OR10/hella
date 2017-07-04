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

  it('creates a group for every shape upon instantation', () => {
    const firstShape = {
      bounds: {x: 1, y: 1, width: 10, height: 10},
    };
    const secondShape = {
      bounds: {x: 2, y: 2, width: 20, height: 20},
    };
    const labeledThingGroupInFrame = {
      id: 'foobar-heinz'
    };
    const color = {
      primary: 'first-color',
      secondary: 'second-color'
    };

    const shapes = [firstShape, secondShape];
    const group = new PaperGroupRectangleMulti(labeledThingGroupInFrame, null, shapes, color);
    const groupRectangles = group.children;
    expect(groupRectangles.length).toEqual(2);
  });
});