class StatisticsController {
  constructor(taskStatistics) {
    this.taskStatistics = taskStatistics.map(stat => {
      const hours = Math.floor(stat.totalTimeInSeconds / 3600);
      const minutes = Math.floor(stat.totalTimeInSeconds % 3600 / 60);
      const seconds = stat.totalTimeInSeconds % 60;

      stat.timeSpent = {hours, minutes, seconds};

      return stat;
    });
  }
}

StatisticsController.$inject = ['taskStatistics'];

export default StatisticsController;
