import FrontendInterpolation from 'Application/LabelingData/Interpolations/FrontendInterpolation';

fdescribe('FrontendInterpolation Test Suite', () => {
  it('can be instantiated', () => {
    const interpolation = new FrontendInterpolation();
    expect(interpolation).toEqual(jasmine.any(FrontendInterpolation));
  });
});