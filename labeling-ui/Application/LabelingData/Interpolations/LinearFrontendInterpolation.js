import FrontendInterpolation from './FrontendInterpolation';

/**
 * Simple LinearInterpolation executed on the Frontend.
 *
 * @extends FrontendInterpolation
 */
class LinearFrontendInterpolation extends FrontendInterpolation {
  
  /**
   * public
   */
  getName() {
    return 'linear';
  }
}

export default LinearFrontendInterpolation;