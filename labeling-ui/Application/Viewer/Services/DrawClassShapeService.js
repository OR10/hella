class DrawClassShapeService {
  constructor() {
    this.drawClasses = false;
  }

  toggleDrawingClasses() {
    switch (this.drawClasses) {
      case false:
        this.drawClasses = 'color';
        break;
      case 'color':
        this.drawClasses = 'background';
        break;
      case 'background':
        this.drawClasses = false;
        break;
      default:
        this.drawClasses = false;
    }
  }
}

DrawClassShapeService.$inject = [];

export default DrawClassShapeService;
