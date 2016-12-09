import mock from 'protractor-http-mock';
import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {expectAllModalsToBeClosed, getMockRequestsMade, initApplication} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Multiple Things', () => {
  let assets;
  let sharedMocks;
  let viewer;

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`);
    sharedMocks = [
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.MultipleThings.Shared.Task,
      assets.mocks.MultipleThings.Shared.Video,
      assets.mocks.MultipleThings.Shared.TaskConfiguration,
      assets.mocks.MultipleThings.Shared.TaskConfigurationFile,
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

  it('it should display multiple different things', done => {
    mock(sharedMocks.concat([
      assets.mocks.MultipleThings.Display.LabeledThingInFrame.frameIndex0,
      assets.mocks.MultipleThings.Display.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MultipleThings', 'DisplayMultipleDifferentThings')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MultipleThings.DisplayMultipleDifferentThings);
        done();
      });
  });

  it('it should select multiple different things', done => {
    mock(sharedMocks.concat([
      assets.mocks.MultipleThings.Display.LabeledThingInFrame.frameIndex0,
      assets.mocks.MultipleThings.Display.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.MultipleThings.Display.LabeledThingInFrame.getLabeledThingInFrame1,
      assets.mocks.MultipleThings.Display.LabeledThingInFrame.getLabeledThingInFrame2,
      assets.mocks.MultipleThings.Display.LabeledThingInFrame.getLabeledThingInFrame3,
      assets.mocks.MultipleThings.Display.LabeledThingInFrame.getLabeledThingInFrame4,
    ]));

    initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MultipleThings', 'SelectMultipleDifferentThings1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MultipleThings.SelectMultipleDifferentThings1);
        browser.sleep(200);
      })
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 150, y: 350})
          .click()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MultipleThings', 'SelectMultipleDifferentThings2')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MultipleThings.SelectMultipleDifferentThings2);
        browser.sleep(200);
      })
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 350, y: 350})
          .click()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MultipleThings', 'SelectMultipleDifferentThings3')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MultipleThings.SelectMultipleDifferentThings3);
        browser.sleep(200);
      })
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 700, y: 350})
          .click()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MultipleThings', 'SelectMultipleDifferentThings4')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MultipleThings.SelectMultipleDifferentThings4);
        browser.sleep(200);
      })
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 950, y: 350})
          .click()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MultipleThings', 'SelectMultipleDifferentThings5')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MultipleThings.SelectMultipleDifferentThings5);
        done();
      });
  });

  it('it should draw multiple different things', done => {
    const toolButton0 = element(by.css('button.tool-button.tool-0'));
    const toolButton1 = element(by.css('button.tool-button.tool-1'));
    const toolButton2 = element(by.css('button.tool-button.tool-2'));
    const toolButton3 = element(by.css('button.tool-button.tool-3'));
    mock(sharedMocks.concat([
      assets.mocks.MultipleThings.Draw.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.MultipleThings.Draw.LabeledThingInFrame.Empty.frameIndex0to4,
      assets.mocks.MultipleThings.Draw.StoreLabeledThing,
      assets.mocks.MultipleThings.Draw.StoreLabeledThingInFrameRect1,
      assets.mocks.MultipleThings.Draw.StoreLabeledThingInFrameRect2,
      assets.mocks.MultipleThings.Draw.StoreLabeledThingInFramePedestrian,
      assets.mocks.MultipleThings.Draw.StoreLabeledThingInFrameCuboid,
      assets.mocks.MultipleThings.Draw.StoreLabeledThingInFrameCuboid,
      assets.mocks.MultipleThings.Shared.SingleLabeledThingInFrame,
    ]));

    initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MultipleThings', 'SelectMultipleDifferentThings1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(() => {
        browser.actions()
          .click(toolButton0) // Rect drawing
          .perform();
        browser.sleep(200);
      })
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 10, y: 10})
          .mouseDown()
          .mouseMove(viewer, {x: 20, y: 20})
          .mouseUp()
          .perform();
        browser.sleep(200);
      })
      // .then(() => dumpAllRequestsMade(mock))
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.MultipleThings.Draw.StoreLabeledThingInFrameRect1);
      })
      .then(() => {
        browser.actions()
          .click(toolButton1) // Pedestrian drawing
          .perform();
        browser.sleep(200);
      })
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 100, y: 10})
          .mouseDown()
          .mouseMove(viewer, {x: 100, y: 40})
          .mouseUp()
          .perform();
        browser.sleep(200);
      })
      // .then(() => dumpAllRequestsMade(mock))
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.MultipleThings.Draw.StoreLabeledThingInFramePedestrian);
      })
      .then(() => {
        browser.actions()
          .click(toolButton2) // Cuboid drawing
          .perform();
        browser.sleep(200);
      })
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 100, y: 500})
          .mouseDown()
          .mouseMove(viewer, {x: 100, y: 550})
          .mouseUp()
          .mouseMove(viewer, {x: 125, y: 525})
          .click()
          .mouseMove(viewer, {x: 75, y: 525})
          .click()
          .perform();
        browser.sleep(200);
      })
      // .then(() => dumpAllRequestsMade(mock))
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.MultipleThings.Draw.StoreLabeledThingInFrameCuboid);
      })
      .then(() => {
        browser.actions()
          .click(toolButton3) // Rect drawing
          .perform();
        browser.sleep(200);
      })
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 800, y: 500})
          .mouseDown()
          .mouseMove(viewer, {x: 850, y: 550})
          .mouseUp()
          .perform();
        browser.sleep(200);
      })
      // .then(() => dumpAllRequestsMade(mock))
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.MultipleThings.Draw.StoreLabeledThingInFrameRect2);
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MultipleThings', 'DrawMultipleDifferentThings')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      // .then(() => dumpAllRequestsMade(mock))
      // .then(() => browser.pause())
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MultipleThings.DrawMultipleDifferentThings);
        done();
      });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    mock.teardown();
  });
});
