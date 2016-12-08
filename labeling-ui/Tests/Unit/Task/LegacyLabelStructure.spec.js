import LegacyLabelStructure from 'Application/Task/Model/LabelStructure/LegacyLabelStructure';
import LabelStructureThing from 'Application/Task/Model/LabelStructureThing';

import LinearLabelStructureVisitor from 'Application/LabelStructure/Services/LinearLabelStructureVisitor';
import AnnotationLabelStructureVisitor from 'Application/LabelStructure/Services/AnnotationLabelStructureVisitor';

import labelStructureFixture from 'Tests/Fixtures/LabelStructure/meta-label-structure.json!';
import annotationDictionaryFixture from 'Tests/Fixtures/LabelStructure/meta-label-structure-ui-annotation.json!';

import emptyClassListThingClasses from 'Tests/Fixtures/LabelStructure/legacy/annotated/empty.json!';
import solarEclipseClassListThingClasses from 'Tests/Fixtures/LabelStructure/legacy/annotated/solar-eclipse.json!';
import foggyClassListThingClasses from 'Tests/Fixtures/LabelStructure/legacy/annotated/foggy.json!';
import foggyReallyFoggyEnglandClassListThingClasses from 'Tests/Fixtures/LabelStructure/legacy/annotated/foggy-really-foggy-england.json!';
import sunnyReallyFoggyGermanyClassListThingClasses from 'Tests/Fixtures/LabelStructure/legacy/annotated/sunny-really-foggy-germany.json!';

describe('LegacyLabelStructure', () => {
  function createLegacyLabelStructure(drawingTool, legacyStructure, legacyAnnotation) {
    return new LegacyLabelStructure(
      new LinearLabelStructureVisitor(),
      new AnnotationLabelStructureVisitor(),
      drawingTool,
      legacyStructure,
      legacyAnnotation
    );
  }

  /**
   * @type {LegacyLabelStructure}
   */
  let structure;

  beforeEach(() => {
    structure = createLegacyLabelStructure('rectangle', labelStructureFixture, annotationDictionaryFixture);
  });

  it('should be instantiable with dependencies, drawingTool, legacyStructure and legacyAnnotation', () => {
    expect(structure instanceof LegacyLabelStructure).toBeTruthy();
  });

  it('should only provide one thing called "legacy"', () => {
    const expectedLegacyThing = new LabelStructureThing('legacy', 'rectangle', 'rectangle');

    const things = structure.getThings();

    expect(things.size).toBe(1);
    expect(things.get('legacy')).toEqual(expectedLegacyThing);
  });

  it('should tell, that a "legacy" thing is available', () => {
    const legacyThingIsAvailable = structure.isThingDefinedById('legacy');
    expect(legacyThingIsAvailable).toBeTruthy();
  });

  it('should provide "legacy" thing by id', () => {
    const legacyThing = structure.getThingById('legacy');
    const expectedLegacyThing = new LabelStructureThing('legacy', 'rectangle', 'rectangle');
    expect(legacyThing).toEqual(expectedLegacyThing);
  });

  using([
    [[], emptyClassListThingClasses],
    [['solar-eclipse'], solarEclipseClassListThingClasses],
    [['foggy'], foggyClassListThingClasses],
    [['foggy', 'really-foggy', 'england'], foggyReallyFoggyEnglandClassListThingClasses],
    [['sunny', 'really-foggy', 'germany'], sunnyReallyFoggyGermanyClassListThingClasses],
  ], (classList, expectedResult) => {
    it('should provide correctly annotated and processed class json', () => {
      const legacyThing = new LabelStructureThing('legacy', 'rectangle', 'rectangle');
      const annotatedEnabledClasses = structure.getEnabledThingClassesForThingAndClassList(legacyThing, classList);
      expect(annotatedEnabledClasses).toEqual(expectedResult);
    });
  });
});
