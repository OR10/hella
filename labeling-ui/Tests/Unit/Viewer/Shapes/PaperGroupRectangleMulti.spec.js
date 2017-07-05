import paper from 'paper';
import PaperGroupRectangleMulti from 'Application/Viewer/Shapes/PaperGroupRectangleMulti';
import PaperGroupRectangle from 'Application/Viewer/Shapes/PaperGroupRectangle';

fdescribe('PaperGroupRectangleMulti Test Suite', () => {
  let firstShape;
  let secondShape;
  let labeledThingGroupInFrame;
  let color;

  beforeEach(() => {
    firstShape = {
      bounds: {x: 1, y: 1, width: 10, height: 10},
    };
    secondShape = {
      bounds: {x: 2, y: 2, width: 20, height: 20},
    };
    labeledThingGroupInFrame = {
      id: 'foobar-heinz'
    };
    color = {
      primary: 'first-color',
      secondary: 'second-color'
    };
  });

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

  describe('subgroup creation', () => {
    let shapes;
    let group;
    beforeEach(() => {
      shapes = [firstShape, secondShape];
      group = new PaperGroupRectangleMulti(labeledThingGroupInFrame, null, shapes, color);
    });

    it('creates a group for every shape upon instantation', () => {
      expect(group.children.length).toEqual(2);
    });

    it('sets the correct values for the first group', () => {
      const firstGroupShapeBounds = group.children[0].bounds;
      expect(firstGroupShapeBounds.x).toEqual(firstShape.bounds.x);
      expect(firstGroupShapeBounds.y).toEqual(firstShape.bounds.y);
      expect(firstGroupShapeBounds.width).toEqual(firstShape.bounds.width);
      expect(firstGroupShapeBounds.height).toEqual(firstShape.bounds.height);
    });

    it('sets the correct values for the second group', () => {
      const secondGroupShapeBounds = group.children[1].bounds;
      expect(secondGroupShapeBounds.x).toEqual(secondShape.bounds.x);
      expect(secondGroupShapeBounds.y).toEqual(secondShape.bounds.y);
      expect(secondGroupShapeBounds.width).toEqual(secondShape.bounds.width);
      expect(secondGroupShapeBounds.height).toEqual(secondShape.bounds.height);
    });

    it('ignores PaperGroupRectangles passed into the constructor', () => {
      const thirdShape = new PaperGroupRectangle(labeledThingGroupInFrame, null, null, null, color);
      shapes = [firstShape, secondShape, thirdShape];
      group = new PaperGroupRectangleMulti(labeledThingGroupInFrame, null, shapes, color);

      expect(group.children.length).toEqual(2);
    });
  });

  describe('bounds', () => {
    it('returns a rectangle containing all shapes', () => {
      const thirdShape = {
        bounds: {x: 200, y: 2, width: 100, height: 250},
      };
      const shapes = [firstShape, secondShape, thirdShape];
      const group = new PaperGroupRectangleMulti(labeledThingGroupInFrame, null, shapes, color);

      const expectedBounds = {
        x: 1,
        y: 1,
        width: 299,
        height: 251
      };

      expect(group.bounds).toEqual(expectedBounds);
    });
  });
});