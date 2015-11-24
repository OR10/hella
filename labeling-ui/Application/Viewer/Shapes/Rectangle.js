import paper from 'paper';

class Rectangle extends paper.Group {
  constructor($scope) {
    super();
    super.initialize();

    this._$scope = $scope;

    const {shape, color: strokeColor} = $scope.vm;

    this._rectangle = new paper.Path.Rectangle({
      strokeColor,
      strokeWidth: 2,
      strokeScaling: false,
      fillColor: new paper.Color(0, 0, 0, 0),
      from: shape.topLeft,
      to: shape.bottomRight,
    });

    this.addChild(this._rectangle);
  }
}


export default Rectangle;
