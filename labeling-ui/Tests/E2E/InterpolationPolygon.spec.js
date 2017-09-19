import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {
  expectAllModalsToBeClosed,
  expectModalToBePresent,
  initApplication,
  bootstrapHttp,
  bootstrapPouch,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Interpolation Polygon Tests', () => {
  let assets;
  let viewer;
  let nextFrameButton;
  let previousFrameButton;
  let interpolateButton;
  let goEndButton;

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`, `${__dirname}/../PouchDbDocuments`);
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

    viewer = element(by.css('.layer-container'));
    nextFrameButton = element(by.css('.next-frame-button'));
    previousFrameButton = element(by.css('.previous-frame-button'));
    interpolateButton = element(by.css('#interpolate-shape-button'));
    goEndButton = element(by.css('.icon-selection-goend'));
  });

  describe('All modals closed', () => {
    afterEach(() => {
      expectAllModalsToBeClosed();
    });

    it('should interpolate a Polygon when selecting the start LTIF', done => {
      bootstrapPouch([
        assets.documents.Interpolation.Polygon.LabeledThingInFrame.frameIndex0and4,
      ]);

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 200, y: 100}) // Polygon in first frame
            .click()
            .perform();
        })
        .then(() => interpolateButton.click())
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPolygon', 'Frame0')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPolygon.Frame0);
        })
        .then(() => nextFrameButton.click())
        .then(() => browser.sleep(500))
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPolygon', 'Frame1')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPolygon.Frame1);
        })
        .then(() => nextFrameButton.click())
        .then(() => browser.sleep(500))
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPolygon', 'Frame2')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPolygon.Frame2);
        })
        .then(() => nextFrameButton.click())
        .then(() => browser.sleep(500))
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPolygon', 'Frame3')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPolygon.Frame3);
        })
        .then(() => nextFrameButton.click())
        .then(() => browser.sleep(500))
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPolygon', 'Frame4')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPolygon.Frame4);
        })
        .then(() => {
          expect(assets.mocks.Interpolation.Polygon.StoreLabeledThingInFrame.frameIndex0).toExistInPouchDb();
          expect(assets.mocks.Interpolation.Polygon.StoreLabeledThingInFrame.frameIndex1).toExistInPouchDb();
          expect(assets.mocks.Interpolation.Polygon.StoreLabeledThingInFrame.frameIndex2).toExistInPouchDb();
          expect(assets.mocks.Interpolation.Polygon.StoreLabeledThingInFrame.frameIndex3).toExistInPouchDb();
          expect(assets.mocks.Interpolation.Polygon.StoreLabeledThingInFrame.frameIndex4).toExistInPouchDb();
          done();
        });
    });

    it('should interpolate a Polygon when selecting the end LTIF', done => {
      bootstrapPouch([
        assets.documents.Interpolation.Polygon.LabeledThingInFrame.frameIndex0and4,
      ]);

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 200, y: 100}) // Polygon in first frame
            .click()
            .perform();
        })
        .then(() => goEndButton.click())
        .then(() => browser.sleep(500))
        .then(() => interpolateButton.click())
        .then(() => browser.sleep(500))
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPolygon', 'Frame4')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPolygon.Frame4);
        })
        .then(() => previousFrameButton.click())
        .then(() => browser.sleep(500))
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPolygon', 'Frame3')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPolygon.Frame3);
        })
        .then(() => previousFrameButton.click())
        .then(() => browser.sleep(500))
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPolygon', 'Frame2')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPolygon.Frame2);
        })
        .then(() => previousFrameButton.click())
        .then(() => browser.sleep(500))
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPolygon', 'Frame1')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPolygon.Frame1);
        })
        .then(() => previousFrameButton.click())
        .then(() => browser.sleep(500))
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPolygon', 'Frame0')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPolygon.Frame0);
        })
        .then(() => {
          expect(assets.mocks.Interpolation.Polygon.StoreLabeledThingInFrame.frameIndex0).toExistInPouchDb();
          expect(assets.mocks.Interpolation.Polygon.StoreLabeledThingInFrame.frameIndex1).toExistInPouchDb();
          expect(assets.mocks.Interpolation.Polygon.StoreLabeledThingInFrame.frameIndex2).toExistInPouchDb();
          expect(assets.mocks.Interpolation.Polygon.StoreLabeledThingInFrame.frameIndex3).toExistInPouchDb();
          expect(assets.mocks.Interpolation.Polygon.StoreLabeledThingInFrame.frameIndex4).toExistInPouchDb();
          done();
        });
    });
  });

  describe('Modal', () => {
    it('should show a modal if the vertex count of shapes in different', done => {
      bootstrapPouch([
        assets.documents.Interpolation.Polygon.LabeledThingInFrame.frameIndex0and4WithDifferentVertexCount,
      ]);

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 200, y: 100}) // Polygon in first frame
            .click()
            .perform();
        })
        .then(() => interpolateButton.click())
        .then(() => {
          expectModalToBePresent();
          done();
        });
    });
  });

  afterEach(() => {
    bootstrapHttp.teardown();
    bootstrapPouch.teardown();
  });
});
