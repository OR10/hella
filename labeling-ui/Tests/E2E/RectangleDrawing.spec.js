import mock from 'protractor-http-mock';
import ViewerDataManager from '../Support/ViewerDataManager';
import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import CoordinatesTransformer from '../Support/CoordinatesTransformer';
import {getMockRequestsMade} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Rectangle drawing', () => {
  let assets;
  let sharedMocks;
  let coords;


  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`);
    sharedMocks = [
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Shared.Task,
      assets.mocks.Shared.Video,
      assets.mocks.Shared.LabelStructure,
      assets.mocks.Shared.GetTimer,
      assets.mocks.Shared.PutTimer,
      assets.mocks.Shared.LabeledThingIncompleteCountMock,
      assets.mocks.Shared.FrameLocations.SourceJpg.frame1,
      assets.mocks.Shared.FrameLocations.SourceJpg.frame1to5,
      assets.mocks.Shared.FrameLocations.Thumbnail.frame1to5,
    ];

    coords = new CoordinatesTransformer({
      width: 1024,
      height: 620,
    });
  });

  fit('should load and draw one rectangle', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.DrawOneRectangle.LabeledThingInFrame.frame1,
      assets.mocks.DrawOneRectangle.LabeledThingInFrame.frame1to5,
    ]));
    browser.get('/labeling/task/TASKID-TASKID');

    canvasInstructionLogManager.getCanvasLogs().then((drawingStack) => {
      expect(drawingStack).toEqualDrawingStack(assets.fixtures.Canvas.LoadAndDrawOneRectangle);
      done();
    });
  });

  // it('should load and draw two rectangles', (done) => {
  //   mock([
  //     userProfileMock,
  //     userPermissionMock,
  //     taskMock,
  //     videoMock,
  //     labelStructureMock,
  //     getTimerMock,
  //     putTimerMock,
  //     sourceJpg1_5Mock,
  //     thumbnail1_5Mock,
  //     sourceJpg1Mock,
  //     labeledThingIncompleteCountMock,
  //
  //     twoRectangles1Mock,
  //     twoRectangles1_5Mock,
  //   ]);
  //   browser.get('/labeling/task/TASKID-TASKID');
  //
  //   canvasInstructionLogManager.getCanvasLogs().then((drawingStack) => {
  //     expect(drawingStack).toEqualDrawingStack(loadTwoRectanglesExpectation);
  //     done();
  //   })
  // });
  //
  // it('should select a rectangle', (done) => {
  //   mock([
  //     userProfileMock,
  //     userPermissionMock,
  //     taskMock,
  //     videoMock,
  //     labelStructureMock,
  //     getTimerMock,
  //     putTimerMock,
  //     sourceJpg1_5Mock,
  //     thumbnail1_5Mock,
  //     sourceJpg1Mock,
  //     labeledThingIncompleteCountMock,
  //
  //     twoRectangles1Mock,
  //     twoRectangles1_5Mock,
  //   ]);
  //   browser.get('/labeling/task/TASKID-TASKID');
  //
  //   coords.autoSetViewerDimensions()
  //     .then(({viewer, viewerDimensions}) => {
  //       browser.actions()
  //         .mouseMove(viewer, coords.toViewer(110, 110)) // initial position
  //         .click()
  //         .perform();
  //     })
  //     .then(() => canvasInstructionLogManager.getCanvasLogs())
  //     .then(drawingStack => {
  //       expect(drawingStack).toEqualDrawingStack(selectOneRectangleExpectation);
  //       done();
  //     });
  // });
  //
  // it('should select and deselect a rectangle', (done) => {
  //   mock([
  //     userProfileMock,
  //     userPermissionMock,
  //     taskMock,
  //     videoMock,
  //     labelStructureMock,
  //     getTimerMock,
  //     putTimerMock,
  //     sourceJpg1_5Mock,
  //     thumbnail1_5Mock,
  //     sourceJpg1Mock,
  //     labeledThingIncompleteCountMock,
  //
  //     twoRectangles1Mock,
  //     twoRectangles1_5Mock,
  //   ]);
  //   browser.get('/labeling/task/TASKID-TASKID');
  //
  //   coords.autoSetViewerDimensions()
  //     .then(({viewer, viewerDimensions}) => {
  //       browser.actions()
  //         .mouseMove(viewer, coords.toViewer(110, 110)) // initial position
  //         .click()
  //         .perform();
  //       browser.actions()
  //         .mouseMove(viewer, coords.toViewer(1, 1))
  //         .click()
  //         .perform();
  //     })
  //     .then(() => canvasInstructionLogManager.getCanvasLogs())
  //     .then(drawingStack => {
  //       expect(drawingStack).toEqualDrawingStack(selectAndDeselectRectangleExpectation);
  //       done();
  //     });
  // });
  //
  // it('should deselect one and select an other rectangle', (done) => {
  //   mock([
  //     userProfileMock,
  //     userPermissionMock,
  //     taskMock,
  //     videoMock,
  //     labelStructureMock,
  //     getTimerMock,
  //     putTimerMock,
  //     sourceJpg1_5Mock,
  //     thumbnail1_5Mock,
  //     sourceJpg1Mock,
  //     labeledThingIncompleteCountMock,
  //
  //     twoRectangles1Mock,
  //     twoRectangles1_5Mock,
  //   ]);
  //   browser.get('/labeling/task/TASKID-TASKID');
  //
  //   coords.autoSetViewerDimensions()
  //     .then(({viewer, viewerDimensions}) => {
  //       browser.actions()
  //         .mouseMove(viewer, coords.toViewer(110, 110)) // initial position
  //         .click()
  //         .perform();
  //       browser.actions()
  //         .mouseMove(viewer, coords.toViewer(300, 150)) // initial position
  //         .click()
  //         .perform();
  //     })
  //     .then(() => canvasInstructionLogManager.getCanvasLogs())
  //     .then(drawingStack => {
  //       expect(drawingStack).toEqualDrawingStack(selectAnOtherRectangleExpectation);
  //       done();
  //     });
  // });
  //
  // it('should correctly move a rectangle on canvas and save the changed coordinates', (done) => {
  //   mock([
  //     userProfileMock,
  //     userPermissionMock,
  //     taskMock,
  //     videoMock,
  //     labelStructureMock,
  //     getTimerMock,
  //     putTimerMock,
  //     sourceJpg1_5Mock,
  //     thumbnail1_5Mock,
  //     sourceJpg1Mock,
  //     labeledThingIncompleteCountMock,
  //
  //     twoRectangles1Mock,
  //     twoRectangles1_5Mock,
  //
  //     movedOneRectangleMock,
  //   ]);
  //   browser.get('/labeling/task/TASKID-TASKID');
  //
  //   coords.autoSetViewerDimensions()
  //     .then(({viewer, viewerDimensions}) => {
  //       browser.actions()
  //         .mouseMove(viewer, coords.toViewer(110, 110)) // initial position
  //         .mouseDown()
  //         .mouseMove(viewer, coords.toViewer(110, 130)) // drag
  //         .mouseUp()
  //         .mouseMove(viewer, coords.toViewer(1, 1)) // click somewhere outside to deselect element
  //         .click()
  //         .perform();
  //     })
  //     .then(() => canvasInstructionLogManager.getCanvasLogs())
  //     .then(drawingStack => {
  //       expect(drawingStack).toEqualDrawingStack(moveOneRectangleExpectation);
  //       browser.sleep(1000);
  //     })
  //     .then(() => getMockRequestsMade(mock))
  //     .then(requests => {
  //       expect(requests).toContain(movedOneRectangleMock.request);
  //       done();
  //     });
  // });
  //
  // // We are currently missing one horizontal pixel here
  // // Might be a sizing bug…
  // xit('should correctly resize a rectangle on canvas and save the changed coordinates', (done) => {
  //   mock([
  //     userProfileMock,
  //     userPermissionMock,
  //     taskMock,
  //     videoMock,
  //     labelStructureMock,
  //     getTimerMock,
  //     putTimerMock,
  //     sourceJpg1_5Mock,
  //     thumbnail1_5Mock,
  //     sourceJpg1Mock,
  //     labeledThingIncompleteCountMock,
  //
  //     twoRectangles1Mock,
  //     twoRectangles1_5Mock,
  //
  //     resizeOneRectangleMock,
  //   ]);
  //   browser.get('/labeling/task/TASKID-TASKID');
  //
  //   coords.autoSetViewerDimensions()
  //     .then(({viewer, viewerDimensions}) => {
  //       browser.actions()
  //         .mouseMove(viewer, coords.toViewer(200, 200)) // bottom right drag handle
  //         .mouseDown()
  //         .mouseMove(viewer, coords.toViewer(300, 300)) // drag
  //         .mouseUp()
  //         .perform();
  //
  //       browser.pause();
  //     })
  //     .then(() => canvasInstructionLogManager.getCanvasLogs())
  //     .then(drawingStack => {
  //       expect(drawingStack).toEqualDrawingStack(resizeOneRectangleExpectation);
  //       browser.sleep(1000);
  //     })
  //     .then(() => getMockRequestsMade(mock))
  //     .then(requests => {
  //       expect(requests).toContain(resizeOneRectangleMock.request);
  //       done();
  //     });
  // });
  //
  // // Something is wrong here with the mocked request data. The second frame seems to have 2 different shapes at the same position
  // // Therefore the selection rendering is off and can't be properly checked.
  // xit('should keep the labeled thing selected over a frame change', (done) => {
  //   mock([
  //     userProfileMock,
  //     userPermissionMock,
  //     taskMock,
  //     videoMock,
  //     labelStructureMock,
  //     getTimerMock,
  //     putTimerMock,
  //     sourceJpg1_5Mock,
  //     thumbnail1_5Mock,
  //     sourceJpg1Mock,
  //     labeledThingIncompleteCountMock,
  //
  //     oneRectangleTwoFrames1Mock,
  //     oneRectangleTwoFrames2Mock,
  //     oneRectangleTwoFrames1_5Mock,
  //     oneRectangleTwoFramesLabeledThing1_5Mock,
  //   ]);
  //
  //   browser.get('/labeling/task/TASKID-TASKID');
  //
  //   const nextFrameButton = element(by.css('.next-frame-button'));
  //
  //   coords.autoSetViewerDimensions()
  //     .then(({viewer, viewerDimensions}) => {
  //       browser.actions()
  //         .mouseMove(viewer, coords.toViewer(110, 110)) // initial position
  //         .click()
  //         .perform();
  //
  //       nextFrameButton.click();
  //
  //       browser.sleep(1000);
  //     })
  //     .then(() => canvasInstructionLogManager.getCanvasLogs())
  //     .then(drawingStack => {
  //       expect(drawingStack).toEqualDrawingStack(keepSelectionOverFrameChangeExpectation);
  //       done();
  //     });
  // });
  //
  // // Needs to be fixed
  // xit('should correctly handle extra information in limited labeledThingInFrame request', (done) => {
  //   mock([
  //     userProfileMock,
  //     userPermissionMock,
  //     taskMock,
  //     videoMock,
  //     labelStructureMock,
  //     getTimerMock,
  //     putTimerMock,
  //     sourceJpg1_5Mock,
  //     thumbnail1_5Mock,
  //     sourceJpg1Mock,
  //     labeledThingIncompleteCountMock,
  //
  //     limitIgnoringLabeledThingInFrameRequestMock1,
  //     limitIgnoringLabeledThingInFrameRequestMock1_5,
  //   ]);
  //   browser.get('/labeling/task/TASKID-TASKID');
  //
  //   canvasInstructionLogManager.getCanvasLogs().then((drawingStack) => {
  //     expect(drawingStack).toEqualDrawingStack(loadOneRectangleExpectation);
  //     done();
  //   });
  // });


  afterEach(() => {
    mock.teardown();
  });
});
