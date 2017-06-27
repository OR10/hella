import LabeledObject from 'Application/LabelingData/Models/LabeledObject';

import Task from 'Application/Task/Model/Task';
import TaskFrontendModel from 'Tests/Fixtures/Models/Frontend/Task';

describe('LabeledObject', () => {
  function createTask(id = 'TASK-ID') {
    return new Task(Object.assign({}, TaskFrontendModel.toJSON(), {id}));
  }

  beforeEach(() => {
  });

  using([
   [{
     id: '123',
     classes: ['foo', 'bar'],
     incomplete: true,
     task: createTask(),
   }],
   [{
     id: 'abc',
     classes: ['baz', 'bar'],
     incomplete: false,
     task: createTask(),
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
      classes: ['foo', 'bar'],
      incomplete: true,
      task: createTask(),
    });

    labeledObject.setClasses(['blib', 'blub', 'blib']);

    expect(labeledObject.classes).toEqual(['blib', 'blub']);
  });

  it('should allow classes to be added', () => {
    const labeledObject = new LabeledObject({
      id: '123',
      classes: ['foo', 'bar'],
      incomplete: true,
      task: createTask(),
    });

    labeledObject.addClass('baz');

    expect(labeledObject.classes).toEqual(['foo', 'bar', 'baz']);
  });
});
