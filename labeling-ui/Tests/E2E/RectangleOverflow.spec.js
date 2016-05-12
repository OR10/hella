import mock from 'protractor-http-mock';
import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {getMockRequestsMade, initApplication} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

//
// // Shared Mocks
// const userProfileMock = require('../ProtractorMocks/Common/UserProfile.json');
// const userPermissionMock = require('../ProtractorMocks/Common/UserPermissions.json');
// const videoMock = require('../ProtractorMocks/Common/Video.json');
// const labelStructureMock = require('../ProtractorMocks/Common/LabelStructure.json');
// const getTimerMock = require('../ProtractorMocks/Common/GetTimer.json');
// const putTimerMock = require('../ProtractorMocks/Common/PutTimer.json');
// const sourceJpg1_5Mock = require('../ProtractorMocks/Common/FrameLocations/SourceJpg1-5.json');
// const thumbnail1_5Mock = require('../ProtractorMocks/Common/FrameLocations/Thumbnail1-5.json');
// const sourceJpg1Mock = require('../ProtractorMocks/Common/FrameLocations/SourceJpg1.json');
// const labeledThingIncompleteCountMock = require('../ProtractorMocks/Common/LabeledThingIncompleteCount.json');
//
// const overflowDisabledTask = require('../ProtractorMocks/RectangleMovement/ShapeOverflow/OverflowDisabledTask.json');
// const overflowBottomRight = require('../ProtractorMocks/RectangleMovement/ShapeOverflow/OverflowBottomRightRectangle.json');
// const nonOverflowTopLeft = require('../ProtractorMocks/RectangleMovement/ShapeOverflow/NonOverflowTopLeftRectangle.json');
// const nonOverflowBottomRight = require('../ProtractorMocks/RectangleMovement/ShapeOverflow/NonOverflowBottomRightRectangle.json');
//
// const overflowTopLeftInstructions = require('../Fixtures/CanvasInstructionLogs/RectangleMovement/ShapeOverflow/OverflowTopLeftRectangle.json');
// const overflowBottomRightInstructions = require('../Fixtures/CanvasInstructionLogs/RectangleMovement/ShapeOverflow/OverflowBottomRightRectangle.json');
// const nonOverflowTopLeftInstructions = require('../Fixtures/CanvasInstructionLogs/RectangleMovement/ShapeOverflow/NonOverflowTopLeftRectangle.json');
// const nonOverflowBottomRightInstructions = require('../Fixtures/CanvasInstructionLogs/RectangleMovement/ShapeOverflow/NonOverflowBottomRightRectangle.json');

describe('Rectangle Overflow', () => {
  let assets;
  let sharedMocks;
  let viewer;

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`);
    sharedMocks = [
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Shared.Video,
      assets.mocks.Shared.LabelStructure,
      assets.mocks.Shared.GetTimer,
      assets.mocks.Shared.PutTimer,
      assets.mocks.Shared.LabeledThingIncompleteCount,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0to4,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0to4,
    ];

    viewer = element(by.css('.layer-container'));
  });

  it('should restrict overflowing in the top left corner', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleOverflow.Shared.TaskOverflow,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.RectangleOverflow.TopLeft.LabeledThingInFrame.Overflow,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 190, y: 190}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 1, y: 1}) // drag
          .mouseUp()
          .perform();

        browser.sleep(1000);
      })
      .then(() => canvasInstructionLogManager.getCanvasLogs())
      .then(drawingStack => {
        expect(drawingStack).toEqualDrawingStack(assets.fixtures.Canvas.RectangleOverflow.TopLeftOverflow);
        getMockRequestsMade(mock).then(requests => {
          expect(requests).toContain(assets.mocks.RectangleOverflow.TopLeft.LabeledThingInFrame.Overflow.request);
          done();
        });
      });
  });
//
//     it('should restrict overflowing in the bottom right corner', (done) => {
//       mock([
//         userProfileMock,
//         userPermissionMock,
//         videoMock,
//         labelStructureMock,
//         getTimerMock,
//         putTimerMock,
//         sourceJpg1_5Mock,
//         thumbnail1_5Mock,
//         sourceJpg1Mock,
//         labeledThingIncompleteCountMock,
//
//         overflowEnabledTask,
//         overflowStartingRectangle,
//         overflowBottomRight,
//       ]);
//       browser.get('/labeling/task/TASKID-TASKID');
//
//       coords.autoSetViewerDimensions()
//         .then(({viewer, viewerSize}) => {
//           browser.actions()
//             .mouseMove(viewer, coords.toViewer(110, 110)) // initial position
//             .mouseDown()
//             .mouseMove(viewer, coords.toViewer(1023, 619)) // drag
//             .mouseUp()
//             .perform();
//
//           browser.sleep(1000);
//         })
//         .then(() => canvasInstructionLogManager.getCanvasLogs())
//         .then(drawingStack => {
//           expect(drawingStack).toEqualDrawingStack(overflowBottomRightInstructions);
//           getMockRequestsMade(mock).then(requests => {
//             expect(requests).toContain(overflowBottomRight.request);
//             done();
//           });
//         });
//     });
//
//     it('should restrict non-overflowing in the bottom right corner', (done) => {
//       mock([
//         userProfileMock,
//         userPermissionMock,
//         videoMock,
//         labelStructureMock,
//         getTimerMock,
//         putTimerMock,
//         sourceJpg1_5Mock,
//         thumbnail1_5Mock,
//         sourceJpg1Mock,
//         labeledThingIncompleteCountMock,
//
//         overflowDisabledTask,
//         overflowStartingRectangle,
//         nonOverflowBottomRight,
//       ]);
//       browser.get('/labeling/task/TASKID-TASKID');
//
//       coords.autoSetViewerDimensions()
//         .then(({viewer, viewerSize}) => {
//           browser.actions()
//             .mouseMove(viewer, coords.toViewer(110, 110)) // initial position
//             .mouseDown()
//             .mouseMove(viewer, coords.toViewer(1023, 619)) // drag
//             .mouseUp()
//             .perform();
//
//           browser.sleep(1000);
//         })
//         .then(() => canvasInstructionLogManager.getCanvasLogs())
//         .then(drawingStack => {
//           expect(drawingStack).toEqualDrawingStack(nonOverflowBottomRightInstructions);
//           getMockRequestsMade(mock).then(requests => {
//             expect(requests).toContain(nonOverflowBottomRight.request);
//             done();
//           });
//         });
//     });
//
//     it('should restrict non-overflowing in the top left corner', (done) => {
//       mock([
//         userProfileMock,
//         userPermissionMock,
//         videoMock,
//         labelStructureMock,
//         getTimerMock,
//         putTimerMock,
//         sourceJpg1_5Mock,
//         thumbnail1_5Mock,
//         sourceJpg1Mock,
//         labeledThingIncompleteCountMock,
//
//         overflowDisabledTask,
//         overflowStartingRectangle,
//         nonOverflowTopLeft,
//       ]);
//       browser.get('/labeling/task/TASKID-TASKID');
//
//       coords.autoSetViewerDimensions()
//         .then(({viewer, viewerSize}) => {
//           browser.actions()
//             .mouseMove(viewer, coords.toViewer(190, 190)) // initial position
//             .mouseDown()
//             .mouseMove(viewer, coords.toViewer(1, 1)) // drag
//             .mouseUp()
//             .perform();
//
//           browser.sleep(1000);
//         })
//         .then(() => canvasInstructionLogManager.getCanvasLogs())
//         .then(drawingStack => {
//           expect(drawingStack).toEqualDrawingStack(nonOverflowTopLeftInstructions);
//           getMockRequestsMade(mock).then(requests => {
//             expect(requests).toContain(nonOverflowTopLeft.request);
//             done();
//           });
//         });
//     });
//

  afterEach(() => {
    mock.teardown();
  });
});
