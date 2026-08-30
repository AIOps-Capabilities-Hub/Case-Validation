(() => {
  const originalFetch = window.fetch.bind(window);
  const PENDING_ERROR_KEY = "case-validation-pending-error";
  const ERROR_BANNER_CLASS = "case-validation-error-banner";

  const getValidationMessage = async (response) => {
    try {
      const body = await response.clone().json();
      const validationMessage = body?.errors
        ?.flatMap((error) =>
          Array.isArray(error?.ValidationMessages) ? error.ValidationMessages : [],
        )
        ?.find((item) => item?.ValidationMessage)?.ValidationMessage;

      return (
        validationMessage ||
        body?.errors?.[0]?.message ||
        body?.localizedValue ||
        body?.message ||
        body?.error?.message ||
        `Validation failed (HTTP ${response.status}).`
      );
    } catch {
      const text = await response.clone().text().catch(() => "");
      return text || `Validation failed (HTTP ${response.status}).`;
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

  const restoreValidationError = () => {
    const message = sessionStorage.getItem(PENDING_ERROR_KEY);
    if (!message || !document.querySelector(".detail-page")) return;
    if (showErrorBanner(message)) sessionStorage.removeItem(PENDING_ERROR_KEY);
  };

  const getCaseReference = () =>
    document.querySelector(".header-case")?.textContent?.trim() || "";

  const findAndOpenCase = (caseReference) => {
    const rows = Array.from(document.querySelectorAll(".case-row"));
    const matchingRow = rows.find((row) =>
      row.textContent?.includes(caseReference),
    );
    if (matchingRow) {
      matchingRow.click();
      return true;
    }
    return false;
  };

  const recoverAssignment = (caseReference) => {
    if (!caseReference) return;

    const detailBack = document.querySelector(".detail-topline .text-button");
    if (detailBack) {
      detailBack.click();
    } else {
      const retry = Array.from(document.querySelectorAll("button")).find(
        (button) => button.textContent?.trim() === "RETRY",
      );
      if (retry) retry.click();
    }

    const startedAt = Date.now();
    const findCase = () => {
      if (findAndOpenCase(caseReference)) return;
      if (Date.now() - startedAt < 10000) window.setTimeout(findCase, 100);
    };
    window.setTimeout(findCase, 100);
  };

  const removeSubmitFailure = () => {
    if (!sessionStorage.getItem(PENDING_ERROR_KEY)) return;
    document.querySelectorAll(".toast.error").forEach((toast) => {
      if (/submit failed|failed to fetch/i.test(toast.textContent || "")) {
        toast.remove();
      }
    });
  };

  window.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input?.url || "";
    const method = (init.method || input?.method || "GET").toUpperCase();
    const isAssignmentSubmit =
      method === "POST" &&
      url.includes("actionID=AwaitingFulfillment") &&
      !url.includes("saveOnly=true");

    if (!url.includes("actionID=AwaitingFulfillment") || !init.signal) {
      return originalFetch(input, init);
    }

    const { ...requestInit } = init;
    try {
      const response = await originalFetch(input, requestInit);

      if (isAssignmentSubmit) {
        const message = await getValidationMessage(response);
        const hasValidationError = message !== `Validation failed (HTTP ${response.status}).`;

        if (hasValidationError) {
          sessionStorage.setItem(PENDING_ERROR_KEY, message);
          const caseReference = getCaseReference();
          window.setTimeout(() => recoverAssignment(caseReference), 0);
        }
      }

      return response;
    } catch (error) {
      throw error;
    }
  };

  const observer = new MutationObserver(() => {
    removeSubmitFailure();
    restoreValidationError();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  restoreValidationError();
})();
