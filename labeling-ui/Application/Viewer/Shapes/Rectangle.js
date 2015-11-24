import paper from 'paper';

class Rectangle extends paper.Group {
  constructor($scope) {
    super();
    super.initialize();

    this._$scope = $scope;

    const {shape, selected, color: strokeColor} = $scope.vm;

    this._rectangle = new paper.Path.Rectangle({
      strokeColor,
      selected,
      strokeWidth: 2,
      strokeScaling: false,
      fillColor: new paper.Color(0, 0, 0, 0),
      from: shape.topLeft,
      to: shape.bottomRight,
    });

    this.addChild(this._rectangle);

    $scope.$watch('vm.selected', selected => this._rectangle.selected = selected);
  }

  remove() {
    this._$scope.$destroy();
    super.remove();
  }

  select() {
    // $scope.$apply?
    this._$scope.vm.selected = true;
  }

  deselect() {
    // $scope.$apply?
    this._$scope.vm.selected = false;
  }

  moveTo(point) {
    this.position = point;
    const {topLeft, bottomRight} = this.bounds;

    // $scope.$apply?
    this._$scope.vm.topLeft = topLeft;
    this._$scope.vm.bottomRight = bottomRight;
  }
}

export default Rectangle;
