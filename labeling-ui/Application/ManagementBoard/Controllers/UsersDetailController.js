class UsersDetailController {
  constructor($stateParams) {
    this.userId = $stateParams.userId;
  }
}

UsersDetailController.$inject = [
  '$stateParams',
];

export default UsersDetailController;
