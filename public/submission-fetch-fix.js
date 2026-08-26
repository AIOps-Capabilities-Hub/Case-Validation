(() => {
  const originalFetch = window.fetch.bind(window);

  window.fetch = (input, init = {}) => {
    const url = typeof input === "string" ? input : input?.url || "";
    if (url.includes("actionID=AwaitingFulfillment") && init.signal) {
      const { signal, ...requestInit } = init;
      return originalFetch(input, requestInit);
    }
    return originalFetch(input, init);
  };
})();
