/**
 * STOKE FITNESS APP — BODY GOALS & TRANSFORMATION SCREEN (React Component)
 * Clean, modern light-theme UI:
 * - Goal Setup Wizard & Assessment (Weight management, Muscle building, Stamina, Transformation)
 * - Daily Target Nutrition & Indian Meals with 1-Click "+ Add to Nutrition"
 * - Home & Gym Workout Schedules with YouTube Tutorials
 * - Custom Workout Builder (Swap exercises, skip, log to diary)
 * - Measurement Tracker & Interactive Progress Charts
 * - Private Progress Photos with secure storage & instant deletion
 * - AI Transformation Coach with Injury/Equipment Adjustments & Minor Safety Guardrail
 */

(function (global) {
  "use strict";

  const { useState, useEffect, useMemo, useRef } = React;

  function BodyGoalsScreen({
    profile = {},
    setProfile,
    goals = {},
    totals = {},
    onNavigate,
    onBack,
    currentUser,
    meals = {},
    addItem
  }) {
    // ── ACTIVE SUB-TAB STATE ──
    // 'dashboard' | 'meals' | 'workouts' | 'builder' | 'measurements' | 'coach' | 'assessment'
    const [activeSubTab, setActiveSubTab] = useState("dashboard");
    const [toastMsg, setToastMsg] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [selectedExerciseModal, setSelectedExerciseModal] = useState(null);
    const [swapModalState, setSwapModalState] = useState(null); // { dayIndex, exIndex, currentEx }
    const [showNewLogModal, setShowNewLogModal] = useState(false);
    const [selectedPhotoView, setSelectedPhotoView] = useState(null);

    const triggerToast = (msg) => {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(""), 3200);
    };

    // ── BODY GOALS FORM STATE ──
    const [goalData, setGoalData] = useState(() => {
      if (typeof localStorage !== "undefined") {
        try {
          const saved = localStorage.getItem("stoke_body_goals");
          if (saved) return JSON.parse(saved);
        } catch (e) {}
      }
      return {
        goalType: profile.goalType || "transformation",
        fitnessLevel: "beginner",
        workoutLocation: "home",
        activityLevel: "moderate",
        dietPref: "any",
        age: Number(profile.age) || 21,
        gender: profile.gender || "male",
        startingWeight: Number(profile.weightKg) || 70,
        currentWeight: Number(profile.weightKg) || 70,
        targetWeight: 68,
        heightCm: Number(profile.heightCm) || 167,
        bodyFatPct: 18,
        targetWeeks: 12
      };
    });

    // ── TRANSFORMATION LOGS (Measurements & Photos) ──
    const [logs, setLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(true);

    // Initial Load from Supabase / Local
    useEffect(() => {
      let isMounted = true;
      if (typeof global.dbGetBodyGoals === "function") {
        global.dbGetBodyGoals(currentUser?.id).then(res => {
          if (isMounted && res?.data) {
            setGoalData(prev => ({ ...prev, ...res.data }));
          }
        });
      }
      if (typeof global.dbGetTransformationLogs === "function") {
        global.dbGetTransformationLogs(currentUser?.id).then(res => {
          if (isMounted && Array.isArray(res?.data)) {
            setLogs(res.data);
            setLoadingLogs(false);
          }
        });
      }
      return () => { isMounted = false; };
    }, [currentUser?.id]);

    // ── CALCULATE DYNAMIC PLAN ──
    const plan = useMemo(() => {
      if (typeof global.calculateTransformationPlan === "function") {
        return global.calculateTransformationPlan({
          age: goalData.age,
          gender: goalData.gender,
          weightKg: goalData.currentWeight,
          targetWeightKg: goalData.targetWeight,
          heightCm: goalData.heightCm,
          activityLevel: goalData.activityLevel,
          goalType: goalData.goalType,
          experienceLevel: goalData.fitnessLevel,
          workoutLocation: goalData.workoutLocation
        });
      }
      return null;
    }, [goalData]);

    // Active Goal Metadata
    const goalDef = useMemo(() => {
      return (global.StokeBodyGoalsEngine?.GOAL_TYPES || {})[goalData.goalType] || {
        title: "Body Transformation",
        icon: "🔥",
        color: "#237547",
        bgLight: "rgba(35, 117, 71, 0.08)",
        borderLight: "rgba(35, 117, 71, 0.25)",
        tagline: "Body recomposition & lean tone"
      };
    }, [goalData.goalType]);

    // ── ACTIVE WORKOUT SCHEDULE ──
    const [customSchedule, setCustomSchedule] = useState(() => {
      const loc = goalData.workoutLocation || "home";
      const exp = goalData.fitnessLevel || "beginner";
      const sched = global.GOAL_WORKOUT_SCHEDULES?.[loc]?.[exp] || global.GOAL_WORKOUT_SCHEDULES?.home?.beginner;
      return sched ? JSON.parse(JSON.stringify(sched)) : null;
    });

    // Update schedule when location/experience changes
    useEffect(() => {
      const loc = goalData.workoutLocation || "home";
      const exp = goalData.fitnessLevel || "beginner";
      const sched = global.GOAL_WORKOUT_SCHEDULES?.[loc]?.[exp] || global.GOAL_WORKOUT_SCHEDULES?.home?.beginner;
      if (sched) {
        setCustomSchedule(JSON.parse(JSON.stringify(sched)));
      }
    }, [goalData.workoutLocation, goalData.fitnessLevel]);

    // ── SAVE GOAL CHANGES ──
    const handleSaveGoalData = async (newGoalData) => {
      const payload = { ...goalData, ...newGoalData };
      setGoalData(payload);
      setIsSaving(true);
      if (typeof global.dbSaveBodyGoals === "function") {
        await global.dbSaveBodyGoals(currentUser?.id, payload);
      }
      // Also sync target weight/height to profile
      if (setProfile) {
        setProfile(prev => ({
          ...prev,
          weightKg: payload.currentWeight,
          heightCm: payload.heightCm,
          goalType: payload.goalType
        }));
      }
      setIsSaving(false);
      triggerToast("Body Goals & Plan updated successfully!");
      setActiveSubTab("dashboard");
    };

    // ── ADD MEAL TO NUTRITION DIARY ──
    const handleAddMealToDiary = (meal, slotKey = "lunch") => {
      if (typeof addItem === "function") {
        addItem(slotKey, {
          name: meal.name,
          cals: meal.calories,
          p: meal.protein,
          c: meal.carbs,
          f: meal.fat,
          fiber: meal.fiber || 0,
          portion: meal.portion || "1 serving"
        });
        triggerToast(`Added "${meal.name}" to ${slotKey.toUpperCase()}!`);
      } else {
        triggerToast(`Logged "${meal.name}" (${meal.calories} kcal)`);
      }
    };

    // ── LOG NEW MEASUREMENT & PHOTO ──
    const handleSaveNewMeasurement = async (newRecord) => {
      if (typeof global.dbSaveTransformationLog === "function") {
        const res = await global.dbSaveTransformationLog(currentUser?.id, newRecord);
        if (res?.data) {
          setLogs(prev => [res.data, ...prev.filter(l => l.id !== res.data.id)]);
        }
      } else {
        const localRecord = { ...newRecord, id: "log_" + Date.now(), log_date: new Date().toISOString().split("T")[0] };
        setLogs(prev => [localRecord, ...prev]);
      }
      // Update current weight in goals if entered
      if (newRecord.weight_kg) {
        setGoalData(prev => ({ ...prev, currentWeight: Number(newRecord.weight_kg) }));
      }
      setShowNewLogModal(false);
      triggerToast("Transformation entry recorded!");
    };

    // ── DELETE PROGRESS LOG / PHOTO ──
    const handleDeleteLog = async (logId) => {
      if (!confirm("Are you sure you want to permanently delete this progress record and its photo?")) return;
      if (typeof global.dbDeleteTransformationLog === "function") {
        await global.dbDeleteTransformationLog(currentUser?.id, logId);
      }
      setLogs(prev => prev.filter(l => l.id !== logId));
      if (selectedPhotoView?.id === logId) setSelectedPhotoView(null);
      triggerToast("Progress record permanently deleted.");
    };

    // ── SWAP EXERCISE IN BUILDER ──
    const handleSwapExercise = (newExName) => {
      if (!swapModalState) return;
      const { dayIndex, exIndex } = swapModalState;
      setCustomSchedule(prev => {
        if (!prev || !prev.days || !prev.days[dayIndex]) return prev;
        const next = JSON.parse(JSON.stringify(prev));
        const currentTarget = next.days[dayIndex].exercises[exIndex].target;
        next.days[dayIndex].exercises[exIndex] = {
          name: newExName,
          sets: 3,
          reps: "10-12",
          rest: "60s",
          target: currentTarget
        };
        return next;
      });
      setSwapModalState(null);
      triggerToast(`Swapped for ${newExName}!`);
    };

    // ── SKIP / REMOVE EXERCISE ──
    const handleSkipExercise = (dayIndex, exIndex) => {
      setCustomSchedule(prev => {
        if (!prev || !prev.days || !prev.days[dayIndex]) return prev;
        const next = JSON.parse(JSON.stringify(prev));
        next.days[dayIndex].exercises.splice(exIndex, 1);
        return next;
      });
      triggerToast("Exercise removed from routine.");
    };

    // ── PROGRESS METRICS ──
    const startW = Number(goalData.startingWeight) || Number(profile.weightKg) || 70;
    const currW = Number(goalData.currentWeight) || Number(profile.weightKg) || 70;
    const targW = Number(goalData.targetWeight) || 68;
    const totalToChange = Math.abs(startW - targW);
    const changedSoFar = Math.abs(startW - currW);
    const progressPercent = totalToChange > 0 ? Math.min(100, Math.round((changedSoFar / totalToChange) * 100)) : 100;

    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        paddingBottom: 24,
        fontFamily: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
        color: "#FFFFFF"
      }}>

        {/* ── TOP HEADER & NAVIGATION ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Back"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "var(--surface-primary)",
                  border: "1px solid var(--border-divider)",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 20 }}>{goalDef.icon}</span>
                <h1 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#FFFFFF", letterSpacing: -0.4 }}>
                  Body Goals
                </h1>
              </div>
              <p style={{ margin: 0, fontSize: 11, color: "#94A3B8", fontWeight: 700 }}>
                {goalDef.title} · {goalData.workoutLocation === "home" ? "Home Plan" : "Gym Plan"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveSubTab(activeSubTab === "assessment" ? "dashboard" : "assessment")}
            style={{
              background: activeSubTab === "assessment" ? "#237547" : "var(--surface-primary)",
              color: activeSubTab === "assessment" ? "#FFFFFF" : "#237547",
              border: "1px solid var(--border-divider)",
              borderRadius: 10,
              padding: "7px 12px",
              fontSize: 11.5,
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5
            }}
          >
            <span>⚙️</span>
            <span>{activeSubTab === "assessment" ? "Close Setup" : "Edit Goal"}</span>
          </button>
        </div>

        {/* ── TEEN / MINOR SAFETY BANNER ── */}
        {plan?.isMinor && (
          <div style={{
            background: "rgba(35, 117, 71, 0.08)",
            border: "1.5px solid rgba(35, 117, 71, 0.3)",
            borderRadius: 14,
            padding: "12px 14px",
            display: "flex",
            alignItems: "flex-start",
            gap: 10
          }}>
            <span style={{ fontSize: 18 }}>🛡️</span>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: "#237547" }}>Teen Growth & Health Mode Active</div>
              <div style={{ fontSize: 11.5, color: "#FFFFFF", marginTop: 2, lineHeight: 1.45 }}>
                {plan.safetyNotice}
              </div>
            </div>
          </div>
        )}

        {/* ── SUB-TAB SEGMENTED PILLS ── */}
        <div style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          paddingBottom: 4,
          msOverflowStyle: "none",
          scrollbarWidth: "none"
        }}>
          {[
            { key: "dashboard", label: "Overview", icon: "📊" },
            { key: "meals", label: "Indian Meals", icon: "🥗" },
            { key: "workouts", label: "Workout Plan", icon: "🏋️" },
            { key: "builder", label: "Custom Builder", icon: "🛠️" },
            { key: "measurements", label: "Progress Logs", icon: "📐" },
            { key: "coach", label: "AI Coach", icon: "🤖" }
          ].map(tabItem => {
            const isActive = activeSubTab === tabItem.key;
            return (
              <button
                key={tabItem.key}
                onClick={() => setActiveSubTab(tabItem.key)}
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 999,
                  background: isActive ? "#237547" : "var(--surface-primary)",
                  border: `1px solid ${isActive ? "#237547" : "var(--border-divider)"}`,
                  color: isActive ? "#FFFFFF" : "#94A3B8",
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: isActive ? "0 2px 8px rgba(35, 117, 71, 0.25)" : "0 1px 4px rgba(38, 53, 74, 0.04)",
                  transition: "all 0.15s ease"
                }}
              >
                <span>{tabItem.icon}</span>
                <span>{tabItem.label}</span>
              </button>
            );
          })}
        </div>

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: OVERVIEW / DASHBOARD                                           */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeSubTab === "dashboard" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* HERO GOAL CARD */}
            <div style={{
              background: "linear-gradient(135deg, #FFFFFF 0%, #1A1F2C 100%)",
              border: `1.5px solid ${goalDef.borderLight}`,
              borderRadius: 20,
              padding: "18px",
              boxShadow: "0 4px 20px rgba(38, 53, 74, 0.06)",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    borderRadius: 999,
                    background: goalDef.bgLight,
                    color: goalDef.color,
                    fontSize: 11,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginBottom: 6
                  }}>
                    Active Strategy
                  </span>
                  <h2 style={{ margin: "2px 0 4px", fontSize: 18, fontWeight: 900, color: "#FFFFFF", letterSpacing: -0.3 }}>
                    {goalDef.title}
                  </h2>
                  <p style={{ margin: 0, fontSize: 12, color: "#94A3B8", lineHeight: 1.4 }}>
                    {goalDef.tagline}
                  </p>
                </div>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: goalDef.bgLight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0
                }}>
                  {goalDef.icon}
                </div>
              </div>

              {/* WEIGHT TIMELINE PROGRESS */}
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border-divider)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#94A3B8" }}>
                    Starting: <strong style={{ color: "#FFFFFF" }}>{startW} kg</strong>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: goalDef.color }}>
                    Target: {targW} kg ({plan?.estimatedWeeks || 12} wks)
                  </div>
                </div>
                <div style={{ width: "100%", height: 8, background: "var(--surface-primary)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{
                    width: `${Math.max(5, progressPercent)}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, #237547 0%, ${goalDef.color} 100%)`,
                    borderRadius: 999,
                    transition: "width 0.4s ease"
                  }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "#94A3B8", fontWeight: 700 }}>
                  <span>Current: {currW} kg</span>
                  <span>{progressPercent}% Complete</span>
                </div>
              </div>
            </div>

            {/* DAILY TARGET MACROS TELEMETRY */}
            {plan && (
              <div style={{
                background: "var(--surface-primary)",
                border: "1.5px solid var(--border-divider)",
                borderRadius: 18,
                padding: "16px",
                boxShadow: "0 2px 10px rgba(38, 53, 74, 0.05)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "#FFFFFF" }}>Daily Calorie & Macro Target</div>
                    <div style={{ fontSize: 11, color: "#94A3B8" }}>Calibrated with Mifflin-St Jeor TDEE</div>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 900, color: "#237547" }}>
                    {plan.targetCalories} <span style={{ fontSize: 10, color: "#94A3B8" }}>kcal/day</span>
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                  <div style={{ background: "var(--surface-primary)", padding: "10px 8px", borderRadius: 12, textAlign: "center" }}>
                    <div style={{ fontSize: 9.5, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase" }}>Protein</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#237547", marginTop: 2 }}>{plan.macros.protein}g</div>
                    <div style={{ fontSize: 9, color: "#94A3B8" }}>Muscle Repair</div>
                  </div>
                  <div style={{ background: "var(--surface-primary)", padding: "10px 8px", borderRadius: 12, textAlign: "center" }}>
                    <div style={{ fontSize: 9.5, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase" }}>Carbs</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#21865B", marginTop: 2 }}>{plan.macros.carbs}g</div>
                    <div style={{ fontSize: 9, color: "#94A3B8" }}>Clean Energy</div>
                  </div>
                  <div style={{ background: "var(--surface-primary)", padding: "10px 8px", borderRadius: 12, textAlign: "center" }}>
                    <div style={{ fontSize: 9.5, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase" }}>Fat</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#F59E0B", marginTop: 2 }}>{plan.macros.fat}g</div>
                    <div style={{ fontSize: 9, color: "#94A3B8" }}>Hormones</div>
                  </div>
                  <div style={{ background: "var(--surface-primary)", padding: "10px 8px", borderRadius: 12, textAlign: "center" }}>
                    <div style={{ fontSize: 9.5, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase" }}>Water</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#06B6D4", marginTop: 2 }}>{plan.macros.water}L</div>
                    <div style={{ fontSize: 9, color: "#94A3B8" }}>Hydration</div>
                  </div>
                </div>
              </div>
            )}

            {/* QUICK ACTIONS ROW */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button
                onClick={() => setActiveSubTab("meals")}
                style={{
                  background: "var(--surface-primary)",
                  border: "1.5px solid var(--border-divider)",
                  borderRadius: 14,
                  padding: "14px",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4
                }}
              >
                <span style={{ fontSize: 20 }}>🍛</span>
                <span style={{ fontSize: 13, fontWeight: 900, color: "#FFFFFF" }}>Today's Indian Meals</span>
                <span style={{ fontSize: 11, color: "#94A3B8" }}>Dosa, dal, paneer, eggs & rice plans</span>
              </button>

              <button
                onClick={() => setActiveSubTab("workouts")}
                style={{
                  background: "var(--surface-primary)",
                  border: "1.5px solid var(--border-divider)",
                  borderRadius: 14,
                  padding: "14px",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4
                }}
              >
                <span style={{ fontSize: 20 }}>🏋️</span>
                <span style={{ fontSize: 13, fontWeight: 900, color: "#FFFFFF" }}>Workout Schedule</span>
                <span style={{ fontSize: 11, color: "#94A3B8" }}>{goalData.workoutLocation === "home" ? "Home Routines" : "Gym Routines"} with video cues</span>
              </button>
            </div>

            {/* RECENT TRANSFORMATION LOG PREVIEW */}
            <div style={{
              background: "var(--surface-primary)",
              border: "1.5px solid var(--border-divider)",
              borderRadius: 18,
              padding: "16px",
              boxShadow: "0 2px 10px rgba(38, 53, 74, 0.05)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#FFFFFF" }}>Recent Measurement Progress</div>
                  <div style={{ fontSize: 11, color: "#94A3B8" }}>{logs.length} logged checkpoints</div>
                </div>
                <button
                  onClick={() => setShowNewLogModal(true)}
                  style={{
                    background: "linear-gradient(135deg, #237547 0%, #1B5E36 100%)",
                    border: "none",
                    borderRadius: 8,
                    color: "#FFFFFF",
                    padding: "6px 12px",
                    fontSize: 11.5,
                    fontWeight: 800,
                    cursor: "pointer"
                  }}
                >
                  + Log Today
                </button>
              </div>

              {logs.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {logs.slice(0, 3).map((l, lIdx) => (
                    <div key={l.id || lIdx} style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      background: "#1A1F2C",
                      border: "1px solid var(--border-divider)",
                      borderRadius: 10
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 13 }}>📅</span>
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 800, color: "#FFFFFF" }}>{l.log_date}</div>
                          <div style={{ fontSize: 11, color: "#94A3B8" }}>
                            {l.waist_cm ? `Waist: ${l.waist_cm}cm` : ""} {l.chest_cm ? `· Chest: ${l.chest_cm}cm` : ""}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 14, fontWeight: 900, color: "#237547" }}>
                          {l.weight_kg ? `${l.weight_kg} kg` : "—"}
                        </span>
                        {l.photo_url && (
                          <div style={{ fontSize: 10, color: "#21865B", fontWeight: 800 }}>📷 Private Photo</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "16px 0", color: "#94A3B8", fontSize: 12 }}>
                  No measurements logged yet. Tap <strong>+ Log Today</strong> to record your first milestone!
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: BALANCED INDIAN MEALS                                          */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeSubTab === "meals" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Header info */}
            <div style={{
              background: "var(--surface-primary)",
              border: "1px solid var(--border-divider)",
              borderRadius: 14,
              padding: "12px 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#FFFFFF" }}>Verified Indian Nutrition Plan</div>
                <div style={{ fontSize: 11, color: "#94A3B8" }}>Balanced with dosa, dal, roti, rice, eggs & paneer</div>
              </div>
              <button
                onClick={() => {
                  if (onNavigate) onNavigate("nutrition");
                  else triggerToast("Open Nutrition tab to scan meals");
                }}
                style={{
                  background: "#237547",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                📷 AI Meal Scanner
              </button>
            </div>

            {/* MEAL SECTIONS: Breakfast, Lunch, Snack, Dinner */}
            {["breakfast", "lunch", "snack", "dinner"].map(slot => {
              const mealList = (global.INDIAN_MEAL_SUGGESTIONS || {})[slot] || [];
              const slotTitle = slot.charAt(0).toUpperCase() + slot.slice(1);
              return (
                <div key={slot} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "4px 0 2px" }}>
                    <span style={{ fontSize: 16 }}>
                      {slot === "breakfast" ? "🥞" : slot === "lunch" ? "🍛" : slot === "snack" ? "🥜" : "🍲"}
                    </span>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: "#FFFFFF" }}>
                      {slotTitle} Suggestions
                    </h3>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {mealList.map(meal => (
                      <div key={meal.id} style={{
                        background: "var(--surface-primary)",
                        border: "1.5px solid var(--border-divider)",
                        borderRadius: 16,
                        padding: "14px",
                        boxShadow: "0 2px 8px rgba(38, 53, 74, 0.04)"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ fontSize: 14.5, fontWeight: 900, color: "#FFFFFF" }}>{meal.name}</div>
                            <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{meal.portion}</div>
                          </div>
                          <span style={{ fontSize: 15, fontWeight: 900, color: "#237547" }}>
                            {meal.calories} kcal
                          </span>
                        </div>

                        {/* Macro badges */}
                        <div style={{ display: "flex", gap: 6, margin: "8px 0 10px", flexWrap: "wrap" }}>
                          <span style={{ background: "rgba(35, 117, 71, 0.12)", color: "#237547", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800 }}>P: {meal.protein}g</span>
                          <span style={{ background: "rgba(33, 134, 91, 0.12)", color: "#21865B", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800 }}>C: {meal.carbs}g</span>
                          <span style={{ background: "rgba(245, 158, 11, 0.12)", color: "#F59E0B", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800 }}>F: {meal.fat}g</span>
                          <span style={{ background: "var(--surface-primary)", color: "#94A3B8", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800 }}>Fibre: {meal.fiber}g</span>
                        </div>

                        {/* Ingredients list */}
                        <div style={{ fontSize: 11.5, color: "#475569", lineHeight: 1.45, marginBottom: 10 }}>
                          <strong style={{ color: "#FFFFFF" }}>Ingredients: </strong>
                          {meal.ingredients.join(" · ")}
                        </div>

                        {/* Swaps & Action button */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid var(--border-divider)" }}>
                          <div style={{ fontSize: 10.5, color: "#94A3B8", maxWidth: "60%" }}>
                            💡 {meal.swaps}
                          </div>
                          <button
                            onClick={() => handleAddMealToDiary(meal, slot)}
                            style={{
                              background: "linear-gradient(135deg, #237547 0%, #1B5E36 100%)",
                              color: "#FFFFFF",
                              border: "none",
                              borderRadius: 8,
                              padding: "6px 12px",
                              fontSize: 11.5,
                              fontWeight: 800,
                              cursor: "pointer",
                              boxShadow: "0 2px 8px rgba(35, 117, 71, 0.25)"
                            }}
                          >
                            + Add to Nutrition
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: WORKOUT SCHEDULE WITH YOUTUBE LINKS                            */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeSubTab === "workouts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{
              background: "var(--surface-primary)",
              border: "1px solid var(--border-divider)",
              borderRadius: 14,
              padding: "12px 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#FFFFFF" }}>
                  {customSchedule?.title || "Workout Schedule"}
                </div>
                <div style={{ fontSize: 11, color: "#94A3B8" }}>
                  {goalData.workoutLocation === "home" ? "🏠 Home Protocol" : "🏋️ Gym Protocol"} · {customSchedule?.daysPerWeek || 3} days/week
                </div>
              </div>
              <button
                onClick={() => setActiveSubTab("builder")}
                style={{
                  background: "var(--surface-primary)",
                  border: "1px solid #237547",
                  color: "#237547",
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                🛠️ Customize Days
              </button>
            </div>

            {/* WORKOUT DAYS ACCORDION / LIST */}
            {customSchedule?.days?.map((day, dIdx) => (
              <div key={dIdx} style={{
                background: "var(--surface-primary)",
                border: "1.5px solid var(--border-divider)",
                borderRadius: 16,
                padding: "14px",
                boxShadow: "0 2px 8px rgba(38, 53, 74, 0.04)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 900, color: "#FFFFFF" }}>{day.dayName}</h3>
                    <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{day.focus} · ⏱️ {day.duration}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#237547", background: "var(--surface-primary)", padding: "3px 8px", borderRadius: 6 }}>
                    {day.exercises.length} Exercises
                  </span>
                </div>

                {/* Exercises list */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {day.exercises.map((ex, exIdx) => {
                    const enriched = global.enrichExerciseWithTutorial ? global.enrichExerciseWithTutorial(ex) : ex;
                    return (
                      <div key={exIdx} style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 10px",
                        background: "#1A1F2C",
                        border: "1px solid var(--border-divider)",
                        borderRadius: 10
                      }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#FFFFFF" }}>{enriched.name}</div>
                          <div style={{ fontSize: 11, color: "#94A3B8" }}>
                            {enriched.sets} sets × {enriched.reps} (Rest: {enriched.rest}) · <span style={{ color: "#237547", fontWeight: 700 }}>{enriched.target}</span>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {enriched.youtubeUrl ? (
                            <a
                              href={enriched.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                background: "#FF0000",
                                color: "#FFFFFF",
                                textDecoration: "none",
                                fontSize: 10.5,
                                fontWeight: 800,
                                padding: "4px 8px",
                                borderRadius: 6
                              }}
                              title="Watch YouTube Tutorial"
                            >
                              <span>▶</span> YouTube
                            </a>
                          ) : (
                            <button
                              onClick={() => setSelectedExerciseModal(enriched)}
                              style={{
                                background: "var(--surface-primary)",
                                border: "1px solid var(--border-divider)",
                                color: "#237547",
                                fontSize: 10.5,
                                fontWeight: 800,
                                padding: "4px 8px",
                                borderRadius: 6,
                                cursor: "pointer"
                              }}
                            >
                              Instructions
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button
                    onClick={() => {
                      if (onNavigate) onNavigate("workout");
                      else triggerToast(`Starting "${day.dayName}"!`);
                    }}
                    style={{
                      flex: 1,
                      background: "linear-gradient(135deg, #237547 0%, #1B5E36 100%)",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: 10,
                      padding: "8px 0",
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(35, 117, 71, 0.25)"
                    }}
                  >
                    Start Workout
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: CUSTOM WORKOUT BUILDER (Swap & Skip)                          */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeSubTab === "builder" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{
              background: "var(--surface-primary)",
              border: "1px solid var(--border-divider)",
              borderRadius: 14,
              padding: "12px 14px"
            }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#FFFFFF" }}>Interactive Workout Builder</div>
              <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
                Customize exercises for home or gym equipment. Tap <strong>Swap</strong> to substitute exercises or <strong>Skip</strong> to remove.
              </div>
            </div>

            {customSchedule?.days?.map((day, dIdx) => (
              <div key={dIdx} style={{
                background: "var(--surface-primary)",
                border: "1.5px solid var(--border-divider)",
                borderRadius: 16,
                padding: "14px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 900, color: "#FFFFFF" }}>{day.dayName}</h3>
                  <span style={{ fontSize: 11, color: "#94A3B8" }}>{day.exercises.length} exercises</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {day.exercises.map((ex, exIdx) => (
                    <div key={exIdx} style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      background: "#1A1F2C",
                      border: "1px solid var(--border-divider)",
                      borderRadius: 10
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#FFFFFF" }}>{ex.name}</div>
                        <div style={{ fontSize: 11, color: "#94A3B8" }}>
                          {ex.sets} sets × {ex.reps} · <span style={{ color: "#237547" }}>{ex.target}</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => setSwapModalState({ dayIndex: dIdx, exIndex: exIdx, currentEx: ex })}
                          style={{
                            background: "var(--surface-primary)",
                            border: "1px solid var(--border-divider)",
                            color: "#237547",
                            borderRadius: 6,
                            padding: "4px 8px",
                            fontSize: 10.5,
                            fontWeight: 800,
                            cursor: "pointer"
                          }}
                        >
                          🔄 Swap
                        </button>
                        <button
                          onClick={() => handleSkipExercise(dIdx, exIdx)}
                          style={{
                            background: "none",
                            border: "1px solid var(--border-divider)",
                            color: "#EF4444",
                            borderRadius: 6,
                            padding: "4px 8px",
                            fontSize: 10.5,
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          ✕ Skip
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 5: MEASUREMENTS, CHARTS & PRIVATE PHOTOS                         */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeSubTab === "measurements" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Header with + Log button */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "#FFFFFF" }}>Measurements & Milestones</h2>
                <div style={{ fontSize: 11, color: "#94A3B8" }}>Tracking healthy habits, non-scale victories & strength</div>
              </div>
              <button
                onClick={() => setShowNewLogModal(true)}
                style={{
                  background: "linear-gradient(135deg, #237547 0%, #1B5E36 100%)",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 10,
                  padding: "8px 14px",
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(35, 117, 71, 0.25)"
                }}
              >
                + Add Entry
              </button>
            </div>

            {/* WEIGHT PROGRESS CHART (Visual SVG Line) */}
            <div style={{
              background: "var(--surface-primary)",
              border: "1.5px solid var(--border-divider)",
              borderRadius: 18,
              padding: "16px",
              boxShadow: "0 2px 10px rgba(38, 53, 74, 0.05)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 900, color: "#FFFFFF" }}>Weight Trend Curve</div>
                  <div style={{ fontSize: 11, color: "#94A3B8" }}>Target: {targW} kg</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 900, color: "#237547" }}>
                  {currW} kg <span style={{ fontSize: 10, color: "#94A3B8" }}>current</span>
                </div>
              </div>

              {/* SVG Trendline */}
              <div style={{ width: "100%", height: 110, position: "relative" }}>
                <svg width="100%" height="100%" viewBox="0 0 300 90" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#237547" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#237547" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid guidelines */}
                  <line x1="0" y1="20" x2="300" y2="20" stroke="var(--surface-primary)" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="0" y1="50" x2="300" y2="50" stroke="var(--surface-primary)" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="0" y1="80" x2="300" y2="80" stroke="var(--surface-primary)" strokeWidth="1" strokeDasharray="3 3" />
                  {/* Area fill */}
                  <path d="M 0 65 L 50 60 L 100 52 L 150 48 L 200 42 L 250 38 L 300 32 L 300 90 L 0 90 Z" fill="url(#chartGrad)" />
                  {/* Trend line */}
                  <polyline
                    fill="none"
                    stroke="#237547"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="0,65 50,60 100,52 150,48 200,42 250,38 300,32"
                  />
                  {/* Data points */}
                  <circle cx="0" cy="65" r="3.5" fill="#237547" />
                  <circle cx="100" cy="52" r="3.5" fill="#237547" />
                  <circle cx="200" cy="42" r="3.5" fill="#237547" />
                  <circle cx="300" cy="32" r="4.5" fill="#21865B" stroke="#FFFFFF" strokeWidth="1.5" />
                </svg>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94A3B8", fontWeight: 700, marginTop: 4 }}>
                <span>Start ({startW} kg)</span>
                <span>Week 4</span>
                <span>Week 8</span>
                <span>Today ({currW} kg)</span>
              </div>
            </div>

            {/* HEALTHY HABITS CELEBRATION BADGES */}
            <div style={{
              background: "var(--surface-primary)",
              border: "1.5px solid var(--border-divider)",
              borderRadius: 18,
              padding: "14px",
              boxShadow: "0 2px 10px rgba(38, 53, 74, 0.05)"
            }}>
              <div style={{ fontSize: 13.5, fontWeight: 900, color: "#FFFFFF", marginBottom: 8 }}>
                🏆 Healthy Habit Streaks & Non-Scale Victories
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div style={{ background: "#1A1F2C", border: "1px solid var(--border-divider)", borderRadius: 10, padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>💧</span>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 800, color: "#FFFFFF" }}>Hydration Hero</div>
                    <div style={{ fontSize: 10, color: "#21865B" }}>7-Day Water Goal Hit</div>
                  </div>
                </div>
                <div style={{ background: "#1A1F2C", border: "1px solid var(--border-divider)", borderRadius: 10, padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>🥗</span>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 800, color: "#FFFFFF" }}>Protein Champion</div>
                    <div style={{ fontSize: 10, color: "#237547" }}>Consistent Whole Foods</div>
                  </div>
                </div>
                <div style={{ background: "#1A1F2C", border: "1px solid var(--border-divider)", borderRadius: 10, padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>⚡</span>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 800, color: "#FFFFFF" }}>Consistency King</div>
                    <div style={{ fontSize: 10, color: "#F59E0B" }}>12 Workouts Completed</div>
                  </div>
                </div>
                <div style={{ background: "#1A1F2C", border: "1px solid var(--border-divider)", borderRadius: 10, padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>🔋</span>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 800, color: "#FFFFFF" }}>Recovery Master</div>
                    <div style={{ fontSize: 10, color: "#8B5CF6" }}>7.5h Sleep Maintained</div>
                  </div>
                </div>
              </div>
            </div>

            {/* DETAILED LOG HISTORY WITH PHOTOS & PERMANENT DELETE */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#FFFFFF" }}>All Checkpoint Logs ({logs.length})</div>
              {logs.map(log => (
                <div key={log.id} style={{
                  background: "var(--surface-primary)",
                  border: "1.5px solid var(--border-divider)",
                  borderRadius: 14,
                  padding: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 900, color: "#FFFFFF" }}>{log.log_date}</div>
                      <div style={{ fontSize: 11.5, color: "#94A3B8", marginTop: 2 }}>
                        {log.weight_kg && <strong>{log.weight_kg} kg · </strong>}
                        {log.waist_cm && <span>Waist: {log.waist_cm}cm · </span>}
                        {log.chest_cm && <span>Chest: {log.chest_cm}cm</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#94A3B8",
                        fontSize: 12,
                        cursor: "pointer",
                        padding: "2px 6px"
                      }}
                      title="Permanently Delete Entry"
                    >
                      🗑️
                    </button>
                  </div>

                  {log.notes && (
                    <div style={{ fontSize: 12, color: "#475569", background: "#1A1F2C", padding: "6px 8px", borderRadius: 8, lineHeight: 1.4 }}>
                      "{log.notes}"
                    </div>
                  )}

                  {/* Private progress photo thumbnail */}
                  {log.photo_url && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                      <img
                        src={log.photo_url}
                        alt="Progress checkpoint"
                        style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", border: "1px solid var(--border-divider)", cursor: "pointer" }}
                        onClick={() => setSelectedPhotoView(log)}
                      />
                      <div style={{ fontSize: 11, color: "#94A3B8" }}>
                        <span style={{ color: "#21865B", fontWeight: 700 }}>🔒 Private photo stored.</span> Tap image to view or delete.
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 6: AI TRANSFORMATION COACH WIDGET                                 */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeSubTab === "coach" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{
              background: "linear-gradient(135deg, #FFFFFF 0%, var(--surface-primary) 100%)",
              border: "1.5px solid rgba(35, 117, 71, 0.3)",
              borderRadius: 18,
              padding: "16px",
              boxShadow: "0 2px 10px rgba(35, 117, 71, 0.08)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>🤖</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: "#FFFFFF" }}>AI Transformation Coach</h3>
                  <div style={{ fontSize: 11, color: "#94A3B8" }}>Daily scientific guidance & intelligent swaps</div>
                </div>
              </div>

              <div style={{ fontSize: 13, color: "#FFFFFF", lineHeight: 1.5, background: "var(--surface-primary)", padding: "12px", borderRadius: 12, border: "1px solid var(--border-divider)" }}>
                <strong>Coach Strategy for Today:</strong>
                <p style={{ margin: "6px 0 0", color: "#475569" }}>
                  You are targeting <strong>{plan?.targetCalories || 2200} kcal</strong> and <strong>{plan?.macros?.protein || 140}g protein</strong> for your <em>{goalDef.title}</em> goal. Focus on progressive overload with controlled tempos. If sore, prioritize 3.0L water and yellow moong dal chilla.
                </p>
              </div>
            </div>

            {/* COMMON MEAL SWAPS */}
            <div style={{
              background: "var(--surface-primary)",
              border: "1.5px solid var(--border-divider)",
              borderRadius: 16,
              padding: "16px"
            }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#FFFFFF", marginBottom: 8 }}>
                🔄 Instant Meal & Macro Swaps
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { from: "White Rice (1 cup)", to: "Steamed Brown Rice or Quinoa", reason: "Adds +4g fibre and steady low-glycemic insulin release." },
                  { from: "Paneer (150g)", to: "Firm Soya Chunks or Tofu", reason: "Doubles protein density while lowering saturated fat for clean calorie deficit." },
                  { from: "Egg Whites (3)", to: "Sprouted Moong Salad (1 cup)", reason: "100% vegetarian alternative with natural live enzymes." },
                  { from: "Heavy Ghee Paratha", to: "Tawa Phulka with Mustard Oil Spray", reason: "Saves ~180 kcal per meal without losing satiety." }
                ].map((s, sIdx) => (
                  <div key={sIdx} style={{ background: "#1A1F2C", border: "1px solid var(--border-divider)", borderRadius: 10, padding: "8px 10px" }}>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: "#FFFFFF" }}>
                      {s.from} ➔ <span style={{ color: "#237547" }}>{s.to}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{s.reason}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* INJURY & EQUIPMENT ADJUSTMENTS */}
            <div style={{
              background: "var(--surface-primary)",
              border: "1.5px solid var(--border-divider)",
              borderRadius: 16,
              padding: "16px"
            }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#FFFFFF", marginBottom: 8 }}>
                🩹 Equipment & Joint Comfort Swaps
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { issue: "Knee discomfort on Barbell Squats", fix: "Switch to Box Squats or Glute Bridges to shift load to hips." },
                  { issue: "Shoulder pinch on Flat Bench", fix: "Switch to Incline Dumbbell Press (30°) with neutral palms." },
                  { issue: "No weights at home", fix: "Use backpack loaded with books or water bottles for progressive resistance." }
                ].map((adj, aIdx) => (
                  <div key={aIdx} style={{ background: "#1A1F2C", border: "1px solid var(--border-divider)", borderRadius: 10, padding: "8px 10px" }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#D14343" }}>⚠️ {adj.issue}</div>
                    <div style={{ fontSize: 11.5, color: "#21865B", fontWeight: 700, marginTop: 2 }}>✅ {adj.fix}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 7: GOAL ASSESSMENT & QUESTIONNAIRE WIZARD                          */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeSubTab === "assessment" && (
          <div style={{
            background: "var(--surface-primary)",
            border: "1.5px solid var(--border-divider)",
            borderRadius: 20,
            padding: "18px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            boxShadow: "0 4px 20px rgba(38, 53, 74, 0.08)"
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: "#FFFFFF" }}>Goal Setup & Assessment</h2>
              <div style={{ fontSize: 11.5, color: "#94A3B8", marginTop: 2 }}>
                Update your physical profile to regenerate personalized Indian meals and workout schedules.
              </div>
            </div>

            {/* 1. SELECT GOAL TYPE */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#FFFFFF", display: "block", marginBottom: 6 }}>
                Choose Your Primary Goal:
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {Object.values(global.StokeBodyGoalsEngine?.GOAL_TYPES || {}).map(g => {
                  const isSel = goalData.goalType === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGoalData(prev => ({ ...prev, goalType: g.id }))}
                      style={{
                        padding: "10px",
                        borderRadius: 12,
                        background: isSel ? g.bgLight : "#1A1F2C",
                        border: `1.5px solid ${isSel ? g.color : "var(--border-divider)"}`,
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{g.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 900, color: isSel ? g.color : "#FFFFFF" }}>{g.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. WORKOUT LOCATION & FITNESS LEVEL */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 800, color: "#FFFFFF", display: "block", marginBottom: 4 }}>
                  Workout Location:
                </label>
                <select
                  value={goalData.workoutLocation}
                  onChange={e => setGoalData(prev => ({ ...prev, workoutLocation: e.target.value }))}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border-divider)", background: "#1A1F2C", color: "#FFFFFF", fontSize: 12.5, fontWeight: 700 }}
                >
                  <option value="home">🏠 Home (Bodyweight/Bands)</option>
                  <option value="gym">🏋️ Gym (Barbells/Machines)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 800, color: "#FFFFFF", display: "block", marginBottom: 4 }}>
                  Experience Level:
                </label>
                <select
                  value={goalData.fitnessLevel}
                  onChange={e => setGoalData(prev => ({ ...prev, fitnessLevel: e.target.value }))}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border-divider)", background: "#1A1F2C", color: "#FFFFFF", fontSize: 12.5, fontWeight: 700 }}
                >
                  <option value="beginner">Beginner (&lt; 6 months)</option>
                  <option value="intermediate">Intermediate (6–24 mos)</option>
                  <option value="advanced">Advanced (2+ years)</option>
                </select>
              </div>
            </div>

            {/* 3. PHYSICAL METRICS (Age, Weight, Target Weight, Height) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 800, color: "#FFFFFF", display: "block", marginBottom: 4 }}>
                  Age:
                </label>
                <input
                  type="number"
                  value={goalData.age}
                  onChange={e => setGoalData(prev => ({ ...prev, age: Number(e.target.value) }))}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border-divider)", background: "#1A1F2C", color: "#FFFFFF", fontSize: 13, fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 800, color: "#FFFFFF", display: "block", marginBottom: 4 }}>
                  Height (cm):
                </label>
                <input
                  type="number"
                  value={goalData.heightCm}
                  onChange={e => setGoalData(prev => ({ ...prev, heightCm: Number(e.target.value) }))}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border-divider)", background: "#1A1F2C", color: "#FFFFFF", fontSize: 13, fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 800, color: "#FFFFFF", display: "block", marginBottom: 4 }}>
                  Current Weight (kg):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={goalData.currentWeight}
                  onChange={e => setGoalData(prev => ({ ...prev, currentWeight: Number(e.target.value) }))}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border-divider)", background: "#1A1F2C", color: "#FFFFFF", fontSize: 13, fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 800, color: "#FFFFFF", display: "block", marginBottom: 4 }}>
                  Target Weight (kg):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={goalData.targetWeight}
                  onChange={e => setGoalData(prev => ({ ...prev, targetWeight: Number(e.target.value) }))}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border-divider)", background: "#1A1F2C", color: "#FFFFFF", fontSize: 13, fontWeight: 700 }}
                />
              </div>
            </div>

            {/* 4. ACTIVITY MULTIPLIER */}
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 800, color: "#FFFFFF", display: "block", marginBottom: 4 }}>
                Daily Activity Level:
              </label>
              <select
                value={goalData.activityLevel}
                onChange={e => setGoalData(prev => ({ ...prev, activityLevel: e.target.value }))}
                style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border-divider)", background: "#1A1F2C", color: "#FFFFFF", fontSize: 12.5, fontWeight: 700 }}
              >
                <option value="sedentary">Sedentary (Desk work, little exercise)</option>
                <option value="light">Lightly Active (1–3 walks/workouts a week)</option>
                <option value="moderate">Moderately Active (3–5 workouts a week)</option>
                <option value="very_active">Very Active (6–7 heavy workouts a week)</option>
                <option value="athlete">Athlete (Intense training / Physical job)</option>
              </select>
            </div>

            {/* SAVE BUTTON */}
            <button
              onClick={() => handleSaveGoalData(goalData)}
              disabled={isSaving}
              style={{
                background: "linear-gradient(135deg, #237547 0%, #1B5E36 100%)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 12,
                padding: "12px 0",
                fontSize: 14,
                fontWeight: 900,
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(35, 117, 71, 0.3)"
              }}
            >
              {isSaving ? "Saving to Supabase..." : "Save Goal & Generate AI Plan"}
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* MODAL: SWAP EXERCISE SELECTOR                                         */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {swapModalState && (
          <div style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(38, 53, 74, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16
          }}>
            <div style={{
              background: "var(--surface-primary)",
              borderRadius: 20,
              padding: "20px",
              maxWidth: 420,
              width: "100%",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
              maxHeight: "80vh",
              overflowY: "auto"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "#FFFFFF" }}>
                  Swap "{swapModalState.currentEx?.name}"
                </h3>
                <button
                  onClick={() => setSwapModalState(null)}
                  style={{ background: "none", border: "none", fontSize: 18, color: "#94A3B8", cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 12 }}>
                Choose an alternative exercise targeting the same muscle group:
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  "Push-ups",
                  "Incline Dumbbell Press",
                  "Dumbbell Floor Press",
                  "Dips",
                  "Goblet Squats",
                  "Bodyweight Squats",
                  "Bulgarian Split Squats",
                  "Dumbbell Bent-over Row",
                  "Lat Pulldown",
                  "Seated Cable Row",
                  "Dumbbell Shoulder Press",
                  "Plank Hold"
                ].filter(name => name !== swapModalState.currentEx?.name).map(optName => (
                  <button
                    key={optName}
                    onClick={() => handleSwapExercise(optName)}
                    style={{
                      background: "#1A1F2C",
                      border: "1px solid var(--border-divider)",
                      borderRadius: 10,
                      padding: "10px 12px",
                      textAlign: "left",
                      color: "#FFFFFF",
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <span>{optName}</span>
                    <span style={{ color: "#237547", fontSize: 11 }}>Select ➔</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* MODAL: EXERCISE INSTRUCTIONS                                          */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {selectedExerciseModal && (
          <div style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(38, 53, 74, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16
          }}>
            <div style={{
              background: "var(--surface-primary)",
              borderRadius: 20,
              padding: "20px",
              maxWidth: 420,
              width: "100%",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "#FFFFFF" }}>
                  {selectedExerciseModal.name}
                </h3>
                <button
                  onClick={() => setSelectedExerciseModal(null)}
                  style={{ background: "none", border: "none", fontSize: 18, color: "#94A3B8", cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ fontSize: 12, color: "#237547", fontWeight: 800, marginBottom: 8 }}>
                Target: {selectedExerciseModal.target}
              </div>

              <div style={{ fontSize: 12.5, color: "#475569", lineHeight: 1.5, marginBottom: 12 }}>
                <strong>Execution Instructions:</strong>
                <ol style={{ paddingLeft: 16, marginTop: 4 }}>
                  {selectedExerciseModal.steps?.map((step, sIdx) => (
                    <li key={sIdx} style={{ marginBottom: 4 }}>{step}</li>
                  ))}
                </ol>
              </div>

              {selectedExerciseModal.youtubeUrl && (
                <a
                  href={selectedExerciseModal.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    textAlign: "center",
                    background: "#FF0000",
                    color: "#FFFFFF",
                    padding: "8px 0",
                    borderRadius: 10,
                    textDecoration: "none",
                    fontWeight: 800,
                    fontSize: 12
                  }}
                >
                  ▶ Watch Video Tutorial on YouTube
                </a>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* MODAL: NEW MEASUREMENT & PHOTO DIALOG                                 */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {showNewLogModal && (
          <NewMeasurementModal
            onClose={() => setShowNewLogModal(false)}
            onSave={handleSaveNewMeasurement}
            currentWeight={currW}
          />
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* MODAL: PRIVATE PHOTO VIEWER                                           */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {selectedPhotoView && (
          <div style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 16
          }}>
            <div style={{ maxWidth: 400, width: "100%", background: "var(--surface-primary)", borderRadius: 18, overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--border-divider)" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#FFFFFF" }}>Private Checkpoint Photo</div>
                  <div style={{ fontSize: 11, color: "#94A3B8" }}>{selectedPhotoView.log_date}</div>
                </div>
                <button
                  onClick={() => setSelectedPhotoView(null)}
                  style={{ background: "none", border: "none", fontSize: 18, color: "#94A3B8", cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>

              <img
                src={selectedPhotoView.photo_url}
                alt="Progress"
                style={{ width: "100%", maxHeight: 360, objectFit: "contain", background: "#000000" }}
              />

              <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#21865B", fontWeight: 700 }}>🔒 Secure Private Storage</span>
                <button
                  onClick={() => handleDeleteLog(selectedPhotoView.id)}
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid #EF4444",
                    color: "#EF4444",
                    borderRadius: 8,
                    padding: "6px 12px",
                    fontSize: 11.5,
                    fontWeight: 800,
                    cursor: "pointer"
                  }}
                >
                  Permanently Delete Photo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TOAST NOTIFICATION ── */}
        {toastMsg && (
          <div style={{
            position: "fixed",
            bottom: 84,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--surface-primary)",
            border: "1.5px solid #237547",
            borderRadius: 999,
            padding: "8px 20px",
            color: "#FFFFFF",
            fontSize: 12,
            fontWeight: 800,
            zIndex: 9999,
            boxShadow: "0 8px 24px rgba(38, 53, 74, 0.15)"
          }}>
            {toastMsg}
          </div>
        )}

      </div>
    );
  }

  // ── SUB-COMPONENT: NEW MEASUREMENT MODAL ──
  function NewMeasurementModal({ onClose, onSave, currentWeight }) {
    const [weight, setWeight] = useState(currentWeight || 70);
    const [waist, setWaist] = useState("");
    const [chest, setChest] = useState("");
    const [arms, setArms] = useState("");
    const [notes, setNotes] = useState("");
    const [photoDataUrl, setPhotoDataUrl] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (loadEvt) => {
          setPhotoDataUrl(loadEvt.target.result);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleFormSubmit = () => {
      onSave({
        log_date: new Date().toISOString().split("T")[0],
        weight_kg: Number(weight) || null,
        waist_cm: Number(waist) || null,
        chest_cm: Number(chest) || null,
        arms_cm: Number(arms) || null,
        notes,
        photo_url: photoDataUrl
      });
    };

    return (
      <div style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(38, 53, 74, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16
      }}>
        <div style={{
          background: "var(--surface-primary)",
          borderRadius: 20,
          padding: "20px",
          maxWidth: 420,
          width: "100%",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          maxHeight: "85vh",
          overflowY: "auto"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "#FFFFFF" }}>
              Log Body Checkpoint
            </h3>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", fontSize: 18, color: "#94A3B8", cursor: "pointer" }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 800, color: "#FFFFFF", display: "block", marginBottom: 4 }}>
                Current Weight (kg):
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border-divider)", background: "#1A1F2C", color: "#FFFFFF", fontSize: 13, fontWeight: 700 }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 800, color: "#FFFFFF", display: "block", marginBottom: 4 }}>
                  Waist (cm, optional):
                </label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="e.g. 82"
                  value={waist}
                  onChange={e => setWaist(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border-divider)", background: "#1A1F2C", color: "#FFFFFF", fontSize: 12.5 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 800, color: "#FFFFFF", display: "block", marginBottom: 4 }}>
                  Chest (cm, optional):
                </label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="e.g. 98"
                  value={chest}
                  onChange={e => setChest(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border-divider)", background: "#1A1F2C", color: "#FFFFFF", fontSize: 12.5 }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11.5, fontWeight: 800, color: "#FFFFFF", display: "block", marginBottom: 4 }}>
                Notes / Non-Scale Victory:
              </label>
              <input
                type="text"
                placeholder="e.g. Energy great, felt strong on squats today"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border-divider)", background: "#1A1F2C", color: "#FFFFFF", fontSize: 12.5 }}
              />
            </div>

            {/* PRIVATE PHOTO UPLOAD */}
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 800, color: "#FFFFFF", display: "block", marginBottom: 4 }}>
                Private Progress Photo (Optional):
              </label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: "var(--surface-primary)",
                    border: "1px solid var(--border-divider)",
                    color: "#237547",
                    borderRadius: 10,
                    padding: "8px 14px",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer"
                  }}
                >
                  📷 Select Photo
                </button>
                {photoDataUrl && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <img src={photoDataUrl} alt="Preview" style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover" }} />
                    <button
                      type="button"
                      onClick={() => setPhotoDataUrl(null)}
                      style={{ background: "none", border: "none", color: "#EF4444", fontSize: 11, cursor: "pointer" }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              <div style={{ fontSize: 10.5, color: "#94A3B8", marginTop: 4 }}>
                🔒 Stored strictly in your private profile. Can be permanently deleted anytime.
              </div>
            </div>

            <button
              type="button"
              onClick={handleFormSubmit}
              style={{
                background: "linear-gradient(135deg, #237547 0%, #1B5E36 100%)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 10,
                padding: "10px 0",
                fontSize: 13,
                fontWeight: 900,
                cursor: "pointer",
                marginTop: 8
              }}
            >
              Save Checkpoint
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Export globally
  global.BodyGoalsScreen = BodyGoalsScreen;

})(typeof window !== "undefined" ? window : this);
