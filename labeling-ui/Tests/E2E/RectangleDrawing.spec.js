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
const oneRectangleLabeledThingsMock = require('../ProtractorMocks/Task/LabeledThingInFrame/OneRectangle.json');
const oneRectangleLabeledThingsPreloadingMock = require('../ProtractorMocks/Task/LabeledThingInFrame/OneRectanglePreloading.json');
const twoRectanglesLabeledThingsMock = require('../ProtractorMocks/Task/LabeledThingInFrame/TwoRectangles.json');
const twoRectanglesLabeledThingsPreloadingMock = require('../ProtractorMocks/Task/LabeledThingInFrame/TwoRectanglesPreloading.json');
const labeledFrameMock = require('../ProtractorMocks/Task/LabeledFrame.json');
const movedRectangleMock = require('../ProtractorMocks/Task/LabeledThingInFrame/MovedRectangle.json');
const resizedRectangleMock = require('../ProtractorMocks/Task/LabeledThingInFrame/ResizedRectangle.json');
const resizedAndMovedRectangleMock = require('../ProtractorMocks/Task/LabeledThingInFrame/ResizedAndMovedRectangle.json');

const loadOneRectangleExpectation = require('../Fixtures/CanvasInstructionLogs/LoadOneRectangle.json');
const loadTwoRectanglesExpectation = require('../Fixtures/CanvasInstructionLogs/LoadTwoRectangles.json');
const selectOneRectangleExpectation = require('../Fixtures/CanvasInstructionLogs/SelectOneRectangle.json');
const selectAndDeselectRectangleExpectation = require('../Fixtures/CanvasInstructionLogs/SelectAndDeselectRectangle.json');

const selectAnOtherRectangleExpectation = require('../Fixtures/CanvasInstructionLogs/SelectAnOtherRectangle.json');

const viewerDataManager = new ViewerDataManager(browser);
const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Rectangle drawing', () => {


  it('should load and draw one rectangle', (done) => {
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
      labeledFrameMock,

      oneRectangleLabeledThingsMock,
      oneRectangleLabeledThingsPreloadingMock
    ]);
    browser.get('/labeling/task/0115bd97fa0c1d86f8d1f65ff4095ed8');

    canvasInstructionLogManager.getCanvasLogs().then((drawingStack) => {
      expect(loadOneRectangleExpectation).toEqualDrawingStack(drawingStack);
      done();
    })
  });


  it('should load and draw two rectangles', (done) => {
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
      labeledFrameMock,

      twoRectanglesLabeledThingsMock,
      twoRectanglesLabeledThingsPreloadingMock
    ]);
    browser.get('/labeling/task/0115bd97fa0c1d86f8d1f65ff4095ed8');

    canvasInstructionLogManager.getCanvasLogs().then((drawingStack) => {
      expect(loadTwoRectanglesExpectation).toEqualDrawingStack(drawingStack);
      done();
    })
  });

  it('should select a rectangle', (done) => {
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
      labeledFrameMock,

      twoRectanglesLabeledThingsMock,
      twoRectanglesLabeledThingsPreloadingMock
    ]);
    browser.get('/labeling/task/0115bd97fa0c1d86f8d1f65ff4095ed8');

    const viewer = element(by.css('.layer-container'));

    browser.actions()
      .mouseMove(viewer, {x: 110, y: 110}) // initial position
      .click()
      .perform();

    canvasInstructionLogManager.getCanvasLogs().then((drawingStack) => {
      expect(selectOneRectangleExpectation).toEqualDrawingStack(drawingStack);
      done();
    })
  });

  it('should select and deselect a rectangle', (done) => {
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
      labeledFrameMock,

      twoRectanglesLabeledThingsMock,
      twoRectanglesLabeledThingsPreloadingMock
    ]);
    browser.get('/labeling/task/0115bd97fa0c1d86f8d1f65ff4095ed8');

    const viewer = element(by.css('.layer-container'));

    browser.actions()
      .mouseMove(viewer, {x: 110, y: 110}) // initial position
      .click()
      .perform();
    browser.actions()
      .mouseMove(viewer, {x: 1, y: 1})
      .click()
      .perform();

    canvasInstructionLogManager.getCanvasLogs().then((drawingStack) => {
      expect(selectAndDeselectRectangleExpectation).toEqualDrawingStack(drawingStack);
      console.log(JSON.stringify(drawingStack));
      done();
    })
  });

  it('should deselect one and select an other rectangle', (done) => {
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
      labeledFrameMock,

      twoRectanglesLabeledThingsMock,
      twoRectanglesLabeledThingsPreloadingMock
    ]);
    browser.get('/labeling/task/0115bd97fa0c1d86f8d1f65ff4095ed8');

    const viewer = element(by.css('.layer-container'));

    browser.actions()
      .mouseMove(viewer, {x: 110, y: 110}) // initial position
      .click()
      .mouseMove(viewer, {x: 250, y: 100}) // initial position
      .click()
      .perform();

    canvasInstructionLogManager.getCanvasLogs().then((drawingStack) => {
      expect(selectAnOtherRectangleExpectation).toEqualDrawingStack(drawingStack);
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


  afterEach(() => {
    mock.teardown();
  });
});
