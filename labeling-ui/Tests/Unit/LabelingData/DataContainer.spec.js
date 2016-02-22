import toEqualIterator from '../../Support/Jasmine/Matchers/EqualIterator';
import DataContainer from 'Application/LabelingData/Support/DataContainer';

describe('DataContainer', () => {
  function initializeDataContainer(data) {
    const dataContainer = new DataContainer();

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        dataContainer.store(key, data[key]);
      }
    }

    return dataContainer;
  }

  it('should store given data', () => {
    const container = new DataContainer();
    container.store('some-key-here', 'some-data-here');
  });

  it('should allow to retrieve stored data', () => {
    const container = new DataContainer();
    container.store('some-key-here', 'some-data-here');
    expect(container.get('some-key-here')).toEqual('some-data-here');
  });

  it('should return undefined if requested data is not available', () => {
    const container = new DataContainer();
    expect(container.get('not-stored-key')).toEqual(undefined);
  });

  it('should invalidate data for a single key', () => {
    const dataContainer = initializeDataContainer({
      foo: 'bar',
      bar: 'baz',
    });

    dataContainer.invalidate('foo');

    expect(dataContainer.has('foo')).toBe(false);
    expect(dataContainer.has('bar')).toBe(true);
    expect(dataContainer.get('bar')).toEqual('baz');
  });

  it('should invalidate all data', () => {
    const dataContainer = initializeDataContainer({
      foo: 'bar',
      bar: 'baz',
    });

    dataContainer.invalidate();

    expect(dataContainer.has('foo')).toBe(false);
    expect(dataContainer.has('bar')).toBe(false);
  });

  using([
    [['foo'], true],
    [['foo', 'bar'], true],
    [['foo', 'bar', 'baz'], false],
    [['baz', 'barbaz'], false],
    [['baz'], false],
  ], (keys, expectedResult) => {
    it('should check for multiple keys to be present', () => {
      const dataContainer = initializeDataContainer({
        foo: 'bar',
        bar: 'baz',
      });

      expect(dataContainer.hasAll(keys)).toEqual(expectedResult);
    });
  });

  using([
    [['foo'], ['bar']],
    [['foo', 'bar'], ['bar', 'baz']],
    [['foo', 'bar', 'baz'], ['bar', 'baz', undefined]],
    [['baz', 'barbaz'], [undefined, undefined]],
    [['baz'], [undefined]],
  ], (keys, expectedResult) => {
    it('should retrieve multiple keys', () => {
      const dataContainer = initializeDataContainer({
        foo: 'bar',
        bar: 'baz',
      });

      expect(dataContainer.getAll(keys)).toEqual(expectedResult);
    });
  });

  describe('nested key handling', () => {
    function iteratorsAreEqual(il, ir) {
      while(true) { // eslint-disable-line no-constant-condition
        const currentLeft = il.next();
        const currentRight = ir.next();

        if (currentLeft.done) {
          return !!currentRight.done;
        }

        expect(currentLeft.value).toEqual(currentRight.value);
      }
    }

    let container;
    beforeEach(() => {
      container = new DataContainer();
    });

    it('should allow for nested keys to be stored', () => {
      container.store('some.nested.key', 'some-data');
    });

    it('should allow for nested keys to be retrieved', () => {
      container.store('some.nested.key', 'some-data');
      expect(container.get('some.nested.key')).toEqual('some-data');
    });

    it('should allow for nested subkey maps to be retrieved', () => {
      container.store('some.nested.key', 'some-data');
      container.store('some.nested.second-key', 'some-other-data');

      const expectedMap = new Map();
      expectedMap.set('key', 'some-data');
      expectedMap.set('second-key', 'some-other-data');
      expect(
        iteratorsAreEqual(container.get('some.nested').entries(), expectedMap.entries())
      ).toBeTruthy();
    });

    it('should allow for nested subkey maps to be invalidated', () => {
      container.store('some.nested.key', 'some-data');
      container.store('some.nested.second-key', 'some-other-data');

      container.invalidate('some.nested');

      expect(container.has('some.nested.key')).toBeFalsy();
      expect(container.has('some.nested.second-key')).toBeFalsy();
      expect(container.has('some.nested')).toBeFalsy();
      expect(container.has('some')).toBeFalsy();
    });
  });
});
