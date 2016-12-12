import LabelStructure from 'Application/Task/Model/LabelStructure';
import LabelStructureThing from 'Application/Task/Model/LabelStructureThing';

describe('LabelStructure', () => {
  class MockedLabelStructure extends LabelStructure {
    getEnabledThingClassesForThingAndClassList(thing, classList) { // eslint-disable-line no-unused-vars
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

  it('should tell if thing with identifier is present', () => {
    const isThing = structure.isThingDefinedById('mocked-thing-1');
    expect(isThing).toBeTruthy();
  });

  it('should tell if thing with identifier is not present', () => {
    const isThing = structure.isThingDefinedById('some-non-existent-id');
    expect(isThing).toBeFalsy();
  });
});
