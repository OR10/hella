import 'jquery';
import 'angular';

import DeepMap from 'Application/Common/Helpers/DeepMap';

describe('DeepMap', () => {
  let deepMap;

  beforeEach(() => {
    deepMap = new DeepMap();
  });

  it('should be instantiable', () => {
    expect(deepMap instanceof DeepMap).toBeTruthy();
  });

  it('should report size of empty first level', () => {
    expect(deepMap.size).toEqual(0);
  });

  it('should report size of filled first level', () => {
    deepMap.set('foo', 'bar');
    deepMap.set('baz', 'blub');
    expect(deepMap.size).toEqual(2);
  });

  it('should report size of multiple levels', () => {
    deepMap.set('key1_1', 'key2_1', 'value');
    deepMap.set('key1_1', 'key2_2', 'value');
    deepMap.set('key1_2', 'key2_1', 'value');
    deepMap.set('key1_2', 'key2_2', 'value');
    deepMap.set('key1_3', 'keyX', 'keyY', 'value');

    expect(deepMap.size).toEqual(5);
  });

  it('should iterate all entries', () => {
    const data = [
      [['key1_1', 'key2_1'], 'value1'],
      [['key1_1', 'key2_2'], 'value2'],
      [['key1_2', 'key2_1'], 'value3'],
      [['key1_2', 'key2_2'], 'value4'],
      [['key1_3', 'keyX', 'keyY'], 'value5'],
    ];

    data.forEach(([keys, value]) => deepMap.set(...keys, value));

    const retrieved = [];
    for (const [keys, value] of deepMap.entries()) {
      retrieved.push([keys, value]);
    }

    expect(retrieved).toEqual(data);
  });

  using(
    [
      [['key1']],
      [['key1', 'key2']],
      [['key1', 'key2', 'key3']],
      [[{}, [], 23]],
    ],
    keys => {
      it('should store and read stored information', () => {
        const value = {'some': 'nice', 'value': ['to', 'be', 'stored', 42, true]};
        deepMap.set(...keys, value);
        expect(deepMap.get(...keys)).toBe(value);
      });

      it('should report about existence of keys', () => {
        const value = {'some': 'nice', 'value': ['to', 'be', 'stored', 42, true]};
        deepMap.set(...keys, value);
        expect(deepMap.has(...keys)).toBeTruthy();
      });

      it('should delete set keys', () => {
        const value = {'some': 'nice', 'value': ['to', 'be', 'stored', 42, true]};
        deepMap.set(...keys, value);
        deepMap.delete(...keys);
        expect(deepMap.has(...keys)).toBeFalsy();
        expect(deepMap.get(...keys)).toBeUndefined();
      });
    }
  );

  it('should only delete requested key', () => {
    const keys = ['key1', 'key2', 'key3'];
    const value = {'some': 'nice', 'value': ['to', 'be', 'stored', 42, true]};

    deepMap.set(...keys, value);
    deepMap.set('key1', 'key2', 'some-other-key', 42);

    deepMap.delete(...keys);

    expect(deepMap.has(...keys)).toBeFalsy();
    expect(deepMap.get(...keys)).toBeUndefined();
    expect(deepMap.get('key1', 'key2', 'some-other-key')).toEqual(42);
  });

  it('should only return requested keys on read', () => {
    const keys = ['key1', 'key2', 'key3'];
    const value = 42;
    deepMap.set('key1', 'key2', 'some-other-key', 23);
    deepMap.set(...keys, value);
    deepMap.set('key1', 'some-other-key', 423);

    expect(deepMap.get(...keys)).toBe(value);
  });

  it('should not allow complete branch to be overwritten', () => {
    deepMap.set('key1', 'key2', 'value');
    expect(() => {
      deepMap.set('key1', 'value');
    }).toThrow();
  });

  it('should not allow value to be overwritten with branch', () => {
    deepMap.set('key1', 'value');
    expect(() => {
      deepMap.set('key1', 'key2', 'value');
    }).toThrow();
  });

  it('should clear the complete DeepMap', () => {
    deepMap.set('key1_1', 'key2_1', 'value');
    deepMap.set('key1_1', 'key2_2', 'value');
    deepMap.set('key1_2', 'key2_1', 'value');
    deepMap.set('key1_2', 'key2_2', 'value');

    expect(deepMap.size).toEqual(4);
    deepMap.clear();
    expect(deepMap.size).toEqual(0);
  });
});
