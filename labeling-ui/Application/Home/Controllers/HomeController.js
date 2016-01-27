/**
 * Controller for the initial entrypoint route into the application
 */
class HomeController {
  constructor(user, userPermissions) {
    this.user = user;
    this.userPermissions = userPermissions;
  }
}

HomeController.$inject = [
  'user',
  'userPermissions',
];

export default HomeController;
