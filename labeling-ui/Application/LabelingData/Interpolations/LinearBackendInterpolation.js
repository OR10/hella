import BackendInterpolation from './BackendInterpolation';

/**
 * Simple LinearInterpolation executed on the Backend.
 *
 * @extends BackendInterpolation
 */
class LinearBackendInterpolation extends BackendInterpolation {

  /**
   * @inheritDoc
   */
  _getRemoteType() {
    return 'linear';
  }
}

export default LinearBackendInterpolation;