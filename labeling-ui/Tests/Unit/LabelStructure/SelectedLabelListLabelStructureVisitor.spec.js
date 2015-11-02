import SelectedLabelListLabelStructureVisitor from 'Application/LabelStructure/Services/SelectedLabelListLabelStructureVisitor.js';

describe('SelectedLabelListLabelStructureVisitor', () => {
  let visitor;
  beforeEach(() => {
    visitor = new SelectedLabelListLabelStructureVisitor();
  });

  using([
    [
      {name: 'solar-eclipse'},
      [],
    ],
    [
      {name: 'weather', metadata: {value: 'solar-eclipse'}, children: [
        {name: 'solar-eclipse'},
      ]},
      ['solar-eclipse'],
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
      ['foggy', 'not-so-foggy', 'germany'],
    ],
  ], (labelStructure, list) => {
    it('should extract selected list from given AnnotatedLabelStructure', () => {
      expect(visitor.visit(labelStructure)).toEqual(list);
    });
  });
});
