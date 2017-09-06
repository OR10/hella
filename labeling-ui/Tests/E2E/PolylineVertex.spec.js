import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {
  expectAllModalsToBeClosed,
  initApplication,
  mock,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Polyline vertex', () => {
  let assets;
  let sharedMocks;
  let viewer;

  beforeEach(() => {
    assets = new AssetHelper(
      `${__dirname}/../Fixtures`,
      `${__dirname}/../ProtractorMocks`,
    );
    sharedMocks = [
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
    ];

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
    mock(sharedMocks.concat([
      assets.mocks.PolylineDrawing.DrawOnePolyline.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolylineDrawing.DrawOnePolyline.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolyline())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionOne())
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
    mock(sharedMocks.concat([
      assets.mocks.PolylineDrawing.DrawOnePolyline.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolylineDrawing.DrawOnePolyline.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolyline())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionOne())
      .then(() => clickAtPositionTwo())
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
    mock(sharedMocks.concat([
      assets.mocks.PolylineDrawing.DrawOnePolyline.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolylineDrawing.DrawOnePolyline.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolyline())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionOne())
      .then(() => clickAtPositionTwo())
      .then(() => clickAtPositionThree())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineVertex', 'AddThreeNewVerticesToPolygon'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineVertex.AddThreeNewVerticesToPolygon);
        done();
      });
  });

  it('should add three new vertices to a polyline and delete one', done => {
    mock(sharedMocks.concat([
      assets.mocks.PolylineDrawing.DrawOnePolyline.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolylineDrawing.DrawOnePolyline.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolyline())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionOne())
      .then(() => clickAtPositionTwo())
      .then(() => clickAtPositionThree())
      .then(() => clickAtBottomVertexOfFirstPolyline())
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
    mock(sharedMocks.concat([
      assets.mocks.PolylineDrawing.DrawOnePolyline.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolylineDrawing.DrawOnePolyline.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolyline())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionOne())
      .then(() => clickAtPositionTwo())
      .then(() => clickAtPositionThree())
      .then(() => clickAtBottomVertexOfFirstPolyline())
      .then(() => clickAtPositionOne())
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
    mock(sharedMocks.concat([
      assets.mocks.PolylineDrawing.DrawTwoPolylines.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolylineDrawing.DrawTwoPolylines.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolyline())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionThree())
      .then(() => releaseAltKey())
      .then(() => selectSecondPolyline())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionTwo())
      .then(() => releaseAltKey())
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
    mock(sharedMocks.concat([
      assets.mocks.PolylineDrawing.DrawTwoPolylines.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolylineDrawing.DrawTwoPolylines.LabeledThingInFrame.frameIndex0to4,
    ]));

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
    mock(sharedMocks.concat([
      assets.mocks.PolylineDrawing.DrawTwoPolylines.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolylineDrawing.DrawTwoPolylines.LabeledThingInFrame.frameIndex0to4,
    ]));

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
    mock.teardown();
  });
});


