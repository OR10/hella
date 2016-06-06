class RightClickDirective {
  constructor($parse) {
    this.restrict = 'A';
    this._$parse = $parse;
  }

  link(scope, element, attrs) {
    const fn = this._$parse(attrs.asRightClick);
    element.bind('contextmenu', event => {
      scope.$apply(() => {
        event.preventDefault();
        fn(scope, {$event: event});
      });
    });
  }
}

RightClickDirective.$inject = [
  '$parse',
];

export default RightClickDirective;
