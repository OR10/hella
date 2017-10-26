class InboxShapeNameInputDirective {
  /**
   * @param {ShapeInboxService} shapeInboxService
   */
  constructor(shapeInboxService) {
    /**
     * @type {ShapeInboxService}
     * @private
     */
    this._shapeInboxService = shapeInboxService;

    this.restrict = 'E';
    this.template = '<span contenteditable="true"></span>';
    this.scope = {
      inboxObject: '=',
    };
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

      // Remove anything, but valid chars
      return value
        .replace(/<br( ?\/)?>/g, '') // Remove <br>s
        .replace(/[^a-zA-Z0-9_#!"§$%&/()=? -]/g, '');
    }

    function onKeyDown(event) {
      switch (true) {
        case (event.keyCode === 13):
          // Blur for update
          editable.blur();
          window.getSelection().removeAllRanges();
          event.preventDefault();
          break;
        case (event.keyCode === 27): // Escape
          editable.html('');
          editable.blur();
          window.getSelection().removeAllRanges();
          event.preventDefault();
          break;
        default:
          return;
      }
    }

    // Specify how UI should be updated
    const render = () => {
      editable.html(
        this._shapeInboxService.getLabelForInboxObject(scope.inboxObject)
      );
    };

    const onBlur = () => {
      const {shape} = scope.inboxObject;
      const newName = getEditableValue();
      if (newName !== '') {
        this._shapeInboxService.renameShape(shape, newName);
      }
      render();
    };

    const onFocus = () => {
      const fullRange = document.createRange();
      fullRange.selectNodeContents(editable.get(0));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(fullRange);
    };


    // Listen for change events to enable binding
    editable.on('keydown', onKeyDown);
    editable.on('focus', () => {
      scope.$evalAsync(onFocus);
    });
    editable.on('blur', () => {
      scope.$evalAsync(onBlur);
    });

    // Initial rendering
    render();
  }
}

InboxShapeNameInputDirective.$inject = [
  'shapeInboxService',
];

export default InboxShapeNameInputDirective;
