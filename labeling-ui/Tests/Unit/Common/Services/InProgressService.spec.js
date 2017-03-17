import InProgressService from 'Application/Common/Services/InProgressService';
import {inject} from 'angular-mocks';

fdescribe('InProgressService test suite', () => {
  let inProgress;
  let windowMock;

  beforeEach(inject($window => {
    windowMock = $window;
    inProgress = new InProgressService(windowMock);
  }));

  it('can be created', () => {
    expect(inProgress).toEqual(jasmine.any(InProgressService));
  });

  describe('#start()', () => {
    let scopeMock;

    beforeEach(() => {
      scopeMock = jasmine.createSpyObj('$scope', ['$on']);
    });

    it('adds an event listener to the $scope destroy event', () => {
      inProgress.start(scopeMock);

      expect(scopeMock.$on).toHaveBeenCalledWith('$destroy', jasmine.any(Function));
    });

    it('adds a callback to beforeunload', () => {
      spyOn(windowMock, 'addEventListener');
      inProgress.start(scopeMock);
      expect(windowMock.addEventListener).toHaveBeenCalledWith('beforeunload', jasmine.any(Function));
    });
  });
});