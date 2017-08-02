class PiePercentageController {
  /**
   * @param {jQuery} $element
   * @param {$rootScope.$scope} $scope
   */
  constructor($element, $scope) {
    /**
     * @type {Canvas}
     */
    this._canvas = $element.find('canvas')[0];

    /**
     * @type {Context2d}
     * @private
     */
    this._context = this._canvas.getContext('2d');

    $scope.$watch('vm.value', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        this._draw();
      }
    });
  }

  _draw() {
    const {width, height} = this._canvas;
    const radius = Math.min(width, height) / 2;
    const centerX = width / 2;
    const centerY = height / 2;

    const arcStart = 1.5 * Math.PI; // 12 o'clock
    const arcEnd = this.value < 25
      ? 1.5 * Math.PI + (0.5 * Math.PI * this.value / 25)
      : 1.5 * Math.PI * (this.value - 25) / 75;

    const ctx = this._context;

    ctx.clearRect(0, 0, width, height);
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX, centerY - radius);
    ctx.arc(centerX, centerY, radius, arcStart, arcEnd, false);
    ctx.lineTo(centerX, centerY);

    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

PiePercentageController.$inject = [
  '$element',
  '$scope',
];

export default PiePercentageController;
