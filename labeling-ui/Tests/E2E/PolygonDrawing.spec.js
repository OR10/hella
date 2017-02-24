import mock from 'protractor-http-mock';
import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {
  expectAllModalsToBeClosed,
  expectModalToBePresent,
  getMockRequestsMade,
  initApplication,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Polygon drawing', () => {
  let assets;
  let sharedMocks;
  let viewer;

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`);
    sharedMocks = [
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Shared.UserOrganisations,
      assets.mocks.Shared.Video,
      assets.mocks.PolygonDrawing.Shared.Task,
      assets.mocks.PolygonDrawing.Shared.TaskConfiguration,
      assets.mocks.PolygonDrawing.Shared.TaskConfigurationFile,
      assets.mocks.Shared.GetTimer,
      assets.mocks.Shared.PutTimer,
      assets.mocks.Shared.LabeledThingIncompleteCount,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0to4,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0to4,
      assets.mocks.Shared.Thumbnails.polygonLabeledThingsInFrame0to3,
      assets.mocks.Shared.Thumbnails.polygonLabeledThingsInFrame0to4,
      assets.mocks.Shared.EmptyLabeledThingGroupInFrame,
    ];

    viewer = element(by.css('.layer-container'));
  });

  it('should load and draw one polygon shape', done => {
    mock(sharedMocks.concat([
      assets.mocks.PolygonDrawing.DrawOnePolygon.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolygonDrawing.DrawOnePolygon.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonDrawing', 'LoadAndDrawOnePolygon'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonDrawing.LoadAndDrawOnePolygon);
        done();
      });
  });

  it('should load and draw two polygon shapes', done => {
    mock(sharedMocks.concat([
      assets.mocks.PolygonDrawing.DrawTwoPolygons.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolygonDrawing.DrawTwoPolygons.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonDrawing', 'LoadAndDrawTwoPolygons')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonDrawing.LoadAndDrawTwoPolygons);
        done();
      });
  });

  it('should select a polygon shape', done => {
    mock(sharedMocks.concat([
      assets.mocks.PolygonDrawing.DrawTwoPolygons.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolygonDrawing.DrawTwoPolygons.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 200, y: 200}) // initial position
          .click()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonDrawing', 'SelectOnePolygon')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonDrawing.SelectOnePolygon);
        done();
      });
  });

  it('should select and deselect a polygon shape', done => {
    mock(sharedMocks.concat([
      assets.mocks.PolygonDrawing.DrawTwoPolygons.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolygonDrawing.DrawTwoPolygons.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 200, y: 200}) // initial position
          .click()
          .perform();
        browser.actions()
          .mouseMove(viewer, {x: 1, y: 1})
          .click()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonDrawing', 'SelectAndDeselectPolygon')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonDrawing.SelectAndDeselectPolygon);
        done();
      });
  });

  it('should select one and then select an other polygon shape', done => {
    mock(sharedMocks.concat([
      assets.mocks.PolygonDrawing.DrawTwoPolygons.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolygonDrawing.DrawTwoPolygons.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 200, y: 200}) // initial position
          .click()
          .perform();
        browser.actions()
          .mouseMove(viewer, {x: 600, y: 200}) // initial position
          .click()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonDrawing', 'SelectAnotherPolygon')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonDrawing.SelectAnotherPolygon);
        done();
      });
  });

  it('should correctly move a polygon shape and save the changed coordinates', done => {
    mock(sharedMocks.concat([
      assets.mocks.PolygonDrawing.DrawTwoPolygons.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolygonDrawing.DrawTwoPolygons.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.PolygonDrawing.MoveOnePolygon.LabeledThingInFrame.putLabeledThingInFrame1,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 200, y: 200}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 250, y: 200}) // initial position
          .mouseUp()
          .mouseMove(viewer, {x: 1, y: 1}) // click somewhere outside to deselect element
          .click()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonDrawing', 'MoveOnePolygon')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonDrawing.MoveOnePolygon);
      })
      .then(() => browser.sleep(500))
      // .then(() => dumpAllRequestsMade(mock))
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainRequest(assets.mocks.PolygonDrawing.MoveOnePolygon.LabeledThingInFrame.putLabeledThingInFrame1);
        done();
      });
  });

  it('should correctly resize a polygon shape and save the changed coordinates', done => {
    mock(sharedMocks.concat([
      assets.mocks.PolygonDrawing.DrawTwoPolygons.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolygonDrawing.DrawTwoPolygons.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.PolygonDrawing.ResizeOnePolygon.LabeledThingInFrame.putLabeledThingInFrame1,
      assets.mocks.PolygonDrawing.ResizeOnePolygon.LabeledThingInFrame.getLabeledThingsInFrame0to4,
      assets.mocks.PolygonDrawing.Shared.StoreLabeledThing,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => browser.actions()
          .mouseMove(viewer, {x: 200, y: 200}) // initial position
          .click()
          .mouseMove(viewer, {x: 200, y: 300}) // bottom drag handle
          .mouseDown()
          .mouseMove(viewer, {x: 200, y: 400}) // drag
          .mouseUp()
          .mouseMove(viewer, {x: 100, y: 200}) // left drag handle
          .mouseDown()
          .mouseMove(viewer, {x: 50, y: 200}) // drag
          .mouseUp()
          .perform()
      )
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonDrawing', 'ResizeOnePolygon')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonDrawing.ResizeOnePolygon);
        return browser.sleep(1000);
      })
      // .then(() => dumpAllRequestsMade(mock))
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainRequest(assets.mocks.PolygonDrawing.ResizeOnePolygon.LabeledThingInFrame.putLabeledThingInFrame1);
        done();
      });
  });

  it('should keep the polygon shape selected over a frame change', done => {
    mock(sharedMocks.concat([
      assets.mocks.PolygonDrawing.OnePolygonTwoFrames.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolygonDrawing.OnePolygonTwoFrames.LabeledThingInFrame.frameIndex1,
      assets.mocks.PolygonDrawing.OnePolygonTwoFrames.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.PolygonDrawing.OnePolygonTwoFrames.LabeledThingInFrame.frameIndex1to5,
      assets.mocks.PolygonDrawing.OnePolygonTwoFrames.LabeledThingInFrame.getLabeledThingInFrame0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 200, y: 200}) // initial position
          .click()
          .perform();
      })
      .then(() => browser.sleep(500))
      .then(() => {
        const nextFrameButton = element(by.css('.next-frame-button'));
        nextFrameButton.click();
      })
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonDrawing', 'KeepSelectionOverFrameChange')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonDrawing.KeepSelectionOverFrameChange);
        done();
      });
  });

  it('should draw a new polygon shape', done => {
    mock(sharedMocks.concat([
      assets.mocks.PolygonDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.PolygonDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
      assets.mocks.PolygonDrawing.NewPolygon.StoreLabeledThingInFrame1,
      assets.mocks.PolygonDrawing.NewPolygon.StoreLabeledThing,
    ]));
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => browser.actions()
          .mouseMove(viewer, {x: 100, y: 100}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 600, y: 100}) // initial position
          .mouseUp()
          .mouseMove(viewer, {x: 600, y: 600}) // initial position
          .click()
          .mouseMove(viewer, {x: 200, y: 600}) // initial position
          .click()
          .mouseMove(viewer, {x: 200, y: 400}) // initial position
          .click()
          .mouseMove(viewer, {x: 500, y: 400}) // initial position
          .click()
          .mouseMove(viewer, {x: 500, y: 200}) // initial position
          .click()
          .mouseMove(viewer, {x: 100, y: 200}) // initial position
          .click()
          .mouseMove(viewer, {x: 1, y: 1}) // initial position
          .click(protractor.Button.RIGHT)
          .perform()
      )
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonDrawing', 'NewPolygon')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonDrawing.NewPolygon);
      })
      // .then(() => dumpAllRequestsMade(mock))
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.PolygonDrawing.NewPolygon.StoreLabeledThing);
        expect(requests).toContainNamedParamsRequest(assets.mocks.PolygonDrawing.NewPolygon.StoreLabeledThingInFrame1);
        done();
      });
  });

  it('should draw a new polygon shape with intermediary mouse movements', done => {
    mock(sharedMocks.concat([
      assets.mocks.PolygonDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.PolygonDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
      assets.mocks.PolygonDrawing.NewPolygon.StoreLabeledThingInFrame1,
      assets.mocks.PolygonDrawing.NewPolygon.StoreLabeledThing,
    ]));
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => browser.actions()
          .mouseMove(viewer, {x: 100, y: 100}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 600, y: 100}) // initial position
          .mouseUp()
          .mouseMove(viewer, {x: 400, y: 400}) // initial position
          .perform()
      )
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonDrawing', 'NewPolygonIntermediary1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonDrawing.NewPolygonIntermediary1);
      })
      .then(() => browser.actions()
          .mouseMove(viewer, {x: 600, y: 600}) // initial position
          .click()
          .mouseMove(viewer, {x: 200, y: 600}) // initial position
          .click()
          .mouseMove(viewer, {x: 400, y: 400}) // initial position
          .perform()
      )
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonDrawing', 'NewPolygonIntermediary2')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonDrawing.NewPolygonIntermediary2);
      })
      .then(() => browser.actions()
          .mouseMove(viewer, {x: 200, y: 400}) // initial position
          .click()
          .mouseMove(viewer, {x: 500, y: 400}) // initial position
          .click()
          .mouseMove(viewer, {x: 500, y: 200}) // initial position
          .click()
          .mouseMove(viewer, {x: 400, y: 400}) // initial position
          .perform()
      )
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonDrawing', 'NewPolygonIntermediary3')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonDrawing.NewPolygonIntermediary3);
      })
      .then(() => browser.actions()
          .mouseMove(viewer, {x: 100, y: 200}) // initial position
          .click()
          .mouseMove(viewer, {x: 1, y: 1}) // initial position
          .click(protractor.Button.RIGHT)
          .perform()
      )
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonDrawing', 'NewPolygonIntermediary4')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonDrawing.NewPolygonIntermediary4);
      })
      // .then(() => dumpAllRequestsMade(mock))
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.PolygonDrawing.NewPolygon.StoreLabeledThing);
        expect(requests).toContainNamedParamsRequest(assets.mocks.PolygonDrawing.NewPolygon.StoreLabeledThingInFrame1);
        done();
      });
  });


  it('should draw multiple new polygon shapes', done => {
    mock(sharedMocks.concat([
      assets.mocks.PolygonDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.PolygonDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
      assets.mocks.PolygonDrawing.NewPolygon.StoreLabeledThingInFrame2,
      assets.mocks.PolygonDrawing.NewPolygon.StoreLabeledThingInFrame3,
      assets.mocks.PolygonDrawing.NewPolygon.StoreLabeledThingInFrame4,
      assets.mocks.PolygonDrawing.NewPolygon.StoreLabeledThing,
    ]));
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 100, y: 100}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 100, y: 200}) // initial position
          .mouseUp()
          .mouseMove(viewer, {x: 150, y: 150}) // initial position
          .click()
          .click(protractor.Button.RIGHT)
          .perform();
      })
      // .then(() => dumpAllRequestsMade(mock))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonDrawing', 'NewMultiplePolygon1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonDrawing.NewMultiplePolygon1);
      })
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 300, y: 100}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 300, y: 200}) // initial position
          .mouseUp()
          .mouseMove(viewer, {x: 350, y: 150}) // initial position
          .click()
          .click(protractor.Button.RIGHT)
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonDrawing', 'NewMultiplePolygon2')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonDrawing.NewMultiplePolygon2);
      })
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 600, y: 100}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 600, y: 200}) // initial position
          .mouseUp()
          .mouseMove(viewer, {x: 650, y: 150}) // initial position
          .click()
          .click(protractor.Button.RIGHT)
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonDrawing', 'NewMultiplePolygon3')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonDrawing.NewMultiplePolygon3);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.PolygonDrawing.NewPolygon.StoreLabeledThing);
        expect(requests).toContainNamedParamsRequest(assets.mocks.PolygonDrawing.NewPolygon.StoreLabeledThingInFrame2);
        expect(requests).toContainNamedParamsRequest(assets.mocks.PolygonDrawing.NewPolygon.StoreLabeledThingInFrame3);
        expect(requests).toContainNamedParamsRequest(assets.mocks.PolygonDrawing.NewPolygon.StoreLabeledThingInFrame4);
        done();
      });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    mock.teardown();
  });
});

describe('Polygon handle/point limiting', () => {
  let assets;
  let sharedMocks;
  let viewer;

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`);
    sharedMocks = [
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Shared.Video,
      assets.mocks.PolygonDrawing.Shared.Task,
      assets.mocks.PolygonDrawing.Shared.TaskConfiguration,
      assets.mocks.PolygonDrawing.Shared.TaskConfigurationFile,
      assets.mocks.Shared.GetTimer,
      assets.mocks.Shared.PutTimer,
      assets.mocks.Shared.LabeledThingIncompleteCount,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0to4,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0to4,
      assets.mocks.Shared.Thumbnails.polygonLabeledThingsInFrame0to3,
      assets.mocks.Shared.Thumbnails.polygonLabeledThingsInFrame0to4,
      assets.mocks.Shared.EmptyLabeledThingGroupInFrame,
    ];

    viewer = element(by.css('.layer-container'));
  });

  it('should add too few handles', done => {
    mock(sharedMocks.concat([
      assets.mocks.PolygonDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.PolygonDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 100, y: 100}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 100, y: 200}) // initial position
          .mouseUp()
          .mouseMove(viewer, {x: 1, y: 1}) // initial position
          .click(protractor.Button.RIGHT)
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonDrawing', 'TooFewHandles'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonDrawing.TooFewHandles);
        expectModalToBePresent();
        done();
      });
  });

  it('should add too many handles', done => {
    mock(sharedMocks.concat([
      assets.mocks.PolygonDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.PolygonDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
      assets.mocks.PolygonDrawing.NewPolygon.StoreLabeledThingInFrame5,
      assets.mocks.PolygonDrawing.NewPolygon.StoreLabeledThing,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 100, y: 100}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 100, y: 200}) // initial position
          .mouseUp()
          .mouseMove(viewer, {x: 100, y: 300}) // initial position
          .click()
          .mouseMove(viewer, {x: 100, y: 400}) // initial position
          .click()
          .mouseMove(viewer, {x: 100, y: 500}) // initial position
          .click()
          .mouseMove(viewer, {x: 100, y: 600}) // initial position
          .click()
          .mouseMove(viewer, {x: 200, y: 600}) // initial position
          .click()
          .mouseMove(viewer, {x: 200, y: 500}) // initial position
          .click()
          .mouseMove(viewer, {x: 200, y: 400}) // initial position
          .click()
          .mouseMove(viewer, {x: 200, y: 300}) // initial position
          .click()
          .mouseMove(viewer, {x: 200, y: 200}) // initial position
          .click()
          .mouseMove(viewer, {x: 300, y: 200}) // initial position
          .click()
          .mouseMove(viewer, {x: 300, y: 300}) // initial position
          .click()
          .mouseMove(viewer, {x: 700, y: 300}) // initial position
          .click()
          .mouseMove(viewer, {x: 700, y: 100}) // initial position
          .click()
          .mouseMove(viewer, {x: 400, y: 100}) // initial position
          .click()
          .mouseMove(viewer, {x: 1, y: 1}) // initial position
          .click()
          .perform();
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.PolygonDrawing.NewPolygon.StoreLabeledThingInFrame5);
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonDrawing', 'TooManyHandles'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs()
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonDrawing.TooManyHandles);
        expectModalToBePresent();
        done();
      });
  });

  afterEach(() => {
    mock.teardown();
  });
});
