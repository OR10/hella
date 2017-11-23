import AnnotationLabelStructureVisitor from 'Application/LabelStructure/Services/AnnotationLabelStructureVisitor.js';
import annotationDictionaryFixture from 'Tests/Fixtures/LabelStructure/meta-label-structure-ui-annotation.json!';

describe('LabelStructureAnnotationVisitor', () => {
  let visitor;
  beforeEach(() => {
    visitor = new AnnotationLabelStructureVisitor();
  });

  using([
    [
      {name: 'solar-eclipse'},
      {name: 'solar-eclipse', metadata: {response: 'Alter! Totale Sonnenfinsternis!'}},
    ],
    [
      {name: 'solar-eclipse', metadata: {some: 'old-metadata'}},
      {name: 'solar-eclipse', metadata: {some: 'old-metadata', response: 'Alter! Totale Sonnenfinsternis!'}},
    ],
    [
      {name: 'root', children: [
        {name: 'weather', metadata: {value: ['foggy'], multiSelect: false}, children: [
          {name: 'sunny'},
          {name: 'rainy-day'},
          {name: 'foggy'},
          {name: 'solar-eclipse'},
        ]},
        {name: 'foggy', metadata: {value: ['really-foggy'], multiSelect: false}, children: [
          {name: 'really-foggy'},
          {name: 'not-so-foggy'},
        ]},
        {name: 'country', metadata: {value: ['england'], multiSelect: false}, children: [
          {name: 'germany'},
          {name: 'england'},
          {name: 'france'},
        ]},
      ]},
      {name: 'root', metadata: {}, children: [
        {name: 'weather', metadata: {value: ['foggy'], multiSelect: false, 'challenge': 'Wie ist das Wetter?'}, children: [
          {name: 'sunny', metadata: {response: 'Sonnig! :)'}},
          {name: 'rainy-day', metadata: {response: 'Regen und so...'}},
          {name: 'foggy', metadata: {
            challenge: 'Wie nebelig ist es denn so?',
            response: 'Nebel!!1111elf!',
          }},
          {name: 'solar-eclipse', metadata: {response: 'Alter! Totale Sonnenfinsternis!'}},
        ]},
        {name: 'foggy', metadata: {
          value: ['really-foggy'],
          challenge: 'Wie nebelig ist es denn so?',
          multiSelect: false,
          response: 'Nebel!!1111elf!',
        }, children: [
          {name: 'really-foggy', metadata: {response: 'London-style Nebel'}},
          {name: 'not-so-foggy', metadata: {response: 'völlig harmlos'}},
        ]},
        {name: 'country', metadata: {value: ['england'], multiSelect: false, challenge: 'In welchem Land befinden wir uns?'}, children: [
          {name: 'germany', metadata: {response: 'Deutschland'}},
          {name: 'england', metadata: {response: 'England'}},
          {name: 'france', metadata: {response: 'Das Land der Baguettes'}},
        ]},
      ]},
    ],

  ], (labelStructure, annotatedLabelStructure) => {
    it('should annotate labelStructure with given AnnotationDictionary', () => {
      expect(visitor.visit(labelStructure, annotationDictionaryFixture)).toEqual(annotatedLabelStructure);
    });
  });
});
