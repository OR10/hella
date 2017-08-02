import ShapeSelectionService from 'Application/Viewer/Services/ShapeSelectionService';

fdescribe('ShapeSelectionService tests', () => {
  it('can be created', () => {
    const service = new ShapeSelectionService();
    expect(service).toEqual(jasmine.any(ShapeSelectionService));
  });

  describe('toggleShape', () => {
    it('adds a shape', () => {
      const service = new ShapeSelectionService();
      const shape = jasmine.createSpyObj('PaperShape', ['select']);
      shape.id = 'some-id';

      service.toggleShape(shape);

      expect(shape.select).toHaveBeenCalled();
      expect(service.count()).toEqual(1);
    });

    it('removes a shape', () => {
      const service = new ShapeSelectionService();
      const shape = jasmine.createSpyObj('PaperShape', ['select', 'deselect']);
      shape.id = 'some-id';

      service.toggleShape(shape);
      service.toggleShape(shape);

      expect(shape.select).toHaveBeenCalledTimes(1);
      expect(shape.deselect).toHaveBeenCalledTimes(1);
      expect(service.count()).toEqual(0);
    });

    it('adds two shapes', () => {
      const service = new ShapeSelectionService();
      const shapeOne = jasmine.createSpyObj('PaperShape', ['select']);
      shapeOne.id = 'some-id-1';
      const shapeTwo = jasmine.createSpyObj('PaperShape', ['select']);
      shapeTwo.id = 'some-id-2';

      service.toggleShape(shapeOne);
      service.toggleShape(shapeTwo);

      expect(shapeOne.select).toHaveBeenCalled();
      expect(shapeTwo.select).toHaveBeenCalled();
      expect(service.count()).toEqual(2);
    });

    it('adds three shapes and removes one shape', () => {
      const service = new ShapeSelectionService();
      const shapeOne = jasmine.createSpyObj('PaperShape', ['select']);
      shapeOne.id = 'some-id-1';
      const shapeTwo = jasmine.createSpyObj('PaperShape', ['select', 'deselect']);
      shapeTwo.id = 'some-id-2';
      const shapeThree = jasmine.createSpyObj('PaperShape', ['select']);
      shapeThree.id = 'some-id-3';

      service.toggleShape(shapeOne);
      service.toggleShape(shapeTwo);
      service.toggleShape(shapeThree);
      service.toggleShape(shapeTwo);

      expect(shapeOne.select).toHaveBeenCalled();
      expect(shapeTwo.select).toHaveBeenCalled();
      expect(shapeTwo.deselect).toHaveBeenCalled();
      expect(shapeThree.select).toHaveBeenCalled();
      expect(service.count()).toEqual(2);
    });
  });

  describe('count()', () => {
    it('returns 0 by default', () => {
      const service = new ShapeSelectionService();

      const count = service.count();

      expect(count).toEqual(0);
    });
  });

  describe('clear', () => {
    it('removes all the shapes and deselects them', () => {
      const service = new ShapeSelectionService();
      const shapeOne = jasmine.createSpyObj('PaperShape', ['select', 'deselect']);
      shapeOne.id = 'some-id-1';
      const shapeTwo = jasmine.createSpyObj('PaperShape', ['select', 'deselect']);
      shapeTwo.id = 'some-id-2';
      const shapeThree = jasmine.createSpyObj('PaperShape', ['select', 'deselect']);
      shapeThree.id = 'some-id-3';

      service.toggleShape(shapeOne);
      service.toggleShape(shapeTwo);
      service.toggleShape(shapeThree)

      service.clear();
      const count = service.count();

      expect(shapeOne.deselect).toHaveBeenCalled();
      expect(shapeTwo.deselect).toHaveBeenCalled();
      expect(shapeThree.deselect).toHaveBeenCalled();
      expect(count).toEqual(0);
    });
  });
});