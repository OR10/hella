/**
 * Directive allowing to place arbitrary tooltips using the `tooltip` attribute
 */
class TooltipDirective {
  constructor($document, $compile) {
    this.restrict = 'A';
    this.scope = true;

    this._$document = $document;
    this._$compile = $compile;
  }

  /**
   * @param scope
   * @param element
   * @param attrs
   */
  link(scope, element, attrs) {
    const tooltipTemplate = this._$compile(
      '<div ng-class="tooltipClasses">{{message}}<div class="tooltip-arrow"></div></div>'
    );
    const tooltipElement = tooltipTemplate(scope);

    scope.tooltipClasses = ['tooltip'];
    scope.message = attrs.tooltip;

    if (attrs.tooltipPosition) {
      scope.tooltipClasses.push(attrs.tooltipPosition);
    } else {
      scope.tooltipClasses.push('down');
    }

    this._$document.find('body').append(tooltipElement);

    this._attachEventHandler(element, tooltipElement);
  }

  /**
   * @param targetElement
   * @param tooltipElement
   * @private
   */
  _attachEventHandler(targetElement, tooltipElement) {
    targetElement.on('mouseover', event => {
      this._onTargetMouseEnter(event.currentTarget, tooltipElement);
    });

    targetElement.on('mouseout', () => {
      tooltipElement.removeClass('active');
    });

    tooltipElement.on('mouseover', () => {
      tooltipElement.addClass('active');
    });

    tooltipElement.on('mouseout', () => {
      tooltipElement.removeClass('active');
    });
  }

  /**
   * @param targetElement
   * @param tooltipElement
   * @private
   */
  _onTargetMouseEnter(targetElement, tooltipElement) {
    const tooltipPositioningOffset = 10;

    const targetPosition = targetElement.getBoundingClientRect();

    const targetWidth = targetPosition.width || targetPosition.right - targetPosition.left;
    const targetHeight = targetPosition.height || targetPosition.bottom - targetPosition.top;

    const tooltipOffset = tooltipElement.offset();
    const tooltipHeight = tooltipElement.outerHeight();
    const tooltipWidth = tooltipElement.outerWidth();

    tooltipElement.addClass('active');

    switch (true) {
      case tooltipElement.hasClass('right'):
        tooltipOffset.top = targetPosition.top - (tooltipHeight / 2) + (targetHeight / 2);
        tooltipOffset.left = targetPosition.right + tooltipPositioningOffset;
        break;
      case tooltipElement.hasClass('left'):
        tooltipOffset.top = targetPosition.top - (tooltipHeight / 2) + (targetHeight / 2);
        tooltipOffset.left = targetPosition.left - tooltipWidth - tooltipPositioningOffset;
        break;
      case tooltipElement.hasClass('down'):
        tooltipOffset.top = targetPosition.top + targetHeight + tooltipPositioningOffset;
        tooltipOffset.left = targetPosition.left - (tooltipWidth / 2) + (targetWidth / 2);
        break;
      case tooltipElement.hasClass('up'):
        tooltipOffset.top = targetPosition.top - tooltipHeight - tooltipPositioningOffset;
        tooltipOffset.left = targetPosition.left - (tooltipWidth / 2) + (targetWidth / 2);
        break;
    }

    tooltipElement.offset(tooltipOffset);
  }
}

TooltipDirective.$inject = [
  '$document',
  '$compile',
];

export default TooltipDirective;
