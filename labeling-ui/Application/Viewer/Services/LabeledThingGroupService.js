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
    const minX = shapes.reduce((prev, current) => {
      return prev.bounds.x < current.bounds.x ? prev.bounds.x : current.bounds.x;
    });
    const minY = shapes.reduce((prev, current) => {
      return prev.bounds.y < current.bounds.y ? prev.bounds.y : current.bounds.y;
    });
    const maxX = shapes.reduce((prev, current) => {
      return prev.bounds.x > current.bounds.x ? prev.bounds.x : current.bounds.x;
    });
    const maxY = shapes.reduce((prev, current) => {
      return prev.bounds.y > current.bounds.y ? prev.bounds.y : current.bounds.y;
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
