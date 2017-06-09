/**
 * Abstract base class for PouchDBLiveMigrations
 *
 * Created migrations need to be registered with the {@link PouchDbLiveMigration} service.
 *
 * @abstract
 */
class PouchDbMigration {
  /**
   * Indicate whether this migration should be applied to the given document
   * No transformation of the document may be applied in this method!
   *
   * @param {Object} doc
   * @return {boolean}
   */
  supportsDocument(doc) {
    throw new Error('Abstract method');
  }

  /**
   * Migrate the given document by manipulating it in place.
   *
   * The in-place modification is done for performance reasons
   *
   * Only objects passing the {@link PouchDbMigration#supportsDocument} test will be given to this method.
   *
   * @param {Object} doc
   */
  migrateDocument(doc) {
    throw new Error('Abstract method');
  }
}

export default PouchDbMigration;