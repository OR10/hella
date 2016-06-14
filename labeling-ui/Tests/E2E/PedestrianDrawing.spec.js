import mock from 'protractor-http-mock';
import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {getMockRequestsMade, initApplication} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Pedestrian drawing', () => {
  let assets;
  let sharedMocks;
  let viewer;

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`);
    sharedMocks = [
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Shared.Task,
      assets.mocks.Shared.Video,
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

  it('should load and draw one pedestrian rectangle', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.PedestrianDrawing.DrawOnePedestrian.LabeledThingInFrame.frameIndex0,
      assets.mocks.PedestrianDrawing.DrawOnePedestrian.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'LoadAndDrawOnePedestrian')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then((drawingStack) => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.LoadAndDrawOnePedestrian);
        done();
      });
  });

  it('should load and draw two pedestrian rectangles', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0,
      assets.mocks.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'LoadAndDrawTwoPedestrians')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then((drawingStack) => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.LoadAndDrawTwoPedestrians);
        done();
      });
  });

  it('should select a pedestrian rectangle', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0,
      assets.mocks.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 100, y: 150}) // initial position
          .click()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'SelectOnePedestrian')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.SelectOnePedestrian);
        done();
      });
  });

  it('should select and deselect a pedestrian rectangle', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0,
      assets.mocks.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 100, y: 150}) // initial position
          .click()
          .perform();
        browser.actions()
          .mouseMove(viewer, {x: 1, y: 1})
          .click()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'SelectAndDeselectPedestrian')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.SelectAndDeselectPedestrian);
        done();
      });
  });

  it('should deselect one and select an other paper rectangle', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0,
      assets.mocks.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 100, y: 150}) // initial position
          .click()
          .perform();
        browser.actions()
          .mouseMove(viewer, {x: 400, y: 150}) // initial position
          .click()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'SelectAnotherPedestrian')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.SelectAnotherPedestrian);
        done();
      });
  });

  it('should correctly move a pedestrian rectangle on canvas and save the changed coordinates', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0,
      assets.mocks.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.PedestrianDrawing.MoveOnePedestrian.LabeledThingInFrame.putLabeledThingInFrame1,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 100, y: 150}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 100, y: 200}) // drag
          .mouseUp()
          .mouseMove(viewer, {x: 1, y: 1}) // click somewhere outside to deselect element
          .click()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'MoveOnePedestrian')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.MoveOnePedestrian);
        browser.sleep(1000);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContain(assets.mocks.PedestrianDrawing.MoveOnePedestrian.LabeledThingInFrame.putLabeledThingInFrame1.request);
        done();
      });
  });

  fit('should correctly resize a pedestrian rectangle on canvas and save the changed coordinates', (done) => {
    mock(sharedMocks.concat([
      assets.mocks.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0,
      assets.mocks.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.PedestrianDrawing.ResizeOnePedestrian.LabeledThingInFrame.putLabeledThingInFrame1,
      assets.mocks.PedestrianDrawing.ResizeOnePedestrian.LabeledThingInFrame.getLabeledThingsInFrame0to4,
    ]));

    initApplication('/labeling/task/TASKID-TASKID')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 100, y: 150}) // initial position
          .click()
          .mouseMove(viewer, {x: 100, y: 200}) // bottom drag handle
          .mouseDown()
          .mouseMove(viewer, {x: 100, y: 300}) // drag
          .mouseUp()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'ResizeOnePedestrian')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        // browser.pause();
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.ResizeOnePedestrian);
        browser.sleep(1000);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContain(assets.mocks.PedestrianDrawing.ResizeOnePedestrian.LabeledThingInFrame.putLabeledThingInFrame1.request);
        done();
      });
  });

  afterEach(() => {
    mock.teardown();
  });
});
