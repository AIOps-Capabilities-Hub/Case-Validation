(() => {
  const originalFetch = window.fetch.bind(window);
  const PENDING_ERROR_KEY = "case-validation-pending-error";
  const ERROR_BANNER_CLASS = "case-validation-error-banner";

  const getErrorMessage = async (response) => {
    const fallback = `Validation failed (HTTP ${response.status}).`;
    try {
      const text = await response.clone().text();
      if (!text) return fallback;
      try {
        const body = JSON.parse(text);
        return (
          body?.localizedValue ||
          body?.message ||
          body?.error?.message ||
          body?.errors?.[0]?.message ||
          fallback
        );
      } catch {
        return text;
      }
    } catch {
      return fallback;
    }
  };

  const showErrorBanner = (message) => {
    const detailPage = document.querySelector(".detail-page");
    if (!detailPage) return false;

    const existing = detailPage.querySelector(`.${ERROR_BANNER_CLASS}`);
    if (existing) {
      existing.textContent = message;
      return true;
    }

    const banner = document.createElement("div");
    banner.className = ERROR_BANNER_CLASS;
    banner.setAttribute("role", "alert");
    banner.textContent = message;
    Object.assign(banner.style, {
      width: "100%",
      margin: "0 0 18px",
      padding: "14px 16px",
      border: "1px solid #fda4af",
      borderRadius: "6px",
      background: "#fff1f2",
      color: "#9f1239",
      fontSize: "13px",
      fontWeight: "600",
      lineHeight: "1.5",
      boxSizing: "border-box",
    });
    detailPage.insertBefore(banner, detailPage.firstChild);
    return true;
  };

  const rememberValidationError = (message) => {
    sessionStorage.setItem(PENDING_ERROR_KEY, message);
  };

  const restoreValidationError = () => {
    const message = sessionStorage.getItem(PENDING_ERROR_KEY);
    if (!message || !document.querySelector(".detail-page")) return;
    if (showErrorBanner(message)) sessionStorage.removeItem(PENDING_ERROR_KEY);
  };

  const reopenAssignment = (caseReference) => {
    const backButton = document.querySelector(".detail-topline .text-button");
    if (!backButton) return;

    backButton.click();

    const startedAt = Date.now();
    const findCase = () => {
      const rows = Array.from(document.querySelectorAll(".case-row"));
      const matchingRow = rows.find((row) =>
        row.textContent?.includes(caseReference),
      );

      if (matchingRow) {
        matchingRow.click();
        return;
      }

      if (Date.now() - startedAt < 10000) {
        window.setTimeout(findCase, 100);
      }
    };

    window.setTimeout(findCase, 100);
  };

  window.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input?.url || "";
    const method = (init.method || input?.method || "GET").toUpperCase();
    const isSubmit =
      method === "POST" &&
      url.includes("actionID=AwaitingFulfillment") &&
      !url.includes("saveOnly=true");

    if (!url.includes("actionID=AwaitingFulfillment") || !init.signal) {
      return originalFetch(input, init);
    }

    const { ...requestInit } = init;
    const response = await originalFetch(input, requestInit);

    if (isSubmit && !response.ok) {
      const message = await getErrorMessage(response);
      const caseReference =
        document.querySelector(".header-case")?.textContent?.trim() || "";

      rememberValidationError(message);
      if (caseReference) {
        window.setTimeout(() => reopenAssignment(caseReference), 150);
      }
    }

    return response;
  };

  const observer = new MutationObserver(() => restoreValidationError());
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  restoreValidationError();
})();
