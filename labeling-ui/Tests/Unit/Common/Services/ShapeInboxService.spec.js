import ShapeInboxService from 'Application/Common/Services/ShapeInboxService';

fdescribe('ShapeInboxService', () => {
  let shape1;
  let shape2;
  let shape3;
  let allShapes;
  let shapesOneAndThree;
  let shapesTwoAndThree;

  beforeEach(() => {
    shape1 = {shape: {id: 'foobar'}, label: 'Rectangle #3', labelStructureObject: {}};
    shape2 = {shape: {id: 'heinz'}, label: 'Pedestrian #1', labelStructureObject: {}};
    shape3 = {shape: {id: 'bernddasbrot'}, label: 'Car #2', labelStructureObject: {}};
    allShapes = [shape1, shape2, shape3];
    shapesOneAndThree = [shape1, shape3];
    shapesTwoAndThree = [shape2, shape3];

  });

  it('can be created', () => {
    const inbox = new ShapeInboxService();
    expect(inbox).toEqual(jasmine.any(ShapeInboxService));
  });

  describe('addShape', () => {
    it('only adds a shape once', () => {
      const inbox = new ShapeInboxService();

      inbox.addShape(shape1);
      inbox.addShape(shape1);

      expect(inbox.count()).toEqual(1);
    });

    it('adds two different shapes', () => {
      const inbox = new ShapeInboxService();

      inbox.addShape(shape1);
      inbox.addShape(shape2);

      expect(inbox.count()).toEqual(2);
    });
  });

  describe('addShapes', () => {
    it('adds multiple shapes with one call', () => {
      const inbox = new ShapeInboxService();

      inbox.addShapes(allShapes);

      expect(inbox.count()).toEqual(3);
      expect(inbox.getAllShapes()).toEqual(allShapes);
    });

    it('only adds the shapes once', () => {
      const inbox = new ShapeInboxService();

      inbox.addShapes(allShapes);
      inbox.addShapes(allShapes);

      expect(inbox.count()).toEqual(3);
      expect(inbox.getAllShapes()).toEqual(allShapes);
    });

    it('does not remove previously added shapes', () => {
      const inbox = new ShapeInboxService();

      inbox.addShape(shape1);
      inbox.addShapes(shapesTwoAndThree);

      expect(inbox.count()).toEqual(3);
      expect(inbox.getAllShapes()).toEqual(allShapes);
    });
  });

  describe('removeShape', () => {
    it('does nothing if the shape is not known', () => {
      const inbox = new ShapeInboxService();

      inbox.removeShape(shape1);

      expect(inbox.count()).toEqual(0);
    });

    it('removes a previously added shape', () => {
      const inbox = new ShapeInboxService();

      inbox.addShape(shape1);
      expect(inbox.count()).toEqual(1);

      inbox.removeShape(shape1);
      expect(inbox.count()).toEqual(0);
    });

    it('only removes a shape once', () => {
      const inbox = new ShapeInboxService();

      inbox.addShape(shape1);
      expect(inbox.count()).toEqual(1);

      inbox.removeShape(shape1);
      inbox.removeShape(shape1);
      expect(inbox.count()).toEqual(0);
    });

    it('removes the correct shape', () => {
      const inbox = new ShapeInboxService();
      const allShapesExpected = [shape2];

      inbox.addShape(shape1);
      inbox.addShape(shape2);
      inbox.removeShape(shape1);

      expect(inbox.count()).toEqual(1);
      expect(inbox.getAllShapes()).toEqual(allShapesExpected);
    });
  });

  describe('getAllShapes', () => {
    it('returns an empty array by default', () => {
      const inbox = new ShapeInboxService();
      const shapes = inbox.getAllShapes();
      expect(shapes).toEqual([]);
    });

    it('returns an array with alle the shapes', () => {
      const inbox = new ShapeInboxService();

      inbox.addShape(shape1);
      inbox.addShape(shape2);
      inbox.addShape(shape3);

      expect(inbox.getAllShapes()).toEqual(allShapes);

      inbox.removeShape(shape2);

      expect(inbox.getAllShapes()).toEqual(shapesOneAndThree);
    });
  });

  describe('clear', () => {
    it('does nothing by default', () => {
      const inbox = new ShapeInboxService();
      inbox.clear();
      expect(inbox.count()).toEqual(0);
    });

    it('removes all the shapes', () => {
      const inbox = new ShapeInboxService();

      inbox.addShape(shape1);
      inbox.addShape(shape2);
      inbox.addShape(shape3);
      inbox.clear();

      expect(inbox.count()).toEqual(0);
      expect(inbox.getAllShapes()).toEqual([]);
    });
  });

  describe('count()', () => {
    it('returns 0 by default', () => {
      const inbox = new ShapeInboxService();
      expect(inbox.count()).toEqual(0);
    });

    // All other test cases can be found within the addShape and removeShape test cases
  });
});
