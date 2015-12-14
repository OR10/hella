class FrameNumberInputDirective {
  constructor() {
    this.restrict = 'E';
    this.require = 'ngModel';
    this.template = '<span contenteditable="true"></span>';
  }

  link(scope, element, attrs, ngModel) {
    // Write data to the model
    const editable = element.find('[contenteditable]');

    function getEditableValue() {
      let value = editable.html();
      // If the field is empty a '<br />' is inserted by the browser.
      if (value === '<br>') {
        value = '';
      }
      // Only numbers are allowed everything else is removed
      const cleaned = value.replace(/[^0-9]/g, '');

      return cleaned;
    }

    /**
     * Only allow numbers and navigational keys
     */
    function onKeyDown(event) {
      switch (true) {
        // Numbers
        case (event.keyCode >= 48 && event.keyCode <= 57):
        // Arrow keys left/right
        case (event.keyCode === 37 || event.keyCode === 39):
        // Backspace / del
        case (event.keyCode === 8 || event.keyCode === 46):
          // Allow
          return;
        // Return
        case (event.keyCode === 13):
          // Blur for update
          editable.blur();
          event.preventDefault();
          break;
        // arrow up
        case (event.keyCode === 38):
          const value = Number.parseInt(getEditableValue());
          if (value > 1) {
            editable.html(value - 1);
          }
          event.preventDefault();
          break;
        // arrow down
        case (event.keyCode === 40):
          editable.html(Number.parseInt(getEditableValue()) + 1);
          event.preventDefault();
          break;

        default:
          event.preventDefault();
      }
    }

    function onBlur() {
      ngModel.$setViewValue(getEditableValue());
    }

    // Specify how UI should be updated
    ngModel.$render = () => {
      editable.html(ngModel.$viewValue || '');
    };

    // Listen for change events to enable binding
    editable.on('keydown', onKeyDown);
    editable.on('blur', () => {
      scope.$evalAsync(onBlur);
    });

    // Initial rendering
    ngModel.$render();
  }
}

export default FrameNumberInputDirective;
