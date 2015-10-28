import DrawingContextService from '../Services/DrawingContextService';

/**
 * @class DrawingContextServiceProvider
 */
export default class DrawingContextServiceProvider {
  constructor() {
    let serviceInstance = null;

    this.$get = () => {
      if (serviceInstance === null) {
        serviceInstance = new DrawingContextService();
      }

      return serviceInstance;
    };
  }
}
