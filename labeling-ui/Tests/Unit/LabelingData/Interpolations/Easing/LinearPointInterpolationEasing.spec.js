import InterpolationEasing from 'Application/LabelingData/Interpolations/Easing/InterpolationEasing';
import LinearPointInterpolationEasing from 'Application/LabelingData/Interpolations/Easing/LinearPointInterpolationEasing';

describe('LinearPointInterpolationEasing Test Suite', () => {
  /**
   * @type {LinearPointInterpolationEasing}
   */
  let easing;

  beforeEach(() => {
    easing = new LinearPointInterpolationEasing();
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
    it('returns true if shape is point', () => {
      const actual = easing.supportsShape('point');
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
        point: {x: 1, y: 1}
      };

      const endShape = {
        point: {x: 5, y: 5}
      };

      const ghost = {shapes: [ghostShape]};
      const endLtif = {shapes: [endShape]};

      const expectedGhostShapeAfterEasing = {
        point: {x: 3, y: 3}
      };

      easing.step(ghost, null, endLtif, delta);

      expect(ghostShape).toEqual(expectedGhostShapeAfterEasing);
    });
  });
});