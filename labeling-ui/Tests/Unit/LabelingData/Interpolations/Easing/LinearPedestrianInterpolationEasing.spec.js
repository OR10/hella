import InterpolationEasing from 'Application/LabelingData/Interpolations/Easing/InterpolationEasing';
import LinearPedestrianInterpolationEasing from 'Application/LabelingData/Interpolations/Easing/LinearPedestrianInterpolationEasing';

fdescribe('LinearPedestrianInterpolationEasing Test Suite', () => {
  /**
   * @type {LinearPedestrianInterpolationEasing}
   */
  let easing;

  beforeEach(() => {
    easing = new LinearPedestrianInterpolationEasing();
  });

  it('can be instantiated', () => {
    expect(easing).toEqual(jasmine.any(InterpolationEasing));
  });

  describe('supportsEasing', () => {
    it('returns true if type is linear', () => {
      const actual = easing.supportsEasing('linear');
      expect(actual).toBe(true);
    });

    it('returns false if type is anything else', () => {
      const actual = easing.supportsEasing('something-not-linear');
      expect(actual).toBe(false);
    });
  });

  describe('supportsShape', () => {
    it('returns true if shape is pedestrian', () => {
      const actual = easing.supportsShape('pedestrian');
      expect(actual).toBe(true);
    });

    it('returns true if shape is something else', () => {
      const actual = easing.supportsShape('cuboid3d');
      expect(actual).toBe(false);
    });
  });

  describe('step()', () => {
    it('calculates the step between the ghost and the end shape', () => {
      const delta = 0.5;

      const ghostShape = {
        topCenter: {x: 1, y: 1},
        bottomCenter: {x: 1, y: 5}
      };

      const endShape = {
        topCenter: {x: 5, y: 2},
        bottomCenter: {x: 3, y: 3}
      };

      const ghost = {shapes: [ghostShape]};
      const endLtif = {shapes: [endShape]};

      const expectedGhostShapeAfterEasing = {
        topCenter: { x: 3, y: 1.5 },
        bottomCenter: { x: 2, y: 4 }
      };

      easing.step(ghost, null, endLtif, delta);

      expect(ghostShape).toEqual(expectedGhostShapeAfterEasing);
    });
  });
});