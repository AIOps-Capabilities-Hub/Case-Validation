import { useState, useCallback, useRef } from "react";
import "./index.css";

/* ── Environment ──────────────────────────────────────────────── */
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;
const TOKEN_URL = import.meta.env.VITE_TOKEN_URL;
const API_BASE = import.meta.env.VITE_API_BASE;
const ASSIGN_BASE =
  import.meta.env.VITE_ASSIGNMENT_API_BASE || import.meta.env.VITE_API_BASE;

/* ── Helpers ──────────────────────────────────────────────────── */
const encodeId = (id) => encodeURIComponent(id);

const urgencyClass = (u) => {
  const n = Number(u);
  if (n >= 50) return "high";
  if (n >= 20) return "medium";
  return "low";
};

const urgencyLabel = (u) => {
  const n = Number(u);
  if (n >= 50) return "High";
  if (n >= 20) return "Medium";
  return "Low";
};

const statusPillClass = (s = "") => {
  const lower = s.toLowerCase();
  if (lower.includes("claimant")) return "open-claimant";
  if (lower.includes("open")) return "open";
  if (lower.includes("pending")) return "pending";
  return "closed";
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const isSlaWarning = (iso) => {
  if (!iso) return false;
  const diff = new Date(iso) - Date.now();
  return diff < 48 * 60 * 60 * 1000; // within 48h
};

const handleApiResponse = async (res, defaultErrorMsg) => {
  if (res.ok) return res.json();
  let errorMsg = defaultErrorMsg;
  try {
    const j = await res.json();
    if (j?.localizedValue) errorMsg = j.localizedValue;
    else if (j?.message) errorMsg = j.message;
  } catch {
    try {
      const t = await res.text();
      if (t) errorMsg = t;
    } catch {
      /* empty */
    }
  }
  throw new Error(errorMsg);
};

/* ── Toast ────────────────────────────────────────────────────── */
function Toast({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast ${t.type}`}
          onClick={() => onRemove(t.id)}
          style={{ cursor: "pointer" }}
        >
          <span className="toast-icon">
            {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}
          </span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

/* ── Stages Bar ───────────────────────────────────────────────── */
function StagesBar({ stages = [] }) {
  if (!stages.length) return null;
  const primaryStages = stages.filter((s) => s.type === "Primary");
  return (
    <div className="stages-bar">
      {primaryStages.map((s, i) => (
        <div key={s.ID} className={`stage-item ${s.visited_status}`}>
          <div className={`stage-dot ${s.visited_status}`}>
            {s.visited_status === "completed" ? "✓" : i + 1}
          </div>
          <span className="stage-label">{s.name}</span>
          {i < primaryStages.length - 1 && <span className="stage-connector" />}
        </div>
      ))}
    </div>
  );
}

/* ── Participant Card ─────────────────────────────────────────── */
function ParticipantCard({ participant }) {
  if (!participant.fullName && !participant.firstName) return null;
  const initials =
    [participant.firstName?.[0], participant.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "?";
  return (
    <div className="participant-card fade-in">
      <div className="participant-avatar">{initials}</div>
      <div className="participant-info">
        <div className="participant-name">
          {participant.fullName ||
            `${participant.firstName} ${participant.lastName}`}
        </div>
        {participant.role && (
          <div className="participant-role">{participant.role}</div>
        )}
        {participant.email && (
          <div className="participant-email">{participant.email}</div>
        )}
      </div>
    </div>
  );
}

/* ── Case Detail View ─────────────────────────────────────────── */
function CaseDetailView({
  caseData,
  referencedUsers = {},
  onSubmit,
  submitting,
  onBack,
}) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!caseData) return null;

  const {
    ID,
    businessID,
    name,
    status,
    urgency,
    stageLabel,
    caseTypeName,
    owner,
    createTime,
    lastUpdateTime,
    parentCaseInfo,
    sla,
    participants = [],
    stages = [],
    assignments = [],
  } = caseData;

  const assignment = assignments[0];
  const action = assignment?.actions?.[0];

  // Resolve operator IDs to names from referencedUsers map
  const resolveUser = (id) =>
    id && referencedUsers[id]?.UserName
      ? referencedUsers[id].UserName
      : id || "—";

  const validParticipants = participants.filter(
    (p) => p.fullName || p.firstName,
  );

  return (
    <div className="app-body">
      <main className="main-content fade-in">
        {/* Case info bar */}
        <div className="case-info-bar">
          <div className="case-info-left">
            <div className="case-icon">Case</div>
            <div>
              <div className="case-title">
                {name || "Life Beneficiary Unit"}
              </div>
              <div className="case-id">
                {ID} {businessID && `· ${businessID}`}
              </div>
            </div>
          </div>
          <div className="case-meta">
            <div className="meta-chip">
              Class: <strong>{caseTypeName || "Beneficiary"}</strong>
            </div>
            <div className={`urgency-dot ${urgencyClass(urgency)}`}>
              Urgency: {urgencyLabel(urgency)} ({urgency})
            </div>
            <span
              className={`status-pill ${statusPillClass(status)}`}
              style={{ fontSize: 12, padding: "4px 12px" }}
            >
              {status || "Open"}
            </span>
          </div>
        </div>

        {/* Active assignment banner */}
        {assignment && (
          <div className="assignment-banner fade-in">
            <div className="assignment-banner-info">
              <div className="assignment-banner-icon">Task</div>
              <div>
                <div className="assignment-banner-name">
                  {assignment.name || "Awaiting Fulfillment"}
                </div>
                <div className="assignment-banner-sub">
                  {assignment.instructions} ·{" "}
                  {assignment.assigneeInfo?.name ||
                    assignment.assigneeInfo?.ID ||
                    "—"}
                  {action && ` · Action: ${action.ID}`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="card" style={{ padding: 0 }}>
          <div className="tab-list">
            {[
              { id: "overview", label: "Overview" },
              { id: "participants", label: "Participants" },
              { id: "stages", label: "Stages" },
              { id: "sla", label: "SLA" },
            ].map((tab) => (
              <div
                key={tab.id}
                className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </div>
            ))}
          </div>

          <div className="card-body">
            {/* ── Overview Tab ── */}
            {activeTab === "overview" && (
              <div className="detail-grid fade-in">
                <div className="detail-field">
                  <div className="detail-label">Case ID</div>
                  <div className="detail-value mono">{ID}</div>
                </div>
                <div className="detail-field">
                  <div className="detail-label">Business ID</div>
                  <div className="detail-value mono">{businessID || "—"}</div>
                </div>
                <div className="detail-field">
                  <div className="detail-label">Status</div>
                  <div className="detail-value">
                    <span className={`status-pill ${statusPillClass(status)}`}>
                      {status || "—"}
                    </span>
                  </div>
                </div>
                <div className="detail-field">
                  <div className="detail-label">Stage</div>
                  <div className="detail-value">{stageLabel || "—"}</div>
                </div>
                <div className="detail-field">
                  <div className="detail-label">Urgency</div>
                  <div className="detail-value">
                    <span className={`urgency-dot ${urgencyClass(urgency)}`}>
                      {urgencyLabel(urgency)} ({urgency})
                    </span>
                  </div>
                </div>
                <div className="detail-field">
                  <div className="detail-label">Case Type</div>
                  <div className="detail-value">{caseTypeName || "—"}</div>
                </div>
                <div className="detail-field">
                  <div className="detail-label">Owner</div>
                  <div className="detail-value">{resolveUser(owner)}</div>
                </div>
                <div className="detail-field">
                  <div className="detail-label">Last Updated By</div>
                  <div className="detail-value">
                    {resolveUser(caseData.lastUpdatedBy)}
                  </div>
                </div>
                <div className="detail-field">
                  <div className="detail-label">Created</div>
                  <div className="detail-value">{fmtDate(createTime)}</div>
                </div>
                <div className="detail-field">
                  <div className="detail-label">Last Updated</div>
                  <div className="detail-value">{fmtDate(lastUpdateTime)}</div>
                </div>
                {parentCaseInfo && (
                  <div className="detail-field">
                    <div className="detail-label">Parent Case</div>
                    <div className="detail-value">
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--primary)",
                          fontFamily: "monospace",
                        }}
                      >
                        {parentCaseInfo.ID}
                      </span>
                      {parentCaseInfo.name && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--text-muted)",
                            marginTop: 2,
                          }}
                        >
                          {parentCaseInfo.name}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Participants Tab ── */}
            {activeTab === "participants" && (
              <div className="fade-in">
                {validParticipants.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-title">No participants</div>
                    <div className="empty-state-sub">
                      No participant data found on this case.
                    </div>
                  </div>
                ) : (
                  <div className="participant-list">
                    {validParticipants.map((p, i) => (
                      <ParticipantCard key={i} participant={p} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Stages Tab ── */}
            {activeTab === "stages" && (
              <div className="fade-in">
                {stages.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-title">No stage data</div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {stages.map((s, i) => (
                      <div
                        key={s.ID}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          padding: "12px 16px",
                          background:
                            s.visited_status === "active"
                              ? "var(--primary-light)"
                              : "var(--bg)",
                          border: `1px solid ${s.visited_status === "active" ? "rgba(26,86,219,0.25)" : "var(--border)"}`,
                          borderRadius: "var(--radius-sm)",
                          transition: "var(--transition)",
                        }}
                        className="fade-in"
                      >
                        <div className={`stage-dot ${s.visited_status}`}>
                          {s.visited_status === "completed" ? "✓" : i + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: 13,
                              color:
                                s.visited_status === "active"
                                  ? "var(--primary)"
                                  : "var(--text)",
                            }}
                          >
                            {s.name}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--text-muted)",
                              marginTop: 2,
                            }}
                          >
                            {s.type} · {s.transitionType} · {s.ID}
                          </div>
                          {s.entryTime && (
                            <div
                              style={{
                                fontSize: 11,
                                color: "var(--text-subtle)",
                                marginTop: 1,
                              }}
                            >
                              Entered: {fmtDate(s.entryTime)}
                            </div>
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            padding: "3px 8px",
                            borderRadius: 99,
                            background:
                              s.visited_status === "completed"
                                ? "var(--success-light)"
                                : s.visited_status === "active"
                                  ? "var(--primary-light)"
                                  : "var(--bg)",
                            color:
                              s.visited_status === "completed"
                                ? "var(--success)"
                                : s.visited_status === "active"
                                  ? "var(--primary)"
                                  : "var(--text-subtle)",
                            border: "1px solid",
                            borderColor:
                              s.visited_status === "completed"
                                ? "#a7f3d0"
                                : s.visited_status === "active"
                                  ? "rgba(26,86,219,0.2)"
                                  : "var(--border)",
                          }}
                        >
                          {s.visited_status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── SLA Tab ── */}
            {activeTab === "sla" && (
              <div className="fade-in">
                {sla ? (
                  <div className="sla-row">
                    <div className="sla-item">
                      <div className="sla-label">Goal</div>
                      <div
                        className={`sla-value ${isSlaWarning(sla.goal) ? "warning" : ""}`}
                      >
                        {fmtDate(sla.goal)}
                      </div>
                    </div>
                    <div className="sla-item">
                      <div className="sla-label">Deadline</div>
                      <div
                        className={`sla-value ${isSlaWarning(sla.deadline) ? "overdue" : ""}`}
                      >
                        {fmtDate(sla.deadline)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-title">No SLA data</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action bar */}
          <div className="action-bar">
            <button className="btn btn-ghost" onClick={onBack}>
              ← Back to Cases
            </button>
            {assignment && action && (
              <button
                className="btn btn-brand"
                onClick={onSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="btn-spinner" />
                    Submitting…
                  </>
                ) : (
                  `Submit — ${action.name || "AwaitingFulfillment"}`
                )}
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-section">
          <div className="sidebar-section-title">Assignment</div>
          {assignment ? (
            <>
              <div className="sidebar-field">
                <div className="sidebar-label">Task</div>
                <div className="sidebar-value">{assignment.name || "—"}</div>
              </div>
              <div className="sidebar-field">
                <div className="sidebar-label">Process</div>
                <div className="sidebar-value">
                  {assignment.processName || "—"}
                </div>
              </div>
              <div className="sidebar-field">
                <div className="sidebar-label">Assignee</div>
                <div className="sidebar-value">
                  {assignment.assigneeInfo?.name ||
                    assignment.assigneeInfo?.ID ||
                    "—"}
                </div>
              </div>
              <div className="sidebar-field">
                <div className="sidebar-label">Type</div>
                <div className="sidebar-value">
                  {assignment.assigneeInfo?.type || "—"}
                </div>
              </div>
              {action && (
                <div className="sidebar-field">
                  <div className="sidebar-label">Action ID</div>
                  <div
                    className="sidebar-value"
                    style={{ fontFamily: "monospace", fontSize: 11 }}
                  >
                    {action.ID}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ color: "var(--text-subtle)", fontSize: 12 }}>
              No active assignment
            </div>
          )}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">Participants</div>
          {validParticipants.length > 0 ? (
            validParticipants.map((p, i) => (
              <div key={i} className="sidebar-field">
                <div className="sidebar-label">{p.role || "Participant"}</div>
                <div className="sidebar-value">
                  {p.fullName || `${p.firstName} ${p.lastName}`}
                </div>
                {p.email && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--primary)",
                      marginTop: 2,
                    }}
                  >
                    {p.email}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ color: "var(--text-subtle)", fontSize: 12 }}>—</div>
          )}
        </div>

        {sla && (
          <div className="sidebar-section">
            <div className="sidebar-section-title">SLA</div>
            <div className="sidebar-field">
              <div className="sidebar-label">Goal</div>
              <div
                className="sidebar-value"
                style={{
                  fontSize: 12,
                  color: isSlaWarning(sla.goal) ? "var(--warning)" : undefined,
                }}
              >
                {fmtDate(sla.goal)}
              </div>
            </div>
            <div className="sidebar-field">
              <div className="sidebar-label">Deadline</div>
              <div
                className="sidebar-value"
                style={{
                  fontSize: 12,
                  color: isSlaWarning(sla.deadline)
                    ? "var(--danger)"
                    : undefined,
                }}
              >
                {fmtDate(sla.deadline)}
              </div>
            </div>
          </div>
        )}

        {parentCaseInfo && (
          <div className="sidebar-section">
            <div className="sidebar-section-title">Parent Case</div>
            <div className="sidebar-field">
              <div className="sidebar-label">ID</div>
              <div
                className="sidebar-value"
                style={{ fontFamily: "monospace", fontSize: 11 }}
              >
                {parentCaseInfo.ID}
              </div>
            </div>
            {parentCaseInfo.name && (
              <div className="sidebar-field">
                <div className="sidebar-label">Name</div>
                <div className="sidebar-value">{parentCaseInfo.name}</div>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}

/* ── Landing / Start Page ─────────────────────────────────────── */
function LandingPage({ onLaunch, isMockMode }) {
  return (
    <div className="landing-shell">
      {/* Header */}
      <header className="landing-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              background: "linear-gradient(135deg, #a855f7, #6b21a8)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 17,
              width: 38,
              height: 38,
              borderRadius: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(168,85,247,0.5)",
            }}
          >
            CB
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: 0.3 }}>
              Corebridge Financial
            </div>
            <div
              style={{
                fontSize: 10,
                color: "#d8b4fe",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Claims Management Center
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 24,
            fontSize: 13,
            fontWeight: 600,
            alignItems: "center",
          }}
        >
          <span
            style={{
              background: "#8b5cf6",
              padding: "6px 16px",
              borderRadius: 20,
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

      {/* Hero */}
      <div className="landing-hero">
        <h1 className="landing-hero-title">Life Insurance Claims Portal</h1>
        <p className="landing-hero-sub">
          Manage beneficiary fulfillment cases, review assignments, and submit
          actions directly through Pega's Claims Management workflow.
        </p>
        <div className="landing-search-wrap">
          <input
            type="text"
            placeholder="Search by case ID, name, or beneficiary..."
            disabled
            style={{
              width: "100%",
              padding: "14px 100px 14px 20px",
              borderRadius: 30,
              border: "none",
              outline: "none",
              fontSize: 14,
              color: "#333",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          />
          <button
            style={{
              position: "absolute",
              right: 6,
              top: 5,
              background: "#6b21a8",
              color: "#fff",
              border: "none",
              borderRadius: 20,
              padding: "8px 20px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "not-allowed",
            }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          maxWidth: 900,
          margin: "-30px auto 0",
          padding: "0 40px",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div className="stats-bar">
          {[
            { value: "16", label: "Active Cases" },
            { value: "AWF", label: "Queue Type" },
            { value: "CMC", label: "Operator Queue" },
          ].map((s) => (
            <div key={s.label} className="stat-item">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Service cards */}
      <div className="landing-cards">
        <h2
          style={{
            textAlign: "center",
            color: "#1e1b4b",
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Self-service, on your terms
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#6b7280",
            fontSize: 14,
            marginBottom: 40,
          }}
        >
          Handle the most common claims requests online, 24/7 — no phone calls
          required.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 24,
          }}
        >
          {/* Inactive cards */}
          {[
            {
              title: "Address Change",
              desc: "Update the mailing or residential address linked to your policy.",
            },
            {
              title: "Death Claim",
              desc: "Initiate a death claim for a life insurance policy on behalf of a beneficiary.",
            },
            {
              title: "Premium Payment Update",
              desc: "Change your premium payment method, frequency, or bank details.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="service-card"
              style={{ opacity: 0.75 }}
            >
              <h3 className="service-card-title">{card.title}</h3>
              <p className="service-card-desc">{card.desc}</p>
              <div className="service-card-link">GET STARTED →</div>
            </div>
          ))}

          {/* Active — Case Validation */}
          <div className="service-card active-card" onClick={onLaunch}>
            <h3 className="service-card-title">Case Validation</h3>
            <p className="service-card-desc">
              Review and process Awaiting Fulfillment assignments in the Life
              Beneficiary Unit workflow. View case details, participant info,
              and submit actions.
            </p>
            <div className="service-card-link">OPEN QUEUE →</div>
          </div>
        </div>
      </div>

      {isMockMode && (
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            fontSize: 12,
            color: "#9ca3af",
          }}
        >
          Running in Mock Mode — all API calls are simulated locally.
        </div>
      )}
    </div>
  );
}

/* ── Case List ────────────────────────────────────────────────── */
function CaseList({ cases, onSelect, onBack, totalCount }) {
  const [search, setSearch] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  const filtered = cases.filter((c) => {
    const label = (c.pyLabel || "").toLowerCase();
    const id = (c.pxRefObjectInsName || c.pxRefObjectKey || "").toLowerCase();
    const matchSearch =
      !search ||
      label.includes(search.toLowerCase()) ||
      id.includes(search.toLowerCase());
    const u = Number(c.pxUrgencyAssign || 0);
    const matchUrgency =
      urgencyFilter === "all" ||
      (urgencyFilter === "high" && u >= 50) ||
      (urgencyFilter === "medium" && u >= 20 && u < 50) ||
      (urgencyFilter === "low" && u < 20);
    return matchSearch && matchUrgency;
  });

  return (
    <div className="app-body">
      <main
        className="main-content fade-in"
        style={{ maxWidth: 960, margin: "0 auto", width: "100%" }}
      >
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              Awaiting Fulfillment Cases
              <span
                style={{
                  background: "var(--brand-100)",
                  color: "var(--brand-500)",
                  borderRadius: 99,
                  padding: "2px 10px",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {totalCount}
              </span>
            </div>
            <div className="card-subtitle">
              Select a case to view details and submit an action
            </div>
          </div>

          {/* Filter bar */}
          <div
            style={{
              padding: "14px 22px",
              borderBottom: "1px solid var(--border)",
              background: "var(--surface-2)",
            }}
          >
            <div className="filter-bar">
              <input
                type="text"
                placeholder="Search by name or case ID…"
                className="filter-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="filter-select"
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
              >
                <option value="all">All Urgencies</option>
                <option value="high">High (≥50)</option>
                <option value="medium">Medium (20-49)</option>
                <option value="low">Low (&lt;20)</option>
              </select>
            </div>
          </div>

          <div className="case-table-wrapper">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-title">No cases found</div>
                <div className="empty-state-sub">
                  {search
                    ? `No cases matching "${search}"`
                    : "No cases in the Awaiting Fulfillment queue."}
                </div>
              </div>
            ) : (
              <table className="case-table">
                <thead>
                  <tr>
                    <th>Case ID</th>
                    <th>Beneficiary</th>
                    <th>Queue</th>
                    <th>Status</th>
                    <th>Urgency</th>
                    <th>Task</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => {
                    const insName =
                      c.pxRefObjectInsName ||
                      c.pxRefObjectKey?.split(" ").pop() ||
                      "—";
                    const label = c.pyLabel || c.pyInstructions || "—";
                    const queue = c.pxAssignedOperatorID || "—";
                    const urg = Number(c.pxUrgencyAssign || 0);

                    return (
                      <tr
                        key={c.pzInsKey || i}
                        className="fade-in"
                        onClick={() =>
                          onSelect(c.pxRefObjectKey || c.pxRefObjectInsName)
                        }
                      >
                        <td>
                          <span className="case-id-cell">{insName}</span>
                        </td>
                        <td style={{ maxWidth: 200, wordBreak: "break-word" }}>
                          {label}
                        </td>
                        <td
                          style={{ fontSize: 12, color: "var(--text-muted)" }}
                        >
                          {queue}
                        </td>
                        <td>
                          <span
                            className={`status-pill ${statusPillClass(c.pyAssignmentStatus)}`}
                          >
                            {c.pyAssignmentStatus || "Open"}
                          </span>
                        </td>
                        <td>
                          <span className={`urgency-dot ${urgencyClass(urg)}`}>
                            {urgencyLabel(urg)} ({urg})
                          </span>
                        </td>
                        <td
                          style={{ fontSize: 12, color: "var(--text-muted)" }}
                        >
                          {c.pxTaskLabel || c.pxTaskName || "—"}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-brand"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelect(
                                c.pxRefObjectKey || c.pxRefObjectInsName,
                              );
                            }}
                          >
                            Open →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div
            className="action-bar"
            style={{ justifyContent: "space-between" }}
          >
            <button className="btn btn-ghost" onClick={onBack}>
              ← Home
            </button>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Showing {filtered.length} of {totalCount} cases
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── Main App ─────────────────────────────────────────────────── */
const isMockMode = [true, "true", "1", "yes"].includes(
  import.meta.env.VITE_MOCK_MODE,
);

export default function App() {
  const [step, setStep] = useState("START");
  const [loadingMsg, setLoadingMsg] = useState("Authenticating…");
  const [error, setError] = useState("");
  const [toasts, setToasts] = useState([]);

  const [token, setToken] = useState("");
  const [caseList, setCaseList] = useState([]);
  const [caseData, setCaseData] = useState(null);
  const [referencedUsers, setReferencedUsers] = useState({});
  const [stages, setStages] = useState([]);
  const [assignmentId, setAssignmentId] = useState("");
  const [actionId, setActionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ifMatch, setIfMatch] = useState("");

  const authRef = useRef(false);

  /* ── Toast helper ─────────────────────────────────────────────── */
  const addToast = useCallback((msg, type = "info") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4500);
  }, []);

  const removeToast = useCallback(
    (id) => setToasts((p) => p.filter((t) => t.id !== id)),
    [],
  );

  /* ── 1. Authenticate ──────────────────────────────────────────── */
  const authenticate = useCallback(async () => {
    setLoadingMsg("Authenticating with Pega…");
    const params = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });
    if (!res.ok) throw new Error("Authentication failed — check credentials.");
    const data = await res.json();
    return data.access_token;
  }, []);

  /* ── 2. Fetch Case List ───────────────────────────────────────── */
  const getCaseList = useCallback(async (tok) => {
    setLoadingMsg("Fetching Awaiting Fulfillment cases…");
    const res = await fetch(`${API_BASE}/data_views/D_GetCasesOnAssignment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tok}`,
      },
      body: JSON.stringify({
        dataViewParameters: { TaskLabel: "Awaiting Fulfillment" },
      }),
    });
    return handleApiResponse(res, "Failed to fetch case list");
  }, []);

  /* ── 3. Get Case Details ──────────────────────────────────────── */
  const getCaseDetails = useCallback(async (tok, caseId) => {
    setLoadingMsg("Loading case details…");
    const res = await fetch(
      `${API_BASE}/cases/${encodeId(caseId)}?viewType=page`,
      { headers: { Authorization: `Bearer ${tok}` } },
    );
    return handleApiResponse(res, "Failed to get case details");
  }, []);

  /* ── 4. Get Assignment View Metadata ─────────────────────────── */
  const getAssignmentMeta = useCallback(async (tok, asgId, actId) => {
    setLoadingMsg("Loading assignment view…");
    const url = `${ASSIGN_BASE}/assignments/${encodeId(asgId)}/actions/${actId}?viewType=form`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${tok}` },
    });
    const etag =
      res.headers.get("If-Match") ||
      res.headers.get("ETag") ||
      res.headers.get("etag") ||
      "";
    setIfMatch(etag);
    return handleApiResponse(res, "Failed to get assignment metadata");
  }, []);

  /* ── Initialise: auth → fetch worklist → show CASE_LIST ─────── */
  const init = useCallback(async () => {
    setStep("LOADING");
    setError("");
    setCaseList([]);
    setCaseData(null);
    try {
      const tok = await authenticate();
      setToken(tok);
      const listRes = await getCaseList(tok);
      const results =
        (Array.isArray(listRes?.data) ? listRes.data : null) ||
        listRes?.data?.pxResults ||
        listRes?.pxResults ||
        [];
      setCaseList(results);
      setStep("CASE_LIST");
      addToast(`Loaded ${results.length} cases`, "success");
    } catch (e) {
      console.error(e);
      setError(e.message);
      setStep("ERROR");
    }
  }, [authenticate, getCaseList, addToast]);

  /* ── Select a case → load details ───────────────────────────── */
  const handleCaseSelect = useCallback(
    async (caseRef) => {
      setStep("LOADING");
      setError("");
      try {
        /* Get case details */
        const caseRes = await getCaseDetails(token, caseRef);
        const ci = caseRes.data.caseInfo;
        setCaseData(ci);
        setReferencedUsers(caseRes.data?.referencedUsers || {});
        setStages(ci.stages || []);

        /* Extract assignment + action */
        const asg = ci.assignments?.[0];
        if (!asg) {
          /* No active assignment — still show the case but no submit btn */
          setAssignmentId("");
          setActionId("");
          setStep("CASE_DETAIL");
          addToast("Case loaded — no active assignment found.", "info");
          return;
        }

        const asgId = asg.ID;
        const actId = asg.actions?.[0]?.ID;
        setAssignmentId(asgId);
        setActionId(actId || "");

        /* Fetch assignment view for metadata (optional — we still show case detail) */
        try {
          await getAssignmentMeta(token, asgId, actId);
        } catch {
          /* non-fatal */
        }

        setStep("CASE_DETAIL");
        addToast("Case loaded successfully", "success");
      } catch (e) {
        console.error(e);
        setError(e.message);
        setStep("ERROR");
      }
    },
    [token, getCaseDetails, getAssignmentMeta, addToast],
  );

  /* ── Submit assignment action ─────────────────────────────────── */
  const handleSubmit = useCallback(async () => {
    if (!assignmentId || !actionId) return;
    setSubmitting(true);
    setError("");
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      if (ifMatch) headers["If-Match"] = ifMatch;

      const res = await fetch(
        `${ASSIGN_BASE}/assignments/${encodeId(assignmentId)}/actions/${actionId}?viewType=form`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ content: {} }),
        },
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Submit failed: ${res.status} — ${txt}`);
      }

      addToast("Assignment submitted successfully!", "success");
      setStep("SUCCESS");
    } catch (e) {
      console.error(e);
      setError(e.message);
      addToast(e.message, "error");
    } finally {
      setSubmitting(false);
    }
  }, [token, assignmentId, actionId, ifMatch, addToast]);

  /* ── Back to case list ────────────────────────────────────────── */
  const handleBackToList = useCallback(() => {
    setCaseData(null);
    setStep("CASE_LIST");
  }, []);

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <div className="shell">
      {/* Mock mode banner */}
      {isMockMode && (
        <div className="mock-banner">
          <div className="mock-banner-dot" />
          MOCK MODE — API calls are simulated locally. No real Pega connection.
        </div>
      )}

      {/* ── Top Nav (visible except on START) */}
      {step !== "START" && (
        <nav className="top-nav">
          <div className="nav-brand">
            <div className="nav-logo">CB</div>
            <div>
              <div className="nav-title">Corebridge Financial</div>
              <div className="nav-subtitle">Claims Management Center</div>
            </div>
          </div>
          <div className="nav-pills">
            {step === "CASE_LIST" && (
              <div className="nav-pill active">
                Awaiting Fulfillment
                <span className="nav-badge">{caseList.length}</span>
              </div>
            )}
            {step === "CASE_DETAIL" && caseData && (
              <>
                <div className="nav-pill">
                  {caseData.businessID || caseData.ID}
                </div>
                <div
                  className={`nav-pill urgency-dot ${urgencyClass(caseData.urgency)}`}
                >
                  {urgencyLabel(caseData.urgency)}
                </div>
              </>
            )}
            {step === "SUCCESS" && (
              <div className="nav-pill active" style={{ color: "#a7f3d0" }}>
                Submitted
              </div>
            )}
          </div>
        </nav>
      )}

      {/* Stages bar */}
      {step === "CASE_DETAIL" && <StagesBar stages={stages} />}

      {/* ── START ── */}
      {step === "START" && (
        <LandingPage onLaunch={init} isMockMode={isMockMode} />
      )}

      {/* ── LOADING ── */}
      {step === "LOADING" && (
        <div className="center-screen">
          <div className="big-spinner" />
          <div className="loading-label">{loadingMsg}</div>
        </div>
      )}

      {/* ── ERROR ── */}
      {step === "ERROR" && (
        <div className="center-screen">
          <div className="error-box" style={{ maxWidth: 480 }}>
            <span>Error:</span> {error}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button className="btn btn-ghost" onClick={() => setStep("START")}>
              ← Home
            </button>
            <button className="btn btn-brand" onClick={init}>
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ── CASE LIST ── */}
      {step === "CASE_LIST" && (
        <CaseList
          cases={caseList}
          totalCount={caseList.length}
          onSelect={handleCaseSelect}
          onBack={() => setStep("START")}
        />
      )}

      {/* ── CASE DETAIL ── */}
      {step === "CASE_DETAIL" && caseData && (
        <>
          {error && (
            <div style={{ padding: "10px 24px" }}>
              <div className="error-box">
                <span>✕</span> {error}
              </div>
            </div>
          )}
          <CaseDetailView
            caseData={caseData}
            referencedUsers={referencedUsers}
            onSubmit={handleSubmit}
            submitting={submitting}
            onBack={handleBackToList}
          />
        </>
      )}

      {/* ── SUCCESS ── */}
      {step === "SUCCESS" && (
        <div className="center-screen fade-in">
          <div className="success-card">
            <div className="success-icon">✓</div>
            <div className="success-title">Assignment Submitted!</div>
            <div className="success-sub">
              The <strong>Awaiting Fulfillment</strong> assignment has been
              successfully submitted.
              <br />
              The case has been updated in the Pega CLM system.
              {caseData && (
                <>
                  <br />
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--text-subtle)",
                      fontFamily: "monospace",
                    }}
                  >
                    {caseData.businessID || caseData.ID}
                  </span>
                </>
              )}
            </div>
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button className="btn btn-ghost" onClick={handleBackToList}>
                ← Case List
              </button>
              <button
                className="btn btn-brand"
                onClick={() => {
                  authRef.current = false;
                  init();
                }}
              >
                ↺ New Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toasts ── */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
