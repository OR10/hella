import paper from 'paper';
import PaperShape from '../../Viewer/Shapes/PaperShape';

class LabeledThingGroupService {
  constructor() {
    /**
     * @type {number}
     * @private
     */
    this._rectanglePadding = 5;
  }

  /**
   * Retuns all shapes that are within the bounds of the given bound
   *
   * @param {Context} context
   * @param {{x,y,width,height,point}} bounds
   */
  getShapesWithinBounds(context, bounds) {
    return context.scope.project.getItems({
      inside: bounds,
      class: PaperShape,
    });
  }

  /**
   * Return the combined bound for the given shapes
   *
   * @param shapes
   * @return {Array.<{x: *, y: *, width: number, height: number, point: Point}>}
   */
  getBoundsForShapes(shapes) {
    const shapeBounds = shapes.map(shape => shape.bounds);
    let groupShapeBounds = [];

    shapeBounds.forEach(bound => {
      let minX;
      let minY;
      let maxX;
      let maxY;

      if (minX === undefined || bound.x < minX) {
        minX = bound.x;
      }
      if (minY === undefined || bound.y < minY) {
        minY = bound.y;
      }
      if (maxX === undefined || bound.x + bound.width > maxX) {
        maxX = bound.x + bound.width;
      }
      if (maxY === undefined || bound.y + bound.height > maxY) {
        maxY = bound.y + bound.height;
      }

      minX -= this._rectanglePadding;
      minY -= this._rectanglePadding;
      maxX += this._rectanglePadding;
      maxY += this._rectanglePadding;

      groupShapeBounds.push({
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        point: new paper.Point(minX, minY),
      });
    });

    return groupShapeBounds;
  }

  /**
   * Extracts the {@link FrameRange} of the {@link LabeledThingGroup} from the given {@link PaperThingShape}s
   *
   * @param {Array.<PaperThingShape> }thingShapes
   * @param {PaperGroupShape} groupShape
   * @param {number} currentFramePosition
   * @return {FrameRange}
   */
  getFrameRangeFromShapesForGroup(thingShapes, groupShape, currentFramePosition) {
    const thingShapesInGroup = thingShapes.filter(thingShape => thingShape.labeledThingInFrame.labeledThing.groupIds.indexOf(groupShape.id) !== -1);
    let startFrameIndex = currentFramePosition;
    let endFrameIndex = currentFramePosition;

    thingShapesInGroup.forEach(shape => {
      if (!startFrameIndex || shape.labeledThingInFrame.labeledThing.frameRange.startFrameIndex < startFrameIndex) {
        startFrameIndex = shape.labeledThingInFrame.labeledThing.frameRange.startFrameIndex;
      }
      if (!endFrameIndex || shape.labeledThingInFrame.labeledThing.frameRange.endFrameIndex > endFrameIndex) {
        endFrameIndex = shape.labeledThingInFrame.labeledThing.frameRange.endFrameIndex;
      }
    });

    return {startFrameIndex, endFrameIndex};
  }
}

LabeledThingGroupService.$inject = [];

export default LabeledThingGroupService;
