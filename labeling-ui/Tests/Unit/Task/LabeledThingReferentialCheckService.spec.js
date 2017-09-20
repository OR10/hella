import {inject} from 'angular-mocks';

import LabeledThingReferentialCheckService from 'Application/Task/Services/LabeledThingReferentialCheckService';
import LabeledThingInFrame from 'Application/LabelingData/Models/LabeledThingInFrame';
import LabeledThing from 'Application/LabelingData/Models/LabeledThing';

import Task from 'Application/Task/Model/Task';
import TaskFrontendModel from 'Tests/Fixtures/Models/Frontend/Task';

describe('LabeledThingReferentialCheckService', () => {
  let angularQ;
  let rootScope;

  beforeEach(inject(($q, $rootScope) => {
    angularQ = $q;
    rootScope = $rootScope;
  }));

  function createTask(id = 'TASK-ID') {
    return new Task(Object.assign({}, TaskFrontendModel.toJSON(), {id}));
  }

  function createLabeledThing(task) {
    return new LabeledThing({
      task,
      id: 'LABELED-THING',
      lineColor: 3,
      classes: task.predefinedClasses || [],
      incomplete: true,
      frameRange: {
        startFrameIndex: 0,
        endFrameIndex: 3,
      },
    });
  }

  function createLabeledThingInFrame(labeledThing) {
    return new LabeledThingInFrame({
      id: 'LABELED-THING-IN-FRAME',
      classes: [],
      ghostClasses: null,
      incomplete: true,
      frameIndex: 3,
      labeledThing: labeledThing,
      identifierName: 'foobar',
      shapes: [],
    });
  }

  it('ltif should be inside frame range', () => {
    const task = createTask();
    const labeledThing = createLabeledThing(task);
    const labeledThingInFrame = createLabeledThingInFrame(labeledThing);

    const labeledThingGateway = jasmine.createSpyObj('labeledThingGateway', ['getAssociatedLabeledThingsInFrames']);
    labeledThingGateway.getAssociatedLabeledThingsInFrames.and.returnValue(angularQ.resolve({rows: [{doc: labeledThingInFrame}]}));

    const service = new LabeledThingReferentialCheckService(angularQ, labeledThingGateway);

    service.isAtLeastOneLabeledThingInFrameInRange(task, labeledThing, 1, 3).then(
      isLabeledThingInFrame => {
        expect(isLabeledThingInFrame).toBe(true);
      }
    );

    rootScope.$digest();
  });

  it('ltif should be not inside frame range', () => {
    const task = createTask();
    const labeledThing = createLabeledThing(task);
    const labeledThingInFrame = createLabeledThingInFrame(labeledThing);

    const labeledThingGateway = jasmine.createSpyObj('labeledThingGateway', ['getAssociatedLabeledThingsInFrames']);
    labeledThingGateway.getAssociatedLabeledThingsInFrames.and.returnValue(angularQ.resolve({rows: [{doc: labeledThingInFrame}]}));

    const service = new LabeledThingReferentialCheckService(angularQ, labeledThingGateway);

    service.isAtLeastOneLabeledThingInFrameInRange(task, labeledThing, 5, 7).then(
      isLabeledThingInFrame => {
        expect(isLabeledThingInFrame).toBe(false);
      }
    );

    rootScope.$digest();
  });
});
