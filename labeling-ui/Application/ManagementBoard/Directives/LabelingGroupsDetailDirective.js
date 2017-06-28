import labelingGroupsDetailTemplate from './LabelingGroupsDetailDirective.html!';
import LabelingGroupsDetailController from './LabelingGroupsDetailController';

/**
 * Directive to display and edit a certain {@link LabelingGroup}
 *
 * The directive loads the labeling groups upon creation
 */
class LabelingGroupsDetailDirective {
  constructor() {
    this.scope = {
      id: '=',
      user: '=',
      userPermissions: '=',
      readonly: '=?',
    };

    this.template = labelingGroupsDetailTemplate;

    this.controller = LabelingGroupsDetailController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}

export default LabelingGroupsDetailDirective;
