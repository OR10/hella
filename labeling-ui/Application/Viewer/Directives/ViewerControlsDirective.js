import viewerControlsTempate from './ViewerControlsDirective.html!';

/**
 * @class ViewerControlsDirective
 * @ngdoc directive
 */
export default class ViewerControlsDirective {
  constructor() {
    this.template = viewerControlsTempate;
    this.scope = {
      frameForward: '&',
      frameBackward: '&',
    };
  }

  controller($rootScope, $scope) {
    $scope.frameForward = () => {
      $rootScope.$broadcast('viewer-controls:frame-forward');
    };

    $scope.frameBackward = () => {
      $rootScope.$broadcast('viewer-controls:frame-backward');
    };
  }
}

ViewerControlsDirective.prototype.controller.$inject = ['$rootScope', '$scope'];