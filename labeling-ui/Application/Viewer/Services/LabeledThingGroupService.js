import paper from 'paper';
import PaperShape from '../../Viewer/Shapes/PaperShape';
import PaperThingShape from '../../Viewer/Shapes/PaperThingShape';
import PaperGroupShape from '../../Viewer/Shapes/PaperGroupShape';

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
    let sum = 0;
    shapes.forEach(currentShape => {
      switch (true) {
        case currentShape instanceof PaperThingShape:
          sum += parseInt(currentShape.labeledThingInFrame.labeledThing.lineColor, 10);
          break;
        case currentShape instanceof PaperGroupShape:
          const otherShapes = shapes.filter(shape => shape.id !== currentShape.id);
          sum += this.getGroupColorFromShapesInGroup(otherShapes);
          break;
        default:
          throw new Error('Cannot get color if of given shape type');
      }
    });
    const colorId = (sum % colorCount) + 1;

    return colorId;
  }
}

LabeledThingGroupService.$inject = [];

export default LabeledThingGroupService;
