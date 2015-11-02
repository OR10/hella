/**
 * @class LabelWizardController
 */
export default class LabelWizardController {
  constructor() {
    if (!this.offset) {
      this.offset = 0;
    }

    if (this.limit) {
      this.steps = this.labelState.children.slice(this.offset, this.offset + this.limit);
    } else {
      this.steps = this.labelState.children;
    }
  }
}
