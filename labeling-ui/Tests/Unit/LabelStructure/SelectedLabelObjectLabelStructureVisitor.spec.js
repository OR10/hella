import SelectedLabelObjectLabelStructureVisitor from 'Application/LabelStructure/Services/SelectedLabelObjectLabelStructureVisitor.js';

describe('SelectedLabelObjectLabelStructureVisitor', () => {
  let visitor;
  beforeEach(() => {
    visitor = new SelectedLabelObjectLabelStructureVisitor();
  });

  using([
    [
      {name: 'solar-eclipse'},
      {},
    ],
    [
      {name: 'weather', metadata: {value: 'solar-eclipse'}, children: [
        {name: 'solar-eclipse'},
      ]},
      {weather: 'solar-eclipse'},
    ],
    [
      {name: 'root', children: [
        {name: 'weather', metadata: {value: 'foggy'}, children: [
          {name: 'sunny'},
          {name: 'rainy-day'},
          {name: 'foggy'},
          {name: 'solar-eclipse'},
        ]},
        {name: 'foggy', metadata: {value: 'not-so-foggy'}, children: [
          {name: 'really-foggy'},
          {name: 'not-so-foggy'},
        ]},
        {name: 'country', metadata: {value: 'germany'}, children: [
          {name: 'germany'},
          {name: 'england'},
          {name: 'france'},
        ]},
      ]},
      {
        weather: 'foggy',
        foggy: 'not-so-foggy',
        country: 'germany',
      },
    ],
  ], (labelStructure, mapping) => {
    it('should extract selected mapping from given AnnotatedLabelStructure', () => {
      expect(visitor.visit(labelStructure)).toEqual(mapping);
    });
  });
});
