import angular from 'angular';

/**
 * Directive allowing to place arbitrary tooltips using the `tooltip` attribute
 */
class TooltipDirective {
  /**
   * @param {$rootScope} $rootScope
   * @param {jQuery} $document
   * @param {angular.$compile} $compile
   * @param {angular.$timeout} $timeout
   */
  constructor($rootScope, $document, $compile, $timeout) {
    this.restrict = 'A';
    this.scope = false;

    /**
     * @type {angular.$timeout}
     * @private
     */
    this._$timeout = $timeout;

    this._tooltipElement = angular.element(
      '<div class="tooltip"><span class="tooltip-message"></span><div class="tooltip-arrow"></div></div>'
    );

    this._arrowElement = this._tooltipElement.find('.tooltip-arrow');
    this._messageElement = this._tooltipElement.find('.tooltip-message');

    // Keep active as long as the mouse is inside the tooltip
    this._tooltipElement.on('mouseover', () => this._tooltipElement.addClass('active'));
    this._tooltipElement.on('mouseout', () => this._tooltipElement.removeClass('active'));

    this._body = $document.find('body');
    this._body.append(this._tooltipElement);
  }

  /**
   * @param scope
   * @param element
   * @param attrs
   */
  link(scope, element, attrs) {
    let hoverTimeout = null;
    const displayDelay = attrs.tooltipDelay === undefined ? 800 : +attrs.tooltipDelay;

    element.on('mouseover', () => {
      this._tooltipElement.removeClass('active');
      if (hoverTimeout !== null) {
        return;
      }

      hoverTimeout = this._$timeout(
        () => this._showTooltip(element, attrs),
        displayDelay
      );
    });

    element.on('mouseout $destroy', () => {
      this._tooltipElement.removeClass('active');

      if (hoverTimeout !== null) {
        this._$timeout.cancel(hoverTimeout);
        hoverTimeout = null;
      }
    });
  }

  /**
   * @param {jQuery} $targetElement
   * @param {Object} attrs
   * @private
   */
  _showTooltip($targetElement, attrs) {
    this._tooltipElement.removeClass('active up down left right');
    this._tooltipElement.css({top: 0, left: 0});
    this._messageElement.text(attrs.tooltip);

    if (attrs.tooltipPosition) {
      this._tooltipElement.addClass(attrs.tooltipPosition);
    } else {
      this._tooltipElement.addClass('down');
    }

    const tooltipPositioningOffset = attrs.tooltipSpacing === undefined ? 4 : +attrs.tooltipSpacing;

    const targetOffset = $targetElement.offset();
    const targetWidth = $targetElement.outerWidth();
    const targetHeight = $targetElement.outerHeight();

    const tooltipWidth = this._tooltipElement.outerWidth();
    const tooltipHeight = this._tooltipElement.outerHeight();

    const bodyWidth = this._body.innerWidth();
    const bodyHeight = this._body.innerHeight();

    const tooltipOffset = {};

    if (attrs.tooltipPosition && attrs.tooltipPosition === 'right') {
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
      this._arrowElement.css('top', `calc(50% - 1 + ${arrowMovement}px)`);

      tooltipOffset.left = targetOffset.left + targetWidth + tooltipPositioningOffset;
    } else if (attrs.tooltipPosition && attrs.tooltipPosition === 'left') {
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
      this._arrowElement.css('top', `calc(50% - 1 + ${arrowMovement}px)`);

      tooltipOffset.left = targetOffset.left - tooltipWidth - tooltipPositioningOffset;
    } else if (attrs.tooltipPosition && attrs.tooltipPosition === 'up') {
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
      this._arrowElement.css('left', `calc(50% + ${arrowMovement}px)`);
    } else if (!attrs.tooltipPosition || attrs.tooltipPosition === 'down') {
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
      this._arrowElement.css('left', `calc(50% + ${arrowMovement}px)`);
    }

    this._tooltipElement.css(tooltipOffset);
    this._tooltipElement.addClass('active');
  }
}

TooltipDirective.$inject = [
  '$rootScope',
  '$document',
  '$compile',
  '$timeout',
];

export default TooltipDirective;
