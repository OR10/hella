import UrlBuilder from '../UrlBuilder';
import featureFlags from '../../../Application/features.json';
import PouchDb from '../PouchDb/PouchDbWrapper';
import httpMock from 'protractor-http-mock';
import {cloneDeep} from 'lodash';
import ExtendedBrowser from './ExtendedBrowser';

export function getMockRequestsMade(mock) {
  if (featureFlags.pouchdb) {
    return browser.sleep(300).then(() => PouchDb.allDocs());
  }
  return httpMock.requestsMade().then(requests => {
    return requests.map(request => {
      const strippedRequest = {
        method: request.method,
        path: request.url,
      };

      if (request.data) {
        strippedRequest.data = request.data;
      }

      return strippedRequest;
    });
  });
}

export function dumpAllRequestsMade(mock) {
  const failTest = Promise.reject(new Error('Dumping all requests causes automatic test fail.'));

  if (featureFlags.pouchdb) {
    return PouchDb.allDocs().then(docs => {
      let strippedRequests = docs.rows.map(row => row.doc);
      strippedRequests = strippedRequests.filter(doc => doc._id.indexOf('_design') === -1);

      console.log( // eslint-disable-line no-console
        `The following documents are in the Pouch. Design documents have been filtered out.\n${JSON.stringify(strippedRequests, undefined, 2)}`,
      );

      return failTest;
    });
  }
  return httpMock.allRequestsMade().then(requests => {
    const strippedRequests = requests.map(request => {
      const strippedRequest = {
        method: request.method,
        path: request.url,
      };

      if (request.data) {
        strippedRequest.data = request.data;
      }

      return strippedRequest;
    });

    console.log( // eslint-disable-line no-console
      `The following requests were made against the backend. Not all of them may have been mocked!\n${JSON.stringify(strippedRequests, undefined, 2)}`,
    );

    // fail('Dumping all requests causes automatic test fail.');
    return failTest;
  });
}

function waitForApplicationReady() {
  return browser.executeAsyncScript((next) => {
    window.__TEST_READY_PROMISE.then(() => next());
  });
}

function getPouchDbCustomBootstrap(mocks) {
  const knownIdentifierNames = [
    'sign',
    'lsr-01',
    'thing-one',
    'thing-two',
    null,
  ];
  let documents = [];

  mocks.forEach(mock => {
    const things = cloneDeep(mock.response.data.result);
    let labeledThing;
    let taskId;
    let projectId;

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

        documents.push(labeledThing);
      });
    }

    if (things.labeledThingsInFrame) {
      things.labeledThingsInFrame.forEach(ltif => {
        ltif._id = ltif.id;
        ltif.taskId = taskId;
        ltif.projectId = projectId;
        if (knownIdentifierNames.indexOf(ltif.identifierName) === -1) {
          ltif.identifierName = 'legacy';
        }
        ltif.type = 'AppBundle.Model.LabeledThingInFrame';

        delete ltif.id;
        delete ltif.rev;
        delete ltif.ghost;
        delete ltif.ghostClasses;
      });
      documents = documents.concat(things.labeledThingsInFrame);
    }
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
  shared: [],
  specific: [],
};

export function mock(sharedMocks) {
  const specificMocksKeys = [];

  mocks.shared = sharedMocks;
  mocks.specific = mocks.shared.filter((mock, key) => {
    const hasLabeledThings = (mock.response && mock.response.data && mock.response.data.result && mock.response.data.result.labeledThings);
    const hasLabeledThingsInFrame = (mock.response && mock.response.data && mock.response.data.result && mock.response.data.result.labeledThingsInFrame);
    const isGetRequest = mock.request.method.toUpperCase() === 'GET';
    const mustBeStoredInCouch = ((hasLabeledThings || hasLabeledThingsInFrame) && isGetRequest);
    if (mustBeStoredInCouch) {
      specificMocksKeys.push(key);
    }

    return mustBeStoredInCouch;
  });
}

mock.teardown = () => {
  httpMock.teardown();
};

export function initApplication(url, testConfig = defaultTestConfig) {
  httpMock(mocks.shared.concat(mocks.specific));
  const builder = new UrlBuilder(testConfig);

  if (featureFlags.pouchdb) {
    const customBootstrap = getPouchDbCustomBootstrap(mocks.specific);
    const extendedBrowser = new ExtendedBrowser(browser);
    return extendedBrowser.getWithCustomBootstrap(builder.url(url), undefined, customBootstrap)
      .then(() => waitForApplicationReady());
  }

  return browser.get(builder.url(url))
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
