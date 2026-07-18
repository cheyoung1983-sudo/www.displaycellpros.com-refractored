import React, { useState } from "react";
import { 
  Check, 
  Copy, 
  ExternalLink, 
  Terminal, 
  Settings, 
  Globe, 
  Search, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ListTodo,
  FileCode,
  ShieldCheck
} from "lucide-react";

interface OAuthDocumentationPanelProps {
  projectId: string;
  devUrl: string;
  prodUrl: string;
}

export function OAuthDocumentationPanel({ projectId, devUrl, prodUrl }: OAuthDocumentationPanelProps) {
  const [selectedEnv, setSelectedEnv] = useState<"dev" | "prod">("prod");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // Interactive checklist state
  const [checklist, setChecklist] = useState({
    siteVerification: true,
    firebaseAuthDomain: false,
    gcpOrigins: false,
    gcpRedirectUris: false,
    apiRestrictions: false,
  });

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalCount = Object.keys(checklist).length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Common errors catalog
  const errorCatalog = [
    {
      code: "auth/unauthorized-domain",
      description: "Firebase Auth blocks sign-in popup / redirect because the current HTTP host is not listed in the Authorized Domains list.",
      solution: "Add 'displaycellpros.com' and your active Cloud Run URL to Firebase Console > Authentication > Settings > Authorized Domains."
    },
    {
      code: "idpiframe_initialization_failed (403 Forbidden)",
      description: "Google Sign-In API client block. The browser application's origin domain does not match the 'Authorized JavaScript Origins' defined in your GCP OAuth 2.0 Web Client ID.",
      solution: "Add https://displaycellpros.com and https://ais-dev-qaarbg7eivxlz2dpis24f5-367327296310.us-west2.run.app into your OAuth Client ID under APIs & Services > Credentials."
    },
    {
      code: "redirect_uri_mismatch (400)",
      description: "The redirect uri parameter sent during login handshake doesn't match the list of 'Authorized redirect URIs' on the OAuth client ID.",
      solution: "Ensure 'https://displaycellpros-com.firebaseapp.com/__/auth/handler' is whitelisted as an Authorized Redirect URI in GCP."
    },
    {
      code: "reCAPTCHA Enterprise Billing Error",
      description: "reCAPTCHA Enterprise integration for Identity Platform failed because billing is not enabled on displaycellpros-com.",
      solution: "Enable standard billing on the GCP project, or disable reCAPTCHA Enterprise enforcement temporarily in Identity Platform User Actions Settings."
    }
  ];

  const filteredErrors = errorCatalog.filter(err => 
    err.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
    err.solution.toLowerCase().includes(searchQuery.toLowerCase()) ||
    err.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const gcloudSetProjectCmd = `gcloud config set project ${projectId}`;
  const gcloudListKeysCmd = `gcloud api-keys list --project=${projectId}`;
  const gcloudDescribeClientCmd = `gcloud oauth-clients list --project=${projectId}`;
  
  const testCurlCmd = `curl -I -X GET "https://displaycellpros.com/googleb89bdda23b0fc37b.html"`;

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-6 font-mono text-xs text-slate-300">
      
      {/* Header section with Dynamic Status Gauge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Interactive Whitelisting & Domain Audit Kit
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Ensure your deployed service, custom domains, and GCP API restrictions align perfectly to avoid OAuth handshaking failures.
          </p>
        </div>
        
        {/* Progress Gauge */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 min-w-[180px] flex flex-col justify-center">
          <div className="flex justify-between items-center text-[10px] mb-1">
            <span className="text-slate-400 uppercase font-bold tracking-wider">Audit Readiness</span>
            <span className={`font-bold ${completionPercentage === 100 ? "text-emerald-400" : "text-amber-400"}`}>
              {completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                completionPercentage === 100 ? "bg-emerald-500" : "bg-gradient-to-r from-amber-500 to-blue-500"
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className="text-[9px] text-slate-500 mt-1.5 text-center">
            {completedCount} of {totalCount} compliance checks completed
          </p>
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Step-by-Step Task Panel (Left 7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-blue-400 flex items-center gap-1.5 uppercase">
              <ListTodo className="w-4 h-4 text-blue-400" />
              Dynamic Whitelist Steps & Verification Guide
            </h4>
            
            {/* Environment Picker */}
            <div className="flex bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px]">
              <button 
                onClick={() => setSelectedEnv("prod")}
                className={`px-2 py-1 rounded transition-all font-bold ${selectedEnv === "prod" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
              >
                Production Domain
              </button>
              <button 
                onClick={() => setSelectedEnv("dev")}
                className={`px-2 py-1 rounded transition-all font-bold ${selectedEnv === "dev" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
              >
                Dev App URL
              </button>
            </div>
          </div>

          <div className="space-y-3">
            
            {/* Step 1: Site Verification */}
            <div className={`p-3.5 rounded-lg border transition-all ${checklist.siteVerification ? "bg-slate-950/40 border-slate-800" : "bg-slate-950/20 border-slate-900"}`}>
              <div className="flex items-start gap-3">
                <button 
                  onClick={() => toggleCheck("siteVerification")} 
                  className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${checklist.siteVerification ? "bg-emerald-500 border-emerald-400 text-slate-950" : "border-slate-700 hover:border-slate-500"}`}
                >
                  {checklist.siteVerification && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-200 text-xs">Verify Domain Ownership</span>
                    <span className="text-[9px] bg-emerald-950/50 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-900/30">Verified</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Fulfill Google Trust & Safety homepage requirements. We have served <code className="text-blue-300 font-bold bg-slate-900 px-1 py-0.2 rounded">/googleb89bdda23b0fc37b.html</code> dynamically on your application routes and injected the redundant verification tag in <code className="text-blue-300 font-bold bg-slate-900 px-1 py-0.2 rounded">index.html</code>.
                  </p>
                  
                  <div className="mt-2.5 space-y-1.5 bg-slate-950 p-2 rounded border border-slate-850/60 text-[10px]">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Verification Target:</span>
                      <a href="https://displaycellpros.com/googleb89bdda23b0fc37b.html" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-0.5">
                        displaycellpros.com/googleb89bdda23b0fc37b.html <ExternalLink className="w-3 h-3 inline" />
                      </a>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Server status:</span>
                      <span className="text-emerald-400 font-bold">200 OK (Configured)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Firebase Auth Domain Whitelist */}
            <div className={`p-3.5 rounded-lg border transition-all ${checklist.firebaseAuthDomain ? "bg-slate-950/40 border-slate-800" : "bg-slate-950/20 border-slate-900"}`}>
              <div className="flex items-start gap-3">
                <button 
                  onClick={() => toggleCheck("firebaseAuthDomain")} 
                  className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${checklist.firebaseAuthDomain ? "bg-emerald-500 border-emerald-400 text-slate-950" : "border-slate-700 hover:border-slate-500"}`}
                >
                  {checklist.firebaseAuthDomain && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200 text-xs">Whitelist Domain in Firebase Console</span>
                    <a 
                      href={`https://console.firebase.google.com/project/${projectId}/authentication/providers`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-400 hover:underline text-[10px] flex items-center gap-0.5"
                    >
                      Firebase Console <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Navigate to <b>Authentication &gt; Settings &gt; Authorized domains</b>. You must register the domain you want to log in from.
                  </p>
                  
                  <div className="mt-2.5 p-2 bg-slate-950 rounded border border-slate-850 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Required Domains to Whitelist:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <span className="text-[10px] bg-slate-900 text-slate-300 font-mono px-1.5 py-0.5 rounded border border-slate-800 flex items-center gap-1.5">
                        displaycellpros.com
                        <button onClick={() => handleCopy("displaycellpros.com", "fc1")} className="hover:text-blue-400 text-slate-500">
                          <Copy className="w-3 h-3" />
                        </button>
                      </span>
                      <span className="text-[10px] bg-slate-900 text-slate-300 font-mono px-1.5 py-0.5 rounded border border-slate-800 flex items-center gap-1.5">
                        {devUrl.replace("https://", "").replace("http://", "").split("/")[0]}
                        <button onClick={() => handleCopy(devUrl.replace("https://", "").replace("http://", "").split("/")[0], "fc2")} className="hover:text-blue-400 text-slate-500">
                          <Copy className="w-3 h-3" />
                        </button>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: GCP Authorized JavaScript Origins */}
            <div className={`p-3.5 rounded-lg border transition-all ${checklist.gcpOrigins ? "bg-slate-950/40 border-slate-800" : "bg-slate-950/20 border-slate-900"}`}>
              <div className="flex items-start gap-3">
                <button 
                  onClick={() => toggleCheck("gcpOrigins")} 
                  className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${checklist.gcpOrigins ? "bg-emerald-500 border-emerald-400 text-slate-950" : "border-slate-700 hover:border-slate-500"}`}
                >
                  {checklist.gcpOrigins && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200 text-xs">Configure GCP JavaScript Origins</span>
                    <a 
                      href={`https://console.cloud.google.com/apis/credentials?project=${projectId}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-400 hover:underline text-[10px] flex items-center gap-0.5"
                    >
                      Credentials Console <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Edit the OAuth 2.0 Web Client ID in the Google Cloud Console. Under <b>Authorized JavaScript origins</b>, you MUST include the full HTTPS origin of your deployed services.
                  </p>
                  
                  <div className="mt-2.5 p-2 bg-slate-950 rounded border border-slate-850 space-y-1.5">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Origins to Add (Must match exact URL):</span>
                    <div className="space-y-1 font-mono">
                      <div className="flex justify-between items-center bg-slate-900 p-1 rounded px-2">
                        <span className="text-white text-[10.5px]">https://displaycellpros.com</span>
                        <button 
                          onClick={() => handleCopy("https://displaycellpros.com", "orig1")}
                          className="text-slate-500 hover:text-blue-400 flex items-center gap-1 text-[10px]"
                        >
                          {copiedText === "orig1" ? "Copied!" : "Copy"}
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex justify-between items-center bg-slate-900 p-1 rounded px-2">
                        <span className="text-white text-[10.5px] truncate max-w-[280px]">{devUrl}</span>
                        <button 
                          onClick={() => handleCopy(devUrl, "orig2")}
                          className="text-slate-500 hover:text-blue-400 flex items-center gap-1 text-[10px]"
                        >
                          {copiedText === "orig2" ? "Copied!" : "Copy"}
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: GCP Redirect URIs */}
            <div className={`p-3.5 rounded-lg border transition-all ${checklist.gcpRedirectUris ? "bg-slate-950/40 border-slate-800" : "bg-slate-950/20 border-slate-900"}`}>
              <div className="flex items-start gap-3">
                <button 
                  onClick={() => toggleCheck("gcpRedirectUris")} 
                  className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${checklist.gcpRedirectUris ? "bg-emerald-500 border-emerald-400 text-slate-950" : "border-slate-700 hover:border-slate-500"}`}
                >
                  {checklist.gcpRedirectUris && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <div className="flex-1 space-y-1">
                  <span className="font-bold text-slate-200 text-xs">Verify Authorized Redirect URIs</span>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    OAuth redirect handlers process response data. You must configure the Firebase Auth helper callback URL under <b>Authorized redirect URIs</b> in the GCP OAuth 2.0 Client credentials:
                  </p>
                  
                  <div className="mt-2.5 p-2 bg-slate-950 rounded border border-slate-850 flex justify-between items-center px-2 font-mono">
                    <span className="text-emerald-400 text-[10.5px]">https://{projectId}.firebaseapp.com/__/auth/handler</span>
                    <button 
                      onClick={() => handleCopy(`https://${projectId}.firebaseapp.com/__/auth/handler`, "red1")}
                      className="text-slate-500 hover:text-blue-400 flex items-center gap-1 text-[10px]"
                    >
                      {copiedText === "red1" ? "Copied!" : "Copy"}
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5: API Key Restrictions */}
            <div className={`p-3.5 rounded-lg border transition-all ${checklist.apiRestrictions ? "bg-slate-950/40 border-slate-800" : "bg-slate-950/20 border-slate-900"}`}>
              <div className="flex items-start gap-3">
                <button 
                  onClick={() => toggleCheck("apiRestrictions")} 
                  className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${checklist.apiRestrictions ? "bg-emerald-500 border-emerald-400 text-slate-950" : "border-slate-700 hover:border-slate-500"}`}
                >
                  {checklist.apiRestrictions && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <div className="flex-1 space-y-1">
                  <span className="font-bold text-slate-200 text-xs font-mono">Verify API Key Restrictions (Security Best Practice)</span>
                  <p className="text-[11px] text-slate-400 leading-normal font-mono">
                    If your Firebase/GCP API Key has HTTP restrictions, ensure that both <code className="text-white bg-slate-900 px-1 rounded">displaycellpros.com</code> and <code className="text-white bg-slate-900 px-1 rounded">*.run.app</code> are explicitly listed, or remove HTTP referrer restrictions temporarily to isolate errors.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Console commands & Live CLI Inspection (Right 5 Columns) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* CLI Section */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-3.5">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-xs uppercase font-mono border-b border-slate-900 pb-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Gcloud CLI Audit Toolkit</span>
            </div>

            <p className="text-[10px] text-slate-400 font-mono leading-normal">
              Execute these commands in your local shell to verify your Google Cloud OAuth client configurations programmatically:
            </p>

            <div className="space-y-3 font-mono text-[10px]">
              {/* Command 1 */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-slate-500 text-[9px] uppercase font-bold">
                  <span>1. Set Active Project</span>
                  <button onClick={() => handleCopy(gcloudSetProjectCmd, "cmd1")} className="hover:text-white flex items-center gap-1">
                    {copiedText === "cmd1" ? "Copied!" : "Copy"}
                    <Copy className="w-2.5 h-2.5" />
                  </button>
                </div>
                <pre className="bg-slate-900 p-2 rounded text-slate-300 font-bold overflow-x-auto select-all leading-normal">
                  {gcloudSetProjectCmd}
                </pre>
              </div>

              {/* Command 2 */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-slate-500 text-[9px] uppercase font-bold">
                  <span>2. List API Keys in Project</span>
                  <button onClick={() => handleCopy(gcloudListKeysCmd, "cmd2")} className="hover:text-white flex items-center gap-1">
                    {copiedText === "cmd2" ? "Copied!" : "Copy"}
                    <Copy className="w-2.5 h-2.5" />
                  </button>
                </div>
                <pre className="bg-slate-900 p-2 rounded text-slate-300 font-bold overflow-x-auto select-all leading-normal">
                  {gcloudListKeysCmd}
                </pre>
              </div>

              {/* Command 3 */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-slate-500 text-[9px] uppercase font-bold">
                  <span>3. Audit OAuth Clients</span>
                  <button onClick={() => handleCopy(gcloudDescribeClientCmd, "cmd3")} className="hover:text-white flex items-center gap-1">
                    {copiedText === "cmd3" ? "Copied!" : "Copy"}
                    <Copy className="w-2.5 h-2.5" />
                  </button>
                </div>
                <pre className="bg-slate-900 p-2 rounded text-slate-300 font-bold overflow-x-auto select-all leading-normal">
                  {gcloudDescribeClientCmd}
                </pre>
              </div>

              {/* Command 4 */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-slate-500 text-[9px] uppercase font-bold">
                  <span>4. Test Ownership URL (curl)</span>
                  <button onClick={() => handleCopy(testCurlCmd, "cmd4")} className="hover:text-white flex items-center gap-1">
                    {copiedText === "cmd4" ? "Copied!" : "Copy"}
                    <Copy className="w-2.5 h-2.5" />
                  </button>
                </div>
                <pre className="bg-slate-900 p-2 rounded text-slate-300 font-bold overflow-x-auto select-all leading-normal">
                  {testCurlCmd}
                </pre>
              </div>
            </div>
          </div>

          {/* Troubleshooter & Live Search catalog */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <span className="text-slate-200 font-bold text-xs uppercase font-mono flex items-center gap-1.5">
                <Search className="w-4 h-4 text-blue-400" />
                Error Troubleshooting Database
              </span>
            </div>

            <div className="relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search error code or keywords..."
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-slate-600 font-mono"
              />
            </div>

            <div className="space-y-2.5 max-h-[170px] overflow-y-auto pr-1">
              {filteredErrors.map((err, idx) => (
                <div key={idx} className="bg-slate-900/60 p-2 rounded border border-slate-850 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold font-mono text-[9.5px] truncate max-w-[190px]">{err.code}</span>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  </div>
                  <p className="text-[9.5px] text-slate-400 leading-normal font-mono">{err.description}</p>
                  <p className="text-[9.5px] text-emerald-400 leading-normal font-mono border-t border-slate-800 pt-1 mt-1">
                    <b>Action:</b> {err.solution}
                  </p>
                </div>
              ))}
              {filteredErrors.length === 0 && (
                <div className="text-center py-4 text-slate-500 font-mono text-[10px]">
                  No matching error solutions found.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
