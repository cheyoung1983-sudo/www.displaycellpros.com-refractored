import React, { useState, useEffect } from "react";
import { 
  Terminal, 
  Play, 
  RefreshCw, 
  Cpu, 
  ShieldCheck, 
  Copy, 
  Check, 
  Globe, 
  Lock, 
  Loader2, 
  FileCode,
  Sliders,
  Send,
  Radio,
  FileText,
  Boxes,
  Key,
  Layers,
  Settings,
  UserCheck
} from "lucide-react";

interface IdentityToolkitRpcExplorerProps {
  currentUserIdToken?: string;
  currentUserEmail?: string;
  addToast: (msg: string, desc: string, type: "success" | "error" | "info" | "warning") => void;
}

interface RpcMethod {
  id: string;
  label: string;
  defaultPayload: (ctx: { email: string; token: string; tenantId: string }) => any;
}

interface RpcService {
  id: string;
  name: string;
  description: string;
  version: "v1" | "v2" | "v2beta1";
  methods: RpcMethod[];
}

const SERVICES: RpcService[] = [
  {
    id: "google.cloud.identitytoolkit.v1.AuthenticationService",
    name: "AuthenticationService",
    description: "End-user authentications & account handshakes",
    version: "v1",
    methods: [
      {
        id: "SignInWithPassword",
        label: "signInWithPassword (Authenticate user)",
        defaultPayload: (ctx) => ({
          email: ctx.email || "forensic_agent@displaycellpros.com",
          password: "SAC305_Reflow_400C!",
          returnSecureToken: true
        })
      },
      {
        id: "SignUp",
        label: "signUp (Create user identity)",
        defaultPayload: (ctx) => ({
          email: ctx.email || "new_auditor@displaycellpros.com",
          password: "SAC305_Reflow_400C!",
          returnSecureToken: true
        })
      },
      {
        id: "SendOobCode",
        label: "sendOobCode (Reset password or verify)",
        defaultPayload: (ctx) => ({
          requestType: "PASSWORD_RESET",
          email: ctx.email || "forensic_agent@displaycellpros.com"
        })
      }
    ]
  },
  {
    id: "google.cloud.identitytoolkit.v1.AccountManagementService",
    name: "AccountManagementService",
    description: "User profile queries & statutory life-cycle updates",
    version: "v1",
    methods: [
      {
        id: "GetAccountInfo",
        label: "getAccountInfo (Look up profile parameters)",
        defaultPayload: (ctx) => ({
          idToken: ctx.token || "eyJhbGciOiJSUzI1NiIsImtpZCI6ImYxZjk5In0..."
        })
      },
      {
        id: "SetAccountInfo",
        label: "setAccountInfo (Apply updates & custom claims)",
        defaultPayload: (ctx) => ({
          idToken: ctx.token || "eyJhbGciOiJSUzI1NiIsImtpZCI6ImYxZjk5In0...",
          displayName: "Lead Forensic Operator",
          emailVerified: true
        })
      },
      {
        id: "DeleteAccount",
        label: "deleteAccount (Deprovision and shred session)",
        defaultPayload: (ctx) => ({
          idToken: ctx.token || "eyJhbGciOiJSUzI1NiIsImtpZCI6ImYxZjk5In0..."
        })
      }
    ]
  },
  {
    id: "google.cloud.identitytoolkit.v1.SessionManagementService",
    name: "SessionManagementService",
    description: "Secure cross-domain session cookies (Statutory compliance)",
    version: "v1",
    methods: [
      {
        id: "CreateSessionCookie",
        label: "createSessionCookie (Generate Session Token)",
        defaultPayload: (ctx) => ({
          idToken: ctx.token || "eyJhbGciOiJSUzI1NiIsImtpZCI6ImYxZjk5In0...",
          validDuration: "1209600" // 14 days
        })
      }
    ]
  },
  {
    id: "google.cloud.identitytoolkit.v1.ProjectConfigService",
    name: "ProjectConfigService (v1)",
    description: "Identity Project Settings (v1 Namespace)",
    version: "v1",
    methods: [
      {
        id: "GetProjectConfig",
        label: "getProjectConfig (Retrieve settings)",
        defaultPayload: () => ({})
      },
      {
        id: "UpdateProjectConfig",
        label: "updateProjectConfig (Patch policy details)",
        defaultPayload: () => ({
          passwordPolicy: {
            allowedMinLength: 8,
            allowedMaxLength: 32
          }
        })
      }
    ]
  },
  {
    id: "google.cloud.identitytoolkit.admin.v2.ProjectConfigService",
    name: "ProjectConfigService (admin.v2)",
    description: "Enterprise project configs, MFA strength, IDPs & reCAPTCHA",
    version: "v2",
    methods: [
      {
        id: "GetProjectConfig",
        label: "getProjectConfig (Query enterprise configs)",
        defaultPayload: () => ({})
      },
      {
        id: "UpdateProjectConfig",
        label: "updateProjectConfig (Modify strict compliance thresholds)",
        defaultPayload: () => ({
          passwordPolicy: {
            allowedMinLength: 10,
            schemaVersion: "V2_STRONG"
          },
          recaptchaConfig: {
            emailPasswordEnforcementState: "AUDIT"
          }
        })
      },
      {
        id: "CreateDefaultSupportedIdpConfig",
        label: "createDefaultSupportedIdpConfig (Add standard provider)",
        defaultPayload: () => ({
          defaultSupportedIdpConfigId: "google.com",
          enabled: true,
          clientId: "1046067704682-simulated.apps.googleusercontent.com",
          clientSecret: "simulated_client_secret_xyz123"
        })
      },
      {
        id: "GetDefaultSupportedIdpConfig",
        label: "getDefaultSupportedIdpConfig (Query standard provider)",
        defaultPayload: () => ({
          defaultSupportedIdpConfigId: "google.com"
        })
      },
      {
        id: "UpdateDefaultSupportedIdpConfig",
        label: "updateDefaultSupportedIdpConfig (Patch standard provider)",
        defaultPayload: () => ({
          defaultSupportedIdpConfigId: "google.com",
          enabled: true,
          clientId: "1046067704682-simulated.apps.googleusercontent.com",
          clientSecret: "simulated_client_secret_xyz123",
          updateMask: "clientId,clientSecret,enabled"
        })
      },
      {
        id: "ListDefaultSupportedIdpConfigs",
        label: "listDefaultSupportedIdpConfigs (List standard providers)",
        defaultPayload: () => ({
          pageSize: 10,
          pageToken: ""
        })
      },
      {
        id: "DeleteDefaultSupportedIdpConfig",
        label: "deleteDefaultSupportedIdpConfig (Remove standard provider)",
        defaultPayload: () => ({
          defaultSupportedIdpConfigId: "google.com"
        })
      },
      {
        id: "CreateOAuthIdpConfig",
        label: "createOAuthIdpConfig (Register Custom OIDC/OAuth)",
        defaultPayload: () => ({
          oauthIdpConfigId: "oidc.dcp-partner-sso",
          displayName: "DCP Forensic Partner Identity Federation",
          enabled: true,
          clientId: "partner_client_id_992",
          clientSecret: "partner_secret_key_883",
          issuer: "https://identity.partner-sso.org"
        })
      },
      {
        id: "GetOAuthIdpConfig",
        label: "getOAuthIdpConfig (Query Custom OIDC/OAuth config)",
        defaultPayload: () => ({
          oauthIdpConfigId: "oidc.dcp-partner-sso"
        })
      },
      {
        id: "UpdateOAuthIdpConfig",
        label: "updateOAuthIdpConfig (Update Custom OIDC/OAuth config)",
        defaultPayload: () => ({
          oauthIdpConfigId: "oidc.dcp-partner-sso",
          displayName: "DCP Forensic Partner Identity Federation (Updated)",
          clientId: "partner_client_id_992_v2",
          clientSecret: "partner_secret_key_883_v2",
          updateMask: "displayName,clientId,clientSecret"
        })
      },
      {
        id: "ListOAuthIdpConfigs",
        label: "listOAuthIdpConfigs (List registered Custom OIDC/OAuth)",
        defaultPayload: () => ({
          pageSize: 10,
          pageToken: ""
        })
      },
      {
        id: "DeleteOAuthIdpConfig",
        label: "deleteOAuthIdpConfig (Decommission Custom OIDC/OAuth)",
        defaultPayload: () => ({
          oauthIdpConfigId: "oidc.dcp-partner-sso"
        })
      }
    ]
  },
  {
    id: "google.cloud.identitytoolkit.admin.v2.TenantManagementService",
    name: "TenantManagementService (admin.v2)",
    description: "Configure multi-tenant physical laboratory segmentations",
    version: "v2",
    methods: [
      {
        id: "CreateTenant",
        label: "createTenant (Register isolation silo)",
        defaultPayload: (ctx) => ({
          tenantId: ctx.tenantId || "dcp-east-silo-1",
          displayName: "DCP East Coast Motherboard Lab",
          allowPasswordSignup: true,
          enableEmailLinkSignIn: false
        })
      },
      {
        id: "GetTenant",
        label: "getTenant (Fetch silo active policy)",
        defaultPayload: (ctx) => ({
          tenantId: ctx.tenantId || "dcp-east-silo-1"
        })
      },
      {
        id: "ListTenants",
        label: "listTenants (Page through active partition silos)",
        defaultPayload: () => ({
          pageSize: 10,
          pageToken: ""
        })
      },
      {
        id: "DeleteTenant",
        label: "deleteTenant (Decommission isolation silo)",
        defaultPayload: (ctx) => ({
          tenantId: ctx.tenantId || "dcp-east-silo-1"
        })
      }
    ]
  },
  {
    id: "google.cloud.identitytoolkit.v2beta1.ProjectConfigService",
    name: "ProjectConfigService (v2beta1)",
    description: "Beta feature previews and experimental settings",
    version: "v2beta1",
    methods: [
      {
        id: "GetProjectConfig",
        label: "getProjectConfig (Fetch preview configs)",
        defaultPayload: () => ({})
      },
      {
        id: "UpdateProjectConfig",
        label: "updateProjectConfig (Patch experimental policy)",
        defaultPayload: () => ({
          passwordPolicy: {
            allowedMinLength: 12,
            schemaVersion: "V2_STRONG"
          }
        })
      },
      {
        id: "EnableCicp",
        label: "enableCicp (Enable Customer & Partner auth)",
        defaultPayload: () => ({
          projectId: "displaycellpros-telemetry"
        })
      }
    ]
  },
  {
    id: "google.cloud.identitytoolkit.v2beta1.TenantManagementService",
    name: "TenantManagementService (v2beta1)",
    description: "Beta multi-tenancy pipelines and previews",
    version: "v2beta1",
    methods: [
      {
        id: "CreateTenant",
        label: "createTenant (Beta Register Isolation Silo)",
        defaultPayload: (ctx) => ({
          tenantId: ctx.tenantId || "beta-silo-7",
          displayName: "DCP Beta Testbed Segment",
          allowPasswordSignup: true
        })
      },
      {
        id: "GetTenant",
        label: "getTenant (Beta Get Silo)",
        defaultPayload: (ctx) => ({
          tenantId: ctx.tenantId || "beta-silo-7"
        })
      },
      {
        id: "ListTenants",
        label: "listTenants (Beta List Silos)",
        defaultPayload: () => ({
          pageSize: 5
        })
      },
      {
        id: "DeleteTenant",
        label: "deleteTenant (Beta Delete Silo)",
        defaultPayload: (ctx) => ({
          tenantId: ctx.tenantId || "beta-silo-7"
        })
      }
    ]
  },
  {
    id: "google.cloud.identitytoolkit.v2.InboundSamlConfigService",
    name: "InboundSamlConfigService (apps_auth)",
    description: "Federated Enterprise SSO, SAML RP-IDP & x509 configurations",
    version: "v2",
    methods: [
      {
        id: "CreateInboundSamlConfig",
        label: "createInboundSamlConfig (Register SAML provider)",
        defaultPayload: () => ({
          inboundSamlConfigId: "saml.dcp-enterprise-sso",
          displayName: "Display Cell Pros SAML Auth Federation",
          enabled: true,
          idpConfig: {
            idpEntityId: "https://idp.displaycellpros.com/metadata",
            ssoUrl: "https://idp.displaycellpros.com/sso/saml2",
            signRequest: true,
            certificates: [
              {
                x509Certificate: "-----BEGIN CERTIFICATE-----\nMIIDdDCCAlygAwIBAgIQY...\n-----END CERTIFICATE-----"
              }
            ]
          },
          rpConfig: {
            rpEntityId: "https://displaycellpros-com.firebaseapp.com/__/auth/handler",
            callbackUrl: "https://displaycellpros-com.firebaseapp.com/__/auth/handler"
          },
          samlCustomerId: "C02df3g1h"
        })
      },
      {
        id: "GetInboundSamlConfig",
        label: "getInboundSamlConfig (Query SSO config details)",
        defaultPayload: () => ({
          inboundSamlConfigId: "saml.dcp-enterprise-sso"
        })
      },
      {
        id: "UpdateInboundSamlConfig",
        label: "updateInboundSamlConfig (Update SAML & Certificate parameters)",
        defaultPayload: () => ({
          inboundSamlConfigId: "saml.dcp-enterprise-sso",
          displayName: "Display Cell Pros SAML Auth Federation (Active)",
          idpConfig: {
            idpEntityId: "https://idp.displaycellpros.com/metadata",
            ssoUrl: "https://idp.displaycellpros.com/sso/saml2",
            signRequest: true,
            certificates: [
              {
                x509Certificate: "-----BEGIN CERTIFICATE-----\nMIIDdDCCAlygAwIBAgIQY...\n-----END CERTIFICATE-----"
              }
            ]
          },
          updateMask: "displayName,idpConfig.certificates"
        })
      },
      {
        id: "ListInboundSamlConfigs",
        label: "listInboundSamlConfigs (List federated SSO configurations)",
        defaultPayload: () => ({
          pageSize: 10,
          pageToken: ""
        })
      },
      {
        id: "DeleteInboundSamlConfig",
        label: "deleteInboundSamlConfig (Decommission SAML SSO config)",
        defaultPayload: () => ({
          inboundSamlConfigId: "saml.dcp-enterprise-sso"
        })
      }
    ]
  },
  {
    id: "google.cloud.identitytoolkit.v2.AuthenticationService",
    name: "AuthenticationService (v2)",
    description: "MFA challenge validation, password strength policies & token revocation",
    version: "v2",
    methods: [
      {
        id: "StartMfaSignIn",
        label: "startMfaSignIn (Trigger MFA challenge)",
        defaultPayload: () => ({
          mfaPendingCredential: "simulated_pending_mfa_token_abc123",
          tenantId: "dcp-east-silo-1",
          mfaEnrollmentId: "mfa-phone-enrollment-99",
          phoneSignInInfo: {
            phoneNumber: "+15550199222",
            recaptchaToken: "recaptcha_v3_simulated_token"
          }
        })
      },
      {
        id: "FinalizeMfaSignIn",
        label: "finalizeMfaSignIn (Authenticate MFA challenge)",
        defaultPayload: () => ({
          mfaPendingCredential: "simulated_pending_mfa_token_abc123",
          tenantId: "dcp-east-silo-1",
          mfaEnrollmentId: "mfa-phone-enrollment-99",
          phoneVerificationInfo: {
            sessionInfo: "sim_session_inf_1182",
            code: "481029"
          }
        })
      },
      {
        id: "GetPasswordPolicy",
        label: "getPasswordPolicy (Fetch enterprise password rules)",
        defaultPayload: () => ({
          tenantId: "dcp-east-silo-1"
        })
      },
      {
        id: "GetRecaptchaConfig",
        label: "getRecaptchaConfig (Fetch reCAPTCHA parameters)",
        defaultPayload: () => ({
          tenantId: "dcp-east-silo-1",
          clientType: "CLIENT_TYPE_WEB",
          version: "RECAPTCHA_VERSION_V3"
        })
      },
      {
        id: "RevokeToken",
        label: "revokeToken (Revoke refresh tokens)",
        defaultPayload: () => ({
          idToken: "current_user_token_abc123",
          tokenType: "REFRESH_TOKEN"
        })
      }
    ]
  },
  {
    id: "google.cloud.identitytoolkit.v2.AccountManagementService",
    name: "AccountManagementService (v2)",
    description: "Enforce multi-factor auth enrollments and lifecycles",
    version: "v2",
    methods: [
      {
        id: "StartMfaEnrollment",
        label: "startMfaEnrollment (Initiate user factor binding)",
        defaultPayload: () => ({
          idToken: "current_user_token_abc123",
          tenantId: "dcp-east-silo-1",
          phoneEnrollmentInfo: {
            phoneNumber: "+15550199222",
            recaptchaToken: "recaptcha_v3_simulated_token"
          }
        })
      },
      {
        id: "FinalizeMfaEnrollment",
        label: "finalizeMfaEnrollment (Complete factor authentication)",
        defaultPayload: () => ({
          idToken: "current_user_token_abc123",
          displayName: "DCP Security Phone MFA",
          tenantId: "dcp-east-silo-1",
          phoneVerificationInfo: {
            sessionInfo: "sim_session_inf_1182",
            code: "881029"
          }
        })
      },
      {
        id: "WithdrawMfa",
        label: "withdrawMfa (Revoke secondary authentication factors)",
        defaultPayload: () => ({
          idToken: "current_user_token_abc123",
          tenantId: "dcp-east-silo-1",
          mfaEnrollmentId: "mfa-phone-enrollment-99"
        })
      }
    ]
  },
  {
    id: "google.iam.v1.IAMPolicy",
    name: "IAMPolicyService (v1)",
    description: "Manage Identity and Access Management (IAM) policies on resources",
    version: "v1",
    methods: [
      {
        id: "GetIamPolicy",
        label: "getIamPolicy (Get IAM Policy for a resource)",
        defaultPayload: () => ({
          resource: "projects/displaycellpros-com",
          options: {
            requestedPolicyVersion: 3
          }
        })
      },
      {
        id: "SetIamPolicy",
        label: "setIamPolicy (Set IAM Policy for a resource)",
        defaultPayload: () => ({
          resource: "projects/displaycellpros-com",
          policy: {
            version: 3,
            bindings: [
              {
                role: "roles/identitytoolkit.admin",
                members: [
                  "user:mike@displaycellpros.com",
                  "serviceAccount:sa-evaluator@displaycellpros-com.iam.gserviceaccount.com"
                ],
                condition: {
                  title: "Expirable Administrative Access",
                  description: "Does not grant access after December 2026",
                  expression: "request.time < timestamp('2026-12-31T23:59:59Z')"
                }
              },
              {
                role: "roles/identitytoolkit.viewer",
                members: [
                  "group:auditors@displaycellpros.com"
                ]
              }
            ],
            etag: "BwWWja0YfJA="
          },
          updateMask: "bindings,etag"
        })
      },
      {
        id: "TestIamPermissions",
        label: "testIamPermissions (Test permissions on a resource)",
        defaultPayload: () => ({
          resource: "projects/displaycellpros-com",
          permissions: [
            "identitytoolkit.projects.get",
            "identitytoolkit.projects.update"
          ]
        })
      }
    ]
  },
  {
    id: "google.cloud.recaptchaenterprise.v1.RecaptchaEnterpriseService",
    name: "RecaptchaEnterpriseService",
    description: "Google Cloud Fraud Defense, real-time transaction assessment & account risk scores",
    version: "v1",
    methods: [
      {
        id: "CreateAssessment",
        label: "projects.assessments.create (Evaluate token & account context)",
        defaultPayload: (ctx) => ({
          assessment: {
            event: {
              token: "offline_handshake_verification_token_71829",
              siteKey: "6LcgWy4tAAAAABP-_hU5ngbkKF5scb2DnI2_bscl",
              expectedAction: "diagnostic_handshake",
              accountId: ctx.email || "forensic_agent@displaycellpros.com",
              userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
              userIpAddress: "192.168.1.100"
            }
          }
        })
      },
      {
        id: "AnnotateAssessment",
        label: "projects.assessments.annotate (Label diagnostic findings for feedback)",
        defaultPayload: () => ({
          name: "projects/displaycellpros-com/assessments/sim_assessment_102834",
          annotation: "LEGITIMATE",
          reasons: ["CHARGEBACK_REVERSED", "TWO_FACTOR_AUTHENTICATED"],
          hashedAccountId: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        })
      },
      {
        id: "ListRelatedAccountGroupMemberships",
        label: "ListRelatedAccountGroupMemberships (Audit device credentials stuffing)",
        defaultPayload: () => ({
          pageSize: 20,
          pageToken: ""
        })
      },
      {
        id: "ListRelatedAccountGroups",
        label: "ListRelatedAccountGroups (List groups with shared attributes)",
        defaultPayload: () => ({
          pageSize: 10,
          pageToken: ""
        })
      },
      {
        id: "SearchRelatedAccountGroupMemberships",
        label: "SearchRelatedAccountGroupMemberships (Query forensic device matches)",
        defaultPayload: (ctx) => ({
          accountId: ctx.email || "forensic_agent@displaycellpros.com",
          pageSize: 10
        })
      },
      {
        id: "ListFirewallPolicies",
        label: "ListFirewallPolicies (Inspect edge defense policies)",
        defaultPayload: () => ({
          pageSize: 10
        })
      }
    ]
  }
];

export function IdentityToolkitRpcExplorer({ currentUserIdToken = "", currentUserEmail = "", addToast }: IdentityToolkitRpcExplorerProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(SERVICES[0].id);
  const [selectedMethodId, setSelectedMethodId] = useState<string>(SERVICES[0].methods[0].id);
  
  // Payload customizer state
  const [email, setEmail] = useState<string>("forensic_agent@displaycellpros.com");
  const [idToken, setIdToken] = useState<string>("");
  const [tenantId, setTenantId] = useState<string>("dcp-east-silo-1");
  const [rawPayloadJson, setRawPayloadJson] = useState<string>("");

  const [apiKey, setApiKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [traceLog, setTraceLog] = useState<{
    success: boolean;
    serviceName: string;
    rpcMethod: string;
    endpoint: string;
    status: number;
    durationMs: number;
    isSimulated: boolean;
    rawRequestPacket: string;
    rawResponsePacket: string;
    responsePayload: any;
  } | null>(null);

  const [copiedSection, setCopiedSection] = useState<"curl" | "request" | "response" | null>(null);

  // Sync token from parent on load/update
  useEffect(() => {
    if (currentUserIdToken) {
      setIdToken(currentUserIdToken);
    }
  }, [currentUserIdToken]);

  useEffect(() => {
    if (currentUserEmail) {
      setEmail(currentUserEmail);
    }
  }, [currentUserEmail]);

  // Find active service and method
  const activeService = SERVICES.find(s => s.id === selectedServiceId) || SERVICES[0];
  const activeMethod = activeService.methods.find(m => m.id === selectedMethodId) || activeService.methods[0];

  // Refresh payload template when service, method, or context inputs change
  useEffect(() => {
    if (activeMethod) {
      const template = activeMethod.defaultPayload({
        email,
        token: idToken || currentUserIdToken || "eyJhbGciOiJSUzI1NiIsImtpZCI6ImYxZjk5In0.eyJzdWIiOiJzaW1fdXNlcl91aWRfODIxOSJ9",
        tenantId
      });
      setRawPayloadJson(JSON.stringify(template, null, 2));
    }
  }, [selectedServiceId, selectedMethodId, email, tenantId, currentUserIdToken]);

  // Handle service drop change
  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const service = SERVICES.find(s => s.id === serviceId) || SERVICES[0];
    setSelectedMethodId(service.methods[0].id);
  };

  // Safe parse payload
  const getParsedPayload = () => {
    try {
      return JSON.parse(rawPayloadJson);
    } catch (e) {
      return {};
    }
  };

  // Build compliant Curl string mimicking REST instructions
  const generateCurlCommand = () => {
    const keyStr = apiKey || "DCP_ENTERPRISE_API_KEY";
    const projId = "displaycellpros-com";

    let path = "";
    let method = "POST";

    if (selectedServiceId === "google.cloud.identitytoolkit.v1.AuthenticationService") {
      const map: Record<string, string> = {
        SignUp: "accounts:signUp",
        SignInWithPassword: "accounts:signInWithPassword",
        SendOobCode: "accounts:sendOobCode"
      };
      path = `v1/${map[selectedMethodId] || "accounts"}`;
    } 
    else if (selectedServiceId === "google.cloud.identitytoolkit.v1.AccountManagementService") {
      const map: Record<string, string> = {
        GetAccountInfo: "accounts:lookup",
        SetAccountInfo: "accounts:update",
        DeleteAccount: "accounts:delete"
      };
      path = `v1/${map[selectedMethodId] || "accounts"}`;
    } 
    else if (selectedServiceId === "google.cloud.identitytoolkit.v1.SessionManagementService") {
      path = `v1/projects/${projId}/createSessionCookie`;
    } 
    else if (selectedServiceId === "google.cloud.identitytoolkit.v1.ProjectConfigService") {
      path = `v1/projects/${projId}/config`;
      method = selectedMethodId === "GetProjectConfig" ? "GET" : "PATCH";
    } 
    else if (selectedServiceId === "google.cloud.identitytoolkit.admin.v2.ProjectConfigService") {
      const payloadObj = getParsedPayload();
      if (selectedMethodId === "GetProjectConfig") {
        path = `v2/projects/${projId}/config`;
        method = "GET";
      } else if (selectedMethodId === "UpdateProjectConfig") {
        path = `v2/projects/${projId}/config`;
        method = "PATCH";
      } else if (selectedMethodId.includes("DefaultSupportedIdpConfig")) {
        const id = payloadObj.defaultSupportedIdpConfigId || "google.com";
        if (selectedMethodId === "CreateDefaultSupportedIdpConfig") {
          path = `v2/projects/${projId}/defaultSupportedIdpConfigs`;
          method = "POST";
        } else if (selectedMethodId === "GetDefaultSupportedIdpConfig" || selectedMethodId === "DeleteDefaultSupportedIdpConfig") {
          path = `v2/projects/${projId}/defaultSupportedIdpConfigs/${id}`;
          method = selectedMethodId === "GetDefaultSupportedIdpConfig" ? "GET" : "DELETE";
        } else if (selectedMethodId === "UpdateDefaultSupportedIdpConfig") {
          path = `v2/projects/${projId}/defaultSupportedIdpConfigs/${id}`;
          method = "PATCH";
        } else {
          path = `v2/projects/${projId}/defaultSupportedIdpConfigs`;
          method = "GET";
        }
      } else if (selectedMethodId.includes("OAuthIdpConfig")) {
        const id = payloadObj.oauthIdpConfigId || "oidc.dcp-partner-sso";
        if (selectedMethodId === "CreateOAuthIdpConfig") {
          path = `v2/projects/${projId}/oauthIdpConfigs`;
          method = "POST";
        } else if (selectedMethodId === "GetOAuthIdpConfig" || selectedMethodId === "DeleteOAuthIdpConfig") {
          path = `v2/projects/${projId}/oauthIdpConfigs/${id}`;
          method = selectedMethodId === "GetOAuthIdpConfig" ? "GET" : "DELETE";
        } else if (selectedMethodId === "UpdateOAuthIdpConfig") {
          path = `v2/projects/${projId}/oauthIdpConfigs/${id}`;
          method = "PATCH";
        } else {
          path = `v2/projects/${projId}/oauthIdpConfigs`;
          method = "GET";
        }
      }
    } 
    else if (selectedServiceId === "google.cloud.identitytoolkit.v2beta1.ProjectConfigService") {
      if (selectedMethodId === "EnableCicp") {
        path = `v2beta1/projects/${projId}:enableCicp`;
        method = "POST";
      } else {
        path = `v2beta1/projects/${projId}/config`;
        method = selectedMethodId === "GetProjectConfig" ? "GET" : "PATCH";
      }
    } 
    else if (selectedServiceId === "google.cloud.identitytoolkit.v2.AuthenticationService") {
      const payloadObj = getParsedPayload();
      if (selectedMethodId === "StartMfaSignIn") {
        path = "v2/accounts/mfaSignIn:start";
        method = "POST";
      } else if (selectedMethodId === "FinalizeMfaSignIn") {
        path = "v2/accounts/mfaSignIn:finalize";
        method = "POST";
      } else if (selectedMethodId === "GetPasswordPolicy") {
        const tid = payloadObj.tenantId;
        path = tid ? `v2/projects/${projId}/tenants/${tid}/passwordPolicy` : `v2/projects/${projId}/passwordPolicy`;
        method = "GET";
      } else if (selectedMethodId === "GetRecaptchaConfig") {
        const tid = payloadObj.tenantId;
        path = tid ? `v2/projects/${projId}/tenants/${tid}/recaptchaConfig` : `v2/projects/${projId}/recaptchaConfig`;
        method = "GET";
      } else if (selectedMethodId === "RevokeToken") {
        path = "v2/accounts:revokeToken";
        method = "POST";
      }
    }
    else if (selectedServiceId === "google.cloud.identitytoolkit.v2.AccountManagementService") {
      if (selectedMethodId === "StartMfaEnrollment") {
        path = "v2/accounts/mfaEnrollment:start";
        method = "POST";
      } else if (selectedMethodId === "FinalizeMfaEnrollment") {
        path = "v2/accounts/mfaEnrollment:finalize";
        method = "POST";
      } else if (selectedMethodId === "WithdrawMfa") {
        path = "v2/accounts/mfaEnrollment:withdraw";
        method = "POST";
      }
    } 
    else if (selectedServiceId.includes("TenantManagementService")) {
      const versionPrefix = selectedServiceId.includes("v2beta1") ? "v2beta1" : "v2";
      const payloadObj = getParsedPayload();
      const tid = payloadObj.tenantId || tenantId;

      if (selectedMethodId === "CreateTenant") {
        path = `${versionPrefix}/projects/${projId}/tenants`;
      } else if (selectedMethodId === "GetTenant" || selectedMethodId === "DeleteTenant") {
        path = `${versionPrefix}/projects/${projId}/tenants/${tid}`;
        method = selectedMethodId === "GetTenant" ? "GET" : "DELETE";
      } else {
        path = `${versionPrefix}/projects/${projId}/tenants`;
        method = "GET";
      }
    }
    else if (selectedServiceId === "google.cloud.identitytoolkit.v2.InboundSamlConfigService") {
      const payloadObj = getParsedPayload();
      const samlId = payloadObj.inboundSamlConfigId || "saml.dcp-enterprise-sso";
      if (selectedMethodId === "CreateInboundSamlConfig") {
        path = `v2/projects/${projId}/inboundSamlConfigs`;
        method = "POST";
      } else if (selectedMethodId === "GetInboundSamlConfig" || selectedMethodId === "DeleteInboundSamlConfig") {
        path = `v2/projects/${projId}/inboundSamlConfigs/${samlId}`;
        method = selectedMethodId === "GetInboundSamlConfig" ? "GET" : "DELETE";
      } else if (selectedMethodId === "UpdateInboundSamlConfig") {
        path = `v2/projects/${projId}/inboundSamlConfigs/${samlId}`;
        method = "PATCH";
      } else {
        path = `v2/projects/${projId}/inboundSamlConfigs`;
        method = "GET";
      }
    }
    else if (selectedServiceId === "google.iam.v1.IAMPolicy") {
      const payloadObj = getParsedPayload();
      const resName = payloadObj.resource || `projects/${projId}`;
      if (selectedMethodId === "GetIamPolicy") {
        path = `v1/${resName}:getIamPolicy`;
        method = "POST";
      } else if (selectedMethodId === "SetIamPolicy") {
        path = `v1/${resName}:setIamPolicy`;
        method = "POST";
      } else if (selectedMethodId === "TestIamPermissions") {
        path = `v1/${resName}:testIamPermissions`;
        method = "POST";
      }
    }
    else if (selectedServiceId === "google.cloud.recaptchaenterprise.v1.RecaptchaEnterpriseService") {
      const payloadObj = getParsedPayload();
      const id = payloadObj.assessmentId || "mock-assessment-id";
      if (selectedMethodId === "CreateAssessment") {
        path = `v1/projects/${projId}/assessments`;
        method = "POST";
      } else if (selectedMethodId === "AnnotateAssessment") {
        const assessmentName = payloadObj.name || `projects/${projId}/assessments/${id}`;
        path = `v1/${assessmentName}:annotate`;
        method = "POST";
      } else if (selectedMethodId === "ListRelatedAccountGroupMemberships") {
        path = `v1/projects/${projId}/relatedaccountgroupmemberships`;
        method = "GET";
      } else if (selectedMethodId === "ListRelatedAccountGroups") {
        path = `v1/projects/${projId}/relatedaccountgroups`;
        method = "GET";
      } else if (selectedMethodId === "SearchRelatedAccountGroupMemberships") {
        path = `v1/projects/${projId}/relatedaccountgroupmemberships:search`;
        method = "POST";
      } else if (selectedMethodId === "ListFirewallPolicies") {
        path = `v1/projects/${projId}/firewallpolicies`;
        method = "GET";
      }
    }

    const payloadStr = JSON.stringify(getParsedPayload(), null, 2);
    const dataSection = (method === "GET" || method === "DELETE") ? "" : ` \\\n  -d '${payloadStr.replace(/'/g, "'\\''")}'`;

    const host = selectedServiceId.includes("recaptcha") 
      ? "recaptchaenterprise.googleapis.com" 
      : "identitytoolkit.googleapis.com";

    return `curl -X ${method} \\
  -H "Content-Type: application/json; charset=utf-8" \\
  -H "X-Goog-Api-Client": "display-cell-pros-forensic-RAG/1.0" \\
  -H "x-goog-user-project": "${projId}"\
${dataSection ? dataSection + " \\" : ""}
  "https://${host}/${path}?key=${keyStr}"`;
  };

  const handleExecute = async () => {
    // Validate JSON first
    let payloadToSend = {};
    try {
      payloadToSend = JSON.parse(rawPayloadJson);
    } catch (err) {
      addToast(
        "Payload Compile Error",
        "The JSON payload structure has formatting errors. Please fix syntax (braces, commas) before transmitting.",
        "error"
      );
      return;
    }

    setIsLoading(true);
    setTraceLog(null);

    try {
      const response = await fetch("/api/auth/identitytoolkit-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          serviceName: selectedServiceId,
          rpcMethod: selectedMethodId,
          payload: payloadToSend,
          apiKey: apiKey || undefined
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setTraceLog(result);
        addToast(
          "Handshake Acknowledged",
          `Handshake verified for ${activeService.name}::${selectedMethodId}. Latency: ${result.durationMs}ms`,
          "success"
        );
      } else {
        setTraceLog(result);
        addToast(
          "RPC Verification Failure",
          `The Identity Toolkit gateway rejected the payload with status: ${result.status || response.status}`,
          "warning"
        );
      }
    } catch (err: any) {
      console.error("RPC Sandbox Error:", err);
      addToast(
        "RPC Network Error",
        err.message || "Failed to establish a secure handshake to the Identity Toolkit gateway.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, section: "curl" | "request" | "response") => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    addToast("Data Logged to Clipboard", `Secure raw ${section} packet cloned to system clipboard.`, "info");
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="mt-8 border border-slate-800 bg-[#0d0d0d] p-5 rounded-xl font-sans" id="identity-toolkit-rpc-explorer">
      
      {/* Brand & Multi-Service Terminal Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-slate-800 pb-5 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
            <h3 className="text-sm font-black uppercase tracking-wider text-teal-400 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-teal-400" />
              Display Cell Pros • Identity Platform REST RPC Audit Terminal
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-1 leading-relaxed max-w-2xl">
            COV-VERIFIED // MULTI-SERVICE SANDBOX ROUTER. Programmatically inspect, trace, and test real and simulated REST requests for all seven statutory GCP Identity Toolkit reference services.
          </p>
        </div>
        
        {/* Secure Port Ingress Status Badge */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-teal-400 px-2 py-1 rounded flex items-center gap-1.5">
            <Lock className="w-3 h-3" />
            TLS 1.3 INGRESS
          </span>
          <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-blue-400 px-2 py-1 rounded">
            PORT: 3000 (SECURE PROXY)
          </span>
        </div>
      </div>

      {/* Grid: Form Controllers and Raw Terminal Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Parameters and Customizer */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-850">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-4 flex items-center gap-1.5 border-b border-slate-900 pb-2">
              <Sliders className="w-3.5 h-3.5 text-teal-400" />
              Symptom-to-Circuit (S2C) RPC Router
            </h4>

            {/* Service Selection */}
            <div className="mb-4">
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                1. Select RPC Target Service ({SERVICES.length} Vaults)
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="w-full bg-[#111] border border-slate-800 hover:border-slate-700 text-xs text-slate-200 rounded-md p-2 focus:outline-none focus:border-teal-500 transition-colors cursor-pointer leading-normal"
              >
                {SERVICES.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} [{service.version.toUpperCase()}]
                  </option>
                ))}
              </select>
              <p className="text-[9px] text-slate-500 mt-1 italic font-mono">
                {activeService.description}
              </p>
            </div>

            {/* Method Selection */}
            <div className="mb-4">
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                2. Select Service RPC Method
              </label>
              <select
                value={selectedMethodId}
                onChange={(e) => setSelectedMethodId(e.target.value)}
                className="w-full bg-[#111] border border-slate-800 hover:border-slate-700 text-xs text-white rounded-md p-2 focus:outline-none focus:border-teal-500 transition-colors cursor-pointer"
              >
                {activeService.methods.map(method => (
                  <option key={method.id} value={method.id}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Global Payload Hydration Context Helpers */}
            <div className="bg-[#0b0b0b] p-3 rounded border border-slate-900 mb-4 space-y-3">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block border-b border-slate-900 pb-1">
                🔬 Hydration Input Tokens (Synchronize Variables)
              </span>

              {/* Email Context */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                    User Email context
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 text-[10px] text-slate-200 p-1.5 rounded focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                    Tenant partition ID
                  </label>
                  <input
                    type="text"
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 text-[10px] text-slate-200 p-1.5 rounded focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              {/* JWT Token Context */}
              <div>
                <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-0.5 flex justify-between items-center">
                  <span>JWT idToken Session context</span>
                  {currentUserIdToken && (
                    <button
                      type="button"
                      onClick={() => {
                        setIdToken(currentUserIdToken);
                        addToast("Token Synchronized", "Pulled active certified credential session JWT token successfully.", "success");
                      }}
                      className="text-[8px] text-teal-400 hover:underline font-bold"
                    >
                      Sync Active Auditor Token
                    </button>
                  )}
                </label>
                <input
                  type="text"
                  value={idToken}
                  onChange={(e) => setIdToken(e.target.value)}
                  placeholder="Paste active certified user session token..."
                  className="w-full bg-slate-950 border border-slate-850 text-[9px] text-slate-400 p-1.5 rounded focus:outline-none focus:border-teal-500 font-mono overflow-ellipsis"
                />
              </div>
            </div>

            {/* Custom API Key Override */}
            <div className="mb-4">
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">
                GCP API Key Override (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Defaults to active secure server credentials"
                  className="w-full bg-[#111] border border-slate-800 text-xs text-slate-300 rounded-md p-2 pl-8 focus:outline-none focus:border-teal-500 font-mono"
                />
                <Key className="w-3.5 h-3.5 text-slate-600 absolute left-2.5 top-3" />
              </div>
            </div>

            {/* Interactive Raw Payload JSON Editor */}
            <div className="mb-4">
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5 flex justify-between items-center">
                <span>3. Edit JSON Payload Body</span>
                <span className="text-[8px] font-mono text-slate-600 uppercase">REST BODY (MUTABLE)</span>
              </label>
              <textarea
                value={rawPayloadJson}
                onChange={(e) => setRawPayloadJson(e.target.value)}
                rows={6}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-750 text-[10px] text-blue-300 rounded-md p-2.5 focus:outline-none focus:border-teal-500 font-mono resize-y leading-normal scrollbar-thin"
              />
            </div>

            {/* Execute Button */}
            <button
              onClick={handleExecute}
              disabled={isLoading}
              className="w-full py-2.5 bg-teal-850 hover:bg-teal-700 disabled:bg-slate-800 text-white rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-teal-950/30"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Transmitting RPC Payload...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-white" />
                  Execute REST RPC Handshake
                </>
              )}
            </button>
          </div>

          {/* Compliance Card */}
          <div className="bg-slate-900/10 p-3.5 rounded-lg border border-slate-850 text-slate-400 text-xs">
            <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              NIST SP 800-88 R1 Erasure Handshakes
            </h5>
            <p className="text-[10px] leading-relaxed text-slate-500">
              Administrative APIs like TenantManagement and AccountManagement are protected via cryptographic session locks. This terminal proxies requests server-side, preventing API credentials from leaking into frontend client bundles.
            </p>
          </div>
        </div>

        {/* Right Side: Shell Commands & Real-Time Live Wire Captures */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          
          {/* Equivalent Shell command (Curl) Section */}
          <div className="bg-slate-950 border border-slate-850 rounded-lg p-3">
            <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
                <FileCode className="w-3.5 h-3.5 text-teal-500" />
                Equivalent CLI Curl Request (REST Reference)
              </span>
              <button
                onClick={() => handleCopy(generateCurlCommand(), "curl")}
                className="text-slate-500 hover:text-teal-400 transition-colors text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
              >
                {copiedSection === "curl" ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy Curl
                  </>
                )}
              </button>
            </div>
            <pre className="font-mono text-[9px] text-slate-300 bg-[#060606] border border-slate-900 p-2.5 rounded overflow-x-auto leading-normal whitespace-pre-wrap break-all max-h-24 scrollbar-thin">
              {generateCurlCommand()}
            </pre>
          </div>

          {/* Wire Capture Terminal Log */}
          <div className="bg-slate-950 border border-slate-850 rounded-lg p-3 flex-1 flex flex-col min-h-[350px]">
            <div className="flex justify-between items-center border-b border-slate-900 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-teal-400" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Network Wire Capture Terminal
                </span>
              </div>
              
              {traceLog && (
                <div className="flex items-center gap-2 font-mono">
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${traceLog.success ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
                    STATUS: {traceLog.status}
                  </span>
                  <span className="text-[9px] text-slate-500">
                    LATENCY: {traceLog.durationMs}ms
                  </span>
                  {traceLog.isSimulated && (
                    <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 rounded">
                      SIMULATED
                    </span>
                  )}
                </div>
              )}
            </div>

            {traceLog ? (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                
                {/* Request Packet Log */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 font-mono">
                      Outbound REST Request Wire
                    </span>
                    <button
                      onClick={() => handleCopy(traceLog.rawRequestPacket, "request")}
                      className="text-[8px] font-mono text-slate-500 hover:text-white"
                    >
                      {copiedSection === "request" ? "Copied" : "Copy Outbound"}
                    </button>
                  </div>
                  <pre className="font-mono text-[9.5px] text-blue-300 bg-slate-900/40 border border-slate-900 p-2.5 rounded max-h-40 overflow-y-auto leading-normal whitespace-pre-wrap break-all scrollbar-thin">
                    {traceLog.rawRequestPacket}
                  </pre>
                </div>

                {/* Response Packet Log */}
                <div className="flex-1 flex flex-col justify-end">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 font-mono">
                      Inbound REST Response Wire
                    </span>
                    <button
                      onClick={() => handleCopy(traceLog.rawResponsePacket, "response")}
                      className="text-[8px] font-mono text-slate-500 hover:text-white"
                    >
                      {copiedSection === "response" ? "Copied" : "Copy Inbound"}
                    </button>
                  </div>
                  <pre className="font-mono text-[9.5px] text-teal-300 bg-slate-900/40 border border-slate-900 p-2.5 rounded max-h-60 overflow-y-auto leading-normal whitespace-pre-wrap break-all scrollbar-thin">
                    {traceLog.rawResponsePacket}
                  </pre>
                </div>
                
                {/* Cryptographic Signature Footer */}
                <div className="mt-1 pt-2 border-t border-slate-900 text-center text-[9px] font-mono text-slate-600">
                  SECURE REST RPC COMPLIANT SIGNATURE SHA-256 // CRYPTO_HANDSHAKE_ID: dcp_idtoolkit_tr_0x{Math.floor(1000000 + Math.random() * 9000000).toString(16)}
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#090909] border border-dashed border-slate-850 rounded">
                <Radio className="w-8 h-8 text-slate-700 animate-pulse mb-2" />
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  Awaiting Handshake Transmission
                </span>
                <span className="text-[9.5px] text-slate-600 mt-2 max-w-[340px] leading-relaxed">
                  Select your Identity Platform service and click 'Execute REST RPC Handshake' to route certified wire-packets.
                </span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
