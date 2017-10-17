import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {
  expectAllModalsToBeClosed,
  initApplication,
  bootstrapHttp,
  bootstrapPouch,
  mediumSleep,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Polyline vertex', () => {
  let assets;
  let viewer;

  beforeEach(() => {
    assets = new AssetHelper(
      `${__dirname}/../Fixtures`,
      `${__dirname}/../ProtractorMocks`,
      `${__dirname}/../PouchDbDocuments`
    );
    bootstrapHttp([
      assets.mocks.Shared.TaskDb,
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Shared.UserOrganisations,
      assets.mocks.Shared.Video,
      assets.mocks.PolylineDrawing.Shared.Task,
      assets.mocks.PolylineDrawing.Shared.TaskConfiguration,
      assets.mocks.PolylineDrawing.Shared.TaskConfigurationFile,
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
    ]);

    viewer = element(by.css('.layer-container'));
  });

  function selectFirstPolyline() {
    return browser.actions()
      .mouseMove(viewer, {x: 200, y: 200}) // initial position
      .click()
      .perform();
  }

  function selectSecondPolyline() {
    return browser.actions()
      .mouseMove(viewer, {x: 600, y: 200}) // initial position
      .click()
      .perform();
  }

  function pressDownAltKey() {
    return browser.actions()
      .keyDown(protractor.Key.ALT)
      .perform();
  }

  function releaseAltKey() {
    return browser.actions()
      .keyUp(protractor.Key.ALT)
      .sendKeys(protractor.Key.NULL)
      .perform();
  }

  function clickAtPositionOne() {
    return browser.actions()
      .mouseMove(viewer, {x: 300, y: 50}) // initial position
      .click()
      .perform();
  }

  function clickAtPositionTwo() {
    return browser.actions()
      .mouseMove(viewer, {x: 900, y: 590}) // initial position
      .click()
      .perform();
  }

  function clickAtPositionThree() {
    return browser.actions()
      .mouseMove(viewer, {x: 10, y: 10}) // initial position
      .click()
      .perform();
  }

  function clickAtPositionFour() {
    return browser.actions()
      .mouseMove(viewer, {x: 10, y: 550}) // initial position
      .click()
      .perform();
  }

  function clickAtPositionFive() {
    return browser.actions()
      .mouseMove(viewer, {x: 300, y: 200}) // initial position
      .click()
      .perform();
  }

  function clickAtBottomVertexOfFirstPolyline() {
    return browser.actions()
      .mouseMove(viewer, {x: 200, y: 300}) // initial position
      .click()
      .perform();
  }

  function clickAtTopVertexOfFirstPolyline() {
    return browser.actions()
      .mouseMove(viewer, {x: 200, y: 100}) // initial position
      .click()
      .perform();
  }

  it('should add a new vertex to a polyline', done => {
    bootstrapPouch([
      assets.documents.PolylineDrawing.DrawOnePolyline.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolyline())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionOne())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineVertex', 'AddNewVertexToPolygon'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineVertex.AddNewVertexToPolygon);
        done();
      });
  });

  it('should add two new vertices to a polyline', done => {
    bootstrapPouch([
      assets.documents.PolylineDrawing.DrawOnePolyline.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolyline())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionOne())
      .then(() => clickAtPositionTwo())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineVertex', 'AddTwoNewVerticesToPolygon'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineVertex.AddTwoNewVerticesToPolygon);
        done();
      });
  });

  it('should add three new vertices to a polyline', done => {
    bootstrapPouch([
      assets.documents.PolylineDrawing.DrawOnePolyline.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolyline())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionOne())
      .then(() => clickAtPositionTwo())
      .then(() => clickAtPositionThree())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineVertex', 'AddThreeNewVerticesToPolygon'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineVertex.AddThreeNewVerticesToPolygon);
        done();
      });
  });

  fit('should not be able to remove 3rd vertex of a polyline (TTANNO-2158)', done => {
    bootstrapPouch([
      assets.documents.PolylineDrawing.DrawOnePolyline.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolyline())
      .then(() => pressDownAltKey())
      .then(() => clickAtTopVertexOfFirstPolyline())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(() => pressDownAltKey())
      .then(() => clickAtBottomVertexOfFirstPolyline())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineVertex', 'MinHandlesTwo'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineVertex.MinHandlesTwo);
        done();
      });
  });

  fit('should not be able to remove the 2 base vertices of a polyline (TTANNO-2158)', done => {
    bootstrapPouch([
      assets.documents.PolylineDrawing.DrawOnePolyline.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolyline())
      .then(() => pressDownAltKey())
      .then(() => clickAtTopVertexOfFirstPolyline())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(() => pressDownAltKey())
      .then(() => clickAtBottomVertexOfFirstPolyline())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionFive())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineVertex', 'MinHandlesTwo'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineVertex.MinHandlesTwo);
        done();
      });
  });

  it('should add three new vertices to a polyline and delete one', done => {
    bootstrapPouch([
      assets.documents.PolylineDrawing.DrawOnePolyline.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolyline())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionOne())
      .then(() => clickAtPositionTwo())
      .then(() => clickAtPositionThree())
      .then(() => clickAtBottomVertexOfFirstPolyline())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineVertex', 'AddThreeNewVerticesToPolygonAndDeleteOne'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineVertex.AddThreeNewVerticesToPolygonAndDeleteOne);
        done();
      });
  });

  it('should add three new vertices to a polyline and delete two', done => {
    bootstrapPouch([
      assets.documents.PolylineDrawing.DrawOnePolyline.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolyline())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionOne())
      .then(() => clickAtPositionTwo())
      .then(() => clickAtPositionThree())
      .then(() => clickAtBottomVertexOfFirstPolyline())
      .then(() => clickAtPositionOne())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineVertex', 'AddThreeNewVerticesToPolygonAndDeleteTwo'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineVertex.AddThreeNewVerticesToPolygonAndDeleteTwo);
        done();
      });
  });

  it('should add new vertices to two polylines', done => {
    bootstrapPouch([
      assets.documents.PolylineDrawing.DrawTwoPolylines.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolyline())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionThree())
      .then(() => releaseAltKey())
      .then(() => selectSecondPolyline())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionTwo())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineVertex', 'AddNewVerticesToTwoPolygons1'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineVertex.AddNewVerticesToTwoPolygons1);
        done();
      });
  });

  it('should add multiple new vertices to two polylines', done => {
    bootstrapPouch([
      assets.documents.PolylineDrawing.DrawTwoPolylines.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolyline())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionThree())
      .then(() => releaseAltKey())
      .then(() => selectSecondPolyline())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionTwo())
      .then(() => releaseAltKey())
      .then(() => selectFirstPolyline())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionFour())
      .then(() => releaseAltKey())
      .then(() => selectSecondPolyline())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionOne())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineVertex', 'AddNewVerticesToTwoPolygons2'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineVertex.AddNewVerticesToTwoPolygons2);
        done();
      });
  });

  it('should add multiple new vertices to two polylines and remove vertex', done => {
    bootstrapPouch([
      assets.documents.PolylineDrawing.DrawTwoPolylines.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolyline())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionThree())
      .then(() => releaseAltKey())
      .then(() => selectSecondPolyline())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionTwo())
      .then(() => releaseAltKey())
      .then(() => selectFirstPolyline())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionFour())
      .then(() => releaseAltKey())
      .then(() => selectSecondPolyline())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionOne())
      .then(() => releaseAltKey())
      .then(() => selectFirstPolyline())
      .then(() => pressDownAltKey())
      .then(() => clickAtBottomVertexOfFirstPolyline())
      .then(() => clickAtTopVertexOfFirstPolyline())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineVertex', 'AddNewVerticesToTwoPolygons3'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineVertex.AddNewVerticesToTwoPolygons3);
        done();
      });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    bootstrapHttp.teardown();
    bootstrapPouch.teardown();
  });
});


