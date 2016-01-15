class StatisticsController {
  constructor(taskStatistics) {
    this.taskStatistics = taskStatistics.map(stat => {
      const hours = Math.floor(stat.totalLabelingTimeInSeconds / 3600);
      const minutes = Math.floor(stat.totalLabelingTimeInSeconds % 3600 / 60);

      stat.timeSpent = {hours, minutes};

      return stat;
    });
  }
}

StatisticsController.$inject = ['taskStatistics'];

export default StatisticsController;
