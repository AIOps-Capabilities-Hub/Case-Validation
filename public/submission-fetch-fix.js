(() => {
  const originalFetch = window.fetch.bind(window);
  const STORAGE_KEY = "case-validation-pending-reload";
  let reloadScheduled = false;

  const isAssignmentSubmit = (input, init) => {
    const url = typeof input === "string" ? input : input?.url || "";
    const method = (init?.method || input?.method || "GET").toUpperCase();
    return method === "POST" && /\/assignments\/[^?]+\?actionID=AwaitingFulfillment(?:&|$)/i.test(url);
  };

  const extractValidationMessages = (body) =>
    (Array.isArray(body?.errors) ? body.errors : []).flatMap((error) =>
      (Array.isArray(error?.ValidationMessages) ? error.ValidationMessages : [])
        .map((item) => item?.ValidationMessage?.trim())
        .filter(Boolean),
    );

  const assignmentIdFrom = (input) => {
    const url = typeof input === "string" ? input : input?.url || "";
    const match = url.match(/\/assignments\/([^?]+)/i);
    return match ? decodeURIComponent(match[1]) : "";
  };

  const getCaseReference = () =>
    document.querySelector(".header-case")?.textContent?.trim() ||
    document.querySelector(".case-reference")?.textContent?.trim() ||
    "";

  const getPending = () => {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
    } catch {
      return null;
    }
  };

  const displayValidation = (pending) => {
    const detail = document.querySelector(".detail-page");
    if (!detail || !pending?.messages?.length) return false;

    let banner = detail.querySelector(".case-validation-api-message");
    if (!banner) {
      banner = document.createElement("div");
      banner.className = "case-validation-api-message";
      banner.setAttribute("role", "alert");
      Object.assign(banner.style, {
        margin: "0 0 18px",
        padding: "14px 18px",
        border: "1px solid #dc2626",
        borderRadius: "6px",
        background: "#fef2f2",
        color: "#991b1b",
        fontSize: "14px",
        fontWeight: "600",
        lineHeight: "1.5",
        boxSizing: "border-box",
        width: "100%",
      });
      detail.insertBefore(banner, detail.firstChild);
    }

    banner.replaceChildren();
    const heading = document.createElement("div");
    heading.textContent = "Validation messages";
    banner.appendChild(heading);
    const list = document.createElement("ul");
    Object.assign(list.style, { margin: "8px 0 0", paddingLeft: "20px" });
    pending.messages.forEach((message) => {
      const item = document.createElement("li");
      item.textContent = message;
      list.appendChild(item);
    });
    banner.appendChild(list);
    sessionStorage.removeItem(STORAGE_KEY);
    return true;
  };

  const recoverAssignment = () => {
    const pending = getPending();
    if (!pending || displayValidation(pending)) return;

    const rows = Array.from(document.querySelectorAll(".case-row"));
    if (rows.length) {
      const reference = (pending.caseReference || "").toLowerCase();
      const row = rows.find((item) =>
        (item.textContent || "").toLowerCase().includes(reference),
      );
      if (row) row.click();
      return;
    }

    const startCard = Array.from(document.querySelectorAll(".card")).find((item) =>
      /awaiting fulfillment/i.test(item.textContent || ""),
    );
    if (startCard) startCard.click();

    window.setTimeout(recoverAssignment, 150);
  };

  window.fetch = async (input, init) => {
    const response = await originalFetch(input, init);
    if (!isAssignmentSubmit(input, init) || reloadScheduled) return response;

    try {
      const body = await response.clone().json();
      const messages = extractValidationMessages(body);
      if (messages.length) {
        reloadScheduled = true;
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            assignmentId: assignmentIdFrom(input),
            caseReference: getCaseReference(),
            messages,
          }),
        );
        window.setTimeout(() => window.location.reload(), 0);
      }
    } catch {
      return response;
    }

    return response;
  };

  new MutationObserver(recoverAssignment).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  recoverAssignment();
})();
