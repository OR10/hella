import mock from 'protractor-http-mock';
import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {getMockRequestsMade, initApplication} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

fdescribe('Pedestrian drawing', () => {
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


  afterEach(() => {
    mock.teardown();
  });
});
