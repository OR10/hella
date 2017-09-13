import UrlBuilder from '../UrlBuilder';
import PouchDb from '../PouchDb/PouchDbWrapper';
import httpMock from 'protractor-http-mock';
import {cloneDeep} from 'lodash';
import ExtendedBrowser from './ExtendedBrowser';
import moment from 'moment';
import {saveMock} from '../PouchMockTransformation';

export function getMockRequestsMade(mock) {
  return Promise.resolve()
    .then(() => browser.sleep(500))
    .then(() => PouchDb.allDocs());
}

export function dumpAllRequestsMade(mock) {
  const failTest = Promise.reject(new Error('Dumping all requests causes automatic test fail.'));

  return PouchDb.allDocs().then(docs => {
    let strippedRequests = docs.rows.map(row => row.doc);
    strippedRequests = strippedRequests.filter(doc => doc._id.indexOf('_design') === -1);

    console.log( // eslint-disable-line no-console
      `The following documents are in the Pouch. Design documents have been filtered out.\n${JSON.stringify(
        strippedRequests,
        undefined,
        2
      )}`,
    );

    return failTest;
  });
}

function waitForApplicationReady() {
  return browser.executeAsyncScript((next) => {
    window.__TEST_READY_PROMISE.then(() => next());
  });
}

function getCurrentDate() {
  return moment().format('YYYY-MM-DD HH:mm:ss.000000');
}

/**
 * When using, make sure AssetHelper.js, lines 68 and 69 are also active:
 *  structure[key].containingDirectory = pathName;
 *  structure[key].fileName = file;
 *
 * @param {Array} mocks
 */
export function mockTransform(mocks) {
  const transformedDocuments = [];

  mocks.forEach(mock => {
    const things = cloneDeep(mock.response.data.result);
    let labeledThing;
    let taskId;
    let projectId;

    let transformedDocument = {
      fileName: `${mock.containingDirectory}/${mock.fileName}`,
      documents: [],
    };

    if (things.labeledThings) {
      const labeledThingKeys = Object.keys(things.labeledThings);
      labeledThingKeys.forEach(labeledThingKey => {
        labeledThing = things.labeledThings[labeledThingKey];
        taskId = labeledThing.taskId;
        projectId = labeledThing.projectId;

        labeledThing._id = labeledThing.id;
        labeledThing.type = 'AppBundle.Model.LabeledThing';
        labeledThing.lineColor = parseInt(labeledThing.lineColor);
        labeledThing.frameRange = {
          'startFrameIndex': labeledThing.frameRange.startFrameNumber,
          'endFrameIndex': labeledThing.frameRange.endFrameNumber,
          'type': 'AppBundle.Model.FrameIndexRange',
        };

        delete labeledThing.rev;
        delete labeledThing.id;

        transformedDocument.documents.push(labeledThing);
      });
    }

    if (things.labeledThingsInFrame) {
      things.labeledThingsInFrame.forEach(ltif => {
        ltif._id = ltif.id;
        ltif.taskId = taskId;
        ltif.projectId = projectId;
        ltif.type = 'AppBundle.Model.LabeledThingInFrame';

        delete ltif.id;
        delete ltif.rev;
        delete ltif.ghost;
        delete ltif.ghostClasses;
      });
      transformedDocument.documents = transformedDocument.documents.concat(things.labeledThingsInFrame);
    }

    if (things.labeledThingGroups) {
      things.labeledThingGroups.forEach(ltg => {
        ltg._id = ltg.id;
        ltg.type = 'AnnoStationBundle.Model.LabeledThingGroup';

        delete ltg.id;
      });
      transformedDocument.documents = transformedDocument.documents.concat(things.labeledThingGroups);
    }


    transformedDocuments.push(transformedDocument);
  });

  transformedDocuments.forEach(document => {
    saveMock(document.fileName, document.documents);
  });
}

function getPouchDbCustomBootstrap(mocks) {
  let documents = [];

  mocks.forEach(mock => {
    mock.forEach(mockDocument => {
      if (mockDocument.createdAt === undefined) {
        mockDocument.createdAt = getCurrentDate();
      }
      if (mockDocument.lastModifiedAt === undefined) {
        mockDocument.lastModifiedAt = getCurrentDate();
      }
    });
    documents = documents.concat(mock);
  });

  return [
    function (documents, databaseName, next) {
      // In Browser context!
      const db = new PouchDB(databaseName);

      db.bulkDocs(documents).then(function (result) {
        next();
      });
    },
    documents,
    PouchDb.DATABASE_NAME
  ];
}

const defaultTestConfig = {
  viewerWidth: 1024,
  viewerHeight: 620,
};

const mocks = {
  http: [],
  pouch: [],
};

function isPouchMock(mockDocument) {
  return mockDocument instanceof Array;
}

/**
 * @param {Array} sharedMocks
 */
// export function mock(sharedMocks) {
//   let clonedMocks = [];
//   sharedMocks.forEach(mockDocument => {
//     clonedMocks.push(cloneDeep(mockDocument));
//   });
//
//   mocks.http = clonedMocks.filter(mockDocument => !isPouchMock(mockDocument));
//   mocks.pouch = clonedMocks.filter(mockDocument => isPouchMock(mockDocument));
// }

export function mock(httpMocks) {
  let clonedMocks = [];
  httpMocks.forEach(mockDocument => {
    clonedMocks.push(cloneDeep(mockDocument));
  });

  mocks.http = clonedMocks;
}

export function bootstrapPouch(pouchMocks) {
  let clonedMocks = [];
  pouchMocks.forEach(mockDocument => {
    clonedMocks.push(cloneDeep(mockDocument));
  });

  pouchMocks.pouch = clonedMocks;
}

mock.teardown = () => {
  httpMock.teardown();
};

export function initApplication(url, testConfig = defaultTestConfig) {
  httpMock(mocks.http);
  const builder = new UrlBuilder(testConfig);

  const customBootstrap = getPouchDbCustomBootstrap(mocks.pouch);
  const extendedBrowser = new ExtendedBrowser(browser);
  return extendedBrowser.getWithCustomBootstrap(builder.url(url), undefined, customBootstrap)
    .then(() => waitForApplicationReady());
}

export function expectAllModalsToBeClosed() {
  const modalElements = element(by.css('.modal-overlay.is-active'));
  expect(modalElements.isPresent()).toBe(false, 'No open modal Dialog expected.');
}

export function expectModalToBePresent() {
  const modalElements = element(by.css('.modal-overlay.is-active'));
  expect(modalElements.isPresent()).toBe(true, 'Open modal Dialog expected.');
}

/**
 * Retrieve the `textContent` of a certain ElementFinder.
 *
 * This content will be filled even if the element ist not visible. In contrast to protractors `getText`.
 *
 * @returns {webdriver.promise.Promise}
 */
export function getTextContentFromElementFinder(elementFinder) {
  return elementFinder.getAttribute('textContent')
    .then(textContent => textContent.trim());
}

/**
 * Check if certain {@link ElementFinder} has got certain class set.
 *
 * @returns {webdriver.promise.Promise}
 */
export function hasClassByElementFinder(elementFinder, className) {
  return elementFinder.getAttribute('class').then(
    classString => classString.split(' ').includes(className),
  );
}

export function sendKey(key) {
  return browser.actions().sendKeys(key).perform();
}

export function sendKeySequences(keySequences) {
  let promises = [];

  keySequences.forEach(keySequence => {
    if (typeof keySequence === 'string') {
      const keys = keySequence.split('');
      keys.forEach(key => {
        promises.push(sendKey(key));
      });
    } else {
      promises.push(sendKey(keySequence));
    }
  });

  return Promise.all(promises);
}