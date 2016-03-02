import mock from 'protractor-http-mock';
import ViewerDataManager from '../Support/ViewerDataManager';
import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {getMockRequestsMade} from '../Support/Protractor/Helpers';

const taskDataMock = require('../ProtractorMocks/Task/Data.json');
const videoDataMock = require('../ProtractorMocks/Video.json');
const sourceFrameLocationsMock = require('../ProtractorMocks/Task/FrameLocations/Source.json');
const sourceJpgFrameLocationsMock = require('../ProtractorMocks/Task/FrameLocations/SourceJpg.json');
const sourceJpg2FrameLocationsMock = require('../ProtractorMocks/Task/FrameLocations/SourceJpg2.json');
const thumbnailFrameLocationsMock = require('../ProtractorMocks/Task/FrameLocations/Thumbnail.json');
const labelStructureMock = require('../ProtractorMocks/Task/Labelstructure.json');
const labeledThingIncompleteCountMock = require('../ProtractorMocks/Task/LabeledThingIncompleteCount.json');
const timerMock = require('../ProtractorMocks/Task/Timer.json');
const saveTimerMock = require('../ProtractorMocks/Task/SaveTimer.json');
const labeledThingsMock = require('../ProtractorMocks/Task/LabeledThingInFrame/TwoRectangles.json');
const labeledThingsPreloadingMock = require('../ProtractorMocks/Task/LabeledThingInFrame/TwoRectanglesPreloading.json');
const labeledFrameMock = require('../ProtractorMocks/Task/LabeledFrame.json');
const movedRectangleMock = require('../ProtractorMocks/Task/LabeledThingInFrame/MovedRectangle.json');
const resizedRectangleMock = require('../ProtractorMocks/Task/LabeledThingInFrame/ResizedRectangle.json');
const resizedAndMovedRectangleMock = require('../ProtractorMocks/Task/LabeledThingInFrame/ResizedAndMovedRectangle.json');

const loadRectanglesExpectation = require('../Fixtures/CanvasInstructionLogs/LoadRectangles.json');

const viewerDataManager = new ViewerDataManager(browser);
const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Rectangle drawing', () => {
  beforeEach(() => {
    mock([
      taskDataMock,
      videoDataMock,
      sourceFrameLocationsMock,
      sourceJpgFrameLocationsMock,
      sourceJpg2FrameLocationsMock,
      thumbnailFrameLocationsMock,
      labelStructureMock,
      labeledThingIncompleteCountMock,
      timerMock,
      saveTimerMock,
      labeledThingsMock,
      labeledThingsPreloadingMock,
      labeledFrameMock,
      movedRectangleMock,
      resizedRectangleMock,
      resizedAndMovedRectangleMock,
    ]);
  });

  it('should draw the background and initial shapes as provided by the backend', (done) => {
    browser.get('/labeling/task/0115bd97fa0c1d86f8d1f65ff4095ed8');

    canvasInstructionLogManager.getCanvasLogs().then((logs) => {
      expect(loadRectanglesExpectation).toEqual(logs);
      done();
    })
  });

  it('should correctly move a rectangle on canvas and save the changed coordinates', (done) => {
    browser.get('/labeling/task/0115bd97fa0c1d86f8d1f65ff4095ed8');

    const viewer = element(by.css('.layer-container'));

    browser.actions()
      .mouseMove(viewer, {x: 60, y: 60}) // initial position
      .mouseDown()
      .mouseMove(viewer, {x: 70, y: 70}) // drag
      .mouseUp()
      .mouseMove(viewer, {x: 0, y: 0}) // click somewhere outside to deselect element
      .click()
      .perform();

    viewerDataManager.exportData()
      .then((data) => {
        const expectedData = viewerDataManager.readViewerData('Tests/Fixtures/ViewerData/RectangleDrawing/movedRectangle.json.gz');

        expect(data).toEqualViewerData(expectedData);

        expect(getMockRequestsMade(mock)).toHaveSameItems([
          {
            url: '/api/task/0115bd97fa0c1d86f8d1f65ff4095ed8',
            method: 'GET',
          },
          {
            url: '/api/task/0115bd97fa0c1d86f8d1f65ff4095ed8/frameLocations/source?limit=2&offset=0',
            method: 'GET',
          },
          {
            url: '/api/task/0115bd97fa0c1d86f8d1f65ff4095ed8/labeledThingInFrame/1',
            method: 'GET',
          },
          {
            method: 'GET',
            url: '/api/task/0115bd97fa0c1d86f8d1f65ff4095ed8/frameLocations/thumbnail?limit=2&offset=1',
          },
          {
            url: '/api/task/0115bd97fa0c1d86f8d1f65ff4095ed8/labeledFrame/1',
            method: 'GET',
          },
          {
            data: {
              classes: [],
              id: '0115bd97fa0c1d86f8d1f65ff409f0b8',
              labeledThingId: '0115bd97fa0c1d86f8d1f65ff409faa6',
              rev: '14-547b5f8221abb7327b156d7c1591b14e',
              incomplete: true,
              ghost: false,
              frameNumber: 1,
              shapes: [
                {
                  type: 'rectangle',
                  labeledThingInFrameId: '0115bd97fa0c1d86f8d1f65ff409f0b8',
                  bottomRight: {y: 190, x: 140},
                  topLeft: {y: 60, x: 60},
                },
              ],
            },
            url: '/api/labeledThingInFrame/0115bd97fa0c1d86f8d1f65ff409f0b8',
            method: 'PUT',
          },
        ], true);

        done();
      });
  });

  it('should correctly resize a rectangle on canvas and save the changed coordinates', (done) => {
    browser.get('/labeling/task/0115bd97fa0c1d86f8d1f65ff4095ed8');

    const viewer = element(by.css('.layer-container'));
    const scaleToolButton = element(by.name('controls-button-scale-tool'));

    scaleToolButton.click();

    browser.actions()
      .mouseMove(viewer, {x: 50, y: 50}) // initial position
      .mouseDown()
      .mouseMove(viewer, {x: 40, y: 40}) // drag
      .mouseUp()
      .mouseMove(viewer, {x: 0, y: 0}) // click somewhere outside to deselect element
      .click()
      .perform();

    viewerDataManager.exportData()
      .then((data) => {
        const expectedData = viewerDataManager.readViewerData('Tests/Fixtures/ViewerData/RectangleDrawing/resizedRectangle.json.gz');

        expect(data).toEqualViewerData(expectedData);

        expect(getMockRequestsMade(mock)).toHaveSameItems([
          {
            url: '/api/task/0115bd97fa0c1d86f8d1f65ff4095ed8',
            method: 'GET',
          },
          {
            url: '/api/task/0115bd97fa0c1d86f8d1f65ff4095ed8/frameLocations/source?limit=2&offset=0',
            method: 'GET',
          },
          {
            url: '/api/task/0115bd97fa0c1d86f8d1f65ff4095ed8/labeledThingInFrame/1',
            method: 'GET',
          },
          {
            url: '/api/task/0115bd97fa0c1d86f8d1f65ff4095ed8/frameLocations/thumbnail?limit=2&offset=1',
            method: 'GET',
          },
          {
            url: '/api/task/0115bd97fa0c1d86f8d1f65ff4095ed8/labeledFrame/1',
            method: 'GET',
          },
          {
            data: {
              classes: [],
              id: '0115bd97fa0c1d86f8d1f65ff409f0b8',
              labeledThingId: '0115bd97fa0c1d86f8d1f65ff409faa6',
              rev: '14-547b5f8221abb7327b156d7c1591b14e',
              frameNumber: 1,
              ghost: false,
              incomplete: true,
              shapes: [
                {
                  type: 'rectangle',
                  bottomRight: {y: 180, x: 130},
                  topLeft: {y: 40, x: 40},
                  labeledThingInFrameId: '0115bd97fa0c1d86f8d1f65ff409f0b8',
                },
              ],
            },
            url: '/api/labeledThingInFrame/0115bd97fa0c1d86f8d1f65ff409f0b8',
            method: 'PUT',
          },
        ], true);

        done();
      });
  });

  it('should correctly apply a compound transformation a rectangle on canvas and update the changed coordinates', (done) => {
    browser.get('/labeling/task/0115bd97fa0c1d86f8d1f65ff4095ed8');

    const viewer = element(by.css('.layer-container'));
    const scaleToolButton = element(by.name('controls-button-scale-tool'));
    const moveToolButton = element(by.name('controls-button-move-tool'));

    browser.waitForAngular();

    scaleToolButton.click();

    // Resize
    browser.actions()
      .mouseMove(viewer, {x: 50, y: 50}) // initial position
      .mouseDown()
      .mouseMove(viewer, {x: 40, y: 40}) // drag
      .mouseUp()
      .mouseMove(viewer, {x: 0, y: 0}) // click somewhere outside to deselect element
      .click()
      .perform();

    // Explicitly wait for backend to sync since we don't have proper queueing, yet
    browser.waitForAngular();

    moveToolButton.click();

    // Move
    browser.actions()
      .mouseMove(viewer, {x: 50, y: 50}) // move within the object position
      .mouseDown()
      .mouseMove(viewer, {x: 60, y: 60}) // drag
      .mouseUp()
      .mouseMove(viewer, {x: 0, y: 0}) // click somewhere outside to deselect element
      .click()
      .perform();

    viewerDataManager.exportData()
      .then((data) => {
        const expectedData = viewerDataManager.readViewerData('Tests/Fixtures/ViewerData/RectangleDrawing/compoundEdit.json.gz');

        expect(data).toEqualViewerData(expectedData);

        expect(getMockRequestsMade(mock)).toHaveSameItems([
          {
            url: '/api/task/0115bd97fa0c1d86f8d1f65ff4095ed8',
            method: 'GET',
          },
          {
            url: '/api/task/0115bd97fa0c1d86f8d1f65ff4095ed8/frameLocations/source?limit=2&offset=0',
            method: 'GET',
          },
          {
            url: '/api/task/0115bd97fa0c1d86f8d1f65ff4095ed8/labeledThingInFrame/1',
            method: 'GET',
          },
          {
            url: '/api/task/0115bd97fa0c1d86f8d1f65ff4095ed8/frameLocations/thumbnail?limit=2&offset=1',
            method: 'GET',
          },
          {
            url: '/api/task/0115bd97fa0c1d86f8d1f65ff4095ed8/labeledFrame/1',
            method: 'GET',
          },
          {
            data: {
              classes: [],
              incomplete: true,
              ghost: false,
              id: '0115bd97fa0c1d86f8d1f65ff409f0b8',
              labeledThingId: '0115bd97fa0c1d86f8d1f65ff409faa6',
              rev: '14-547b5f8221abb7327b156d7c1591b14e',
              frameNumber: 1,
              shapes: [
                {
                  type: 'rectangle',
                  bottomRight: {y: 180, x: 130},
                  topLeft: {y: 40, x: 40},
                  labeledThingInFrameId: '0115bd97fa0c1d86f8d1f65ff409f0b8',
                },
              ],
            },
            url: '/api/labeledThingInFrame/0115bd97fa0c1d86f8d1f65ff409f0b8',
            method: 'PUT',
          },
          {
            data: {
              'id': '0115bd97fa0c1d86f8d1f65ff409f0b8',
              'rev': '15-c3bc44889b793d878c57d5edb81e381f',
              'frameNumber': 1,
              'classes': [],
              incomplete: true,
              ghost: false,
              'shapes': [
                {
                  'type': 'rectangle',
                  'topLeft': {
                    'x': 50,
                    'y': 50,
                  },
                  'bottomRight': {
                    'x': 140,
                    'y': 190,
                  },
                  labeledThingInFrameId: '0115bd97fa0c1d86f8d1f65ff409f0b8',
                },
              ],
              'labeledThingId': '0115bd97fa0c1d86f8d1f65ff409faa6',
            },
            url: '/api/labeledThingInFrame/0115bd97fa0c1d86f8d1f65ff409f0b8',
            method: 'PUT',
          },
        ], true);

        done();
      });
  });

  afterEach(() => {
    mock.teardown();
  });
});
