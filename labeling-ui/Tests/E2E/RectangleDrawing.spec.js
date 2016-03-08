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
const rectangleSelected = require('../ProtractorMocks/Task/LabeledThingInFrame/RectangleSelected.json');
const movedRectangleMock = require('../ProtractorMocks/Task/LabeledThingInFrame/MovedRectangle.json');
const resizeRectangleMock = require('../ProtractorMocks/Task/LabeledThingInFrame/ResizeRectangle.json');

const loadOneRectangleExpectation = require('../Fixtures/CanvasInstructionLogs/LoadOneRectangle.json');
const loadTwoRectanglesExpectation = require('../Fixtures/CanvasInstructionLogs/LoadTwoRectangles.json');
const selectOneRectangleExpectation = require('../Fixtures/CanvasInstructionLogs/SelectOneRectangle.json');
const selectAndDeselectRectangleExpectation = require('../Fixtures/CanvasInstructionLogs/SelectAndDeselectRectangle.json');
const selectAnOtherRectangleExpectation = require('../Fixtures/CanvasInstructionLogs/SelectAnOtherRectangle.json');
const moveOneRectangleExpectation = require('../Fixtures/CanvasInstructionLogs/MoveOneRectangle.json');
const resizeOneRectangleExpectation = require('../Fixtures/CanvasInstructionLogs/ResizeOneRectangle.json');

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
      .perform();
    browser.actions()
      .mouseMove(viewer, {x: 300, y: 150}) // initial position
      .click()
      .perform();

    canvasInstructionLogManager.getCanvasLogs().then((drawingStack) => {
      expect(selectAnOtherRectangleExpectation).toEqualDrawingStack(drawingStack);
      done();
    });
  });


  it('should correctly move a rectangle on canvas and save the changed coordinates', (done) => {
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
      rectangleSelected,

      twoRectanglesLabeledThingsMock,
      twoRectanglesLabeledThingsPreloadingMock,
      movedRectangleMock
    ]);

    browser.get('/labeling/task/0115bd97fa0c1d86f8d1f65ff4095ed8');

    const viewer = element(by.css('.layer-container'));

    browser.actions()
      .mouseMove(viewer, {x: 110, y: 110}) // initial position
      .mouseDown()
      .mouseMove(viewer, {x: 110, y: 130}) // drag
      .mouseUp()
      .mouseMove(viewer, {x: 1, y: 1}) // click somewhere outside to deselect element
      .click()
      .perform();

    canvasInstructionLogManager.getCanvasLogs().then((drawingStack) => {
      expect(moveOneRectangleExpectation).toEqualDrawingStack(drawingStack);
      browser.sleep(1000);
      getMockRequestsMade(mock).then(requests => {

        expect(requests).toContain(movedRectangleMock.request);
        done();
      });
    });
  });

  it('should correctly resize a rectangle on canvas and save the changed coordinates', (done) => {
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
      rectangleSelected,

      twoRectanglesLabeledThingsMock,
      twoRectanglesLabeledThingsPreloadingMock,
      resizeRectangleMock
    ]);

    browser.get('/labeling/task/0115bd97fa0c1d86f8d1f65ff4095ed8');

    const viewer = element(by.css('.layer-container'));

    browser.actions()
      .mouseMove(viewer, {x: 176, y: 176}) // bottom right drag handle
      .mouseDown()
      .mouseMove(viewer, {x: 200, y: 200}) // drag
      .mouseUp()
      .perform();


    canvasInstructionLogManager.getCanvasLogs().then((drawingStack) => {
      expect(resizeOneRectangleExpectation).toEqualDrawingStack(drawingStack);
      browser.sleep(1000);
      getMockRequestsMade(mock).then(requests => {

        expect(requests).toContain(resizeRectangleMock.request);
        done();
      });
    });
  });


  afterEach(() => {
    mock.teardown();
  });
});
