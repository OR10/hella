import mock from 'protractor-http-mock';
import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {expectAllModalsToBeClosed, getMockRequestsMade, initApplication} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Rectangle viewer overflow', () => {
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
      assets.mocks.Shared.Thumbnails.rectangleLabeledThingsInFrame0to3,
      assets.mocks.Shared.Thumbnails.rectangleLabeledThingsInFrame0to4,
      assets.mocks.Shared.EmptyLabeledThingGroupInFrame,
    ];

    viewer = element(by.css('.layer-container'));
  });

  it('should allow overflowing of a rectangle in the top-left corner', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleOverflow.Shared.TaskOverflow,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.LabeledThingId1Frame0to3,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.LabeledThingId1Frame0to4,
      assets.mocks.RectangleOverflow.TopLeft.LabeledThingInFrame.Overflow,
    ]));

    initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => browser.actions()
        .mouseMove(viewer, {x: 190, y: 190}) // initial position
        .mouseDown()
        .mouseMove(viewer, {x: 2, y: 2}) // drag
        .mouseUp()
        .perform()
      )
      .then(() => browser.sleep(1000))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleOverflow', 'TopLeftOverflow')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleOverflow.TopLeftOverflow);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainRequest(assets.mocks.RectangleOverflow.TopLeft.LabeledThingInFrame.Overflow);
        done();
      });
  });

  it('should allow overflowing of a rectangle in the bottom-right corner', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleOverflow.Shared.TaskOverflow,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.LabeledThingId1Frame0to3,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.LabeledThingId1Frame0to4,
      assets.mocks.RectangleOverflow.BottomRight.LabeledThingInFrame.Overflow,
    ]));

    initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => browser.actions()
        .mouseMove(viewer, {x: 110, y: 110}) // initial position
        .mouseDown()
        .mouseMove(viewer, {x: 1023, y: 619}) // drag
        .mouseUp()
        .perform()
      )
      .then(() => browser.sleep(1000))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleOverflow', 'BottomRightOverflow')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleOverflow.BottomRightOverflow);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainRequest(assets.mocks.RectangleOverflow.BottomRight.LabeledThingInFrame.Overflow);
        done();
      });
  });

  it('should restrict overflowing of a rectangle in the top left corner', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleOverflow.Shared.TaskNoOverflow,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.LabeledThingId1Frame0to3,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.LabeledThingId1Frame0to4,
      assets.mocks.RectangleOverflow.TopLeft.LabeledThingInFrame.NoOverflow,
    ]));

    initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => browser.actions()
        .mouseMove(viewer, {x: 190, y: 190}) // initial position
        .mouseDown()
        .mouseMove(viewer, {x: 2, y: 2}) // drag
        .mouseUp()
        .perform()
      )
      .then(() => browser.sleep(1000))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleOverflow', 'TopLeftNoOverflow')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleOverflow.TopLeftNoOverflow);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainRequest(assets.mocks.RectangleOverflow.TopLeft.LabeledThingInFrame.NoOverflow);
        done();
      });
  });

  it('should restrict overflowing of a rectangle in the bottom right corner', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleOverflow.Shared.TaskNoOverflow,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.LabeledThingId1Frame0to3,
      assets.mocks.RectangleOverflow.Shared.LabeledThingInFrame.LabeledThingId1Frame0to4,
      assets.mocks.RectangleOverflow.BottomRight.LabeledThingInFrame.NoOverflow,
    ]));

    initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
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

  it('should should correctly enforce shape overflows (bottom) (TTANNO-1324)', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleOverflow.Shared.TaskNoOverflow,
      assets.mocks.RectangleOverflow.WideBottom.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleOverflow.WideBottom.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.RectangleOverflow.WideBottom.LabeledThingInFrame.LabeledThingId1Frame0to3,
      assets.mocks.RectangleOverflow.WideBottom.LabeledThingInFrame.LabeledThingId1Frame0to4,
      assets.mocks.RectangleOverflow.WideBottom.LabeledThingInFrame.NoOverflow,
    ]));

    initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 50, y: 15}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 50, y: 605}) // drag
          .mouseUp()
          .perform();

        return browser.sleep(200);
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleOverflow', 'WideBottomNoOverflow')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleOverflow.WideBottomNoOverflow);
        getMockRequestsMade(mock).then(requests => {
          expect(requests).toContainRequest(assets.mocks.RectangleOverflow.WideBottom.LabeledThingInFrame.NoOverflow);
          done();
        });
      });
  });

  it('should should correctly enforce shape overflows (top) (TTANNO-1324)', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleOverflow.Shared.TaskNoOverflow,
      assets.mocks.RectangleOverflow.WideTop.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleOverflow.WideTop.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.RectangleOverflow.WideTop.LabeledThingInFrame.LabeledThingId1Frame0to3,
      assets.mocks.RectangleOverflow.WideTop.LabeledThingInFrame.LabeledThingId1Frame0to4,
      assets.mocks.RectangleOverflow.WideTop.LabeledThingInFrame.NoOverflow,
    ]));

    initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 50, y: 605})
          .mouseDown()
          .mouseMove(viewer, {x: 50, y: 15})
          .mouseUp()
          .perform();

        return browser.sleep(200);
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleOverflow', 'WideTopNoOverflow')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleOverflow.WideTopNoOverflow);
        getMockRequestsMade(mock).then(requests => {
          expect(requests).toContainRequest(assets.mocks.RectangleOverflow.WideTop.LabeledThingInFrame.NoOverflow);
          done();
        });
      });
  });

  it('should should correctly enforce shape overflows (left) (TTANNO-1324)', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleOverflow.Shared.TaskNoOverflow,
      assets.mocks.RectangleOverflow.TallLeft.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleOverflow.TallLeft.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.RectangleOverflow.TallLeft.LabeledThingInFrame.LabeledThingId1Frame0to3,
      assets.mocks.RectangleOverflow.TallLeft.LabeledThingInFrame.LabeledThingId1Frame0to4,
      assets.mocks.RectangleOverflow.TallLeft.LabeledThingInFrame.NoOverflow,
    ]));

    initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 15, y: 50})
          .mouseDown()
          .mouseMove(viewer, {x: 1015, y: 50})
          .mouseUp()
          .perform();

        return browser.sleep(200);
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleOverflow', 'TallLeftNoOverflow')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleOverflow.TallLeftNoOverflow);
        getMockRequestsMade(mock).then(requests => {
          expect(requests).toContainRequest(assets.mocks.RectangleOverflow.TallLeft.LabeledThingInFrame.NoOverflow);
          done();
        });
      });
  });

  it('should should correctly enforce shape overflows (right) (TTANNO-1324)', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleOverflow.Shared.TaskNoOverflow,
      assets.mocks.RectangleOverflow.TallRight.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleOverflow.TallRight.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.RectangleOverflow.TallRight.LabeledThingInFrame.LabeledThingId1Frame0to3,
      assets.mocks.RectangleOverflow.TallRight.LabeledThingInFrame.LabeledThingId1Frame0to4,
      assets.mocks.RectangleOverflow.TallRight.LabeledThingInFrame.NoOverflow,
    ]));

    initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 1015, y: 50})
          .mouseDown()
          .mouseMove(viewer, {x: 15, y: 50})
          .mouseUp()
          .perform();

        return browser.sleep(200);
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('RectangleOverflow', 'TallRightNoOverflow')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.RectangleOverflow.TallRightNoOverflow);
        getMockRequestsMade(mock).then(requests => {
          expect(requests).toContainRequest(assets.mocks.RectangleOverflow.TallRight.LabeledThingInFrame.NoOverflow);
          done();
        });
      });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    mock.teardown();
  });
});
