import paper from 'paper';
import PaperGroupRectangleMulti from 'Application/Viewer/Shapes/PaperGroupRectangleMulti';
import PaperGroupRectangle from 'Application/Viewer/Shapes/PaperGroupRectangle';
import PaperShapeGroupNameService from 'Application/Viewer/Services/GroupShapeNameService';

describe('PaperGroupRectangleMulti', () => {
  let firstShape;
  let secondShape;
  let labeledThingGroupInFrame;
  let color;
  let paperShapeGroupNameService;

  const shapeId = 'multi-shape-id';

  beforeEach(() => {
    firstShape = {
      bounds: {x: 100, y: 100, width: 10, height: 10},
      groupIds: [
        'GROUPID-1',
      ],
    };
    secondShape = {
      bounds: {x: 40, y: 40, width: 40, height: 40},
      groupIds: [
        'GROUPID-1',
      ],
    };
    labeledThingGroupInFrame = {
      id: 'foobar-heinz',
      labeledThingGroup: {
        id: 'GROUPID-1',
      },
    };
    color = {
      primary: 'first-color',
      secondary: 'second-color',
    };
    paperShapeGroupNameService = new PaperShapeGroupNameService();
  });

  function createDefaultShapesArray() {
    return [firstShape, secondShape];
  }

  function createMultiRectangle(shapes = createDefaultShapesArray()) {
    return new PaperGroupRectangleMulti(paperShapeGroupNameService, labeledThingGroupInFrame, shapeId, shapes, color);
  }

  function setupPaperJs() {
    const canvas = document.createElement('canvas');
    paper.setup(canvas);
  }

  beforeEach(setupPaperJs);

  it('can be created', () => {
    const shapes = [];
    const group = new PaperGroupRectangleMulti(paperShapeGroupNameService, null, null, shapes, null);
    expect(group).toEqual(jasmine.any(PaperGroupRectangleMulti));
  });

  it('creates a group rectangle and two text indicators for every shape upon instantiation', () => {
    const group = createMultiRectangle();
    // two groups, four names (text) = 6
    expect(group.children.length).toEqual(6);
  });

  it('sets the correct values for the first shape group', () => {
    const group = createMultiRectangle();
    const firstGroupShapeBounds = group.children[0].bounds;
    expect(firstGroupShapeBounds.x).toEqual(firstShape.bounds.x - PaperGroupRectangleMulti.PADDING);
    expect(firstGroupShapeBounds.y).toEqual(firstShape.bounds.y - PaperGroupRectangleMulti.PADDING);
    expect(firstGroupShapeBounds.width).toEqual(firstShape.bounds.width + (2 * PaperGroupRectangleMulti.PADDING));
    expect(firstGroupShapeBounds.height).toEqual(firstShape.bounds.height + (2 * PaperGroupRectangleMulti.PADDING));
  });

  it('sets the correct values for the second shape group', () => {
    const group = createMultiRectangle();
    const secondGroupShapeBounds = group.children[1].bounds;
    expect(secondGroupShapeBounds.x).toEqual(secondShape.bounds.x - PaperGroupRectangleMulti.PADDING);
    expect(secondGroupShapeBounds.y).toEqual(secondShape.bounds.y - PaperGroupRectangleMulti.PADDING);
    expect(secondGroupShapeBounds.width).toEqual(secondShape.bounds.width + (2 * PaperGroupRectangleMulti.PADDING));
    expect(secondGroupShapeBounds.height).toEqual(secondShape.bounds.height + (2 * PaperGroupRectangleMulti.PADDING));
  });

  it('should return a rectangle containing all group shapes including text indicators when asked for bounds', () => {
    const thirdShape = {
      bounds: {x: 200, y: 50, width: 100, height: 250},
      groupIds: [
        'GROUPID-1',
      ],
    };
    const shapes = [firstShape, secondShape, thirdShape];
    const group = createMultiRectangle(shapes);

    const expectedBounds = {
      x: 35,
      y: 19.2,
      width: 270,
      height: 306.4,
    };

    // A direct expect on (group.bounds) causes an endless loop in jasmine if values don't match
    const groupBounds = {
      x: group.bounds.x,
      y: group.bounds.y,
      width: group.bounds.width,
      height: group.bounds.height,
    };

    expect(groupBounds.x).toBeCloseTo(expectedBounds.x);
    expect(groupBounds.y).toBeCloseTo(expectedBounds.y);
    expect(groupBounds.width).toBeCloseTo(expectedBounds.width);
    expect(groupBounds.height).toBeCloseTo(expectedBounds.height);
  });

  it('should render a rectangle for each shape and group', () => {
    const group = createMultiRectangle();

    const groupRectangleChildren = group.children.filter(
      child => child instanceof PaperGroupRectangle
    );

    expect(groupRectangleChildren.length).toBe(2);
  });

  it('should render two text areas for each shape and group', () => {
    const group = createMultiRectangle();

    const groupRectangleChildren = group.children.filter(
      child => child instanceof PaperGroupRectangle
    );

    expect(groupRectangleChildren.length).toBe(2);
  });

  it('should render two text areas for each shape and group', () => {
    const group = createMultiRectangle();

    const groupRectangleChildren = group.children.filter(
      child => child instanceof paper.PointText
    );

    expect(groupRectangleChildren.length).toBe(4);
  });

  it('should return correct tool class', () => {
    const group = createMultiRectangle();
    const className = group.getClass();
    expect(className).toEqual('group-rectangle');
  });

  it('should return correct tool action identifier', () => {
    const group = createMultiRectangle();
    const toolActionIdentifier = group.getToolActionIdentifier();
    expect(toolActionIdentifier).toEqual('move');
  });

  it('should return correct mouse cursor', () => {
    const group = createMultiRectangle();
    const cursor = group.getCursor();
    expect(cursor).toEqual('pointer');
  });

  it('should throw an error if the position of the shape is requested', () => {
    const group = createMultiRectangle();

    function throwWrapper() {
      // use group.position in any way, so that eslint is happy ^^
      expect(group.position).toBe(4);
    }

    expect(throwWrapper).toThrowError('Cannot determine position of multiple rectangles');
  });

  it('should throw if a movement of the shape is issued', () => {
    expect(() => group.moveTo()).toThrow();
  });

  describe('Child Delegation', () => {
    let group;
    let things;
    let firstChild;
    let secondChild;

    beforeEach(() => {
      things = createDefaultShapesArray();
      group = createMultiRectangle(things);
      firstChild = group.children[0];
      secondChild = group.children[1];
    });

    it('should select every child', () => {
      spyOn(firstChild, 'select');
      spyOn(secondChild, 'select');

      group.select();

      expect(firstChild.select).toHaveBeenCalledTimes(1);
      expect(secondChild.select).toHaveBeenCalledTimes(1);
    });

    it('should deselect every child', () => {
      spyOn(firstChild, 'deselect');
      spyOn(secondChild, 'deselect');

      group.deselect();

      expect(firstChild.deselect).toHaveBeenCalledTimes(1);
      expect(secondChild.deselect).toHaveBeenCalledTimes(1);
    });

    describe('JSON Export', () => {
      const toJsonGroupId = 'to-json';

      beforeEach(() => {
        labeledThingGroupInFrame.labeledThingGroup = {
          id: toJsonGroupId,
        };
      });

      it('calls the toJSON method of every child', () => {
        spyOn(firstChild, 'toJSON');
        spyOn(secondChild, 'toJSON');

        group.toJSON();

        expect(firstChild.toJSON).toHaveBeenCalledTimes(1);
        expect(secondChild.toJSON).toHaveBeenCalledTimes(1);
      });

      it('returns the correct json object', () => {
        const firstChildJson = {first: 'child'};
        const secondChildJson = {second: 'child'};
        spyOn(firstChild, 'toJSON').and.returnValue(firstChildJson);
        spyOn(secondChild, 'toJSON').and.returnValue(secondChildJson);

        const expectedJsonObject = {
          type: 'group-rectangle-multi',
          id: shapeId,
          children: [firstChildJson, secondChildJson],
          labeledThingGroupId: toJsonGroupId,
        };

        const jsonObject = group.toJSON();

        expect(jsonObject).toEqual(expectedJsonObject);
      });
    });
  });
});
