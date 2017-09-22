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

describe('Interpolation Point Tests', () => {
  let assets;
  let viewer;
  let nextFrameButton;
  let previousFrameButton;
  let interpolateButton;
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
      assets.mocks.Interpolation.Shared.Task,
    ]);

    bootstrapPouch([
      assets.documents.Interpolation.Point.LabeledThingInFrame.frameIndex0and4,
    ]);

    viewer = element(by.css('.layer-container'));
    nextFrameButton = element(by.css('.next-frame-button'));
    previousFrameButton = element(by.css('.previous-frame-button'));
    interpolateButton = element(by.css('#interpolate-shape-button'));
    goEndButton = element(by.css('.icon-selection-goend'));
  });

  it('should interpolate a Point when selecting the start LTIF', done => {
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 200, y: 100}) // Point in first frame
          .click()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => interpolateButton.click())
      .then(() => longSleep())
      .then(() => {
        expect(assets.mocks.Interpolation.Point.StoreLabeledThingInFrame.frameIndex0).toExistInPouchDb();
        expect(assets.mocks.Interpolation.Point.StoreLabeledThingInFrame.frameIndex1).toExistInPouchDb();
        expect(assets.mocks.Interpolation.Point.StoreLabeledThingInFrame.frameIndex2).toExistInPouchDb();
        expect(assets.mocks.Interpolation.Point.StoreLabeledThingInFrame.frameIndex3).toExistInPouchDb();
        expect(assets.mocks.Interpolation.Point.StoreLabeledThingInFrame.frameIndex4).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPoint', 'Frame0')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPoint.Frame0);
      })
      .then(() => nextFrameButton.click())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPoint', 'Frame1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPoint.Frame1);
      })
      .then(() => nextFrameButton.click())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPoint', 'Frame2')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPoint.Frame2);
      })
      .then(() => nextFrameButton.click())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPoint', 'Frame3')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPoint.Frame3);
      })
      .then(() => nextFrameButton.click())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPoint', 'Frame4')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPoint.Frame4);
      })
      .then(() => done());
  });

  it('should interpolate a Point when selecting the end LTIF', done => {
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 200, y: 100}) // Point in first frame
          .click()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => goEndButton.click())
      .then(() => mediumSleep())
      .then(() => interpolateButton.click())
      .then(() => longSleep())
      .then(() => {
        expect(assets.mocks.Interpolation.Point.StoreLabeledThingInFrame.frameIndex0).toExistInPouchDb();
        expect(assets.mocks.Interpolation.Point.StoreLabeledThingInFrame.frameIndex1).toExistInPouchDb();
        expect(assets.mocks.Interpolation.Point.StoreLabeledThingInFrame.frameIndex2).toExistInPouchDb();
        expect(assets.mocks.Interpolation.Point.StoreLabeledThingInFrame.frameIndex3).toExistInPouchDb();
        expect(assets.mocks.Interpolation.Point.StoreLabeledThingInFrame.frameIndex4).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPoint', 'Frame4')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPoint.Frame4);
      })
      .then(() => previousFrameButton.click())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPoint', 'Frame3')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPoint.Frame3);
      })
      .then(() => previousFrameButton.click())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPoint', 'Frame2')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPoint.Frame2);
      })
      .then(() => previousFrameButton.click())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPoint', 'Frame1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPoint.Frame1);
      })
      .then(() => previousFrameButton.click())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPoint', 'Frame0')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPoint.Frame0);
      })
      .then(() => done());
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    bootstrapHttp.teardown();
    bootstrapPouch.teardown();
  });
});
