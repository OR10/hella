import paper from 'paper';
import PaperShape from '../../Viewer/Shapes/PaperShape';

class LabeledThingGroupService {
  constructor() {

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
   * @return {{x: *, y: *, width: number, height: number, point: Point}}
   */
  getBoundsForShapes(shapes) {
    const bounds = shapes.map(shape => shape.bounds);
    let minX;
    let minY;
    let maxX;
    let maxY;
    bounds.forEach(bound => {
      let xPoint;
      let yPoint;

      if (typeof bound.x === 'object' && typeof bound.y === 'object') {
        xPoint = bound.x;
        yPoint = bound.y;
      } else {
        xPoint = bound;
        yPoint = bound;
      }

      if (minX === undefined || xPoint.x < minX) {
        minX = xPoint.x;
      }
      if (minY === undefined || yPoint.y < minY) {
        minY = yPoint.y;
      }
      if (maxX === undefined || xPoint.x + bound.width > maxX) {
        maxX = xPoint.x + bound.width;
      }
      if (maxY === undefined || yPoint.y + bound.height > maxY) {
        maxY = yPoint.y + bound.height;
      }
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      point: new paper.Point(minX, minY),
    };
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
