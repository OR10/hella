import UrlBuilder from '../UrlBuilder';
import featureFlags from '../../../Application/features.json';
import httpMock from 'protractor-http-mock';

export function getMockRequestsMade(mock) {
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
      `The following requests were made against the backend. Not all of them may have been mocked!\n${JSON.stringify(strippedRequests, undefined, 2)}`
    );

    // fail('Dumping all requests causes automatic test fail.');
    return Promise.reject(new Error('Dumping all requests causes automatic test fail.'));
  });
}

function waitForApplicationReady() {
  return browser.executeAsyncScript((next) => {
    window.__TEST_READY_PROMISE.then(() => next());
  });
}

function storeDocumentsInPouch(mocks) {
  const configuration = require('../../../Application/Common/config.json');
  let documents = [];

  mocks.forEach(mock => {
    let things = mock.response.data.result;
    let labeledThing;
    let taskId;

    if (things.labeledThings) {
      const labeledThingKeys = Object.keys(things.labeledThings);
      labeledThingKeys.forEach(labeledThingKey => {
        labeledThing = things.labeledThings[labeledThingKey];
        taskId = labeledThing.taskId;

        labeledThing._id = labeledThing.id;
        labeledThing.type = 'AppBundle.Model.LabeledThing';
        labeledThing.lineColor = parseInt(labeledThing.lineColor);
        labeledThing.frameRange = {
          "startFrameIndex": labeledThing.frameRange.startFrameNumber,
          "endFrameIndex": labeledThing.frameRange.endFrameNumber,
          "type": "AppBundle.Model.FrameIndexRange"
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
        ltif.labeledThingId = ltif.labeledThingId;
        ltif.identifierName = 'legacy';
        ltif.type = 'AppBundle.Model.LabeledThingInFrame';

        delete ltif.id;
        delete ltif.rev;
        delete ltif.ghost;
      });
      documents = documents.concat(things.labeledThingsInFrame);
    }
  });

  return browser.executeAsyncScript((configuration, documents, callback) => {
    const db = new PouchDB(`TASKID-TASKID-${configuration.storage.local.databaseName}`);

    return db.bulkDocs(documents).then((result) => {
      callback(result);
    });
  }, configuration, documents);
};

const defaultTestConfig = {
  viewerWidth: 1024,
  viewerHeight: 620,
};

let mocks = {
  shared: [],
  specific: []
};

export function mock(sharedMocks, specificMocks = []) {
  mocks.shared = sharedMocks;
  mocks.specific = specificMocks;
}

mock.teardown = () => {
  httpMock.teardown();
};

export function initApplication(url, testConfig = defaultTestConfig) {
  httpMock(mocks.shared.concat(mocks.specific));

  const builder = new UrlBuilder(testConfig);
  (function() {
    browser.get(builder.url(url));
  })();
  browser.wait(() => {
    return browser.executeScript('return !!window.angular');
  }, 10000);

  // For some strange reason simply returning Promise.resolve() in storeMocksInPouch if Pouch is not active
  // does not work.
  if (featureFlags.pouchdb) {
    return storeDocumentsInPouch(mocks.specific)
      .then(() => waitForApplicationReady());
  } else {
    return waitForApplicationReady();
  }
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
      classString => classString.split(' ').includes(className)
    );
}
