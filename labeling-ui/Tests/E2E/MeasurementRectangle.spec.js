import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {expectAllModalsToBeClosed, initApplication, mock} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

fdescribe('Measurement Rectangle', () => {
  let assets;
  let sharedMocks;
  let viewer;

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`, `${__dirname}/../PouchDbDocuments`);
    sharedMocks = [
      assets.mocks.Shared.TaskDb,
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Shared.UserOrganisations,
      assets.mocks.Shared.Video,
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
      assets.mocks.ClassGhosting.Task,
      assets.mocks.ClassGhosting.TaskConfiguration,
      assets.mocks.ClassGhosting.TaskConfigurationFile,
    ];

    viewer = element(by.css('.layer-container'));
  });

  it('should draw one measurement rectangle', done => {
    mock(sharedMocks.concat([]));

    const toolButton = element(by.css('button.tool-button.tool-additional-tools.tool-0'));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => toolButton.click())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 100, y: 100})
          .mouseDown()
          .mouseMove(viewer, {x: 400, y: 400})
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MeasurementRectangle', 'DrawOneMeasurementRectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MeasurementRectangle.DrawOneMeasurementRectangle);
      })
      .then(() => {
        return browser.actions()
          .mouseUp()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MeasurementRectangle', 'DrawOneMeasurementRectangleNotSelected')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        // Make sure the measurement rectangle stays
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MeasurementRectangle.DrawOneMeasurementRectangleNotSelected);
      })
      .then(() => done());
  });

  it('should draw one measurement rectangle and keep it on frame change', done => {
    mock(sharedMocks.concat([]));

    const toolButton = element(by.css('button.tool-button.tool-additional-tools.tool-0'));
    const nextFrameButton = element(by.css('.next-frame-button'));
    const previousFrameButton = element(by.css('.previous-frame-button'));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => toolButton.click())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 100, y: 100})
          .mouseDown()
          .mouseMove(viewer, {x: 400, y: 400})
          .mouseUp()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MeasurementRectangle', 'DrawOneMeasurementRectangleFrameChange1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MeasurementRectangle.DrawOneMeasurementRectangleFrameChange1);
      })
      .then(() => nextFrameButton.click())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MeasurementRectangle', 'DrawOneMeasurementRectangleFrame2')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MeasurementRectangle.DrawOneMeasurementRectangleFrameChange2);
      })
      .then(() => previousFrameButton.click())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MeasurementRectangle', 'DrawOneMeasurementRectangleFrameChange1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MeasurementRectangle.DrawOneMeasurementRectangleFrameChange1);
      })
      .then(() => {
        done();
      })
  });

  it('should draw one measurement rectangle and delete it on shape delete button click', done => {
    mock(sharedMocks.concat([]));

    const toolButton = element(by.css('button.tool-button.tool-additional-tools.tool-0'));
    const deleteShapeButton = element(by.css('#delete-shape-button'));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => toolButton.click())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 100, y: 100})
          .mouseDown()
          .mouseMove(viewer, {x: 400, y: 400})
          .mouseUp()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MeasurementRectangle', 'DrawOneMeasurementRectangleFrameChange1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MeasurementRectangle.DrawOneMeasurementRectangleFrameChange1);
      })
      .then(() => deleteShapeButton.click())
      .then(() => browser.sleep(300))
      .then(() => {
        const confirmButton = element(by.css('#modal-confirm-button'));
        return confirmButton.click();
      })
      .then(() => browser.sleep(600))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MeasurementRectangle', 'DrawMeasurementRectangleEmpty')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MeasurementRectangle.DrawMeasurementRectangleEmpty);
      })
      .then(() => {
        done();
      })
  });

  it('should draw one measurement rectangle and delete it on delete key', done => {
    mock(sharedMocks.concat([]));

    const toolButton = element(by.css('button.tool-button.tool-additional-tools.tool-0'));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => toolButton.click())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 100, y: 100})
          .mouseDown()
          .mouseMove(viewer, {x: 400, y: 400})
          .mouseUp()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MeasurementRectangle', 'DrawOneMeasurementRectangleFrameChange1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MeasurementRectangle.DrawOneMeasurementRectangleFrameChange1);
      })
      .then(() => {
        return browser.actions()
          .sendKeys(protractor.Key.DELETE)
          .perform();
      })
      .then(() => browser.sleep(300))
      .then(() => {
        const confirmButton = element(by.css('#modal-confirm-button'));
        return confirmButton.click();
      })
      .then(() => browser.sleep(600))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MeasurementRectangle', 'DrawMeasurementRectangleEmpty')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MeasurementRectangle.DrawMeasurementRectangleEmpty);
      })
      .then(() => {
        done();
      })
  });

  it('should draw multiple measurement rectangles', done => {
    mock(sharedMocks.concat([]));

    const toolButton = element(by.css('button.tool-button.tool-additional-tools.tool-0'));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => toolButton.click())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 200, y: 200})
          .mouseDown()
          .mouseMove(viewer, {x: 400, y: 400})
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MeasurementRectangle', 'DrawMultipleMeasurementRectangles1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MeasurementRectangle.DrawMultipleMeasurementRectangles1);
      })
      .then(() => {
        return browser.actions()
          .mouseUp()
          .perform();
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 800, y: 200})
          .mouseDown()
          .mouseMove(viewer, {x: 900, y: 600})
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MeasurementRectangle', 'DrawMultipleMeasurementRectangles2')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MeasurementRectangle.DrawMultipleMeasurementRectangles2);
      })
      .then(() => {
        return browser.actions()
          .mouseUp()
          .perform();
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 100, y: 600})
          .mouseDown()
          .mouseMove(viewer, {x: 600, y: 500})
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MeasurementRectangle', 'DrawMultipleMeasurementRectangles3')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MeasurementRectangle.DrawMultipleMeasurementRectangles3);
      })
      .then(() => {
        return browser.actions()
          .mouseUp()
          .perform();
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 900, y: 500})
          .mouseDown()
          .mouseMove(viewer, {x: 800, y: 600})
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MeasurementRectangle', 'DrawMultipleMeasurementRectangles4')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MeasurementRectangle.DrawMultipleMeasurementRectangles4);
      })
      .then(() => {
        return browser.actions()
          .mouseUp()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MeasurementRectangle', 'DrawMultipleMeasurementRectanglesNotSelected')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        // Make sure the measurement rectangles stay
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MeasurementRectangle.DrawMultipleMeasurementRectanglesNotSelected);
      })
      .then(() => done());
  });

  it('should draw multiple measurement rectangles and keep them on frame change', done => {
    mock(sharedMocks.concat([]));

    const toolButton = element(by.css('button.tool-button.tool-additional-tools.tool-0'));
    const nextFrameButton = element(by.css('.next-frame-button'));
    const previousFrameButton = element(by.css('.previous-frame-button'));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => toolButton.click())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 200, y: 200})
          .mouseDown()
          .mouseMove(viewer, {x: 400, y: 400})
          .mouseUp()
          .perform();
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 800, y: 200})
          .mouseDown()
          .mouseMove(viewer, {x: 900, y: 600})
          .mouseUp()
          .perform();
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 100, y: 600})
          .mouseDown()
          .mouseMove(viewer, {x: 600, y: 500})
          .mouseUp()
          .perform();
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 900, y: 500})
          .mouseDown()
          .mouseMove(viewer, {x: 800, y: 600})
          .mouseUp()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MeasurementRectangle', 'DrawMultipleMeasurementRectanglesFrameChange1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MeasurementRectangle.DrawMultipleMeasurementRectanglesFrameChange1);
      })
      .then(() => nextFrameButton.click())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MeasurementRectangle', 'DrawMultipleMeasurementRectanglesFrameChange2')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MeasurementRectangle.DrawMultipleMeasurementRectanglesFrameChange2);
      })
      .then(() => nextFrameButton.click())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MeasurementRectangle', 'DrawMultipleMeasurementRectanglesFrameChange3')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MeasurementRectangle.DrawMultipleMeasurementRectanglesFrameChange3);
      })
      .then(() => previousFrameButton.click())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MeasurementRectangle', 'DrawMultipleMeasurementRectanglesFrameChange2')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MeasurementRectangle.DrawMultipleMeasurementRectanglesFrameChange2);
      })
      .then(() => {
        done();
      })
  });

  it('should draw one measurement rectangle with multiple mouse movements', done => {
    mock(sharedMocks.concat([]));

    const toolButton = element(by.css('button.tool-button.tool-additional-tools.tool-0'));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => toolButton.click())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 200, y: 200})
          .mouseDown()
          .mouseMove(viewer, {x: 400, y: 400})
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MeasurementRectangle', 'DrawMeasurementRectangleMultipleMouseMovements1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MeasurementRectangle.DrawMeasurementRectangleMultipleMouseMovements1);
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 900, y: 600})
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MeasurementRectangle', 'DrawMeasurementRectangleMultipleMouseMovements2')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MeasurementRectangle.DrawMeasurementRectangleMultipleMouseMovements2);
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 600, y: 500})
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MeasurementRectangle', 'DrawMeasurementRectangleMultipleMouseMovements3')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MeasurementRectangle.DrawMeasurementRectangleMultipleMouseMovements3);
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 50, y: 60})
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MeasurementRectangle', 'DrawMeasurementRectangleMultipleMouseMovements4')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MeasurementRectangle.DrawMeasurementRectangleMultipleMouseMovements4);
      })
      .then(() => {
        return browser.actions()
          .mouseUp()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('MeasurementRectangle', 'DrawMeasurementRectangleMultipleMouseMovementsNotSelected')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MeasurementRectangle.DrawMeasurementRectangleMultipleMouseMovementsNotSelected);
      })
      .then(() => done());
  });

  it('should draw one measurement rectangle and not save it to the database', done => {
    mock(sharedMocks.concat([]));

    const toolButton = element(by.css('button.tool-button.tool-additional-tools.tool-0'));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => toolButton.click())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 100, y: 100})
          .mouseDown()
          .mouseMove(viewer, {x: 400, y: 400})
          .mouseUp()
          .perform();
      })
      .then(() => expect('AppBundle.Model.LabeledThingInFrame').not.toHaveMatchingTypeDocumentsInDb())
      .then(() => expect('AppBundle.Model.LabeledThing').not.toHaveMatchingTypeDocumentsInDb())
      .then(() => done());
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    mock.teardown();
  });
});
