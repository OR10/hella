import TabViewActiveIndexStorage from '../../../../Application/ManagementBoard/Services/TabViewActiveIndexStorage';

describe('TabViewActiveIndexStorage', () => {
  let loggerMock;

  beforeEach(() => {
    loggerMock = jasmine.createSpyObj('LoggerService', ['log']);
  });

  /**
   * @returns {TabViewActiveIndexStorage}
   */
  function createTabViewActiveIndexStorage() {
    return new TabViewActiveIndexStorage(
      loggerMock
    );
  }

  it('should be instantiable', () => {
    const storage = createTabViewActiveIndexStorage();
    expect(storage).toEqual(jasmine.any(TabViewActiveIndexStorage));
  });

  it('should return `undefined` for yet unknown instances', () => {
    const storage = createTabViewActiveIndexStorage();
    const tabViewIdentifier = 'tab-view-identifier-1';

    const resultValue = storage.retrieveActiveIndex(tabViewIdentifier);

    expect(resultValue).toBeUndefined();
  });

  it('should store and retrieve an index value for a certain instance', () => {
    const storage = createTabViewActiveIndexStorage();
    const tabViewIdentifier = 'tab-view-identifier-1';
    const tabViewIndexValue = 42;

    storage.storeActiveIndex(tabViewIdentifier, tabViewIndexValue);

    const resultValue = storage.retrieveActiveIndex(tabViewIdentifier);

    expect(resultValue).toEqual(tabViewIndexValue);
  });

  it('should store different index values for different instances', () => {
    const storage = createTabViewActiveIndexStorage();
    const tabViewIdentifierOne = 'tab-view-identifier-1';
    const tabViewIdentifierTwo = 'tab-view-identifier-2';
    const tabViewIdentifierThree = 'tab-view-identifier-3';
    const tabViewIndexValueOne = 42;
    const tabViewIndexValueTwo = 23;

    storage.storeActiveIndex(tabViewIdentifierOne, tabViewIndexValueOne);
    storage.storeActiveIndex(tabViewIdentifierTwo, tabViewIndexValueTwo);

    const resultValueOne = storage.retrieveActiveIndex(tabViewIdentifierOne);
    const resultValueTwo = storage.retrieveActiveIndex(tabViewIdentifierTwo);
    const resultValueThree = storage.retrieveActiveIndex(tabViewIdentifierThree);

    expect(resultValueOne).toEqual(tabViewIndexValueOne);
    expect(resultValueTwo).toEqual(tabViewIndexValueTwo);
    expect(resultValueThree).toBeUndefined();
  });

  it('should remove stored index values', () => {
    const storage = createTabViewActiveIndexStorage();
    const tabViewIdentifierOne = 'tab-view-identifier-1';
    const tabViewIdentifierTwo = 'tab-view-identifier-2';
    const tabViewIndexValueOne = 42;
    const tabViewIndexValueTwo = 23;

    storage.storeActiveIndex(tabViewIdentifierOne, tabViewIndexValueOne);
    storage.storeActiveIndex(tabViewIdentifierTwo, tabViewIndexValueTwo);

    storage.clearActiveIndex(tabViewIdentifierOne);

    const resultValueOne = storage.retrieveActiveIndex(tabViewIdentifierOne);
    const resultValueTwo = storage.retrieveActiveIndex(tabViewIdentifierTwo);

    expect(resultValueOne).toBeUndefined();
    expect(resultValueTwo).toEqual(tabViewIndexValueTwo);
  });
});
