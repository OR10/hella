import videoListTemplate from './VideoList.html!';
import VideoListController from '../Controllers/VideoList';

export default class VideoList {
  constructor() {
    this.template = videoListTemplate;

    this.controller = VideoListController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}
