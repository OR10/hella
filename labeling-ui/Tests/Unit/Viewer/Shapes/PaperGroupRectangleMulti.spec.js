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

  function createMultiRectangle(shapes = createDefaultShapesArray()) {
    return new PaperGroupRectangleMulti(labeledThingGroupInFrame, null, shapes, color);
  }

  function createDefaultShapesArray() {
    return [firstShape, secondShape];
  }

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
      group = createMultiRectangle();
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
      const group = createMultiRectangle(shapes);

      const expectedBounds = {
        x: 1,
        y: 1,
        width: 299,
        height: 251
      };

      expect(group.bounds).toEqual(expectedBounds);
    });
  });

  describe('multiple subgroup operations', () => {
    let group;
    let firstChild;
    let secondChild;

    beforeEach(() => {
      group = createMultiRectangle();
      firstChild = group.children[0];
      secondChild = group.children[1];
    });

    describe('select()', () => {
      it('selects every child', () => {

        spyOn(firstChild, 'select');
        spyOn(secondChild, 'select');

        group.select();

        expect(firstChild.select).toHaveBeenCalledTimes(1);
        expect(secondChild.select).toHaveBeenCalledTimes(1);
      });
    });

    describe('deselect()', () => {
      it('deselects every child', () => {

        spyOn(firstChild, 'deselect');
        spyOn(secondChild, 'deselect');

        group.deselect();

        expect(firstChild.deselect).toHaveBeenCalledTimes(1);
        expect(secondChild.deselect).toHaveBeenCalledTimes(1);
      });
    });

    describe('moveTo()', () => {
      it('moves every child', () => {

        spyOn(firstChild, 'moveTo');
        spyOn(secondChild, 'moveTo');

        group.moveTo();

        expect(firstChild.moveTo).toHaveBeenCalledTimes(1);
        expect(secondChild.moveTo).toHaveBeenCalledTimes(1);
      });
    });

    describe('resize()', () => {
      it('resizes every child', () => {

        spyOn(firstChild, 'resize');
        spyOn(secondChild, 'resize');

        group.resize();

        expect(firstChild.resize).toHaveBeenCalledTimes(1);
        expect(secondChild.resize).toHaveBeenCalledTimes(1);
      });
    });

    describe('fixOrientation()', () => {
      it('fixes orientation every child', () => {

        spyOn(firstChild, 'fixOrientation');
        spyOn(secondChild, 'fixOrientation');

        group.fixOrientation();

        expect(firstChild.fixOrientation).toHaveBeenCalledTimes(1);
        expect(secondChild.fixOrientation).toHaveBeenCalledTimes(1);
      });
    });

    describe('setSize()', () => {
      it('sets the size for every child', () => {

      });
    });

    describe('addPadding', () => {
      it('adds padding to every child', () => {

      });
    });
  });

  describe('getClass', () => {
    it('returns "group-rectangle"', () => {
      const group = createMultiRectangle();
      const className = group.getClass();
      expect(className).toEqual('group-rectangle');
    });
  });

  describe('getToolActionIdentifier', () => {
    it('returns "move"', () => {
      const group = createMultiRectangle();
      const toolActionIdentifier = group.getToolActionIdentifier();
      expect(toolActionIdentifier).toEqual('move');
    });
  });

  describe('getCursor', () => {
    it('returns "pointer"', () => {
      const group = createMultiRectangle();
      const cursor = group.getCursor();
      expect(cursor).toEqual('pointer');
    });
  });

  describe('position', () => {
    it('throws an error since the position of multi group cannnot be determined', () => {
      const group = createMultiRectangle();
      function throwWrapper() {
        const position = group.position;
      }
      expect(throwWrapper).toThrowError('Cannot determine position of multiple rectangles')
    });
  });

});