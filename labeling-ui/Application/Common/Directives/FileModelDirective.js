class FileModelDirective {
  /**
   * @param $parse
   */
  constructor($parse) {
    /**
     * @private
     */
    this._$parse = $parse;

    this.restrict = 'A';
    this.scope = false;
  }

  link($scope, $element, attributes) {
    const model = this._$parse(attributes['fileModel']);

    $element.bind('change',
      () => $scope.$apply(
        () => model.assign($scope, $element[0].files[0])
      )
    );
  }
}

FileModelDirective.$inject = [
  '$parse',
];

export default FileModelDirective;
