function ReadableTimespanFilterProvider() {
  return function readableTimespan(timespanInSeconds) {
    const hours = parseInt(timespanInSeconds / 3600, 10) % 24;
    const minutes = parseInt(timespanInSeconds / 60, 10) % 60;
    const days = parseInt(timespanInSeconds / 86400, 10) % 86400;
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };
}

export default ReadableTimespanFilterProvider;
