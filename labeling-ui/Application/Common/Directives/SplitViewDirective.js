import {default as split} from 'splitjs';

class SplitViewDirective {
  constructor() {
    this.restrict = 'A';
    this.scope = {
      sizes: '=',
      gutterSize: '@?',
      minSize: '=?',
      direction: '=',
      onDrag: '&?',
      onDragStart: '&?',
      onDragEnd: '&?',
      onInit: '&?',
    };
  }

  link($scope, $element) {
    const splitElements = $element.children();

    const gutterSize = parseInt($scope.gutterSize, 10) || 10;
    const minSize = $scope.minSize === undefined ? new Array(splitElements.length).fill(100) : $scope.minSize;
    const sizes = $scope.sizes;

    const noop = () => {};

    let onDrag = noop;
    let onDragStart = noop;
    let onDragEnd = noop;

    if ($scope.onDrag) {
      onDrag = () => $scope.onDrag();
    }

    if ($scope.onDragStart) {
      onDragStart = () => $scope.onDragStart();
    }

    if ($scope.onDragEnd) {
      onDragEnd = () => $scope.onDragEnd();
    }


    split(splitElements, {
      sizes,
      minSize,
      gutterSize,
      onDrag,
      onDragStart,
      onDragEnd,
    });

    if ($scope.onInit) {
      $scope.onInit();
    }
  }
}

export default SplitViewDirective;
