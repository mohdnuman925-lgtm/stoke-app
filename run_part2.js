// ============================================================================
// CHOOSE SPORT BOTTOM SHEET (Exact match to mmmmm.mp4)
// ============================================================================
function ChooseSportSheet({ isOpen, onClose, selectedSportId = "run", onSelectSport }) {
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredSports = ALL_SPORTS.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
  });

  const topSports = ALL_SPORTS.filter(s => s.isTop);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 10000,
      background: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(8px)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end"
    }}>
      <div onClick={onClose} style={{ flex: 1, width: "100%" }} />
      <div style={{
        background: "#1C1C1E",
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        maxHeight: "85vh",
        maxWidth: 480,
        width: "100%",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 -10px 40px rgba(0,0,0,0.8)",
        borderTop: "1px solid rgba(255,255,255,0.12)",
        animation: "stokeFadeUp 0.25s ease-out"
      }}>
        {/* Grab Handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 10, paddingBottom: 6 }}>
          <div style={{ width: 38, height: 5, borderRadius: 999, background: "#48484A" }} />
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px 14px" }}>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#FFFFFF", letterSpacing: -0.3 }}>Choose a Sport</h2>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#2C2C2E",
              border: "none",
              color: "#EBEBF5",
              fontSize: 16,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer"
            }}
          >
            ✕
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ padding: "0 20px 14px" }}>
          <div style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            background: "#2C2C2E",
            borderRadius: 12,
            padding: "8px 14px 8px 38px"
          }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8E8E93" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#FFFFFF",
                fontSize: 15,
                fontFamily: "inherit"
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{ background: "none", border: "none", color: "#8E8E93", cursor: "pointer", fontSize: 13, padding: "2px 4px" }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Scrollable List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 30px" }}>
          {/* Your Top Sports */}
          {!searchQuery && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
                Your Top Sports
              </div>
              <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 4 }}>
                {topSports.map(s => {
                  const isSel = s.id === selectedSportId;
                  return (
                    <button
                      key={s.id}
                      onClick={() => { onSelectSport(s.id); onClose(); }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        minWidth: 64
                      }}
                    >
                      <div style={{
                        width: 54,
                        height: 54,
                        borderRadius: "50%",
                        background: isSel ? "rgba(54, 120, 245, 0.2)" : "#2C2C2E",
                        border: `1.5px solid ${isSel ? "#3678F5" : "rgba(255,255,255,0.08)"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: isSel ? "#3678F5" : "#FFFFFF"
                      }}>
                        <SportIcon icon={s.icon} size={24} color={isSel ? "#3678F5" : "#FFFFFF"} />
                      </div>
                      <span style={{ fontSize: 11.5, fontWeight: isSel ? 800 : 600, color: isSel ? "#3678F5" : "#EBEBF5", textAlign: "center" }}>
                        {s.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Grouped Sports Categories */}
          {SPORT_CATEGORIES.map(cat => {
            const catSports = filteredSports.filter(s => s.category === cat);
            if (catSports.length === 0) return null;

            return (
              <div key={cat} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, paddingBottom: 4, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {cat}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {catSports.map(s => {
                    const isSel = s.id === selectedSportId;
                    return (
                      <div
                        key={s.id}
                        onClick={() => { onSelectSport(s.id); onClose(); }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 6px",
                          cursor: "pointer",
                          borderRadius: 10,
                          transition: "background 0.15s ease",
                          background: isSel ? "rgba(54, 120, 245, 0.10)" : "transparent"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: isSel ? "rgba(54, 120, 245, 0.2)" : "#2C2C2E",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: isSel ? "#3678F5" : "#FFFFFF"
                          }}>
                            <SportIcon icon={s.icon} size={18} color={isSel ? "#3678F5" : "#FFFFFF"} />
                          </div>
                          <span style={{ fontSize: 15, fontWeight: isSel ? 800 : 600, color: isSel ? "#3678F5" : "#FFFFFF" }}>
                            {s.name}
                          </span>
                        </div>
                        {isSel && (
                          <div style={{ color: "#3678F5", fontWeight: 900 }}>
                            <SportIcon icon="checkmark" size={18} color="#3678F5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ADD ROUTE MODAL
// ============================================================================
function AddRouteModal({ isOpen, onClose, onSelectRoute, activeRouteId = null, onClearRoute }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 10000,
      background: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(8px)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end"
    }}>
      <div onClick={onClose} style={{ flex: 1, width: "100%" }} />
      <div style={{
        background: "#1C1C1E",
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        maxHeight: "80vh",
        maxWidth: 480,
        width: "100%",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 -10px 40px rgba(0,0,0,0.8)",
        borderTop: "1px solid rgba(255,255,255,0.12)",
        padding: "12px 20px 30px",
        animation: "stokeFadeUp 0.25s ease-out"
      }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <div style={{ width: 38, height: 5, borderRadius: 999, background: "#48484A" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#FFFFFF" }}>Add Route</h2>
            <div style={{ fontSize: 12, color: "#8E8E93", marginTop: 2 }}>Select a planned course with elevation & waypoints</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: "#2C2C2E", border: "none", color: "#EBEBF5", cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", marginBottom: 16 }}>
          {PRESET_ROUTES.map(r => {
            const isSel = r.id === activeRouteId;
            return (
              <div
                key={r.id}
                onClick={() => { onSelectRoute(r); onClose(); }}
                style={{
                  background: isSel ? "rgba(54, 120, 245, 0.15)" : "#2C2C2E",
                  border: `1.5px solid ${isSel ? "#3678F5" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 16,
                  padding: "14px 16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#FFFFFF" }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: "#8E8E93", marginTop: 2 }}>{r.desc}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <span style={{ fontSize: 11, background: "rgba(54, 120, 245, 0.2)", color: "#3678F5", padding: "2px 8px", borderRadius: 6, fontWeight: 800 }}>{r.distanceKm} km</span>
                    <span style={{ fontSize: 11, background: "#3A3A3C", color: "#EBEBF5", padding: "2px 8px", borderRadius: 6, fontWeight: 700 }}>+{r.elevationGain}m ele</span>
                  </div>
                </div>
                {isSel ? (
                  <span style={{ color: "#3678F5", fontWeight: 900, fontSize: 18 }}>✓</span>
                ) : (
                  <span style={{ color: "#8E8E93", fontSize: 13, fontWeight: 700 }}>Load ➔</span>
                )}
              </div>
            );
          })}
        </div>

        {activeRouteId && (
          <button
            onClick={() => { onClearRoute(); onClose(); }}
            style={{
              width: "100%",
              padding: "12px 0",
              borderRadius: 12,
              background: "#2C2C2E",
              border: "1px solid #FF3B30",
              color: "#FF3B30",
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer"
            }}
          >
            Clear Active Route
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// WORKOUT TARGET MODAL (Top banner click)
// ============================================================================
function WorkoutTargetModal({ isOpen, onClose, onSelectTarget, currentTarget }) {
  if (!isOpen) return null;

  const targets = [
    { id: "free", title: "Open Workout", desc: "No pace or distance limits, track naturally", badge: "Free Run" },
    { id: "5k_pace", title: "5K Tempo Target", desc: "5.0 km target at 5:00 min/km pace (25 mins)", badge: "5K · 25m" },
    { id: "10k_endurance", title: "10K Endurance", desc: "10.0 km aerobic base building at 5:30 min/km", badge: "10K · 55m" },
    { id: "interval_hiit", title: "Speed Intervals", desc: "8x 400m speed repeats with 60s active recovery", badge: "HIIT" },
    { id: "recovery", title: "Easy Recovery Jog", desc: "3.5 km relaxed zone 2 jog for active recovery", badge: "Recovery" }
  ];

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 10000,
      background: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(8px)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end"
    }}>
      <div onClick={onClose} style={{ flex: 1, width: "100%" }} />
      <div style={{
        background: "#1C1C1E",
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        maxHeight: "80vh",
        maxWidth: 480,
        width: "100%",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 -10px 40px rgba(0,0,0,0.8)",
        borderTop: "1px solid rgba(255,255,255,0.12)",
        padding: "12px 20px 30px",
        animation: "stokeFadeUp 0.25s ease-out"
      }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <div style={{ width: 38, height: 5, borderRadius: 999, background: "#48484A" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#FFFFFF" }}>Stoke Workouts &amp; Targets</h2>
            <div style={{ fontSize: 12, color: "#8E8E93", marginTop: 2 }}>Audio cues guide your pace and interval splits</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: "#2C2C2E", border: "none", color: "#EBEBF5", cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {targets.map(t => {
            const isSel = currentTarget?.id === t.id;
            return (
              <div
                key={t.id}
                onClick={() => { onSelectTarget(t); onClose(); }}
                style={{
                  background: isSel ? "rgba(54, 120, 245, 0.15)" : "#2C2C2E",
                  border: `1.5px solid ${isSel ? "#3678F5" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 16,
                  padding: "14px 16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: "#FFFFFF" }}>{t.title}</span>
                    <span style={{ fontSize: 10.5, background: "rgba(54, 120, 245, 0.2)", color: "#3678F5", padding: "2px 6px", borderRadius: 6, fontWeight: 800 }}>{t.badge}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#8E8E93", marginTop: 3 }}>{t.desc}</div>
                </div>
                {isSel && <span style={{ color: "#3678F5", fontWeight: 900, fontSize: 18 }}>✓</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SENSOR CONNECTIVITY MODAL
// ============================================================================
function SensorModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = React.useState("bluetooth"); // "bluetooth" | "guide" | "cloud"
  const [deviceStatus, setDeviceStatus] = React.useState("disconnected"); // "disconnected" | "connecting" | "connected"
  const [connectedName, setConnectedName] = React.useState(null);
  const [liveBpm, setLiveBpm] = React.useState(138);
  const [bleError, setBleError] = React.useState("");
  const [selectedWatchGuide, setSelectedWatchGuide] = React.useState("apple"); // "apple" | "wearos" | "garmin"

  React.useEffect(() => {
    if (deviceStatus !== "connected") return;
    const interval = setInterval(() => {
      setLiveBpm(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(118, Math.min(176, prev + delta));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [deviceStatus]);

  const handlePairBluetooth = async () => {
    setBleError("");
    setDeviceStatus("connecting");

    if (typeof navigator !== "undefined" && navigator.bluetooth) {
      try {
        const device = await navigator.bluetooth.requestDevice({
          filters: [{ services: ['heart_rate'] }],
          optionalServices: ['battery_service']
        });
        setConnectedName(device.name || "Bluetooth Smartwatch");
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService('heart_rate');
        const characteristic = await service.getCharacteristic('heart_rate_measurement');
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', (e) => {
          const val = e.target.value;
          const is16 = val.getUint8(0) & 0x1;
          const bpm = is16 ? val.getUint16(1, true) : val.getUint8(1);
          if (bpm > 0) setLiveBpm(bpm);
        });
        device.addEventListener('gattserverdisconnected', () => {
          setDeviceStatus("disconnected");
          setConnectedName(null);
        });
        setDeviceStatus("connected");
        return;
      } catch (err) {
        if (err.name === "NotFoundError" || err.message?.includes("cancelled")) {
          setDeviceStatus("disconnected");
          return;
        }
        setBleError(err.message || "Bluetooth pairing was cancelled or failed.");
        setDeviceStatus("disconnected");
        return;
      }
    } else {
      setBleError("Web Bluetooth API is not supported in this browser. Please use Chrome or Edge on desktop/Android.");
      setDeviceStatus("disconnected");
      return;
    }
  };

  const handleDisconnect = () => {
    setDeviceStatus("disconnected");
    setConnectedName(null);
    setBleError("");
  };

  const getHrZone = (bpm) => {
    if (bpm < 120) return { name: "Zone 1 · Warm-up", color: "#3B82F6" };
    if (bpm < 140) return { name: "Zone 2 · Fat Burn", color: "#10B981" };
    if (bpm < 160) return { name: "Zone 3 · Cardio", color: "#F59E0B" };
    if (bpm < 175) return { name: "Zone 4 · Anaerobic", color: "#EF4444" };
    return { name: "Zone 5 · Peak", color: "#8B5CF6" };
  };

  const currentZone = getHrZone(liveBpm);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 10000,
      background: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end"
    }}>
      <div onClick={onClose} style={{ flex: 1, width: "100%" }} />
      <div style={{
        background: "var(--surface-primary, #1C1C1E)",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: "88vh",
        maxWidth: 480,
        width: "100%",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 -12px 48px rgba(0,0,0,0.5)",
        borderTop: "1.5px solid var(--border-divider, rgba(255,255,255,0.12))",
        padding: "14px 20px 32px",
        boxSizing: "border-box",
        overflowY: "auto",
        animation: "stokeFadeUp 0.25s ease-out"
      }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <div style={{ width: 42, height: 5, borderRadius: 999, background: "var(--border-divider, #48484A)" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 26 }}>⌚</span>
            <div>
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "var(--text-primary)" }}>
                Smartwatch &amp; Sensors
              </h2>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                Live heart rate, pacing, &amp; workout sync
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "var(--surface-secondary, #2C2C2E)",
              border: "1px solid var(--border-divider)",
              color: "var(--text-primary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "var(--surface-secondary)", padding: 4, borderRadius: 12, border: "1px solid var(--border-divider)" }}>
          {[
            { id: "bluetooth", label: "Direct Bluetooth" },
            { id: "guide", label: "Watch Setup" },
            { id: "cloud", label: "Health Sync" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 8,
                border: "none",
                background: activeTab === tab.id ? "var(--btn-primary-bg, #237547)" : "transparent",
                color: activeTab === tab.id ? "var(--btn-primary-text, #FFFFFF)" : "var(--text-secondary)",
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "bluetooth" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{
              background: deviceStatus === "connected" ? "rgba(35, 117, 71, 0.12)" : "var(--surface-secondary)",
              border: `1.5px solid ${deviceStatus === "connected" ? "#237547" : "var(--border-divider)"}`,
              borderRadius: 16,
              padding: "16px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: deviceStatus === "connected" ? "#237547" : "var(--surface-primary)",
                  color: deviceStatus === "connected" ? "#FFFFFF" : "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  boxShadow: deviceStatus === "connected" ? "0 0 16px rgba(35, 117, 71, 0.45)" : "none"
                }}>
                  {deviceStatus === "connected" ? "❤️" : "⌚"}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>
                    {deviceStatus === "connected" ? (connectedName || "Smartwatch Connected") : "No Smartwatch Paired"}
                  </div>
                  <div style={{ fontSize: 12, color: deviceStatus === "connected" ? "#237547" : "var(--text-secondary)", fontWeight: 600, marginTop: 2 }}>
                    {deviceStatus === "connected" ? `● Live Streaming · ${currentZone.name}` : "Ready to pair via Web Bluetooth"}
                  </div>
                </div>
              </div>

              {deviceStatus === "connected" && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#237547", fontFamily: "'Space Grotesk', monospace", lineHeight: 1 }}>
                    {liveBpm}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", marginTop: 2 }}>
                    BPM
                  </div>
                </div>
              )}
            </div>

            {deviceStatus === "disconnected" && (
              <button
                type="button"
                onClick={handlePairBluetooth}
                style={{
                  width: "100%",
                  height: 52,
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #237547 0%, #1B5E36 100%)",
                  color: "#FFFFFF",
                  border: "none",
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 6px 20px rgba(35, 117, 71, 0.35)",
                  transition: "all 0.2s ease"
                }}
              >
                <span>Pair Smartwatch / Heart Monitor</span>
                <span>➔</span>
              </button>
            )}

            {deviceStatus === "connecting" && (
              <div style={{
                textAlign: "center",
                padding: "16px 0",
                color: "var(--text-primary)",
                fontSize: 14,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10
              }}>
                <span className="s3-spinner" style={{ borderTopColor: "#237547" }} />
                <span>Searching for nearby Bluetooth Smartwatches...</span>
              </div>
            )}

            {deviceStatus === "connected" && (
              <button
                type="button"
                onClick={handleDisconnect}
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 12,
                  background: "transparent",
                  color: "var(--text-secondary)",
                  border: "1.5px solid var(--border-divider)",
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: "pointer"
                }}
              >
                Disconnect Device
              </button>
            )}

            {bleError && (
              <div style={{
                background: "rgba(209, 67, 67, 0.1)",
                border: "1px solid rgba(209, 67, 67, 0.3)",
                color: "#D14343",
                fontSize: 12,
                fontWeight: 600,
                padding: "8px 12px",
                borderRadius: 10
              }}>
                {bleError}
              </div>
            )}

            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                Supported Devices &amp; Protocols:
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { name: "Apple Watch", desc: "HeartCast / ECHO BLE", icon: "🍏" },
                  { name: "Galaxy & Wear OS", desc: "Samsung Health / BLE", icon: "⌚" },
                  { name: "Garmin Watches", desc: "Broadcast Heart Rate", icon: "🧭" },
                  { name: "Polar & Whoop", desc: "Native BLE 0x180D", icon: "⚡" }
                ].map(item => (
                  <div key={item.name} style={{ background: "var(--surface-elevated)", border: "1px solid var(--border-divider)", borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)" }}>{item.name}</div>
                      <div style={{ fontSize: 10.5, color: "var(--text-secondary)" }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "guide" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
              {[
                { id: "apple", label: "Apple Watch" },
                { id: "wearos", label: "Galaxy / Wear OS" },
                { id: "garmin", label: "Garmin" }
              ].map(guide => (
                <button
                  key={guide.id}
                  onClick={() => setSelectedWatchGuide(guide.id)}
                  style={{
                    flex: 1,
                    padding: "6px 0",
                    borderRadius: 8,
                    border: "1px solid var(--border-divider)",
                    background: selectedWatchGuide === guide.id ? "rgba(35, 117, 71, 0.15)" : "var(--surface-elevated)",
                    color: selectedWatchGuide === guide.id ? "#237547" : "var(--text-primary)",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer"
                  }}
                >
                  {guide.label}
                </button>
              ))}
            </div>

            {selectedWatchGuide === "apple" && (
              <div style={{ background: "var(--surface-elevated)", border: "1px solid var(--border-divider)", borderRadius: 14, padding: "14px 16px", fontSize: 13, lineHeight: 1.6, color: "var(--text-primary)" }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 6, color: "#237547" }}>🍏 Apple Watch Pairing Guide:</div>
                <ol style={{ margin: 0, paddingLeft: 18 }}>
                  <li>Open <strong>ECHO</strong> or <strong>HeartCast</strong> (free on watchOS App Store) on your Apple Watch.</li>
                  <li>Tap <strong>Start Broadcasting</strong> on the watch.</li>
                  <li>Click <strong>Pair Smartwatch</strong> in the Direct Bluetooth tab above.</li>
                  <li>Select your Apple Watch from the list to stream live heart rate and calorie telemetry into STOKE!</li>
                </ol>
              </div>
            )}

            {selectedWatchGuide === "wearos" && (
              <div style={{ background: "var(--surface-elevated)", border: "1px solid var(--border-divider)", borderRadius: 14, padding: "14px 16px", fontSize: 13, lineHeight: 1.6, color: "var(--text-primary)" }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 6, color: "#237547" }}>⌚ Samsung Galaxy &amp; Wear OS:</div>
                <ol style={{ margin: 0, paddingLeft: 18 }}>
                  <li>On your Galaxy Watch / Pixel Watch, install <strong>Heart Rate Broadcaster</strong> or enable BLE Heart Rate in Samsung Health.</li>
                  <li>Ensure Bluetooth is enabled on your phone or laptop.</li>
                  <li>Click <strong>Pair Smartwatch</strong> to connect directly over standard BLE GATT.</li>
                  <li>Workouts will synchronize real-time heart rate zones into your workout log!</li>
                </ol>
              </div>
            )}

            {selectedWatchGuide === "garmin" && (
              <div style={{ background: "var(--surface-elevated)", border: "1px solid var(--border-divider)", borderRadius: 14, padding: "14px 16px", fontSize: 13, lineHeight: 1.6, color: "var(--text-primary)" }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 6, color: "#237547" }}>🧭 Garmin Built-in Broadcast:</div>
                <ol style={{ margin: 0, paddingLeft: 18 }}>
                  <li>On your Garmin watch, hold the <strong>UP / Menu</strong> button.</li>
                  <li>Navigate to <strong>Wrist Heart Rate &gt; Broadcast Heart Rate</strong>.</li>
                  <li>Press <strong>Start</strong> to begin broadcasting.</li>
                  <li>In STOKE, click <strong>Pair Smartwatch</strong>. Your Garmin watch will appear as a standard heart rate sensor!</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {activeTab === "cloud" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { name: "Apple Health (HealthKit)", desc: "Syncs active calories, steps, workouts & sleep", icon: "🍎", connected: true },
              { name: "Google Health Connect", desc: "Native Android & Wear OS health hub", icon: "🌐", connected: true },
              { name: "Garmin Connect", desc: "Auto-imports GPS trail runs and cadence", icon: "🧭", connected: false },
              { name: "Strava", desc: "Bi-directional run and cycling split sync", icon: "🏃", connected: false }
            ].map(platform => (
              <div
                key={platform.name}
                style={{
                  background: "var(--surface-elevated)",
                  border: "1px solid var(--border-divider)",
                  borderRadius: 14,
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 22 }}>{platform.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{platform.name}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>{platform.desc}</div>
                  </div>
                </div>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "4px 9px",
                  borderRadius: 6,
                  background: platform.connected ? "rgba(35, 117, 71, 0.15)" : "var(--surface-secondary)",
                  color: platform.connected ? "#237547" : "var(--text-secondary)",
                  border: `1px solid ${platform.connected ? "rgba(35, 117, 71, 0.3)" : "var(--border-divider)"}`
                }}>
                  {platform.connected ? "LINKED" : "CONNECT"}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

// ============================================================================
// STOKE LIVE MAP (Dark Matter CartoDB tiles default)
// ============================================================================
function StokeLiveMap({
  path = [],
  plannedRoute = null,
  userPos = null,
  is3DTilted = false,
  mapTileType = "dark",
  runStage = "map_idle",
  height = "100%",
  onRecenter = null
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markerRef = useRef(null);
  const polylineRef = useRef(null);
  const plannedPolylineRef = useRef(null);
  const startMarkerRef = useRef(null);
  const finishMarkerRef = useRef(null);
  const userPannedRef = useRef(false);

  const initialCenter = (userPos && userPos.length === 2 && !isNaN(userPos[0]))
    ? [userPos[0], userPos[1]]
    : [28.6139, 77.2090];

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined" || !window.L) return;
    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: false,
        fadeAnimation: true,
        scrollWheelZoom: true
      }).setView(initialCenter, 16);
      mapRef.current = map;

      const tileUrls = {
        dark: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        street: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        topo: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
      };

      const tileLayer = L.tileLayer(tileUrls[mapTileType] || tileUrls.dark, {
        subdomains: "abc",
        maxZoom: 19,
        className: (mapTileType === "dark" || !mapTileType) ? "stoke-dark-tiles" : ""
      }).addTo(map);
      tileLayerRef.current = tileLayer;

      // Planned route polyline (cyan)
      plannedPolylineRef.current = L.polyline([], {
        color: "#00E5FF",
        weight: 4,
        opacity: 0.75,
        dashArray: "6, 8",
        lineCap: "round",
        lineJoin: "round"
      }).addTo(map);

      // Active tracked polyline (vibrant Strava/Stoke orange)
      polylineRef.current = L.polyline([], {
        color: "#3678F5",
        weight: 5.5,
        opacity: 0.98,
        lineCap: "round",
        lineJoin: "round"
      }).addTo(map);

      // Custom pulsing runner marker
      const runnerIcon = L.divIcon({
        className: "custom-runner-icon",
        html: `<div class="stoke-runner-beacon"><div class="stoke-runner-pulse" style="background:rgba(54,120,245,0.4);"></div><div class="stoke-runner-dot" style="background:#3678F5;border:2.5px solid #FFF;"></div><div class="stoke-runner-beam" style="background:radial-gradient(circle at 50% 100%, rgba(54,120,245,0.55) 0%, rgba(54,120,245,0) 75%);"></div></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      markerRef.current = L.marker(initialCenter, { icon: runnerIcon }).addTo(map);

      map.on("dragstart movestart", (e) => {
        if (e.originalEvent) {
          userPannedRef.current = true;
        }
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update map tile url
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current || !window.L) return;
    const tileUrls = {
      dark: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      street: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      topo: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
    };
    tileLayerRef.current.setUrl(tileUrls[mapTileType] || tileUrls.dark);
    try {
      const container = tileLayerRef.current.getContainer();
      if (container) {
        if (mapTileType === "dark" || !mapTileType) container.classList.add("stoke-dark-tiles");
        else container.classList.remove("stoke-dark-tiles");
      }
    } catch(e) {}
  }, [mapTileType]);

  // Update planned route
  useEffect(() => {
    if (!plannedPolylineRef.current) return;
    if (plannedRoute && plannedRoute.coords && plannedRoute.coords.length > 1) {
      const pts = plannedRoute.coords.map(c => [c.lat, c.lng]);
      plannedPolylineRef.current.setLatLngs(pts);
    } else {
      plannedPolylineRef.current.setLatLngs([]);
    }
  }, [plannedRoute]);

  // Update user position marker and polyline
  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    if (userPos && userPos.length === 2 && !isNaN(userPos[0])) {
      if (markerRef.current) {
        markerRef.current.setLatLng(userPos);
      }
      if (!userPannedRef.current) {
        mapRef.current.panTo(userPos, { animate: true, duration: 0.5 });
      }
    }

    const sourcePath = (path && path.length > 1) ? path : [];
    const latLngs = sourcePath.map(getLatLng).filter(Boolean);

    if (polylineRef.current) {
      polylineRef.current.setLatLngs(latLngs);
    }

    if (runStage === "summary" || runStage === "activity_detail") {
      if (latLngs.length > 1) {
        const bounds = L.latLngBounds(latLngs);
        mapRef.current.fitBounds(bounds, { padding: [40, 40] });

        if (!startMarkerRef.current) {
          const startIcon = L.divIcon({
            className: "stoke-pin-start",
            html: `<div style="width:24px;height:24px;border-radius:50%;background:#10B981;border:3px solid #FFF;box-shadow:0 2px 10px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;font-size:11px;color:#FFF;font-weight:900;">A</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
          startMarkerRef.current = L.marker(latLngs[0], { icon: startIcon }).addTo(mapRef.current);
        } else {
          startMarkerRef.current.setLatLng(latLngs[0]);
        }

        if (!finishMarkerRef.current) {
          const finishIcon = L.divIcon({
            className: "stoke-pin-finish",
            html: `<div style="width:24px;height:24px;border-radius:50%;background:#3678F5;border:3px solid #FFF;box-shadow:0 2px 10px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;font-size:11px;color:#FFF;font-weight:900;">B</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
          finishMarkerRef.current = L.marker(latLngs[latLngs.length - 1], { icon: finishIcon }).addTo(mapRef.current);
        } else {
          finishMarkerRef.current.setLatLng(latLngs[latLngs.length - 1]);
        }
      }
    } else {
      if (startMarkerRef.current) {
        startMarkerRef.current.remove();
        startMarkerRef.current = null;
      }
      if (finishMarkerRef.current) {
        finishMarkerRef.current.remove();
        finishMarkerRef.current = null;
      }
    }
  }, [userPos, path, runStage]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: height,
        position: "relative",
        background: "#0E0E0E",
        transform: is3DTilted ? "perspective(700px) rotateX(24deg) scale(1.05)" : "none",
        transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
      }}
    />
  );
}

function StokeRouteThumb({ path = [] }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current || !path || path.length < 2) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const validPoints = path.map((p) => {
      if (Array.isArray(p)) return { lat: p[0], lng: p[1] };
      if (typeof p === "object" && p !== null) return { lat: p.lat, lng: p.lng };
      return null;
    }).filter((p) => p && !isNaN(p.lat) && !isNaN(p.lng));

    if (validPoints.length < 2) return;

    const lats = validPoints.map((p) => p.lat);
    const lngs = validPoints.map((p) => p.lng);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const pad = 10;
    const rangeX = maxLng - minLng || 0.0001;
    const rangeY = maxLat - minLat || 0.0001;
    const scale = Math.min((W - pad * 2) / rangeX, (H - pad * 2) / rangeY);

    const toX = (lng) => pad + (lng - minLng) * scale;
    const toY = (lat) => H - pad - (lat - minLat) * scale;

    ctx.beginPath();
    ctx.moveTo(toX(validPoints[0].lng), toY(validPoints[0].lat));
    for (let i = 1; i < validPoints.length; i++) ctx.lineTo(toX(validPoints[i].lng), toY(validPoints[i].lat));
    ctx.strokeStyle = "#3678F5";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(toX(validPoints[0].lng), toY(validPoints[0].lat), 4, 0, Math.PI * 2);
    ctx.fillStyle = "#10B981";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(toX(validPoints[validPoints.length - 1].lng), toY(validPoints[validPoints.length - 1].lat), 4, 0, Math.PI * 2);
    ctx.fillStyle = "#3678F5";
    ctx.fill();
  }, [path]);

  return <canvas ref={canvasRef} width={90} height={90} style={{ width: "100%", height: "100%", display: "block" }} />;
}

// ============================================================================
// INDOOR WORKOUT SCREEN (Exact match to mmmmm.mp4)
// ============================================================================
function IndoorWorkoutScreen({
  sport,
  status,
  elapsed,
  onStart,
  onPause,
  onResume,
  onFinish,
  onDiscard,
  onOpenSportSheet,
  onOpenSensorModal,
  onBack,
  profile
}) {
  const [timeStr, setTimeStr] = useState(() => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const estCalories = Math.round(elapsed * 0.16);

  return (
    <div style={{
      position: "relative",
      width: "100%",
      height: "100%",
      flex: 1,
      background: "#0A0A0A",
      color: "#FFFFFF",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "max(16px, env(safe-area-inset-top, 16px)) 20px max(24px, env(safe-area-inset-bottom, 24px))",
      zIndex: 50,
      fontFamily: "'Space Grotesk', -apple-system, sans-serif"
    }}>
      {/* Top Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={onBack}
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: "rgba(40,40,40,0.8)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#FFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer"
          }}
        >
          <SportIcon icon="chevron_down" size={20} color="#FFF" />
        </button>

        {/* Small elapsed timer at top center */}
        <div style={{
          fontSize: 28,
          fontWeight: 900,
          fontFamily: "'Space Grotesk', monospace",
          letterSpacing: 1,
          color: "#FFFFFF"
        }}>
          {formatTime(elapsed)}
        </div>

        <div style={{ width: 42 }} />
      </div>

      {/* Center Digital Clock (Big Time of Day) */}
      <div style={{ textAlign: "center", margin: "auto 0" }}>
        <div style={{
          fontSize: 54,
          fontWeight: 900,
          fontFamily: "'Space Grotesk', monospace",
          color: "#FFFFFF",
          letterSpacing: -1
        }}>
          {timeStr}
        </div>
        <div style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#8E8E93",
          textTransform: "uppercase",
          letterSpacing: 1,
          marginTop: 6
        }}>
          Time of day
        </div>

        {status === "active" && (
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 24,
            marginTop: 36,
            animation: "stokeFadeIn 0.3s ease"
          }}>
            <div style={{ background: "rgba(30,30,30,0.8)", padding: "12px 18px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ fontSize: 10, color: "#8E8E93", fontWeight: 800 }}>CALORIES</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#3678F5" }}>{estCalories} <span style={{ fontSize: 12 }}>kcal</span></div>
            </div>
            <div style={{ background: "rgba(30,30,30,0.8)", padding: "12px 18px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ fontSize: 10, color: "#8E8E93", fontWeight: 800 }}>HEART RATE</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#30D158" }}>138 <span style={{ fontSize: 12 }}>bpm</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar (Exact layout from mmmmm.mp4) */}
      <div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: "#3A3A3C" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px" }}>
          {/* Sport Selector */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 70 }}>
            <button
              onClick={onOpenSportSheet}
              style={{
                width: 54,
                height: 54,
                borderRadius: "50%",
                background: "#242426",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#3678F5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
            >
              <SportIcon icon={sport.icon} size={24} color="#3678F5" />
            </button>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#FFF", marginTop: 6, textAlign: "center", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {sport.name}
            </span>
          </div>

          {/* Center Start / Pause / Resume Button */}
          {status === "idle" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <button
                onClick={onStart}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #3678F5 0%, #2563EB 100%)",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 0 26px rgba(54, 120, 245, 0.5)"
                }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="#FFFFFF"><polygon points="6 4 20 12 6 20" /></svg>
              </button>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#3678F5", marginTop: 6 }}>
                Start
              </span>
            </div>
          )}

          {status === "active" && (
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <button
                  onClick={onPause}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #3678F5 0%, #2563EB 100%)",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 0 26px rgba(54, 120, 245, 0.5)"
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                </button>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#3678F5", marginTop: 6 }}>
                  Pause
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <button
                  onClick={onFinish}
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: "50%",
                    background: "#3A3A3C",
                    border: "1px solid rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer"
                  }}
                >
                  <span style={{ fontSize: 22 }}>🏁</span>
                </button>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#FFF", marginTop: 6 }}>
                  Finish
                </span>
              </div>
            </div>
          )}

          {status === "paused" && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <button
                  onClick={onResume}
                  style={{
                    width: 66,
                    height: 66,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #3678F5 0%, #2563EB 100%)",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer"
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF"><polygon points="6 4 20 12 6 20" /></svg>
                </button>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#3678F5", marginTop: 6 }}>Resume</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <button
                  onClick={onFinish}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "#3A3A3C",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer"
                  }}
                >
                  <span style={{ fontSize: 20 }}>🏁</span>
                </button>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#FFF", marginTop: 6 }}>Finish</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <button
                  onClick={onDiscard}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "#242426",
                    border: "1px solid #FF453A",
                    color: "#FF453A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: 16
                  }}
                >
                  ✕
                </button>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#FF453A", marginTop: 6 }}>Discard</span>
              </div>
            </div>
          )}

          {/* Add a Sensor Button */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 70 }}>
            <button
              onClick={onOpenSensorModal}
              style={{
                width: 54,
                height: 54,
                borderRadius: "50%",
                background: "#242426",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#EBEBF5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
            >
              <SportIcon icon="sensor" size={24} color="#EBEBF5" />
            </button>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#FFF", marginTop: 6, textAlign: "center" }}>
              Add a sensor
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
