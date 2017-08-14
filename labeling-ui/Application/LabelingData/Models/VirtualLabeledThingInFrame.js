import LabeledObject from './LabeledObject';
import {cloneDeep} from 'lodash';

class VirtualLabeledThingInFrame extends LabeledObject {
  /**
   * @param {{id: string, task: Task, identifierName: string}} virtualLabeledThingInFrame
   */
  constructor(virtualLabeledThingInFrame) {
    const labeledObject = cloneDeep(virtualLabeledThingInFrame);
    labeledObject.classes = [];
    labeledObject.incomplete = false;

    super(labeledObject);

    /**
     * @type {string}
     */
    this.identifierName = virtualLabeledThingInFrame.identifierName;
  }
}

export default VirtualLabeledThingInFrame;
