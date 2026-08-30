import { useCallback, useEffect, useRef, useState } from "react";
import "./index.css";

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;
const TOKEN_URL = import.meta.env.VITE_TOKEN_URL;
const API_BASE = import.meta.env.VITE_API_BASE;
const NEW_ASSIGN_BASE = import.meta.env.VITE_NEW_ASSIGN_BASE || API_BASE;
const UPLOAD_BASE = import.meta.env.VITE_UPLOAD_BASE || API_BASE;
// Hard network-level abort: only fires if the server never responds at all.
// Must be large enough that it NEVER fires during normal processing.
// Pega can take 20-30 s under load (GenAI + REST connectors), so 60 s is safe.
const SUBMIT_FETCH_TIMEOUT_MS = 330000;

// After the POST returns 200, Pega's GenAI (~6 s) and REST connectors (~7 s)
// keep running asynchronously.  We pause here so that data is persisted before
// the user sees the SUCCESS screen.
const SUBMIT_POST_DELAY_MS = 300000;

const isMockMode = [true, "true", "1", "yes"].includes(
  import.meta.env.VITE_MOCK_MODE,
);

const encodeId = (value) => encodeURIComponent(value);

const apiResponse = async (response, message) => {
  const text = await response.text().catch(() => "");
  if (response.ok) {
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return { text };
    }
  }
  let detail = message;
  if (text) {
    try {
      const body = JSON.parse(text);
      if (body?.errors && Array.isArray(body.errors)) {
        const messages = body.errors.flatMap((error) =>
          (Array.isArray(error?.ValidationMessages)
            ? error.ValidationMessages
            : []
          )
            .map((item) => item?.ValidationMessage?.trim())
            .filter(Boolean),
        );
        const filteredMessages = messages.filter(
          (msg) => !/^Error Code:\s*400\s*-/i.test(msg),
        );
        if (filteredMessages.length > 0) {
          detail = filteredMessages.join("\n");
        } else if (body.errors[0]?.message) {
          detail = body.errors[0].message;
        }
      } else {
        detail = body?.localizedValue || body?.message || detail;
      }
    } catch {
      detail = text;
    }
  }
  throw new Error(detail);
};

const dateValue = (value, fallback) => {
  if (!value) return fallback;
  if (typeof value === "string" && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value))
    return value;
  try {
    return new Date(value).toLocaleDateString("en-US");
  } catch {
    return value;
  }
};

const contentValue = (content, keys, fallback) => {
  for (const key of keys) {
    if (
      content?.[key] !== undefined &&
      content?.[key] !== null &&
      content[key] !== ""
    ) {
      return content[key];
    }
  }
  return fallback;
};

function Header({ step, caseData, onHome }) {
  return (
    <header className="app-header">
      <button
        className="brand"
        onClick={onHome}
        aria-label="Case Validation home"
      >
        <span className="brand-mark">AIG</span>
        <span className="brand-copy">
          <strong>Claims Management</strong>
          <small>Beneficiary Fulfillment</small>
        </span>
      </button>
      {step === "CASE_DETAIL" && caseData && (
        <div className="header-case">{caseData.businessID || caseData.ID}</div>
      )}
    </header>
  );
}

function Toast({ message, type }) {
  if (!message) return null;
  return <div className={`toast ${type}`}>{message}</div>;
}

function Landing({ onStart }) {
  return (
    <div
      className="fade-in"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
      }}
    >
      <header
        style={{
          backgroundColor: "#1e0936",
          color: "#fff",
          padding: "16px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              backgroundColor: "#8b5cf6",
              color: "#fff",
              fontWeight: "bold",
              padding: "8px 12px",
              fontSize: "14px",
              letterSpacing: "1px",
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            CB
          </div>
          <div>
            <div
              style={{
                fontWeight: "700",
                fontSize: "16px",
                letterSpacing: "0.5px",
              }}
            >
              Corebridge Financial
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "#d8b4fe",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Policy Center
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: "24px",
            fontSize: "13px",
            fontWeight: "600",
            alignItems: "center",
          }}
        >
          <span
            style={{
              backgroundColor: "#8b5cf6",
              padding: "6px 14px",
              borderRadius: "20px",
              cursor: "pointer",
            }}
          >
            HOME
          </span>
          <span style={{ color: "#d8b4fe", cursor: "pointer" }}>
            SELF-SERVICE
          </span>
          <span style={{ color: "#d8b4fe", cursor: "pointer" }}>
            TRACK REQUEST
          </span>
        </div>
      </header>

      <div
        style={{
          background: "linear-gradient(180deg, #1e0936 0%, #3b0764 100%)",
          padding: "50px 20px 60px",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto 16px",
            position: "relative",
          }}
        >
          <input
            type="text"
            placeholder="Search by policy number, name, or policy type..."
            style={{
              width: "100%",
              padding: "14px 100px 14px 20px",
              borderRadius: "30px",
              border: "none",
              outline: "none",
              fontSize: "14px",
              color: "#333",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
            disabled
          />
          <button
            style={{
              position: "absolute",
              right: "6px",
              top: "5px",
              background: "#6b21a8",
              color: "#fff",
              border: "none",
              borderRadius: "20px",
              padding: "8px 20px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "not-allowed",
            }}
          >
            Search
          </button>
        </div>
        <div style={{ fontSize: "12px", color: "#d8b4fe" }}>
          Try: <span style={{ fontWeight: "bold" }}>POL-100234</span>,{" "}
          <span style={{ fontWeight: "bold" }}>Ava Thompson</span>, or{" "}
          <span style={{ fontWeight: "bold" }}>Health Insurance</span>
        </div>
      </div>

      <div
        style={{
          flexGrow: 1,
          padding: "50px 40px",
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#1e1b4b",
            fontSize: "24px",
            fontWeight: "700",
            marginBottom: "8px",
          }}
        >
          Self-service, on your terms
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#6b7280",
            fontSize: "14px",
            marginBottom: "40px",
          }}
        >
          Handle the most common policy requests online, 24/7 — no phone calls
          required.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "24px",
            justifyContent: "center",
            alignItems: "stretch",
          }}
        >
          <div
            className="card"
            style={{
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              opacity: 0.8,
              backgroundColor: "#fff",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#111827",
                marginBottom: "8px",
              }}
            >
              Address Change
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "#6b7280",
                flexGrow: 1,
                lineHeight: "1.5",
                marginBottom: "20px",
              }}
            >
              Update the mailing or residential address linked to your policy.
            </p>
            <div
              style={{
                color: "#a855f7",
                fontSize: "12px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              GET STARTED →
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              opacity: 0.8,
              backgroundColor: "#fff",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#111827",
                marginBottom: "8px",
              }}
            >
              Death Claim
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "#6b7280",
                flexGrow: 1,
                lineHeight: "1.5",
                marginBottom: "20px",
              }}
            >
              Initiate a death claim for a life insurance policy on behalf of a
              beneficiary.
            </p>
            <div
              style={{
                color: "#a855f7",
                fontSize: "12px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              GET STARTED →
            </div>
          </div>

          <div
            className="card"
            onClick={onStart}
            style={{
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              cursor: "pointer",
              backgroundColor: "#fff",
              borderRadius: "8px",
              border: "2px solid #a855f7",
              boxShadow: "0 10px 20px rgba(168, 85, 247, 0.15)",
              transform: "translateY(-4px)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#111827",
                marginBottom: "8px",
              }}
            >
              Awaiting Fulfillment
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "#6b7280",
                flexGrow: 1,
                lineHeight: "1.5",
                marginBottom: "20px",
              }}
            >
              Review outstanding claim requirements and submit the completed
              fulfillment package.
            </p>
            <div
              style={{
                color: "#a855f7",
                fontSize: "12px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              GET STARTED →
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              opacity: 0.8,
              backgroundColor: "#fff",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#111827",
                marginBottom: "8px",
              }}
            >
              Premium Payment Update
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "#6b7280",
                flexGrow: 1,
                lineHeight: "1.5",
                marginBottom: "20px",
              }}
            >
              Change your premium payment method, frequency, or bank details.
            </p>
            <div
              style={{
                color: "#a855f7",
                fontSize: "12px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              GET STARTED →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CaseList({ cases, onSelect, onBack }) {
  const [query, setQuery] = useState("");
  const filtered = cases.filter((item) => {
    const text =
      `${item.pxRefObjectInsName || ""} ${item.pyLabel || ""}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  return (
    <main className="page-shell">
      <section className="list-card">
        <div className="section-heading">
          <div>
            <h1>Awaiting Fulfillment</h1>
            <p>{filtered.length} cases available for review</p>
          </div>
          <button className="text-button" onClick={onBack}>
            Home
          </button>
        </div>
        <div className="list-toolbar">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search case or beneficiary"
          />
        </div>
        <div className="case-list">
          {filtered.map((item) => {
            return (
              <button
                className="case-row"
                key={item.pzInsKey}
                onClick={() => onSelect(item)}
              >
                <span className="case-row-main">
                  <strong>{item.pxRefObjectInsName}</strong>
                  <span>{item.pyLabel || "Beneficiary case"}</span>
                </span>
                <span className="case-row-meta">
                  <span>{item.pyAssignmentStatus || "Open"}</span>
                  <span>Open →</span>
                </span>
              </button>
            );
          })}
          {!filtered.length && <div className="empty">No cases found.</div>}
        </div>
      </section>
    </main>
  );
}

function RequirementRow({ item, comment, onComment }) {
  return (
    <div className="requirement-row">
      <div className="requirement-name">{item.name}</div>
      <div className="requirement-detail">{item.detail}</div>
      <div className="correction-detail">{item.correction || ""}</div>
      <div className="document-status">{item.documentStatus}</div>
      <div
        className={`workbench-status ${item.workbenchStatus === "NIGO" ? "nigo" : ""}`}
      >
        {item.workbenchStatus}
      </div>
      <div className="comment-cell">
        <textarea
          value={comment}
          onChange={(event) => onComment(event.target.value)}
          aria-label={`${item.name} beneficiary comments`}
        />
      </div>
    </div>
  );
}

function CaseDetail({
  caseData,
  onSubmit,
  onSave,
  onBack,
  submitting,
  onUpload,
  uploading,
  attachments,
  submitError,
}) {
  const inputRef = useRef(null);
  const [comments, setComments] = useState({});
  const content = caseData?.content || {};
  const requirements = caseData?.requirements || [];
  const assignment = caseData?.assignments?.[0];
  const action = assignment?.actions?.[0];

  const chooseFile = () => inputRef.current?.click();
  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) await onUpload(file);
  };

  const claimType = contentValue(
    content,
    ["claimType", "ClaimType", "pyClaimType"],
    "",
  );
  const claimSubType = contentValue(
    content,
    ["claimSubType", "ClaimSubType", "pyClaimSubType"],
    "",
  );
  const claimSource = contentValue(
    content,
    ["claimSource", "ClaimSource", "pyClaimSource"],
    "",
  );
  const deathDate = contentValue(
    content,
    ["dateOfDeath", "DateOfDeath", "pyDateOfDeath"],
    "",
  );

  return (
    <main className="page-shell detail-page">
      {submitError && (
        <div
          className="case-validation-api-message"
          role="alert"
          style={{
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
          }}
        >
          <div>Validation messages</div>
          <ul style={{ margin: "8px 0 0", paddingLeft: "20px" }}>
            {submitError.split("\n").map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="detail-topline">
        <button className="text-button" onClick={onBack}>
          ← Back
        </button>
        <div className="case-reference">
          {caseData?.businessID || caseData?.ID || ""}
        </div>
      </div>

      <section className="case-information">
        <h1>Beneficiary Case Information</h1>
        <div className="information-grid">
          <div>
            <span>Claim Type</span>
            <strong>{claimType}</strong>
          </div>
          <div>
            <span>Claim Sub Type</span>
            <strong>{claimSubType}</strong>
          </div>
          <div>
            <span>Claim Source</span>
            <strong>{claimSource}</strong>
          </div>
          <div>
            <span>Date of Death</span>
            <strong>{dateValue(deathDate, "")}</strong>
          </div>
        </div>
      </section>

      <section className="fulfillment-section">
        <div className="section-title-block">
          <h2>Awaiting Fulfillment</h2>
          <strong>Awaiting Beneficiary to respond</strong>
        </div>

        <div className="requirements-table">
          <div className="requirement-head">
            <span>Requirement</span>
            <span>Requirement Detail</span>
            <span>NIGO Correction Details</span>
            <span>Document Status</span>
            <span>WorkBench Status</span>
            <span>Beneficiary Comments</span>
          </div>
          {requirements.map((item) => (
            <RequirementRow
              key={item.name}
              item={item}
              comment={comments[item.name] || ""}
              onComment={(value) =>
                setComments((current) => ({ ...current, [item.name]: value }))
              }
            />
          ))}
        </div>

        <div className="attachment-area">
          <input ref={inputRef} type="file" onChange={handleFile} hidden />
          <div className="attach-row">
            <button
              className="outline-button"
              onClick={chooseFile}
              disabled={uploading}
            >
              ATTACH CONTENT
            </button>
            {uploading && (
              <span className="upload-status">
                <span className="loader loader--sm" />
                <span className="upload-label">Uploading…</span>
              </span>
            )}
          </div>
          {attachments.length > 0 && (
            <div className="attachment-list">
              {attachments.map((attachment) => (
                <span key={attachment.id}>{attachment.name}</span>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="form-actions">
        <button className="outline-button" onClick={onBack}>
          CANCEL
        </button>
        <div>
          <button
            className="outline-button save-button"
            onClick={() => onSave(comments)}
            disabled={!action || submitting}
          >
            SAVE
          </button>
          <button
            className="primary-button submit-button"
            onClick={() => onSubmit(comments)}
            disabled={!action || submitting}
          >
            {submitting ? "SUBMITTING…" : "SUBMIT"}
          </button>
        </div>
      </footer>
    </main>
  );
}

export default function App() {
  const [step, setStep] = useState(() => {
    try {
      const raw = sessionStorage.getItem("case-validation-pending-reload");
      if (raw) {
        const pending = JSON.parse(raw);
        if (pending && pending.caseKey) {
          return "LOADING";
        }
      }
    } catch {}
    return "START";
  });
  const [token, setToken] = useState("");
  const [cases, setCases] = useState([]);
  const [caseData, setCaseData] = useState(null);
  const [assignmentId, setAssignmentId] = useState("");
  const [ifMatch, setIfMatch] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("success");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [submitError, setSubmitError] = useState("");

  const notify = useCallback((message, type = "success") => {
    setNotice(message);
    setNoticeType(type);
    window.setTimeout(() => setNotice(""), 4000);
  }, []);

  const authenticate = useCallback(async () => {
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = await apiResponse(
      response,
      "Authentication failed — check credentials.",
    );
    return data.access_token;
  }, []);

  const getCases = useCallback(async (accessToken) => {
    const response = await fetch(
      `${API_BASE}/data_views/D_GetCasesOnAssignment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          dataViewParameters: { TaskLabel: "Awaiting Fulfillment" },
        }),
      },
    );
    return apiResponse(response, "Failed to fetch Awaiting Fulfillment cases.");
  }, []);

  const openQueue = useCallback(async () => {
    setStep("LOADING");
    setError("");
    try {
      const accessToken = await authenticate();
      setToken(accessToken);
      const result = await getCases(accessToken);
      const rows = Array.isArray(result?.data)
        ? result.data
        : result?.data?.pxResults || result?.pxResults || [];
      setCases(rows);
      setStep("CASE_LIST");
      notify(`${rows.length} cases loaded`);
    } catch (caught) {
      setError(caught.message);
      setStep("ERROR");
    }
  }, [authenticate, getCases, notify]);

  const selectCase = useCallback(
    async (caseItem, passedToken) => {
      setStep("LOADING");
      setError("");
      setAttachments([]);
      setSubmitError("");
      try {
        const assignmentId = caseItem.pzInsKey;
        const caseRef = caseItem.pxRefObjectKey || caseItem.pxRefObjectInsName;
        const activeToken = passedToken || token;

        const response = await fetch(
          `${NEW_ASSIGN_BASE}/assignments/${encodeId(assignmentId)}`,
          { headers: { Authorization: `Bearer ${activeToken}` } },
        );
        const result = await apiResponse(
          response,
          "Failed to load assignment details.",
        );

        const caseID = result.caseID || result.caseInfo?.ID || caseRef;
        setAssignmentId(assignmentId);

        let caseDetails = {};
        try {
          const caseResponse = await fetch(
            `${API_BASE}/cases/${encodeId(caseID)}?viewType=page`,
            { headers: { Authorization: `Bearer ${activeToken}` } },
          );
          if (caseResponse.ok) {
            const caseResult = await caseResponse.json();
            caseDetails =
              caseResult?.caseInfo || caseResult?.data?.caseInfo || {};
          }
        } catch (e) {
          console.warn("Failed to fetch case details:", e);
        }

        let requirements = [];
        const metaResponse = await fetch(
          `${NEW_ASSIGN_BASE}/assignments/${encodeId(assignmentId)}/actions/AwaitingFulfillment`,
          { headers: { Authorization: `Bearer ${activeToken}` } },
        );
        setIfMatch(
          metaResponse.headers.get("If-Match") ||
            metaResponse.headers.get("ETag") ||
            "",
        );

        if (metaResponse.ok) {
          const metaResult = await metaResponse.json();

          const rows = metaResult?.view?.groups?.[1]?.layout?.rows || [];
          if (Array.isArray(rows) && rows.length > 0) {
            requirements = rows.map((row) => {
              const cols = row.groups || [];
              let name = "";
              const col0 = cols[0];
              if (col0) {
                const getLinkLabel = (obj) => {
                  if (!obj) return "";
                  if (obj.control?.label) return obj.control.label;
                  if (obj.field?.control?.label) return obj.field.control.label;
                  if (Array.isArray(obj.groups)) {
                    for (const g of obj.groups) {
                      const res = getLinkLabel(g);
                      if (res) return res;
                    }
                  }
                  if (obj.layout?.groups) {
                    for (const g of obj.layout.groups) {
                      const res = getLinkLabel(g);
                      if (res) return res;
                    }
                  }
                  if (obj.layout) {
                    const res = getLinkLabel(obj.layout);
                    if (res) return res;
                  }
                  if (obj.view) {
                    const res = getLinkLabel(obj.view);
                    if (res) return res;
                  }
                  return "";
                };
                name = getLinkLabel(col0);
              }

              const findFieldValue = (fieldId) => {
                for (const col of cols) {
                  if (col?.field?.fieldID === fieldId) {
                    return col.field.value || "";
                  }
                }
                return "";
              };

              const detail = findFieldValue("RequirementDetail");
              const correction = findFieldValue("NIGOCorrectionDetails");
              const documentStatus = findFieldValue("DocumentStatus");
              const workbenchStatus = findFieldValue("WorkBenchStatus");

              return {
                name,
                detail,
                correction,
                documentStatus,
                workbenchStatus,
              };
            });
          } else {
            const actionContent =
              metaResult?.data?.caseInfo?.content ||
              metaResult?.caseInfo?.content ||
              {};
            const rawList =
              actionContent.NIGORequirementList ||
              actionContent.NIGORequirementLists ||
              actionContent.RequirementLists ||
              actionContent.RequirementList ||
              actionContent.Requirements ||
              actionContent.pyRequirementLists ||
              actionContent.pyRequirements ||
              caseDetails.content?.NIGORequirementList ||
              caseDetails.content?.RequirementLists ||
              caseDetails.content?.Requirements ||
              caseDetails.requirements ||
              [];

            if (Array.isArray(rawList) && rawList.length > 0) {
              requirements = rawList.map((r) => ({
                name:
                  r.pyRequirementName ||
                  r.RequirementName ||
                  r.Requirement ||
                  r.pyLabel ||
                  r.name ||
                  "",
                detail:
                  r.pyRequirementDetail ||
                  r.RequirementDetail ||
                  r.RequirementDescription ||
                  r.detail ||
                  r.Description ||
                  "",
                correction:
                  r.pyCorrectionDetails ||
                  r.CorrectionDetails ||
                  r.NIGOCorrectionDetails ||
                  r.correction ||
                  r.pyMessage ||
                  "",
                documentStatus:
                  r.pyDocumentStatus ||
                  r.DocumentStatus ||
                  r.documentStatus ||
                  r.pyStatus ||
                  "",
                workbenchStatus:
                  r.pyWorkbenchStatus ||
                  r.WorkbenchStatus ||
                  r.workbenchStatus ||
                  r.pyStatusWork ||
                  "",
              }));
            }
          }
        }

        const mergedCaseData = {
          ...caseDetails,
          businessID:
            caseDetails.businessID ||
            caseItem.pxRefObjectInsName ||
            caseItem.pxRefObjectKey?.split(" ").pop() ||
            "",
          ID: caseDetails.ID || caseID || caseRef,
          requirements,
          assignments: [
            {
              ID: assignmentId,
              actions: [{ ID: "AwaitingFulfillment" }],
            },
          ],
        };

        setCaseData(mergedCaseData);
        setStep("CASE_DETAIL");
      } catch (caught) {
        setError(caught.message);
        setStep("ERROR");
      }
    },
    [token],
  );
  const recover = useCallback(
    async (pending) => {
      setStep("LOADING");
      setError("");
      try {
        const accessToken = await authenticate();
        setToken(accessToken);
        const result = await getCases(accessToken);
        const rows = Array.isArray(result?.data)
          ? result.data
          : result?.data?.pxResults || result?.pxResults || [];
        setCases(rows);

        const caseItem = rows.find(
          (item) =>
            item.pxRefObjectKey === pending.caseKey ||
            item.pxRefObjectInsName === pending.caseKey ||
            item.pzInsKey === pending.caseKey ||
            item.pzInsKey?.includes(pending.caseKey) ||
            pending.caseKey?.includes(item.pxRefObjectInsName),
        );
        if (caseItem) {
          await selectCase(caseItem, accessToken);
          setSubmitError(pending.messages.join("\n"));
        } else {
          setStep("CASE_LIST");
        }
      } catch (caught) {
        setError(caught.message);
        setStep("ERROR");
      }
    },
    [authenticate, getCases, selectCase],
  );

  useEffect(() => {
    const raw = sessionStorage.getItem("case-validation-pending-reload");
    if (!raw) return;
    try {
      const pending = JSON.parse(raw);
      if (pending && pending.caseKey) {
        sessionStorage.removeItem("case-validation-pending-reload");
        setTimeout(() => {
          recover(pending);
        }, 0);
      }
    } catch (e) {
      console.error("Failed to parse pending reload data", e);
    }
  }, [recover]);

  const uploadAttachment = useCallback(
    async (file) => {
      if (!caseData?.ID) return;
      setUploading(true);
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("contextId", caseData.ID);
        form.append("appendUniqueIdToFileName", "true");
        const uploadResponse = await fetch(
          `${UPLOAD_BASE}/attachments/upload`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: form,
          },
        );
        const uploadResult = await apiResponse(
          uploadResponse,
          "Attachment upload failed.",
        );
        const uploadId = uploadResult?.ID || uploadResult?.id;

        if (!uploadId) {
          throw new Error("No upload ID returned from server.");
        }

        const attachResponse = await fetch(
          `${NEW_ASSIGN_BASE}/cases/${encodeId(caseData.ID)}/attachments`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              attachments: [
                {
                  attachmentFieldName: "ResponseAttachments",
                  category: "File",
                  ID: uploadId,
                  type: "File",
                  name: file.name,
                },
              ],
            }),
          },
        );
        const attachResult = await apiResponse(
          attachResponse,
          "Case attachment association failed.",
        );
        const finalId = attachResult?.ID || attachResult?.id || uploadId;

        setAttachments((current) => [
          ...current,
          { id: finalId, name: file.name },
        ]);
        notify("Attachment uploaded and linked successfully");
      } catch (caught) {
        notify(caught.message, "error");
      } finally {
        setUploading(false);
      }
    },
    [caseData, token, notify],
  );

  const save = useCallback(
    async (comments = {}) => {
      if (!assignmentId) return;
      setSubmitting(true);
      try {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };
        if (ifMatch) headers["If-Match"] = ifMatch;
        const reqs = caseData?.requirements || [];
        const response = await fetch(
          `${NEW_ASSIGN_BASE}/assignments/${encodeId(assignmentId)}?actionID=AwaitingFulfillment&saveOnly=true`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              content: {
                NIGORequirementList: reqs.map((req) => ({
                  BeneficiaryComments: comments[req.name] || "",
                })),
              },
            }),
          },
        );
        await apiResponse(response, "Save failed.");
        notify("Assignment saved successfully");
      } catch (caught) {
        notify(caught.message, "error");
      } finally {
        setSubmitting(false);
      }
    },
    [assignmentId, token, ifMatch, caseData, notify],
  );

  const submit = useCallback(
    async (comments = {}) => {
      if (!assignmentId) return;
      setSubmitting(true);
      setSubmitError("");

      // This abort is ONLY a dead-network guard. It must be cleared as soon as
      // the fetch succeeds so it cannot accidentally fire during the post-delay.
      const controller = new AbortController();
      const fetchTimeoutId = window.setTimeout(
        () => controller.abort(),
        SUBMIT_FETCH_TIMEOUT_MS,
      );

      try {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };
        if (ifMatch) headers["If-Match"] = ifMatch;

        const reqs = caseData?.requirements || [];
        const response = await fetch(
          `${NEW_ASSIGN_BASE}/assignments/${encodeId(assignmentId)}?actionID=AwaitingFulfillment`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              content: {
                NIGORequirementList: reqs.map((req) => ({
                  BeneficiaryComments: comments[req.name] || "",
                })),
              },
            }),
            signal: controller.signal,
          },
        );
        // Fetch resolved — disarm the abort immediately so it cannot
        // fire during the post-delay wait below.
        window.clearTimeout(fetchTimeoutId);

        await apiResponse(response, "Submit failed.");

        // The Pega backend runs GenAI classification (~6 s) and external REST
        // connectors (~7 s) asynchronously AFTER returning the 200 response.
        // We must wait here so those processes finish and persist their data
        // before we navigate away and the user considers the case complete.
        notify(
          "Submission received. Finalizing backend processing — please wait…",
        );
        await new Promise((resolve) =>
          window.setTimeout(resolve, SUBMIT_POST_DELAY_MS),
        );

        notify("Assignment submitted successfully");
        setStep("SUCCESS");
      } catch (caught) {
        window.clearTimeout(fetchTimeoutId);
        if (caught.name === "AbortError") {
          notify(
            "The server did not respond in time. Please check the assignment status before trying again.",
            "error",
          );
        } else {
          sessionStorage.setItem(
            "case-validation-pending-reload",
            JSON.stringify({
              caseKey: caseData?.ID || assignmentId,
              messages: [caught.message],
            }),
          );
          window.location.reload();
        }
      } finally {
        setSubmitting(false);
      }
    },
    [assignmentId, token, ifMatch, caseData, notify],
  );

  const home = () => {
    setCaseData(null);
    setStep("START");
  };

  return (
    <div className="app-shell">
      {step !== "START" && (
        <Header step={step} caseData={caseData} onHome={home} />
      )}
      {isMockMode && <div className="mock-strip">MOCK MODE</div>}
      <Toast message={notice} type={noticeType} />

      {step === "START" && <Landing onStart={openQueue} />}
      {step === "LOADING" && (
        <div className="state-screen">
          <span className="loader" />
          <strong>Loading…</strong>
        </div>
      )}
      {step === "ERROR" && (
        <div className="state-screen">
          <div className="error-panel">
            <strong>Unable to continue</strong>
            <p>{error}</p>
          </div>
          <div className="state-actions">
            <button className="outline-button" onClick={home}>
              HOME
            </button>
            <button className="primary-button" onClick={openQueue}>
              RETRY
            </button>
          </div>
        </div>
      )}
      {step === "CASE_LIST" && (
        <CaseList cases={cases} onSelect={selectCase} onBack={home} />
      )}
      {step === "CASE_DETAIL" && caseData && (
        <CaseDetail
          caseData={caseData}
          onSubmit={submit}
          onSave={save}
          onBack={() => setStep("CASE_LIST")}
          submitting={submitting}
          onUpload={uploadAttachment}
          uploading={uploading}
          attachments={attachments}
          submitError={submitError}
        />
      )}
      {step === "SUCCESS" && (
        <div className="state-screen">
          <div className="success-panel">
            <div className="success-check">✓</div>
            <h1>Submitted</h1>
            <p>
              The Awaiting Fulfillment assignment has been submitted
              successfully.
            </p>
            <strong>{caseData?.businessID || caseData?.ID}</strong>
          </div>
          <div className="state-actions">
            <button
              className="outline-button"
              onClick={() => setStep("CASE_LIST")}
            >
              CASE LIST
            </button>
            <button className="primary-button" onClick={openQueue}>
              NEW SESSION
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
