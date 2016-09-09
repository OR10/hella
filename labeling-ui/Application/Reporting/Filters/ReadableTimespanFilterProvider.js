function ReadableTimespanFilterProvider() {
  return function readableTimespan(timespanInSeconds) {
    const totalMinutes = timespanInSeconds / 60;
    const time = Math.round(totalMinutes / 6) / 10;
    return `${time}h`;
  };
}

export default ReadableTimespanFilterProvider;
