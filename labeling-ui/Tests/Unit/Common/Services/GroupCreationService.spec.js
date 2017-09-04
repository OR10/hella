import {inject} from 'angular-mocks';
import GroupCreationService from 'Application/Common/Services/GroupCreationService';

describe('GroupCreationService', () => {
  let groupCreationService;
  let modalService;
  let selectionDialog;
  let selectionDialogCallback;
  let angularQ;
  let rootScope;

  beforeEach(inject(($rootScope, $q) => {
    rootScope = $rootScope;
    angularQ = $q;
  }));

  beforeEach(() => {
    modalService = jasmine.createSpyObj('modalService', ['show']);
    selectionDialog = (config, callback) => {
      selectionDialogCallback = callback;
    };

    groupCreationService = new GroupCreationService(modalService, selectionDialog, angularQ);
  });

  describe('showGroupSelector', () => {
    it('throws an error by default, if no groups are set', () => {
      const throwWrapper = () => {
        const promise = angularQ.defer();
        const result = groupCreationService.showGroupSelector();
        expect(result).toEqual(jasmine.any(promise));
      };

      expect(throwWrapper).toThrowError('Cannot read property \'length\' of undefined');
    });

    it('it resolves the group without any modal window if there is only one group', done => {
      const group = {id: 'first-group'};
      const groups = [group];
      groupCreationService.setAvailableGroups(groups);

      groupCreationService.showGroupSelector().then(selectedGroup => {
        expect(selectedGroup).toBe(group);
        expect(modalService.show).not.toHaveBeenCalled();
        done();
      });

      rootScope.$apply();
    });

    it('resolves the selected group if there is more than one group available', done => {
      const groupOne = {id: 'first-group'};
      const groupTwo = {id: 'second-group'};
      const groupThree = {id: 'third-group'};
      const groups = [groupOne, groupTwo, groupThree];
      groupCreationService.setAvailableGroups(groups);

      groupCreationService.showGroupSelector().then(selectedGroup => {
        expect(selectedGroup).toBe(groupTwo);
        expect(modalService.show).toHaveBeenCalledTimes(1);
        done();
      });

      selectionDialogCallback('second-group');
      rootScope.$apply();
    });

    it('shows the group selector modal once more if the selected group id was undefined', done => {
      const groupOne = {id: 'first-group'};
      const groupTwo = {id: 'second-group'};
      const groupThree = {id: 'third-group'};
      const groups = [groupOne, groupTwo, groupThree];
      groupCreationService.setAvailableGroups(groups);

      groupCreationService.showGroupSelector().then(() => {
        done.fail('This should not have happened');
      });
      selectionDialogCallback(undefined);
      rootScope.$apply();

      expect(modalService.show).toHaveBeenCalledTimes(2);
      done();
    });
  });
});
