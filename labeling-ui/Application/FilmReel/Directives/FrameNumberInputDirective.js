class FrameNumberInputDirective {
  /**
   * @param {FrameIndexService} frameIndexService
   */
  constructor(frameIndexService) {
    this.restrict = 'E';
    this.require = 'ngModel';
    this.template = '<span contenteditable="true"></span>';

    /**
     * @type {FrameIndexService}
     * @private
     */
    this._frameIndexService = frameIndexService;
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

    const getFrameNumberSibling = (frameNumber, distance) => {
      const frameIndexLimits = this._frameIndexService.getFrameIndexLimits();
      const frameIndex = this._frameIndexService.getNearestFrameIndex(frameNumber);

      let siblingFrameIndex = frameIndex + distance;
      if (siblingFrameIndex < frameIndexLimits.lowerLimit) {
        siblingFrameIndex = frameIndexLimits.lowerLimit;
      } else if (siblingFrameIndex > frameIndexLimits.upperLimit) {
        siblingFrameIndex = frameIndexLimits.upperLimit;
      }

      return this._frameIndexService.getFrameNumber(siblingFrameIndex);
    };

    /**
     * Only allow numbers and navigational keys
     */
    function onKeyDown(event) {
      switch (true) {
        // Numbers
        case (event.keyCode >= 48 && event.keyCode <= 57):
        // Keypad Numbers (why are these different?)
        case (event.keyCode >= 96 && event.keyCode <= 105):
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
          window.getSelection().removeAllRanges();
          event.preventDefault();
          break;
        // arrow up
        case (event.keyCode === 38):
          editable.html(
            getFrameNumberSibling(
              Number.parseInt(getEditableValue(), 10),
              1
            )
          );
          event.preventDefault();
          break;
        // arrow down
        case (event.keyCode === 40):
          editable.html(
            getFrameNumberSibling(
              Number.parseInt(getEditableValue(), 10),
              -1
            )
          );
          event.preventDefault();
          break;

        default:
          event.preventDefault();
      }
    }

    const onBlur = () => {
      const frameNumber = Number.parseInt(getEditableValue(), 10);
      const frameIndex = this._frameIndexService.getNearestFrameIndex(frameNumber);
      ngModel.$setViewValue(frameIndex);
      ngModel.$render();
    };

    // Specify how UI should be updated
    ngModel.$render = () => {
      if (ngModel.$viewValue === null || ngModel.$viewValue === undefined) {
        editable.html('');
        return;
      }

      const frameIndex = ngModel.$viewValue;
      const frameNumber = this._frameIndexService.getFrameNumber(frameIndex);

      editable.html(frameNumber);
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

FrameNumberInputDirective.$inject = [
  'frameIndexService',
];

export default FrameNumberInputDirective;
