import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import { expectAllModalsToBeClosed, getMockRequestsMade, initApplication, mock} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';
import featureFlags from '../../Application/features.json';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Interpolation Point Tests', () => {
  if (!featureFlags.pouchdb) {
    pending('These tests only work with activated Pouch');
  }

  let assets;
  let sharedMocks;
  let viewer;

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
      assets.mocks.Interpolation.Point.LabeledThingInFrame.frameIndex0and4,
    ];

    viewer = element(by.css('.layer-container'));
  });

  it('should interpolate a Point when selecting the start LTIF', done => {
    let nextFrameButton;

    mock(sharedMocks);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        nextFrameButton = element(by.css('.next-frame-button'));

        browser.actions()
          .mouseMove(viewer, {x: 200, y: 100}) // Point in first frame
          .click()
          .perform();
      })
      .then(() => {
        const interpolateButton = element(by.css('#interpolate-shape-button'));
        interpolateButton.click();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPoint', 'Frame0')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPoint.Frame0);
      })
      .then(() => nextFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPoint', 'Frame1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPoint.Frame1);
      })
      .then(() => nextFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPoint', 'Frame2')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPoint.Frame2);
      })
      .then(() => nextFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPoint', 'Frame3')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPoint.Frame3);
      })
      .then(() => nextFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPoint', 'Frame4')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPoint.Frame4);
      })
      // .then(() => dumpAllRequestsMade(mock))
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.Interpolation.Point.LabeledThingInFrame.frameIndex0);
        expect(requests).toContainNamedParamsRequest(assets.mocks.Interpolation.Point.LabeledThingInFrame.frameIndex1);
        expect(requests).toContainNamedParamsRequest(assets.mocks.Interpolation.Point.LabeledThingInFrame.frameIndex2);
        expect(requests).toContainNamedParamsRequest(assets.mocks.Interpolation.Point.LabeledThingInFrame.frameIndex3);
        expect(requests).toContainNamedParamsRequest(assets.mocks.Interpolation.Point.LabeledThingInFrame.frameIndex4);
        done();
      });
  });

  it('should interpolate a Point when selecting the end LTIF', done => {
    let previousFrameButton;

    mock(sharedMocks);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        previousFrameButton = element(by.css('.previous-frame-button'));

        browser.actions()
          .mouseMove(viewer, {x: 200, y: 100}) // Point in first frame
          .click()
          .perform();
      })
      .then(() => {
        const goEnd = element(by.css('.icon-selection-goend'));
        goEnd.click();
      })
      .then(() => browser.sleep(500))
      .then(() => {
        const interpolateButton = element(by.css('#interpolate-shape-button'));
        interpolateButton.click();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPoint', 'Frame4')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPoint.Frame4);
      })
      .then(() => previousFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPoint', 'Frame3')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPoint.Frame3);
      })
      .then(() => previousFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPoint', 'Frame2')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPoint.Frame2);
      })
      .then(() => previousFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPoint', 'Frame1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPoint.Frame1);
      })
      .then(() => previousFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationPoint', 'Frame0')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationPoint.Frame0);
      })
      // .then(() => dumpAllRequestsMade(mock))
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.Interpolation.Point.LabeledThingInFrame.frameIndex0);
        expect(requests).toContainNamedParamsRequest(assets.mocks.Interpolation.Point.LabeledThingInFrame.frameIndex1);
        expect(requests).toContainNamedParamsRequest(assets.mocks.Interpolation.Point.LabeledThingInFrame.frameIndex2);
        expect(requests).toContainNamedParamsRequest(assets.mocks.Interpolation.Point.LabeledThingInFrame.frameIndex3);
        expect(requests).toContainNamedParamsRequest(assets.mocks.Interpolation.Point.LabeledThingInFrame.frameIndex4);
        done();
      });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    mock.teardown();
  });
});
