import PaperScopeService from '../Services/PaperScopeService';

/**
 * @class PaperScopeServiceProvider
 */
export default class PaperScopeServiceProvider {
  constructor() {
    let serviceInstance = null;

    this.$get = () => {
      if (serviceInstance === null) {
        serviceInstance = new PaperScopeService();
      }

      return serviceInstance;
    };
  }
}
