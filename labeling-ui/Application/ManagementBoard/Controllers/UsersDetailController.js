class UsersDetailController {
  constructor($stateParams, user) {
    this.user = user;
    this.userId = $stateParams.userId;
  }
}

UsersDetailController.$inject = [
  '$stateParams',
  'user',
];

export default UsersDetailController;
