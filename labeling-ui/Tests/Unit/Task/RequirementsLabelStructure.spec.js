import RequirementsLabelStructure from 'Application/Task/Model/LabelStructure/RequirementsLabelStructure';
import LabelStructureThing from 'Application/Task/Model/LabelStructureThing';

import requirementsXmlData from 'Tests/Fixtures/LabelStructure/requirements.xml!text';
import signTypeEmptyClassListThingClasses from 'Tests/Fixtures/LabelStructure/requirements/signType/empty.json!';
import signTypeUTurnClassListThingClasses from 'Tests/Fixtures/LabelStructure/requirements/signType/u-turn.json!';
import signTypeSpeedSignClassListThingClasses from 'Tests/Fixtures/LabelStructure/requirements/signType/speed-sign.json!';
import signTypeSpeedSignSpeed30ClassListThingClasses from 'Tests/Fixtures/LabelStructure/requirements/signType/speed-sign-speed-30.json!';

describe('RequirementsLabelStructure', () => {
  /**
   * @type {RequirementsLabelStructure}
   */
  let structure;

  beforeEach(()=> {
    structure = new RequirementsLabelStructure(requirementsXmlData);
  });

  it('should be instantiable with valid requirements xml', () => {
    expect(structure instanceof RequirementsLabelStructure).toBeTruthy();
  });

  it('should list things defined in requirements xml', () => {
    const things = structure.getThings();

    const expectedThings = new Map();
    expectedThings.set('sign', new LabelStructureThing('sign', 'Traffic Sign', 'rectangle'));
    expectedThings.set('time-range-sign', new LabelStructureThing('time-range-sign', 'Time Range Sign', 'rectangle'));

    expect(things.size).toEqual(expectedThings.size);

    expectedThings.forEach((expectedThing, id) => {
      expect(things.has(id)).toBeTruthy();
      expect(things.get(id)).toEqual(expectedThing);
    });
  });

  it('should provide thing with specific id correctly', () => {
    const signThing = structure.getThingById('sign');
    const expectedThing = new LabelStructureThing('sign', 'Traffic Sign', 'rectangle');

    expect(signThing).toEqual(expectedThing);
  });

  it('should throw if thing with non existent id is requested', () => {
    expect(
      () => structure.getThingById('nonExistentThing')
    ).toThrow();
  });

  it('should provide same Map of things for multiple invocations', () => {
    const firstThings = structure.getThings();
    const secondThings = structure.getThings();

    expect(secondThings).toBe(firstThings);
  });

  describe('getEnabledThingClassesForThingAndClassList', () => {
    it('should throw if non existent thing is provided', () => {
      const nonExistentThing = new LabelStructureThing('some-non-existent-id', 'Foobar', 'rectangle');
      expect(
        () => structure.getEnabledClassesForLabeledObjectAndClassList(nonExistentThing, [])
      ).toThrow();
    });

    // @TODO: Erweitern um tests mit references.
    using([
      [[], signTypeEmptyClassListThingClasses],
      [['u-turn'], signTypeUTurnClassListThingClasses],
      [['u-turn', 'non-existent-class'], signTypeUTurnClassListThingClasses],
      [['speed-sign'], signTypeSpeedSignClassListThingClasses],
      [['speed-sign', 'speed-30'], signTypeSpeedSignSpeed30ClassListThingClasses],
    ], (classList, expectedThingClasses) => {
      it('should provide correct active classes for class list', () => {
        const signThing = new LabelStructureThing('sign', 'Traffic Sign', 'rectangle');
        const thingClasses = structure.getEnabledClassesForLabeledObjectAndClassList(signThing, classList);
        expect(thingClasses).toEqual(expectedThingClasses);
      });
    });
  });
});
