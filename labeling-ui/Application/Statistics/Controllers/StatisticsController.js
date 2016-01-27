class StatisticsController {
  constructor(user, userPermissions, taskStatistics) {
    this.user = user;

    this.userPermissions = userPermissions;

    this.taskStatistics = taskStatistics.map(stat => {
      const hours = Math.floor(stat.totalLabelingTimeInSeconds / 3600);
      const minutes = Math.floor(stat.totalLabelingTimeInSeconds % 3600 / 60);

      stat.timeSpent = {hours, minutes};

      return stat;
    });
  }
}

StatisticsController.$inject = [
  'user',
  'userPermissions',
  'taskStatistics',
];

export default StatisticsController;
