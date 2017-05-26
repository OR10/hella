import PageTitleTemplate from './PageTitle.html!';
import PageTitleController from './PageTitleController';

class PageTitleDirective
{
  constructor() {
    this.template = PageTitleTemplate;
    this.scope = {
      title: '@',
    };
    this.bindToController = true;
    this.controllerAs = 'vm';
    this.controller = PageTitleController;
  }
}

export default PageTitleDirective;

