import userAvatarTemplate from './UserAvatarDirective.html!';
import UserAvatarController from './UserAvatarController';

class UserAvatarDirective {
  constructor() {
    this.scope = {
      user: '=',
    };

    this.template = userAvatarTemplate;

    this.controller = UserAvatarController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}

export default UserAvatarDirective;
