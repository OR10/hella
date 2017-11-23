import LinearLabelStructureVisitor from 'Application/LabelStructure/Services/LinearLabelStructureVisitor.js';
import labelStructureFixture from 'Tests/Fixtures/LabelStructure/meta-label-structure.json!';


describe('LinearLabelStructureVisitor', () => {
  let visitor;
  beforeEach(() => {
    visitor = new LinearLabelStructureVisitor();
  });

  using([
    [
      [],
      [
        {name: 'weather', metadata: {value: [], multiSelect: false}, children: [
          {name: 'sunny'},
          {name: 'rainy-day'},
          {name: 'foggy'},
          {name: 'solar-eclipse'},
        ]},
        {name: 'country', metadata: {value: [], multiSelect: false}, children: [
          {name: 'germany'},
          {name: 'england'},
          {name: 'france'},
        ]},
      ],
    ],
    [
      ['solar-eclipse'],
      [
        {name: 'weather', metadata: {value: ['solar-eclipse'], multiSelect: false}, children: [
          {name: 'sunny'},
          {name: 'rainy-day'},
          {name: 'foggy'},
          {name: 'solar-eclipse'},
        ]},
        {name: 'country', metadata: {value: [], multiSelect: false}, children: [
          {name: 'germany'},
          {name: 'england'},
          {name: 'france'},
        ]},
      ],
    ],
    [
      ['foggy'],
      [
        {name: 'weather', metadata: {value: ['foggy'], multiSelect: false}, children: [
          {name: 'sunny'},
          {name: 'rainy-day'},
          {name: 'foggy'},
          {name: 'solar-eclipse'},
        ]},
        {name: 'foggy', metadata: {value: [], multiSelect: false}, children: [
          {name: 'really-foggy'},
          {name: 'not-so-foggy'},
        ]},
        {name: 'country', metadata: {value: [], multiSelect: false}, children: [
          {name: 'germany'},
          {name: 'england'},
          {name: 'france'},
        ]},
      ],
    ],
    [
      ['foggy', 'really-foggy', 'england'],
      [
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
      ],
    ],
    [
      ['sunny', 'really-foggy', 'germany'],
      [
        {name: 'weather', metadata: {value: ['sunny'], multiSelect: false}, children: [
          {name: 'sunny'},
          {name: 'rainy-day'},
          {name: 'foggy'},
          {name: 'solar-eclipse'},
        ]},
        {name: 'country', metadata: {value: ['germany'], multiSelect: false}, children: [
          {name: 'germany'},
          {name: 'england'},
          {name: 'france'},
        ]},
      ],
    ],
  ], (context, expectedResult) => {
    it('should transform to linear lists based on context', () => {
      expect(visitor.visit(labelStructureFixture, context)).toEqual({name: 'linear-root', children: expectedResult});
    });
  });
});
