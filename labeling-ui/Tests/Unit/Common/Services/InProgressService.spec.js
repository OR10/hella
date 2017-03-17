import InProgressService from 'Application/Common/Services/InProgressService';

fdescribe('InProgressService test suite', () => {
  let inProgress;

  beforeEach(() => {
    inProgress = new InProgressService();
  });

  it('can be created', () => {
    expect(inProgress).toEqual(jasmine.any(InProgressService));
  });

  describe('#start()', () => {
    it('adds an event listener to the $scope destroy event', () => {
      const scopeMock = jasmine.createSpyObj('$scope', ['$on']);
      inProgress.start(scopeMock);

      expect(scopeMock.$on).toHaveBeenCalledWith('$destroy', jasmine.any(Function));
    });
  });
});