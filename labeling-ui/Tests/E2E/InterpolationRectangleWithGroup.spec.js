import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {
  expectAllModalsToBeClosed,
  initApplication,
  bootstrapHttp,
  bootstrapPouch,
  mediumSleep,
  longSleep,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Rectangle With Group Interpolation', () => {
  let assets;
  let viewer;
  let groupButton;
  let interpolateButton;
  let nextFrameButton;
  let previousFrameButton;
  let goEndButton;

  beforeEach(() => {
    assets = new AssetHelper(
      `${__dirname}/../Fixtures`,
      `${__dirname}/../ProtractorMocks`,
      `${__dirname}/../PouchDbDocuments`
    );
    bootstrapHttp([
      assets.mocks.Shared.TaskDb,
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Shared.UserOrganisations,
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
      assets.mocks.Interpolation.RectangleWithGroup.Group.Task,
      assets.mocks.Interpolation.RectangleWithGroup.Group.TaskConfiguration,
      assets.mocks.Interpolation.RectangleWithGroup.Group.TaskConfigurationFile,
    ]);

    bootstrapPouch([
      assets.documents.Interpolation.RectangleWithGroup.LabeledThingInFrame.frameIndex0and4,
    ]);

    viewer = element(by.css('.layer-container'));
    groupButton = element(by.css('.tool-button.tool-group'));
    interpolateButton = element(by.css('#interpolate-shape-button'));
    nextFrameButton = element(by.css('.next-frame-button'));
    previousFrameButton = element(by.css('.previous-frame-button'));
    goEndButton = element(by.css('.icon-selection-goend'));
  });

  it('should interpolate a RectangleWithGroup when selecting the start LTIF', done => {
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => groupButton.click())
      .then(() => mediumSleep())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 80, y: 80}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 500, y: 500}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 150, y: 150}) // RectangleWithGroup in first frame
          .click()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => interpolateButton.click())
      .then(() => longSleep())
      .then(() => {
        expect(assets.mocks.Interpolation.RectangleWithGroup.StoreLabeledThingInFrame.frameIndex0).toExistInPouchDb();
        expect(assets.mocks.Interpolation.RectangleWithGroup.StoreLabeledThingInFrame.frameIndex1).toExistInPouchDb();
        expect(assets.mocks.Interpolation.RectangleWithGroup.StoreLabeledThingInFrame.frameIndex2).toExistInPouchDb();
        expect(assets.mocks.Interpolation.RectangleWithGroup.StoreLabeledThingInFrame.frameIndex3).toExistInPouchDb();
        expect(assets.mocks.Interpolation.RectangleWithGroup.StoreLabeledThingInFrame.frameIndex4).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationRectangleWithGroup', 'Frame0')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationRectangleWithGroup.Frame0);
      })
      .then(() => nextFrameButton.click())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationRectangleWithGroup', 'Frame1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationRectangleWithGroup.Frame1);
      })
      .then(() => nextFrameButton.click())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationRectangleWithGroup', 'Frame2')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationRectangleWithGroup.Frame2);
      })
      .then(() => nextFrameButton.click())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationRectangleWithGroup', 'Frame3')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationRectangleWithGroup.Frame3);
      })
      .then(() => nextFrameButton.click())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationRectangleWithGroup', 'Frame4')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationRectangleWithGroup.Frame4);
      })
      .then(() => done());
  });

  it('should interpolate a RectangleWithGroup when selecting the end LTIF', done => {
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => groupButton.click())
      .then(() => mediumSleep())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 80, y: 80}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 500, y: 500}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 150, y: 150}) // RectangleWithGroup in first frame
          .click()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => goEndButton.click())
      .then(() => mediumSleep())
      .then(() => interpolateButton.click())
      .then(() => longSleep())
      .then(() => {
        expect(assets.mocks.Interpolation.RectangleWithGroup.StoreLabeledThingInFrame.frameIndex0).toExistInPouchDb();
        expect(assets.mocks.Interpolation.RectangleWithGroup.StoreLabeledThingInFrame.frameIndex1).toExistInPouchDb();
        expect(assets.mocks.Interpolation.RectangleWithGroup.StoreLabeledThingInFrame.frameIndex2).toExistInPouchDb();
        expect(assets.mocks.Interpolation.RectangleWithGroup.StoreLabeledThingInFrame.frameIndex3).toExistInPouchDb();
        expect(assets.mocks.Interpolation.RectangleWithGroup.StoreLabeledThingInFrame.frameIndex4).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationRectangleWithGroup', 'Frame4')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationRectangleWithGroup.Frame4);
      })
      .then(() => previousFrameButton.click())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationRectangleWithGroup', 'Frame3')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationRectangleWithGroup.Frame3);
      })
      .then(() => previousFrameButton.click())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationRectangleWithGroup', 'Frame2')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationRectangleWithGroup.Frame2);
      })
      .then(() => previousFrameButton.click())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationRectangleWithGroup', 'Frame1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationRectangleWithGroup.Frame1);
      })
      .then(() => previousFrameButton.click())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationRectangleWithGroup', 'Frame0Backwards')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationRectangleWithGroup.Frame0Backwards);
      })
      .then(() => done());
  });

  it('should interpolate both rectangles within a RectangleWithGroup when selecting the start LTIF', done => {
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => groupButton.click())
      .then(() => mediumSleep())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 80, y: 80}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 500, y: 500}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 150, y: 150}) // First RectangleWithGroup in first frame
          .click()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => interpolateButton.click())
      .then(() => longSleep())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 350, y: 150}) // Second RectangleWithGroup in first frame
          .click()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => interpolateButton.click())
      .then(() => longSleep())
      .then(() => {
        expect(assets.mocks.Interpolation.RectangleWithGroup.StoreLabeledThingInFrame.frameIndex0).toExistInPouchDb();
        expect(assets.mocks.Interpolation.RectangleWithGroup.StoreLabeledThingInFrame.frameIndex1).toExistInPouchDb();
        expect(assets.mocks.Interpolation.RectangleWithGroup.StoreLabeledThingInFrame.frameIndex2).toExistInPouchDb();
        expect(assets.mocks.Interpolation.RectangleWithGroup.StoreLabeledThingInFrame.frameIndex3).toExistInPouchDb();
        expect(assets.mocks.Interpolation.RectangleWithGroup.StoreLabeledThingInFrame.frameIndex4).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationRectangleWithGroup', 'Frame0BothInterpolated')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationRectangleWithGroup.Frame0BothInterpolated);
      })
      .then(() => nextFrameButton.click())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationRectangleWithGroup', 'Frame1BothInterpolated')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationRectangleWithGroup.Frame1BothInterpolated);
      })
      .then(() => nextFrameButton.click())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationRectangleWithGroup', 'Frame2BothInterpolated')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationRectangleWithGroup.Frame2BothInterpolated);
      })
      .then(() => nextFrameButton.click())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationRectangleWithGroup', 'Frame3BothInterpolated')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationRectangleWithGroup.Frame3BothInterpolated);
      })
      .then(() => nextFrameButton.click())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationRectangleWithGroup', 'Frame4BothInterpolated')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationRectangleWithGroup.Frame4BothInterpolated);
      })
      .then(() => done());
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    bootstrapHttp.teardown();
    bootstrapPouch.teardown();
  });
});
