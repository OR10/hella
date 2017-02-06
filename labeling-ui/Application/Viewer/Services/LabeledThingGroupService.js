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

  getLabeledThingsInFrameForShapes(shapes) {
  }
}

LabeledThingGroupService.$inject = [];

export default LabeledThingGroupService;
