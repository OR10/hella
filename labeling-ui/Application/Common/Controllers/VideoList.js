export default class VideoList {
  constructor($http) {
    this.$http = $http;

    this.videos = null;

    this.loadVideoList();
  }

  loadVideoList() {
    this.$http.get("/api/video/list").then(response => {
      const {data: {result: {rows}}} = response;
      this.videos = rows;
    });
  }
}

VideoList.$inject = ['$http'];
