import labelSummaryTemplate from './LabelSummaryDirective.html!';
import LabelSummaryController from '../Controllers/LabelSummaryController';

/**
 * @class LabelSummaryDirective
 */
export default class LabelSummaryDirective {
  constructor() {
    this.template = labelSummaryTemplate;

    this.scope = {
      labelData: '=',
      title: '@',
    };

    this.controller = LabelSummaryController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}
