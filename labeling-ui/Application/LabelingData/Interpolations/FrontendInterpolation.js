/**
 * Interpolation base class, for all {@link Interpolation}s, which are executed on the backend
 *
 * @implements Interpolation
 * @abstract
 */
import PaperCuboid from "../../ThirdDimension/Shapes/PaperCuboid";
import PaperPedestrian from "../../Viewer/Shapes/PaperPedestrian";
import paper from 'paper';
class FrontendInterpolation {
  
  /**
   *
   * @param {LabeledThingInFrameGateway} labeledThingInFrameGateway
   * @param {PaperShapeFactory} paperShapeFactory
   */
  constructor(labeledThingInFrameGateway) {
  
    /**
     * @type {LabeledThingInFrameGateway}
     * @private
     */
    this._labeledThingInFrameGateway = labeledThingInFrameGateway;
    
  }
  
  /**
   * @param {Task} task
   * @param {LabeledThing} labeledThing
   * @param {FrameRange} frameRange
   */
  execute(task, labeledThing, frameRange) {
    this._labeledThingInFrameGateway.getLabeledThingInFrame
    (
        task,
        frameRange.startFrameIndex,
        labeledThing,
        frameRange.startFrameIndex,
        frameRange.endFrameIndex
    ).then(labeledThingInFrames => {
      if (labeledThingInFrames.length == 0) {
        throw new Error('Insufficient labeled things in frame');
      }
      
      labeledThingInFrames = labeledThingInFrames.filter(labeledThingInFrame => {
        // remove ghosts
        return labeledThingInFrame.id !== null;
      });
      while (labeledThingInFrames.length > 1) {
        const currentLtif = labeledThingInFrames.shift();
        this._doInterpolation(currentLtif, frameRange);
      }
    })
    
  }

  /**
   *
   * @param labeledThingInFrame
   * @param frameRange
   * @private
   */
  _doInterpolation(labeledThingInFrame, frameRange) {
    if (frameRange.endFrameIndex - frameRange.startFrameIndex < 2) {
      throw new Error(`Error in _doInterpolation: endFrameIndex (${frameRange.endFrameIndex}) - startFrameIndex (${frameRange.startFrameIndex}) < 2`);
    }

    let remainingSteps = frameRange.endFrameIndex - frameRange.startFrameIndex;
    const frameIndex = (frameRange.endFrameIndex-1) - (frameRange.startFrameIndex + 1);
    let currentShapes = labeledThingInFrame.shapes;
    
    angular.forEach(Array.from(Array(frameIndex).keys()), (index) => {
      currentShapes = currentShapes.map(shape => {
        this._interpolateShape(labeledThingInFrame, remainingSteps);
      });
      --remainingSteps;
    })
  }

  /**
   *
   * @param labeledThingInFrame
   * @param step
   * @returns {*}
   * @private
   */
  _interpolateShape(labeledThingInFrame, step) {
    switch (labeledThingInFrame.type){
      case 'pedestrian':
        return this._interpolatePedestrian(labeledThingInFrame, step);
        break;
      default:
        return null;
    }
  }

  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {Number} step
   * @private
   */
  _interpolatePedestrian(labeledThingInFrame, step) {
    //TODO Here: Manipulate labeledThingInFrame and changed his postion and save it to couch db with this._labeledThingInFrameGateway.saveLabeledThingInFrame()
  }
}

FrontendInterpolation.$inject = [
  'labeledThingInFrameGateway',
];

export default FrontendInterpolation;