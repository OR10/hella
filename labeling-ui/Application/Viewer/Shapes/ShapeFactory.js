import paper from 'paper';
import Rectangle from './Rectangle';

class ShapeFactory {
  constructor($baseScope) {
    this._$baseScope = $baseScope;
  }

  createRectangle({shape, color, selected = true}) {
    const $scope = this._$baseScope.$new(true);
    $scope.vm = {shape, color, selected};

    return new Rectangle($scope);
  }
}

export default ShapeFactory;
