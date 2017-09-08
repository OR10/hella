import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import { expectAllModalsToBeClosed, getMockRequestsMade, initApplication, mock } from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Interpolation Cuboid Tests', () => {
  let assets;
  let sharedMocks;
  let viewer;
  let nextFrameButton;
  let previousFrameButton;
  let interpolateButton;
  let goEndButton;

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`);
    sharedMocks = [
      assets.mocks.Shared.TaskDb,
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Shared.UserOrganisations,
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
      assets.mocks.Interpolation.Shared.TaskCuboid,
      assets.mocks.Interpolation.Shared.VideoCuboid,
      assets.mocks.Interpolation.Cuboid.LabeledThingInFrame.frameIndex0and4,
    ];

    viewer = element(by.css('.layer-container'));
    nextFrameButton = element(by.css('.next-frame-button'));
    previousFrameButton = element(by.css('.previous-frame-button'));
    interpolateButton = element(by.css('#interpolate-shape-button'));
    goEndButton = element(by.css('.icon-selection-goend'));
  });

  it('should interpolate a Cuboid when selecting the start LTIF', done => {
    mock(sharedMocks);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 85, y: 357}) // Cuboid in first frame
          .click()
          .perform();
      })
      .then(() => interpolateButton.click())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationCuboid', 'Frame0')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationCuboid.Frame0);
      })
      .then(() => nextFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationCuboid', 'Frame1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationCuboid.Frame1);
      })
      .then(() => nextFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationCuboid', 'Frame2')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationCuboid.Frame2);
      })
      .then(() => nextFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationCuboid', 'Frame3')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationCuboid.Frame3);
      })
      .then(() => nextFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationCuboid', 'Frame4')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationCuboid.Frame4);
      })
      .then(() => {
        expect(assets.mocks.Interpolation.Cuboid.LabeledThingInFrame.frameIndex0).toExistInPouchDb();
        expect(assets.mocks.Interpolation.Cuboid.LabeledThingInFrame.frameIndex1).toExistInPouchDb();
        expect(assets.mocks.Interpolation.Cuboid.LabeledThingInFrame.frameIndex2).toExistInPouchDb();
        expect(assets.mocks.Interpolation.Cuboid.LabeledThingInFrame.frameIndex3).toExistInPouchDb();
        expect(assets.mocks.Interpolation.Cuboid.LabeledThingInFrame.frameIndex4).toExistInPouchDb();
        done();
      });
  });

  it('should interpolate a Cuboid when selecting the end LTIF', done => {
    mock(sharedMocks);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 85, y: 357}) // Cuboid in first frame
          .click()
          .perform();
      })
      .then(() => goEndButton.click())
      .then(() => browser.sleep(500))
      .then(() => interpolateButton.click())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationCuboid', 'Frame4')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationCuboid.Frame4);
      })
      .then(() => previousFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationCuboid', 'Frame3')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationCuboid.Frame3);
      })
      .then(() => previousFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationCuboid', 'Frame2')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationCuboid.Frame2);
      })
      .then(() => previousFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationCuboid', 'Frame1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationCuboid.Frame1);
      })
      .then(() => previousFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationCuboid', 'Frame0')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationCuboid.Frame0);
      })
      .then(() => {
        expect(assets.mocks.Interpolation.Cuboid.LabeledThingInFrame.frameIndex0).toExistInPouchDb();
        expect(assets.mocks.Interpolation.Cuboid.LabeledThingInFrame.frameIndex1).toExistInPouchDb();
        expect(assets.mocks.Interpolation.Cuboid.LabeledThingInFrame.frameIndex2).toExistInPouchDb();
        expect(assets.mocks.Interpolation.Cuboid.LabeledThingInFrame.frameIndex3).toExistInPouchDb();
        expect(assets.mocks.Interpolation.Cuboid.LabeledThingInFrame.frameIndex4).toExistInPouchDb();
        done();
      });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    mock.teardown();
  });
});
