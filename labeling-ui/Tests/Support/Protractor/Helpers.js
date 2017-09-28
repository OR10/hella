import UrlBuilder from '../UrlBuilder';
import PouchDb from '../PouchDb/PouchDbWrapper';
import httpMock from 'protractor-http-mock';
import {cloneDeep} from 'lodash';
import ExtendedBrowser from './ExtendedBrowser';
import moment from 'moment';

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

export function bootstrapHttp(httpMocks) {
  const clonedMocks = [];
  httpMocks.forEach(mockDocument => {
    clonedMocks.push(cloneDeep(mockDocument));
  });

  mocks.http = clonedMocks;
}

export function bootstrapPouch(pouchMocks) {
  const clonedMocks = [];
  pouchMocks.forEach(mockDocument => {
    clonedMocks.push(cloneDeep(mockDocument));
  });

  mocks.pouch = clonedMocks;
}

bootstrapHttp.teardown = () => {
  httpMock.teardown();
  mocks.http = [];
};

bootstrapPouch.teardown = () => {
  mocks.pouch = [];
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

function _sendKey(key) {
  return browser.actions().sendKeys(key).perform();
}

export function sendKeys(keysOrSequences) {
  let keys;
  if (!Array.isArray(keysOrSequences)) {
    if (typeof keysOrSequences === 'string' && keysOrSequences.length > 1) {
      keys = keysOrSequences.split('');
    } else {
      keys = [keysOrSequences];
    }
  } else {
    keys = keysOrSequences;
  }

  return keys.reduce(
    (carry, key) => {
      let nextCarry;
      if (typeof key === 'string' && key.length > 1) {
        nextCarry = carry.then(() => sendKeys(key));
      } else {
        nextCarry = carry.then(() => _sendKey(key));
      }
      return nextCarry;
    },
    Promise.resolve()
  );
}

export function shortSleep() {
  return browser.sleep(300);
}

export function mediumSleep() {
  return browser.sleep(800);
}

export function longSleep() {
  return browser.sleep(1800);
}

export function comaLikeSleep() {
  return browser.sleep(3000);
}

