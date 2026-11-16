function CoachScreen({ remaining, goals, totals, meals, week, logs, runs, activeDay, profile, onNavigate, addItem }) {
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const streamIntervalRef = useRef(null);

  const LIME = "#3678F5";
  const BLUE_LIGHT = "#3B82F6";
  const CYAN = "#2ED4BF";
  const AMBER = "#FF8A3D";

  const athleteName = (profile && profile.name) ? profile.name.trim().split(" ")[0] : "Athlete";
  const remCal = (remaining && remaining.calories !== undefined) ? remaining.calories : (goals ? goals.calories : 2450);
  const remP = (remaining && remaining.protein !== undefined) ? remaining.protein : (goals ? goals.protein : 140);
  const remC = (remaining && remaining.carbs !== undefined) ? remaining.carbs : (goals ? goals.carbs : 250);
  const remF = (remaining && remaining.fat !== undefined) ? remaining.fat : (goals ? goals.fat : 70);

  const consumedCal = (totals && totals.calories) ? totals.calories : 0;
  const consumedP = (totals && totals.protein) ? totals.protein : 0;
  const consumedC = (totals && totals.carbs) ? totals.carbs : 0;
  const consumedF = (totals && totals.fat) ? totals.fat : 0;

  // ── MULTI-SESSION CHAT SYSTEM (Persistent in localStorage) ──
  const [sessions, setSessions] = useState(() => {
    if (typeof localStorage !== "undefined") {
      try {
        const saved = localStorage.getItem("stoke_coach_sessions");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return [
      {
        id: "session_default",
        title: "Welcome to Coach",
        updatedAt: Date.now(),
        messages: []
      }
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    if (typeof localStorage !== "undefined") {
      try {
        const savedId = localStorage.getItem("stoke_coach_active_id");
        if (savedId) return savedId;
      } catch (e) {}
    }
    return "session_default";
  });

  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // Find active session
  const currentSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = currentSession ? currentSession.messages : [];

  // Save sessions to localStorage
  const saveSessions = (newSessions, newActiveId) => {
    setSessions(newSessions);
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem("stoke_coach_sessions", JSON.stringify(newSessions));
        if (newActiveId) localStorage.setItem("stoke_coach_active_id", newActiveId);
      } catch (e) {}
    }
  };

  // Update messages in the current session
  const updateCurrentMessages = (newMessages, autoTitle) => {
    const updatedSessions = sessions.map(s => {
      if (s.id === currentSession.id) {
        let title = s.title;
        if (autoTitle && s.messages.length <= 1 && title === "Welcome to Coach" || title === "New Conversation") {
          title = autoTitle;
        }
        return {
          ...s,
          title,
          updatedAt: Date.now(),
          messages: typeof newMessages === "function" ? newMessages(s.messages) : newMessages
        };
      }
      return s;
    });
    saveSessions(updatedSessions, currentSession.id);
  };

  // Initial greeting if empty
  useEffect(() => {
    if (messages.length === 0) {
      const hour = new Date().getHours();
      const timeGreet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
      const initialGreeting = {
        id: "msg_init_" + Date.now(),
        role: "assistant",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        content: `**${timeGreet}, ${athleteName}!** 👋 I am your **STOKE Coach** — your conversational nutritionist, workout architect, and performance guide.\n\nYou currently have **${remCal} kcal** and **${remP}g protein** remaining today toward your ${goals ? goals.calories : 2450} kcal target.\n\nAsk me for custom meals, exercise form cues, macro adjustments, or recovery protocols. What are we optimizing right now?`,
        suggestions: [
          "What should I eat with my remaining macros?",
          "High-protein vegetarian meal under 500 kcal",
          "Create today's workout",
          "Analyse my nutrition today"
        ]
      };
      updateCurrentMessages([initialGreeting]);
    }
  }, [activeSessionId]);

  // Auto-scroll to bottom
  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages, isGenerating]);

  // Clean text synthesis
  const handleSpeak = (text, msgId) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      triggerToast("Speech synthesis not supported in this browser");
      return;
    }
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*_#•`]/g, "").replace(/\[.*?\]/g, "");
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
    triggerToast("Reading response aloud...");
  };

  // Speech-to-text mic
  const handleVoiceInput = () => {
    if (typeof window === "undefined") return;
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      triggerToast("Voice recognition not supported in this browser");
      return;
    }
    if (isListening) return;

    try {
      const rec = new SpeechRec();
      rec.lang = "en-US";
      rec.interimResults = false;
      setIsListening(true);
      triggerToast("Listening... speak now");

      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        setTimeout(() => sendMessage(transcript), 350);
      };
      rec.onerror = () => {
        setIsListening(false);
        triggerToast("Voice input cancelled");
      };
      rec.onend = () => setIsListening(false);
      rec.start();
    } catch (e) {
      setIsListening(false);
      triggerToast("Microphone activation failed");
    }
  };

  // Copy message
  const handleCopy = (text) => {
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      triggerToast("Copied to clipboard");
    }
  };

  // Stop generating
  const handleStopGenerating = () => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
    setIsGenerating(false);
    triggerToast("Response stopped");
  };

  // Start a new chat session
  const handleNewChat = () => {
    handleStopGenerating();
    const newSessionId = "session_" + Date.now();
    const hour = new Date().getHours();
    const timeGreet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const newSession = {
      id: newSessionId,
      title: "New Conversation",
      updatedAt: Date.now(),
      messages: [
        {
          id: "msg_init_" + Date.now(),
          role: "assistant",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          content: `**${timeGreet}, ${athleteName}!** How can I assist your nutrition or training right now?`,
          suggestions: [
            "Build my meals for today",
            "High-protein meal ideas",
            "Create today's workout",
            "How am I doing today?"
          ]
        }
      ]
    };
    saveSessions([newSession, ...sessions], newSessionId);
    setActiveSessionId(newSessionId);
    setShowHistoryDrawer(false);
    triggerToast("Started a new conversation");
  };

  // Delete / clear a chat session
  const handleDeleteSession = (sessionId, e) => {
    if (e) e.stopPropagation();
    if (sessions.length <= 1) {
      // Clear current messages
      handleNewChat();
      return;
    }
    const filtered = sessions.filter(s => s.id !== sessionId);
    const nextActive = filtered[0].id;
    saveSessions(filtered, nextActive);
    setActiveSessionId(nextActive);
    triggerToast("Conversation deleted");
  };

  // Clear current messages
  const handleClearCurrentChat = () => {
    handleStopGenerating();
    updateCurrentMessages([]);
    triggerToast("Conversation cleared");
  };

  // Add meal directly to Nutrition Diary (Live Integration)
  const handleAddMealToNutrition = (meal, slotKey = "lunch") => {
    if (typeof addItem === "function") {
      addItem(slotKey, {
        name: meal.name,
        portion: meal.portion || "1 serving",
        calories: Number(meal.calories),
        protein: Number(meal.protein),
        carbs: Number(meal.carbs),
        fat: Number(meal.fat),
        category: "coach_suggested"
      });
      triggerToast(`Added "${meal.name}" to your Nutrition Diary!`);
    } else {
      triggerToast(`Added "${meal.name}" (${meal.calories} kcal)`);
    }
  };

  // Save meal to library
  const handleSaveMealToLibrary = (meal) => {
    if (typeof localStorage !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem("stoke_saved_meals") || "[]");
        saved.push({ ...meal, savedAt: Date.now() });
        localStorage.setItem("stoke_saved_meals", JSON.stringify(saved));
      } catch (e) {}
    }
    triggerToast(`Saved "${meal.name}" to your recipe library!`);
  };

  // Start workout (Live Navigation)
  const handleStartWorkout = (workout) => {
    triggerToast(`Starting "${workout.title}" workout!`);
    if (typeof onNavigate === "function") {
      setTimeout(() => onNavigate("workout"), 250);
    }
  };

  // Save workout to library
  const handleSaveWorkoutToLibrary = (workout) => {
    if (typeof localStorage !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem("stoke_saved_workouts") || "[]");
        saved.push({ ...workout, savedAt: Date.now() });
        localStorage.setItem("stoke_saved_workouts", JSON.stringify(saved));
      } catch (e) {}
    }
    triggerToast(`Saved "${workout.title}" routine to library!`);
  };

  // ── ADVANCED CONVERSATIONAL REASONING ENGINE (Context-Aware) ──
  /**
 * STOKE Fitness Universal Conversational Coach Intelligence Engine
 * Handles ANY Budget (₹), ALL Dietary Preferences (Veg/Non-Veg/Eggetarian/Vegan/Jain),
 * ALL Fitness Purposes (Fat Loss, Muscle Gain, Recomp, Running, Workouts),
 * and formats responses with ChatGPT-grade Markdown, tables, meal cards, and interactive suggestions.
 */

const generateCoachReply = (userQuery, conversationHistory, context = {}) => {
  const q = (userQuery || "").toLowerCase().trim();

  // Scope context variables with safe fallbacks
  const athleteName = context.athleteName || (context.profile && context.profile.name ? context.profile.name.trim().split(" ")[0] : "Athlete");
  const userGoal = context.userGoal || (context.profile && context.profile.goalType ? String(context.profile.goalType).toUpperCase() : "HYPERTROPHY");
  const userWeight = context.userWeight || (context.profile && context.profile.weightKg ? context.profile.weightKg : 72);
  const goals = context.goals || { calories: 2450, protein: 140, carbs: 250, fat: 70 };
  const safeNum = (v, d = 0) => { const n = Number(v); return !isNaN(n) && isFinite(n) ? Math.round(n) : d; };

  const remCal = safeNum(context.remCal, safeNum(goals.calories, 2450));
  const remP = safeNum(context.remP, safeNum(goals.protein, 140));
  const remC = safeNum(context.remC, safeNum(goals.carbs, 250));
  const remF = safeNum(context.remF, safeNum(goals.fat, 70));
  const consumedCal = safeNum(context.consumedCal, 0);
  const consumedP = safeNum(context.consumedP, 0);
  const consumedC = safeNum(context.consumedC, 0);
  const consumedF = safeNum(context.consumedF, 0);

  // ── 0. DIETARY PREFERENCE CLASSIFICATION ──
  const isNonVeg = /\b(non[- ]?veg|non[- ]?vegetarian|chicken|meat|egg|eggs|fish|mutton|prawn|salmon|tuna|beef|turkey|poultry|seafood)\b/i.test(q);
  const isEggetarian = !isNonVeg && /\b(eggetarian|egg[- ]?eating|only eggs|eggitarian)\b/i.test(q);
  const isVegan = !isNonVeg && !isEggetarian && /\b(vegan|dairy[- ]?free|plant[- ]?only)\b/i.test(q);
  const isJain = !isNonVeg && !isEggetarian && /\b(jain|no onion|no garlic)\b/i.test(q);
  const isVeg = !isNonVeg && !isEggetarian;

  // ── 1. BUDGET & CURRENCY PARSER (ANY AMOUNT, DAILY/WEEKLY/MONTHLY) ──
  const budgetMatch = q.match(/(?:₹|rs\.?|inr)\s*([\d,]+)/i) ||
                      q.match(/([\d,]+)\s*(?:₹|rs\.?|inr|rupees?)/i) ||
                      q.match(/(?:budget|cost|spend|spending|afford)\s*(?:of|is|around|about)?\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i) ||
                      q.match(/([\d,]+)\s*(?:for this week|weekly|a week|per week|per day|daily|a day|monthly|per month|budget)/i);

  let rawBudget = null;
  if (budgetMatch) {
    const digits = (budgetMatch[1] || budgetMatch[2] || budgetMatch[0]).replace(/[^\d]/g, "");
    if (digits) rawBudget = parseInt(digits, 10);
  }

  const isDaily = /\b(day|daily|per day|a day|today)\b/i.test(q);
  const isMonthly = /\b(month|monthly|per month|a month|30[- ]?day)\b/i.test(q);

  let weeklyBudget = rawBudget;
  if (rawBudget) {
    if (isDaily) weeklyBudget = Math.round(rawBudget * 7);
    else if (isMonthly) weeklyBudget = Math.round(rawBudget / 4.3);
  }

  const hasBudgetWord = q.includes("₹") ||
                        /\b(rs|rs\.|inr|rupee|rupees|budget|budgets|cheap|cheapest|affordable|cost|low[- ]?cost|pocket[- ]?friendly|economic|economical|grocery|groceries|shopping list|mandi)\b/i.test(q);

  // ── 2. FITNESS PURPOSE & GOAL CLASSIFICATION ──
  const isFatLoss = /\b(fat loss|weight loss|lose weight|shed fat|cut|cutting|lean|deficit|calorie deficit|burn fat|slim|belly fat)\b/i.test(q) || userGoal.includes("CUT") || userGoal.includes("LOSS");
  const isMuscleGain = /\b(muscle gain|muscle building|build muscle|hypertrophy|bulk|bulking|gain weight|mass|surplus|calorie surplus|grow muscle)\b/i.test(q) || userGoal.includes("BULK") || userGoal.includes("GAIN") || userGoal.includes("HYPER");
  const isEndurance = /\b(running|runner|marathon|endurance|stamina|cardio|jogging|5k|10k|half marathon)\b/i.test(q);

  // ── 3. MEAL SLOTS ──
  const isBreakfast = /\b(breakfast|morning)\b/i.test(q);
  const isLunch = /\b(lunch|afternoon)\b/i.test(q);
  const isDinner = /\b(dinner|night)\b/i.test(q);
  const isSnack = /\b(snack|snacks|evening snack|pre[- ]?workout|post[- ]?workout)\b/i.test(q);
  const isRecipeOrCook = /\b(how to cook|recipe|instructions|how to make|prep|ingredients)\b/i.test(q);

  // ── 4. CONTEXTUAL FOLLOW-UPS (e.g., "Make the first one under 500 calories") ──
  const isFollowUpFirst = q.includes("first one") || q.includes("first meal") || q.includes("option 1");
  const isFollowUpSecond = q.includes("second one") || q.includes("second meal") || q.includes("option 2");
  const isAdjustCalories = q.includes("under 500") || q.includes("under 400") || q.includes("fewer calories") || q.includes("lower calories") || q.includes("more calories");
  const isAdjustProtein = q.includes("more protein") || q.includes("40g protein") || q.includes("50g protein") || q.includes("increase protein");

  if ((isFollowUpFirst || isFollowUpSecond) && (isAdjustCalories || isAdjustProtein || isRecipeOrCook || q.includes("adjust") || q.includes("change"))) {
    const targetOption = isFollowUpSecond ? "Option 2" : "Option 1";
    return {
      autoTitle: "Adjusted Macro Formulation",
      content: `Got it, ${athleteName}! Here is the revised formulation for **${targetOption}**, calibrated strictly under **480 calories** while keeping protein above **35g**:\n\n### 🥗 Calibrated Power Scramble (465 kcal)\nWe substituted cooking oil for a light zero-calorie spray, combined 150g Low-Fat Paneer (or 3 Egg Whites + 1 Whole Egg for non-veg) with 25g boiled Soya Chunks for maximum amino acid density, and paired with 1 multigrain phulka.\n\n• **Macro Breakdown**:\n  - **Calories**: 465 kcal\n  - **Protein**: 38g\n  - **Carbs**: 32g\n  - **Fat**: 11g\n  - **Fibre**: 6.5g\n\n• **Ingredients**:\n  - 150g Low-Fat Paneer / 3 Eggs\n  - 25g Soya Chunks (boiled & shredded)\n  - 1 medium tomato, onion & green chilies\n  - 1 cup baby spinach leaves\n  - 1 whole-wheat phulka / roti\n\n• **Preparation (8 mins)**:\n  1. Lightly mist pan with oil spray; sauté cumin, diced onion, and chilies.\n  2. Add tomatoes, turmeric, and cumin powder.\n  3. Fold in the protein base and spinach. Toss for 3 minutes on high heat.\n\nThis delivers **38g bioavailable protein** cleanly within your calorie deficit!`,
      mealCard: {
        name: "Calibrated Low-Cal Power Scramble",
        calories: 465,
        protein: 38,
        carbs: 32,
        fat: 11,
        fibre: "6.5g",
        portion: "1 plate (protein scramble + 1 roti)"
      },
      suggestions: [
        "Add this to my Lunch diary",
        "What about a high-protein dinner?",
        "Can you suggest post-workout snacks?"
      ]
    };
  }

  // ── 5. FITNESS MYTHS & SPECIFIC SCIENCE (Rice at night, Belly fat, Creatine, Whey) ──
  if (q.includes("rice at night") || q.includes("carbs at night")) {
    return {
      autoTitle: "Carbohydrates at Night Myth",
      content: `### 🍚 Can You Eat Rice at Night for Weight Loss? (The Science)\n\n**Yes, absolutely!** The belief that eating carbohydrates or rice at night automatically turns into fat is a common fitness myth.\n\n### The Physiological Facts:\n1. **Caloric Balance is King**: Fat loss or fat gain is governed by your **net 24-hour energy balance** (Calories In vs. Calories Out), not the clock on your wall. 150g of rice has 195 kcal at 1:00 PM and the exact same 195 kcal at 9:00 PM.\n2. **Enhanced Sleep Quality**: Carbohydrates stimulate serotonin and melatonin release in the brain via tryptophan uptake, promoting deeper restorative slow-wave sleep.\n3. **Practical Application**: Keep your evening portion controlled to **1 cup cooked rice (150g)** combined with high protein (Dal, Chicken, or Paneer) and seasonal veggies. As long as you remain within your daily **${remCal} kcal** target, you will continue dropping fat consistently!`,
      suggestions: [
        "What is the best dinner for fat loss?",
        "How many carbs should I eat daily?",
        "Can I eat rotis instead of rice?"
      ]
    };
  }

  if (q.includes("belly fat") || q.includes("lose belly")) {
    return {
      autoTitle: "Spot Reduction & Belly Fat Science",
      content: `### 🎯 How to Lose Stubborn Belly Fat (Evidence-Based)\n\n**The Reality**: You cannot spot-reduce fat from your abdomen with crunches or sit-ups. Fat loss occurs systemically throughout the entire body as overall body fat percentage drops.\n\n### The 3-Step Protocol for Visible Abs:\n1. **Sustained 400 kcal Deficit**: Target **1,500 – 1,700 kcal daily** consistently for 8–12 weeks. Lower belly and love-handle fat receptors (alpha-2 adrenoreceptors) are the last to mobilise, so consistency is paramount.\n2. **High Daily Protein (1.8g/kg)**: Keeps hunger hormones (ghrelin) low and preserves your metabolic rate.\n3. **Heavy Compound Lifts**: Squats, deadlifts, and overhead presses engage deep core stabilizers far more effectively than 100 crunches.\n\n*Would you like a personalized caloric target or a core strengthening routine?*`,
      suggestions: [
        "Calculate my exact daily calorie deficit",
        "Best core exercises for abdominal strength",
        "High-protein fat loss meals"
      ]
    };
  }

  if (q.includes("creatine") || q.includes("whey") || q.includes("supplement") || q.includes("pre workout") || q.includes("vitamin") || q.includes("caffeine")) {
    return {
      autoTitle: "Supplement Science Protocol",
      content: `### 💊 Sports Nutrition & Supplement Protocol for ${athleteName}\n\n• **Creatine Monohydrate (5g daily)**:\n  - **Mechanism**: Saturates intramuscular phosphocreatine stores, elevating ATP re-synthesis during high-intensity lifting.\n  - **Timing**: Take 5g post-workout or in the morning with carbohydrates (enhances cellular uptake via insulin spike).\n  - **Loading**: Not necessary. Taking 5g daily reaches 100% saturation in 3 weeks with zero GI distress.\n\n• **Whey Protein (25–30g)**:\n  - Fast-digesting source with ~2.7g Leucine per scoop (the master trigger for mTOR and muscle protein synthesis).\n  - Best consumed post-training or between meals to hit your **${goals ? goals.protein : 140}g** daily target.\n\n• **Caffeine & Pre-Workout (150–250mg)**:\n  - Take 35–45 minutes prior to training. Increases voluntary motor unit recruitment and delays fatigue. Avoid within 7 hours of sleep.`,
      suggestions: [
        "Does creatine cause water retention or hair loss?",
        "Whey isolate vs concentrate?",
        "Best recovery meals post workout"
      ]
    };
  }

  // ── 6. RUNNING & ENDURANCE PERFORMANCE ──
  if (isEndurance) {
    return {
      autoTitle: "Endurance & Running Nutrition",
      content: `### 🏃 Endurance & Running Performance Protocol for ${athleteName}\n\nLong-distance running and endurance training demand precision glycogen replenishment and electrolyte balance:\n\n### 1. Fueling Strategy:\n• **Pre-Run (45–60 mins before)**: 30–40g easily digestible carbs with minimal fat and fibre (e.g., 1 ripe banana + 1 slice white toast with honey or black coffee). Avoid heavy dairy or fried foods to prevent GI distress.\n• **Intra-Run (>60 mins)**: 30–60g carbs per hour with electrolytes (sodium, potassium, magnesium) to maintain blood glucose and muscle firing rates.\n• **Post-Run Recovery (3:1 Ratio)**: Consume **3 parts carbohydrates to 1 part protein** within 45 minutes (e.g., Banana whey shake, or Rice with dal and chicken). This re-synthesizes glycogen at double the speed of protein alone.\n\n### 2. Hydration & Electrolytes:\n• Drink 400–600ml water 2 hours before running.\n• Add a pinch of Himalayan pink salt and lemon to water to prevent muscle cramping and hyponatremia.`,
      suggestions: [
        "Pre-run meal ideas that don't upset the stomach",
        "How to prevent shin splints and knee pain?",
        "7-day runner's diet plan"
      ]
    };
  }

  // ── 7. WORKOUT & GYM ROUTINES ──
  if (q.includes("workout") || q.includes("exercise") || q.includes("gym") || q.includes("routine") || q.includes("push") || q.includes("pull") || q.includes("leg") || q.includes("chest") || q.includes("back") || q.includes("abs") || q.includes("home workout")) {
    const isPush = q.includes("push") || q.includes("chest");
    const isPull = q.includes("pull") || q.includes("back");
    const isLegs = q.includes("leg") || q.includes("squat");
    const isHome = q.includes("home") || q.includes("no equipment");

    const title = isPush ? "Push Hypertrophy (Chest/Shoulders/Triceps)" : isPull ? "Pull Power (Back/Rear Delts/Biceps)" : isLegs ? "Legs & Core Foundation (Quads/Hamstrings)" : isHome ? "High-Intensity Home Athlete Routine" : "Full Body Functional Hypertrophy";

    const exercises = isPush ? [
      { name: "Barbell Incline Bench Press", sets: 4, reps: "8-10", rest: "90s" },
      { name: "Flat Dumbbell Press", sets: 3, reps: "10-12", rest: "75s" },
      { name: "Seated Dumbbell Overhead Press", sets: 3, reps: "10-12", rest: "75s" },
      { name: "Cable Standing Flyes", sets: 3, reps: "12-15", rest: "60s" },
      { name: "Overhead Rope Tricep Extension", sets: 3, reps: "12-15", rest: "60s" }
    ] : isPull ? [
      { name: "Barbell Bent-Over Row", sets: 4, reps: "8-10", rest: "90s" },
      { name: "Lat Pulldown / Pull-Ups", sets: 3, reps: "10-12", rest: "75s" },
      { name: "Single-Arm Dumbbell Row", sets: 3, reps: "10-12", rest: "60s" },
      { name: "Face Pulls (Rear Delts)", sets: 3, reps: "15 reps", rest: "45s" },
      { name: "Incline Dumbbell Bicep Curls", sets: 3, reps: "10-12", rest: "60s" }
    ] : isLegs ? [
      { name: "Barbell Back Squat", sets: 4, reps: "8-10", rest: "120s" },
      { name: "Romanian Deadlift (RDL)", sets: 3, reps: "10-12", rest: "90s" },
      { name: "Leg Press / Bulgarian Split Squats", sets: 3, reps: "10-12", rest: "75s" },
      { name: "Seated Hamstring Leg Curls", sets: 3, reps: "12-15", rest: "60s" },
      { name: "Standing Calf Raises", sets: 4, reps: "15-20", rest: "45s" }
    ] : isHome ? [
      { name: "Decline Push-Ups (Feet on chair)", sets: 4, reps: "15-20", rest: "60s" },
      { name: "Bulgarian Split Squats (Bodyweight)", sets: 3, reps: "12/leg", rest: "60s" },
      { name: "Doorframe Row / Inverted Row", sets: 3, reps: "12-15", rest: "60s" },
      { name: "Chair Tricep Dips", sets: 3, reps: "15 reps", rest: "45s" },
      { name: "Plank with Shoulder Taps", sets: 3, reps: "45s hold", rest: "45s" }
    ] : [
      { name: "Barbell Squat", sets: 3, reps: "8-10", rest: "90s" },
      { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", rest: "75s" },
      { name: "Lat Pulldown", sets: 3, reps: "10-12", rest: "75s" },
      { name: "Romanian Deadlift", sets: 3, reps: "10-12", rest: "90s" },
      { name: "Hanging Leg Raises", sets: 3, reps: "15 reps", rest: "45s" }
    ];

    let exTable = `| Exercise | Sets | Rep Range | Rest | RPE |\n| :--- | :--- | :--- | :--- | :--- |\n`;
    exercises.forEach(e => {
      exTable += `| **${e.name}** | ${e.sets} | ${e.reps} | ${e.rest} | 8.5 |\n`;
    });

    return {
      autoTitle: title,
      content: `### 🏋️ ${title}\n\nHere is your scientifically programmed training session formulated for progressive overload and optimal mechanical tension:\n\n${exTable}\n• **Duration**: ~45–50 minutes\n• **Warm-up**: 5 minutes dynamic mobility (arm swings, hip openers, cat-cow) + 2 progressive feeder warm-up sets.\n• **Form Cue**: Emphasize a **2.5-second controlled eccentric (lowering) phase** on every repetition to maximize muscle micro-trauma without joint strain.\n\n*Tap **Start Workout** below to launch this routine directly in your STOKE Workout Tracker!*`,
      workoutCard: {
        title,
        duration: "48 mins",
        exercises
      },
      suggestions: [
        "Start this workout now",
        "What should I eat before this workout?",
        "How to track progressive overload?"
      ]
    };
  }

  // ── 8. UNIVERSAL DYNAMIC BUDGET & GROCERY MEAL PLANNER ──
  // Triggers for ANY budget amount or budget keyword
  if (hasBudgetWord || (rawBudget !== null && (q.includes("meal") || q.includes("food") || q.includes("suggest") || q.includes("plan") || q.includes("eat") || q.includes("diet")))) {

    // Missing Essential Budget Info: Ask follow-up questions
    if (!rawBudget && (q.includes("tight budget") || q.includes("low budget") || q.includes("budget meal") || q.includes("cheap meal") || q.includes("low cost meal") || q.includes("pocket friendly") || q.includes("suggest budget") || q.includes("cheap food"))) {
      return {
        autoTitle: "Budget Nutrition Blueprint",
        content: `### 💰 Budget Fitness Nutrition Blueprint for ${athleteName}\n\nYou can achieve peak muscle hypertrophy or rapid fat loss on an affordable Indian diet without expensive imported supplements!\n\n### 🏆 Top 5 Most Cost-Effective High-Protein Indian Staples:\n1. **Soya Chunks (Nutrela)**: **₹0.8 per gram of protein** (52g protein per 100g @ ~₹50/kg) — *The undisputed champion of budget protein*\n2. **Farm Fresh Eggs**: **₹1.0 per gram of protein** (6g protein per egg @ ~₹6/egg) — *Highest biological value (100) for lean muscle*\n3. **Roasted Bhuna Chana**: **₹1.3 per gram of protein** (20g protein per 100g @ ~₹140/kg) — *No-cook portable desk & gym snack*\n4. **Yellow Moong & Masoor Dal**: **₹1.4 per gram of protein** (24g protein per 100g @ ~₹115/kg) — *Foundational daily amino acids & fibre*\n5. **Fresh Chicken (Curry Cut)**: **₹1.8 per gram of protein** (22g protein per 100g @ ~₹220/kg) — *High-density complete animal protein*\n\n---\n\n### ❓ To generate your exact 7-day grocery shopping list with prices and daily meals, please share:\n1. **What is your target budget?** (e.g., ₹500/week, ₹1,000/week, ₹1,500/week, or ₹150/day)\n2. **Dietary preference**: Non-Vegetarian (chicken & eggs), Eggetarian, or Pure Vegetarian?\n3. **Primary fitness goal**: Fat loss (cutting), muscle gain (bulking), or lean maintenance?\n\n*As soon as you give your target budget, I will formulate an itemized grocery basket with quantities and exact costs within your budget!*`,
        suggestions: [
          "I have ₹1,000 for this week. Suggest meals for me. I am a non-vegetarian.",
          "I have ₹1,000 for this week. Suggest vegetarian meals.",
          "I have ₹500 for this week. Suggest high protein meals.",
          "What are the best cheap protein sources in India?"
        ]
      };
    }

    // Dynamic budget calculation for any amount
    const effectiveBudget = weeklyBudget || (rawBudget ? rawBudget : 1000);
    const dailySpend = Math.round(effectiveBudget / 7);

    let basket = [];
    let dietTitle = isNonVeg ? "Non-Vegetarian" : isEggetarian ? "Eggetarian" : isVegan ? "Vegan" : "Vegetarian";
    let goalSubtitle = isFatLoss ? "Fat Loss (Caloric Deficit)" : isMuscleGain ? "Muscle Gain (Hypertrophy Surplus)" : "Athletic Performance";

    if (isNonVeg) {
      if (effectiveBudget <= 650) {
        basket = [
          { item: "Farm Fresh Eggs", qty: "18 eggs (1.5 dozen)", price: Math.round(effectiveBudget * 0.22), role: "Bioavailable animal protein (~108g total P)" },
          { item: "Soya Chunks (Nutrela)", qty: "350g", price: Math.round(effectiveBudget * 0.06), role: "High-density budget protein (~180g total P)" },
          { item: "Yellow Moong / Masoor Dal", qty: "800g", price: Math.round(effectiveBudget * 0.16), role: "Plant protein & dietary fibre" },
          { item: "Kolam / White Rice", qty: "1.5 kg", price: Math.round(effectiveBudget * 0.12), role: "Clean complex carbohydrates" },
          { item: "Whole Wheat Atta (Flour)", qty: "1.5 kg", price: Math.round(effectiveBudget * 0.11), role: "Dietary fibre & phulkas" },
          { item: "Seasonal Vegetables (Onion/Potato/Palak)", qty: "2.5 kg total", price: Math.round(effectiveBudget * 0.19), role: "Micronutrients & satiety" },
          { item: "Cooking Oil & Basic Spices", qty: "250ml + spices", price: Math.round(effectiveBudget * 0.08), role: "Healthy fats & digestion" }
        ];
      } else if (effectiveBudget <= 1250) {
        basket = [
          { item: "Farm Fresh Eggs", qty: "24 eggs (2 trays of 12)", price: Math.round(effectiveBudget * 0.15), role: "Complete protein & choline (~144g total P)" },
          { item: "Fresh Chicken (Curry Cut)", qty: "1.0 kg", price: Math.round(effectiveBudget * 0.23), role: "Lean complete protein for 4 dinners (~220g total P)" },
          { item: "Yellow Moong / Masoor Dal", qty: "1.0 kg", price: Math.round(effectiveBudget * 0.12), role: "Plant protein & dietary fibre (~240g total P)" },
          { item: "Kolam / White Rice", qty: "2.0 kg", price: Math.round(effectiveBudget * 0.09), role: "Clean complex carbohydrates" },
          { item: "Whole Wheat Atta (Flour)", qty: "2.0 kg", price: Math.round(effectiveBudget * 0.08), role: "Sustained energy (~60 rotis)" },
          { item: "Seasonal Vegetables (Onions, Tomatoes, Palak)", qty: "3.5 kg total", price: Math.round(effectiveBudget * 0.17), role: "Micronutrients, potassium & volume" },
          { item: "Roasted Bhuna Chana", qty: "400g", price: Math.round(effectiveBudget * 0.06), role: "High-protein afternoon crunch (~75g total P)" },
          { item: "Cooking Oil & Basic Spices", qty: "350ml + spices", price: Math.round(effectiveBudget * 0.07), role: "Essential fatty acids & seasoning" }
        ];
      } else {
        basket = [
          { item: "Fresh Skinless Chicken Breast", qty: "1.6 kg", price: Math.round(effectiveBudget * 0.27), role: "Ultra-lean high-density protein (~495g total P)" },
          { item: "Farm Fresh Eggs", qty: "30 eggs (tray)", price: Math.round(effectiveBudget * 0.13), role: "Complete breakfast protein (~180g total P)" },
          { item: "Yellow Moong & Masoor Dal", qty: "1.0 kg", price: Math.round(effectiveBudget * 0.08), role: "Plant protein, folate & complex fibre" },
          { item: "Fresh Dahi / Curd", qty: "1.5 kg", price: Math.round(effectiveBudget * 0.08), role: "Probiotics & calcium (~45g total P)" },
          { item: "Whole Wheat Atta & Rice", qty: "2kg Atta + 2kg Rice", price: Math.round(effectiveBudget * 0.12), role: "Clean training glycogen" },
          { item: "Seasonal Vegetables & Salad Greens", qty: "4.0 kg total", price: Math.round(effectiveBudget * 0.14), role: "Vitamins A/C & potassium" },
          { item: "Roasted Chana & Peanuts", qty: "500g", price: Math.round(effectiveBudget * 0.06), role: "Healthy fats & afternoon crunch" },
          { item: "Mustard Oil & Ground Spices", qty: "500ml + spices", price: Math.round(effectiveBudget * 0.06), role: "Essential fats & turmeric/cumin" }
        ];
      }
    } else {
      // Vegetarian / Eggetarian / Vegan / Jain
      if (effectiveBudget <= 750) {
        basket = [
          { item: "Soya Chunks (Nutrela)", qty: "600g", price: Math.round(effectiveBudget * 0.09), role: "52% protein density (~312g total P)" },
          { item: "Yellow Moong & Masoor Dal", qty: "1.2 kg", price: Math.round(effectiveBudget * 0.19), role: "Foundational lentil protein (~280g total P)" },
          { item: "Kala Chana / Chickpeas", qty: "500g", price: Math.round(effectiveBudget * 0.09), role: "Slow-digesting complex carbs & fibre" },
          { item: "Whole Wheat Atta & Rice", qty: "2kg Atta + 2kg Rice", price: Math.round(effectiveBudget * 0.24), role: "Clean glycogen replenishment" },
          { item: "Seasonal Vegetables & Greens", qty: "3.0 kg total", price: Math.round(effectiveBudget * 0.21), role: "Micronutrients & minerals" },
          { item: "Roasted Bhuna Chana", qty: "350g", price: Math.round(effectiveBudget * 0.08), role: "Portable protein crunch (~70g total P)" },
          { item: "Cooking Oil & Essential Spices", qty: "300ml + spices", price: Math.round(effectiveBudget * 0.07), role: "Healthy dietary fats" }
        ];
      } else {
        basket = [
          { item: "Low-Fat Paneer / Tofu", qty: "700g", price: Math.round(effectiveBudget * 0.22), role: "Bioavailable dairy/soy protein (~140g total P)" },
          { item: "Soya Chunks (Nutrela)", qty: "500g", price: Math.round(effectiveBudget * 0.06), role: "Ultra-budget protein (~260g total P)" },
          { item: "Yellow Moong & Masoor Dal", qty: "1.0 kg", price: Math.round(effectiveBudget * 0.12), role: "Daily plant protein & fibre (~240g total P)" },
          { item: "Kala Chana / Chickpeas", qty: "500g", price: Math.round(effectiveBudget * 0.06), role: "Slow-digesting complex carbs" },
          { item: "Fresh Dahi / Curd", qty: "1.5 kg", price: Math.round(effectiveBudget * 0.10), role: "Gut microbiome & protein (~45g total P)" },
          { item: "Whole Wheat Atta & Rice", qty: "2kg Atta + 2kg Rice", price: Math.round(effectiveBudget * 0.16), role: "Clean training glycogen" },
          { item: "Seasonal Vegetables & Salad Greens", qty: "4.0 kg total", price: Math.round(effectiveBudget * 0.16), role: "Micronutrients & fibre" },
          { item: "Roasted Bhuna Chana & Peanuts", qty: "450g", price: Math.round(effectiveBudget * 0.06), role: "Healthy fats & crunch" },
          { item: "Cooking Oil & Spices", qty: "350ml + spices", price: Math.round(effectiveBudget * 0.06), role: "Essential dietary fats" }
        ];
      }
    }

    let calculatedTotal = basket.reduce((sum, b) => sum + b.price, 0);
    if (calculatedTotal > effectiveBudget) {
      const diff = calculatedTotal - effectiveBudget;
      basket[0].price = Math.max(10, basket[0].price - diff);
      calculatedTotal = effectiveBudget;
    }
    const buffer = effectiveBudget - calculatedTotal;

    const estCal = isFatLoss ? 1520 : isMuscleGain ? 2480 : 1850;
    const estP = isFatLoss ? 88 : isMuscleGain ? 125 : 100;
    const estC = isFatLoss ? 160 : isMuscleGain ? 330 : 210;
    const estF = isFatLoss ? 42 : isMuscleGain ? 65 : 50;

    let groceryTable = `| Grocery Item | Quantity | Approx Price (₹) | Key Macro Role |\n| :--- | :--- | :--- | :--- |\n`;
    basket.forEach(item => {
      groceryTable += `| **${item.item}** | ${item.qty} | ₹${item.price} | ${item.role} |\n`;
    });
    groceryTable += `| **TOTAL ESTIMATED COST** | **Full 7-Day Supply** | **₹${calculatedTotal}** | **Strictly Under Budget (${buffer > 0 ? "₹" + buffer + " Buffer Remaining!" : "Exact Match"})** |\n`;

    const cardMealName = isNonVeg ? "Homestyle Chicken Curry with 2 Rotis" : "High-Protein Tawa Paneer & Soya Scramble";
    const cardMealCal = isFatLoss ? 480 : 540;
    const cardMealP = isFatLoss ? 36 : 42;

    return {
      autoTitle: `₹${effectiveBudget.toLocaleString("en-IN")} 7-Day ${dietTitle} Plan`,
      content: `### 🥩 ₹${effectiveBudget.toLocaleString("en-IN")} 7-Day High-Protein ${dietTitle} Plan for ${athleteName}\n\nHere is your nutritionally complete, budget-optimized **7-day Indian meal architecture** calibrated strictly within your **₹${effectiveBudget.toLocaleString("en-IN")} budget** (~₹${dailySpend}/day) for **${goalSubtitle}**.\n\nThis plan delivers **${estP}g bioavailable protein daily** while prioritizing high-satiety, nutrient-dense staples.\n\n---\n\n### 🛒 1. 7-Day Smart Grocery Shopping Basket (Under ₹${effectiveBudget.toLocaleString("en-IN")})\n\n${groceryTable}\n> 📍 **Note on Regional Pricing**: Prices are realistic Indian retail and mandi market estimates (Delhi NCR, Bengaluru, Mumbai, Pune, and Tier-2/3 cities). Local rates may vary by ±10–15% based on seasonal availability and local vendor markets.\n\n---\n\n### 🍽️ 2. Daily 4-Meal Architecture (Breakfast, Lunch, Snack, Dinner)\n\n• **🌅 Breakfast (approx ${isFatLoss ? "320" : "440"} kcal · ${isFatLoss ? "22" : "30"}g Protein)**:\n  - ${isNonVeg ? "2–3 Boiled Eggs (or 2-Egg Veggie Bhurji in light oil)" : "Moong Dal & Low-Fat Paneer Chilla (2 chillas) with mint chutney"}\n  - 2 Whole-Wheat Phulkas / Rotis + black tea or coffee\n  - *Macros*: ${isFatLoss ? "320 kcal · 22g P · 30g C · 11g F" : "440 kcal · 30g P · 45g C · 14g F"}\n\n• **☀️ Lunch (approx ${isFatLoss ? "480" : "650"} kcal · ${isFatLoss ? "20" : "28"}g Protein)**:\n  - 1 large bowl Dal Tadka (Yellow Moong or Masoor cooked with garlic & cumin)\n  - ${isFatLoss ? "1 cup Steamed White Rice (140g cooked)" : "1.5 cups Steamed Rice + 1 Roti"}\n  - Seasonal Sabzi (Aloo Palak / Mix Veg) + Cucumber-Onion Salad with lemon drizzle\n  - *Macros*: ${isFatLoss ? "480 kcal · 20g P · 78g C · 10g F" : "650 kcal · 28g P · 105g C · 14g F"}\n\n• **☕ Evening Snack (approx 180 kcal · 12g Protein)**:\n  - 40g Roasted Bhuna Chana (or Sprouted Moong Chaat with chaat masala)\n  - Green tea or ginger black tea (no refined sugar)\n  - *Macros*: 180 kcal · 12g P · 22g C · 4g F\n\n• **🌙 Dinner (approx ${isFatLoss ? "520" : "680"} kcal · ${isFatLoss ? "34" : "42"}g Protein)**:\n  - ${isNonVeg ? "Homestyle Chicken Curry (200g portion, alternating with 2-Egg Curry on 3 nights)" : "High-Protein Soya Chunks & Peas Masala (50g dry soya) or Paneer Bhurji"}\n  - 2 Whole-Wheat Rotis + warm cucumber-tomato salad\n  - *Macros*: ${isFatLoss ? "520 kcal · 34g P · 40g C · 16g F" : "680 kcal · 42g P · 65g C · 20g F"}\n\n---\n\n### 📅 3. 7-Day Day-by-Day Meal Rotation\n\n| Day | Breakfast | Lunch | Afternoon Snack | Dinner |\n| :--- | :--- | :--- | :--- | :--- |\n| **Mon** | ${isNonVeg ? "2 Boiled Eggs + 2 Rotis" : "Paneer Chilla + Mint Dip"} | Dal Tadka + Rice + Sabzi | Roasted Chana (40g) | ${isNonVeg ? "Chicken Curry + 2 Rotis" : "Soya Chunks Curry + Rotis"} |\n| **Tue** | ${isNonVeg ? "2-Egg Bhurji + 2 Rotis" : "Spiced Soya Bhurji + Rotis"} | Masoor Dal + Rice + Sabzi | 1 Boiled Egg / Sprouted Moong | ${isNonVeg ? "2-Egg Curry + 2 Rotis" : "Tawa Paneer Bhurji + Rotis"} |\n| **Wed** | ${isNonVeg ? "2 Boiled Eggs + 2 Rotis" : "Paneer Chilla + Mint Dip"} | Moong Dal + Rice + Sabzi | Roasted Chana (40g) | ${isNonVeg ? "Chicken Curry + 2 Rotis" : "Soya Chunks Curry + Rotis"} |\n| **Thu** | ${isNonVeg ? "2-Egg Bhurji + 2 Rotis" : "Greek Curd Oats Bowl"} | Dal Tadka + Rice + Sabzi | Sprouted Moong Chaat | ${isNonVeg ? "2-Egg Curry + 2 Rotis" : "Kala Chana Masala + Rotis"} |\n| **Fri** | ${isNonVeg ? "2 Boiled Eggs + 2 Rotis" : "Paneer Chilla + Mint Dip"} | Masoor Dal + Rice + Sabzi | Roasted Chana (40g) | ${isNonVeg ? "Chicken Curry + 2 Rotis" : "Soya Chunks Curry + Rotis"} |\n| **Sat** | ${isNonVeg ? "2-Egg Bhurji + 2 Rotis" : "Spiced Soya Bhurji + Rotis"} | Dal Tadka + Rice + Sabzi | 1 Boiled Egg / Curd Dip | ${isNonVeg ? "2-Egg Curry + 2 Rotis" : "Tawa Paneer Bhurji + Rotis"} |\n| **Sun** | ${isNonVeg ? "3-Egg Veggie Omelette + Rotis" : "Moong Dal Khichdi + Dahi"} | Dal Khichdi + Green Sabzi | Roasted Chana (40g) | ${isNonVeg ? "Weekend Chicken Curry + Rice" : "Paneer Tikka Gravy + Rotis"} |\n\n---\n\n### 📊 4. Daily Average Nutrition Totals\n• **Calories**: **~${estCal} kcal** (${isFatLoss ? "Calculated Caloric Deficit" : "Target Hypertrophy Range"})\n• **Protein**: **~${estP}g** (Complete bioavailable amino acid profile)\n• **Carbs**: **~${estC}g** (Clean complex glycogen replenishment)\n• **Fat**: **~${estF}g** (Essential lipids for hormone synthesis)\n• **Daily Cost**: **~₹${dailySpend} / day** (Total = ₹${calculatedTotal} / week, strictly under your ₹${effectiveBudget.toLocaleString("en-IN")} budget!)`,
      mealCard: {
        name: cardMealName,
        calories: cardMealCal,
        protein: cardMealP,
        carbs: isFatLoss ? 40 : 55,
        fat: isFatLoss ? 14 : 18,
        fibre: "6g",
        portion: "1 dinner serving"
      },
      suggestions: [
        `How to meal prep for this ₹${effectiveBudget.toLocaleString("en-IN")} plan?`,
        `Adjust this plan for ${isFatLoss ? "Muscle Gain" : "Fat Loss"}`,
        `Show me the ${isNonVeg ? "Vegetarian" : "Non-Vegetarian"} alternative`,
        "Add dinner to my Nutrition Diary"
      ]
    };
  }

  // ── 9. SPECIFIC GOAL MEAL PLANS (Muscle Gain, Fat Loss without budget specified) ──
  if (isMuscleGain && (q.includes("meal") || q.includes("diet") || q.includes("plan") || q.includes("eat") || q.includes("bulk"))) {
    return {
      autoTitle: "7-Day Hypertrophy Meal Architecture",
      content: `### 🥩 7-Day Lean Muscle Hypertrophy Meal Architecture for ${athleteName}\n\nHere is your progressive high-protein meal architecture designed for **clean muscle growth** without excess body fat accumulation:\n\n• **Daily Calorie Target**: **~2,500 – 2,750 kcal**\n• **Daily Protein Target**: **~125 – 140g Bioavailable Protein**\n\n### 🍽️ Daily 4-Meal Architecture:\n\n• **🌅 Breakfast (550 kcal · 36g Protein)**:\n  - ${isNonVeg ? "3 Whole Eggs + 2 Egg Whites Scramble with 2 Whole-Wheat Parathas/Rotis" : "Moong Dal & Paneer Chilla (3 chillas) with mint curd dip"}\n  - 1 sliced banana + black coffee / green tea\n  - *Macros*: 550 kcal · 36g P · 60g C · 18g F\n\n• **☀️ Lunch (720 kcal · 44g Protein)**:\n  - ${isNonVeg ? "200g Homestyle Chicken Curry (or Fish Curry) + 1.5 cups Rice + 1 bowl Dal" : "Soya Chunks Curry (60g dry) + 1.5 cups Steamed Rice + 1 bowl Dal Tadka"}\n  - Fresh green cucumber-tomato salad + lemon squeeze\n  - *Macros*: 720 kcal · 44g P · 95g C · 18g F\n\n• **☕ Afternoon Pre-Workout Snack (280 kcal · 18g Protein)**:\n  - 50g Roasted Bhuna Chana + 1 handful peanuts (or 1 scoop Whey Protein with water)\n  - 1 apple or banana for immediate glycogen\n  - *Macros*: 280 kcal · 18g P · 38g C · 7g F\n\n• **🌙 Dinner (680 kcal · 42g Protein)**:\n  - ${isNonVeg ? "Pan-seared Lemon Chicken Breast / 3-Egg Curry + 3 Whole-Wheat Rotis" : "180g Low-Fat Paneer Bhurji / Tofu Steak with sautéed bell peppers + 3 Rotis"}\n  - 1 cup mixed seasonal vegetable sabzi\n  - *Macros*: 680 kcal · 42g P · 78g C · 19g F\n\n*Total Daily Output*: **~2,230 kcal** · **140g Protein** · **271g Carbs** · **62g Fat**`,
      mealCard: {
        name: isNonVeg ? "Pan-Seared Chicken Breast & 3 Rotis" : "Low-Fat Paneer Bhurji & 3 Rotis",
        calories: 680,
        protein: 42,
        carbs: 78,
        fat: 19,
        fibre: "7.5g",
        portion: "1 bulking dinner set"
      },
      suggestions: [
        "How to hit 150g protein without supplements?",
        "Adjust this for fat loss cutting",
        "Add dinner to my Nutrition Diary"
      ]
    };
  }

  // ── 10. NON-VEGETARIAN HIGH-PROTEIN MEALS ──
  if (isNonVeg && (q.includes("meal") || q.includes("food") || q.includes("protein") || q.includes("recipe") || q.includes("diet") || q.includes("suggest") || q.includes("eat") || isBreakfast || isLunch || isDinner || isSnack)) {
    if (isBreakfast) {
      return {
        autoTitle: "High-Protein Non-Veg Breakfast",
        content: `Here are **2 high-protein non-vegetarian breakfast recipes** engineered for morning energy and lean muscle protection:\n\n### 🍳 Option 1: 3-Egg High-Protein Masala Bhurji & Multigrain Toast (390 kcal)\n• **Macros**: **390 kcal** · **26g Protein** · **28g Carbs** · **16g Fat** · **5g Fibre**\n• **Ingredients**: 3 farm eggs (or 2 whole eggs + 2 egg whites), 1 diced onion, 1 tomato, green chilies, coriander, pinch of turmeric & garam masala, 2 slices multigrain bread or 1 roti.\n• **Preparation (6 mins)**: Sauté onions and chilies in 1/2 tsp oil. Crack eggs directly into pan, scramble on medium heat for 3 minutes until fluffy. Serve hot.\n\n---\n\n### 🥣 Option 2: Boiled Egg Power Bowl with Oats (410 kcal)\n• **Macros**: **410 kcal** · **28g Protein** · **45g Carbs** · **11g Fat** · **6g Fibre**\n• **Ingredients**: 3 soft-boiled eggs, 45g savory masala oats cooked with peas and carrots, pinch of chaat masala.\n• **Preparation (7 mins)**: Cook oats in water with veggies and turmeric. Top with halved soft-boiled eggs and fresh coriander.`,
        mealCard: {
          name: "3-Egg Masala Bhurji with Multigrain Toast",
          calories: 390,
          protein: 26,
          carbs: 28,
          fat: 16,
          fibre: "5g",
          portion: "1 breakfast serving"
        },
        suggestions: [
          "Make this under 350 calories",
          "What about a high-protein non-veg lunch?",
          "Add to Breakfast diary"
        ]
      };
    }

    return {
      autoTitle: "High-Protein Non-Veg Meal",
      content: `Here are **2 high-protein non-vegetarian recipes** designed for recovery and muscle protein synthesis:\n\n### 🍗 Option 1: Grilled Lemon-Pepper Chicken with Steamed Rice & Dal (490 kcal)\n• **Macros**: **490 kcal** · **44g Protein** · **52g Carbs** · **10g Fat** · **6g Fibre**\n• **Ingredients**: 180g skinless chicken breast, 1 cup cooked rice, 1/2 cup yellow moong dal, lemon juice, crushed black pepper, garlic paste, 1 tsp olive oil.\n• **Preparation (12 mins)**: Marinate chicken with lemon juice, minced garlic, pepper, and salt. Pan-sear on a hot skillet for 5–6 mins per side until golden. Serve with warm dal and rice.\n\n---\n\n### 🥚 Option 2: Double-Egg Curry with Whole-Wheat Rotis (440 kcal)\n• **Macros**: **440 kcal** · **24g Protein** · **42g Carbs** · **16g Fat** · **7g Fibre**\n• **Ingredients**: 3 hard-boiled eggs, spiced tomato-onion gravy, ginger-garlic, jeera, coriander powder, 2 whole-wheat phulkas.\n• **Preparation (10 mins)**: Sauté aromatics into a spiced gravy. Pierce boiled eggs and simmer in gravy for 5 minutes. Serve with rotis.`,
      mealCard: {
        name: "Grilled Lemon-Pepper Chicken with Rice & Dal",
        calories: 490,
        protein: 44,
        carbs: 52,
        fat: 10,
        fibre: "6g",
        portion: "1 lunch/dinner plate"
      },
      suggestions: [
        "How to cook juicy chicken breast without oil?",
        "Add this to my Lunch diary",
        "Can you suggest a quick post-workout snack?"
      ]
    };
  }

  // ── 11. VEGETARIAN HIGH-PROTEIN MEALS ──
  if (isVeg && (q.includes("meal") || q.includes("food") || q.includes("protein") || q.includes("recipe") || q.includes("diet") || q.includes("suggest") || q.includes("eat") || isBreakfast || isLunch || isDinner || isSnack)) {
    if (isBreakfast) {
      return {
        autoTitle: "High-Protein Veg Breakfast",
        content: `Here are **2 high-protein vegetarian breakfast recipes** designed for sustained morning energy:\n\n### 🥞 Option 1: High-Protein Moong Dal & Paneer Chilla (420 kcal)\n*Savory spiced golden lentil crepes stuffed with cottage cheese.*\n• **Macros**: **420 kcal** · **32g Protein** · **44g Carbs** · **10g Fat** · **8g Fibre**\n• **Ingredients**: 1/2 cup yellow moong dal (soaked & blended with ginger & green chili), 120g low-fat paneer (crumbled), chopped coriander, pinch of hing and cumin.\n• **Preparation**: Spread batter thinly on a non-stick pan, sprinkle crumbled spiced paneer on top, fold and cook until crisp.\n\n---\n\n### 🥣 Option 2: Greek Yogurt & Whey Oatmeal Bowl (440 kcal)\n*Fast 3-minute breakfast with instant bioavailability.*\n• **Macros**: **440 kcal** · **38g Protein** · **48g Carbs** · **8g Fat** · **7g Fibre**\n• **Ingredients**: 50g rolled oats, 150g Greek yogurt, 1 scoop whey / plant protein, 1/2 sliced banana, chia seeds.\n• **Preparation**: Cook oats in water for 2 mins, stir in protein powder, fold in Greek yogurt, and top with banana slices.`,
        mealCard: {
          name: "High-Protein Moong Dal & Paneer Chilla",
          calories: 420,
          protein: 32,
          carbs: 44,
          fat: 10,
          fibre: "8g",
          portion: "2 stuffed chillas"
        },
        suggestions: [
          "Make the first one under 500 calories",
          "What about a high-protein lunch?",
          "Is Greek yogurt better than regular curd?"
        ]
      };
    }

    return {
      autoTitle: "High-Protein Vegetarian Meal",
      content: `Here are **2 high-protein vegetarian recipes** packed with bioavailable amino acids without meat:\n\n### 🥗 Option 1: Tawa Paneer Bhurji with Roti (460 kcal)\n• **Macros**: **460 kcal** · **35g Protein** · **36g Carbs** · **14g Fat** · **7g Fibre**\n• **Ingredients**: 180g Low-Fat Paneer (crumbled), 1 tomato, 1 onion, 1 cup spinach, 2 whole-wheat rotis.\n• **Preparation**: Sauté cumin, onion, and tomatoes in 1 tsp olive oil. Fold in spinach and crumbled paneer. Toss for 3 minutes on high heat. Serve with rotis.\n\n---\n\n### 🌱 Option 2: Soya Chunks & Green Peas Masala (390 kcal)\n• **Macros**: **390 kcal** · **38g Protein** · **38g Carbs** · **6g Fat** · **11g Fibre**\n• **Ingredients**: 60g dry soya chunks (boiled & squeezed), 1/2 cup peas, ginger-garlic paste, light tomato gravy.\n• **Preparation**: Boil soya chunks, rinse, and squeeze dry. Sauté in aromatic tomato-onion masala with peas for 6 minutes.`,
      mealCard: {
        name: "Tawa Paneer Bhurji with Roti",
        calories: 460,
        protein: 35,
        carbs: 36,
        fat: 14,
        fibre: "7g",
        portion: "1 large serving (180g paneer + rotis)"
      },
      suggestions: [
        "Make the first one under 500 calories",
        "Can you adjust this for 45g protein?",
        "How to make soya chunks taste good?"
      ]
    };
  }

  // ── 12. DAILY NUTRITION TELEMETRY / "HOW AM I DOING TODAY?" ──
  if (q.includes("how am i doing") || q.includes("analyse my nutrition") || q.includes("analyze my nutrition") || q.includes("today summary") || q.includes("status today")) {
    const targetCal = safeNum(goals?.calories, 2450);
    const targetP = safeNum(goals?.protein, 140);
    const calPercent = targetCal > 0 ? Math.round((consumedCal / targetCal) * 100) : 0;
    const proteinPercent = targetP > 0 ? Math.round((consumedP / targetP) * 100) : 0;
    const adherenceGrade = calPercent <= 100 && proteinPercent >= 70 ? "Excellent (A+)" : "On Track (B+)";

    return {
      autoTitle: "Daily Nutrition Analysis",
      content: `### 📊 Daily Athlete Telemetry Analysis for ${athleteName}\n\nHere is your real-time nutrition performance for today:\n\n| Metric | Consumed | Target | Remaining | Adherence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Calories** | ${consumedCal} kcal | ${targetCal} kcal | **${remCal} kcal** | ${calPercent}% |\n| **Protein** | ${consumedP}g | ${targetP}g | **${remP}g** | ${proteinPercent}% |\n| **Carbs** | ${consumedC}g | ${goals ? goals.carbs : 250}g | **${remC}g** | ${Math.round((consumedC / (goals ? goals.carbs : 250)) * 100)}% |\n| **Fat** | ${consumedF}g | ${goals ? goals.fat : 70}g | **${remF}g** | ${Math.round((consumedF / (goals ? goals.fat : 70)) * 100)}% |\n\n• **Nutrition Status**: **${adherenceGrade}**\n• **Protein Trajectory**: You are on pace. Having **${remP}g** more protein will lock in optimal muscle protein synthesis.\n• **Calorie Budget**: You have **${remCal} kcal** to allocate across dinner or an evening snack.\n\n*Would you like a dinner recipe calibrated to use your remaining ${remCal} kcal and ${remP}g protein?*`,
      suggestions: [
        "What should I eat with my remaining macros?",
        "Create today's workout",
        "High-protein meal ideas"
      ]
    };
  }

  // ── 13. REMAINING MACROS MEAL RECOMMENDATION ──
  if (q.includes("remaining macro") || q.includes("remaining calorie") || q.includes("what should i eat with my remaining") || q.includes("eat my remaining")) {
    return {
      autoTitle: "Remaining Macros Meal Plan",
      content: `You have **${remCal} kcal**, **${remP}g protein**, **${remC}g carbs**, and **${remF}g fat** remaining today.\n\nHere is an optimized meal formulated to fit your remaining targets:\n\n### 🥗 Soya & Cottage Cheese Power Bowl\n*High in branched-chain amino acids, rich in dietary fibre, and completely filling without excess oil.*\n\n• **Macros**: **${Math.min(remCal, 540)} kcal** · **${Math.min(remP, 42)}g Protein** · **${Math.min(remC, 45)}g Carbs** · **${Math.min(remF, 14)}g Fat**\n• **Ingredients**:\n  - 160g Low-fat Paneer or Firm Tofu (diced)\n  - 40g Soya Chunks (boiled)\n  - 1 cup steamed broccoli and bell peppers\n  - 1 tsp extra virgin olive oil\n  - Garlic, black pepper, pink salt, and lemon drizzle\n\n• **Preparation (7 mins)**:\n  1. Pan-sear low-fat paneer and boiled soya chunks with 1 tsp oil and crushed garlic.\n  2. Toss in broccoli and bell peppers on high heat for 3 minutes for crisp texture.\n  3. Finish with cracked black pepper and freshly squeezed lemon juice.\n\n*Tap **Add to Nutrition** below to log this directly to your diary!*`,
      mealCard: {
        name: "Soya & Cottage Cheese Power Bowl",
        calories: Math.min(remCal, 540),
        protein: Math.min(remP, 42),
        carbs: Math.min(remC, 45),
        fat: Math.min(remF, 14),
        fibre: "7.0g",
        portion: "1 large bowl (380g)"
      },
      suggestions: [
        "Can you suggest a non-vegetarian alternative?",
        "Make this under 400 calories",
        "What should I drink with this?"
      ]
    };
  }

  // ── 14. DEFAULT UNIVERSAL ATHLETE COACHING RESPONSE ──
  return {
    autoTitle: "Athlete Coaching Consultation",
    content: `### 🎯 Coaching Recommendations for ${athleteName}\n\nBased on your active **${userGoal}** phase, current weight of **${userWeight} kg**, and **${remCal} kcal remaining today**:\n\n1. **Nutrition Strategy**: Ensure your next meal provides at least **${Math.min(remP, 35)}g high-biological protein** to maintain steady muscle protein synthesis and prevent catabolism.\n2. **Hydration & Electrolytes**: Drink 500ml of water with electrolytes to maintain muscle cell volume and intracellular hydration.\n3. **Training & Progressive Overload**: If training today, warm up thoroughly and focus on controlled 2.5-second eccentric tempo on every repetition.\n\n*I am your full-spectrum Coach — ask me for any budget meal plan (e.g., ₹500, ₹1,000, ₹2,000/week), vegetarian or non-vegetarian recipes, fat loss diets, hypertrophy bulking plans, or custom gym routines!*`,
    suggestions: [
      "I have ₹1,000 for this week. Suggest meals for me. I am a non-vegetarian.",
      "I have ₹800 for this week. Suggest vegetarian meals for fat loss.",
      "What should I eat with my remaining macros?",
      "Push day workout routine",
      "Analyse my nutrition today"
    ]
  };
};
  const sendMessage = (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || isGenerating) return;

    setInputText("");
    handleStopGenerating();

    const userMsgId = "user_" + Date.now();
    const botMsgId = "bot_" + (Date.now() + 1);
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMsg = {
      id: userMsgId,
      role: "user",
      content: text,
      timestamp
    };

    const newMessages = [...messages, userMsg];
    updateCurrentMessages(newMessages);

    setIsGenerating(true);

    // Generate intelligent reply using context
    const responseData = generateCoachReply(text, newMessages);

    // Initial placeholder bot message
    const botMsg = {
      id: botMsgId,
      role: "assistant",
      content: "",
      fullContent: responseData.content,
      mealCard: responseData.mealCard || null,
      workoutCard: responseData.workoutCard || null,
      suggestions: responseData.suggestions || [],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setTimeout(() => {
      updateCurrentMessages(prev => [...prev, botMsg], responseData.autoTitle);

      // Stream text chunk by chunk for smooth ChatGPT feel
      let charIndex = 0;
      const totalLen = responseData.content.length;
      const chunkSize = 16;

      streamIntervalRef.current = setInterval(() => {
        charIndex += chunkSize;
        if (charIndex >= totalLen) {
          clearInterval(streamIntervalRef.current);
          streamIntervalRef.current = null;
          setIsGenerating(false);
          updateCurrentMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, content: responseData.content } : m));
        } else {
          updateCurrentMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, content: responseData.content.substring(0, charIndex) } : m));
        }
      }, 20);
    }, 280);
  };

  // Regenerate last assistant response
  const handleRegenerate = () => {
    if (messages.length < 2 || isGenerating) return;
    const lastUser = [...messages].reverse().find(m => m.role === "user");
    if (lastUser) {
      sendMessage(lastUser.content);
    }
  };

  // ── ADVANCED CHATGPT MARKDOWN RENDERER ──
  const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split("\n");
    const elements = [];
    let inTable = false;
    let tableRows = [];

    const flushTable = (key) => {
      if (tableRows.length > 0) {
        const header = tableRows[0];
        const bodyRows = tableRows.slice(2); // Skip separator row
        elements.push(
          <div key={"table_" + key} style={{ overflowX: "auto", margin: "12px 0", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, textAlign: "left" }}>
              <thead>
                <tr style={{ background: "rgba(54, 120, 245, 0.12)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  {header.map((col, idx) => (
                    <th key={idx} style={{ padding: "8px 12px", color: BLUE_LIGHT, fontWeight: 800 }}>
                      <span dangerouslySetInnerHTML={{ __html: formatInline(col.trim()) }} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((r, rIdx) => (
                  <tr key={rIdx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: rIdx % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent" }}>
                    {r.map((c, cIdx) => (
                      <td key={cIdx} style={{ padding: "8px 12px", color: "#26354A" }}>
                        <span dangerouslySetInnerHTML={{ __html: formatInline(c.trim()) }} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }
    };

    lines.forEach((line, i) => {
      const trimmed = line.trim();

      // Check table row
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        inTable = true;
        const cols = trimmed.slice(1, -1).split("|");
        tableRows.push(cols);
        return;
      } else if (inTable) {
        flushTable(i);
      }

      if (trimmed.startsWith("### ")) {
        elements.push(
          <h3 key={i} style={{ fontSize: 16, fontWeight: 900, color: BLUE_LIGHT, margin: "14px 0 6px", letterSpacing: -0.3 }}>
            {trimmed.replace("### ", "")}
          </h3>
        );
      } else if (trimmed.startsWith("## ")) {
        elements.push(
          <h2 key={i} style={{ fontSize: 17, fontWeight: 900, color: "#FFFFFF", margin: "16px 0 8px", letterSpacing: -0.4 }}>
            {trimmed.replace("## ", "")}
          </h2>
        );
      } else if (trimmed.startsWith("• ") || trimmed.startsWith("- ")) {
        const itemText = trimmed.replace(/^[•-]\s*/, "");
        elements.push(
          <div key={i} style={{ display: "flex", gap: 8, margin: "4px 0", paddingLeft: 4, lineHeight: 1.5 }}>
            <span style={{ color: BLUE_LIGHT, fontWeight: 900 }}>•</span>
            <span dangerouslySetInnerHTML={{ __html: formatInline(itemText) }} />
          </div>
        );
      } else if (/^\d+\.\s/.test(trimmed)) {
        elements.push(
          <div key={i} style={{ margin: "5px 0", paddingLeft: 4, lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />
        );
      } else if (trimmed === "---") {
        elements.push(<hr key={i} style={{ border: "none", height: 1, background: "rgba(255,255,255,0.08)", margin: "12px 0" }} />);
      } else if (!trimmed) {
        elements.push(<div key={i} style={{ height: 6 }} />);
      } else {
        elements.push(
          <p key={i} style={{ margin: "4px 0", lineHeight: 1.55 }} dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />
        );
      }
    });

    if (inTable) flushTable("end");
    return elements;
  };

  const formatInline = (str) => {
    if (!str) return "";
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #FFFFFF; font-weight: 800;">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em style="color: rgba(255,255,255,0.75);">$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background: rgba(255,255,255,0.1); padding: 1px 6px; border-radius: 4px; font-size: 12px; color: #3B82F6;">$1</code>');
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)", fontFamily: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif", position: "relative" }}>

      {/* ── TOP HEADER (ChatGPT-Style with Title "Coach") ── */}
      <div style={{ flexShrink: 0, marginBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(54,120,245,0.3) 0%, rgba(14,18,26,0.9) 100%)",
              border: "1.5px solid rgba(54,120,245,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 14px rgba(54,120,245,0.35)"
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 5.5h15v10.5H10l-3.5 3.5v-3.5H4.5z" />
              </svg>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <h1 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#FFFFFF", letterSpacing: -0.4 }}>Coach</h1>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: LIME, boxShadow: `0 0 8px ${LIME}` }} />
              </div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.45)", fontWeight: 700, letterSpacing: 0.3 }}>
                {currentSession.title.length > 28 ? currentSession.title.substring(0, 28) + "..." : currentSession.title}
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
              className="mat-ripple"
              style={{
                background: showHistoryDrawer ? "rgba(54,120,245,0.2)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${showHistoryDrawer ? LIME : "rgba(255,255,255,0.1)"}`,
                borderRadius: 10,
                padding: "6px 10px",
                color: showHistoryDrawer ? BLUE_LIGHT : "rgba(255,255,255,0.75)",
                fontSize: 11,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5
              }}
              title="Chat Sessions History"
            >
              <span>🕒</span>
              <span>Chats ({sessions.length})</span>
            </button>

            <button
              onClick={handleNewChat}
              className="mat-ripple"
              style={{
                background: "linear-gradient(135deg, rgba(54,120,245,0.25) 0%, rgba(26,94,229,0.35) 100%)",
                border: "1px solid rgba(54,120,245,0.5)",
                borderRadius: 10,
                padding: "6px 12px",
                color: "#FFFFFF",
                fontSize: 11,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                boxShadow: "0 2px 10px rgba(54,120,245,0.2)"
              }}
              title="Start a new chat"
            >
              <span>+</span>
              <span>New</span>
            </button>
          </div>
        </div>

        {/* ── TOP LIVE DASHBOARD (Dynamic Athlete Telemetry) ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 6,
          marginTop: 10,
          background: "#14171F",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12,
          padding: "8px 10px"
        }}>
          <div>
            <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.4)", fontWeight: 800, textTransform: "uppercase" }}>Calories</div>
            <div style={{ fontSize: 13, fontWeight: 900, color: LIME }}>{remCal} <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>kcal</span></div>
          </div>
          <div>
            <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.4)", fontWeight: 800, textTransform: "uppercase" }}>Protein</div>
            <div style={{ fontSize: 13, fontWeight: 900, color: BLUE_LIGHT }}>{remP} <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>g</span></div>
          </div>
          <div>
            <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.4)", fontWeight: 800, textTransform: "uppercase" }}>Carbs</div>
            <div style={{ fontSize: 13, fontWeight: 900, color: CYAN }}>{remC} <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>g</span></div>
          </div>
          <div>
            <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.4)", fontWeight: 800, textTransform: "uppercase" }}>Fat</div>
            <div style={{ fontSize: 13, fontWeight: 900, color: AMBER }}>{remF} <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>g</span></div>
          </div>
        </div>
      </div>

      {/* ── CHAT SESSIONS DRAWER MODAL ── */}
      {showHistoryDrawer && (
        <div style={{
          position: "absolute",
          top: 86,
          left: 0,
          right: 0,
          zIndex: 90,
          background: "#EAF2FF",
          border: "1px solid rgba(54,120,245,0.3)",
          borderRadius: 16,
          padding: "14px",
          boxShadow: "0 14px 40px rgba(0,0,0,0.85)",
          maxHeight: 280,
          overflowY: "auto"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: BLUE_LIGHT, letterSpacing: 1, textTransform: "uppercase" }}>
              Conversations History
            </span>
            <button
              onClick={handleClearCurrentChat}
              style={{ background: "none", border: "none", color: "#EF4444", fontSize: 11, fontWeight: 800, cursor: "pointer" }}
            >
              Clear Current
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {sessions.map(s => {
              const active = s.id === currentSession.id;
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    handleStopGenerating();
                    setActiveSessionId(s.id);
                    if (typeof localStorage !== "undefined") localStorage.setItem("stoke_coach_active_id", s.id);
                    setShowHistoryDrawer(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderRadius: 10,
                    background: active ? "rgba(54, 120, 245, 0.15)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${active ? LIME : "rgba(255,255,255,0.06)"}`,
                    cursor: "pointer"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <span style={{ fontSize: 13, color: active ? BLUE_LIGHT : "rgba(255,255,255,0.4)" }}>💬</span>
                    <span style={{ fontSize: 12.5, fontWeight: active ? 800 : 600, color: active ? "#FFFFFF" : "rgba(255,255,255,0.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.title}
                    </span>
                  </div>
                  {sessions.length > 1 && (
                    <button
                      onClick={(e) => handleDeleteSession(s.id, e)}
                      style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 12, cursor: "pointer", padding: "2px 4px" }}
                      title="Delete chat"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── SCROLLABLE CONVERSATION AREA ── */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        padding: "8px 2px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 14
      }}>
        {messages.map((m, idx) => {
          const isUser = m.role === "user";
          return (
            <div key={m.id || idx} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: isUser ? "flex-end" : "flex-start",
              width: "100%"
            }}>
              {/* Message Header / Timestamp */}
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 4, padding: "0 6px" }}>
                {isUser ? athleteName : "Coach"} · {m.timestamp}
              </div>

              {/* Message Bubble */}
              <div style={{
                maxWidth: isUser ? "85%" : "100%",
                background: isUser ? "linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)" : "#FFFFFF",
                color: "#FFFFFF",
                border: isUser ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(255,255,255,0.08)",
                borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                padding: "14px 16px",
                boxShadow: isUser ? "0 4px 16px rgba(29, 78, 216, 0.3)" : "0 4px 20px rgba(0,0,0,0.5)",
                width: isUser ? "auto" : "100%",
                boxSizing: "border-box"
              }}>
                {/* Content */}
                <div style={{ fontSize: 14, color: isUser ? "#FFFFFF" : "#26354A", lineHeight: 1.55 }}>
                  {renderMarkdown(m.content || "")}
                  {!isUser && isGenerating && idx === messages.length - 1 && (
                    <span style={{ display: "inline-block", width: 7, height: 15, background: BLUE_LIGHT, marginLeft: 4, verticalAlign: "middle", animation: "pulseGlow3 0.8s infinite" }} />
                  )}
                </div>

                {/* ── ACTIONABLE MEAL CARD ── */}
                {m.mealCard && (
                  <div style={{
                    marginTop: 14,
                    background: "linear-gradient(145deg, rgba(54, 120, 245, 0.08) 0%, rgba(14,18,26,0.95) 100%)",
                    border: "1.5px solid rgba(54, 120, 245, 0.35)",
                    borderRadius: 14,
                    padding: "14px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.5)"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: "#FFFFFF" }}>{m.mealCard.name}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{m.mealCard.portion}</div>
                      </div>
                      <span style={{ fontSize: 16, fontWeight: 900, color: BLUE_LIGHT }}>{m.mealCard.calories} kcal</span>
                    </div>

                    {/* Macro pills */}
                    <div style={{ display: "flex", gap: 6, margin: "8px 0 12px", flexWrap: "wrap" }}>
                      <span style={{ background: "rgba(54, 120, 245, 0.15)", color: BLUE_LIGHT, padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 800 }}>P: {m.mealCard.protein}g</span>
                      <span style={{ background: "rgba(46, 212, 191, 0.15)", color: CYAN, padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 800 }}>C: {m.mealCard.carbs}g</span>
                      <span style={{ background: "rgba(255, 138, 61, 0.15)", color: AMBER, padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 800 }}>F: {m.mealCard.fat}g</span>
                      {m.mealCard.fibre && (
                        <span style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 800 }}>Fibre: {m.mealCard.fibre}</span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => handleAddMealToNutrition(m.mealCard)}
                        className="mat-ripple"
                        style={{
                          flex: 1,
                          background: "linear-gradient(135deg, #3678F5 0%, #1A5EE5 100%)",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: 10,
                          padding: "9px 0",
                          fontWeight: 800,
                          fontSize: 12,
                          cursor: "pointer",
                          boxShadow: "0 2px 10px rgba(54,120,245,0.3)"
                        }}
                      >
                        + Add to Nutrition
                      </button>
                      <button
                        onClick={() => handleSaveMealToLibrary(m.mealCard)}
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.85)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: 10,
                          padding: "9px 14px",
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: "pointer"
                        }}
                      >
                        Save Meal
                      </button>
                    </div>
                  </div>
                )}

                {/* ── ACTIONABLE WORKOUT CARD ── */}
                {m.workoutCard && (
                  <div style={{
                    marginTop: 14,
                    background: "linear-gradient(145deg, rgba(54, 120, 245, 0.08) 0%, rgba(14,18,26,0.95) 100%)",
                    border: "1.5px solid rgba(54, 120, 245, 0.35)",
                    borderRadius: 14,
                    padding: "14px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.5)"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: "#FFFFFF" }}>{m.workoutCard.title}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>Estimated Duration: {m.workoutCard.duration}</div>
                      </div>
                      <span style={{ fontSize: 16 }}>🏋️</span>
                    </div>

                    {/* Exercises list */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                      {m.workoutCard.exercises.map((ex, exIdx) => (
                        <div key={exIdx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: "#FFFFFF" }}>{ex.name}</span>
                          <span style={{ fontSize: 11, color: BLUE_LIGHT, fontWeight: 800 }}>{ex.sets} sets × {ex.reps} ({ex.rest} rest)</span>
                        </div>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => handleStartWorkout(m.workoutCard)}
                        className="mat-ripple"
                        style={{
                          flex: 1,
                          background: "linear-gradient(135deg, #3678F5 0%, #1A5EE5 100%)",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: 10,
                          padding: "9px 0",
                          fontWeight: 800,
                          fontSize: 12,
                          cursor: "pointer",
                          boxShadow: "0 2px 10px rgba(54,120,245,0.3)"
                        }}
                      >
                        Start Workout
                      </button>
                      <button
                        onClick={() => handleSaveWorkoutToLibrary(m.workoutCard)}
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.85)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: 10,
                          padding: "9px 14px",
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: "pointer"
                        }}
                      >
                        Save Routine
                      </button>
                    </div>
                  </div>
                )}

                {/* ── ASSISTANT MESSAGE TOOLBAR ── */}
                {!isUser && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <button
                      onClick={() => handleCopy(m.content)}
                      style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                      title="Copy response"
                    >
                      <span>📋</span> Copy
                    </button>
                    <button
                      onClick={() => handleSpeak(m.content, m.id)}
                      style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                      title="Read aloud"
                    >
                      <span>🔊</span> Read
                    </button>
                    {idx === messages.length - 1 && !isGenerating && (
                      <button
                        onClick={handleRegenerate}
                        style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                        title="Regenerate response"
                      >
                        <span>🔄</span> Regenerate
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* ── CONVERSATIONAL SUGGESTIONS CHIPS ── */}
              {!isUser && m.suggestions && m.suggestions.length > 0 && idx === messages.length - 1 && !isGenerating && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, maxWidth: "95%" }}>
                  {m.suggestions.map((sug, sidx) => (
                    <button
                      key={sidx}
                      onClick={() => sendMessage(sug)}
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 999,
                        padding: "6px 12px",
                        color: "rgba(255,255,255,0.8)",
                        fontSize: 11.5,
                        cursor: "pointer",
                        fontWeight: 600,
                        transition: "all 0.15s ease"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = BLUE_LIGHT; e.currentTarget.style.color = BLUE_LIGHT; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Stop Generating Button while streaming */}
        {isGenerating && (
          <div style={{ display: "flex", justifyContent: "center", margin: "4px 0" }}>
            <button
              onClick={handleStopGenerating}
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.4)",
                borderRadius: 999,
                padding: "6px 16px",
                color: "#EF4444",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <span>⏹</span> Stop generating
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── QUICK ACTION CHIPS (Above Composer) ── */}
      {messages.length <= 1 && (
        <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "6px 2px", marginBottom: 6, flexShrink: 0 }}>
          {[
            "Build my meals for today",
            "What should I eat with my remaining macros?",
            "Create today’s workout",
            "High-protein meal ideas",
            "Analyse my nutrition today",
            "How am I doing today?"
          ].map((prompt, pIdx) => (
            <button
              key={pIdx}
              onClick={() => sendMessage(prompt)}
              style={{
                flexShrink: 0,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 999,
                padding: "6px 12px",
                color: "rgba(255,255,255,0.75)",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = BLUE_LIGHT; e.currentTarget.style.color = BLUE_LIGHT; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* ── TOAST SNACKBAR ── */}
      {toastMsg && (
        <div style={{
          position: "fixed",
          bottom: 84,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#EAF2FF",
          border: `1.5px solid ${LIME}`,
          borderRadius: 999,
          padding: "8px 20px",
          color: BLUE_LIGHT,
          fontSize: 12,
          fontWeight: 800,
          zIndex: 9999,
          boxShadow: "0 10px 30px rgba(0,0,0,0.8)"
        }}>
          {toastMsg}
        </div>
      )}

      {/* ── CHATGPT-STYLE STICKY MESSAGE COMPOSER ── */}
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        background: "#14171F",
        border: "1.5px solid rgba(255,255,255,0.1)",
        borderRadius: 20,
        padding: "8px 10px 8px 14px",
        boxShadow: "inset 2px 2px 6px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.5)",
        flexShrink: 0
      }}>
        {/* Voice mic button */}
        <button
          onClick={handleVoiceInput}
          style={{
            background: isListening ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${isListening ? "#EF4444" : "rgba(255,255,255,0.1)"}`,
            borderRadius: "50%",
            width: 36,
            height: 36,
            color: isListening ? "#EF4444" : "rgba(255,255,255,0.7)",
            fontSize: 15,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 2
          }}
          title="Dictate with voice"
        >
          🎙️
        </button>

        {/* Multi-line textarea */}
        <textarea
          ref={inputRef}
          rows={1}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Ask Coach anything…"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: 500,
            outline: "none",
            fontFamily: "inherit",
            resize: "none",
            maxHeight: 100,
            padding: "8px 0 6px",
            lineHeight: 1.4
          }}
        />

        {/* Clear input if present */}
        {inputText.trim() && (
          <button
            onClick={() => setInputText("")}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.4)",
              fontSize: 14,
              cursor: "pointer",
              padding: "0 4px",
              marginBottom: 8
            }}
          >
            ✕
          </button>
        )}

        {/* Send Button */}
        <button
          onClick={() => sendMessage()}
          disabled={!inputText.trim() || isGenerating}
          style={{
            background: inputText.trim() && !isGenerating ? "linear-gradient(135deg, #3678F5 0%, #1A5EE5 100%)" : "rgba(255,255,255,0.08)",
            color: inputText.trim() && !isGenerating ? "#FFFFFF" : "rgba(255,255,255,0.3)",
            border: "none",
            borderRadius: 14,
            width: 38,
            height: 38,
            fontWeight: 900,
            fontSize: 16,
            cursor: inputText.trim() && !isGenerating ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: inputText.trim() && !isGenerating ? `0 2px 10px rgba(54, 120, 245, 0.4)` : "none",
            marginBottom: 1
          }}
          title="Send message"
        >
          ↑
        </button>
      </div>

    </div>
  );
}
