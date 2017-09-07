import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import { expectAllModalsToBeClosed, expectModalToBePresent, getMockRequestsMade, initApplication, mock } from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Interpolation Polyline Tests', () => {
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
      assets.mocks.Interpolation.Polyline.LabeledThingInFrame.frameIndex0and4,
    ];

    viewer = element(by.css('.layer-container'));
    nextFrameButton = element(by.css('.next-frame-button'));
    previousFrameButton = element(by.css('.previous-frame-button'));
    interpolateButton = element(by.css('#interpolate-shape-button'));
    goEndButton = element(by.css('.icon-selection-goend'));
  });

  it('should interpolate a Polyline when selecting the start LTIF', done => {
    mock(sharedMocks);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 200, y: 100}) // Polyline in first frame
          .click()
          .perform();
      })
      .then(() => interpolateButton.click())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPolyline', 'Frame0')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPolyline.Frame0);
      })
      .then(() => nextFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPolyline', 'Frame1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPolyline.Frame1);
      })
      .then(() => nextFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPolyline', 'Frame2')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPolyline.Frame2);
      })
      .then(() => nextFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPolyline', 'Frame3')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPolyline.Frame3);
      })
      .then(() => nextFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPolyline', 'Frame4')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPolyline.Frame4);
      })
      // .then(() => dumpAllRequestsMade(mock))
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.Interpolation.Polyline.LabeledThingInFrame.frameIndex0);
        expect(requests).toContainNamedParamsRequest(assets.mocks.Interpolation.Polyline.LabeledThingInFrame.frameIndex1);
        expect(requests).toContainNamedParamsRequest(assets.mocks.Interpolation.Polyline.LabeledThingInFrame.frameIndex2);
        expect(requests).toContainNamedParamsRequest(assets.mocks.Interpolation.Polyline.LabeledThingInFrame.frameIndex3);
        expect(requests).toContainNamedParamsRequest(assets.mocks.Interpolation.Polyline.LabeledThingInFrame.frameIndex4);
        done();
      });
  });

  it('should interpolate a Polyline when selecting the end LTIF', done => {
    mock(sharedMocks);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 200, y: 100}) // Polyline in first frame
          .click()
          .perform();
      })
      .then(() => goEndButton.click())
      .then(() => browser.sleep(500))
      .then(() => interpolateButton.click())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPolyline', 'Frame4')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPolyline.Frame4);
      })
      .then(() => previousFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPolyline', 'Frame3')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPolyline.Frame3);
      })
      .then(() => previousFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPolyline', 'Frame2')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPolyline.Frame2);
      })
      .then(() => previousFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPolyline', 'Frame1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPolyline.Frame1);
      })
      .then(() => previousFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPolyline', 'Frame0')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPolyline.Frame0);
      })
      // .then(() => dumpAllRequestsMade(mock))
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.Interpolation.Polyline.LabeledThingInFrame.frameIndex0);
        expect(requests).toContainNamedParamsRequest(assets.mocks.Interpolation.Polyline.LabeledThingInFrame.frameIndex1);
        expect(requests).toContainNamedParamsRequest(assets.mocks.Interpolation.Polyline.LabeledThingInFrame.frameIndex2);
        expect(requests).toContainNamedParamsRequest(assets.mocks.Interpolation.Polyline.LabeledThingInFrame.frameIndex3);
        expect(requests).toContainNamedParamsRequest(assets.mocks.Interpolation.Polyline.LabeledThingInFrame.frameIndex4);
        done();
      });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    mock.teardown();
  });
});

describe('Interpolation Polyline Tests Modal', () => {
  let assets;
  let sharedMocks;
  let viewer;
  let interpolateButton;

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`);
    sharedMocks = [
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
      assets.mocks.Interpolation.Polygon.LabeledThingInFrame.frameIndex0and4WithDifferentVertexCount,
    ];
    viewer = element(by.css('.layer-container'));
    interpolateButton = element(by.css('#interpolate-shape-button'));
  });

  it('should show a modal if the vertex count of shapes in different', done => {
    mock(sharedMocks);

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

  afterEach(() => {
    mock.teardown();
  });
});
