import ImageFactory from '../../../Application/Frame/Services/ImageFactory';

describe('ImageFactory', () => {
  function createImageFactory() {
    return new ImageFactory();
  }

  it('should instantiate', () => {
    const factory = createImageFactory();
    expect(factory).toEqual(jasmine.any(ImageFactory));
  });

  it('should create image', () => {
    const factory = createImageFactory();
    const image = factory.createImage();
    expect(image.nodeName).toEqual('IMG');
    expect(image.nodeType).toEqual(1);
  });
});