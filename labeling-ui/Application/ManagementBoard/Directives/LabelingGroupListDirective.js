import LabelingGroupListTemplate from './LabelingGroupListDirective.html!';
import LabelingGroupListController from './LabelingGroupListController';

/**
 * Directive to display a List of all {@link LabelingGroup}s currently available in the backend
 *
 * The directive retrieves the list automatically from the backend.
 */
class LabelingGroupListDirective {
  constructor() {
    this.scope = {
      user: '=',
      userPermissions: '=',
    };

    this.template = LabelingGroupListTemplate;

    this.controller = LabelingGroupListController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}


export default LabelingGroupListDirective;
