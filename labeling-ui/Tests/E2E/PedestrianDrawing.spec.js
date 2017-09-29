import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {
  expectAllModalsToBeClosed,
  initApplication,
  bootstrapHttp,
  bootstrapPouch,
  shortSleep,
  mediumSleep,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Pedestrian drawing', () => {
  let assets;
  let sharedMocks;
  let viewer;

  beforeEach(() => {
    assets = new AssetHelper(
      `${__dirname}/../Fixtures`,
      `${__dirname}/../ProtractorMocks`,
      `${__dirname}/../PouchDbDocuments`
    );
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
    bootstrapHttp(sharedMocks);

    bootstrapPouch([
      assets.documents.PedestrianDrawing.DrawOnePedestrian.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'LoadAndDrawOnePedestrian')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.LoadAndDrawOnePedestrian);
      })
      .then(() => done());
  });

  it('should load and draw two pedestrian shapes', done => {
    bootstrapHttp(sharedMocks);

    bootstrapPouch([
      assets.documents.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'LoadAndDrawTwoPedestrians')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.LoadAndDrawTwoPedestrians);
      })
      .then(() => done());
  });

  it('should select a pedestrian shape', done => {
    bootstrapHttp(sharedMocks);

    bootstrapPouch([
      assets.documents.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 100, y: 150}) // initial position
          .click()
          .perform();
      })
      .then(() => shortSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'SelectOnePedestrian')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.SelectOnePedestrian);
      })
      .then(() => done());
  });

  it('should select and deselect a pedestrian shape', done => {
    bootstrapHttp(sharedMocks);

    bootstrapPouch([
      assets.documents.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => browser.actions()
        .mouseMove(viewer, {x: 100, y: 150}) // initial position
        .click()
        .perform()
      )
      .then(() => shortSleep())
      .then(() => browser.actions()
        .mouseMove(viewer, {x: 1, y: 1})
        .click()
        .perform()
      )
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'SelectAndDeselectPedestrian')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.SelectAndDeselectPedestrian);
      })
      .then(() => done());
  });

  it('should select one and then select an other pedestrian shape', done => {
    bootstrapHttp(sharedMocks);

    bootstrapPouch([
      assets.documents.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => browser.actions()
        .mouseMove(viewer, {x: 100, y: 150}) // initial position
        .click()
        .perform()
      )
      .then(() => shortSleep())
      .then(() => browser.actions()
        .mouseMove(viewer, {x: 400, y: 150}) // initial position
        .click()
        .perform()
      )
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'SelectAnotherPedestrian')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.SelectAnotherPedestrian);
      })
      .then(() => done());
  });

  it('should correctly move a pedestrian shape and save the changed coordinates', done => {
    bootstrapHttp(sharedMocks);

    bootstrapPouch([
      assets.documents.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => browser.actions()
        .mouseMove(viewer, {x: 100, y: 150}) // initial position
        .mouseDown()
        .mouseMove(viewer, {x: 100, y: 200}) // drag
        .mouseUp()
        .mouseMove(viewer, {x: 1, y: 1}) // click somewhere outside to deselect element
        .click()
        .perform()
      )
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.PedestrianDrawing.MoveOnePedestrian.LabeledThingInFrame.putLabeledThingInFrame1).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'MoveOnePedestrian')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.MoveOnePedestrian);
      })
      .then(() => done());
  });

  it('should correctly resize a pedestrian shape and save the changed coordinates', done => {
    bootstrapHttp(sharedMocks);

    bootstrapPouch([
      assets.documents.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0,
    ]);

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
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.PedestrianDrawing.ResizeOnePedestrian.LabeledThingInFrame.putLabeledThingInFrame1).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'ResizeOnePedestrian')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        // browser.pause();
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.ResizeOnePedestrian);
      })
      .then(() => done());
  });

  it(
    'should correctly resize a pedestrian shape with flipping top-center and bottom-center and save the changed coordinates',
    done => {
      bootstrapHttp(sharedMocks);

      bootstrapPouch([
        assets.documents.PedestrianDrawing.DrawTwoPedestrians.LabeledThingInFrame.frameIndex0,
      ]);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => browser.actions()
          .mouseMove(viewer, {x: 100, y: 150}) // initial position
          .click()
          .mouseMove(viewer, {x: 100, y: 200}) // bottom drag handle
          .mouseDown()
          .mouseMove(viewer, {x: 100, y: 50}) // drag
          .mouseUp()
          .perform()
        )
        .then(() => mediumSleep())
        .then(() => {
          expect(assets.mocks.PedestrianDrawing.ScaleOverFixedHandle.LabeledThingInFrame.putLabeledThingInFrame1).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'ScaleOverFixedHandle')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.ScaleOverFixedHandle);
        })
        .then(() => done());
    }
  );

  it('should keep the pedestrian shape selected over a frame change', done => {
    bootstrapHttp(sharedMocks);

    bootstrapPouch([
      assets.documents.PedestrianDrawing.OnePedestrianTwoFrames.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => browser.actions()
        .mouseMove(viewer, {x: 100, y: 150}) // initial position
        .click()
        .perform()
      )
      .then(() => mediumSleep())
      .then(() => {
        const nextFrameButton = element(by.css('.next-frame-button'));
        return nextFrameButton.click();
      })
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'KeepSelectionOverFrameChange')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.KeepSelectionOverFrameChange);
      })
      .then(() => done());
  });

  it('should draw a new pedestrian shape', done => {
    bootstrapHttp(sharedMocks);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => browser.actions()
        .mouseMove(viewer, {x: 300, y: 300}) // initial position
        .mouseDown()
        .mouseMove(viewer, {x: 300, y: 500}) // initial position
        .mouseUp()
        .perform()
      )
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.PedestrianDrawing.NewPedestrian.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.PedestrianDrawing.NewPedestrian.StoreLabeledThingInFrame1).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'NewPedestrian')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.NewPedestrian);
      })
      .then(() => done());
  });

  it('should draw a new pedestrian shape from top to bottom with minimal height constrains', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.PedestrianDrawing.NewPedestrianMinimalHeight.Task,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => browser.actions()
        .mouseMove(viewer, {x: 300, y: 300}) // initial positiong
        .mouseDown()
        .mouseMove(viewer, {x: 300, y: 350}) // initial position
        .mouseUp()
        .perform()
      )
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.PedestrianDrawing.NewPedestrianMinimalHeight.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.PedestrianDrawing.NewPedestrianMinimalHeight.StoreLabeledThingInFrame1).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'NewPedestrianMinimalHeight')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.NewPedestrianMinimalHeight);
      })
      .then(() => done());
  });

  it('should draw a new pedestrian shape from bottom to top with minimal height constrains', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.PedestrianDrawing.NewPedestrianMinimalHeight.Task,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => browser.actions()
        .mouseMove(viewer, {x: 300, y: 400}) // initial positiong
        .mouseDown()
        .mouseMove(viewer, {x: 300, y: 350}) // initial position
        .mouseUp()
        .perform()
      )
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.PedestrianDrawing.NewPedestrianMinimalHeight.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.PedestrianDrawing.NewPedestrianMinimalHeight.StoreLabeledThingInFrame1).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'NewPedestrianMinimalHeight')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.NewPedestrianMinimalHeight);
      })
      .then(() => done());
  });

  it('should draw a new pedestrian shape with intermediary mouse movements', done => {
    bootstrapHttp(sharedMocks);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        () => browser.actions()
          .mouseMove(viewer, {x: 300, y: 300}) // initial position
          .mouseDown()
          .perform()
      )
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'NewPedestrianIntermediary1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.NewPedestrianIntermediary1);
      })
      .then(
        () => browser.actions()
          .mouseMove(viewer, {x: 300, y: 400}) // intermediary position
          .perform()
      )
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'NewPedestrianIntermediary2')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.NewPedestrianIntermediary2);
      })
      .then(
        () => browser.actions()
          .mouseMove(viewer, {x: 300, y: 500}) // final position
          .mouseUp()
          .perform()
      )
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.PedestrianDrawing.NewPedestrianIntermediary.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.PedestrianDrawing.NewPedestrianIntermediary.StoreLabeledThingInFrame).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'NewPedestrianIntermediary3')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.NewPedestrianIntermediary3);
      })
      .then(() => done());
  });

  it('should draw multiple new pedestrian shapes', done => {
    bootstrapHttp(sharedMocks);

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
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.PedestrianDrawing.NewPedestrian.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.PedestrianDrawing.NewPedestrian.StoreLabeledThingInFrame2).toExistInPouchDb();
        expect(assets.mocks.PedestrianDrawing.NewPedestrian.StoreLabeledThingInFrame3).toExistInPouchDb();
        expect(assets.mocks.PedestrianDrawing.NewPedestrian.StoreLabeledThingInFrame4).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PedestrianDrawing', 'NewMultiplePedestrian')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PedestrianDrawing.NewMultiplePedestrian);
      })
      .then(() => done());
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    bootstrapHttp.teardown();
    bootstrapPouch.teardown();
  });
});
