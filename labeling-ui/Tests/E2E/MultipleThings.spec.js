import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {expectAllModalsToBeClosed, initApplication, mock} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Multiple Things', () => {
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
      assets.mocks.Shared.EmptyLabeledThingGroupInFrame,
    ];

    viewer = element(by.css('.layer-container'));
  });

  it('it should display multiple different things', done => {
    mock(sharedMocks.concat([
      assets.mocks.MultipleThings.Display.LabeledThingInFrame.frameIndex0,
      assets.mocks.MultipleThings.Display.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
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

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MultipleThings', 'SelectMultipleDifferentThings1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MultipleThings.SelectMultipleDifferentThings1);
        return browser.sleep(200);
      })
      .then(() => {
        return browser.actions()
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
        return browser.sleep(200);
      })
      .then(() => {
        return browser.actions()
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
        return browser.sleep(200);
      })
      .then(() => {
        return browser.actions()
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
        return browser.sleep(200);
      })
      .then(() => {
        return browser.actions()
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
    const toolButton0 = element(by.css('button.tool-button.tool-thing.tool-0'));
    const toolButton1 = element(by.css('button.tool-button.tool-thing.tool-1'));
    const toolButton2 = element(by.css('button.tool-button.tool-thing.tool-2'));
    const toolButton3 = element(by.css('button.tool-button.tool-thing.tool-3'));
    mock(sharedMocks.concat([
      assets.mocks.MultipleThings.Draw.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.MultipleThings.Draw.LabeledThingInFrame.Empty.frameIndex0to4,
      assets.mocks.MultipleThings.Shared.SingleLabeledThingInFrame,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MultipleThings', 'SelectMultipleDifferentThings1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(() => {
        return browser.actions()
          .click(toolButton0) // Rect drawing
          .perform();
      })
      .then(() => browser.sleep(200))
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 10, y: 10})
          .mouseDown()
          .mouseMove(viewer, {x: 20, y: 20})
          .mouseUp()
          .perform();
      })
      .then(() => browser.sleep(800))
      .then(() => {
        expect(assets.mocks.MultipleThings.Draw.StoreLabeledThingInFrameRect1).toExistInPouchDb();
      })
      .then(() => {
        return browser.actions()
          .click(toolButton1) // Pedestrian drawing
          .perform();
      })
      .then(() => browser.sleep(200))
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 100, y: 10})
          .mouseDown()
          .mouseMove(viewer, {x: 100, y: 40})
          .mouseUp()
          .perform();
      })
      .then(() => browser.sleep(800))
      .then(() => {
        expect(assets.mocks.MultipleThings.Draw.StoreLabeledThingInFramePedestrian).toExistInPouchDb();
      })
      .then(() => {
        return browser.actions()
          .click(toolButton2) // Cuboid drawing
          .perform();
      })
      .then(() => browser.sleep(200))
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 100, y: 500})
          .mouseDown()
          .mouseMove(viewer, {x: 100, y: 550})
          .mouseUp()
          .mouseMove(viewer, {x: 125, y: 525})
          .click()
          .mouseMove(viewer, {x: 75, y: 525})
          .click()
          .perform();
      })
      .then(() => browser.sleep(800))
      .then(() => {
        expect(assets.mocks.MultipleThings.Draw.StoreLabeledThingInFrameCuboid).toExistInPouchDb();
      })
      .then(() => {
        return browser.actions()
          .click(toolButton3) // Rect drawing
          .perform();
      })
      .then(() => browser.sleep(200))
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 800, y: 500})
          .mouseDown()
          .mouseMove(viewer, {x: 850, y: 550})
          .mouseUp()
          .perform();
      })
      .then(() => browser.sleep(800))
      .then(() => {
        expect(assets.mocks.MultipleThings.Draw.StoreLabeledThingInFrameRect2).toExistInPouchDb();
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
