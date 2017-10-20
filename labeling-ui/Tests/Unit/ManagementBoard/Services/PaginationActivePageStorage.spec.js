import PaginationActivePageStorage from '../../../../Application/ManagementBoard/Services/PaginationActivePageStorage';

describe('PaginationActivePageStorage', () => {
  let loggerMock;

  beforeEach(() => {
    loggerMock = jasmine.createSpyObj('LoggerService', ['log']);
  });

  /**
   * @returns {PaginationActivePageStorage}
   */
  function createPaginationActivePageStorage() {
    return new PaginationActivePageStorage(
      loggerMock
    );
  }

  it('should be instantiable', () => {
    const storage = createPaginationActivePageStorage();
    expect(storage).toEqual(jasmine.any(PaginationActivePageStorage));
  });

  it('should store active page values', () => {
    const storage = createPaginationActivePageStorage();
    const identifierOne = 'alpha-quadrant';
    const identifierTwo = 'beta-quadrant';

    expect(() => {
      storage.storeActivePage(identifierOne, 10, 100, 23);
      storage.storeActivePage(identifierTwo, 25, 1000, 42);
    }).not.toThrow();
  });

  it('should allow retrieval of page information', () => {
    const storage = createPaginationActivePageStorage();
    const identifierOne = 'alpha-quadrant';

    expect(() => {
      storage.retrieveActivePage(identifierOne);
    }).not.toThrow();
  });

  it('should respond with `undefined` if value no page was stored yet', () => {
    const storage = createPaginationActivePageStorage();
    const identifierOne = 'alpha-quadrant';

    const returnValue = storage.retrieveActivePage(identifierOne);

    expect(returnValue).toBeUndefined();
  });

  it('should allow retrieval of before stored page value', () => {
    const storage = createPaginationActivePageStorage();
    const identifierOne = 'alpha-quadrant';
    const itemsPerPage = 10;
    const totalRows = 100;
    const page = 23;

    storage.storeActivePage(identifierOne, itemsPerPage, totalRows, page);
    const returnValue = storage.retrieveActivePage(identifierOne);

    expect(returnValue).toEqual({itemsPerPage, totalRows, page});
  });

  it('should allow retrieval of before stored page value with specific identifier', () => {
    const storage = createPaginationActivePageStorage();
    const identifierOne = 'alpha-quadrant';
    const itemsPerPageOne = 10;
    const totalRowsOne = 100;
    const pageOne = 23;

    const identifierTwo = 'beta-quadrant';
    const itemsPerPageTwo = 50;
    const totalRowsTwo = 800;
    const pageTwo = 423;

    const identifierThree = 'gamma-quadrant';
    const itemsPerPageThree = 25;
    const totalRowsThree = 1000;
    const pageThree = 42;

    storage.storeActivePage(identifierOne, itemsPerPageOne, totalRowsOne, pageOne);
    storage.storeActivePage(identifierTwo, itemsPerPageTwo, totalRowsTwo, pageTwo);
    storage.storeActivePage(identifierThree, itemsPerPageThree, totalRowsThree, pageThree);

    const returnValue = storage.retrieveActivePage(identifierTwo);

    expect(returnValue).toEqual(
      {
        itemsPerPage: itemsPerPageTwo,
        totalRows: totalRowsTwo,
        page: pageTwo,
      }
    );
  });
});
