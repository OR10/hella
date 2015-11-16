import uuid from 'uuid';

/**
 * Service providing unique ids to be used for newly created entities
 */
class EntityIdService {
  getUniqueId() {
    return uuid.v4();
  }
}

export default EntityIdService;
