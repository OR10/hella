import PouchDbMigration from './PouchDbMigration';

class FoobarMigration extends PouchDbMigration {
  supportsDocument(doc) {
    return (
      doc.type && doc.type === 'AppBundle.Model.LabeledThingInFrame' &&
      doc._id && doc._id === '66409cd8-d2a0-41f9-9872-b43c36a864a2'
    );
  }

  migrateDocument(doc) {
    doc.shapes[0].bottomRight = {
      x: 600,
      y: 500
    };
  }
}

export default FoobarMigration;