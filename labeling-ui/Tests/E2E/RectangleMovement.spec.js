import mock from 'protractor-http-mock';
import ViewerDataManager from '../Support/ViewerDataManager';
import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {getMockRequestsMade} from '../Support/Protractor/Helpers';

// Shared Mocks
const userProfileMock = require('../ProtractorMocks/Common/UserProfile.json');
const userPermissionMock = require('../ProtractorMocks/Common/UserPermissions.json');
const videoMock = require('../ProtractorMocks/Common/Video.json');
const labelStructureMock = require('../ProtractorMocks/Common/LabelStructure.json');
const getTimerMock = require('../ProtractorMocks/Common/GetTimer.json');
const putTimerMock = require('../ProtractorMocks/Common/PutTimer.json');
const sourceJpg1_5Mock = require('../ProtractorMocks/Common/FrameLocations/SourceJpg1-5.json');
const thumbnail1_5Mock = require('../ProtractorMocks/Common/FrameLocations/Thumbnail1-5.json');
const sourceJpg1Mock = require('../ProtractorMocks/Common/FrameLocations/SourceJpg1.json');
const labeledThingIncompleteCountMock = require('../ProtractorMocks/Common/LabeledThingIncompleteCount.json');

const overflowEnabledTask = require('../ProtractorMocks/RectangleMovement/ShapeOverflow/OverflowEnabledTask.json');
const overflowDisabledTask = require('../ProtractorMocks/RectangleMovement/ShapeOverflow/OverflowDisabledTask.json');
const overflowStartingRectangle = require('../ProtractorMocks/RectangleMovement/ShapeOverflow/StartingRectangle.json');
const overflowTopLeft = require('../ProtractorMocks/RectangleMovement/ShapeOverflow/OverflowTopLeftRectangle.json');
const overflowBottomRight = require('../ProtractorMocks/RectangleMovement/ShapeOverflow/OverflowBottomRightRectangle.json');
const nonOverflowTopLeft = require('../ProtractorMocks/RectangleMovement/ShapeOverflow/NonOverflowTopLeftRectangle.json');
const nonOverflowBottomRight = require('../ProtractorMocks/RectangleMovement/ShapeOverflow/NonOverflowBottomRightRectangle.json');

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

const overflowTopLeftInstructions = require('../Fixtures/CanvasInstructionLogs/RectangleMovement/ShapeOverflow/OverflowTopLeftRectangle.json');
const overflowBottomRightInstructions = require('../Fixtures/CanvasInstructionLogs/RectangleMovement/ShapeOverflow/OverflowBottomRightRectangle.json');
const nonOverflowTopLeftInstructions = require('../Fixtures/CanvasInstructionLogs/RectangleMovement/ShapeOverflow/NonOverflowTopLeftRectangle.json');
const nonOverflowBottomRightInstructions = require('../Fixtures/CanvasInstructionLogs/RectangleMovement/ShapeOverflow/NonOverflowBottomRightRectangle.json');

function videoToViewerCoords(x, y, viewerSize) {
  const factor = viewerSize.width / videoMock.response.data.result.metaData.width;
  return {x: x * factor, y: y * factor};
}

describe('Rectangle moving', () => {
  describe('Shape Overflow', () => {
    it('should restrict overflowing in the top left corner', (done) => {
      mock([
        userProfileMock,
        userPermissionMock,
        videoMock,
        labelStructureMock,
        getTimerMock,
        putTimerMock,
        sourceJpg1_5Mock,
        thumbnail1_5Mock,
        sourceJpg1Mock,
        labeledThingIncompleteCountMock,

        overflowEnabledTask,
        overflowStartingRectangle,
        overflowTopLeft,
      ]);
      browser.get('/labeling/task/TASKID-TASKID');

      const viewer = element(by.css('.layer-container'));

      viewer.getSize()
        .then(viewerSize => {

          browser.actions()
            .mouseMove(viewer, videoToViewerCoords(195, 195, viewerSize)) // initial position
            .mouseDown()
            .mouseMove(viewer, videoToViewerCoords(1, 1, viewerSize)) // drag
            .mouseUp()
            .perform();

          browser.sleep(1000);
        })
        .then(() => canvasInstructionLogManager.getCanvasLogs())
        .then(drawingStack => {
          expect(drawingStack).toEqualDrawingStack(overflowTopLeftInstructions);
          getMockRequestsMade(mock).then(requests => {
            expect(requests).toContain(overflowTopLeft.request);
            done();
          });
        });
    });

    it('should restrict overflowing in the bottom right corner', (done) => {
      mock([
        userProfileMock,
        userPermissionMock,
        videoMock,
        labelStructureMock,
        getTimerMock,
        putTimerMock,
        sourceJpg1_5Mock,
        thumbnail1_5Mock,
        sourceJpg1Mock,
        labeledThingIncompleteCountMock,

        overflowEnabledTask,
        overflowStartingRectangle,
        overflowBottomRight,
      ]);
      browser.get('/labeling/task/TASKID-TASKID');

      const viewer = element(by.css('.layer-container'));

      viewer.getSize()
        .then(viewerSize => {

          browser.actions()
            .mouseMove(viewer, videoToViewerCoords(110, 110, viewerSize)) // initial position
            .mouseDown()
            .mouseMove(viewer, videoToViewerCoords(1023, 619, viewerSize)) // drag
            .mouseUp()
            .perform();

          browser.sleep(1000);
        })
        .then(() => canvasInstructionLogManager.getCanvasLogs())
        .then(drawingStack => {
          expect(drawingStack).toEqualDrawingStack(overflowBottomRightInstructions);
          getMockRequestsMade(mock).then(requests => {
            expect(requests).toContain(overflowBottomRight.request);
            done();
          });
        });
    });

    it('should restrict non-overflowing in the bottom right corner', (done) => {
      mock([
        userProfileMock,
        userPermissionMock,
        videoMock,
        labelStructureMock,
        getTimerMock,
        putTimerMock,
        sourceJpg1_5Mock,
        thumbnail1_5Mock,
        sourceJpg1Mock,
        labeledThingIncompleteCountMock,

        overflowDisabledTask,
        overflowStartingRectangle,
        nonOverflowBottomRight,
      ]);
      browser.get('/labeling/task/TASKID-TASKID');

      const viewer = element(by.css('.layer-container'));

      viewer.getSize()
        .then(viewerSize => {

          browser.actions()
            .mouseMove(viewer, videoToViewerCoords(110, 110, viewerSize)) // initial position
            .mouseDown()
            .mouseMove(viewer, videoToViewerCoords(1023, 619, viewerSize)) // drag
            .mouseUp()
            .perform();

          browser.sleep(1000);
        })
        .then(() => canvasInstructionLogManager.getCanvasLogs())
        .then(drawingStack => {
          expect(drawingStack).toEqualDrawingStack(nonOverflowBottomRightInstructions);
          getMockRequestsMade(mock).then(requests => {
            expect(requests).toContain(nonOverflowBottomRight.request);
            done();
          });
        });
    });

    it('should restrict non-overflowing in the top left corner', (done) => {
      mock([
        userProfileMock,
        userPermissionMock,
        videoMock,
        labelStructureMock,
        getTimerMock,
        putTimerMock,
        sourceJpg1_5Mock,
        thumbnail1_5Mock,
        sourceJpg1Mock,
        labeledThingIncompleteCountMock,

        overflowDisabledTask,
        overflowStartingRectangle,
        nonOverflowTopLeft,
      ]);
      browser.get('/labeling/task/TASKID-TASKID');

      const viewer = element(by.css('.layer-container'));

      viewer.getSize()
        .then(viewerSize => {

          browser.actions()
            .mouseMove(viewer, videoToViewerCoords(190, 190, viewerSize)) // initial position
            .mouseDown()
            .mouseMove(viewer, videoToViewerCoords(1, 1, viewerSize)) // drag
            .mouseUp()
            .perform();

          browser.sleep(1000);
        })
        .then(() => canvasInstructionLogManager.getCanvasLogs())
        .then(drawingStack => {
          expect(drawingStack).toEqualDrawingStack(nonOverflowTopLeftInstructions);
          getMockRequestsMade(mock).then(requests => {
            expect(requests).toContain(nonOverflowTopLeft.request);
            done();
          });
        });
    });
  });

  afterEach(() => {
    mock.teardown();
  });
});
