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

    this._draw();

    $scope.$watch('vm.value', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        this._draw();
      }
    });
  }

  _draw() {
    const {width, height} = this._canvas;
    const radius = Math.floor(Math.min(width, height) / 2);
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);

    const arcStart = 0; // x-axis
    const arcEnd = 2 * Math.PI * (this.value / 100);

    const ctx = this._context;


    ctx.clearRect(0, 0, width, height);
    ctx.translate(centerX, centerY);
    ctx.rotate(-0.5 * Math.PI);
    ctx.translate(-1 * centerX, -1 * centerY);
    ctx.moveTo(centerX, centerY);
    ctx.beginPath();
    ctx.lineTo(width, centerY);
    ctx.arc(centerX, centerY, radius, arcStart, arcEnd, false);
    ctx.lineTo(centerX, centerY);

    ctx.fillStyle = this.color;
    ctx.fill();

    ctx.setTransform(
      1, 0,
      0, 1,
      0, 0
    );
  }
}

PiePercentageController.$inject = [
  '$element',
  '$scope',
];

export default PiePercentageController;
