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

  describe('subgroup creation', () => {
    let shapes;
    let group;
    beforeEach(() => {
      group = createMultiRectangle();
    });

    it('creates a group for every shape upon instantation', () => {
      // two groups, four names = 6
      expect(group.children.length).toEqual(6);
    });

    it('sets the correct values for the first group', () => {
      const firstGroupShapeBounds = group.children[0].bounds;
      expect(firstGroupShapeBounds.x).toEqual(firstShape.bounds.x - PaperGroupRectangleMulti.PADDING);
      expect(firstGroupShapeBounds.y).toEqual(firstShape.bounds.y - PaperGroupRectangleMulti.PADDING);
      expect(firstGroupShapeBounds.width).toEqual(firstShape.bounds.width + (2 * PaperGroupRectangleMulti.PADDING));
      expect(firstGroupShapeBounds.height).toEqual(firstShape.bounds.height + (2 * PaperGroupRectangleMulti.PADDING));
    });

    it('sets the correct values for the second group', () => {
      const secondGroupShapeBounds = group.children[1].bounds;
      expect(secondGroupShapeBounds.x).toEqual(secondShape.bounds.x - PaperGroupRectangleMulti.PADDING);
      expect(secondGroupShapeBounds.y).toEqual(secondShape.bounds.y - PaperGroupRectangleMulti.PADDING);
      expect(secondGroupShapeBounds.width).toEqual(secondShape.bounds.width + (2 * PaperGroupRectangleMulti.PADDING));
      expect(secondGroupShapeBounds.height).toEqual(secondShape.bounds.height + (2 * PaperGroupRectangleMulti.PADDING));
    });

    it('ignores PaperGroupRectangles passed into the constructor', () => {
      const thirdShape = new PaperGroupRectangle(labeledThingGroupInFrame, null, null, null, color);
      shapes = [firstShape, secondShape, thirdShape];
      group = new PaperGroupRectangleMulti(paperShapeGroupNameService, labeledThingGroupInFrame, null, shapes, color);

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
        height: 251,
      };

      expect(group.bounds).toEqual(expectedBounds);
      expect(group.children.length).toEqual(6);
    });
  });

  describe('multiple subgroup operations', () => {
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

    describe('select()', () => {
      it('selects every child', () => {
        spyOn(firstChild, 'select');
        spyOn(secondChild, 'select');

        group.select();

        expect(firstChild.select).toHaveBeenCalledTimes(1);
        expect(secondChild.select).toHaveBeenCalledTimes(1);
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
        const boundsOne = {point: {}, width: 1, height: 1};
        const boundsTwo = {point: {}, width: 1, height: 1};
        const allBounds = [boundsOne, boundsTwo];
        spyOn(firstChild, 'setSize');
        spyOn(secondChild, 'setSize');

        group.setSize(allBounds);

        expect(firstChild.setSize).toHaveBeenCalledWith(boundsOne.point, boundsOne.width, boundsOne.height);
        expect(secondChild.setSize).toHaveBeenCalledWith(boundsTwo.point, boundsTwo.width, boundsTwo.height);
      });

      it('throws an error if more bounds are passed than children exist', () => {
        const boundsOne = {point: {}, width: 1, height: 1};
        const boundsTwo = {point: {}, width: 1, height: 1};
        const boundsThree = {point: {}, width: 1, height: 1};
        const allBounds = [boundsOne, boundsTwo, boundsThree];

        function throwWrapper() {
          group.setSize(allBounds);
        }

        const typeError = new TypeError('Cannot read property \'setSize\' of undefined');
        expect(throwWrapper).toThrow(typeError);
      });
    });

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

    describe('addPadding', () => {
      const paddingTestGroupId = 'padding-test';

      beforeEach(() => {
        labeledThingGroupInFrame.labeledThingGroup = {
          id: paddingTestGroupId,
        };

        firstShape.groupIds = [];
        secondShape.groupIds = [];

        spyOn(things[0], 'addPadding');
        spyOn(things[1], 'addPadding');
      });

      it('adds a padding of 5 to every child', () => {
        group.update();

        expect(things[0].addPadding).toHaveBeenCalledWith(5);
        expect(things[1].addPadding).toHaveBeenCalledWith(5);
      });

      it('adds a padding of 10 if shape already has another group', () => {
        firstShape.groupIds = ['other-group'];

        group.update();

        expect(things[0].addPadding).toHaveBeenCalledWith(10);
        expect(things[1].addPadding).toHaveBeenCalledWith(5);
      });

      it('adds the padding corresponding to the group ids position in the shapes groups (one shape)', () => {
        secondShape.groupIds = [
          'first-group',
          'second-group',
          'third-group',
          paddingTestGroupId,
        ];

        group.update();

        expect(things[0].addPadding).toHaveBeenCalledWith(5);
        expect(things[1].addPadding).toHaveBeenCalledWith(20);
      });

      it('adds the padding corresponding to the group ids position in the shapes groups (two shape)', () => {
        firstShape.groupIds = [
          'first-group',
          paddingTestGroupId,
        ];

        secondShape.groupIds = [
          'first-group',
          'second-group',
          paddingTestGroupId,
        ];

        group.addPadding();

        expect(firstChild.addPadding).toHaveBeenCalledWith(10);
        expect(secondChild.addPadding).toHaveBeenCalledWith(15);
      });
    });

    describe('toJSON', () => {
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
        // use group.position in any way, so that eslint is happy ^^
        expect(group.position).toBe(4);
      }
      expect(throwWrapper).toThrowError('Cannot determine position of multiple rectangles');
    });
  });
});
