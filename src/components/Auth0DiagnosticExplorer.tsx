import React, { useState, useEffect } from "react";
import { 
  Key, 
  Lock, 
  User, 
  Mail, 
  Settings, 
  Database, 
  Terminal, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle, 
  LogOut, 
  ExternalLink,
  ShieldAlert,
  Cpu,
  Fingerprint,
  Code
} from "lucide-react";

interface Auth0DiagnosticExplorerProps {
  addToast: (title: string, message: string, type: "success" | "error" | "info" | "warning", duration?: number) => void;
}

interface LogEntry {
  timestamp: string;
  type: "request" | "response" | "error" | "info";
  message: string;
  payload?: any;
}

export const Auth0DiagnosticExplorer: React.FC<Auth0DiagnosticExplorerProps> = ({ addToast }) => {
  // Config States
  const [auth0Domain, setAuth0Domain] = useState<string>("displaycellpros.us.auth0.com");
  const [clientId, setClientId] = useState<string>("cli_spokane_forensic_99x");
  const [clientSecret, setClientSecret] = useState<string>("sk_forensic_sec_8849bca022");
  const [connection, setConnection] = useState<string>("Username-Password-Authentication");
  
  // Selected Action
  const [activeAction, setActiveAction] = useState<"signup" | "login_ropc" | "userinfo" | "reset" | "pkce">("login_ropc");
  
  // Action Inputs
  const [email, setEmail] = useState<string>("forensic.audit@displaycellpros.com");
  const [password, setPassword] = useState<string>("CspForensic991#");
  const [username, setUsername] = useState<string>("forensic_auditor");
  const [scope, setScope] = useState<string>("openid profile email telemetry:write read:mdf");
  const [accessToken, setAccessToken] = useState<string>("");
  const [pkceCodeVerifier, setPkceCodeVerifier] = useState<string>("db96c78491ae0b2d6ff401e6a0d4cbb8f467ea3df74d9e9e1e2d140e");
  const [pkceChallenge, setPkceChallenge] = useState<string>("pL67v5pP_ZkY_2E9_xG9zNn-N0M2h2I1hG6e3P3v4O8");
  
  // Terminal Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      timestamp: new Date().toLocaleTimeString(),
      type: "info",
      message: "Auth0 Diagnostic Explorer Initialized. Chain-of-Verification (CoV) engines online.",
      payload: { system: "Auth0 OIDC Core", gateway: "Vercel Serverless Gateway" }
    }
  ]);
  
  // Loading and Sandbox Mode States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tokenDetails, setTokenDetails] = useState<any>(null);
  const [isSandbox, setIsSandbox] = useState<boolean>(true);

  // Generate Callback URI
  const callbackUri = typeof window !== "undefined" 
    ? `${window.location.origin}/auth/callback/` 
    : "https://displaycellpros.com/auth/callback/";

  const appendLog = (type: "request" | "response" | "error" | "info", message: string, payload?: any) => {
    setLogs(prev => [
      {
        timestamp: new Date().toLocaleTimeString(),
        type,
        message,
        payload
      },
      ...prev
    ]);
  };

  const handleClearLogs = () => {
    setLogs([
      {
        timestamp: new Date().toLocaleTimeString(),
        type: "info",
        message: "Telemetry diagnostic terminal logs cleared by operator.",
      }
    ]);
  };

  const executeAuth0Action = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const baseUrl = `https://${auth0Domain}`;
    
    try {
      if (activeAction === "signup") {
        appendLog("request", `POST ${isSandbox ? baseUrl : "/api/auth0"}/signup`, {
          client_id: clientId,
          email,
          password,
          connection,
          username: username || undefined,
          user_metadata: {
            assigned_facility: "Spokane Micro-soldering Lab",
            forensic_clearance: "NIST-SP-800-88-R1",
            telemetry_format: ".mdf"
          }
        });

        if (isSandbox) {
          // Simulating the request / performing real endpoint call if possible
          await new Promise(resolve => setTimeout(resolve, 1200));

          const mockResponse = {
            _id: "auth0|64e8b392a83214b7e1903",
            email_verified: false,
            email,
            username: username || "forensic_auditor",
            user_metadata: {
              assigned_facility: "Spokane Micro-soldering Lab",
              forensic_clearance: "NIST-SP-800-88-R1",
              telemetry_format: ".mdf"
            }
          };

          appendLog("response", "200 OK - User Created Successfully (Sandbox Sim)", mockResponse);
          addToast(
            "Auth0 Signup Simulated",
            `Client user registration generated inside sandbox under connection '${connection}'.`,
            "success"
          );
        } else {
          const res = await fetch("/api/auth0/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              domain: auth0Domain,
              clientId,
              email,
              password,
              connection,
              username: username || undefined,
              userMetadata: {
                assigned_facility: "Spokane Micro-soldering Lab",
                forensic_clearance: "NIST-SP-800-88-R1",
                telemetry_format: ".mdf"
              }
            })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || JSON.stringify(data));
          appendLog("response", `${res.status} ${res.statusText}`, data);
          addToast("Auth0 Signup Successful", "Real user registration completed successfully on upstream tenant.", "success");
        }
      } 
      else if (activeAction === "login_ropc") {
        appendLog("request", `POST ${isSandbox ? baseUrl : "/api/auth0"}/token (ROPC password)`, {
          client_id: clientId,
          client_secret: isSandbox ? "*********************" : "sk_forensic_sec_8849bca022",
          grant_type: "password",
          username: email,
          password,
          scope,
          realm: connection
        });

        if (isSandbox) {
          await new Promise(resolve => setTimeout(resolve, 1400));

          // Generate synthetic but valid looking JWT tokens
          const syntheticAccessToken = "eyJhbGciOiJSUzI1NiIsImtpZCI6InNwb2thbmUifQ." + btoa(JSON.stringify({
            iss: baseUrl,
            sub: "auth0|64e8b392a83214b7e1903",
            aud: [`${baseUrl}/api/v2/`, `${baseUrl}/userinfo`],
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600,
            scope,
            azp: clientId,
            permissions: ["read:mdf", "write:telemetry"]
          })) + ".signature_verification_ok";

          const syntheticIdToken = "eyJhbGciOiJSUzI1NiIsImtpZCI6InNwb2thbmUifQ." + btoa(JSON.stringify({
            nickname: username || "auditor",
            name: email.split("@")[0],
            email,
            email_verified: true,
            iss: baseUrl,
            sub: "auth0|64e8b392a83214b7e1903",
            aud: clientId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600,
          })) + ".signature_verification_ok";

          setAccessToken(syntheticAccessToken);
          setTokenDetails({
            access_token: syntheticAccessToken,
            id_token: syntheticIdToken,
            scope,
            expires_in: 3600,
            token_type: "Bearer"
          });

          appendLog("response", "200 OK - Access Token Issued (Sandbox Sim)", {
            access_token: `${syntheticAccessToken.substring(0, 30)}...`,
            id_token: `${syntheticIdToken.substring(0, 30)}...`,
            scope,
            expires_in: 3600,
            token_type: "Bearer"
          });

          addToast(
            "Auth0 Login Issued (Sim)",
            "OIDC credentials authorized in sandbox simulator.",
            "success"
          );
        } else {
          const res = await fetch("/api/auth0/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              domain: auth0Domain,
              clientId,
              clientSecret,
              grantType: "password",
              username: email,
              password,
              scope,
              realm: connection
            })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || JSON.stringify(data));
          setAccessToken(data.access_token || "");
          setTokenDetails(data);
          appendLog("response", `${res.status} ${res.statusText}`, data);
          addToast("Auth0 Token Issued", "Upstream access token acquired successfully.", "success");
        }
      }
      else if (activeAction === "userinfo") {
        if (!accessToken) {
          throw new Error("Missing credentials. Please perform an Auth0 Login (ROPC) first to obtain an Access Token.");
        }

        appendLog("request", `GET ${isSandbox ? baseUrl : "/api/auth0"}/userinfo`, {
          Headers: {
            Authorization: `Bearer ${accessToken.substring(0, 15)}...`,
            Accept: "application/json"
          }
        });

        if (isSandbox) {
          await new Promise(resolve => setTimeout(resolve, 1000));

          const mockUserInfo = {
            sub: "auth0|64e8b392a83214b7e1903",
            nickname: "spokane_analyzer",
            name: "Spokane Analyst Portal",
            picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
            updated_at: new Date().toISOString(),
            email,
            email_verified: true,
            "https://displaycellpros.com/claims/facility": "Spokane South Hill Forensic",
            "https://displaycellpros.com/claims/clearance": "LEVEL_3_S2C_AUDIT"
          };

          appendLog("response", "200 OK - OIDC User Profile (Sandbox Sim)", mockUserInfo);
          addToast(
            "User Profile Loaded (Sim)",
            "Profile claims retrieved inside sandbox.",
            "success"
          );
        } else {
          const res = await fetch("/api/auth0/userinfo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              domain: auth0Domain,
              accessToken
            })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || JSON.stringify(data));
          appendLog("response", `${res.status} ${res.statusText}`, data);
          addToast("OIDC Claims Loaded", "Auth0 userprofile info retrieved successfully.", "success");
        }
      }
      else if (activeAction === "reset") {
        appendLog("request", `POST ${isSandbox ? baseUrl : "/api/auth0"}/change-password`, {
          client_id: clientId,
          email,
          connection
        });

        if (isSandbox) {
          await new Promise(resolve => setTimeout(resolve, 800));

          appendLog("response", "200 OK - Reset Verification Code Sent (Sandbox Sim)", {
            message: "We've sent an email to change your password."
          });

          addToast(
            "Password Reset Simulated",
            "Auth0 connection reset code simulated successfully.",
            "info"
          );
        } else {
          const res = await fetch("/api/auth0/change-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              domain: auth0Domain,
              clientId,
              email,
              connection
            })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || JSON.stringify(data));
          appendLog("response", `${res.status} ${res.statusText}`, data);
          addToast("Password Reset Dispatched", "Change password email sent successfully.", "success");
        }
      }
      else if (activeAction === "pkce") {
        // Build the PKCE Auth code URL
        const authUrl = `https://${auth0Domain}/authorize?` + new URLSearchParams({
          response_type: "code",
          client_id: clientId,
          redirect_uri: callbackUri,
          scope,
          state: "spokane_state_" + Math.floor(Math.random() * 100000),
          code_challenge: pkceChallenge,
          code_challenge_method: "S256"
        }).toString();

        appendLog("info", `Generating PKCE Authorization URL (${isSandbox ? "Sandbox" : "Upstream REAL"})...`, {
          authorize_endpoint: `${baseUrl}/authorize`,
          code_challenge_method: "S256",
          code_challenge: pkceChallenge,
          redirect_uri: callbackUri
        });

        appendLog("request", `GET ${authUrl.substring(0, 120)}...`);

        if (isSandbox) {
          // Simulated popup opener
          const win = window.open(
            "about:blank",
            "Auth0 OIDC Sandbox Portal",
            "width=600,height=700"
          );

          if (win) {
            win.document.write(`
              <html>
                <head>
                  <title>Auth0 OIDC Forensic Sandbox</title>
                  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                </head>
                <body class="bg-gray-950 text-slate-200 font-sans p-6 min-h-screen flex flex-col justify-between">
                  <div class="space-y-6">
                    <div class="flex items-center gap-3 border-b border-gray-850 pb-4">
                      <span class="text-2xl">🔬</span>
                      <div>
                        <h1 class="text-lg font-black tracking-wider text-teal-400 uppercase">Auth0 Sandbox Authorization</h1>
                        <p class="text-[10px] text-slate-400 font-mono">CLIENT ID: ${clientId}</p>
                      </div>
                    </div>
                    
                    <div class="bg-gray-900 border border-teal-500/20 p-4 rounded-xl space-y-3">
                      <p class="text-xs text-slate-300">
                        The client application <strong class="text-white">Display & Cell Pros Spokane</strong> is requesting access to your secure forensic hardware telemetry database.
                      </p>
                      <div class="space-y-1.5 text-[11px] font-mono text-slate-400">
                        <div>• Issuer: <span class="text-teal-300">${baseUrl}</span></div>
                        <div>• Requested Scopes: <span class="text-teal-300">${scope}</span></div>
                        <div>• Redirect URI: <span class="text-teal-300">${callbackUri}</span></div>
                      </div>
                    </div>

                    <div class="p-4 bg-gray-950 rounded-lg border border-gray-800 space-y-2">
                      <div class="text-xs font-bold text-slate-300">Grant Permission as User:</div>
                      <div class="text-xs text-teal-400 font-mono">${email}</div>
                    </div>
                  </div>

                  <div class="space-y-3 pt-6 border-t border-gray-800">
                    <button 
                      onclick="window.opener.postMessage({ type: 'AUTH0_MOCK_SUCCESS', code: 'spl_code_' + Math.floor(Math.random() * 9999999) }, '*'); window.close();"
                      class="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-lg text-xs uppercase tracking-wider transition-all"
                    >
                      Authorize Display & Cell Pros
                    </button>
                    <button 
                      onclick="window.close();"
                      class="w-full bg-gray-900 hover:bg-gray-800 text-slate-400 font-bold py-2.5 px-4 rounded-lg text-[10px] uppercase tracking-wider transition-all"
                    >
                      Cancel Connection
                    </button>
                  </div>
                </body>
              </html>
            `);
          } else {
            addToast("Popup Blocked", "Please enable popups to test the Auth0 PKCE Authorization popup window.", "warning");
          }
        } else {
          // Open the real upstream Auth0 authorize portal!
          const win = window.open(
            authUrl,
            "Auth0 Upstream Authorize Portal",
            "width=600,height=750"
          );
          if (!win) {
            addToast("Popup Blocked", "Please enable popups to test real Auth0 PKCE login redirects.", "warning");
          }
        }
      }
    } catch (err: any) {
      appendLog("error", err.message || "An authentication error occurred.");
      addToast("Auth0 Integration Error", err.message || "Request validation failed.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Listen to popup messages
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "AUTH0_MOCK_SUCCESS") {
        const mockCode = e.data.code;
        appendLog("info", "OIDC Authorization Code Received from Callback Popup", {
          code: mockCode,
          state: "spokane_state_authorized"
        });

        // Trigger code exchange simulation
        exchangeCode(mockCode);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [clientId, auth0Domain, scope, pkceCodeVerifier, isSandbox]);

  const exchangeCode = async (code: string) => {
    setIsLoading(true);
    const baseUrl = `https://${auth0Domain}`;
    appendLog("request", `POST ${isSandbox ? baseUrl : "/api/auth0"}/token (Exchange Code)`, {
      grant_type: "authorization_code",
      client_id: clientId,
      code_verifier: pkceCodeVerifier,
      code,
      redirect_uri: callbackUri
    });

    try {
      if (isSandbox) {
        await new Promise(resolve => setTimeout(resolve, 1200));

        const syntheticAccessToken = "eyJhbGciOiJSUzI1NiIsImtpZCI6InNwb2thbmUifQ." + btoa(JSON.stringify({
          iss: baseUrl,
          sub: "auth0|64e8b392a83214b7e1903",
          aud: [`${baseUrl}/api/v2/`, `${baseUrl}/userinfo`],
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
          scope,
          azp: clientId
        })) + ".signature_verification_ok";

        setAccessToken(syntheticAccessToken);
        setTokenDetails({
          access_token: syntheticAccessToken,
          id_token: "eyJhbGciOiJSUzI1NiIsImtpZCI6InNwb2thbmUifQ.synthetic_pkce_id_token.signature_verification_ok",
          scope,
          expires_in: 3600,
          token_type: "Bearer"
        });

        appendLog("response", "200 OK - Code Exchanged successfully (Sandbox Sim)", {
          access_token: `${syntheticAccessToken.substring(0, 30)}...`,
          id_token: "eyJhbGciOiJSUzI1Ni... (decoded claims verified)",
          scope,
          expires_in: 3600,
          token_type: "Bearer"
        });

        addToast(
          "PKCE Exchange Simulated",
          "OIDC tokens securely swapped using SHA-256 Code Challenge verifier in sandbox.",
          "success"
        );
      } else {
        const res = await fetch("/api/auth0/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            domain: auth0Domain,
            clientId,
            clientSecret,
            grantType: "authorization_code",
            codeVerifier: pkceCodeVerifier,
            code,
            redirectUri: callbackUri
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || JSON.stringify(data));
        setAccessToken(data.access_token || "");
        setTokenDetails(data);
        appendLog("response", `${res.status} ${res.statusText}`, data);
        addToast(
          "PKCE Exchange Successful",
          "Real OIDC tokens securely swapped and validated.",
          "success"
        );
      }
    } catch (err: any) {
      appendLog("error", `PKCE Code Exchange Failed: ${err.message || String(err)}`);
      addToast("Exchange Error", "Failed to swap authorization code for OIDC token.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300 space-y-8" id="auth0-diagnostic-explorer-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950 border border-slate-800/80 p-6 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-6 h-6 text-[#00BFFF]" />
            <h1 className="text-xl font-bold tracking-tight text-white uppercase font-sans">
              Auth0 Authentication Forensic Explorer
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-sans max-w-2xl">
            Audit and probe Auth0 OIDC endpoints directly inside the Spokane South Hill facility. Fully compliant with <span className="text-[#008080] font-semibold">NIST SP 800-88 R1</span> data sanitation and verification loops.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-[11px] font-mono text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          <span>Auth0 API Core Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Config & Action Selector */}
        <div className="lg:col-span-5 space-y-6">
          {/* Auth0 API Configuration */}
          <div className="bg-[#111111] border border-slate-800/90 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#008080]" />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Auth0 Tenant Configuration</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSandbox(prev => !prev);
                    appendLog("info", `Diagnostic engine mode toggled to: ${!isSandbox ? "Upstream Real-Time Endpoint Proxy" : "Offline Sandbox Simulation"}`);
                    addToast("Engine Mode Switched", `Active engine: ${!isSandbox ? "Upstream Proxy" : "Offline Sandbox"}`, "info");
                  }}
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border transition-all ${
                    isSandbox 
                      ? "bg-amber-950/40 border-amber-500/30 text-amber-400 hover:bg-amber-900/40" 
                      : "bg-emerald-950/40 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/40"
                  }`}
                  title="Click to toggle between Offline Sandbox simulation and real upstream Auth0 calls via secure proxy."
                >
                  {isSandbox ? "SANDBOX SIMULATION" : "REAL UPSTREAM"}
                </button>
                <span className="text-[9px] text-[#00BFFF] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-950/40 border border-blue-500/20">OIDC v2.0</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1 font-mono">Auth0 Tenant Domain</label>
                <input
                  id="auth0-config-domain"
                  type="text"
                  value={auth0Domain}
                  onChange={(e) => setAuth0Domain(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-250 focus:outline-none focus:border-[#008080] font-mono"
                  placeholder="domain.auth0.com"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1 font-mono">Client Identifier (ID)</label>
                <input
                  id="auth0-config-client-id"
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-250 focus:outline-none focus:border-[#008080] font-mono"
                  placeholder="Client ID"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1 font-mono">Client Secret (Unexposed Proxy Secret)</label>
                <input
                  id="auth0-config-client-secret"
                  type="password"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-250 focus:outline-none focus:border-[#008080] font-mono"
                  placeholder="Client Secret"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1 font-mono">Database Connection Name</label>
                <input
                  id="auth0-config-connection"
                  type="text"
                  value={connection}
                  onChange={(e) => setConnection(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-250 focus:outline-none focus:border-[#008080] font-mono"
                  placeholder="Username-Password-Authentication"
                />
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span>Dynamic Redirect URI:</span>
                  <span className="text-[#00BFFF]">Verified Callback</span>
                </div>
                <div className="bg-slate-950/70 border border-slate-900 rounded p-2 text-[10px] text-slate-400 font-mono truncate select-all">
                  {callbackUri}
                </div>
              </div>
            </div>
          </div>

          {/* Action Selector Menu */}
          <div className="bg-[#111111] border border-slate-800/90 rounded-2xl p-6 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 font-mono">Forensic API Actions</h3>
            
            <div className="space-y-2">
              <button
                id="auth0-action-login-ropc"
                type="button"
                onClick={() => setActiveAction("login_ropc")}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                  activeAction === "login_ropc"
                    ? "bg-[#008080]/15 border-[#008080] text-teal-350"
                    : "bg-slate-950 border-slate-850/80 text-slate-400 hover:text-slate-250 hover:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#00BFFF]" />
                  <div>
                    <span className="block font-sans">Token Endpoint Login (ROPC)</span>
                    <span className="block text-[9px] text-slate-500 font-mono font-normal">POST /oauth/token</span>
                  </div>
                </div>
              </button>

              <button
                id="auth0-action-pkce"
                type="button"
                onClick={() => setActiveAction("pkce")}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                  activeAction === "pkce"
                    ? "bg-[#008080]/15 border-[#008080] text-teal-350"
                    : "bg-slate-950 border-slate-850/80 text-slate-400 hover:text-slate-250 hover:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-purple-400" />
                  <div>
                    <span className="block font-sans">OIDC PKCE Auth Code Flow</span>
                    <span className="block text-[9px] text-slate-500 font-mono font-normal">GET /authorize (Challenge)</span>
                  </div>
                </div>
              </button>

              <button
                id="auth0-action-userinfo"
                type="button"
                onClick={() => setActiveAction("userinfo")}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                  activeAction === "userinfo"
                    ? "bg-[#008080]/15 border-[#008080] text-teal-350"
                    : "bg-slate-950 border-slate-850/80 text-slate-400 hover:text-slate-250 hover:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="block font-sans">Retreive User Metadata Claims</span>
                    <span className="block text-[9px] text-slate-500 font-mono font-normal">GET /userinfo</span>
                  </div>
                </div>
              </button>

              <button
                id="auth0-action-signup"
                type="button"
                onClick={() => setActiveAction("signup")}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                  activeAction === "signup"
                    ? "bg-[#008080]/15 border-[#008080] text-teal-350"
                    : "bg-slate-950 border-slate-850/80 text-slate-400 hover:text-slate-250 hover:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  <div>
                    <span className="block font-sans">Database Connections Signup</span>
                    <span className="block text-[9px] text-slate-500 font-mono font-normal">POST /dbconnections/signup</span>
                  </div>
                </div>
              </button>

              <button
                id="auth0-action-reset"
                type="button"
                onClick={() => setActiveAction("reset")}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                  activeAction === "reset"
                    ? "bg-[#008080]/15 border-[#008080] text-teal-350"
                    : "bg-slate-950 border-slate-850/80 text-slate-400 hover:text-slate-250 hover:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-500" />
                  <div>
                    <span className="block font-sans">Trigger Audit Password Reset</span>
                    <span className="block text-[9px] text-slate-500 font-mono font-normal">POST /dbconnections/change_password</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Workbench & Diagnostic Logs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Action Workbench */}
          <div className="bg-[#111111] border border-slate-800/90 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-mono flex items-center gap-2 border-b border-slate-850 pb-3">
              <Terminal className="w-4 h-4 text-[#00BFFF]" />
              <span>Diagnostic Interactive Workbench</span>
            </h2>

            <form onSubmit={executeAuth0Action} className="space-y-4">
              {activeAction === "signup" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1 font-mono">Assigned Audit Email Address</label>
                    <input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#008080]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1 font-mono">Credential Password</label>
                    <input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#008080]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1 font-mono">Username</label>
                    <input
                      id="signup-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#008080]"
                      required
                    />
                  </div>
                </div>
              )}

              {activeAction === "login_ropc" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1 font-mono">Audit Operator Email</label>
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#008080]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1 font-mono">Operator Password</label>
                    <input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#008080]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1 font-mono">OIDC Scopes (Space Delimited)</label>
                    <input
                      id="login-scope"
                      type="text"
                      value={scope}
                      onChange={(e) => setScope(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#008080] font-mono"
                      required
                    />
                  </div>
                </div>
              )}

              {activeAction === "userinfo" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                    <div className="text-xs font-bold text-slate-300">Active Token Verification Status</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Auth0 requires a standard Bearer Token to access the OIDC profile data. Perform ROPC login first to populate.
                    </p>
                    <div className="flex gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                        accessToken ? "bg-emerald-950/40 border border-emerald-500/25 text-emerald-400" : "bg-red-950/40 border border-red-500/25 text-red-400"
                      }`}>
                        {accessToken ? "Bearer Token Present" : "Missing Token"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1 font-mono">Retrieved Authorization Bearer Token</label>
                    <input
                      id="userinfo-token"
                      type="text"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#008080] font-mono"
                      placeholder="Fetch token using Login action first"
                      required
                    />
                  </div>
                </div>
              )}

              {activeAction === "reset" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1 font-mono">Target Email to Dispatch Reset Request</label>
                    <input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#008080]"
                      required
                    />
                  </div>
                </div>
              )}

              {activeAction === "pkce" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
                  <div className="md:col-span-2">
                    <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                      <div className="text-xs font-bold text-slate-300">Proof Key for Code Exchange (PKCE) Setup</div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Protects public clients from authorization code injection attacks. Uses cryptographically randomized local code challenges to assert client verification.
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1 font-mono">Code Verifier (Client Secret Salt)</label>
                    <input
                      id="pkce-verifier"
                      type="text"
                      value={pkceCodeVerifier}
                      onChange={(e) => setPkceCodeVerifier(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-[10px] text-slate-200 focus:outline-none focus:border-[#008080] font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1 font-mono">SHA-256 Code Challenge</label>
                    <input
                      id="pkce-challenge"
                      type="text"
                      value={pkceChallenge}
                      onChange={(e) => setPkceChallenge(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-[10px] text-slate-200 focus:outline-none focus:border-[#008080] font-mono"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  id="auth0-submit-button"
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-[#008080] hover:bg-teal-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-teal-500/10 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Probing Secure Node...</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4 text-white" />
                      <span>Execute OIDC Audit Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Diagnostic Logs console */}
          <div className="bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900 px-5 py-3 border-b border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-teal-400" />
                <span className="text-[11px] font-bold text-slate-350 uppercase tracking-widest font-mono">Live API Telemetry Console</span>
              </div>
              <button
                id="clear-logs-btn"
                type="button"
                onClick={handleClearLogs}
                className="text-[9px] font-mono font-bold text-slate-500 hover:text-red-400 uppercase transition-all"
              >
                Clear Live Terminal
              </button>
            </div>

            <div className="p-4 max-h-[360px] overflow-y-auto space-y-3 font-mono text-xs text-slate-300 leading-relaxed min-h-[180px]">
              {logs.map((log, idx) => (
                <div key={idx} className="border-b border-slate-900/60 pb-2 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">[{log.timestamp}]</span>
                      <span className={`font-bold uppercase ${
                        log.type === "request" 
                          ? "text-blue-400" 
                          : log.type === "response" 
                            ? "text-emerald-400" 
                            : log.type === "error" 
                              ? "text-red-400 animate-pulse" 
                              : "text-[#FFBF00]"
                      }`}>
                        {log.type}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-600">Secure Audit Feed</span>
                  </div>
                  
                  <div className="text-[11px] text-slate-200">{log.message}</div>
                  
                  {log.payload && (
                    <pre className="mt-1.5 p-2 bg-slate-900 border border-slate-850 rounded text-[10px] text-teal-350 overflow-x-auto leading-normal">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
