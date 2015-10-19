import template from './Demo.html!';

export default class Demo {
  constructor() {
    this.scope = {
      "title": '@'
    };

    this.template = template;
  }
}