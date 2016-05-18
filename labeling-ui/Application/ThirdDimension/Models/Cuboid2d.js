import {Vector3} from 'three-math';

class Cuboid2d {
  constructor(vertices) {
    this._vertices = vertices;
  }
  
  get vertices() {
    return this._vertices.map(vertex => new Vector3(...vertex, 1));
  }
  
  get frontTopLeft() {
    return new Vector3(...this._vertices[0], 1);
  }
  
  get frontTopRight() {
    return new Vector3(...this._vertices[1], 1);
  }
  
  get frontBottomRight() {
    return new Vector3(...this._vertices[2], 1);
  }
  
  get frontBottomLeft() {
    return new Vector3(...this._vertices[3], 1);
  }
  
  get backTopLeft() {
    return new Vector3(...this._vertices[4], 1);
  }
  
  get backTopRight() {
    return new Vector3(...this._vertices[5], 1);
  }
  
  get backBottomRight() {
    return new Vector3(...this._vertices[6], 1);
  }
  
  get backBottomLeft() {
    return new Vector3(...this._vertices[7], 1);
  }
}

export default Cuboid2d;
