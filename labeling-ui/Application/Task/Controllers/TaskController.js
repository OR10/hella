import metaLabelStructure from 'Tests/Fixtures/meta-label-structure.json!';
import metaLabelAnnotation from 'Tests/Fixtures/meta-label-structure-ui-annotation.json!';
import objectLabelStructure from 'Tests/Fixtures/object-label-structure.json!';
import objectLabelAnnotation from 'Tests/Fixtures/object-label-structure-ui-annotation.json!';


export default class TaskController {
  /**
   * @param {Task} task
   */
  constructor(task) {
    /**
     * @type {Task}
     */
    this.task = task;
    this.frameNumber = 1;

    this.metaLabelStructure = metaLabelStructure;
    this.objectLabelStructure = objectLabelStructure;
    this.metaLabelAnnotation = metaLabelAnnotation;
    this.objectLabelAnnotation = objectLabelAnnotation;
  }

  handleMetaLabelingChanged(classes, incomplete) {
    console.log(arguments);
  }

  handleObjectLabelingChanged(classes, incomplete) {
    console.log(arguments);
  }

  handleNewAnnotation(id, annotation) {
    console.log(arguments)
  }

  handleUpdatedAnnotation(id, annotation) {
    console.log(arguments)
  }
}

TaskController.$inject = ['task'];

