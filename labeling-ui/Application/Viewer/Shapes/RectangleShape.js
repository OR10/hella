import paper from 'paper';

class RectangleShape extends paper.Group {
  constructor($scope) {
    super();
    super.initialize();

    // $scope.vm.

    this.rectangle = new paper.Rectangle(/* ... */);

    this.addChild(/* rectangle */);

    $scope.$watch('selected', () => {
      // ...
    });
  }
}


export default RectangleShape;
