import LabelStructure from 'Application/Task/Model/LabelStructure';
import LabelStructureThing from 'Application/Task/Model/LabelStructureThing';
import LabelStructureGroup from 'Application/Task/Model/LabelStructureGroup';
import LabelStructureFrame from 'Application/Task/Model/LabeledStructureFrame';

describe('LabelStructure', () => {
  class MockedLabelStructure extends LabelStructure {
    getEnabledClassesForLabeledObjectAndClassList(labeledObject, classList) { // eslint-disable-line no-unused-vars
      return {
        name: 'mocked-class-result',
        metadata: {challenge: 'Foo'},
        children: [{name: 'mocked-value', metadata: {response: 'Bar'}}],
      };
    }

    getThings() {
      const things = new Map();
      things.set('mocked-thing-1', new LabelStructureThing('mocked-thing-1', 'Mocked Thing One', 'rectangle'));
      things.set('mocked-thing-2', new LabelStructureThing('mocked-thing-2', 'Mocked Thing Two', 'pedestrian'));

      return things;
    }

    getGroups() {
      const groups = new Map();

      groups.set('mocked-group-1', new LabelStructureGroup('mocked-group-1', 'Mocked Group One', 'group-rectangle'));
      groups.set('mocked-group-2', new LabelStructureGroup('mocked-group-2', 'Mocked Group Two', 'group-rectangle'));

      return groups;
    }

    getRequirementFrames() {
      const frames = new Map();

      frames.set('mocked-frame-1', new LabelStructureFrame('mocked-frame-1', 'Mocked Frame One', 'frame'));
      frames.set('mocked-frame-2', new LabelStructureFrame('mocked-frame-2', 'Mocked Frame Two', 'frame'));

      return frames;
    }
  }

  let structure;

  beforeEach(() => {
    structure = new MockedLabelStructure();
  });

  it('should be instantiable without arguments', () => {
    expect(structure instanceof LabelStructure).toBeTruthy();
  });

  it('should provide thing with specific id correctly (1)', () => {
    const retrievedThing = structure.getThingById('mocked-thing-1');
    const expectedThing = new LabelStructureThing('mocked-thing-1', 'Mocked Thing One', 'rectangle');

    expect(retrievedThing).toEqual(expectedThing);
  });

  it('should provide thing with specific id correctly (2)', () => {
    const retrievedThing = structure.getThingById('mocked-thing-2');
    const expectedThing = new LabelStructureThing('mocked-thing-2', 'Mocked Thing Two', 'pedestrian');

    expect(retrievedThing).toEqual(expectedThing);
  });

  it('should throw if thing with non existent id is requested', () => {
    expect(
      () => structure.getThingById('nonExistentThing')
    ).toThrow();
  });

  it('should provide group with specific id correctly (1)', () => {
    const retrievedGroup = structure.getGroupById('mocked-group-1');
    const expectedGroup = new LabelStructureGroup('mocked-group-1', 'Mocked Group One', 'group-rectangle');

    expect(retrievedGroup).toEqual(expectedGroup);
  });

  it('should provide frame with specific id correctly (2)', () => {
    const retrievedGroup = structure.getGroupById('mocked-group-2');
    const expectedGroup = new LabelStructureGroup('mocked-group-2', 'Mocked Group Two', 'group-rectangle');

    expect(retrievedGroup).toEqual(expectedGroup);
  });

  it('should throw if frame with non existent id is requested', () => {
    expect(
      () => structure.getGroupById('nonExistentGroup')
    ).toThrow();
  });

  it('should provide frame with specific id correctly (1)', () => {
    const retrievedFrame = structure.getRequirementFrameById('mocked-frame-1');
    const expectedFrame = new LabelStructureFrame('mocked-frame-1', 'Mocked Frame One', 'frame');

    expect(retrievedFrame).toEqual(expectedFrame);
  });

  it('should provide frame with specific id correctly (2)', () => {
    const retrievedFrame = structure.getRequirementFrameById('mocked-frame-2');
    const expectedFrame = new LabelStructureFrame('mocked-frame-2', 'Mocked Frame Two', 'frame');

    expect(retrievedFrame).toEqual(expectedFrame);
  });

  it('should throw if frame with non existent id is requested', () => {
    expect(
      () => structure.getRequirementFramesById('nonExistentFrame')
    ).toThrow();
  });

  it('should tell if thing with identifier is present', () => {
    const isThing = structure.isThingDefinedById('mocked-thing-1');
    expect(isThing).toBeTruthy();
  });

  it('should tell if thing with identifier is not present', () => {
    const isThing = structure.isThingDefinedById('some-non-existent-id');
    expect(isThing).toBeFalsy();
  });

  it('should tell if group with identifier is present', () => {
    const isGroup = structure.isGroupDefinedById('mocked-group-1');
    expect(isGroup).toBeTruthy();
  });

  it('should tell if group with identifier is not present', () => {
    const isGroup = structure.isGroupDefinedById('some-non-existent-id');
    expect(isGroup).toBeFalsy();
  });

  it('should tell if frame with identifier is present', () => {
    const isFrame = structure.isRequirementFrameDefinedById('mocked-frame-1');
    expect(isFrame).toBeTruthy();
  });

  it('should tell if frame with identifier is not present', () => {
    const isFrame = structure.isRequirementFrameDefinedById('some-non-existent-id');
    expect(isFrame).toBeFalsy();
  });
});
