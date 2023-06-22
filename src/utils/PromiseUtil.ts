class PromiseUtil {
  allSettled<T>(promiseList: Promise<T>[]) {
    return Promise.all(
      promiseList.map((promise) =>
        promise
          .then((value) => ({
            status: 'fulfilled',
            value,
          }))
          .catch((reason) => ({
            status: 'rejected',
            reason,
          })),
      ),
    );
  }

  onlyFulfilled<T>(promiseList: Promise<T>[]) {
    return this.allSettled(promiseList).then((results) =>
      (results.filter((result) => result.status === 'fulfilled') as PromiseFulfilledResult<any>[]).map(
        (result) => result.value,
      ),
    );
  }

  sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
}

export default PromiseUtil;
