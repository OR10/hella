/**
 * Controller of the {@link UsersGridDirective}
 */
class UsersGridController {
  /**
   * @param {$rootScope.$scope} $scope
   * @param {UserGateway} userGateway injected
   */
  constructor($scope, userGateway) {
    /**
     * List of tasks rendered by the directive
     * @type {null|Array.<Task>}
     */
    this.tasks = null;

    /**
     * @type {boolean}
     */
    this.loadingInProgress = false;

    /**
     * @type {UserGateway}
     * @private
     */
    this._userGateway = userGateway;

    /**
     * @type {Array.<User>}
     */
    this.users = [];

    /**
     * @type {Array<Object>}}
     */
    this.columns = [
      {headerName: 'Id', field: 'id'},
      {headerName: 'Name', field: 'username'},
      {headerName: 'EMail', field: 'email'},
    ];

    /**
     * @type {{columnDefs: Array.<Object>, rowData: Array}}
     */
    this.gridOptions = {
      columnDefs: this.columns,
      rowData: [],
    };

    $scope.$watch('vm.users', users => this.gridOptions.api.setRowData(users));

    this._loadUsersList();
  }

  /**
   * Retrieve a fresh list of {@link User} objects from the backend.
   *
   * @private
   */
  _loadUsersList() {
    this.users = [
      {id: '1', username: 'me', email: 'foo@bar.baz'},
      {id: '2', username: 'you', email: 'blub@blib.blab'},
    ];
    //this.loadingInProgress = true;
    //this._userGateway.getUsers()
    //  .then(users => {
    //    this.users = users;
    //    this.loadingInProgress = false;
    //  });
  }
}

UsersGridController.$inject = [
  '$scope',
  'userGateway',
];

export default UsersGridController;
