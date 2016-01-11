import DataContainer from 'Application/LabelingData/Support/DataContainer';

describe('DataContainer', () => {
  function initializeDataContainer(data) {
    const dataContainer = new DataContainer();

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        dataContainer.set(key, data[key]);
      }
    }

    return dataContainer;
  }

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
    it('should check for multiple keys to be present', () => {
      const dataContainer = initializeDataContainer({
        foo: 'bar',
        bar: 'baz',
      });

      expect(dataContainer.getAll(keys)).toEqual(expectedResult);
    });
  });
});
