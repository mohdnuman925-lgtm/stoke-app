// ============================================================================
// MAIN RUN SCREEN (Complete Multi-Sport Engine)
// ============================================================================
function RunScreen({
  profile,
  runs = [],
  setRuns = () => {},
  status = "idle",
  elapsed = 0,
  distanceKm = 0,
  setDistanceKm = () => {},
  gpsError = null,
  accuracy = null,
  gpsStatus = "acquiring",
  liveSpeed = 0,
  maxSpeed = 0,
  elevationGain = 0,
  shareCardUrl = null,
  shareStyle = "dark",
  onChangeStyle = () => {},
  pathRef = null,
  handleStart = () => {},
  handlePause = () => {},
  handleResume = () => {},
  handleFinish = () => {},
  handleReset = () => {},
  handleDiscard = () => {},
  liveGpsPos = null,
  runStartTimeRef = null,
  onNavigate = () => {},
  onBack = () => {},
  currentUser = null
}) {
  // Selected Sport State (Persistent)
  const [selectedSportId, setSelectedSportId] = useState(() => {
    if (typeof localStorage !== "undefined") {
      try {
        const saved = localStorage.getItem("stoke_selected_sport");
        if (saved && ALL_SPORTS.some(s => s.id === saved)) return saved;
      } catch (e) {}
    }
    return "run";
  });

  const currentSport = useMemo(() => {
    return ALL_SPORTS.find(s => s.id === selectedSportId) || ALL_SPORTS[0];
  }, [selectedSportId]);

  const handleSelectSport = (sportId) => {
    setSelectedSportId(sportId);
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem("stoke_selected_sport", sportId);
      } catch (e) {}
    }
  };

  // Modals & Sheets State
  const [isSportSheetOpen, setIsSportSheetOpen] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [isSensorModalOpen, setIsSensorModalOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState(null);
  const [activeWorkoutTarget, setActiveWorkoutTarget] = useState(null);
  const [showGpsTooltip, setShowGpsTooltip] = useState(false);

  // Sub-tabs & Stages State
  const [activeSubTab, setActiveSubTab] = useState("tracker"); // "tracker" | "history" | "challenges" | "leaderboard"
  const [runStage, setRunStage] = useState("map_idle"); // "map_idle" | "map_active" | "paused" | "hud_fullscreen" | "summary" | "activity_detail"
  const [historyFilter, setHistoryFilter] = useState("daily");
  const [historySportFilter, setHistorySportFilter] = useState("all");
  const [selectedHistoryActivity, setSelectedHistoryActivity] = useState(null);

  // Map Controls State
  const [mapTileType, setMapTileType] = useState("dark"); // Default Dark Matter!
  const [is3DTilted, setIs3DTilted] = useState(false);
  const [audioCues, setAudioCues] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState("lily");
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Real GPS & Location State
  const [userPos, setUserPos] = useState([28.6139, 77.2090]);
  const [reverseGeoAddress, setReverseGeoAddress] = useState("");
  const [activityTitle, setActivityTitle] = useState(() => getActivityTitleByTime(new Date(), currentSport.id));
  const [summaryActivity, setSummaryActivity] = useState(null);
  const [showToast, setShowToast] = useState(null);
  const [isSavingToDb, setIsSavingToDb] = useState(false);

  // Story Share Card State
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [cardPhoto, setCardPhoto] = useState(null);
  const [generatedCardUrl, setGeneratedCardUrl] = useState(null);
  const lastAnnouncedKmRef = useRef(0);
  const [challenges, setChallenges] = useState(INITIAL_CHALLENGES);
  const [leaderboardFilter, setLeaderboardFilter] = useState("worldwide");

  const activePersona = (typeof GIRL_VOICES !== "undefined" && GIRL_VOICES.length > 0)
    ? (GIRL_VOICES.find((v) => v.id === selectedVoice) || GIRL_VOICES[0])
    : { name: "Lily", startMsg: () => "Workout started. GPS locked.", splitMsg: (km, m, s) => `Kilometer ${km}. Pace: ${m} minutes ${s} seconds.`, pauseMsg: "Workout paused.", resumeMsg: "Resuming workout.", finishMsg: (d) => `Workout finished. Great job!` };

  // Sync userPos directly with real live outdoor GPS position
  useEffect(() => {
    if (liveGpsPos && Array.isArray(liveGpsPos) && liveGpsPos.length === 2 && !isNaN(liveGpsPos[0])) {
      setUserPos(liveGpsPos);
    }
  }, [liveGpsPos]);

  // Reverse geocode real coordinates on load or significant position change
  useEffect(() => {
    if (!liveGpsPos || !Array.isArray(liveGpsPos) || isNaN(liveGpsPos[0])) return;
    const [lat, lng] = liveGpsPos;
    let isCancelled = false;

    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      .then((r) => r.json())
      .then((data) => {
        if (isCancelled) return;
        const addr = data.address || {};
        const neighbourhood = addr.suburb || addr.neighbourhood || addr.residential || addr.road || "";
        const city = addr.city || addr.town || addr.village || addr.state_district || "Local Area";
        const label = neighbourhood ? `${neighbourhood}, ${city}` : city;
        setReverseGeoAddress(label);
      })
      .catch(() => {
        if (!isCancelled) setReverseGeoAddress("Live GPS Location");
      });

    return () => { isCancelled = true; };
  }, [liveGpsPos]);

  // Sync runStage with parent status
  useEffect(() => {
    if (status === "active" && runStage !== "map_active" && runStage !== "hud_fullscreen") {
      setRunStage("map_active");
    } else if (status === "paused" && runStage !== "paused") {
      setRunStage("paused");
    } else if (status === "idle" && runStage !== "map_idle" && runStage !== "summary" && runStage !== "activity_detail") {
      setRunStage("map_idle");
    }
  }, [status]);

  // Real-time calculations
  const liveDist = distanceKm > 0 ? distanceKm : 0;
  const hasValidDistance = liveDist >= 0.02;
  const livePace = (hasValidDistance && elapsed > 0) ? (elapsed / 60 / liveDist) : 0;
  const currentSpeed = liveSpeed > 0 ? liveSpeed : ((hasValidDistance && elapsed > 0) ? (liveDist / (elapsed / 3600)) : 0);
  const metFactor = currentSport.category === "Cycle Sports" ? 0.55 : currentSport.category === "Strength" ? 0.8 : 1.036;
  const liveCalories = Math.round(liveDist * (RUNNER_WEIGHT_KG || 70) * metFactor) || Math.round(elapsed * 0.16);
  const liveElevation = elevationGain || 0;

  // Voice split milestone announcements
  useEffect(() => {
    if (status === "active" && audioCues && distanceKm >= 1) {
      const currentKm = Math.floor(distanceKm);
      if (currentKm > lastAnnouncedKmRef.current) {
        lastAnnouncedKmRef.current = currentKm;
        const paceM = Math.floor(livePace);
        const paceS = Math.round((livePace % 1) * 60);
        const msg = activePersona.splitMsg(currentKm, paceM, paceS, currentSpeed, currentSport.category === "Cycle Sports");
        if (typeof speakAudioCue === "function") speakAudioCue(msg, selectedVoice);
      }
    }
  }, [distanceKm, status, audioCues, livePace, currentSpeed, currentSport, selectedVoice, activePersona]);

  // Action handlers
  const onStartActivity = () => {
    lastAnnouncedKmRef.current = 0;
    setRunStage("map_active");
    if (audioCues && typeof speakAudioCue === "function") {
      speakAudioCue(activePersona.startMsg(currentSport.id), selectedVoice);
    }
    handleStart(currentSport.id);
    const now = new Date();
    setActivityTitle(getActivityTitleByTime(now, currentSport.id));
  };

  const onPauseActivity = () => {
    setRunStage("paused");
    if (audioCues && typeof speakAudioCue === "function") {
      speakAudioCue(activePersona.pauseMsg, selectedVoice);
    }
    handlePause();
  };

  const onResumeActivity = () => {
    setRunStage("map_active");
    if (audioCues && typeof speakAudioCue === "function") {
      speakAudioCue(activePersona.resumeMsg, selectedVoice);
    }
    handleResume();
  };

  const onFinishActivity = () => {
    handleFinish();
    const finalDist = Number(liveDist.toFixed(2));
    const finalElapsed = elapsed > 0 ? elapsed : 1;
    const finalPace = (finalDist >= 0.02 && finalElapsed > 0) ? (finalElapsed / 60 / finalDist) : 0;
    const finalSpeed = (finalElapsed > 0 && finalDist >= 0.02) ? (finalDist / (finalElapsed / 3600)) : 0;
    const finalPath = (pathRef && pathRef.current && pathRef.current.length > 1) ? [...pathRef.current] : [];
    const finalSplits = computeKmSplits(finalPath, finalElapsed);
    const startTime = (runStartTimeRef && runStartTimeRef.current) ? runStartTimeRef.current : new Date();
    const endTime = new Date();
    const actDate = typeof getLocalDateStr === "function" ? getLocalDateStr(startTime) : new Date().toISOString().split("T")[0];
    const defaultTitle = getActivityTitleByTime(startTime, currentSport.id);

    const finishedData = {
      id: generateUuid(),
      user_id: currentUser?.id,
      title: defaultTitle,
      sport: currentSport.id,
      sport_type: currentSport.id,
      distanceKm: finalDist,
      distance: finalDist,
      elapsed: finalElapsed,
      time: finalElapsed,
      duration_seconds: finalElapsed,
      paceMinPerKm: finalPace,
      pace: finalPace,
      average_pace: finalPace,
      speedKmh: Number(finalSpeed.toFixed(1)),
      average_speed: Number(finalSpeed.toFixed(1)),
      maxSpeed: maxSpeed || Number(finalSpeed.toFixed(1)),
      elevationGain: liveElevation,
      calories: liveCalories,
      calories_burned: liveCalories,
      path: finalPath,
      route_coordinates: finalPath,
      splits: finalSplits,
      splits_data: finalSplits,
      date: actDate,
      activity_date: actDate,
      startTime: startTime.toISOString(),
      start_time: startTime.toISOString(),
      endTime: endTime.toISOString(),
      end_time: endTime.toISOString(),
      location: reverseGeoAddress || "Outdoor Track"
    };

    setSummaryActivity(finishedData);
    setActivityTitle(defaultTitle);
    setRunStage("summary");

    if (audioCues && typeof speakAudioCue === "function") {
      speakAudioCue(activePersona.finishMsg(finalDist, Math.round(finalDist * 1250)), selectedVoice);
    }
  };

  const onConfirmDiscard = () => {
    setShowDiscardModal(false);
    handleDiscard();
    setRunStage("map_idle");
  };

  const onSaveActivity = async () => {
    if (!summaryActivity) return;
    setIsSavingToDb(true);

    const finalTitle = activityTitle.trim() || summaryActivity.title;
    const payloadToSave = {
      ...summaryActivity,
      title: finalTitle
    };

    // Prepend to local runs array
    setRuns((prev) => [payloadToSave, ...(prev || [])]);

    // Persist to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem("stoke_runs_v2") || "[]");
      localStorage.setItem("stoke_runs_v2", JSON.stringify([payloadToSave, ...existing]));
    } catch (e) {}

    // Persist to Supabase database
    if (currentUser?.id && typeof dbSaveRunningActivity === "function") {
      try {
        await dbSaveRunningActivity(currentUser.id, payloadToSave);
        if (typeof dbSaveUserXp === "function") {
          const xpGain = Math.min(300, Math.round(50 + (payloadToSave.distanceKm * 20)));
          dbSaveUserXp(currentUser.id, (profile?.xp || 2450) + xpGain);
        }
      } catch (err) {
        console.warn("Supabase save activity error:", err);
      }
    }

    setIsSavingToDb(false);
    setShowToast(`Saved "${finalTitle}" to your activity history!`);
    setTimeout(() => setShowToast(null), 3500);

    setActiveSubTab("history");
    setRunStage("map_idle");
    setSummaryActivity(null);
    if (handleReset) handleReset();
  };

  const handleCompassClick = () => {
    if (userPos && userPos.length === 2) {
      setUserPos([...userPos]);
    }
    setShowToast("Map oriented to North");
    setTimeout(() => setShowToast(null), 2000);
  };

  const toggleLayerStyle = () => {
    setMapTileType((prev) => (prev === "dark" ? "satellite" : prev === "satellite" ? "topo" : prev === "topo" ? "street" : "dark"));
  };

  // Activity History data
  const allActivities = (runs || []).map(normalizeActivity).filter(Boolean);
  const filteredActivities = historySportFilter === "all"
    ? allActivities
    : allActivities.filter((a) => a.sport === historySportFilter);

  const totalHistoryKm = filteredActivities.reduce((s, a) => s + a.distanceKm, 0);
  const totalHistorySeconds = filteredActivities.reduce((s, a) => s + a.elapsed, 0);
  const totalHistoryCalories = filteredActivities.reduce((s, a) => s + a.calories, 0);
  const totalHistoryElevation = filteredActivities.reduce((s, a) => s + a.elevationGain, 0);

  const groupedHistory = React.useMemo(() => {
    const groups = {};
    filteredActivities.forEach((act) => {
      let key = "Earlier";
      const d = new Date(act.startTime || act.date);
      if (historyFilter === "daily") {
        key = act.dateLabel || act.date || "Recent";
      } else if (historyFilter === "weekly") {
        const weekNum = Math.ceil(d.getDate() / 7);
        const monthName = d.toLocaleDateString([], { month: "short" });
        key = `Week ${weekNum} · ${monthName} ${d.getFullYear()}`;
      } else if (historyFilter === "monthly") {
        key = d.toLocaleDateString([], { month: "long", year: "numeric" });
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(act);
    });
    return groups;
  }, [filteredActivities, historyFilter]);

  // If user selected an indoor sport (Weight Training, Workout, HIIT, Crossfit, etc.)
  if (!currentSport.isOutdoor && activeSubTab === "tracker" && runStage !== "summary" && runStage !== "activity_detail") {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 100 }}>
        <IndoorWorkoutScreen
          sport={currentSport}
          status={status}
          elapsed={elapsed}
          onStart={onStartActivity}
          onPause={onPauseActivity}
          onResume={onResumeActivity}
          onFinish={onFinishActivity}
          onDiscard={() => setShowDiscardModal(true)}
          onOpenSportSheet={() => setIsSportSheetOpen(true)}
          onOpenSensorModal={() => setIsSensorModalOpen(true)}
          onBack={onBack}
          profile={profile}
        />
        <ChooseSportSheet
          isOpen={isSportSheetOpen}
          onClose={() => setIsSportSheetOpen(false)}
          selectedSportId={selectedSportId}
          onSelectSport={handleSelectSport}
        />
        <SensorModal
          isOpen={isSensorModalOpen}
          onClose={() => setIsSensorModalOpen(false)}
        />
        {showDiscardModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 20000, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "#1C1C1E", borderRadius: 20, padding: 24, maxWidth: 320, width: "100%", textAlign: "center", border: "1px solid rgba(255,255,255,0.12)" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
              <h3 style={{ margin: "0 0 8px", color: "#FFF", fontSize: 18, fontWeight: 900 }}>Discard Workout?</h3>
              <p style={{ margin: "0 0 20px", color: "#8E8E93", fontSize: 13 }}>Current exercise time and telemetry will be lost.</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowDiscardModal(false)} style={{ flex: 1, padding: "12px 0", borderRadius: 12, background: "#2C2C2E", border: "none", color: "#FFF", fontWeight: 700, cursor: "pointer" }}>Keep</button>
                <button onClick={onConfirmDiscard} style={{ flex: 1, padding: "12px 0", borderRadius: 12, background: "#FF453A", border: "none", color: "#FFF", fontWeight: 800, cursor: "pointer" }}>Discard</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================================================
  // FULL-SCREEN OUTDOOR DARK GPS MAP (Exact match to oooooo.mp4)
  // ==========================================================================
  return (
    <div style={{
      position: "relative",
      width: "100%",
      height: "100%",
      flex: 1,
      zIndex: 50,
      background: "#0E0E0E",
      color: "#FFFFFF",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      fontFamily: "'Space Grotesk', -apple-system, sans-serif"
    }}>
      {/* Toast Notification */}
      {showToast && (
        <div style={{
          position: "fixed",
          top: "max(20px, env(safe-area-inset-top, 20px))",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 99999,
          background: "#1C1C1E",
          color: "#FFFFFF",
          padding: "10px 20px",
          borderRadius: 999,
          fontSize: 13,
          fontWeight: 800,
          boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          border: "1px solid rgba(255,255,255,0.15)",
          animation: "stokeFadeUp 0.3s ease"
        }}>
          <span>✨</span>
          <span>{showToast}</span>
        </div>
      )}

      {/* Discard Confirmation Modal */}
      {showDiscardModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 20000, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#1C1C1E", borderRadius: 20, padding: 24, maxWidth: 320, width: "100%", textAlign: "center", border: "1px solid rgba(255,255,255,0.12)" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ margin: "0 0 8px", color: "#FFF", fontSize: 18, fontWeight: 900 }}>Discard Activity?</h3>
            <p style={{ margin: "0 0 20px", color: "#8E8E93", fontSize: 13 }}>Current route, splits, and recorded distance will be lost.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowDiscardModal(false)} style={{ flex: 1, padding: "12px 0", borderRadius: 12, background: "#2C2C2E", border: "none", color: "#FFF", fontWeight: 700, cursor: "pointer" }}>Keep</button>
              <button onClick={onConfirmDiscard} style={{ flex: 1, padding: "12px 0", borderRadius: 12, background: "#FF453A", border: "none", color: "#FFF", fontWeight: 800, cursor: "pointer" }}>Discard</button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tabs Switcher for History & Challenges (When not in fullscreen HUD) */}
      {activeSubTab !== "tracker" && (
        <div style={{
          position: "relative",
          zIndex: 100,
          background: "#18181A",
          padding: "max(12px, env(safe-area-inset-top, 12px)) 16px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <button
            onClick={() => setActiveSubTab("tracker")}
            style={{
              background: "#242426",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              padding: "6px 14px",
              color: "#FFF",
              fontWeight: 800,
              fontSize: 12.5,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <span>◀</span>
            <span>Live Map</span>
          </button>
          <div style={{ display: "flex", gap: 6 }}>
            {["history", "challenges", "leaderboard"].map(tabKey => (
              <button
                key={tabKey}
                onClick={() => setActiveSubTab(tabKey)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 10,
                  border: "none",
                  background: activeSubTab === tabKey ? "#3678F5" : "transparent",
                  color: activeSubTab === tabKey ? "#FFF" : "#8E8E93",
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                {tabKey.charAt(0).toUpperCase() + tabKey.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 1. TRACKER VIEW (Full-Screen Dark GPS Map) */}
      {/* ==================================================================== */}
      {activeSubTab === "tracker" && runStage !== "summary" && runStage !== "activity_detail" && runStage !== "hud_fullscreen" && (
        <div style={{ position: "relative", flex: 1, width: "100%", height: "100%", overflow: "hidden" }}>
          {/* Full-Screen Dark Leaflet Map */}
          <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1 }}>
            <StokeLiveMap
              path={pathRef && pathRef.current ? [...pathRef.current] : []}
              plannedRoute={activeRoute}
              userPos={userPos}
              is3DTilted={is3DTilted}
              mapTileType={mapTileType}
              runStage={runStage}
              height="100%"
            />
          </div>

          {/* Top Floating Overlay (Back, Workout Banner, Compass) */}
          <div style={{
            position: "absolute",
            top: "max(12px, env(safe-area-inset-top, 12px))",
            left: 14,
            right: 14,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pointerEvents: "none"
          }}>
            {/* Back Chevron Button */}
            <button
              onClick={onBack}
              title="Return to Today"
              style={{
                pointerEvents: "auto",
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "rgba(30, 30, 30, 0.88)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)"
              }}
            >
              <SportIcon icon="chevron_down" size={20} color="#FFFFFF" />
            </button>

            {/* Workout Banner (Matching oooooo.mp4) */}
            <div
              onClick={() => setIsWorkoutModalOpen(true)}
              style={{
                pointerEvents: "auto",
                height: 44,
                background: "rgba(24, 24, 26, 0.90)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: 999,
                padding: "4px 16px 4px 6px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(0,0,0,0.5)"
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3678F5 0%, #2B62D9 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(54, 120, 245, 0.4)"
              }}>
                <SportIcon icon="workout" size={17} color="#FFFFFF" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.2 }}>
                  {activeWorkoutTarget ? activeWorkoutTarget.title : "Try a Stoke workout"}
                </div>
                <div style={{ fontSize: 10.5, color: "#8E8E93", lineHeight: 1.2, marginTop: 1 }}>
                  {activeWorkoutTarget ? activeWorkoutTarget.badge : "Limited preview"}
                </div>
              </div>
            </div>

            {/* Compass Button */}
            <div style={{ display: "flex", gap: 8, pointerEvents: "auto" }}>
              <button
                onClick={handleCompassClick}
                title="Reset Map to North"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: "rgba(30, 30, 30, 0.88)",
                  backdropFilter: "blur(14px)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.4)"
                }}
              >
                <span style={{ fontSize: 9, fontWeight: 900, color: "#FFFFFF", lineHeight: 1 }}>N</span>
                <SportIcon icon="compass" size={16} color="#3678F5" />
              </button>
            </div>
          </div>

          {/* Right Floating Map Controls Stack */}
          <div style={{
            position: "absolute",
            right: 14,
            top: 96,
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            gap: 10
          }}>
            {/* Audio Voice Coach Toggle */}
            <button
              onClick={() => {
                setAudioCues(!audioCues);
                setShowToast(audioCues ? "Audio Cues Muted" : "Voice Coach Active");
                setTimeout(() => setShowToast(null), 2000);
              }}
              title="Voice Coach Audio Cues"
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "rgba(30, 30, 30, 0.88)",
                backdropFilter: "blur(14px)",
                border: `1.5px solid ${audioCues ? "#3678F5" : "rgba(255, 255, 255, 0.12)"}`,
                color: audioCues ? "#3678F5" : "#8E8E93",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)"
              }}
            >
              <SportIcon icon={audioCues ? "speaker" : "speaker_off"} size={19} color={audioCues ? "#3678F5" : "#8E8E93"} />
            </button>

            {/* 3D / Layer Switcher Button */}
            <button
              onClick={() => {
                if (mapTileType === "dark" && !is3DTilted) {
                  setIs3DTilted(true);
                  setShowToast("3D Tilt View");
                } else if (is3DTilted) {
                  setIs3DTilted(false);
                  setMapTileType("satellite");
                  setShowToast("Satellite View");
                } else if (mapTileType === "satellite") {
                  setMapTileType("dark");
                  setShowToast("Dark Map");
                } else {
                  setMapTileType("dark");
                }
                setTimeout(() => setShowToast(null), 2000);
              }}
              title="Map Style &amp; 3D View"
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "rgba(30, 30, 30, 0.88)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: is3DTilted ? "#3678F5" : "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)"
              }}
            >
              <span style={{ fontSize: 9.5, fontWeight: 900, color: is3DTilted ? "#3678F5" : "#FFF", lineHeight: 1 }}>3D</span>
              <SportIcon icon="layers" size={17} color={is3DTilted ? "#3678F5" : "#FFFFFF"} />
            </button>

            {/* Recenter Crosshair Button */}
            <button
              onClick={() => {
                if (userPos && userPos.length === 2) {
                  setUserPos([...userPos]);
                }
                setShowToast("Recentered to GPS");
                setTimeout(() => setShowToast(null), 1500);
              }}
              title="Recenter Map to Live Location"
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "rgba(30, 30, 30, 0.88)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)"
              }}
            >
              <SportIcon icon="crosshair" size={20} color="#FFFFFF" />
            </button>

            {/* History Shortcut Button */}
            <button
              onClick={() => setActiveSubTab("history")}
              title="Past Activities"
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "rgba(30, 30, 30, 0.88)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)"
              }}
            >
              📜
            </button>
          </div>

          {/* Bottom Left Info Button & Tooltip */}
          <div style={{ position: "absolute", left: 14, bottom: 230, zIndex: 100 }}>
            <button
              onClick={() => setShowGpsTooltip(!showGpsTooltip)}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "rgba(30, 30, 30, 0.75)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#8E8E93",
                fontSize: 12,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
            >
              i
            </button>

            {showGpsTooltip && (
              <div style={{
                position: "absolute",
                bottom: 34,
                left: 0,
                background: "rgba(22, 22, 24, 0.95)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: 12,
                padding: "8px 12px",
                width: 200,
                fontSize: 11,
                color: "#EBEBF5",
                boxShadow: "0 6px 20px rgba(0,0,0,0.6)",
                lineHeight: 1.4
              }}>
                <div style={{ color: "#30D158", fontWeight: 800 }}>● Real GPS Satellite Active</div>
                <div>Accuracy: {accuracy ? `±${Math.round(accuracy)}m` : "High"}</div>
                <div style={{ color: "#8E8E93", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  📍 {reverseGeoAddress || "Worldwide GPS"}
                </div>
              </div>
            )}
          </div>

          {/* ================================================================ */}
          {/* FLOATING BOTTOM STATS PANEL (Exact layout from oooooo.mp4) */}
          {/* ================================================================ */}
          <div style={{
            position: "absolute",
            left: 14,
            right: 14,
            bottom: 96,
            zIndex: 100,
            background: "rgba(24, 24, 26, 0.94)",
            backdropFilter: "blur(20px)",
            borderRadius: 20,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "14px 18px 16px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.6)"
          }}>
            {/* Stats Header (Sport Name + Expand Button) */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#FFFFFF", letterSpacing: 0.3 }}>
                {currentSport.name}
              </span>
              <button
                onClick={() => setRunStage("hud_fullscreen")}
                title="Fullscreen HUD"
                style={{
                  background: "none",
                  border: "none",
                  color: "#8E8E93",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "2px"
                }}
              >
                <SportIcon icon="expand" size={17} color="#8E8E93" />
              </button>
            </div>

            {/* 3 Metric Columns: Time | Avg. Pace | Distance */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", textAlign: "center", alignItems: "baseline" }}>
              {/* Column 1: Time */}
              <div style={{ textAlign: "left" }}>
                <div style={{
                  fontSize: 26,
                  fontWeight: 900,
                  fontFamily: "'Space Grotesk', -apple-system, monospace",
                  color: "#FFFFFF",
                  letterSpacing: -0.5
                }}>
                  {formatTime(elapsed)}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", marginTop: 2 }}>
                  Time
                </div>
              </div>

              {/* Column 2: Avg. Pace */}
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: 26,
                  fontWeight: 900,
                  fontFamily: "'Space Grotesk', -apple-system, monospace",
                  color: "#FFFFFF",
                  letterSpacing: -0.5
                }}>
                  {currentSport.category === "Cycle Sports"
                    ? `${currentSpeed.toFixed(1)}`
                    : formatPace(livePace)}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", marginTop: 2 }}>
                  {currentSport.category === "Cycle Sports" ? "Speed (km/h)" : "Avg. pace (/km)"}
                </div>
              </div>

              {/* Column 3: Distance */}
              <div style={{ textAlign: "right" }}>
                <div style={{
                  fontSize: 26,
                  fontWeight: 900,
                  fontFamily: "'Space Grotesk', -apple-system, monospace",
                  color: "#FFFFFF",
                  letterSpacing: -0.5
                }}>
                  {liveDist.toFixed(2)}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", marginTop: 2 }}>
                  Distance (km)
                </div>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* BOTTOM CONTROLS BAR (Sport Selector · Start Button · Add Route) */}
          {/* ================================================================ */}
          <div style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100,
            background: "#0E0E0E",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "10px 24px max(24px, env(safe-area-inset-bottom, 24px))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            {/* Control 1: Run / Sport Selector Button */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 70 }}>
              <button
                onClick={() => setIsSportSheetOpen(true)}
                title="Choose a Sport"
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  background: "#242426",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#3678F5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
                }}
              >
                <SportIcon icon={currentSport.icon} size={24} color="#3678F5" />
              </button>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#FFFFFF", marginTop: 5, textAlign: "center", maxWidth: 75, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentSport.name}
              </span>
            </div>

            {/* Control 2: Large Orange Start / Pause / Resume Button */}
            {status === "idle" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <button
                  onClick={onStartActivity}
                  title="Start Workout"
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
                    boxShadow: "0 0 28px rgba(54, 120, 245, 0.55)"
                  }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="#FFFFFF"><polygon points="6 4 20 12 6 20" /></svg>
                </button>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#3678F5", marginTop: 5 }}>
                  Start
                </span>
              </div>
            )}

            {status === "active" && (
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <button
                    onClick={onPauseActivity}
                    title="Pause Workout"
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
                      boxShadow: "0 0 28px rgba(54, 120, 245, 0.55)"
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                  </button>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#3678F5", marginTop: 5 }}>
                    Pause
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <button
                    onClick={onFinishActivity}
                    title="Finish Workout"
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
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#FFF", marginTop: 5 }}>
                    Finish
                  </span>
                </div>
              </div>
            )}

            {status === "paused" && (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <button
                    onClick={onResumeActivity}
                    title="Resume Workout"
                    style={{
                      width: 66,
                      height: 66,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #3678F5 0%, #2563EB 100%)",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 0 24px rgba(54, 120, 245, 0.5)"
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF"><polygon points="6 4 20 12 6 20" /></svg>
                  </button>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#3678F5", marginTop: 5 }}>Resume</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <button
                    onClick={onFinishActivity}
                    title="Finish Workout"
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
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#FFF", marginTop: 5 }}>Finish</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <button
                    onClick={() => setShowDiscardModal(true)}
                    title="Discard Workout"
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
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#FF453A", marginTop: 5 }}>Discard</span>
                </div>
              </div>
            )}

            {/* Control 3: Add Route Button */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 70 }}>
              <button
                onClick={() => setIsRouteModalOpen(true)}
                title="Routes &amp; Trails"
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  background: activeRoute ? "rgba(0, 229, 255, 0.15)" : "#242426",
                  border: `1px solid ${activeRoute ? "#00E5FF" : "rgba(255, 255, 255, 0.1)"}`,
                  color: activeRoute ? "#00E5FF" : "#EBEBF5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
                }}
              >
                <SportIcon icon="route" size={24} color={activeRoute ? "#00E5FF" : "#EBEBF5"} />
              </button>
              <span style={{ fontSize: 11, fontWeight: 600, color: activeRoute ? "#00E5FF" : "#FFFFFF", marginTop: 5, textAlign: "center", maxWidth: 75, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {activeRoute ? activeRoute.name : "Add Route"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. FULLSCREEN OLED HUD MODE (runStage === "hud_fullscreen") */}
      {/* ==================================================================== */}
      {runStage === "hud_fullscreen" && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          background: "#000000",
          color: "#FFFFFF",
          padding: "max(20px, env(safe-area-inset-top, 20px)) 24px max(24px, env(safe-area-inset-bottom, 24px))",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#3678F5", textTransform: "uppercase" }}>
              ● {currentSport.name} OLED HUD
            </span>
            <button
              onClick={() => setRunStage(status === "active" ? "map_active" : status === "paused" ? "paused" : "map_idle")}
              style={{ background: "#222", border: "1px solid #444", color: "#FFF", padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
            >
              Back to Map
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 30, textAlign: "center", margin: "auto 0" }}>
            <div>
              <div style={{ fontSize: 72, fontWeight: 900, fontFamily: "monospace", letterSpacing: -2 }}>
                {liveDist.toFixed(2)}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase" }}>DISTANCE (KM)</div>
            </div>
            <div>
              <div style={{ fontSize: 64, fontWeight: 900, fontFamily: "monospace", color: "#3678F5", letterSpacing: -2 }}>
                {formatTime(elapsed)}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase" }}>TIME</div>
            </div>
            <div>
              <div style={{ fontSize: 56, fontWeight: 900, fontFamily: "monospace", color: "#FFF", letterSpacing: -1 }}>
                {formatPace(livePace)}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase" }}>AVG PACE (/KM)</div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            {status === "active" ? (
              <button
                onClick={onPauseActivity}
                style={{ width: "100%", padding: "16px 0", borderRadius: 16, background: "#3678F5", border: "none", color: "#FFF", fontSize: 18, fontWeight: 900, cursor: "pointer" }}
              >
                PAUSE
              </button>
            ) : (
              <button
                onClick={onResumeActivity}
                style={{ width: "100%", padding: "16px 0", borderRadius: 16, background: "#3678F5", border: "none", color: "#FFF", fontSize: 18, fontWeight: 900, cursor: "pointer" }}
              >
                RESUME
              </button>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. ACTIVITY FINISH & SAVE SUMMARY (runStage === "summary") */}
      {/* ==================================================================== */}
      {runStage === "summary" && summaryActivity && (
        <div style={{
          flex: 1,
          overflowY: "auto",
          background: "#121214",
          color: "#FFFFFF",
          padding: "max(16px, env(safe-area-inset-top, 16px)) 16px max(30px, env(safe-area-inset-bottom, 30px))"
        }}>
          {/* Header Map */}
          <div style={{ height: 240, borderRadius: 20, overflow: "hidden", marginBottom: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
            <StokeLiveMap
              path={summaryActivity.path || []}
              userPos={summaryActivity.path && summaryActivity.path.length > 0 ? [summaryActivity.path[0].lat, summaryActivity.path[0].lng] : userPos}
              runStage="summary"
              height="100%"
            />
          </div>

          {/* Activity Title Input */}
          <div style={{ background: "#1C1C1E", borderRadius: 18, padding: 18, marginBottom: 14, border: "1px solid rgba(255,255,255,0.08)" }}>
            <label style={{ fontSize: 11, fontWeight: 800, color: "#8E8E93", textTransform: "uppercase" }}>Activity Title</label>
            <input
              type="text"
              value={activityTitle}
              onChange={(e) => setActivityTitle(e.target.value)}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                borderBottom: "1.5px solid #3678F5",
                color: "#FFFFFF",
                fontSize: 18,
                fontWeight: 800,
                padding: "6px 0",
                marginTop: 4,
                outline: "none",
                fontFamily: "inherit"
              }}
            />
            <div style={{ fontSize: 11.5, color: "#8E8E93", marginTop: 8 }}>
              📍 {summaryActivity.location} · {summaryActivity.date}
            </div>
          </div>

          {/* Metrics Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            background: "#1C1C1E",
            borderRadius: 18,
            padding: 16,
            marginBottom: 14,
            border: "1px solid rgba(255,255,255,0.08)"
          }}>
            <div>
              <div style={{ fontSize: 10, color: "#8E8E93", fontWeight: 800 }}>DISTANCE</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#3678F5", fontFamily: "monospace" }}>{summaryActivity.distanceKm.toFixed(2)} km</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#8E8E93", fontWeight: 800 }}>DURATION</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#FFFFFF", fontFamily: "monospace" }}>{formatTime(summaryActivity.elapsed)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#8E8E93", fontWeight: 800 }}>AVG PACE</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#FFFFFF", fontFamily: "monospace" }}>{formatPace(summaryActivity.paceMinPerKm)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#8E8E93", fontWeight: 800 }}>CALORIES</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#FFF", fontFamily: "monospace" }}>{summaryActivity.calories} kcal</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#8E8E93", fontWeight: 800 }}>ELEVATION</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#FFF", fontFamily: "monospace" }}>+{summaryActivity.elevationGain || 0} m</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#8E8E93", fontWeight: 800 }}>MAX SPEED</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#FFF", fontFamily: "monospace" }}>{summaryActivity.maxSpeed || "0.0"} km/h</div>
            </div>
          </div>

          {/* Kilometre Splits Table */}
          {summaryActivity.splits && summaryActivity.splits.length > 0 && (
            <div style={{ background: "#1C1C1E", borderRadius: 18, padding: 16, marginBottom: 18, border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#FFF", marginBottom: 12 }}>Kilometre Splits</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {summaryActivity.splits.map((s, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#242426", padding: "8px 12px", borderRadius: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#FFF" }}>KM {s.km}</span>
                    <span style={{ fontSize: 12, fontWeight: 900, color: "#3678F5", fontFamily: "monospace" }}>{formatPace(s.paceMinPerKm)}</span>
                    <span style={{ fontSize: 11, color: "#8E8E93", fontFamily: "monospace" }}>{formatTime(s.durationSec)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons: Save Activity, Share Card, Return */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={onSaveActivity}
              disabled={isSavingToDb}
              style={{
                width: "100%",
                padding: "16px 0",
                borderRadius: 16,
                background: "linear-gradient(135deg, #3678F5 0%, #2563EB 100%)",
                border: "none",
                color: "#FFFFFF",
                fontWeight: 900,
                fontSize: 16,
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(252, 82, 0, 0.45)"
              }}
            >
              {isSavingToDb ? "SAVING TO SUPABASE..." : "SAVE ACTIVITY"}
            </button>

            <button
              onClick={() => { setSummaryActivity(null); setRunStage("map_idle"); if (handleReset) handleReset(); }}
              style={{
                width: "100%",
                padding: "13px 0",
                borderRadius: 14,
                background: "#242426",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#8E8E93",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer"
              }}
            >
              Discard / Return to Map
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. ACTIVITY HISTORY SUBTAB (activeSubTab === "history") */}
      {/* ==================================================================== */}
      {activeSubTab === "history" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", background: "#0E0E0E" }}>
          {/* History Aggregates */}
          <div style={{
            background: "linear-gradient(135deg, #1C1C1E 0%, #242426 100%)",
            borderRadius: 20,
            padding: 18,
            marginBottom: 16,
            border: "1px solid rgba(255,255,255,0.08)"
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#3678F5", textTransform: "uppercase", letterSpacing: 1 }}>
              LIFETIME ACTIVITIES
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#FFFFFF", fontFamily: "monospace", margin: "4px 0" }}>
              {totalHistoryKm.toFixed(1)} <span style={{ fontSize: 16, color: "#8E8E93" }}>KM TOTAL</span>
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#8E8E93", marginTop: 6 }}>
              <span>⏱️ {formatTime(totalHistorySeconds)}</span>
              <span>🔥 {totalHistoryCalories} kcal</span>
              <span>⛰️ +{totalHistoryElevation}m</span>
            </div>
          </div>

          {/* Activities List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredActivities.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#8E8E93" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🏃</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#FFF" }}>No saved activities yet</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Complete your first run on the Live Map to log miles!</div>
              </div>
            ) : (
              filteredActivities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => { setSelectedHistoryActivity(act); setRunStage("activity_detail"); }}
                  style={{
                    background: "#1C1C1E",
                    borderRadius: 16,
                    padding: 14,
                    border: "1px solid rgba(255,255,255,0.08)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(252,82,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3678F5" }}>
                      <SportIcon icon={act.sport} size={22} color="#3678F5" />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#FFF" }}>{act.title}</div>
                      <div style={{ fontSize: 12, color: "#8E8E93", marginTop: 2 }}>
                        {act.dateLabel || act.date} · {formatTime(act.elapsed)}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 17, fontWeight: 900, color: "#3678F5", fontFamily: "monospace" }}>
                      {act.distanceKm.toFixed(2)} km
                    </div>
                    <div style={{ fontSize: 11, color: "#8E8E93" }}>
                      {formatPace(act.paceMinPerKm)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. CHALLENGES SUBTAB (activeSubTab === "challenges") */}
      {/* ==================================================================== */}
      {activeSubTab === "challenges" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", background: "#0E0E0E" }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#FFF", marginBottom: 14 }}>
            Active Stoke Challenges
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(challenges || []).map((c, i) => (
              <div key={i} style={{ background: "#1C1C1E", borderRadius: 18, padding: 16, border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <span style={{ fontSize: 11, background: "rgba(252,82,0,0.2)", color: "#3678F5", padding: "2px 8px", borderRadius: 6, fontWeight: 800 }}>ACTIVE</span>
                    <h3 style={{ margin: "6px 0 2px", fontSize: 16, fontWeight: 800, color: "#FFF" }}>{c.title}</h3>
                    <p style={{ margin: 0, fontSize: 12, color: "#8E8E93" }}>{c.desc}</p>
                  </div>
                  <span style={{ fontSize: 24 }}>🏆</span>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#8E8E93", fontWeight: 700, marginBottom: 4 }}>
                    <span>Progress: {c.current || 0} / {c.target || 100} km</span>
                    <span>{Math.round(((c.current || 0) / (c.target || 100)) * 100)}%</span>
                  </div>
                  <div style={{ height: 6, background: "#2C2C2E", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min(100, Math.round(((c.current || 0) / (c.target || 100)) * 100))}%`, background: "#3678F5", borderRadius: 999 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 6. LEADERBOARD SUBTAB (activeSubTab === "leaderboard") */}
      {/* ==================================================================== */}
      {activeSubTab === "leaderboard" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", background: "#0E0E0E" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#FFF" }}>Athlete Leaderboard</h2>
            <div style={{ display: "flex", gap: 6 }}>
              {["worldwide", "club"].map(f => (
                <button
                  key={f}
                  onClick={() => setLeaderboardFilter(f)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 8,
                    border: "none",
                    background: leaderboardFilter === f ? "#3678F5" : "#242426",
                    color: "#FFF",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { rank: 1, name: "Marcus Vance", dist: "84.2 km", badge: "🥇", handle: "@vance_runner" },
              { rank: 2, name: "Elena Rostova", dist: "76.5 km", badge: "🥈", handle: "@elena_tri" },
              { rank: 3, name: "David Kim", dist: "68.0 km", badge: "🥉", handle: "@dkim_fit" },
              { rank: 4, name: "Mohd Numan (You)", dist: `${(totalHistoryKm > 0 ? totalHistoryKm : 58.4).toFixed(1)} km`, badge: "⚡", handle: "@mohd_numan", isUser: true },
              { rank: 5, name: "Sophie Dupont", dist: "52.1 km", badge: "🏃", handle: "@sophie_d" }
            ].map(u => (
              <div
                key={u.rank}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderRadius: 14,
                  background: u.isUser ? "rgba(54, 120, 245, 0.15)" : "#1C1C1E",
                  border: `1.5px solid ${u.isUser ? "#3678F5" : "rgba(255,255,255,0.06)"}`
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 900, color: u.isUser ? "#3678F5" : "#8E8E93", minWidth: 20 }}>
                    #{u.rank}
                  </span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: u.isUser ? "#3678F5" : "#FFF" }}>
                      {u.name} {u.badge}
                    </div>
                    <div style={{ fontSize: 11, color: "#8E8E93" }}>{u.handle}</div>
                  </div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 900, color: u.isUser ? "#3678F5" : "#FFF", fontFamily: "monospace" }}>
                  {u.dist}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODALS & BOTTOM SHEETS */}
      {/* ==================================================================== */}
      <ChooseSportSheet
        isOpen={isSportSheetOpen}
        onClose={() => setIsSportSheetOpen(false)}
        selectedSportId={selectedSportId}
        onSelectSport={handleSelectSport}
      />

      <AddRouteModal
        isOpen={isRouteModalOpen}
        onClose={() => setIsRouteModalOpen(false)}
        onSelectRoute={(r) => { setActiveRoute(r); setShowToast(`Loaded "${r.name}" (${r.distanceKm} km)`); setTimeout(() => setShowToast(null), 2500); }}
        activeRouteId={activeRoute?.id}
        onClearRoute={() => { setActiveRoute(null); setShowToast("Route Cleared"); setTimeout(() => setShowToast(null), 1500); }}
      />

      <WorkoutTargetModal
        isOpen={isWorkoutModalOpen}
        onClose={() => setIsWorkoutModalOpen(false)}
        onSelectTarget={(t) => { setActiveWorkoutTarget(t); setShowToast(`Workout Target: ${t.title}`); setTimeout(() => setShowToast(null), 2500); }}
        currentTarget={activeWorkoutTarget}
      />

      <SensorModal
        isOpen={isSensorModalOpen}
        onClose={() => setIsSensorModalOpen(false)}
      />
    </div>
  );
}
