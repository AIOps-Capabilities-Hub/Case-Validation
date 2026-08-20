// ── Mock API for Case Validation (Awaiting Fulfillment workflow) ──────────
// Mirrors the real Pega endpoints so the entire UI can be exercised offline.

const MOCK_TOKEN = "mock-access-token-case-validation";
const MOCK_DATA_VIEW = "D_GetCasesOnAssignment";

// ── Sample case list (mirrors the DataView_Response.txt payload) ───────────
const mockCaseList = [
  {
    pxUrgencyAssign: 50,
    pxTaskName: "Assignment3",
    pxProcessName: "Verify Requirements",
    pxRefObjectInsName: "BU-21393",
    pxFlowName: "RequirementsFulfillment",
    pxTaskLabel: "Awaiting Fulfillment",
    pxAssignedOperatorID: "CMCAwaitingFulfillmentQueue",
    pxRefObjectClass: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
    pyAssignmentStatus: "Open-ClaimantPackageSent",
    pyInstructions: "Awaiting Fulfillment",
    pzInsKey:
      "ASSIGN-WORKBASKET AIG-LR-LIFE-CLM-WORK BU-21393!REQUIREMENTSFULFILLMENT",
    pxRefObjectKey: "AIG-LR-LIFE-CLM-WORK BU-21393",
    pyLabel: "Claimant, Beneficiary (BENETESTINTRTEREL05  TESTBENELASTNAME)",
    pyFlowType: "RequirementsFulfillment",
    pxIsMultiStep: false,
  },
  {
    pxUrgencyAssign: 50,
    pxTaskName: "Assignment3",
    pxProcessName: "Verify Requirements",
    pxRefObjectInsName: "BU-21392",
    pxFlowName: "RequirementsFulfillment",
    pxTaskLabel: "Awaiting Fulfillment",
    pxAssignedOperatorID: "CMCAwaitingFulfillmentQueue",
    pxRefObjectClass: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
    pyAssignmentStatus: "Open-ClaimantPackageSent",
    pyInstructions: "Awaiting Fulfillment",
    pzInsKey:
      "ASSIGN-WORKBASKET AIG-LR-LIFE-CLM-WORK BU-21392!REQUIREMENTSFULFILLMENT",
    pxRefObjectKey: "AIG-LR-LIFE-CLM-WORK BU-21392",
    pyLabel: "Claimant, Beneficiary (KZNJD  TSZNO)",
    pyFlowType: "RequirementsFulfillment",
    pxIsMultiStep: false,
  },
  {
    pxUrgencyAssign: 50,
    pxTaskName: "Assignment3",
    pxProcessName: "Verify Requirements",
    pxRefObjectInsName: "BU-21389",
    pxFlowName: "RequirementsFulfillment",
    pxTaskLabel: "Awaiting Fulfillment",
    pxAssignedOperatorID: "CMCAwaitingFulfillmentQueue",
    pxRefObjectClass: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
    pyAssignmentStatus: "Open-ClaimantPackageSent",
    pyInstructions: "Awaiting Fulfillment",
    pzInsKey:
      "ASSIGN-WORKBASKET AIG-LR-LIFE-CLM-WORK BU-21389!REQUIREMENTSFULFILLMENT",
    pxRefObjectKey: "AIG-LR-LIFE-CLM-WORK BU-21389",
    pyLabel: "Claimant, Beneficiary (samantha  warner)",
    pyFlowType: "RequirementsFulfillment",
    pxIsMultiStep: false,
  },
  {
    pxUrgencyAssign: 30,
    pxTaskName: "Assignment3",
    pxProcessName: "Verify Requirements",
    pxRefObjectInsName: "BU-21416",
    pxFlowName: "RequirementsFulfillment",
    pxTaskLabel: "Awaiting Fulfillment",
    pxAssignedOperatorID: "CMCAwaitingFulfillmentQueue",
    pxRefObjectClass: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
    pyAssignmentStatus: "Open-ClaimantPackageSent",
    pyInstructions: "Awaiting Fulfillment",
    pzInsKey:
      "ASSIGN-WORKBASKET AIG-LR-LIFE-CLM-WORK BU-21416!REQUIREMENTSFULFILLMENT",
    pxRefObjectKey: "AIG-LR-LIFE-CLM-WORK BU-21416",
    pyLabel: "Claimant, Beneficiary (Peter  Bill)",
    pyFlowType: "RequirementsFulfillment",
    pxIsMultiStep: false,
  },
  {
    pxUrgencyAssign: 10,
    pxTaskName: "Assignment3",
    pxProcessName: "Verify Requirements",
    pxRefObjectInsName: "BU-21419",
    pxFlowName: "RequirementsFulfillment",
    pxTaskLabel: "Awaiting Fulfillment",
    pxAssignedOperatorID: "BeneficiaryQueue",
    pxRefObjectClass: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
    pyAssignmentStatus: "Open-ClaimantPackageSent",
    pyInstructions: "Awaiting Fulfillment",
    pzInsKey:
      "ASSIGN-WORKBASKET AIG-LR-LIFE-CLM-WORK BU-21419!REQUIREMENTSFULFILLMENT",
    pxRefObjectKey: "AIG-LR-LIFE-CLM-WORK BU-21419",
    pyLabel: "Claimant, Beneficiary (Rohit  Pathak)",
    pyFlowType: "RequirementsFulfillment",
    pxIsMultiStep: false,
  },
  {
    pxUrgencyAssign: 10,
    pxTaskName: "Assignment3",
    pxProcessName: "Verify Requirements",
    pxRefObjectInsName: "BU-21418",
    pxFlowName: "RequirementsFulfillment",
    pxTaskLabel: "Awaiting Fulfillment",
    pxAssignedOperatorID: "CMCAwaitingFulfillmentQueue",
    pxRefObjectClass: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
    pyAssignmentStatus: "Open-ClaimantPackageSent",
    pyInstructions: "Awaiting Fulfillment",
    pzInsKey:
      "ASSIGN-WORKBASKET AIG-LR-LIFE-CLM-WORK BU-21418!REQUIREMENTSFULFILLMENT",
    pxRefObjectKey: "AIG-LR-LIFE-CLM-WORK BU-21418",
    pyLabel: "Claimant, Beneficiary (Peter  Bill)",
    pyFlowType: "RequirementsFulfillment",
    pxIsMultiStep: false,
  },
];

// ── Mock case info generator (mirrors Get_Case_API_Response.txt) ──────────
const mockCaseInfo = (
  caseKey = "AIG-LR-LIFE-CLM-WORK BU-21419",
  insName = "BU-21419",
) => ({
  ID: caseKey,
  businessID: insName,
  name: "Claimant, Beneficiary (Rohit  Pathak)",
  status: "Open-ClaimantPackageSent",
  urgency: 10,
  stageLabel: "Document Fulfillment",
  stageID: "PRIM2",
  caseTypeName: "Life Beneficiary Unit",
  caseTypeID: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
  owner: "TestUser_7513199",
  createdBy: "TestUser_7513199",
  lastUpdatedBy: "7513199",
  createTime: "2026-08-18T16:37:26.576Z",
  lastUpdateTime: "2026-08-19T05:40:18.751Z",
  hasNewAttachments: false,
  sla: {
    goal: "2026-08-20T16:37:25.694Z",
    deadline: "2026-08-26T16:37:25.694Z",
  },
  parentCaseInfo: {
    name: "Life Policy (3333333305)",
    ID: "AIG-LR-LIFE-CLM-WORK PC-24670",
    hasMoreAncestors: "true",
  },
  stages: [
    {
      ID: "PRIM1",
      name: "Verify Beneficiary",
      visited_status: "completed",
      type: "Primary",
    },
    {
      ID: "PRIM2",
      name: "Document Fulfillment",
      visited_status: "active",
      type: "Primary",
    },
    {
      ID: "PRIM7",
      name: "Create Disbursement",
      visited_status: "future",
      type: "Primary",
    },
    {
      ID: "PRIM11",
      name: "Complete",
      visited_status: "future",
      type: "Primary",
    },
    { ID: "PRIM12", name: "Close", visited_status: "future", type: "Primary" },
  ],
  participants: [
    {
      lastName: "Pathak",
      role: "Beneficiary",
      fullName: "Rohit  Pathak",
      type: "Person",
      firstName: "Rohit",
      email: "test@test.com",
    },
  ],
  assignments: [
    {
      ID: `ASSIGN-WORKBASKET ${caseKey}!REQUIREMENTSFULFILLMENT`,
      name: "Awaiting Fulfillment",
      instructions: "Awaiting Fulfillment",
      canPerform: "true",
      processID: "RequirementsFulfillment",
      processName: "Verify Requirements",
      urgency: 10,
      isMultiStep: "false",
      assigneeInfo: {
        name: "Beneficiary Details",
        ID: "BeneficiaryQueue",
        type: "workbasket",
      },
      actions: [
        {
          ID: "AwaitingFulfillment",
          name: "Awaiting Fulfillment",
          type: "FlowAction",
        },
      ],
    },
  ],
  content: {
    classID: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
    pxObjClass: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
    pyLabel: "Claimant, Beneficiary (Rohit  Pathak)",
    pyID: insName,
    pyStatusWork: "Open-ClaimantPackageSent",
    pxUrgencyWork: 10,
    pxCreateOperator: "TestUser_7513199",
    pxUpdateOperator: "7513199",
    pxCreateDateTime: "2026-08-18T16:37:26.576Z",
    pxUpdateDateTime: "2026-08-19T05:40:18.751Z",
  },
});

// ── Mock assignment view response (mirrors Get_Assignment_View_API_Response.txt) ─
const mockAssignmentView = (caseKey, insName) => ({
  data: {
    caseInfo: mockCaseInfo(caseKey, insName),
  },
  uiResources: {
    resources: {
      views: {
        pyActionStub: [
          {
            name: "pyActionStub",
            type: "View",
            config: {
              template: "OneColumn",
              ruleClass: "Work-",
            },
            children: [
              {
                name: "A",
                type: "Region",
                children: [
                  {
                    type: "Text",
                    config: {
                      label: "@L View is not yet defined for this step.",
                      readOnly: "true",
                    },
                  },
                ],
              },
            ],
            classID: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
          },
        ],
      },
      fields: {
        pyLabel: [
          {
            classID: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
            type: "Text",
            displayAs: "pxTextInput",
            label: "Label",
          },
        ],
        pyID: [
          {
            classID: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
            type: "Text",
            displayAs: "pxDisplayText",
            label: "Case ID",
            isClassKey: true,
          },
        ],
      },
    },
    root: {
      type: "reference",
      config: {
        type: "view",
        name: "pyActionStub",
        context: "caseInfo.content",
      },
    },
    actionButtons: {
      secondary: [
        { jsAction: "cancelAssignment", name: "Cancel", actionID: "cancel" },
        {
          jsAction: "saveAssignment",
          name: "Save for later",
          actionID: "save",
        },
      ],
      main: [
        { jsAction: "finishAssignment", name: "Submit", actionID: "submit" },
      ],
    },
  },
});

// ── Helpers ───────────────────────────────────────────────────────────────
const jsonResponse = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });

const getRequestMethod = (input, options) =>
  (
    options.method || (typeof input !== "string" ? input.method : "GET")
  ).toUpperCase();

const getRequestHeaders = (input, options) => {
  if (options.headers) return new Headers(options.headers);
  if (typeof input !== "string" && input.headers)
    return new Headers(input.headers);
  return new Headers();
};

const getRequestBody = async (input, options) => {
  if (options.body !== undefined) return options.body;
  if (typeof input !== "string" && input.body) return input.clone().text();
  return "";
};

const requireMockToken = (input, options) => {
  const authorization =
    getRequestHeaders(input, options).get("Authorization") || "";
  if (authorization !== `Bearer ${MOCK_TOKEN}`) {
    return jsonResponse({ message: "Mock authentication failed" }, 401);
  }
  return null;
};

// ── Main mock fetch handler ────────────────────────────────────────────────
const handleMockRequest = async (input, options = {}) => {
  const url = typeof input === "string" ? input : input.url;
  const method = getRequestMethod(input, options);

  // Simulate slight network delay for realism
  await new Promise((r) => setTimeout(r, 300 + Math.random() * 400));

  // ── Token endpoint ──────────────────────────────────────────────────────
  if (url.includes("/oauth2/") || url.endsWith("/token")) {
    const requestBody = await getRequestBody(input, options);
    const params = new URLSearchParams(requestBody || "");
    if (
      method !== "POST" ||
      params.get("grant_type") !== "client_credentials"
    ) {
      return jsonResponse(
        { message: "Mock token endpoint expects POST client_credentials" },
        400,
      );
    }
    return jsonResponse({
      access_token: MOCK_TOKEN,
      token_type: "Bearer",
      expires_in: 3600,
    });
  }

  const authError = requireMockToken(input, options);
  if (authError) return authError;

  // ── Data view (case list) ───────────────────────────────────────────────
  if (url.includes(MOCK_DATA_VIEW) && method === "POST") {
    return jsonResponse({
      fetchDateTime: new Date().toISOString(),
      pxObjClass: "Pega-API-DataExploration-Data",
      resultCount: mockCaseList.length,
      data: mockCaseList,
      hasMoreResults: false,
    });
  }

  // ── Case details GET ────────────────────────────────────────────────────
  if (
    method === "GET" &&
    url.includes("/cases/") &&
    !url.includes("/assignments/")
  ) {
    // Extract case key from URL
    const caseMatch = url.match(/\/cases\/([^?]+)/);
    const caseKey = caseMatch
      ? decodeURIComponent(caseMatch[1])
      : "AIG-LR-LIFE-CLM-WORK BU-21419";
    const insName = caseKey.split(" ").pop() || "BU-21419";
    return jsonResponse({
      data: { caseInfo: mockCaseInfo(caseKey, insName) },
    });
  }

  // ── Assignment view GET ─────────────────────────────────────────────────
  if (
    method === "GET" &&
    url.includes("/assignments/") &&
    url.includes("/actions/")
  ) {
    const asgMatch = url.match(/\/assignments\/([^/]+)\/actions\/([^?]+)/);
    const caseKey = asgMatch
      ? decodeURIComponent(asgMatch[1])
          .replace("ASSIGN-WORKBASKET ", "")
          .split("!")[0]
      : "AIG-LR-LIFE-CLM-WORK BU-21419";
    const insName = caseKey.split(" ").pop() || "BU-21419";
    return jsonResponse(mockAssignmentView(caseKey, insName), 200, {
      ETag: '"mock-etag-cv"',
    });
  }

  // ── Assignment action PATCH (submit) ────────────────────────────────────
  if (
    method === "PATCH" &&
    url.includes("/assignments/") &&
    url.includes("/actions/")
  ) {
    return jsonResponse({
      data: {
        caseInfo: {
          ...mockCaseInfo(),
          status: "Resolved-Fulfilled",
          assignments: [],
        },
      },
    });
  }

  // ── Attachments upload ──────────────────────────────────────────────────
  if (url.includes("/attachments/upload") && method === "POST") {
    return jsonResponse({ ID: `MOCK-ATTACH-${Date.now()}` }, 201);
  }

  return jsonResponse(
    { message: `Mock endpoint not implemented: ${method} ${url}` },
    404,
  );
};

export const createMockFetch = () => handleMockRequest;

export { MOCK_TOKEN, MOCK_DATA_VIEW, handleMockRequest };
