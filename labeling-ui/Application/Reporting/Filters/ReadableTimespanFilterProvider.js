function ReadableTimespanFilterProvider() {
  return function readableTimespan(timespanInSeconds) {
    const hours = parseInt(timespanInSeconds / 3600, 10) % 24;
    const minutes = parseInt(timespanInSeconds / 60, 10) % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };
}

export default ReadableTimespanFilterProvider;
