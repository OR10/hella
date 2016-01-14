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

    const $tooltipElement = tooltipTemplate(scope);
    const $arrowElement = $tooltipElement.find('.tooltip-arrow');
    $tooltipElement.css({top: 0, left: 0});

    scope.tooltipClasses = ['tooltip'];
    scope.arrowStyle = {};
    scope.message = attrs.tooltip;

    if (attrs.tooltipPosition) {
      scope.tooltipClasses.push(attrs.tooltipPosition);
    } else {
      scope.tooltipClasses.push('down');
    }

    const $body = this._$document.find('body');
    $body.append($tooltipElement);

    this._attachEventHandler($body, element, $tooltipElement, $arrowElement);
  }

  /**
   * @param {jQuery} $body
   * @param {jQuery} $targetElement
   * @param {jQuery} $tooltipElement
   * @param {jQuery} $arrowElement
   * @private
   */
  _attachEventHandler($body, $targetElement, $tooltipElement, $arrowElement) {
    $targetElement.on('mouseover', () => this._showTooltip($body, $targetElement, $tooltipElement, $arrowElement));

    // Keep active as long as the mouse is inside the tooltip
    $tooltipElement.on('mouseover', () => $tooltipElement.addClass('active'));

    $targetElement.on('mouseout', () => this._hideTooltip($tooltipElement));
    $tooltipElement.on('mouseout', () => this._hideTooltip($tooltipElement));
  }

  /**
   * @param {jQuery} $body
   * @param {jQuery} $targetElement
   * @param {jQuery} $tooltipElement
   * @param {jQuery} $arrowElement
   * @private
   */
  _showTooltip($body, $targetElement, $tooltipElement, $arrowElement) {
    $tooltipElement.css({top: 0, left: 0});

    const tooltipPositioningOffset = 4;

    const targetOffset = $targetElement.offset();
    const targetWidth = $targetElement.outerWidth();
    const targetHeight = $targetElement.outerHeight();

    const tooltipWidth = $tooltipElement.outerWidth();
    const tooltipHeight = $tooltipElement.outerHeight();

    const bodyWidth = $body.innerWidth();
    const bodyHeight = $body.innerHeight();

    let tooltipOffset = {};
    if ($tooltipElement.hasClass('right')) {
      let arrowMovement = 0;
      const realPosition = targetOffset.top - (tooltipHeight / 2) + (targetHeight / 2);
      const maxPosition = bodyHeight - tooltipHeight - tooltipPositioningOffset;
      const minPosition = tooltipPositioningOffset;
      tooltipOffset.top = Math.max(minPosition, Math.min(realPosition, maxPosition));
      if (tooltipOffset.top === realPosition) {
        arrowMovement = 0;
      } else if (tooltipOffset.top > realPosition) {
        arrowMovement = realPosition - minPosition;
      } else if (tooltipOffset.top < realPosition) {
        arrowMovement = realPosition - maxPosition;
      }
      $arrowElement.css('top', `calc(50% + ${arrowMovement}px)`);

      tooltipOffset.left = targetOffset.left + targetWidth + tooltipPositioningOffset;
    } else if ($tooltipElement.hasClass('left')) {
      let arrowMovement = 0;
      const realPosition = targetOffset.top - (tooltipHeight / 2) + (targetHeight / 2);
      const maxPosition = bodyHeight - tooltipHeight - tooltipPositioningOffset;
      const minPosition = tooltipPositioningOffset;
      tooltipOffset.top = Math.max(minPosition, Math.min(realPosition, maxPosition));
      if (tooltipOffset.top === realPosition) {
        arrowMovement = 0;
      } else if (tooltipOffset.top > realPosition) {
        arrowMovement = realPosition - minPosition;
      } else if (tooltipOffset.top < realPosition) {
        arrowMovement = realPosition - maxPosition;
      }
      $arrowElement.css('top', `calc(50% + ${arrowMovement}px)`);

      tooltipOffset.left = targetOffset.left - tooltipWidth - tooltipPositioningOffset;
    } else if ($tooltipElement.hasClass('down')) {
      let arrowMovement = 0;

      tooltipOffset.top = targetOffset.top + targetHeight + tooltipPositioningOffset;

      const realPosition = targetOffset.left - (tooltipWidth / 2) + (targetWidth / 2);
      const maxPosition = bodyWidth - tooltipWidth - tooltipPositioningOffset;
      const minPosition = tooltipPositioningOffset;
      tooltipOffset.left = Math.max(minPosition, Math.min(realPosition, maxPosition));
      if (tooltipOffset.left === realPosition) {
        arrowMovement = 0;
      } else if (tooltipOffset.left > realPosition) {
        arrowMovement = realPosition - minPosition;
      } else if (tooltipOffset.left < realPosition) {
        arrowMovement = realPosition - maxPosition;
      }
      $arrowElement.css('left', `calc(50% + ${arrowMovement}px)`);
    } else if ($tooltipElement.hasClass('up')) {
      let arrowMovement = 0;

      tooltipOffset.top = targetOffset.top - tooltipHeight - tooltipPositioningOffset;

      const realPosition = targetOffset.left - (tooltipWidth / 2) + (targetWidth / 2);
      const maxPosition = bodyWidth - tooltipWidth - tooltipPositioningOffset;
      const minPosition = tooltipPositioningOffset;
      tooltipOffset.left = Math.max(minPosition, Math.min(realPosition, maxPosition));
      if (tooltipOffset.left === realPosition) {
        arrowMovement = 0;
      } else if (tooltipOffset.left > realPosition) {
        arrowMovement = realPosition - minPosition;
      } else if (tooltipOffset.left < realPosition) {
        arrowMovement = realPosition - maxPosition;
      }
      $arrowElement.css('left', `calc(50% + ${arrowMovement}px)`);
    }

    $tooltipElement.css(tooltipOffset);
    $tooltipElement.addClass('active');
  }

  _hideTooltip($tooltipElement) {
    $tooltipElement.removeClass('active');
  }
}

TooltipDirective.$inject = [
  '$document',
  '$compile',
];

export default TooltipDirective;
