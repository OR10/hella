import {matchDocuments, lastMatchChecked} from './MatchDocuments';
import PouchDb from '../../../PouchDb/PouchDbWrapper';

function checkLabeledThingAndLabeledThingInFrame(namedParamsRequestData, allPouchDocuments, overallResult) {
  if (namedParamsRequestData.labeledThing && namedParamsRequestData.labeledThingInFrame) {
    namedParamsRequestData = namedParamsRequestData.labeledThingInFrame;
  }
  const matchingDocuments = allPouchDocuments.rows.filter(row => matchDocuments(namedParamsRequestData, row.doc));
  const result = matchingDocuments.length > 0;
  const lastMatchMade = lastMatchChecked();
  overallResult.message = `0 matching documents found. Last Check made: Expected key "${lastMatchMade.key} to be "${lastMatchMade.expected}". Got "${lastMatchMade.actual}"`;

  return result;
}

function isDocumentDeleted(namedParamsRequestData, allPouchDocuments, overallResult) {
  const isDeleted = !checkLabeledThingAndLabeledThingInFrame(namedParamsRequestData, allPouchDocuments, overallResult);
  if (!isDeleted) {
    overallResult.message = `Expected document with id ${namedParamsRequestData.id} to be deleted.`;
  }
  return isDeleted;
}

function getIdFromUrl(url) {
  const pattern = new RegExp(/.*\/(.*)$/);
  const matches = pattern.exec(url);
  return matches[1];
}

module.exports = function toContainNamedParamsRequest() {
  return {
    compare: function (mockedRequests, namedParamsMock) {

      let overallResult = {
        message: 'Expected document not found in Pouch DB',
      };

      overallResult.pass = PouchDb.allDocs().then((allPouchDocuments) => {
        let namedParamsRequestData;
        const requestMethod = namedParamsMock.request.method.toUpperCase();

        if (requestMethod === 'DELETE') {
          const id = getIdFromUrl(namedParamsMock.request.path);
          namedParamsRequestData = {
            id: id,
          };
          return isDocumentDeleted(namedParamsRequestData, allPouchDocuments, overallResult);
        } else {
          namedParamsRequestData = namedParamsMock.request.data;
          return checkLabeledThingAndLabeledThingInFrame(namedParamsRequestData, allPouchDocuments, overallResult);
        }
      });

      return overallResult;
    },
  };
};
