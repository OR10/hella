import paper from 'paper';
import PaperShape from '../../Viewer/Shapes/PaperShape';

class LabeledThingGroupService {
  constructor() {

  }

  /**
   * @param {Context} context
   * @param {{x,y,width,height,point}} bounds
   */
  getShapesWithinBounds(context, bounds) {
    return context.scope.project.getItems({
      inside: bounds,
      class: PaperShape,
    });
  }

  getBoundsForShapes(shapes) {
    const bounds = shapes.map(shape => shape.bounds);
    let minX;
    let minY;
    let maxX;
    let maxY;
    bounds.forEach(bound => {
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
   * Calculates a color id for a group from the given shape colors that are in the group.
   *
   * Color id is between 1 and `colorCount` (including 1 and `colorCount`)
   *
   * @param {Array.<PaperShape>} shapes
   * @param {number} colorCount
   * @return {number}
   */
  getGroupColorFromShapesInGroup(shapes, colorCount = 50) {
    const colorSum = shapes.reduce((previous, current) => {
      const previousColorId = parseInt(previous.labeledThingInFrame.labeledThing.lineColor, 10);
      const currentColorId = parseInt(current.labeledThingInFrame.labeledThing.lineColor, 10);
      return previousColorId + currentColorId;
    });
    const colorId = (colorSum % colorCount) + 1;

    return colorId;
  }
}

LabeledThingGroupService.$inject = [];

export default LabeledThingGroupService;
