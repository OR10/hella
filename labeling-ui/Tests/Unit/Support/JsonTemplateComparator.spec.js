import {cloneDeep} from 'lodash';
import JsonTemplateComparator from '../../Support/JsonTemplateComparator';

describe('JsonTemplateComparator', () => {
  let comparator;

  beforeEach(() => {
    comparator = new JsonTemplateComparator();
  });

  describe('scalar comparison', () => {
    using([
      ['foobar', 'foobar'],
      [423, 423],
      [true, true],
      [false, false],
      [undefined, undefined],
      [null, null],
    ], (firstScalar, secondScalar) => {
      it('should identify two scalars of same value as equal', () => {
        expect(() => comparator.assertIsEqual(firstScalar, secondScalar)).not.toThrow();
      });
    });

    using([
      ['foobar', 'baz'],
      [23, 42],
      [true, false],
      [false, true],
    ], (firstScalar, secondScalar) => {
      it('should identify two scalars of different value but same type as different', () => {
        expect(() => comparator.assertIsEqual(firstScalar, secondScalar)).toThrow();
      });
    });

    using([
      ['foobar', 23],
      [23, 'blub'],
      [true, null],
      [false, 42],
      [null, undefined],
      [undefined, 'yeah!'],
      [null, 0],
      [null, false],
    ], (firstScalar, secondScalar) => {
      it('should identify two scalars of different value and type as different', () => {
        expect(() => comparator.assertIsEqual(firstScalar, secondScalar)).toThrow();
      });
    });
  });

  describe('float comparison', () => {
    it('should identify two identical floats as equal', () => {
      expect(() => comparator.assertIsEqual(1.23456789, 1.23456789)).not.toThrow();
    });

    it('should identify completely different floats as different', () => {
      expect(() => comparator.assertIsEqual(9.87654321, 1.23456789)).toThrow();
    });

    it('should identify two floats with less than 10^-10/2 difference as identical', () => {
      expect(() => comparator.assertIsEqual(1.123456789011, 1.123456789016)).not.toThrow();
    });

    it('should identify two floats with little more than 10^-10/2 difference as different', () => {
      expect(() => comparator.assertIsEqual(1.12345678901, 1.12345678906)).toThrow();
    });

    it('should provide proper error message if test fails', () => {
      try {
        comparator.assertIsEqual(9.87654321, 1.23456789);
      } catch (error) {
        expect(error.message).toMatch(/8.64197532/);
        expect(error.message).toMatch(/\b5e-11\b/);
        expect(error.message).toMatch(/\bat location <root>( |$)/);
        return;
      }

      fail('Expected validation error not thrown!');
    });
  });

  describe('object comparison', () => {
    let firstObject;
    let otherObject;
    let otherStructureObject;

    beforeEach(() => {
      firstObject = {
        'age': 42,
        'roasted': true,
        'isWurstbrot': false,
        'name': 'Bernd das Brot',
        'backed': undefined,
        'realPerson': null,
      };

      otherObject = {
        'age': 23,
        'roasted': 'no!',
        'isWurstbrot': false,
        'name': 'Bernd das Brot',
        'backed': false,
        'realPerson': null,
      };

      otherStructureObject = {
        'age': '6*10^23',
        'name': 'Entropy',
        'isReal': false,
        'travelSpeed': 'C',
      };
    });

    it('should identify two objects as equal', () => {
      expect(() => comparator.assertIsEqual(firstObject, cloneDeep(firstObject))).not.toThrow();
    });

    it('should identify two objects with different values as different', () => {
      expect(() => comparator.assertIsEqual(firstObject, otherObject)).toThrow();
    });

    it('should identify two objects with different values as different and provide proper explanation', () => {
      try {
        comparator.assertIsEqual(firstObject, otherObject);
      } catch (error) {
        expect(error.message).toMatch(/\b42 !== 23\b/);
        expect(error.message).toMatch(/ <root>\.age\b/);
        return;
      }

      fail('Expected validation error not thrown!');
    });

    it('should identify two objects with different keys as different', () => {
      expect(() => comparator.assertIsEqual(firstObject, otherStructureObject)).toThrow();
    });

    it('should identify two objects with different keys as different and provide proper explanation', () => {
      try {
        comparator.assertIsEqual(firstObject, otherStructureObject);
      } catch (error) {
        expect(error.message).toMatch(/\bKey "roasted" /);
        expect(error.message).toMatch(/\bat location <root> /);
        return;
      }

      fail('Expected validation error not thrown!');
    });
  });

  describe('array comparison', () => {
    let firstArray;
    let otherArray;
    let otherStructureArray;

    beforeEach(() => {
      firstArray = [
        1,
        'two',
        'three',
        4,
        true,
        undefined,
        null,
      ];

      otherArray = [
        7,
        'six',
        'five',
        4,
        3,
        'II',
        true,
      ];

      otherStructureArray = [
        7,
        'six',
        'five',
      ];
    });

    it('should identify arrays with equal values as equal', () => {
      expect(() => comparator.assertIsEqual(firstArray, cloneDeep(firstArray))).not.toThrow();
    });

    it('should identify arrays with different values as different', () => {
      expect(() => comparator.assertIsEqual(firstArray, otherArray)).toThrow();
    });

    it('should identify two arrays with different values as different and provide proper explanation', () => {
      try {
        comparator.assertIsEqual(firstArray, otherArray);
      } catch (error) {
        expect(error.message).toMatch(/\b1 !== 7\b/);
        expect(error.message).toMatch(/ <root>\.\[0\]( |$)/);
        return;
      }

      fail('Expected validation error not thrown!');
    });

    it('should identify two arrays with different structure as different', () => {
      expect(() => comparator.assertIsEqual(firstArray, otherStructureArray)).toThrow();
    });

    it('should identify two arrays with different structure as different and provide proper explanation', () => {
      try {
        comparator.assertIsEqual(firstArray, otherStructureArray);
      } catch (error) {
        expect(error.message).toMatch(/Key "\[3\]"( |$)/);
        expect(error.message).toMatch(/ at location <root>( |$)/);
        return;
      }

      fail('Expected validation error not thrown!');
    });
  });

  describe('complex comparison', () => {
    let firstDocument;
    let otherDocument;
    let otherStructureDocument;

    beforeEach(() => {
      firstDocument = {
        '_id': 'd07235d9-92df-414d-a38a-694580ac7d6e',
        '_rev': '1-asdfasdf123',
        'type': 'AppBundle.Model.LabeledThingInFrame',
        'frameIndex': 0,
        'classes': [
          'ignore-vehicle',
        ],
        'shapes': [
          {
            'type': 'rectangle',
            'id': 'caf42507-197c-49e2-b949-d21734a3a646',
            'topLeft': {
              'x': 100,
              'y': 100,
            },
            'bottomRight': {
              'x': 200,
              'y': 200,
            },
            'labeledThingInFrameId': 'd07235d9-92df-414d-a38a-694580ac7d6e',
          },
        ],
        'taskId': '5242f8bff15774fe72586e569a05ce0c',
        'projectId': '9a8d567033f93fcd8cf50c2535008766',
        'labeledThingId': '04d2f1b2-fa17-438d-abe3-7c1db43186a0',
        'incomplete': false,
      };

      otherDocument = {
        '_id': 'd07235d9-92df-414d-a38a-694580ac7d6e',
        '_rev': '1-asdfasdf123',
        'type': 'AppBundle.Model.LabeledThingInFrame',
        'frameIndex': 0,
        'classes': [
          'ignore-vehicle',
        ],
        'shapes': [
          {
            'type': 'rectangle',
            'id': 'caf42507-197c-49e2-b949-d21734a3a646',
            'topLeft': {
              'x': 423,
              'y': 100,
            },
            'bottomRight': {
              'x': 900,
              'y': 200,
            },
            'labeledThingInFrameId': 'abcdefgh-92df-414d-a38a-694580ac7d6e',
          },
        ],
        'taskId': '5242f8bff15774fe72586e569a05ce0c',
        'projectId': '9a8d567033f93fcd8cf50c2535008766',
        'labeledThingId': '04d2f1b2-fa17-438d-abe3-7c1db43186a0',
        'incomplete': false,
      };

      otherStructureDocument = {
        '_id': 'd07235d9-92df-414d-a38a-694580ac7d6e',
        '_rev': '1-asdfasdf123',
        'type': 'AppBundle.Model.LabeledThingInFrame',
        'frameIndex': 0,
        'classes': [
          'ignore-vehicle',
        ],
        'shapes': [
          {
            'type': 'rectangle',
            'id': 'caf42507-197c-49e2-b949-d21734a3a646',
            'topLeft': null,
            'bottomRight': null,
            'labeledThingInFrameId': 'd07235d9-92df-414d-a38a-694580ac7d6e',
          },
        ],
        'taskId': '5242f8bff15774fe72586e569a05ce0c',
        'projectId': '9a8d567033f93fcd8cf50c2535008766',
        'labeledThingId': '04d2f1b2-fa17-438d-abe3-7c1db43186a0',
        'incomplete': false,
      };
    });

    it('should identify two complex objects with identical values as equal', () => {
      expect(() => comparator.assertIsEqual(firstDocument, cloneDeep(firstDocument))).not.toThrow();
    });

    it('should identify two complex objects with different values as different', () => {
      expect(() => comparator.assertIsEqual(firstDocument, otherDocument)).toThrow();
    });

    it('should identify two complex objects with different values as different and provide proper explanation', () => {
      try {
        comparator.assertIsEqual(firstDocument, otherDocument);
      } catch (error) {
        expect(error.message).toMatch(/\b100 !== 423\b/);
        expect(error.message).toMatch(/ <root>\.shapes\.\[0\]\.topLeft\.x( |$)/);
        return;
      }

      fail('Expected validation error not thrown!');
    });

    it('should identify two complex objects with different structure as different', () => {
      expect(() => comparator.assertIsEqual(firstDocument, otherStructureDocument)).toThrow();
    });

    it('should identify two complex objects with different structure as different and provide proper explanation', () => {
      try {
        comparator.assertIsEqual(firstDocument, otherStructureDocument);
      } catch (error) {
        expect(error.message).toMatch(/ type <object, object>( |$)/);
        expect(error.message).toMatch(/ at location <root>.shapes.\[0\]/);
        expect(error.message).toMatch(/\{"x":100,"y":100\}, null/);
        return;
      }

      fail('Expected validation error not thrown!');
    });
  });

  describe('template matching', () => {
    it('should validate any value against template setter', () => {
      const template = {
        id: '{{:templateId}}',
        _rev: '{{:revision}}',
      };
      const value = {
        id: 'Some Value',
        _rev: '1-abcdefghi',
      };

      expect(() => comparator.assertIsEqual(template, value)).not.toThrow();
    });

    it('should validate against set template value', () => {
      const template = {
        id: '{{:templateId}}',
        _rev: '{{:revision}}',
        shapes: [
          {higherId: '{{templateId}}'},
        ],
      };
      const value = {
        id: 'Some Value',
        _rev: '1-abcdefghi',
        shapes: [
          {higherId: 'Some Value'},
        ],
      };

      expect(() => comparator.assertIsEqual(template, value)).not.toThrow();
    });

    it('should detect difference if used template value differs from set one', () => {
      const template = {
        id: '{{:templateId}}',
        _rev: '{{:revision}}',
        shapes: [
          {higherId: '{{templateId}}'},
        ],
      };
      const value = {
        id: 'Some Value',
        _rev: '1-abcdefghi',
        shapes: [
          {higherId: 'Some other Value'},
        ],
      };

      expect(() => comparator.assertIsEqual(template, value)).toThrow();
    });

    it('should detect difference if additional key exists in compare target', () => {
      const template = {
        id: '{{:templateId}}',
        _rev: '{{:revision}}',
        shapes: [
          {higherId: '{{templateId}}'},
        ],
      };
      const value = {
        id: 'Some Value',
        _rev: '1-abcdefghi',
        shapes: [
          {higherId: 'Some other Value'},
        ],
        ghost: true,
      };

      expect(() => comparator.assertIsEqual(template, value)).toThrow();
    });

    using([
      [42],
      [42.3],
      [true],
      [false],
      [undefined],
      [null],
    ], expectedValue => {
      it('should compare template setter against arbitrary scalar of type non-string', () => {
        const setterTemplate = `{{:foobar}}`;
        expect(() => comparator.assertIsEqual(setterTemplate, expectedValue)).not.toThrow();
      });

      it('should compare template getter against before set scalar of type non-string', () => {
        const setterTemplate = `{{:foobar}}`;
        const getterTemplate = `{{foobar}}`;
        const fullTemplate = {
          setter: setterTemplate,
          getter: getterTemplate,
        };
        const actualDocument = {
          setter: expectedValue,
          getter: expectedValue,
        };

        expect(() => comparator.assertIsEqual(fullTemplate, actualDocument)).not.toThrow();
      });

      it('should compare template getter against before set scalar of type non-string with mismatch', () => {
        const setterTemplate = `{{:foobar}}`;
        const getterTemplate = `{{foobar}}`;
        const fullTemplate = {
          setter: setterTemplate,
          getter: getterTemplate,
        };
        const actualDocument = {
          setter: expectedValue,
          getter: 1234567,
        };

        expect(() => comparator.assertIsEqual(fullTemplate, actualDocument)).toThrow();
      });
    });
  });

  describe('inline template matching', () => {
    using([
      ['/entries/short-version/{{:id}}', '/entries/short-version/42'],
      ['/entries/[special]/{{:id}}', '/entries/[special]/some-id'],
      ['{{:id}}-with-suffix', 'some-423+id-with-suffix'],
      ['/entries/{{:type}}/423', '/entries/some-type/423'],
      ['/entries/{{:type}}/{{:id}}', '/entries/some-type/423'],
      ['/entries/{{:type}}/{{:id}}?ofType={{type}}', '/entries/some-type/423?ofType=some-type'],
    ], (template, value) => {
      it('should validate against values with prefix and/or suffix', () => {
        expect(() => comparator.assertIsEqual(template, value)).not.toThrow();
      });
    });

    it('should validate against inline templates in object structures with setter and getter', () => {
      const template = {
        'request': {
          'path': '/api/labeledThingInFrame/{{:labeledThingInFrameId}}',
        },
        'response': {
          'data': {
            'result': {
              'labeledThingInFrame': {
                'id': 'with-prefix-{{labeledThingInFrameId}}-and-suffix',
              },
            },
          },
        },
      };

      const value = {
        'request': {
          'path': '/api/labeledThingInFrame/FOOBAR-ID-123',
        },
        'response': {
          'data': {
            'result': {
              'labeledThingInFrame': {
                'id': 'with-prefix-FOOBAR-ID-123-and-suffix',
              },
            },
          },
        },
      };

      expect(() => comparator.assertIsEqual(template, value)).not.toThrow();
    });

    using([
      ['/entries/short-version/{{:id}}', '/entries/long-version/42'],
      ['/entries/[special]/{{:id}}', '/entries/[spe*+*cial]/some-id'],
      ['{{:id}}-with-suffix', 'some-423'],
      ['/entries/{{:type}}/423', '/entries/some-type/423?special'],
      ['/entries/{{:type}}/{{:id}}?not-special', '/entries/some-type/423?special'],
      ['/entries/{{:type}}/{{:id}}?ofType={{type}}', '/entries/some-type/423?ofType=other-type'],
    ], (template, value) => {
      it('should not accept mismatching template values with prefix and/or suffix', () => {
        expect(() => comparator.assertIsEqual(template, value)).toThrow();
      });
    });

    using([
      ['/entries/short-version/{{:id}}', '/entries/long-version/42'],
      ['/entries/[special]/{{:id}}', '/entries/[spe*+*cial]/some-id'],
      ['{{:id}}-with-suffix', 'some-423'],
      ['/entries/{{:type}}/423', '/entries/some-type/423?special'],
      ['/entries/{{:type}}/{{:id}}?not-special', '/entries/some-type/423?special'],
    ], (template, value) => {
      it('should provide explanation why template values with prefix and/or suffix are not matching', () => {
        try {
          comparator.assertIsEqual(template, value);
        } catch (error) {
          expect(error.message).toContain(template);
          expect(error.message).toContain(value);
          expect(error.message).toMatch(/ at location <root>( |$)/);
          return;
        }

        fail('Expected validation error not thrown!');
      });
    });

    it('should provide mismatching explanation with correct path location', () => {
      const template = {
        'request': {
          'path': '/api/labeledThingInFrame/{{:labeledThingInFrameId}}',
        },
      };

      const value = {
        'request': {
          'path': '/another-api/labeledThingInFrame/123-LTIF-321',
        },
      };

      try {
        comparator.assertIsEqual(template, value);
      } catch (error) {
        expect(error.message).toMatch(/ at location <root>\.request\.path( |$)/);
        return;
      }

      fail('Expected validation error not thrown!');
    });
  });
});
