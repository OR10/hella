import LabeledObject from 'Application/LabelingData/Models/LabeledObject';

describe('LabeledObject', () => {
  beforeEach(() => {
  });

  using([
   [{
     id: '123',
     rev: '456',
     classes: ['foo', 'bar'],
     incomplete: true,
   }],
   [{
     id: 'abc',
     classes: ['baz', 'bar'],
     incomplete: false,
   }],
  ], labeledObjectData => {
    it('should take a labeledObject POJO for initialization', () => {
      const labeledObject = new LabeledObject(labeledObjectData);

      Object.keys(labeledObjectData).forEach(property => {
        expect(labeledObject[property]).toEqual(labeledObjectData[property]);
      });
    });
  });

  it('should ensure classes are unique', () => {
    const labeledObject = new LabeledObject({
      id: '123',
      rev: '456',
      classes: ['foo', 'bar'],
      incomplete: true,
    });

    labeledObject.setClasses(['blib', 'blub', 'blib']);

    expect(labeledObject.classes).toEqual(['blib', 'blub']);
  });

  it('should allow classes to be added', () => {
    const labeledObject = new LabeledObject({
      id: '123',
      rev: '456',
      classes: ['foo', 'bar'],
      incomplete: true,
    });

    labeledObject.addClass('baz');

    expect(labeledObject.classes).toEqual(['foo', 'bar', 'baz']);
  });
});
