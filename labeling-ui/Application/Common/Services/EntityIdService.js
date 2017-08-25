import uuid from 'uuid';

/**
 * Service providing unique ids to be used for newly created entities
 */
class EntityIdService {
  /**
   * @returns {string}
   */
  getUniqueId() {
    return uuid.v4().replace(/-/g, '');
  }
}

export default EntityIdService;
