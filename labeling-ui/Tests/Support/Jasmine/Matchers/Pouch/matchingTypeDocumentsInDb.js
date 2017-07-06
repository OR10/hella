import PouchDbWrapper from '../../../PouchDb/PouchDbWrapper';

function matchingTypeDocumentsInDb(documentType) {
  const result = {};

  result.pass = Promise.resolve()
    .then(() => PouchDbWrapper.allDocs())
    .then(databaseResult => {
      const filteredDatabaseDocuments = databaseResult.rows
        .map(row => row.doc)
        .filter(doc => !(doc._id.indexOf('_design/') === 0));

      const documentsOfType = filteredDatabaseDocuments.filter(document => document.type === documentType);

      if (documentsOfType.length > 0) {
        return true;
      }

      result.message = `No document with type "${documentType}" found in pouchDb`;
      return false;
    });

  return result;
}

module.exports = function toExistInPouchDb() {
  return {
    compare: matchingTypeDocumentsInDb,
  };
};
