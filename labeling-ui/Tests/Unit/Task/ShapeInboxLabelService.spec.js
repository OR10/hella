import ShapeInboxLabelService from '../../../Application/Task/Services/ShapeInboxLabelService';
import labeledThingMock from '../../Fixtures/Models/Frontend/LabeledThing';
import LabelStructureThing from '../../../Application/Task/Model/LabelStructureThing';

describe('ShapeInboxLabelService', () => {
  /**
   * @returns {ShapeInboxLabelService}
   */
  function createService() {
    return new ShapeInboxLabelService();
  }

  function createLabeledThing(id = undefined) {
    const ltClone = labeledThingMock.clone();
    if (id !== undefined) {
      ltClone.id = id;
    }

    return ltClone;
  }

  function createLabelStructureThing(id = 'rectangle', name = id, shape = 'rectangle') {
    return new LabelStructureThing(id, name, shape);
  }

  it('should be instantiable', () => {
    const service = createService();
    expect(service).toEqual(jasmine.any(ShapeInboxLabelService));
  });

  it('should allow storage of a name for a labeledThing', () => {
    const lt = createLabeledThing();
    const service = createService();
    const name = 'USS Enterprise';

    expect(() => {
      service.setLabelForLabelThing(lt, name);
    }).not.toThrow();
  });

  it('should allow storage and retrieval for a labeledThing', () => {
    const lso = createLabelStructureThing();
    const lt = createLabeledThing();
    const service = createService();
    const name = 'USS Enterprise';

    service.setLabelForLabelThing(lt, name);
    const resultValue = service.getLabelForLabelStructureObjectAndLabeledThing(lso, lt);
    expect(resultValue).toEqual(name);
  });

  it('should allow storage and retrieval of information based in different labeledThings', () => {
    const lso = createLabelStructureThing();
    const ltOne = createLabeledThing('ltOne');
    const ltTwo = createLabeledThing('ltTwo');
    const service = createService();
    const nameOne = 'USS Enterprise';
    const nameTwo = 'USS Defiant';

    service.setLabelForLabelThing(ltOne, nameOne);
    service.setLabelForLabelThing(ltTwo, nameTwo);

    const resultValueOne = service.getLabelForLabelStructureObjectAndLabeledThing(lso, ltOne);
    const resultValueTwo = service.getLabelForLabelStructureObjectAndLabeledThing(lso, ltTwo);

    expect(resultValueOne).toEqual(nameOne);
    expect(resultValueTwo).toEqual(nameTwo);
  });

  it('should autogenerate name based on lso if none has been set', () => {
    const lso = createLabelStructureThing('Starship');
    const ltOne = createLabeledThing('ltOne');
    const ltTwo = createLabeledThing('ltTwo');
    const service = createService();

    const resultValueOne = service.getLabelForLabelStructureObjectAndLabeledThing(lso, ltOne);
    const resultValueTwo = service.getLabelForLabelStructureObjectAndLabeledThing(lso, ltTwo);

    expect(resultValueOne).toEqual('Starship #1');
    expect(resultValueTwo).toEqual('Starship #2');
  });

  it('should add unique number based on lso type', () => {
    const lsoOne = createLabelStructureThing('Galaxy Class');
    const lsoTwo = createLabelStructureThing('Defiant Class');
    const ltOne = createLabeledThing('ltOne');
    const ltTwo = createLabeledThing('ltTwo');
    const service = createService();

    const resultValueOne = service.getLabelForLabelStructureObjectAndLabeledThing(lsoOne, ltOne);
    const resultValueTwo = service.getLabelForLabelStructureObjectAndLabeledThing(lsoTwo, ltTwo);

    expect(resultValueOne).toEqual('Galaxy Class #1');
    expect(resultValueTwo).toEqual('Defiant Class #1');
  });

  it('should allow names to be changed', () => {
    const lso = createLabelStructureThing();
    const lt = createLabeledThing();
    const service = createService();
    const name = 'USS Enterprise D';
    const newName = 'USS Enterprise E';

    service.setLabelForLabelThing(lt, name);
    service.setLabelForLabelThing(lt, newName);
    const resultValue = service.getLabelForLabelStructureObjectAndLabeledThing(lso, lt);
    expect(resultValue).toEqual(newName);
  });

  it('should only create new names for unknown labeledThings', () => {
    const lsoOne = createLabelStructureThing('Galaxy Class');
    const lsoTwo = createLabelStructureThing('Defiant Class');
    const ltOne = createLabeledThing('ltOne');
    const ltTwo = createLabeledThing('ltTwo');
    const ltTwoName = 'Defiant';
    const service = createService();

    service.setLabelForLabelThing(ltTwo, ltTwoName);

    const resultValueOne = service.getLabelForLabelStructureObjectAndLabeledThing(lsoOne, ltOne);
    const resultValueTwo = service.getLabelForLabelStructureObjectAndLabeledThing(lsoTwo, ltTwo);

    expect(resultValueOne).toEqual('Galaxy Class #1');
    expect(resultValueTwo).toEqual(ltTwoName);
  });
});
