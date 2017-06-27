import PouchDbWrapper from '../../../PouchDb/PouchDbWrapper';
import JsonTemplateComparator from '../../../JsonTemplateComparator';

function existInPouchDb(expectedDocument) {
  const result = {};
  const comparator = new JsonTemplateComparator();

  result.pass = Promise.resolve()
    .then(() => PouchDbWrapper.allDocs())
    .then(databaseResult => {
      const filteredDatabaseDocuments = databaseResult.rows
        .map(row => row.doc)
        .filter(doc => !(doc._id.indexOf('_design/') === 0));

      comparator.assertDocumentIsInCollection(expectedDocument, filteredDatabaseDocuments);

      return true;
    })
    .catch(error => {
      result.message = error.message;

      return false;
    });

  return result;
}

module.exports = function toExistInPouchDb() {
  return {
    compare: existInPouchDb,
  };
};
