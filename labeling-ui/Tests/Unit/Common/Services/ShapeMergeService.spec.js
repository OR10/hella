import { inject } from 'angular-mocks';
import ShapeMergeService from 'Application/Common/Services/ShapeMergeService';

describe('ShapeMergeService', () => {
  /**
   * @type {ShapeMergeService}
   */
  let service;

  /**
   * @type {LabeledThingInFrameGateway}
   */
  let labeledThingInFrameGateway;

  /**
   * @type {$q}
   */
  let angularQ;

  /**
   * @type {$rootScope}
   */
  let rootScope;

  /**
   * @type {LabeledThingGateway}
   */
  let labeledThingGateway;

  let firstFrameRange;
  let secondFrameRange;
  let thirdFrameRange;
  let firstLabeledThing;
  let secondLabeledThing;
  let thirdLabeledThing;
  let firstLabeledThingInFrame;
  let secondLabeledThingInFrame;
  let thirdLabeledThingInFrame;
  let fourthLabeledThingInFrame;
  let firstShape;
  let secondShape;
  let thirdShape;
  let fourthShape;
  let mergableShapes;

  beforeEach(inject(($rootScope, $q) => {
    rootScope = $rootScope;
    angularQ = $q;
  }));

  beforeEach(() => {
    labeledThingInFrameGateway = jasmine.createSpyObj('labeledThingInFrameGateway', ['saveLabeledThingInFrame']);
    labeledThingGateway = jasmine.createSpyObj('labeledThingGateway', ['deleteLabeledThing', 'hasAssociatedLabeledThingsInFrames', 'getAssociatedLabeledThingsInFrames']);
    service = new ShapeMergeService(rootScope, angularQ, labeledThingInFrameGateway, labeledThingGateway);
  });

  beforeEach(() => {
    firstFrameRange = {startFrameIndex: 0, endFrameIndex: 0};
    secondFrameRange = {startFrameIndex: 3, endFrameIndex: 3};
    thirdFrameRange = {startFrameIndex: 7, endFrameIndex: 7};

    firstLabeledThing = {ltid: 1, frameRange: firstFrameRange};
    secondLabeledThing = {ltid: 2, frameRange: secondFrameRange};
    thirdLabeledThing = {ltid: 3, frameRange: thirdFrameRange};

    firstLabeledThingInFrame = {litfid: 1, labeledThing: firstLabeledThing, frameIndex: 0};
    secondLabeledThingInFrame = {litfid: 2, labeledThing: secondLabeledThing, frameIndex: 1};
    thirdLabeledThingInFrame = {litfid: 3, labeledThing: thirdLabeledThing, frameIndex: 2};
    fourthLabeledThingInFrame = {litfid: 4, labeledThing: thirdLabeledThing, frameIndex: 3};

    firstShape = {labeledThingInFrame: firstLabeledThingInFrame};
    secondShape = {labeledThingInFrame: secondLabeledThingInFrame};
    thirdShape = {labeledThingInFrame: thirdLabeledThingInFrame};
    fourthShape = {labeledThingInFrame: fourthLabeledThingInFrame};

    mergableShapes = [firstShape, secondShape, thirdShape];
  });

  beforeEach(() => {
    labeledThingInFrameGateway.saveLabeledThingInFrame.and.returnValue(angularQ.resolve());
    labeledThingGateway.deleteLabeledThing.and.returnValue(angularQ.resolve());

    labeledThingGateway.getAssociatedLabeledThingsInFrames.and.callFake(labeledThing => {
      switch(labeledThing) {
        case firstLabeledThing:
          return angularQ.resolve([firstLabeledThingInFrame]);

        case secondLabeledThing:
          return angularQ.resolve([secondLabeledThingInFrame]);

        case thirdLabeledThing:
          return angularQ.resolve([thirdLabeledThingInFrame, fourthLabeledThingInFrame]);

        default:
          return [];
      }
    });
  });

  it('can be created', () => {
    expect(service).toEqual(jasmine.any(ShapeMergeService));
  });

  describe('mergeShapes', () => {
    it('sets the LabeledThing of the root shape on all elements', () => {
      service.mergeShapes(mergableShapes);
      rootScope.$apply();

      expect(firstLabeledThingInFrame.labeledThing).toBe(firstLabeledThing);
      expect(secondLabeledThingInFrame.labeledThing).toBe(firstLabeledThing);
      expect(thirdLabeledThingInFrame.labeledThing).toBe(firstLabeledThing);
    });

    it('stores the ltifs', () => {
      service.mergeShapes(mergableShapes);
      rootScope.$apply();

      expect(labeledThingInFrameGateway.saveLabeledThingInFrame).toHaveBeenCalledTimes(3);
      expect(labeledThingInFrameGateway.saveLabeledThingInFrame).not.toHaveBeenCalledWith(firstLabeledThingInFrame);
      expect(labeledThingInFrameGateway.saveLabeledThingInFrame).toHaveBeenCalledWith(secondLabeledThingInFrame);
      expect(labeledThingInFrameGateway.saveLabeledThingInFrame).toHaveBeenCalledWith(thirdLabeledThingInFrame);
      expect(labeledThingInFrameGateway.saveLabeledThingInFrame).toHaveBeenCalledWith(fourthLabeledThingInFrame);
    });

    it('returns a promise', done => {
      labeledThingGateway.hasAssociatedLabeledThingsInFrames.and.returnValue(angularQ.resolve(true));

      service.mergeShapes(mergableShapes).then(done);
      rootScope.$apply();
    });

    it('transfers the classes', () => {
      const classes = ['one', 'two', 'three'];
      secondLabeledThingInFrame.classes = classes;
      const shapes = [secondShape, thirdShape, firstShape];

      service.mergeShapes(shapes);
      rootScope.$apply();

      expect(firstLabeledThingInFrame.classes).toBe(classes);
      expect(secondLabeledThingInFrame.classes).toBe(classes);
      expect(thirdLabeledThingInFrame.classes).toBe(classes);
    });

    it('transfers the incomplete state', () => {
      firstLabeledThingInFrame.incomplete = true;
      secondLabeledThingInFrame.incomplete = false;
      thirdLabeledThingInFrame.incomplete = false;

      service.mergeShapes(mergableShapes);
      rootScope.$apply();

      expect(firstLabeledThingInFrame.incomplete).toBe(true);
      expect(secondLabeledThingInFrame.incomplete).toBe(true);
      expect(thirdLabeledThingInFrame.incomplete).toBe(true);
    });

    it('updates the frameRange of the LabeledThing', () => {
      service.mergeShapes(mergableShapes);

      const expectedFrameRange = {startFrameIndex: 0, endFrameIndex: 7};
      expect(firstLabeledThing.frameRange).toEqual(expectedFrameRange);
    });

    it('emits shape:merge:after', done => {
      spyOn(rootScope, '$emit');

      labeledThingGateway.hasAssociatedLabeledThingsInFrames.and.returnValue(angularQ.resolve(true));

      service.mergeShapes(mergableShapes).then(() => {
        expect(rootScope.$emit).toHaveBeenCalledWith('shape:merge:after');
        done();
      });
      rootScope.$apply();
    });

    it('moves all the ltifs to the root object and deletes the other lts only once', done => {
      labeledThingGateway.hasAssociatedLabeledThingsInFrames.and.returnValue(angularQ.resolve(false));

      // make sure LT3 is available two times for this test
      mergableShapes.push(fourthShape);

      service.mergeShapes(mergableShapes).then(() => {
        expect(labeledThingGateway.deleteLabeledThing).toHaveBeenCalledTimes(2);
        expect(labeledThingGateway.deleteLabeledThing).not.toHaveBeenCalledWith(firstLabeledThing);
        expect(labeledThingGateway.deleteLabeledThing).toHaveBeenCalledWith(secondLabeledThing);
        expect(labeledThingGateway.deleteLabeledThing).toHaveBeenCalledWith(thirdLabeledThing);

        expect(firstLabeledThingInFrame.labeledThing).toBe(firstLabeledThing);
        expect(secondLabeledThingInFrame.labeledThing).toBe(firstLabeledThing);
        expect(thirdLabeledThingInFrame.labeledThing).toBe(firstLabeledThing);
        expect(fourthLabeledThingInFrame.labeledThing).toBe(firstLabeledThing);

        expect(labeledThingInFrameGateway.saveLabeledThingInFrame).toHaveBeenCalledTimes(3);
        expect(labeledThingInFrameGateway.saveLabeledThingInFrame).not.toHaveBeenCalledWith(firstLabeledThingInFrame);
        expect(labeledThingInFrameGateway.saveLabeledThingInFrame).toHaveBeenCalledWith(secondLabeledThingInFrame);
        expect(labeledThingInFrameGateway.saveLabeledThingInFrame).toHaveBeenCalledWith(thirdLabeledThingInFrame);
        expect(labeledThingInFrameGateway.saveLabeledThingInFrame).toHaveBeenCalledWith(fourthLabeledThingInFrame);

        done();
      });

      rootScope.$apply();
    });

    it('moves all the ltifs to the root object and deletes the other lts', done => {
      labeledThingGateway.hasAssociatedLabeledThingsInFrames.and.returnValue(angularQ.resolve(false));

      // fourthShape is not part of mergableShapes, but part of thirdLabeledThing and shoule be moved aswell
      service.mergeShapes(mergableShapes).then(() => {
        expect(labeledThingGateway.deleteLabeledThing).toHaveBeenCalledTimes(2);
        expect(labeledThingGateway.deleteLabeledThing).not.toHaveBeenCalledWith(firstLabeledThing);
        expect(labeledThingGateway.deleteLabeledThing).toHaveBeenCalledWith(secondLabeledThing);
        expect(labeledThingGateway.deleteLabeledThing).toHaveBeenCalledWith(thirdLabeledThing);

        expect(firstLabeledThingInFrame.labeledThing).toBe(firstLabeledThing);
        expect(secondLabeledThingInFrame.labeledThing).toBe(firstLabeledThing);
        expect(thirdLabeledThingInFrame.labeledThing).toBe(firstLabeledThing);
        expect(fourthLabeledThingInFrame.labeledThing).toBe(firstLabeledThing);

        expect(labeledThingInFrameGateway.saveLabeledThingInFrame).toHaveBeenCalledTimes(3);
        expect(labeledThingInFrameGateway.saveLabeledThingInFrame).not.toHaveBeenCalledWith(firstLabeledThingInFrame);
        expect(labeledThingInFrameGateway.saveLabeledThingInFrame).toHaveBeenCalledWith(secondLabeledThingInFrame);
        expect(labeledThingInFrameGateway.saveLabeledThingInFrame).toHaveBeenCalledWith(thirdLabeledThingInFrame);
        expect(labeledThingInFrameGateway.saveLabeledThingInFrame).toHaveBeenCalledWith(fourthLabeledThingInFrame);

        done();
      });

      rootScope.$apply();
    });

    it('makes sure there are no two ltifs on the same frame, using root as the higher priority ltifs', () => {
      firstLabeledThingInFrame.frameIndex = 0;
      secondLabeledThingInFrame.frameIndex = 1;
      thirdLabeledThingInFrame.frameIndex = 0;
      fourthLabeledThingInFrame.frameIndex = 1;

      service.mergeShapes(mergableShapes);
      rootScope.$apply();

      expect(firstLabeledThingInFrame.labeledThing).toBe(firstLabeledThing);
      expect(secondLabeledThingInFrame.labeledThing).toBe(firstLabeledThing);
      expect(thirdLabeledThingInFrame.labeledThing).toBe(thirdLabeledThing);
      expect(fourthLabeledThingInFrame.labeledThing).toBe(thirdLabeledThing);
    });
  });
});