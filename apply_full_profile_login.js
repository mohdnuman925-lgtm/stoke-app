const fs = require('fs');

const indexHtmlPath = 'c:/Users/HOME/.gemini/antigravity-ide/scratch/stoke-app/index.html';
let content = fs.readFileSync(indexHtmlPath, 'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// 1. UPDATE AuthScreen: add 'profile' tab and card to view === "signin"
// ─────────────────────────────────────────────────────────────────────────────
const oldLoginState = '  const [loginMethod, setLoginMethod] = useState("google_chain"); // "google_chain" | "credentials"';
const newLoginState = '  const [loginMethod, setLoginMethod] = useState("profile"); // "profile" | "google_chain" | "credentials"';

if (content.includes(oldLoginState)) {
  content = content.replace(oldLoginState, newLoginState);
  console.log("1. Replaced loginMethod state to default to 'profile'");
} else {
  console.log("1. (loginMethod already updated)");
}

const oldTabsBlock = `{/* Method Switcher Tabs */}
            <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 3, marginBottom: 14, border: "1px solid rgba(255,255,255,0.08)" }}>
              <button
                type="button"
                onClick={() => setLoginMethod("google_chain")}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 9,
                  border: "none",
                  background: loginMethod === "google_chain" ? "rgba(215,255,62,0.15)" : "transparent",
                  color: loginMethod === "google_chain" ? LIME : "rgba(255,255,255,0.6)",
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transition: "all 0.2s ease"
                }}
              >
                <span>🔗</span> Email Chain (Video Model)
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod("credentials")}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 9,
                  border: "none",
                  background: loginMethod === "credentials" ? "rgba(255,255,255,0.12)" : "transparent",
                  color: loginMethod === "credentials" ? "#fff" : "rgba(255,255,255,0.6)",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transition: "all 0.2s ease"
                }}
              >
                <span>🔑</span> Password
              </button>
            </div>`;

const newTabsAndProfileCard = `{/* Method Switcher Tabs: Profile Login | Google Chain | Password */}
            <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 3, marginBottom: 14, border: "1px solid rgba(255,255,255,0.08)" }}>
              <button
                type="button"
                onClick={() => setLoginMethod("profile")}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 9,
                  border: "none",
                  background: loginMethod === "profile" ? "rgba(215,255,62,0.2)" : "transparent",
                  color: loginMethod === "profile" ? LIME : "rgba(255,255,255,0.6)",
                  fontWeight: 800,
                  fontSize: 11,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  transition: "all 0.2s ease"
                }}
              >
                <span>👤</span> Profile Login
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod("google_chain")}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 9,
                  border: "none",
                  background: loginMethod === "google_chain" ? "rgba(215,255,62,0.15)" : "transparent",
                  color: loginMethod === "google_chain" ? LIME : "rgba(255,255,255,0.6)",
                  fontWeight: 800,
                  fontSize: 11,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  transition: "all 0.2s ease"
                }}
              >
                <span>🔗</span> Google Chain
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod("credentials")}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 9,
                  border: "none",
                  background: loginMethod === "credentials" ? "rgba(255,255,255,0.12)" : "transparent",
                  color: loginMethod === "credentials" ? "#fff" : "rgba(255,255,255,0.6)",
                  fontWeight: 700,
                  fontSize: 11,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  transition: "all 0.2s ease"
                }}
              >
                <span>🔑</span> Password
              </button>
            </div>

            {/* CARD 1: PROFILE LOGIN (1-TAP ATHLETE CARDS) */}
            {loginMethod === "profile" && (
              <div className="s3-glass" style={{ padding: "20px 18px", marginBottom: 18, animation: "fadeUp3 0.5s ease-out both", background: "rgba(18, 20, 24, 0.9)", border: "1px solid rgba(215,255,62,0.3)", borderRadius: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(215,255,62,0.08)" }}>
                {/* Header Badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: LIME, boxShadow: "0 0 10px " + LIME }} />
                    <span style={{ fontSize: 11, fontWeight: 900, color: LIME, letterSpacing: 1.5, textTransform: "uppercase" }}>
                      Athlete Profile Login
                    </span>
                  </div>
                  <span style={{ fontSize: 9.5, background: "rgba(215,255,62,0.15)", color: LIME, padding: "2px 8px", borderRadius: 999, fontWeight: 800, border: "1px solid rgba(215,255,62,0.3)" }}>
                    PRO ATHLETE
                  </span>
                </div>

                {/* Primary Mohd Numan Profile Card */}
                <div style={{ background: "linear-gradient(145deg, rgba(215,255,62,0.09) 0%, rgba(255,255,255,0.02) 100%)", border: "1.5px solid rgba(215,255,62,0.35)", borderRadius: 16, padding: "16px", marginBottom: 14, position: "relative", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 50, height: 50, borderRadius: "50%", background: "linear-gradient(135deg, #D7FF3E, #90D500)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, boxShadow: "0 4px 18px rgba(215,255,62,0.4)", flexShrink: 0 }}>
                      M
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 17, fontWeight: 900, color: "#fff" }}>Mohd Numan</span>
                        <span style={{ color: LIME, fontSize: 14 }}>✓</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>mohdnuman701@gmail.com</div>
                      <div style={{ fontSize: 10.5, color: LIME, fontWeight: 700, marginTop: 2 }}>Level 12 · STOKE Pro Member</div>
                    </div>
                  </div>

                  {/* Biometrics */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 9, padding: "5px 6px", textAlign: "center" }}>
                      <div style={{ fontSize: 8.5, color: "rgba(255,255,255,0.4)", fontWeight: 800 }}>WEIGHT</div>
                      <div style={{ fontSize: 12.5, fontWeight: 900, color: "#fff" }}>70.0 kg</div>
                    </div>
                    <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 9, padding: "5px 6px", textAlign: "center" }}>
                      <div style={{ fontSize: 8.5, color: "rgba(255,255,255,0.4)", fontWeight: 800 }}>HEIGHT</div>
                      <div style={{ fontSize: 12.5, fontWeight: 900, color: "#fff" }}>167 cm</div>
                    </div>
                    <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 9, padding: "5px 6px", textAlign: "center" }}>
                      <div style={{ fontSize: 8.5, color: "rgba(255,255,255,0.4)", fontWeight: 800 }}>CALORIES</div>
                      <div style={{ fontSize: 12.5, fontWeight: 900, color: LIME }}>3,290</div>
                    </div>
                  </div>

                  {/* 1-Tap Login Action */}
                  <button
                    type="button"
                    onClick={(e) => {
                      addRipple(e);
                      setLoading(true);
                      setTimeout(() => {
                        setLoading(false);
                        onSignIn("mohdnuman701@gmail.com", {
                          name: "Mohd Numan",
                          weightKg: 70,
                          heightCm: 167,
                          age: 21,
                          sex: "male",
                          goalType: "maintain",
                          activity: 1.725
                        });
                      }, 300);
                    }}
                    disabled={loading}
                    className="s3-primary-btn mat-ripple"
                    style={{ marginTop: 12, background: LIME, color: "#060809", height: 44, fontSize: 13.5, fontWeight: 900, boxShadow: "0 4px 18px rgba(215,255,62,0.4)" }}
                  >
                    {loading ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><NeuSpinner /> Entering Dashboard…</span> : "⚡ 1-Tap Profile Log In (Mohd Numan)"}
                  </button>
                </div>

                {/* Sub-profiles quick switch */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 7 }}>
                    Other Saved Profiles:
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {[
                      { name: "Mohd Numan", email: "mohdnuman925@gmail.com", color: "#1E8E3E", tag: "Personal" },
                      { name: "2210560090@klh.edu.in", email: "mohdnuman@klh.edu.in", color: "#E37400", tag: "KLH Edu" },
                      { name: "Mohammed numan .", email: "2210560148@klh.edu.in", color: "#1A73E8", tag: "KLH Student" },
                    ].map(p => (
                      <div
                        key={p.email}
                        onClick={() => {
                          onSignIn(p.email, { name: p.name, weightKg: 70, heightCm: 167, age: 21, sex: "male", goalType: "maintain", activity: 1.725 });
                        }}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "8px 12px", cursor: "pointer", transition: "all 0.15s ease" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: p.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>
                            {p.name[0]}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                            <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.45)" }}>{p.email}</div>
                          </div>
                        </div>
                        <span style={{ fontSize: 10.5, color: LIME, fontWeight: 800 }}>Log In →</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer links */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <span onClick={() => setLoginMethod("google_chain")} style={{ fontSize: 11, color: "#8AB4F8", fontWeight: 700, cursor: "pointer" }}>
                    🔗 Open Google Chain Sheet
                  </span>
                  <span onClick={() => setLoginMethod("credentials")} style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 600, cursor: "pointer" }}>
                    🔑 Use Password
                  </span>
                </div>
              </div>
            )}`;

if (content.includes(oldTabsBlock)) {
  content = content.replace(oldTabsBlock, newTabsAndProfileCard);
  console.log("2. Added Profile Login card & tab to signin screen!");
} else {
  console.log("2. (oldTabsBlock already replaced)");
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. UPDATE MoreHubScreen & App invocation
// ─────────────────────────────────────────────────────────────────────────────
const oldMoreCall = '{(tab === "more" || tab === "profile") && <MoreHubScreen profile={profile} setProfile={setProfile} goals={goals} userPhone={userPhone} onSignOut={handleSignOut} totals={totals} onNavigate={setTab} />}';
const newMoreCall = '{(tab === "more" || tab === "profile") && <MoreHubScreen profile={profile} setProfile={setProfile} goals={goals} userPhone={userPhone} onSignOut={handleSignOut} onSwitchAccount={handleSignIn} totals={totals} onNavigate={setTab} />}';

if (content.includes(oldMoreCall)) {
  content = content.replace(oldMoreCall, newMoreCall);
  console.log("3. Passed onSwitchAccount to MoreHubScreen in App()");
}

const oldMoreDef = 'function MoreHubScreen({ profile, setProfile, goals, userPhone, onSignOut, totals, onNavigate }) {';
const newMoreDef = 'function MoreHubScreen({ profile, setProfile, goals, userPhone, onSignOut, onSwitchAccount, totals, onNavigate }) {';

if (content.includes(oldMoreDef)) {
  content = content.replace(oldMoreDef, newMoreDef);
  console.log("4. Updated MoreHubScreen prop signature");
}

// In hero card: add Profile Login & Switch button right after Edit Biometrics button
const oldBiometricBtn = `<span>✏️</span> Edit Biometrics
              </button>`;
const newBiometricBtn = `<span>✏️</span> Edit Biometrics
              </button>

              <button
                onClick={() => setActiveModal("profile_login")}
                className="mat-ripple"
                style={{
                  background: "rgba(215,255,62,0.18)",
                  border: "1px solid " + LIME,
                  borderRadius: 10,
                  padding: "5px 12px",
                  color: LIME,
                  fontSize: 11,
                  fontWeight: 900,
                  cursor: "pointer",
                  letterSpacing: 0.5,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  boxShadow: "0 0 12px rgba(215,255,62,0.2)"
                }}
              >
                <span>🔐</span> Profile Login & Switch
              </button>`;

if (content.includes(oldBiometricBtn)) {
  content = content.replace(oldBiometricBtn, newBiometricBtn);
  console.log("5. Added Profile Login & Switch button to Profile hero card");
}

// In sections list: add Profile Login item
const oldSectionItems = `          {[
            { id: "profile", label: "My Profile & Biometrics", icon: "👤", sub: \`\${profile.name || "Mohd Numan"} · \${profile.weightKg || 70}kg · \${profile.heightCm || 167}cm\` },`;

const newSectionItems = `          {[
            { id: "profile_login", label: "Profile Login & Account Management", icon: "🔐", sub: \`Active: \${username} · 4 Linked Accounts\`, badge: "Active", badgeColor: LIME },
            { id: "profile", label: "My Profile & Biometrics", icon: "👤", sub: \`\${profile.name || "Mohd Numan"} · \${profile.weightKg || 70}kg · \${profile.heightCm || 167}cm\` },`;

if (content.includes(oldSectionItems)) {
  content = content.replace(oldSectionItems, newSectionItems);
  console.log("6. Added Profile Login card to sections list");
}

// In modal title bar:
const oldModalTitle = `{activeModal === "profile" && "Athlete Biometrics & Profile"}`;
const newModalTitle = `{activeModal === "profile_login" && "Profile Login & Accounts"}
                  {activeModal === "profile" && "Athlete Biometrics & Profile"}`;

if (content.includes(oldModalTitle)) {
  content = content.replace(oldModalTitle, newModalTitle);
  console.log("7. Added profile_login title to modal header");
}

const oldModalIcon = `{activeModal === "profile" && "👤"}`;
const newModalIcon = `{activeModal === "profile_login" && "🔐"}
                  {activeModal === "profile" && "👤"}`;

if (content.includes(oldModalIcon)) {
  content = content.replace(oldModalIcon, newModalIcon);
  console.log("8. Added profile_login icon to modal header");
}

// In modal body:
const oldModalBodyStart = `{/* ── MODAL 1: MY PROFILE & BIOMETRICS EDIT ── */}
            {activeModal === "profile" && (`;

const newModalBodyContent = `{/* ── MODAL 0: PROFILE LOGIN & ACCOUNT SWITCHER ── */}
            {activeModal === "profile_login" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: "rgba(215,255,62,0.08)", border: "1px solid rgba(215,255,62,0.3)", borderRadius: 14, padding: "14px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: LIME, color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900 }}>
                    {avatarLetter}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{username}</span>
                      <span style={{ background: "rgba(215,255,62,0.2)", color: LIME, fontSize: 10, fontWeight: 900, padding: "1px 6px", borderRadius: 4 }}>CURRENT</span>
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{userPhone || "mohdnuman701@gmail.com"}</div>
                  </div>
                </div>

                <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", letterSpacing: 1, textTransform: "uppercase", marginTop: 4 }}>
                  Switch to Another Linked Profile:
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { name: "Mohd Numan", email: "mohdnuman701@gmail.com", avatar: "M", color: "#D93025", tag: "Primary Athlete · 70kg" },
                    { name: "Mohd Numan", email: "mohdnuman925@gmail.com", avatar: "M", color: "#1E8E3E", tag: "Personal · Level 12" },
                    { name: "2210560090@klh.edu.in", email: "mohdnuman@klh.edu.in", avatar: "N", color: "#E37400", tag: "KLH University Student" },
                    { name: "Mohammed numan .", email: "2210560148@klh.edu.in", avatar: "M", color: "#1A73E8", tag: "KLH Athlete" },
                  ].map(p => {
                    const isCurrent = (userPhone || "mohdnuman701@gmail.com") === p.email;
                    return (
                      <div
                        key={p.email}
                        onClick={() => {
                          if (onSwitchAccount) {
                            onSwitchAccount(p.email, {
                              name: p.name,
                              weightKg: 70,
                              heightCm: 167,
                              age: 21,
                              sex: "male",
                              goalType: "maintain",
                              activity: 1.725
                            });
                          } else {
                            setProfile(prev => ({ ...prev, name: p.name }));
                          }
                          setActiveModal(null);
                          triggerToast("✓ Logged in as " + p.name + " (" + p.email + ")");
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: isCurrent ? "rgba(215,255,62,0.1)" : "rgba(255,255,255,0.03)",
                          border: "1.5px solid " + (isCurrent ? LIME : "rgba(255,255,255,0.08)"),
                          borderRadius: 12,
                          padding: "10px 14px",
                          cursor: "pointer"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: p.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>
                            {p.avatar}
                          </div>
                          <div>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#fff" }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: isCurrent ? LIME : "rgba(255,255,255,0.5)" }}>{p.email} · {p.tag}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          style={{
                            background: isCurrent ? LIME : "rgba(255,255,255,0.08)",
                            color: isCurrent ? "#000" : "#fff",
                            border: "none",
                            borderRadius: 8,
                            padding: "5px 10px",
                            fontSize: 11,
                            fontWeight: 800,
                            cursor: "pointer"
                          }}
                        >
                          {isCurrent ? "Active" : "Switch ⚡"}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button
                    onClick={() => { setActiveModal(null); onSignOut(); }}
                    style={{ flex: 1, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "11px 0", color: "#EF4444", fontSize: 12, fontWeight: 800, cursor: "pointer" }}
                  >
                    🚪 Sign Out of STOKE
                  </button>
                  <button
                    onClick={() => setActiveModal(null)}
                    style={{ flex: 1, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "11px 0", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* ── MODAL 1: MY PROFILE & BIOMETRICS EDIT ── */}
            {activeModal === "profile" && (`;

if (content.includes(oldModalBodyStart)) {
  content = content.replace(oldModalBodyStart, newModalBodyContent);
  console.log("9. Added profile_login modal body content");
}

fs.writeFileSync(indexHtmlPath, content, 'utf8');
console.log("Successfully updated index.html with Profile Login everywhere! New length:", content.length);
