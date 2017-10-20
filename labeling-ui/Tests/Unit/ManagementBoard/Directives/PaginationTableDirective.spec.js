import {module, inject} from 'angular-mocks';
import ApplicationModule from 'Application/Module';
import annoStationUnitTestModuleCreator from 'Tests/Support/AnnoStationUnitTestModule';
import PaginationTableDirective from '../../../../Application/ManagementBoard/Directives/PaginationTableDirective';

const AnnoStationUnitTestModule = annoStationUnitTestModuleCreator(ApplicationModule);

describe('PaginationTableDirective', () => {
  let rootScope;
  let compile;
  let element;
  let controller;
  let scope;
  let vm;

  let paginationActivePageStorageMock;

  function renderDirective(itemsPerPage = 10, storageIdentifier = undefined) {
    scope = rootScope.$new();
    vm = {};
    scope.vm = vm;

    vm.totalRows = 0;
    vm.onPageUpdate = jasmine.createSpy('onPageUpdate');

    element = compile(`
      <div pagination-table
           items-per-page="${itemsPerPage}"
           total-rows="vm.totalRows"
           on-page-update="vm.onPageUpdate(page, itemsPerPage)"
           ${storageIdentifier !== undefined ? 'storage-identifier="' + storageIdentifier + '"' : ''}
      ></div>
    `)(scope);
    controller = element.controller('paginationTable');
    scope.$apply();
  }

  beforeEach(() => {
    paginationActivePageStorageMock = jasmine.createSpyObj(
      'PaginationActivePageStorage',
      [
        'storeActivePage',
        'retrieveActivePage',
      ]
    );
  });

  beforeEach(() => {
    module($provide => {
      $provide.value('paginationActivePageStorage', paginationActivePageStorageMock);
    });
  });

  beforeEach(() => {
    const angularModule = new AnnoStationUnitTestModule();
    angularModule.registerDirective('paginationTable', PaginationTableDirective);
    module('AnnoStation-Unit');
  });

  beforeEach(inject(($rootScope, $compile) => {
    rootScope = $rootScope;
    compile = $compile;
  }));

  it('should be renderable', () => {
    expect(() => {
      renderDirective();
    }).not.toThrow();
  });

  it('should call onPageUpdate with page 1 by default', () => {
    renderDirective(10);
    expect(vm.onPageUpdate).toHaveBeenCalledWith(1, 10);
  });

  it('should not utilize storage if no storageIdentifier is set', () => {
    renderDirective(10);
    expect(paginationActivePageStorageMock.retrieveActivePage).not.toHaveBeenCalled();
  });

  it('should read from storage if storageIdentifier is set', () => {
    const storageIdentifier = 'the-library';
    renderDirective(10, storageIdentifier);
    expect(paginationActivePageStorageMock.retrieveActivePage).toHaveBeenCalled();
  });

  it('should use the given storageIdentifier to read from storage', () => {
    const storageIdentifier = 'the-library';
    renderDirective(10, storageIdentifier);
    expect(paginationActivePageStorageMock.retrieveActivePage).toHaveBeenCalledWith(storageIdentifier);
  });

  it('should tell us that page 1 is active by default', () => {
    renderDirective();

    expect(controller.isPageActive(0)).toBeFalsy();
    expect(controller.isPageActive(1)).toBeTruthy();
    expect(controller.isPageActive(2)).toBeFalsy();
  });

  it('should call onPageUpdate, when page is changed', () => {
    renderDirective(10);
    controller.triggerPageUpdate(23);

    expect(vm.onPageUpdate).toHaveBeenCalledWith(23, 10);
  });

  it('should not store new page if no storageIdentifier is set', () => {
    renderDirective(10);
    controller.triggerPageUpdate(23);

    expect(paginationActivePageStorageMock.storeActivePage).not.toHaveBeenCalled();
  });

  it('should store new page if a storageIdentifier is set', () => {
    const storageIdentifier = 'the-library';
    renderDirective(10, storageIdentifier);
    controller.triggerPageUpdate(23);

    expect(paginationActivePageStorageMock.storeActivePage).toHaveBeenCalled();
  });

  it('should store new page with correct identifier, current itemsPerPage and totalRows', () => {
    const storageIdentifier = 'the-library';
    const totalRows = 1000;
    const itemsPerPage = 42;
    const newPage = 23;

    renderDirective(itemsPerPage, storageIdentifier);
    vm.totalRows = totalRows;

    rootScope.$apply();

    controller.triggerPageUpdate(newPage);

    expect(paginationActivePageStorageMock.storeActivePage)
      .toHaveBeenCalledWith(storageIdentifier, itemsPerPage, totalRows, newPage);
  });

  it('should report currently active page as active', () => {
    renderDirective(10);
    controller.triggerPageUpdate(23);

    expect(controller.isPageActive(1)).toBeFalsy();
    expect(controller.isPageActive(22)).toBeFalsy();
    expect(controller.isPageActive(23)).toBeTruthy();
    expect(controller.isPageActive(24)).toBeFalsy();
  });

  it('should jump to page 1 if nothing is stored in the storage', () => {
    const storageIdentifier = 'the-library';
    paginationActivePageStorageMock.retrieveActivePage.and.returnValue(undefined);
    renderDirective(10, storageIdentifier);

    expect(vm.onPageUpdate).toHaveBeenCalledWith(1, 10);
  });

  it('should jump to page 1 if itemsPerPage differs from the on in cache', () => {
    const storageIdentifier = 'the-library';
    paginationActivePageStorageMock.retrieveActivePage
      .and.returnValue(
      {
        itemsPerPage: 99,
        totalRows: 10000,
        page: 23,
      }
    );
    renderDirective(10, storageIdentifier);

    expect(vm.onPageUpdate).toHaveBeenCalledWith(1, 10);
  });

  it('should jump to stored page if everything seems in order', () => {
    const storageIdentifier = 'the-library';
    paginationActivePageStorageMock.retrieveActivePage
      .and.returnValue(
      {
        itemsPerPage: 99,
        totalRows: 10000,
        page: 23,
      }
    );
    renderDirective(99, storageIdentifier);

    expect(vm.onPageUpdate).toHaveBeenCalledWith(23, 99);
  });
});
