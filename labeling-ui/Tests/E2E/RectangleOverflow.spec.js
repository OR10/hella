import mock from 'protractor-http-mock';
import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {expectAllModalsToBeClosed, getMockRequestsMade, initApplication} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

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

  it('should restrict overflowing in the top left corner', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleOverflow.Shared.TaskOverflow,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.LabeledThingId1Frame0to3,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.LabeledThingId1Frame0to4,
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
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleOverflow', 'TopLeftOverflow')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleOverflow.TopLeftOverflow);
        getMockRequestsMade(mock).then(requests => {
          expect(requests).toContainRequest(assets.mocks.RectangleOverflow.TopLeft.LabeledThingInFrame.Overflow);
          done();
        });
      });
  });

  it('should restrict overflowing in the bottom right corner', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleOverflow.Shared.TaskOverflow,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.LabeledThingId1Frame0to3,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.LabeledThingId1Frame0to4,
      assets.mocks.RectangleOverflow.BottomRight.LabeledThingInFrame.Overflow,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 110, y: 110}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 1023, y: 619}) // drag
          .mouseUp()
          .perform();

        browser.sleep(1000);
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleOverflow', 'BottomRightOverflow')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleOverflow.BottomRightOverflow);
        getMockRequestsMade(mock).then(requests => {
          expect(requests).toContainRequest(assets.mocks.RectangleOverflow.BottomRight.LabeledThingInFrame.Overflow);
          done();
        });
      });
  });

  it('should not allow overflowing in the top left corner', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleOverflow.Shared.TaskNoOverflow,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.LabeledThingId1Frame0to3,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.LabeledThingId1Frame0to4,
      assets.mocks.RectangleOverflow.TopLeft.LabeledThingInFrame.NoOverflow,
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
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleOverflow', 'TopLeftNoOverflow')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleOverflow.TopLeftNoOverflow);
        getMockRequestsMade(mock).then(requests => {
          expect(requests).toContainRequest(assets.mocks.RectangleOverflow.TopLeft.LabeledThingInFrame.NoOverflow);
          done();
        });
      });
  });

  it('should not allow overflowing in the bottom right corner', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleOverflow.Shared.TaskNoOverflow,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.LabeledThingId1Frame0to3,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.LabeledThingId1Frame0to4,
      assets.mocks.RectangleOverflow.BottomRight.LabeledThingInFrame.NoOverflow,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 110, y: 110}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 1023, y: 619}) // drag
          .mouseUp()
          .perform();

        browser.sleep(1000);
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleOverflow', 'BottomRightNoOverflow')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleOverflow.BottomRightNoOverflow);
        getMockRequestsMade(mock).then(requests => {
          expect(requests).toContainRequest(assets.mocks.RectangleOverflow.BottomRight.LabeledThingInFrame.NoOverflow);
          done();
        });
      });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    mock.teardown();
  });
});
