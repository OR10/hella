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

  /**
   *
   * @param {Array.<PaperShape>} shapes
   * @return {{x: number, y: number, width: number, height: number, point: paper.Point}}
   */
  getBoundsForShapes(shapes) {
    const bounds = shapes.map(shape => shape.bounds);

    const minX = bounds.reduce((prev, current) => {
      return prev.x < current.x ? prev.x : current.x;
    });
    const minY = bounds.reduce((prev, current) => {
      return prev.y < current.y ? prev.y : current.y;
    });
    const maxX = bounds.reduce((prev, current) => {
      return prev.x > current.x ? prev.x : current.x;
    });
    const maxY = bounds.reduce((prev, current) => {
      return prev.y > current.y ? prev.y : current.y;
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
