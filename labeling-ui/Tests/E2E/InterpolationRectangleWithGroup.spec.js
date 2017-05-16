import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import { expectAllModalsToBeClosed, getMockRequestsMade, initApplication, mock} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';
import featureFlags from '../../Application/features.json';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Interpolation RectangleWithGroup Tests', () => {
  if (!featureFlags.pouchdb) {
    pending('These tests only work with activated Pouch');
  }

  let assets;
  let sharedMocks;
  let viewer;
  let groupButton;
  let interpolateButton;
  let nextFrameButton;
  let previousFrameButton;
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
      assets.mocks.Interpolation.RectangleWithGroup.Group.Task,
      assets.mocks.Interpolation.RectangleWithGroup.Group.TaskConfiguration,
      assets.mocks.Interpolation.RectangleWithGroup.Group.TaskConfigurationFile,
      assets.mocks.Interpolation.RectangleWithGroup.LabeledThingInFrame.frameIndex0and4,
    ];

    viewer = element(by.css('.layer-container'));
    groupButton = element(by.css('.tool-button.tool-group'));
    interpolateButton = element(by.css('#interpolate-shape-button'));
    nextFrameButton = element(by.css('.next-frame-button'));
    previousFrameButton = element(by.css('.previous-frame-button'));
    goEndButton = element(by.css('.icon-selection-goend'));
  });

  it('should interpolate a RectangleWithGroup when selecting the start LTIF', done => {

    mock(sharedMocks);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        groupButton.click();
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 80, y: 80}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 500, y: 500}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 150, y: 150}) // RectangleWithGroup in first frame
          .click()
          .perform();
      })
      .then(() => {
        interpolateButton.click();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationRectangleWithGroup', 'Frame0')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationRectangleWithGroup.Frame0);
      })
      .then(() => nextFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationRectangleWithGroup', 'Frame1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationRectangleWithGroup.Frame1);
      })
      .then(() => nextFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationRectangleWithGroup', 'Frame2')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationRectangleWithGroup.Frame2);
      })
      .then(() => nextFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationRectangleWithGroup', 'Frame3')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationRectangleWithGroup.Frame3);
      })
      .then(() => nextFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationRectangleWithGroup', 'Frame4')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationRectangleWithGroup.Frame4);
      })
      // .then(() => dumpAllRequestsMade(mock))
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.Interpolation.RectangleWithGroup.LabeledThingInFrame.frameIndex0);
        expect(requests).toContainNamedParamsRequest(assets.mocks.Interpolation.RectangleWithGroup.LabeledThingInFrame.frameIndex1);
        expect(requests).toContainNamedParamsRequest(assets.mocks.Interpolation.RectangleWithGroup.LabeledThingInFrame.frameIndex2);
        expect(requests).toContainNamedParamsRequest(assets.mocks.Interpolation.RectangleWithGroup.LabeledThingInFrame.frameIndex3);
        expect(requests).toContainNamedParamsRequest(assets.mocks.Interpolation.RectangleWithGroup.LabeledThingInFrame.frameIndex4);
        done();
      });
  });

  it('should interpolate a RectangleWithGroup when selecting the end LTIF', done => {

    mock(sharedMocks);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        const groupButton = element(by.css('.tool-button.tool-group'));
        groupButton.click();
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 80, y: 80}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 500, y: 500}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 150, y: 150}) // RectangleWithGroup in first frame
          .click()
          .perform();
      })
      .then(() => {
        goEndButton.click();
      })
      .then(() => browser.sleep(500))
      .then(() => {
        interpolateButton.click();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationRectangleWithGroup', 'Frame4')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationRectangleWithGroup.Frame4);
      })
      .then(() => previousFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationRectangleWithGroup', 'Frame3')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationRectangleWithGroup.Frame3);
      })
      .then(() => previousFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationRectangleWithGroup', 'Frame2')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationRectangleWithGroup.Frame2);
      })
      .then(() => previousFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationRectangleWithGroup', 'Frame1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationRectangleWithGroup.Frame1);
      })
      .then(() => previousFrameButton.click())
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('InterpolationRectangleWithGroup', 'Frame0Backwards')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.InterpolationRectangleWithGroup.Frame0Backwards);
      })
      // .then(() => dumpAllRequestsMade(mock))
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.Interpolation.RectangleWithGroup.LabeledThingInFrame.frameIndex0);
        expect(requests).toContainNamedParamsRequest(assets.mocks.Interpolation.RectangleWithGroup.LabeledThingInFrame.frameIndex1);
        expect(requests).toContainNamedParamsRequest(assets.mocks.Interpolation.RectangleWithGroup.LabeledThingInFrame.frameIndex2);
        expect(requests).toContainNamedParamsRequest(assets.mocks.Interpolation.RectangleWithGroup.LabeledThingInFrame.frameIndex3);
        expect(requests).toContainNamedParamsRequest(assets.mocks.Interpolation.RectangleWithGroup.LabeledThingInFrame.frameIndex4);
        done();
      });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    mock.teardown();
  });
});
