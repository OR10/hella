import LinearLabelStructureVisitor from 'Application/LabelStructure/Services/LinearLabelStructureVisitor.js';
import labelStructureFixture from 'Tests/Fixtures/label-structure.json!';


describe('LinearLabelStructureVisitor', () => {
  let visitor;
  beforeEach(() => {
    visitor = new LinearLabelStructureVisitor();
  });

  using([
    [
      {},
      [
        {name: 'weather', metadata:{value: null}, children: [
          {name: 'sunny'},
          {name: 'rainy-day'},
          {name: 'foggy'},
          {name: 'solar-eclipse'},
        ]},
        {name: 'country', metadata:{value: null}, children: [
          {name: 'germany'},
          {name: 'england'},
          {name: 'france'},
        ]},
      ],
    ],
    [
      {weather: 'solar-eclipse'},
      [
        {name: 'weather', metadata: {value: 'solar-eclipse'}, children: [
          {name: 'sunny'},
          {name: 'rainy-day'},
          {name: 'foggy'},
          {name: 'solar-eclipse'},
        ]},
        {name: 'country', metadata: {value: null}, children: [
          {name: 'germany'},
          {name: 'england'},
          {name: 'france'},
        ]},
      ],
    ],
    [
      {weather: 'foggy'},
      [
        {name: 'weather', metadata: {value: 'foggy'}, children: [
          {name: 'sunny'},
          {name: 'rainy-day'},
          {name: 'foggy'},
          {name: 'solar-eclipse'},
        ]},
        {name: 'foggy', metadata: {value: null}, children: [
          {name: 'really-foggy'},
          {name: 'not-so-foggy'},
        ]},
        {name: 'country', metadata: {value: null}, children: [
          {name: 'germany'},
          {name: 'england'},
          {name: 'france'},
        ]},
      ],
    ],
    [
      {weather: 'foggy', foggy: 'really-foggy', country: 'england'},
      [
        {name: 'weather', metadata: {value: 'foggy'}, children: [
          {name: 'sunny'},
          {name: 'rainy-day'},
          {name: 'foggy'},
          {name: 'solar-eclipse'},
        ]},
        {name: 'foggy', metadata: {value: 'really-foggy'}, children: [
          {name: 'really-foggy'},
          {name: 'not-so-foggy'},
        ]},
        {name: 'country', metadata: {value: 'england'}, children: [
          {name: 'germany'},
          {name: 'england'},
          {name: 'france'},
        ]},
      ],
    ],
    [
      {weather: 'sunny', foggy: 'really-foggy', country: 'germany'},
      [
        {name: 'weather', metadata: {value: 'sunny'}, children: [
          {name: 'sunny'},
          {name: 'rainy-day'},
          {name: 'foggy'},
          {name: 'solar-eclipse'},
        ]},
        {name: 'country', metadata: {value: 'germany'}, children: [
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
