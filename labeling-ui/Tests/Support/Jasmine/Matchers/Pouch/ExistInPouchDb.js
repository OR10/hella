import PouchDbWrapper from '../../../PouchDb/PouchDbWrapper';
import JsonTemplateComparator from '../../../JsonTemplateComparator';
import levenshtein from 'fast-levenshtein';

function existInPouchDb(expectedDocument) {
  const result = {};
  let bestCandidate = null;
  let distance = Infinity;
  let message;
  const comparator = new JsonTemplateComparator();

  result.pass = Promise.resolve()
    .then(() => PouchDbWrapper.allDocs())
    .then(databaseResult => {
      for (let index = 0; index < databaseResult.rows.length; index++) {
        const doc = databaseResult.rows[index].doc;
        try {
          comparator.assertIsEqual(expectedDocument, doc);
        } catch (error) {
          const levenshteinDistance = levenshtein.get(JSON.stringify(doc), JSON.stringify(expectedDocument));
          if (levenshteinDistance < distance) {
            distance = levenshteinDistance;
            bestCandidate = doc;
            message = error;
          }
          continue;
        }

        return true;
      }
      const filteredDatabaseDocuments = databaseResult.rows
        .map(row => row.doc)
        .filter(doc => !(doc._id.indexOf('_design/') === 0));

      result.message = `Could not find document in the database

Expected document:
${JSON.stringify(expectedDocument, undefined, 2)}

Closest candidate found:
${message}
${JSON.stringify(bestCandidate, undefined, 2)}

Documents in database:
${JSON.stringify(filteredDatabaseDocuments, undefined, 2)}
`;

      return false;
    })
    .catch(error => {
      result.message = error;

      return false;
    });

  return result;
}

module.exports = function toExistInPouchDb() {
  return {
    compare: existInPouchDb,
  };
};
