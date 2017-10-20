import {inject} from 'angular-mocks';
import TabViewController from '../../../../Application/ManagementBoard/Directives/TabViewController';

describe('TabViewController', () => {
  let rootScope;
  let scope;
  let vm;
  let tabViewActiveIndexStorageMock;

  function createTabViewController() {
    return new TabViewController(
      scope,
      tabViewActiveIndexStorageMock
    );
  }

  function createTabMock(header = 'Captain Archer') {
    const tabControllerMock = jasmine.createSpyObj('TabController', ['activate', 'deactivate']);
    tabControllerMock.header = header;
    return tabControllerMock;
  }

  function transferVmToController(viewModel, controller) {
    Object.keys(viewModel).forEach(key => controller[key] = viewModel[key]);
  }

  beforeEach(inject($rootScope => {
    rootScope = $rootScope;
  }));

  beforeEach(() => {
    scope = rootScope.$new();
    vm = {};
    scope.vm = vm;
    tabViewActiveIndexStorageMock = jasmine.createSpyObj(
      'TabViewActiveIndexStorage',
      [
        'storeActiveIndex',
        'retrieveActiveIndex',
        'clearActiveIndex',
      ]
    );
  });

  it('should be instantiable', () => {
    const tabViewController = createTabViewController();
    expect(tabViewController).toEqual(jasmine.any(TabViewController));
  });

  describe('Disabled ActiveIndex Storage', () => {
    let tabViewController;

    beforeEach(() => {
      tabViewController = createTabViewController();
      transferVmToController(vm, tabViewController);
    });

    it('should not store activeIndex upon tab change', () => {
      vm.activeIndex = 23;
      rootScope.$apply();

      expect(tabViewActiveIndexStorageMock.storeActiveIndex).not.toHaveBeenCalled();
    });

    it('should activate the first Tab, which is registered, if no activeIndex has been stored before', () => {
      const tabMockOne = createTabMock('Archer');
      const tabMockTwo = createTabMock('Kirk');

      tabViewController.registerTab(tabMockOne);
      tabViewController.registerTab(tabMockTwo);

      rootScope.$apply();

      expect(tabMockOne.activate).toHaveBeenCalled();
      expect(tabMockTwo.activate).not.toHaveBeenCalled();
    });

    it('should activate the first Tab, which is registered, if an activeIndex has been stored before', () => {
      const tabMockOne = createTabMock('Archer');
      const tabMockTwo = createTabMock('Kirk');

      tabViewActiveIndexStorageMock.retrieveActiveIndex.and.returnValue(1);

      tabViewController.registerTab(tabMockOne);
      tabViewController.registerTab(tabMockTwo);

      rootScope.$apply();

      expect(tabMockOne.activate).toHaveBeenCalled();
      expect(tabMockTwo.activate).not.toHaveBeenCalled();
    });
  });

  describe('Enabled ActiveIndex Storage', () => {
    let storageIdentifier;
    let tabViewController;

    beforeEach(() => {
      storageIdentifier = 'star-trek-captains';
      vm.storageIdentifier = storageIdentifier;

      tabViewController = createTabViewController();
      transferVmToController(vm, tabViewController);
    });

    it('should store activeIndex upon tab change with given storageIdentifier', () => {
      vm.activeIndex = 23;
      rootScope.$apply();

      expect(tabViewActiveIndexStorageMock.storeActiveIndex).toHaveBeenCalledWith(storageIdentifier, 23);
    });

    it('should retrieve activeIndex upon tab registration with given storageIdentifier', () => {
      const tabMockOne = createTabMock('Archer');
      tabViewController.registerTab(tabMockOne);

      rootScope.$apply();

      expect(tabViewActiveIndexStorageMock.retrieveActiveIndex).toHaveBeenCalledWith(storageIdentifier);
    });

    it('should activate the first Tab, which is registered, if no activeIndex has been stored before', () => {
      const tabMockOne = createTabMock('Archer');
      const tabMockTwo = createTabMock('Kirk');

      tabViewController.registerTab(tabMockOne);
      tabViewController.registerTab(tabMockTwo);

      rootScope.$apply();

      expect(tabMockOne.activate).toHaveBeenCalled();
      expect(tabMockTwo.activate).not.toHaveBeenCalled();
    });

    it('should activate stored tab index upon registration', () => {
      const tabMockOne = createTabMock('Archer');
      const tabMockTwo = createTabMock('Kirk');
      const tabMockThree = createTabMock('Picard');

      tabViewActiveIndexStorageMock.retrieveActiveIndex.and.returnValue(1);

      tabViewController.registerTab(tabMockOne);
      tabViewController.registerTab(tabMockTwo);
      tabViewController.registerTab(tabMockThree);

      rootScope.$apply();

      expect(tabMockOne.activate).not.toHaveBeenCalled();
      expect(tabMockTwo.activate).toHaveBeenCalled();
      expect(tabMockThree.activate).not.toHaveBeenCalled();
    });
  });
});
