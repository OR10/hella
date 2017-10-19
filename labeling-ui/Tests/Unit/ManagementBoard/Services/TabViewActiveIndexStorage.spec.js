import TabViewActiveIndexStorage from '../../../../Application/ManagementBoard/Services/TabViewActiveIndexStorage';

describe('TabViewActiveIndexStorage', () => {
  /**
   * @returns {TabViewActiveIndexStorage}
   */
  function createTabViewActiveIndexStorage() {
    return new TabViewActiveIndexStorage();
  }

  it('should be instantiable', () => {
    const storage = createTabViewActiveIndexStorage();
    expect(storage).toEqual(jasmine.any(TabViewActiveIndexStorage));
  });

  it('should return `undefined` for yet unknown instances', () => {
    const storage = createTabViewActiveIndexStorage();
    const tabViewInstanceMock = {};

    const resultValue = storage.retrieveActiveIndex(tabViewInstanceMock);

    expect(resultValue).toBeUndefined();
  });

  it('should store and retrieve an index value for a certain instance', () => {
    const storage = createTabViewActiveIndexStorage();
    const tabViewInstanceMock = {};
    const tabViewIndexValue = 42;

    storage.storeActiveIndex(tabViewInstanceMock, tabViewIndexValue);

    const resultValue = storage.retrieveActiveIndex(tabViewInstanceMock);

    expect(resultValue).toEqual(tabViewIndexValue);
  });

  it('should store different index values for different instances', () => {
    const storage = createTabViewActiveIndexStorage();
    const tabViewInstanceMockOne = {};
    const tabViewInstanceMockTwo = {};
    const tabViewInstanceMockThree = {};
    const tabViewIndexValueOne = 42;
    const tabViewIndexValueTwo = 23;

    storage.storeActiveIndex(tabViewInstanceMockOne, tabViewIndexValueOne);
    storage.storeActiveIndex(tabViewInstanceMockTwo, tabViewIndexValueTwo);

    const resultValueOne = storage.retrieveActiveIndex(tabViewInstanceMockOne);
    const resultValueTwo = storage.retrieveActiveIndex(tabViewInstanceMockTwo);
    const resultValueThree = storage.retrieveActiveIndex(tabViewInstanceMockThree);

    expect(resultValueOne).toEqual(tabViewIndexValueOne);
    expect(resultValueTwo).toEqual(tabViewIndexValueTwo);
    expect(resultValueThree).toBeUndefined();
  });

  it('should remove stored index values', () => {
    const storage = createTabViewActiveIndexStorage();
    const tabViewInstanceMockOne = {};
    const tabViewInstanceMockTwo = {};
    const tabViewIndexValueOne = 42;
    const tabViewIndexValueTwo = 23;

    storage.storeActiveIndex(tabViewInstanceMockOne, tabViewIndexValueOne);
    storage.storeActiveIndex(tabViewInstanceMockTwo, tabViewIndexValueTwo);

    storage.clearActiveIndex(tabViewInstanceMockOne);

    const resultValueOne = storage.retrieveActiveIndex(tabViewInstanceMockOne);
    const resultValueTwo = storage.retrieveActiveIndex(tabViewInstanceMockTwo);

    expect(resultValueOne).toBeUndefined();
    expect(resultValueTwo).toEqual(tabViewIndexValueTwo);
  });
});
