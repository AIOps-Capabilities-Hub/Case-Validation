// ── Mock API for Case Validation (Awaiting Fulfillment workflow) ──────────
// Mirrors the real Pega endpoints so the entire UI can be exercised offline.

const MOCK_TOKEN =
  "eyJraWQiOiI1NkNCOUZBRTc0MTREODYyMzIzODgxOUE2M0FGMTc5MiIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJhdWQiOiJ1cm46MTM5NDYzOTYxMDU5MDE5Njc5NTUiLCJzdWIiOiIxMzk0NjM5NjEwNTkwMTk2Nzk1NSIsImFwcF9uYW1lIjoiQ0xNIiwibmJmIjoxNzg3MjMzOTgzLCJhcHBfdmVyc2lvbiI6IjAzLjAxLjE1IiwiaXNzIjoidXJuOmNyYmctZHBhLXN0ZzMucGVnYWNsb3VkLm5ldCIsImV4cCI6MTc4NzIzNzU4MywiaWF0IjoxNzg3MjMzOTgzLCJweU9wZXJhdG9yQ29udGV4dCI6IkFjY2VzcyBHcm91cCIsImp0aSI6IjM3RjAyNjE4ODM1RTQ2NUE2RDIwMDdDOEZCQTVBQTlBIiwib3BlcmF0b3JfYWNjZXNzIjoiQ0xMOkFkbWluaXN0cmF0b3JzIn0.Do7pxw51WhHmp4zZLjWgN5VZ0Y3p2JIsuJIm3UKOPWh4SNpGhFMGS_CIHDzTygsx2UDAozeAxbXTj3Brx_NGqrnBCDoPFwZjjT5jELTIACY-Iw7Fsm-9fm6DYZZcJTUdTnSP7Xed8H2EpwbchEh__y9_31dWwKi2b2i-vDbzmxVBiKSzwI038NYnX9hhlSALgJ5OQJzAUDTbtCZGkEbtGZG9d-4Qaa-QrOomiVyxTC6SI3clF9RkHjuWleAknEC07qsOIlpyJ0Ma1yJsCAF25l8qcTSCSzsgw43b8WgCmpEbC7YwU0MiUhkCgpkeAeGTdaTuqSaWSiPzYHhgHyhFz6wLozN1r2s9T1cN60BoLX5JqA7RoV9LSAuPeRjoyvaI-IGVthzco0K-2ZGnN3T3cd5SvUuKeeFvN6bXdOWxxfIzwICx-7F_SZ4TOEpxvCzxCoeqCfjeXFsLsPXYyBFdrUM3RvG6oAifR5_iW90zJ4w19ZVctdluVX4dDUoQIKkWq6EKf2LKjsVQHbX8O6t1jSDipbHHnrlHCJlOkL69QyPu5g-teD9qkiF5T7O-TJrD0FiXQqouKxPJ-huc8Ap555dj3DTnQ1OEojcPMDnaNouvcHfQcBy4_iCAvqlv81kd7V8Mggb6Pd_yNLCl4z6ptEFLM5aWj0v6JC5oVSvy_Y8";
const MOCK_DATA_VIEW = "D_GetCasesOnAssignment";

// ── Sample case list (mirrors the POST D_GetCasesOnAssignment payload) ───────────
const mockCaseListResponse = {
  fetchDateTime: "2026-08-20T13:53:03.737Z",
  pxObjClass: "Pega-API-DataExploration-Data",
  resultCount: 17,
  data: [
    {
      pxTaskName: "Assignment3",
      pxUrgencyAssign: 50,
      pxProcessName: "Verify Requirements",
      pxRefObjectInsName: "BU-21393",
      pxFlowName: "RequirementsFulfillment",
      pxAssignedOperatorID: "CMCAwaitingFulfillmentQueue",
      pxTaskLabel: "Awaiting Fulfillment",
      pxUpdateDateTime: null,
      pxRefObjectClass: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
      pyAssignmentStatus: "Open-ClaimantPackageSent",
      pyInstructions: "Awaiting Fulfillment",
      pzInsKey:
        "ASSIGN-WORKBASKET AIG-LR-LIFE-CLM-WORK BU-21393!REQUIREMENTSFULFILLMENT",
      pxDeadlineTime: null,
      pxUpdateOperator: null,
      pxApplication: "CLM",
      pxObjClass: "Assign-WorkBasket",
      pxRefObjectKey: "AIG-LR-LIFE-CLM-WORK BU-21393",
      pyLabel: "Claimant, Beneficiary (BENETESTINTRTEREL05  TESTBENELASTNAME)",
      pxIsMultiStep: false,
      pyFlowType: "RequirementsFulfillment",
    },
    {
      pxTaskName: "Assignment3",
      pxUrgencyAssign: 50,
      pxProcessName: "Verify Requirements",
      pxRefObjectInsName: "BU-21392",
      pxFlowName: "RequirementsFulfillment",
      pxAssignedOperatorID: "CMCAwaitingFulfillmentQueue",
      pxUpdateDateTime: null,
      pxTaskLabel: "Awaiting Fulfillment",
      pxRefObjectClass: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
      pyAssignmentStatus: "Open-ClaimantPackageSent",
      pyInstructions: "Awaiting Fulfillment",
      pzInsKey:
        "ASSIGN-WORKBASKET AIG-LR-LIFE-CLM-WORK BU-21392!REQUIREMENTSFULFILLMENT",
      pxDeadlineTime: null,
      pxUpdateOperator: null,
      pxApplication: "CLM",
      pxObjClass: "Assign-WorkBasket",
      pxRefObjectKey: "AIG-LR-LIFE-CLM-WORK BU-21392",
      pyLabel: "Claimant, Beneficiary (KZNJD  TSZNO)",
      pxIsMultiStep: false,
      pyFlowType: "RequirementsFulfillment",
    },
    {
      pxUrgencyAssign: 50,
      pxTaskName: "Assignment3",
      pxProcessName: "Verify Requirements",
      pxRefObjectInsName: "BU-21390",
      pxFlowName: "RequirementsFulfillment",
      pxTaskLabel: "Awaiting Fulfillment",
      pxAssignedOperatorID: "CMCAwaitingFulfillmentQueue",
      pxUpdateDateTime: null,
      pxRefObjectClass: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
      pyInstructions: "Awaiting Fulfillment",
      pyAssignmentStatus: "Open-ClaimantPackageSent",
      pzInsKey:
        "ASSIGN-WORKBASKET AIG-LR-LIFE-CLM-WORK BU-21390!REQUIREMENTSFULFILLMENT",
      pxDeadlineTime: null,
      pxUpdateOperator: null,
      pxApplication: "CLM",
      pxObjClass: "Assign-WorkBasket",
      pxRefObjectKey: "AIG-LR-LIFE-CLM-WORK BU-21390",
      pyLabel: "Claimant, Beneficiary (GCPDZRGLL A PGQX)",
      pxIsMultiStep: false,
      pyFlowType: "RequirementsFulfillment",
    },
    {
      pxTaskName: "Assignment3",
      pxUrgencyAssign: 50,
      pxProcessName: "Verify Requirements",
      pxRefObjectInsName: "BU-21389",
      pxFlowName: "RequirementsFulfillment",
      pxUpdateDateTime: null,
      pxTaskLabel: "Awaiting Fulfillment",
      pxAssignedOperatorID: "CMCAwaitingFulfillmentQueue",
      pxRefObjectClass: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
      pyInstructions: "Awaiting Fulfillment",
      pyAssignmentStatus: "Open-ClaimantPackageSent",
      pzInsKey:
        "ASSIGN-WORKBASKET AIG-LR-LIFE-CLM-WORK BU-21389!REQUIREMENTSFULFILLMENT",
      pxDeadlineTime: null,
      pxUpdateOperator: null,
      pxApplication: "CLM",
      pxObjClass: "Assign-WorkBasket",
      pxRefObjectKey: "AIG-LR-LIFE-CLM-WORK BU-21389",
      pyLabel: "Claimant, Beneficiary (samantha  warner)",
      pyFlowType: "RequirementsFulfillment",
      pxIsMultiStep: false,
    },
    {
      pxUrgencyAssign: 50,
      pxTaskName: "Assignment3",
      pxProcessName: "Verify Requirements",
      pxRefObjectInsName: "BU-21379",
      pxFlowName: "RequirementsFulfillment",
      pxAssignedOperatorID: "CMCAwaitingFulfillmentQueue",
      pxUpdateDateTime: null,
      pxTaskLabel: "Awaiting Fulfillment",
      pxRefObjectClass: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
      pyAssignmentStatus: "Open-ClaimantPackageSent",
      pyInstructions: "Awaiting Fulfillment",
      pzInsKey:
        "ASSIGN-WORKBASKET AIG-LR-LIFE-CLM-WORK BU-21379!REQUIREMENTSFULFILLMENT",
      pxDeadlineTime: null,
      pxUpdateOperator: null,
      pxApplication: "CLM",
      pxObjClass: "Assign-WorkBasket",
      pxRefObjectKey: "AIG-LR-LIFE-CLM-WORK BU-21379",
      pyLabel: "Claimant, Beneficiary (Kate  Smith)",
      pyFlowType: "RequirementsFulfillment",
      pxIsMultiStep: false,
    },
    {
      pxUrgencyAssign: 50,
      pxTaskName: "Assignment3",
      pxProcessName: "Verify Requirements",
      pxRefObjectInsName: "BU-21410",
      pxFlowName: "RequirementsFulfillment",
      pxTaskLabel: "Awaiting Fulfillment",
      pxUpdateDateTime: null,
      pxAssignedOperatorID: "CMCAwaitingFulfillmentQueue",
      pxRefObjectClass: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
      pyInstructions: "Awaiting Fulfillment",
      pyAssignmentStatus: "Open-ClaimantPackageSent",
      pzInsKey:
        "ASSIGN-WORKBASKET AIG-LR-LIFE-CLM-WORK BU-21410!REQUIREMENTSFULFILLMENT",
      pxDeadlineTime: null,
      pxUpdateOperator: null,
      pxApplication: "CLM",
      pxObjClass: "Assign-WorkBasket",
      pxRefObjectKey: "AIG-LR-LIFE-CLM-WORK BU-21410",
      pyLabel: "Claimant, Beneficiary (J  Williams)",
      pxIsMultiStep: false,
      pyFlowType: "RequirementsFulfillment",
    },
    {
      pxTaskName: "Assignment3",
      pxUrgencyAssign: 50,
      pxProcessName: "Verify Requirements",
      pxRefObjectInsName: "BU-21391",
      pxFlowName: "RequirementsFulfillment",
      pxTaskLabel: "Awaiting Fulfillment",
      pxUpdateDateTime: null,
      pxAssignedOperatorID: "CMCAwaitingFulfillmentQueue",
      pxRefObjectClass: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
      pyInstructions: "Awaiting Fulfillment",
      pyAssignmentStatus: "Open-ClaimantPackageSent",
      pzInsKey:
        "ASSIGN-WORKBASKET AIG-LR-LIFE-CLM-WORK BU-21391!REQUIREMENTSFULFILLMENT",
      pxDeadlineTime: null,
      pxUpdateOperator: null,
      pxApplication: "CLM",
      pxObjClass: "Assign-WorkBasket",
      pxRefObjectKey: "AIG-LR-LIFE-CLM-WORK BU-21391",
      pyLabel: "Claimant, Beneficiary (KZQDCB F JPIRNPL)",
      pxIsMultiStep: false,
      pyFlowType: "RequirementsFulfillment",
    },
    {
      pxTaskName: "Assignment3",
      pxUrgencyAssign: 50,
      pxProcessName: "Verify Requirements",
      pxRefObjectInsName: "BU-21408",
      pxFlowName: "RequirementsFulfillment",
      pxTaskLabel: "Awaiting Fulfillment",
      pxAssignedOperatorID: "CMCAwaitingFulfillmentQueue",
      pxUpdateDateTime: null,
      pxRefObjectClass: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
      pyInstructions: "Awaiting Fulfillment",
      pyAssignmentStatus: "Open-ClaimantPackageSent",
      pzInsKey:
        "ASSIGN-WORKBASKET AIG-LR-LIFE-CLM-WORK BU-21408!REQUIREMENTSFULFILLMENT",
      pxDeadlineTime: null,
      pxUpdateOperator: null,
      pxApplication: "CLM",
      pxObjClass: "Assign-WorkBasket",
      pxRefObjectKey: "AIG-LR-LIFE-CLM-WORK BU-21408",
      pyLabel: "Claimant, Beneficiary (Kate  Smith)",
      pyFlowType: "RequirementsFulfillment",
      pxIsMultiStep: false,
    },
    {
      pxTaskName: "Assignment3",
      pxUrgencyAssign: 50,
      pxProcessName: "Verify Requirements",
      pxRefObjectInsName: "BU-21386",
      pxFlowName: "RequirementsFulfillment",
      pxTaskLabel: "Awaiting Fulfillment",
      pxUpdateDateTime: null,
      pxAssignedOperatorID: "CMCAwaitingFulfillmentQueue",
      pxRefObjectClass: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
      pyInstructions: "Awaiting Fulfillment",
      pyAssignmentStatus: "Open-ClaimantPackageSent",
      pzInsKey:
        "ASSIGN-WORKBASKET AIG-LR-LIFE-CLM-WORK BU-21386!REQUIREMENTSFULFILLMENT",
      pxDeadlineTime: null,
      pxUpdateOperator: null,
      pxApplication: "CLM",
      pxObjClass: "Assign-WorkBasket",
      pxRefObjectKey: "AIG-LR-LIFE-CLM-WORK BU-21386",
      pyLabel: "Claimant, Beneficiary (Adverd  Meaaa)",
      pyFlowType: "RequirementsFulfillment",
      pxIsMultiStep: false,
    },
    {
      pxUrgencyAssign: 50,
      pxTaskName: "Assignment3",
      pxProcessName: "Verify Requirements",
      pxRefObjectInsName: "BU-21349",
      pxFlowName: "RequirementsFulfillment",
      pxAssignedOperatorID: "CMCAwaitingFulfillmentQueue",
      pxTaskLabel: "Awaiting Fulfillment",
      pxUpdateDateTime: null,
      pxRefObjectClass: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
      pyAssignmentStatus: "Open-ClaimantPackageSent",
      pyInstructions: "Awaiting Fulfillment",
      pzInsKey:
        "ASSIGN-WORKBASKET AIG-LR-LIFE-CLM-WORK BU-21349!REQUIREMENTSFULFILLMENT",
      pxDeadlineTime: null,
      pxUpdateOperator: null,
      pxApplication: "CLM",
      pxObjClass: "Assign-WorkBasket",
      pxRefObjectKey: "AIG-LR-LIFE-CLM-WORK BU-21349",
      pyLabel: "Claimant, Beneficiary (FJVWPMR  EANWTWUG)",
      pyFlowType: "RequirementsFulfillment",
      pxIsMultiStep: false,
    },
    {
      pxUrgencyAssign: 50,
      pxTaskName: "Assignment3",
      pxProcessName: "Verify Requirements",
      pxRefObjectInsName: "BU-21350",
      pxFlowName: "RequirementsFulfillment",
      pxUpdateDateTime: null,
      pxTaskLabel: "Awaiting Fulfillment",
      pxAssignedOperatorID: "CMCAwaitingFulfillmentQueue",
      pxRefObjectClass: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
      pyAssignmentStatus: "Open-ClaimantPackageSent",
      pyInstructions: "Awaiting Fulfillment",
      pzInsKey:
        "ASSIGN-WORKBASKET AIG-LR-LIFE-CLM-WORK BU-21350!REQUIREMENTSFULFILLMENT",
      pxDeadlineTime: null,
      pxUpdateOperator: null,
      pxApplication: "CLM",
      pxObjClass: "Assign-WorkBasket",
      pxRefObjectKey: "AIG-LR-LIFE-CLM-WORK BU-21350",
      pyLabel: "Claimant, Beneficiary (Sharmila  K)",
      pxIsMultiStep: false,
      pyFlowType: "RequirementsFulfillment",
    },
    {
      pxUrgencyAssign: 50,
      pxTaskName: "Assignment3",
      pxProcessName: "Verify Requirements",
      pxRefObjectInsName: "BU-21352",
      pxFlowName: "RequirementsFulfillment",
      pxUpdateDateTime: null,
      pxAssignedOperatorID: "CMCAwaitingFulfillmentQueue",
      pxTaskLabel: "Awaiting Fulfillment",
      pxRefObjectClass: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
      pyInstructions: "Awaiting Fulfillment",
      pyAssignmentStatus: "Open-ClaimantPackageSent",
      pzInsKey:
        "ASSIGN-WORKBASKET AIG-LR-LIFE-CLM-WORK BU-21352!REQUIREMENTSFULFILLMENT",
      pxDeadlineTime: null,
      pxUpdateOperator: null,
      pxApplication: "CLM",
      pxObjClass: "Assign-WorkBasket",
      pxRefObjectKey: "AIG-LR-LIFE-CLM-WORK BU-21352",
      pyLabel: "Claimant, Beneficiary (WFJ  VLBFSG)",
      pxIsMultiStep: false,
      pyFlowType: "RequirementsFulfillment",
    },
    {
      pxTaskName: "Assignment3",
      pxUrgencyAssign: 10,
      pxProcessName: "Verify Requirements",
      pxRefObjectInsName: "BU-21419",
      pxFlowName: "RequirementsFulfillment",
      pxUpdateDateTime: null,
      pxTaskLabel: "Awaiting Fulfillment",
      pxAssignedOperatorID: "BeneficiaryQueue",
      pxRefObjectClass: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
      pyInstructions: "Awaiting Fulfillment",
      pyAssignmentStatus: "Open-ClaimantPackageSent",
      pzInsKey:
        "ASSIGN-WORKBASKET AIG-LR-LIFE-CLM-WORK BU-21419!REQUIREMENTSFULFILLMENT",
      pxDeadlineTime: null,
      pxUpdateOperator: null,
      pxApplication: "CLM",
      pxObjClass: "Assign-WorkBasket",
      pxRefObjectKey: "AIG-LR-LIFE-CLM-WORK BU-21419",
      pyLabel: "Claimant, Beneficiary (Rohit  Pathak)",
      pyFlowType: "RequirementsFulfillment",
      pxIsMultiStep: false,
    },
    {
      pxTaskName: "Assignment3",
      pxUrgencyAssign: 30,
      pxProcessName: "Verify Requirements",
      pxRefObjectInsName: "BU-21416",
      pxFlowName: "RequirementsFulfillment",
      pxUpdateDateTime: null,
      pxAssignedOperatorID: "CMCAwaitingFulfillmentQueue",
      pxTaskLabel: "Awaiting Fulfillment",
      pxRefObjectClass: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
      pyInstructions: "Awaiting Fulfillment",
      pyAssignmentStatus: "Open-ClaimantPackageSent",
      pzInsKey:
        "ASSIGN-WORKBASKET AIG-LR-LIFE-CLM-WORK BU-21416!REQUIREMENTSFULFILLMENT",
      pxDeadlineTime: null,
      pxUpdateOperator: null,
      pxApplication: "CLM",
      pxObjClass: "Assign-WorkBasket",
      pxRefObjectKey: "AIG-LR-LIFE-CLM-WORK BU-21416",
      pyLabel: "Claimant, Beneficiary (Peter  Bill)",
      pxIsMultiStep: false,
      pyFlowType: "RequirementsFulfillment",
    },
    {
      pxUrgencyAssign: 10,
      pxTaskName: "Assignment3",
      pxProcessName: "Verify Requirements",
      pxRefObjectInsName: "BU-21418",
      pxFlowName: "RequirementsFulfillment",
      pxUpdateDateTime: null,
      pxTaskLabel: "Awaiting Fulfillment",
      pxAssignedOperatorID: "CMCAwaitingFulfillmentQueue",
      pxRefObjectClass: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
      pyInstructions: "Awaiting Fulfillment",
      pyAssignmentStatus: "Open-ClaimantPackageSent",
      pzInsKey:
        "ASSIGN-WORKBASKET AIG-LR-LIFE-CLM-WORK BU-21418!REQUIREMENTSFULFILLMENT",
      pxDeadlineTime: null,
      pxUpdateOperator: null,
      pxApplication: "CLM",
      pxObjClass: "Assign-WorkBasket",
      pxRefObjectKey: "AIG-LR-LIFE-CLM-WORK BU-21418",
      pyLabel: "Claimant, Beneficiary (Peter  Bill)",
      pxIsMultiStep: false,
      pyFlowType: "RequirementsFulfillment",
    },
    {
      pxUrgencyAssign: 10,
      pxTaskName: "Assignment3",
      pxProcessName: "Verify Requirements",
      pxRefObjectInsName: "BU-21420",
      pxFlowName: "RequirementsFulfillment",
      pxAssignedOperatorID: "CMCAwaitingFulfillmentQueue",
      pxUpdateDateTime: null,
      pxRefObjectClass: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
      pyInstructions: "Awaiting Fulfillment",
      pyAssignmentStatus: "Open-ClaimantPackageSent",
      pzInsKey:
        "ASSIGN-WORKBASKET AIG-LR-LIFE-CLM-WORK BU-21420!REQUIREMENTSFULFILLMENT",
      pxDeadlineTime: null,
      pxUpdateOperator: null,
      pxApplication: "CLM",
      pxObjClass: "Assign-WorkBasket",
      pxRefObjectKey: "AIG-LR-LIFE-CLM-WORK BU-21420",
      pyLabel: "Claimant, Beneficiary (Rohit  Pathak)",
      pyFlowType: "RequirementsFulfillment",
      pxIsMultiStep: false,
    },
    {
      pxUrgencyAssign: 10,
      pxTaskName: "Assignment3",
      pxProcessName: "Verify Requirements",
      pxRefObjectInsName: "BU-21423",
      pxFlowName: "RequirementsFulfillment",
      pxAssignedOperatorID: "CMCAwaitingFulfillmentQueue",
      pxUpdateDateTime: null,
      pxTaskLabel: "Awaiting Fulfillment",
      pxRefObjectClass: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
      pyInstructions: "Awaiting Fulfillment",
      pyAssignmentStatus: "Open-ClaimantPackageSent",
      pzInsKey:
        "ASSIGN-WORKBASKET AIG-LR-LIFE-CLM-WORK BU-21423!REQUIREMENTSFULFILLMENT",
      pxDeadlineTime: null,
      pxUpdateOperator: null,
      pxApplication: "CLM",
      pxObjClass: "Assign-WorkBasket",
      pxRefObjectKey: "AIG-LR-LIFE-CLM-WORK BU-21423",
      pyLabel: "Claimant, Beneficiary (John  Wright)",
      pxIsMultiStep: false,
      pyFlowType: "RequirementsFulfillment",
    },
  ],
  hasMoreResults: false,
};

// ── Mock case info generator (mirrors Get Case API response baseline for BU-21393) ──
const mockCaseInfo = (
  caseKey = "AIG-LR-LIFE-CLM-WORK BU-21393",
  insName = "BU-21393",
) => ({
  associations: {
    follows: false,
  },
  assignments: [
    {
      instructions: "Awaiting Fulfillment",
      canPerform: "true",
      assigneeInfo: {
        name: "Awaiting Fulfillment",
        ID: "CMCAwaitingFulfillmentQueue",
        type: "workbasket",
      },
      processID: "RequirementsFulfillment",
      createTime: "2026-08-14T08:03:42.009Z",
      urgency: 50,
      processName: "Verify Requirements",
      isMultiStep: "false",
      name: "Awaiting Fulfillment",
      context: "",
      links: {
        open: {
          rel: "self",
          href: `/assignments/ASSIGN-WORKBASKET AIG-LR-LIFE-CLM-WORK ${insName}!REQUIREMENTSFULFILLMENT`,
          type: "GET",
          title: "Get assignment details",
        },
      },
      ID: `ASSIGN-WORKBASKET AIG-LR-LIFE-CLM-WORK ${insName}!REQUIREMENTSFULFILLMENT`,
      actions: [
        {
          name: "Awaiting Fulfillment",
          links: {
            submit: {
              rel: "self",
              href: `/assignments/ASSIGN-WORKBASKET AIG-LR-LIFE-CLM-WORK ${insName}!REQUIREMENTSFULFILLMENT/actions/AwaitingFulfillment`,
              type: "PATCH",
              title: "Submit assignment action ",
            },
            save: {
              rel: "self",
              href: `/assignments/ASSIGN-WORKBASKET AIG-LR-LIFE-CLM-WORK ${insName}!REQUIREMENTSFULFILLMENT/actions/AwaitingFulfillment/save`,
              type: "PATCH",
              title: "Save assignment action ",
            },
            open: {
              rel: "self",
              href: `/assignments/ASSIGN-WORKBASKET AIG-LR-LIFE-CLM-WORK ${insName}!REQUIREMENTSFULFILLMENT/actions/AwaitingFulfillment`,
              type: "GET",
              title: "Get assignment action details",
            },
          },
          ID: "AwaitingFulfillment",
          type: "FlowAction",
        },
      ],
    },
  ],
  caseTypeName: "Life Beneficiary Unit",
  urgency: 50,
  ID: caseKey,
  participants: [
    {
      lastName: "",
      country: "",
      role: "",
      city: "",
      postalCode: "",
      fullName: "",
      type: "Party",
      firstName: "",
      phone: "",
      ID: "",
      state: "",
      email: "",
    },
    {
      lastName: "TESTBENELASTNAME",
      country: "",
      role: "Beneficiary",
      city: "",
      postalCode: "",
      fullName: "BENETESTINTRTEREL05  TESTBENELASTNAME",
      type: "Person",
      firstName: "BENETESTINTRTEREL05",
      phone: "",
      ID: "",
      state: "",
      email: "test@test.com",
    },
  ],
  caseTypeID: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
  owner: "3044785",
  availableChildCaseTypes: [
    {
      name: "Disbursement",
      links: {
        submit: {
          rel: "self",
          href: "/cases/",
          type: "POST",
          title: "create child case",
        },
      },
      ID: "AIG-LR-Life-CLM-Work-Disbursement",
      canCreate: false,
    },
  ],
  lastUpdatedBy: "7513199",
  hasNewAttachments: false,
  parentCaseInfo: {
    hasMoreAncestors: "true",
    name: "Life Policy (AS124RTE06)",
    links: {
      hierarchy: {
        rel: "other",
        href: `/cases/AIG-LR-LIFE-CLM-WORK ${insName}/ancestors`,
        type: "GET",
        title: "open ancestor cases",
      },
      open: {
        rel: "other",
        href: "/cases/AIG-LR-LIFE-CLM-WORK PC-24626",
        type: "GET",
        title: "open parent case",
      },
    },
    ID: "AIG-LR-LIFE-CLM-WORK PC-24626",
    content: {
      pyStatusWork: "Pending-LifePolicy",
      pxCreateOperator: "3044785",
      classID: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-PolicyUnit",
      pxCreateDateTime: "2026-06-11T08:39:14.714Z",
      pxUpdateDateTime: "2026-07-28T13:00:33.099Z",
      pxUrgencyWork: "100",
      pxUpdateOperator: "System",
    },
  },
  businessID: insName,
  sla: {
    goal: "2026-06-12T21:59:59.000Z",
    deadline: "2026-06-18T21:59:59.000Z",
  },
  WidgetsToRefresh: [],
  createTime: "2026-06-11T08:39:19.873Z",
  createdBy: "3044785",
  name: "Claimant, Beneficiary (BENETESTINTRTEREL05  TESTBENELASTNAME)",
  stages: [
    {
      entryTime: "2026-06-11T08:39:19.917Z",
      name: "Verify Beneficiary",
      links: {
        open: {
          rel: "self",
          href: `/cases/AIG-LR-LIFE-CLM-WORK ${insName}/stages/PRIM1`,
          type: "PUT",
          title: "Jump to this stage",
        },
      },
      visited_status: "completed",
      ID: "PRIM1",
      type: "Primary",
      transitionType: "automatic",
    },
    {
      entryTime: "2026-08-14T08:03:41.723Z",
      name: "Document Fulfillment",
      links: {
        open: {
          rel: "self",
          href: `/cases/AIG-LR-LIFE-CLM-WORK ${insName}/stages/PRIM2`,
          type: "PUT",
          title: "Jump to this stage",
        },
      },
      visited_status: "active",
      ID: "PRIM2",
      type: "Primary",
      transitionType: "automatic",
    },
    {
      name: "Create Disbursement",
      links: {
        open: {
          rel: "self",
          href: `/cases/AIG-LR-LIFE-CLM-WORK ${insName}/stages/PRIM7`,
          type: "PUT",
          title: "Jump to this stage",
        },
      },
      visited_status: "future",
      ID: "PRIM7",
      type: "Primary",
      transitionType: "automatic",
    },
    {
      name: "Complete",
      links: {
        open: {
          rel: "self",
          href: `/cases/AIG-LR-LIFE-CLM-WORK ${insName}/stages/PRIM11`,
          type: "PUT",
          title: "Jump to this stage",
        },
      },
      visited_status: "future",
      ID: "PRIM11",
      type: "Primary",
      transitionType: "resolution",
    },
    {
      name: "Close",
      links: {
        open: {
          rel: "self",
          href: `/cases/AIG-LR-LIFE-CLM-WORK ${insName}/stages/PRIM12`,
          type: "PUT",
          title: "Jump to this stage",
        },
      },
      visited_status: "future",
      ID: "PRIM12",
      type: "Primary",
      transitionType: "resolution",
    },
    {
      name: "Closed",
      links: {
        open: {
          rel: "self",
          href: `/cases/AIG-LR-LIFE-CLM-WORK ${insName}/stages/ALT1`,
          title: "Jump to this stage",
          type: "PUT",
        },
      },
      visited_status: "future",
      ID: "ALT1",
      type: "Alternate",
      transitionType: "resolution",
    },
    {
      name: "TerminateBene",
      visited_status: "future",
      links: {
        open: {
          rel: "self",
          href: `/cases/AIG-LR-LIFE-CLM-WORK ${insName}/stages/ALT2`,
          type: "PUT",
          title: "Jump to this stage",
        },
      },
      ID: "ALT2",
      type: "Alternate",
      transitionType: "manual",
    },
  ],
  caseTypeIcon: "cmicons/pyCase8.gif",
  status: "Open-ClaimantPackageSent",
  stageID: "PRIM2",
  stageLabel: "Document Fulfillment",
  lastUpdateTime: "2026-08-14T08:03:42.026Z",
  content: {
    classID: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
    pxObjClass: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
    pyLabel: "Claimant, Beneficiary (BENETESTINTRTEREL05  TESTBENELASTNAME)",
    pyID: insName,
    pyViewName: "",
    pyViewContext: "",
    pxUrgencyWork: 50,
    pxCreateOperator: "3044785",
    pxUpdateDateTime: "2026-08-14T08:03:42.026Z",
    pxUpdateOperator: "7513199",
    pxCreateDateTime: "2026-06-11T08:39:19.873Z",
    pyStatusWork: "Open-ClaimantPackageSent",
    pyCaseLinks: [],
  },
});

// ── Mock assignment view response (mirrors GET assignments/{assignmentID}/actions/{actionID} baseline) ─
const mockAssignmentView = (caseKey, insName) => ({
  data: {
    caseInfo: mockCaseInfo(caseKey, insName),
  },
  view: {
    validationMessages: "",
    visible: true,
    appliesTo: "AIG-LR-Life-CLM-Work-ClaimUnit-Life-Beneficiary",
    groups: [
      {
        layout: {
          visible: true,
          titleFormat: "h2",
          groupsVisibility: true,
          containerFormat: "NOHEADER",
          groups: [
            {
              caption: {
                visible: true,
                value: "Awaiting Beneficiary to respond",
              },
            },
          ],
          layoutFormat: "SIMPLELAYOUT",
          title: "",
        },
      },
      {
        layout: {
          visible: true,
          repeatContainerFormat: "NOHEADER",
          fieldListID: ".NIGORequirementList",
          referenceType: "List",
          rows: [
            {
              groups: [
                {
                  view: {
                    reference: "NIGORequirementList(1)",
                    groups: [
                      {
                        layout: {
                          groups: [
                            {
                              layout: {
                                groups: [
                                  {
                                    field: {
                                      control: {
                                        label: "Claimant Statement",
                                      },
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  field: {
                    fieldID: "RequirementDetail",
                    value: "BENETESTINTRTEREL05  TESTBENELASTNAME",
                  },
                },
                {
                  field: {
                    fieldID: "NIGOCorrectionDetails",
                    value: "",
                  },
                },
                {
                  field: {
                    fieldID: "DocumentStatus",
                    value: "",
                  },
                },
                {
                  field: {
                    fieldID: "WorkBenchStatus",
                    value: "Ordered",
                  },
                },
                {
                  field: {
                    fieldID: "BeneficiaryComments",
                    value: "",
                  },
                },
              ],
            },
            {
              groups: [
                {
                  view: {
                    reference: "NIGORequirementList(2)",
                    groups: [
                      {
                        layout: {
                          groups: [
                            {
                              layout: {
                                groups: [
                                  {
                                    field: {
                                      control: {
                                        label: "Obituary",
                                      },
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  field: {
                    fieldID: "RequirementDetail",
                    value: "BOERIC INTRTDEC",
                  },
                },
                {
                  field: {
                    fieldID: "NIGOCorrectionDetails",
                    value: "",
                  },
                },
                {
                  field: {
                    fieldID: "DocumentStatus",
                    value: "",
                  },
                },
                {
                  field: {
                    fieldID: "WorkBenchStatus",
                    value: "Ordered",
                  },
                },
                {
                  field: {
                    fieldID: "BeneficiaryComments",
                    value: "",
                  },
                },
              ],
            },
          ],
        },
      },
    ],
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
  await new Promise((r) => setTimeout(r, 200 + Math.random() * 300));

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
      token_type: "bearer",
      expires_in: 3600,
    });
  }

  const authError = requireMockToken(input, options);
  if (authError) return authError;

  // ── Data view (case list) ───────────────────────────────────────────────
  if (url.includes(MOCK_DATA_VIEW) && method === "POST") {
    return jsonResponse(mockCaseListResponse);
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
      : "AIG-LR-LIFE-CLM-WORK BU-21393";
    const insName = caseKey.split(" ").pop() || "BU-21393";
    return jsonResponse({
      data: { caseInfo: mockCaseInfo(caseKey, insName) },
    });
  }

  // ── Assignment details GET ──────────────────────────────────────────────
  if (
    method === "GET" &&
    url.includes("/assignments/") &&
    !url.includes("/actions/")
  ) {
    const asgMatch = url.match(/\/assignments\/([^/]+)/);
    const caseKey = asgMatch
      ? decodeURIComponent(asgMatch[1])
          .replace("ASSIGN-WORKBASKET ", "")
          .split("!")[0]
      : "AIG-LR-LIFE-CLM-WORK BU-21393";
    return jsonResponse({
      caseID: caseKey.includes(" ")
        ? caseKey
        : `AIG-LR-LIFE-CLM-WORK ${caseKey}`,
      ID: `ASSIGN-WORKBASKET ${caseKey.includes(" ") ? caseKey : `AIG-LR-LIFE-CLM-WORK ${caseKey}`}!REQUIREMENTSFULFILLMENT`,
      instructions: "Awaiting Fulfillment",
      name: "Claimant, Beneficiary (BENETESTINTRTEREL05  TESTBENELASTNAME)",
      pxObjClass: "Pega-API-CaseManagement-Assignment",
      routedTo: "CMCAwaitingFulfillmentQueue",
      type: "Workbasket",
      urgency: "50",
      actionButtons: {
        pxObjClass: "Pega-API-CaseManagement-Assignment",
        main: [
          {
            actionID: "submit",
            jsAction: "finishAssignment",
            name: "Submit",
            pxObjClass: "Pega-API-CaseManagement-Assignment",
          },
        ],
        secondary: [
          {
            actionID: "cancel",
            jsAction: "cancelAssignment",
            name: "Cancel",
            pxObjClass: "Pega-API-CaseManagement-Assignment",
          },
          {
            actionID: "save",
            jsAction: "saveAssignment",
            name: "Save for later",
            pxObjClass: "Pega-API-CaseManagement-Assignment",
            links: {
              pxObjClass: "Embed-Hateoas-Link",
              open: {
                href: `assignments/ASSIGN-WORKBASKET ${caseKey}!REQUIREMENTSFULFILLMENT?actionID=AwaitingFulfillment&saveOnly=true`,
                pxObjClass: "Embed-Hateoas-Link",
                rel: "self",
                title: "Save",
                type: "POST",
              },
            },
          },
        ],
      },
      actions: [
        {
          ID: "AwaitingFulfillment",
          name: "Awaiting Fulfillment",
          pxObjClass: "Pega-API-CaseManagement-Action",
          type: "Assignment",
        },
      ],
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
      : "AIG-LR-LIFE-CLM-WORK BU-21393";
    const insName = caseKey.split(" ").pop() || "BU-21393";
    return jsonResponse(mockAssignmentView(caseKey, insName), 200, {
      ETag: '"mock-etag-cv"',
    });
  }

  // ── Assignment submit/save POST ─────────────────────────────────────────
  if (
    method === "POST" &&
    url.includes("/assignments/") &&
    !url.includes("/attachments/")
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
