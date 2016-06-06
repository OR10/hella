class DetailController {
  constructor($stateParams) {
    this.userId = $stateParams.userid;
  }
}

DetailController.$inject = [
  '$stateParams',
];

export default DetailController;
