import mock from 'protractor-http-mock';
import ViewerDataManager from '../Support/ViewerDataManager';
import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {getMockRequestsMade} from '../Support/Protractor/Helpers';

// Shared Mocks
const userProfileMock = require('../ProtractorMocks/Common/UserProfile.json');
const userPermissionMock = require('../ProtractorMocks/Common/UserPermissions.json');
const taskMock = require('../ProtractorMocks/Common/Task.json');
const videoMock = require('../ProtractorMocks/Common/Video.json');
const labelStructureMock = require('../ProtractorMocks/Common/LabelStructure.json');
const getTimerMock = require('../ProtractorMocks/Common/GetTimer.json');
const putTimerMock = require('../ProtractorMocks/Common/PutTimer.json');
const sourceJpg1_5Mock = require('../ProtractorMocks/Common/FrameLocations/SourceJpg1-5.json');
const thumbnail1_5Mock = require('../ProtractorMocks/Common/FrameLocations/Thumbnail1-5.json');
const sourceJpg1Mock = require('../ProtractorMocks/Common/FrameLocations/SourceJpg1.json');
const labeledThingIncompleteCountMock = require('../ProtractorMocks/Common/LabeledThingIncompleteCount.json');

// "should load and draw one rectangle"
const oneRectangle1Mock = require('../ProtractorMocks/RectangleDrawing/DrawOneRectangle/OneRectangle1.json');
const oneRectangle1_5Mock = require('../ProtractorMocks/RectangleDrawing/DrawOneRectangle/OneRectangle1-5.json');

// "should load and draw two rectangles"
const twoRectangles1Mock = require('../ProtractorMocks/RectangleDrawing/DrawTwoRectangles/TwoRectangles1.json');
const twoRectangles1_5Mock = require('../ProtractorMocks/RectangleDrawing/DrawTwoRectangles/TwoRectangles1-5.json');

// "should correctly move a rectangle on canvas and save the changed coordinates"
const movedOneRectangleMock = require('../ProtractorMocks/RectangleDrawing/MoveOneRectangle/MovedRectangle1.json');

// "should correctly resize a rectangle on canvas and save the changed coordinates"
const resizeOneRectangleMock = require('../ProtractorMocks/RectangleDrawing/ResizeOneRectangle/ResizeRectangle1.json');

// "should keep the labeled thing selected over a frame change"
const oneRectangleTwoFrames1Mock = require('../ProtractorMocks/RectangleDrawing/OneRectangleTwoFrames/TwoRectangles1.json');
const oneRectangleTwoFrames2Mock = require('../ProtractorMocks/RectangleDrawing/OneRectangleTwoFrames/TwoRectangles2.json');
const oneRectangleTwoFrames1_5Mock = require('../ProtractorMocks/RectangleDrawing/OneRectangleTwoFrames/TwoRectangles1-5.json');
const oneRectangleTwoFramesLabeledThing1_5Mock = require('../ProtractorMocks/RectangleDrawing/OneRectangleTwoFrames/TwoRectanglesLabeledThing1-5.json');

const limitIgnoringLabeledThingInFrameRequestMock1 = require('../ProtractorMocks/RectangleDrawing/IgnoreLimit/LimitIgnoringLabeledThingInFrameRequest1.json');
const limitIgnoringLabeledThingInFrameRequestMock1_5 = require('../ProtractorMocks/RectangleDrawing/IgnoreLimit/LimitIgnoringLabeledThingInFrameRequest1-5.json');


const loadOneRectangleExpectation = require('../Fixtures/CanvasInstructionLogs/LoadOneRectangle.json');
const loadTwoRectanglesExpectation = require('../Fixtures/CanvasInstructionLogs/LoadTwoRectangles.json');
const selectOneRectangleExpectation = require('../Fixtures/CanvasInstructionLogs/SelectOneRectangle.json');
const selectAndDeselectRectangleExpectation = require('../Fixtures/CanvasInstructionLogs/SelectAndDeselectRectangle.json');
const selectAnOtherRectangleExpectation = require('../Fixtures/CanvasInstructionLogs/SelectAnOtherRectangle.json');
const moveOneRectangleExpectation = require('../Fixtures/CanvasInstructionLogs/MoveOneRectangle.json');
const resizeOneRectangleExpectation = require('../Fixtures/CanvasInstructionLogs/ResizeOneRectangle.json');
const keepSelectionOverFrameChangeExpectation = require('../Fixtures/CanvasInstructionLogs/KeepSelectionOverFrameChange.json');

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Rectangle drawing', () => {

  it('should load and draw one rectangle', (done) => {
    mock([
      userProfileMock,
      userPermissionMock,
      taskMock,
      videoMock,
      labelStructureMock,
      getTimerMock,
      putTimerMock,
      sourceJpg1_5Mock,
      thumbnail1_5Mock,
      sourceJpg1Mock,
      labeledThingIncompleteCountMock,

      oneRectangle1Mock,
      oneRectangle1_5Mock
    ]);
    browser.get('/labeling/task/FEDCBA9876543210-TaskId-FEDCBA9876543210');

    canvasInstructionLogManager.getCanvasLogs().then((drawingStack) => {
      expect(drawingStack).toEqualDrawingStack(loadOneRectangleExpectation);
      done();
    })
  });

  it('should load and draw two rectangles', (done) => {
    mock([
      userProfileMock,
      userPermissionMock,
      taskMock,
      videoMock,
      labelStructureMock,
      getTimerMock,
      putTimerMock,
      sourceJpg1_5Mock,
      thumbnail1_5Mock,
      sourceJpg1Mock,
      labeledThingIncompleteCountMock,

      twoRectangles1Mock,
      twoRectangles1_5Mock
    ]);
    browser.get('/labeling/task/FEDCBA9876543210-TaskId-FEDCBA9876543210');

    canvasInstructionLogManager.getCanvasLogs().then((drawingStack) => {
      expect(drawingStack).toEqualDrawingStack(loadTwoRectanglesExpectation);
      done();
    })
  });

  it('should select a rectangle', (done) => {
    mock([
      userProfileMock,
      userPermissionMock,
      taskMock,
      videoMock,
      labelStructureMock,
      getTimerMock,
      putTimerMock,
      sourceJpg1_5Mock,
      thumbnail1_5Mock,
      sourceJpg1Mock,
      labeledThingIncompleteCountMock,

      twoRectangles1Mock,
      twoRectangles1_5Mock
    ]);
    browser.get('/labeling/task/FEDCBA9876543210-TaskId-FEDCBA9876543210');

    const viewer = element(by.css('.layer-container'));

    browser.actions()
      .mouseMove(viewer, {x: 110, y: 110}) // initial position
      .click()
      .perform();

    canvasInstructionLogManager.getCanvasLogs().then((drawingStack) => {
      expect(drawingStack).toEqualDrawingStack(selectOneRectangleExpectation);
      done();
    })
  });

  it('should select and deselect a rectangle', (done) => {
    mock([
      userProfileMock,
      userPermissionMock,
      taskMock,
      videoMock,
      labelStructureMock,
      getTimerMock,
      putTimerMock,
      sourceJpg1_5Mock,
      thumbnail1_5Mock,
      sourceJpg1Mock,
      labeledThingIncompleteCountMock,

      twoRectangles1Mock,
      twoRectangles1_5Mock
    ]);
    browser.get('/labeling/task/FEDCBA9876543210-TaskId-FEDCBA9876543210');

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
      expect(drawingStack).toEqualDrawingStack(selectAndDeselectRectangleExpectation);
      done();
    })
  });

  it('should deselect one and select an other rectangle', (done) => {
    mock([
      userProfileMock,
      userPermissionMock,
      taskMock,
      videoMock,
      labelStructureMock,
      getTimerMock,
      putTimerMock,
      sourceJpg1_5Mock,
      thumbnail1_5Mock,
      sourceJpg1Mock,
      labeledThingIncompleteCountMock,

      twoRectangles1Mock,
      twoRectangles1_5Mock
    ]);
    browser.get('/labeling/task/FEDCBA9876543210-TaskId-FEDCBA9876543210');

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
      expect(drawingStack).toEqualDrawingStack(selectAnOtherRectangleExpectation);
      done();
    });
  });

  it('should correctly move a rectangle on canvas and save the changed coordinates', (done) => {
    mock([
      userProfileMock,
      userPermissionMock,
      taskMock,
      videoMock,
      labelStructureMock,
      getTimerMock,
      putTimerMock,
      sourceJpg1_5Mock,
      thumbnail1_5Mock,
      sourceJpg1Mock,
      labeledThingIncompleteCountMock,

      twoRectangles1Mock,
      twoRectangles1_5Mock,

      movedOneRectangleMock
    ]);
    browser.get('/labeling/task/FEDCBA9876543210-TaskId-FEDCBA9876543210');

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
      expect(drawingStack).toEqualDrawingStack(moveOneRectangleExpectation);
      browser.sleep(1000);
      getMockRequestsMade(mock).then(requests => {
        expect(requests).toContain(movedOneRectangleMock.request);
        done();
      });
    });
  });

  it('should correctly resize a rectangle on canvas and save the changed coordinates', (done) => {
    mock([
      userProfileMock,
      userPermissionMock,
      taskMock,
      videoMock,
      labelStructureMock,
      getTimerMock,
      putTimerMock,
      sourceJpg1_5Mock,
      thumbnail1_5Mock,
      sourceJpg1Mock,
      labeledThingIncompleteCountMock,

      twoRectangles1Mock,
      twoRectangles1_5Mock,

      resizeOneRectangleMock
    ]);
    browser.get('/labeling/task/FEDCBA9876543210-TaskId-FEDCBA9876543210');

    const viewer = element(by.css('.layer-container'));

    browser.actions()
      .mouseMove(viewer, {x: 176, y: 176}) // bottom right drag handle
      .mouseDown()
      .mouseMove(viewer, {x: 200, y: 200}) // drag
      .mouseUp()
      .perform();


    canvasInstructionLogManager.getCanvasLogs().then((drawingStack) => {
      expect(drawingStack).toEqualDrawingStack(resizeOneRectangleExpectation);
      browser.sleep(1000);
      getMockRequestsMade(mock).then(requests => {

        expect(requests).toContain(resizeOneRectangleMock.request);
        done();
      });
    });
  });

  it('should keep the labeled thing selected over a frame change', (done) => {
    mock([
      userProfileMock,
      userPermissionMock,
      taskMock,
      videoMock,
      labelStructureMock,
      getTimerMock,
      putTimerMock,
      sourceJpg1_5Mock,
      thumbnail1_5Mock,
      sourceJpg1Mock,
      labeledThingIncompleteCountMock,

      oneRectangleTwoFrames1Mock,
      oneRectangleTwoFrames2Mock,
      oneRectangleTwoFrames1_5Mock,
      oneRectangleTwoFramesLabeledThing1_5Mock
    ]);
    browser.get('/labeling/task/FEDCBA9876543210-TaskId-FEDCBA9876543210');

    const viewer = element(by.css('.layer-container'));
    const nextFrameButton = element(by.css('.next-frame-button'));

    browser.actions()
      .mouseMove(viewer, {x: 110, y: 110}) // initial position
      .click()
      .perform();

    nextFrameButton.click();

    canvasInstructionLogManager.getCanvasLogs().then((drawingStack) => {
      expect(drawingStack).toEqualDrawingStack(keepSelectionOverFrameChangeExpectation);
      done();
    });

  });

  it('should correctly handle extra information in limited labeledThingInFrame request', (done) => {
    mock([
      userProfileMock,
      userPermissionMock,
      taskMock,
      videoMock,
      labelStructureMock,
      getTimerMock,
      putTimerMock,
      sourceJpg1_5Mock,
      thumbnail1_5Mock,
      sourceJpg1Mock,
      labeledThingIncompleteCountMock,

      limitIgnoringLabeledThingInFrameRequestMock1,
      limitIgnoringLabeledThingInFrameRequestMock1_5
    ]);
    browser.get('/labeling/task/FEDCBA9876543210-TaskId-FEDCBA9876543210');

    const viewer = element(by.css('.layer-container'));

    canvasInstructionLogManager.getCanvasLogs().then((drawingStack) => {
      expect(drawingStack).toEqualDrawingStack(loadOneRectangleExpectation);
      done();
    });

  });


  afterEach(() => {
    mock.teardown();
  });
});
