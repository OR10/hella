import LabeledThingInFrameDataContainer from 'Application/LabelingData/Support/LabeledThingInFrameDataContainer';
import LabeledThing from 'Application/LabelingData/Models/LabeledThing';
import LabeledThingInFrame from 'Application/LabelingData/Models/LabeledThingInFrame';

describe('LabeledThingInFrameDataContainer', () => {
  it('should invalidate data for a single LabeledThing', () => {
    const dataContainer = new LabeledThingInFrameDataContainer();

    const labeledThing = new LabeledThing({id: 42});
    const otherLabeledThing = new LabeledThing({id: 4711});
    const anotherLabeledThing = new LabeledThing({id: 1337});

    const firstFrameData = [
      new LabeledThingInFrame({
        id: 1,
        labeledThing: labeledThing,
      }),
      new LabeledThingInFrame({
        id: 2,
        labeledThing: otherLabeledThing,
      }),
    ];

    const secondFrameData = [
      new LabeledThingInFrame({
        id: 3,
        labeledThing: labeledThing,
      }),
      new LabeledThingInFrame({
        id: 4,
        labeledThing: otherLabeledThing,
      }),
      new LabeledThingInFrame({
        id: 5,
        labeledThing: anotherLabeledThing,
      }),
    ];

    const thirdFrameData = [
      new LabeledThingInFrame({
        id: 6,
        labeledThing: labeledThing,
      }),
      new LabeledThingInFrame({
        id: 7,
        labeledThing: anotherLabeledThing,
      }),
    ];

    const expectedFirstFrameData = [
      new LabeledThingInFrame({
        id: 2,
        labeledThing: otherLabeledThing,
      }),
    ];

    const expectedSecondFrameData = [
      new LabeledThingInFrame({
        id: 4,
        labeledThing: otherLabeledThing,
      }),
      new LabeledThingInFrame({
        id: 5,
        labeledThing: anotherLabeledThing,
      }),
    ];

    const expectedThirdFrameData = [
      new LabeledThingInFrame({
        id: 7,
        labeledThing: anotherLabeledThing,
      }),
    ];

    dataContainer.set(1, firstFrameData);
    dataContainer.set(2, secondFrameData);
    dataContainer.set(3, thirdFrameData);

    dataContainer.invalidateLabeledThing(labeledThing);

    expect(dataContainer.get(1)).toEqual(expectedFirstFrameData);
    expect(dataContainer.get(2)).toEqual(expectedSecondFrameData);
    expect(dataContainer.get(3)).toEqual(expectedThirdFrameData);
  });

  it('should replace data for a single labeled thing', () => {
    const dataContainer = new LabeledThingInFrameDataContainer();

    const labeledThing = new LabeledThing({id: 42});
    const otherLabeledThing = new LabeledThing({id: 4711});

    const labeledThingInFrame = new LabeledThingInFrame({
      id: 1,
      frameNumber: 1,
      labeledThing: labeledThing,
    });

    const otherLabeledThingInFrame = new LabeledThingInFrame({
      id: 2,
      frameNumber: 1,
      labeledThing: otherLabeledThing,
    });

    const newLabeledThingInFrame = new LabeledThingInFrame({
      id: 3,
      frameNumber: 1,
      labeledThing: labeledThing,
    });

    dataContainer.set(1, [labeledThingInFrame, otherLabeledThingInFrame]);

    dataContainer.setLabeledThingData(labeledThing, [newLabeledThingInFrame]);

    expect(dataContainer.get(1)).toEqual([otherLabeledThingInFrame, newLabeledThingInFrame]);
  });
});
