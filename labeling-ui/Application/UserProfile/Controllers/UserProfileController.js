class UserProfileController {

  constructor(user) {
    this.user = user;
  }
}

UserProfileController.$inject = ['user'];

export default UserProfileController;