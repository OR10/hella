import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {expectAllModalsToBeClosed, getMockRequestsMade, initApplication, mock} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Pedestrian drawing', () => {
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
      assets.mocks.PedestrianDrawing.Shared.Task,
      assets.mocks.Shared.Video,
      assets.mocks.Shared.LabelStructure,
      assets.mocks.Shared.GetTimer,
      assets.mocks.Shared.PutTimer,
      assets.mocks.Shared.LabeledThingIncompleteCount,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0to4,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0to4,
      assets.mocks.Shared.Thumbnails.pedestrianLabeledThingsInFrame0to3,
      assets.mocks.Shared.Thumbnails.pedestrianLabeledThingsInFrame0to4,
      assets.mocks.Shared.EmptyLabeledThingGroupInFrame,
    ];

    viewer = element(by.css('.layer-container'));
  });

  it('should load and draw one pedestrian shape', done => {
    mock(sharedMocks.concat([
      assets.mocks.PedestrianDrawing.DrawOnePedestrian.LabeledThingInFrame.frameIndex0,
      assets.mocks.PedestrianDrawing.DrawOnePedestrian.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'LoadAndDrawOnePedestrian')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.LoadAndDrawOnePedestrian);
        done();
      });
  });

  it('should load and draw two pedestrian shapes', done => {
    mock(sharedMocks.concat([
      assets.mocks.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0,
      assets.mocks.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'LoadAndDrawTwoPedestrians')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.LoadAndDrawTwoPedestrians);
        done();
      });
  });

  it('should select a pedestrian shape', done => {
    mock(sharedMocks.concat([
      assets.mocks.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0,
      assets.mocks.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
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

  it('should select and deselect a pedestrian shape', done => {
    mock(sharedMocks.concat([
      assets.mocks.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0,
      assets.mocks.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 100, y: 150}) // initial position
          .click()
          .perform();
      })
      .then(() => {
        return browser.actions()
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

  it('should select one and then select an other pedestrian shape', done => {
    mock(sharedMocks.concat([
      assets.mocks.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0,
      assets.mocks.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 100, y: 150}) // initial position
          .click()
          .perform();
      })
      .then(() => {
        return browser.actions()
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

  it('should correctly move a pedestrian shape and save the changed coordinates', done => {
    mock(sharedMocks.concat([
      assets.mocks.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0,
      assets.mocks.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.PedestrianDrawing.MoveOnePedestrian.LabeledThingInFrame.putLabeledThingInFrame1,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
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
        return browser.sleep(1000);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainRequest(assets.mocks.PedestrianDrawing.MoveOnePedestrian.LabeledThingInFrame.putLabeledThingInFrame1);
        done();
      });
  });

  it('should correctly resize a pedestrian shape and save the changed coordinates', done => {
    mock(sharedMocks.concat([
      assets.mocks.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0,
      assets.mocks.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.PedestrianDrawing.ResizeOnePedestrian.LabeledThingInFrame.putLabeledThingInFrame1,
      assets.mocks.PedestrianDrawing.ResizeOnePedestrian.LabeledThingInFrame.getLabeledThingsInFrame0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
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
        return browser.sleep(1000);
      })
      // .then(() => dumpAllRequestsMade(mock))
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainRequest(assets.mocks.PedestrianDrawing.ResizeOnePedestrian.LabeledThingInFrame.putLabeledThingInFrame1);
        done();
      });
  });

  it('should correctly resize a pedestrian shape with flipping top-center and bottom-center and save the changed coordinates', done => {
    mock(sharedMocks.concat([
      assets.mocks.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0,
      assets.mocks.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.PedestrianDrawing.ScaleOverFixedHandle.LabeledThingInFrame.putLabeledThingInFrame1,
      assets.mocks.PedestrianDrawing.ScaleOverFixedHandle.LabeledThingInFrame.getLabeledThingsInFrame0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 100, y: 150}) // initial position
          .click()
          .mouseMove(viewer, {x: 100, y: 200}) // bottom drag handle
          .mouseDown()
          .mouseMove(viewer, {x: 100, y: 50}) // drag
          .mouseUp()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'ScaleOverFixedHandle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        // browser.pause();
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.ScaleOverFixedHandle);
        return browser.sleep(1000);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainRequest(assets.mocks.PedestrianDrawing.ScaleOverFixedHandle.LabeledThingInFrame.putLabeledThingInFrame1);
        done();
      });
  });

  it('should keep the pedestrian shape selected over a frame change', done => {
    mock(sharedMocks.concat([
      assets.mocks.PedestrianDrawing.OnePedestrianTwoFrames.LabeledThingInFrame.frameIndex0,
      assets.mocks.PedestrianDrawing.OnePedestrianTwoFrames.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.PedestrianDrawing.OnePedestrianTwoFrames.LabeledThingInFrame.getLabeledThingInFrame0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 100, y: 150}) // initial position
          .click()
          .perform();
      })
      .then(() => browser.sleep(500))
      .then(() => {
        const nextFrameButton = element(by.css('.next-frame-button'));
        return nextFrameButton.click();
      })
      .then(() => browser.sleep(1000))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'KeepSelectionOverFrameChange')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.KeepSelectionOverFrameChange);
        done();
      });
  });

  it('should draw a new pedestrian shape', done => {
    mock(sharedMocks.concat([
      assets.mocks.PedestrianDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.PedestrianDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
      assets.mocks.PedestrianDrawing.NewPedestrian.StoreLabeledThingInFrame1,
      assets.mocks.PedestrianDrawing.NewPedestrian.StoreLabeledThing,
    ]));
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 300, y: 300}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 300, y: 500}) // initial position
          .mouseUp()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'NewPedestrian')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.NewPedestrian);
        return browser.sleep(1000);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.PedestrianDrawing.NewPedestrian.StoreLabeledThing);
        expect(requests).toContainNamedParamsRequest(assets.mocks.PedestrianDrawing.NewPedestrian.StoreLabeledThingInFrame1);
        done();
      });
  });

  it('should draw a new pedestrian shape from top to bottom with minimal height constrains', done => {
    mock(sharedMocks.concat([
      assets.mocks.PedestrianDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.PedestrianDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
      assets.mocks.PedestrianDrawing.NewPedestrianMinimalHeight.Task,
      assets.mocks.PedestrianDrawing.NewPedestrianMinimalHeight.StoreLabeledThing,
      assets.mocks.PedestrianDrawing.NewPedestrianMinimalHeight.StoreLabeledThingInFrame1,
    ]));
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 300, y: 300}) // initial positiong
          .mouseDown()
          .mouseMove(viewer, {x: 300, y: 350}) // initial position
          .mouseUp()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'NewPedestrianMinimalHeight')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.NewPedestrianMinimalHeight);
        return browser.sleep(1000);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.PedestrianDrawing.NewPedestrianMinimalHeight.StoreLabeledThing);
        expect(requests).toContainNamedParamsRequest(assets.mocks.PedestrianDrawing.NewPedestrianMinimalHeight.StoreLabeledThingInFrame1);
        done();
      });
  });

  it('should draw a new pedestrian shape from bottom to top with minimal height constrains', done => {
    mock(sharedMocks.concat([
      assets.mocks.PedestrianDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.PedestrianDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
      assets.mocks.PedestrianDrawing.NewPedestrianMinimalHeight.Task,
      assets.mocks.PedestrianDrawing.NewPedestrianMinimalHeight.StoreLabeledThing,
      assets.mocks.PedestrianDrawing.NewPedestrianMinimalHeight.StoreLabeledThingInFrame1,
    ]));
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 300, y: 400}) // initial positiong
          .mouseDown()
          .mouseMove(viewer, {x: 300, y: 350}) // initial position
          .mouseUp()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'NewPedestrianMinimalHeight')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.NewPedestrianMinimalHeight);
        return browser.sleep(1000);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.PedestrianDrawing.NewPedestrianMinimalHeight.StoreLabeledThing);
        expect(requests).toContainNamedParamsRequest(assets.mocks.PedestrianDrawing.NewPedestrianMinimalHeight.StoreLabeledThingInFrame1);
        done();
      });
  });


  it('should draw a new pedestrian shape with intermediary mouse movements', done => {
    mock(sharedMocks.concat([
      assets.mocks.PedestrianDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.PedestrianDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
      assets.mocks.PedestrianDrawing.NewPedestrianIntermediary.StoreLabeledThingInFrame,
      assets.mocks.PedestrianDrawing.NewPedestrianIntermediary.StoreLabeledThing,
    ]));
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 300, y: 300}) // initial position
          .mouseDown()
          .perform();
      })
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'NewPedestrianIntermediary1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.NewPedestrianIntermediary1);
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 300, y: 400}) // intermediary position
          .perform();
      })
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'NewPedestrianIntermediary2')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.NewPedestrianIntermediary2);
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 300, y: 500}) // final position
          .mouseUp()
          .perform();
      })
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'NewPedestrianIntermediary3')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.NewPedestrianIntermediary3);
        return browser.sleep(1000);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.PedestrianDrawing.NewPedestrianIntermediary.StoreLabeledThing);
        expect(requests).toContainNamedParamsRequest(assets.mocks.PedestrianDrawing.NewPedestrianIntermediary.StoreLabeledThingInFrame);
        done();
      });
  });


  it('should draw multiple new pedestrian shapes', done => {
    mock(sharedMocks.concat([
      assets.mocks.PedestrianDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.PedestrianDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
      assets.mocks.PedestrianDrawing.NewPedestrian.StoreLabeledThingInFrame2,
      assets.mocks.PedestrianDrawing.NewPedestrian.StoreLabeledThingInFrame3,
      assets.mocks.PedestrianDrawing.NewPedestrian.StoreLabeledThingInFrame4,
      assets.mocks.PedestrianDrawing.NewPedestrian.StoreLabeledThing,
    ]));
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 100, y: 50}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 100, y: 600}) // initial position
          .mouseUp()
          .mouseMove(viewer, {x: 900, y: 400}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 900, y: 450}) // initial position
          .mouseUp()
          .mouseMove(viewer, {x: 900, y: 200}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 900, y: 50}) // initial position
          .mouseUp()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'NewMultiplePedestrian')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.NewMultiplePedestrian);
        return browser.sleep(1000);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.PedestrianDrawing.NewPedestrian.StoreLabeledThing);
        expect(requests).toContainNamedParamsRequest(assets.mocks.PedestrianDrawing.NewPedestrian.StoreLabeledThingInFrame2);
        expect(requests).toContainNamedParamsRequest(assets.mocks.PedestrianDrawing.NewPedestrian.StoreLabeledThingInFrame3);
        expect(requests).toContainNamedParamsRequest(assets.mocks.PedestrianDrawing.NewPedestrian.StoreLabeledThingInFrame4);
        done();
      });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    mock.teardown();
  });
});
