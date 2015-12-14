class FrameNumberInputDirective {
  constructor() {
    this.restrict = 'E';
    this.require = 'ngModel';
    this.template = '<span contenteditable="true"></span>';
  }

  link(scope, element, attrs, ngModel) {
    // Write data to the model
    const editable = element.find('[contenteditable]');

    function read() {
      let html = editable.html();
      // When we clear the content editable the browser leaves a <br> behind
      // If strip-br attribute is provided then we strip this out
      if (html === '<br>' ) {
        html = '';
      }


      // Only numbers are allowed everything else is removed
      const cleaned = html.replace(/[^0-9]/g, '');
      ngModel.$setViewValue(Number.parseInt(cleaned));
      ngModel.$render();
    }

    // Specify how UI should be updated
    ngModel.$render = () => {
      editable.html(ngModel.$viewValue || '');
    };

    // Listen for change events to enable binding
    editable.on('blur keyup change', () => {
      scope.$evalAsync(read);
    });
    read(); // initialize
  }
}

export default FrameNumberInputDirective;
