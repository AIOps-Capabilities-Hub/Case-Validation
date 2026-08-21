import { useCallback, useRef, useState } from "react";
import "./index.css";

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;
const TOKEN_URL = import.meta.env.VITE_TOKEN_URL;
const API_BASE = import.meta.env.VITE_API_BASE;
const ASSIGN_BASE = import.meta.env.VITE_ASSIGNMENT_API_BASE || API_BASE;
const isMockMode = [true, "true", "1", "yes"].includes(
  import.meta.env.VITE_MOCK_MODE,
);

const encodeId = (value) => encodeURIComponent(value);

const apiResponse = async (response, message) => {
  if (response.ok) return response.json();
  let detail = message;
  try {
    const body = await response.json();
    detail = body?.localizedValue || body?.message || detail;
  } catch {
    const text = await response.text().catch(() => "");
    if (text) detail = text;
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
    <main className="landing">
      <section className="landing-card">
        <div className="eyebrow">CASE VALIDATION</div>
        <h1>Beneficiary fulfillment</h1>
        <p>
          Review outstanding claim requirements and submit the completed
          fulfillment package.
        </p>
        <button className="primary-button" onClick={onStart}>
          Open Awaiting Fulfillment
        </button>
      </section>
    </main>
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
            const id = item.pxRefObjectKey || item.pxRefObjectInsName;
            return (
              <button
                className="case-row"
                key={item.pzInsKey}
                onClick={() => onSelect(id)}
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

const defaultRequirements = [
  {
    name: "Claimant Statement",
    detail: "FJVWPMR EANWTWUG",
    correction:
      "The Claimant Statement Submitted Lists The Deceased Insured As BEVERLY SHARRETT; However, The Name On The Claim File Is JXISVGD E QTFZXIRD. These Names Do Not Match. Please Confirm That The Correct Claimant Statement Has Been Submitted For This Claim. If The Form Was Submitted In Error, Please Resubmit A Completed And Signed Claimant Statement Referencing The Correct Insured. If The Insured Is Known By Multiple Names, Please Provide Documentation Supporting The Name Used On The Form.",
    documentStatus: "Pending",
    workbenchStatus: "NIGO",
  },
  {
    name: "Obituary",
    detail: "JXISVGD E QTFZXIRD",
    correction: "",
    documentStatus: "Pending",
    workbenchStatus: "Open",
  },
  {
    name: "Proof of Death-non FL - Certified DC",
    detail: "JXISVGD E QTFZXIRD",
    correction: "",
    documentStatus: "Pending",
    workbenchStatus: "Open",
  },
  {
    name: "Original Policy",
    detail: "YME2008991",
    correction: "",
    documentStatus: "Pending",
    workbenchStatus: "Open",
  },
];

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
}) {
  const inputRef = useRef(null);
  const [comments, setComments] = useState({});
  const content = caseData?.content || {};
  const requirements = caseData?.requirements?.length
    ? caseData.requirements
    : defaultRequirements;
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
    "Death Claim",
  );
  const claimSubType = contentValue(
    content,
    ["claimSubType", "ClaimSubType", "pyClaimSubType"],
    "Regular",
  );
  const claimSource = contentValue(
    content,
    ["claimSource", "ClaimSource", "pyClaimSource"],
    "Call",
  );
  const deathDate = contentValue(
    content,
    ["dateOfDeath", "DateOfDeath", "pyDateOfDeath"],
    "05/01/2026",
  );

  return (
    <main className="page-shell detail-page">
      <div className="detail-topline">
        <button className="text-button" onClick={onBack}>
          ← Back
        </button>
        <div className="case-reference">
          {caseData?.businessID || caseData?.ID}
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
            <strong>{dateValue(deathDate, "05/01/2026")}</strong>
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
          <button
            className="outline-button"
            onClick={chooseFile}
            disabled={uploading}
          >
            {uploading ? "UPLOADING…" : "ATTACH CONTENT"}
          </button>
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
            onClick={onSave}
            disabled={!action || submitting}
          >
            SAVE
          </button>
          <button
            className="primary-button submit-button"
            onClick={onSubmit}
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
  const [step, setStep] = useState("START");
  const [token, setToken] = useState("");
  const [cases, setCases] = useState([]);
  const [caseData, setCaseData] = useState(null);
  const [assignmentId, setAssignmentId] = useState("");
  const [actionId, setActionId] = useState("");
  const [ifMatch, setIfMatch] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("success");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState([]);

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
    async (caseRef) => {
      setStep("LOADING");
      setError("");
      setAttachments([]);
      try {
        const response = await fetch(
          `${API_BASE}/cases/${encodeId(caseRef)}?viewType=page`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const result = await apiResponse(
          response,
          "Failed to load case details.",
        );
        const data = result.data.caseInfo;
        setCaseData(data);
        const assignment = data.assignments?.[0];
        const action = assignment?.actions?.[0];
        setAssignmentId(assignment?.ID || "");
        setActionId(action?.ID || "");
        if (assignment?.ID && action?.ID) {
          const metadataResponse = await fetch(
            `${ASSIGN_BASE}/assignments/${encodeId(assignment.ID)}/actions/${action.ID}?viewType=form`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          setIfMatch(
            metadataResponse.headers.get("If-Match") ||
              metadataResponse.headers.get("ETag") ||
              "",
          );
        }
        setStep("CASE_DETAIL");
      } catch (caught) {
        setError(caught.message);
        setStep("ERROR");
      }
    },
    [token],
  );

  const uploadAttachment = useCallback(
    async (file) => {
      if (!caseData?.ID) return;
      setUploading(true);
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("contextId", caseData.ID);
        form.append("category", "BeneficiaryAttachmentList");
        form.append("appendUniqueIdToFileName", "true");
        const response = await fetch(`${API_BASE}/attachments/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
        const result = await apiResponse(response, "Attachment upload failed.");
        const id = result?.ID || result?.id;
        setAttachments((current) => [
          ...current,
          { id: id || file.name, name: file.name },
        ]);
        notify("Attachment uploaded successfully");
      } catch (caught) {
        notify(caught.message, "error");
      } finally {
        setUploading(false);
      }
    },
    [caseData, token, notify],
  );

  const save = useCallback(async () => {
    if (!assignmentId || !actionId) return;
    setSubmitting(true);
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      if (ifMatch) headers["If-Match"] = ifMatch;
      const response = await fetch(
        `${ASSIGN_BASE}/assignments/${encodeId(assignmentId)}/actions/${actionId}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ content: {} }),
        },
      );
      await apiResponse(response, "Save failed.");
      notify("Assignment saved successfully");
    } catch (caught) {
      notify(caught.message, "error");
    } finally {
      setSubmitting(false);
    }
  }, [assignmentId, actionId, token, ifMatch, notify]);

  const submit = useCallback(async () => {
    if (!assignmentId || !actionId) return;
    setSubmitting(true);
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      if (ifMatch) headers["If-Match"] = ifMatch;
      const response = await fetch(
        `${ASSIGN_BASE}/assignments/${encodeId(assignmentId)}/actions/${actionId}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ content: {} }),
        },
      );
      await apiResponse(response, "Submit failed.");
      notify("Assignment submitted successfully");
      setStep("SUCCESS");
    } catch (caught) {
      notify(caught.message, "error");
    } finally {
      setSubmitting(false);
    }
  }, [assignmentId, actionId, token, ifMatch, notify]);

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
