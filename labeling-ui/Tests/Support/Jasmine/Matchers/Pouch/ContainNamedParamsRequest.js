import {matchDocuments} from './MatchDocuments';

function checkLabeledThingAndLabeledThingInFrame(namedParamsRequestData, allPouchDocuments, overallResult) {
  if (namedParamsRequestData.labeledThing && namedParamsRequestData.labeledThingInFrame) {
    namedParamsRequestData = namedParamsRequestData.labeledThingInFrame;
  }
  const collection = allPouchDocuments.rows
    .map(row => row.doc)
    .filter(doc => !(doc._id.indexOf('_design/') === 0));

  const {message, pass} = matchDocuments(namedParamsRequestData, collection);
  overallResult.message = message;

  return pass;
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

function checkDocuments(allPouchDocuments, namedParamsMock, overallResult) {
  const requestMethod = namedParamsMock.request.method.toUpperCase();
  let namedParamsRequestData;

  if (requestMethod === 'DELETE') {
    const id = getIdFromUrl(namedParamsMock.request.path);
    namedParamsRequestData = {
      id: id,
    };
    return isDocumentDeleted(namedParamsRequestData, allPouchDocuments, overallResult);
  }
  namedParamsRequestData = namedParamsMock.request.data;

  return checkLabeledThingAndLabeledThingInFrame(namedParamsRequestData, allPouchDocuments, overallResult);
}

module.exports = function toContainNamedParamsRequest() {
  return {
    compare: function (mockedRequests, namedParamsMock) {

      const overallResult = {
        message: 'Expected document not found in Pouch DB',
      };

      // Message might be changed during checking
      overallResult.pass = checkDocuments(mockedRequests, namedParamsMock, overallResult);

      return overallResult;
    },
  };
};
