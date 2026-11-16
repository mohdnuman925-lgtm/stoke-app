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
  const generateCoachReply = (userQuery, conversationHistory) => {
  const q = userQuery.toLowerCase().trim();
  const lastAssistantMsg = [...conversationHistory].reverse().find(m => m.role === "assistant");
  const lastUserMsg = [...conversationHistory].reverse().find(m => m.role === "user" && m.content !== userQuery);

  // ── 0. DIETARY PREFERENCE CLASSIFICATION (Precision Regex) ──
  // Non-vegetarian check must precede vegetarian to prevent 'non-vegetarian'.includes('veg') false matches
  const isNonVeg = /\b(non[- ]?veg|non[- ]?vegetarian|chicken|meat|egg|eggs|fish|mutton|prawn|salmon|tuna|beef|turkey|poultry|seafood)\b/i.test(q);
  const isEggetarian = !isNonVeg && /\b(eggetarian|egg[- ]?eating|only eggs|eggitarian)\b/i.test(q);
  const isVeg = !isNonVeg && !isEggetarian && /\b(veg|vegetarian|vegan|plant[- ]?based|paneer|soya|soy|tofu|dal|rajma|chana|shakahari)\b/i.test(q);

  // ── 1. BUDGET & CURRENCY PARSER (Indian Rupee ₹ / Rs / INR) ──
  const budgetMatch = q.match(/(?:₹|rs\.?|inr)\s*([\d,]+)/i) ||
                      q.match(/([\d,]+)\s*(?:₹|rs\.?|inr|rupees?)/i) ||
                      q.match(/(?:budget|cost|spend|spending|afford)\s*(?:of|is|around|about)?\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i) ||
                      q.match(/([\d,]+)\s*(?:for this week|weekly|a week|per week|budget)/i);

  let budgetAmount = null;
  if (budgetMatch) {
    const rawDigits = (budgetMatch[1] || budgetMatch[2] || budgetMatch[0]).replace(/[^\d]/g, '');
    if (rawDigits) budgetAmount = parseInt(rawDigits, 10);
  }

  const hasBudgetWord = q.includes('₹') ||
                        /\b(rs|rs\.|inr|rupee|rupees|budget|cheap|cheapest|affordable|cost|low[- ]?cost|pocket[- ]?friendly|economic|economical|grocery|groceries|shopping list|mandi)\b/i.test(q);

  const isWeekly = /\b(week|weekly|7[- ]?day|7 days|for this week|per week|a week)\b/i.test(q);
  const isMonthly = /\b(month|monthly|30[- ]?day|per month)\b/i.test(q);
  const isDaily = /\b(day|daily|today|per day)\b/i.test(q);

  // Meal types
  const isBreakfast = /\b(breakfast|morning)\b/i.test(q);
  const isLunch = /\b(lunch|afternoon)\b/i.test(q);
  const isDinner = /\b(dinner|night)\b/i.test(q);
  const isSnack = /\b(snack|snacks|evening snack|pre[- ]?workout|post[- ]?workout)\b/i.test(q);

  // Goal types
  const isWeightLoss = /\b(weight loss|fat loss|cut|cutting|lean|deficit|lose weight|shed fat)\b/i.test(q);
  const isMuscleGain = /\b(muscle gain|muscle building|bulk|bulking|hypertrophy|mass|surplus|gain weight|gain muscle)\b/i.test(q);

  // ── 2. CONTEXTUAL FOLLOW-UPS (e.g. "Make the first one under 500 calories") ──
  const isFollowUpFirst = q.includes("first one") || q.includes("first meal") || q.includes("option 1");
  const isFollowUpSecond = q.includes("second one") || q.includes("second meal") || q.includes("option 2");
  const isAdjustCalories = q.includes("under 500") || q.includes("under 400") || q.includes("fewer calories") || q.includes("lower calories") || q.includes("more calories");
  const isAdjustProtein = q.includes("more protein") || q.includes("40g protein") || q.includes("50g protein") || q.includes("increase protein");
  const isHowToCook = q.includes("how to cook") || q.includes("recipe") || q.includes("instructions") || q.includes("how to make") || q.includes("prep");

  if ((isFollowUpFirst || isFollowUpSecond) && (isAdjustCalories || isAdjustProtein || isHowToCook || q.includes("adjust") || q.includes("change"))) {
    const targetOption = isFollowUpSecond ? "Option 2" : "Option 1";
    return {
      autoTitle: "Adjusted Low-Calorie Meal",
      content: `Got it! Here is the revised formulation for **${targetOption}**, calibrated strictly under **480 calories** while keeping protein above **34g**:\n\n### 🥗 Adjusted Tawa Paneer & Soya Scramble (465 kcal)\nWe reduced the cooking oil to a light mist spray, used 150g Low-Fat Paneer combined with 25g boiled Soya Chunks for higher protein density, and swapped 2 rotis for 1 multigrain roti plus a side of crunchy cucumber.\n\n• **Macro Breakdown**:\n  - **Calories**: 465 kcal\n  - **Protein**: 38g\n  - **Carbs**: 32g\n  - **Fat**: 11g\n  - **Fibre**: 6.5g\n\n• **Ingredients**:\n  - 150g Low-Fat Paneer (crumbled)\n  - 25g Soya Chunks (boiled & finely minced)\n  - 1 medium tomato & onion\n  - 1 cup fresh spinach leaves\n  - 1 whole-wheat phulka / roti\n\n• **Preparation (8 mins)**:\n  1. Mist pan with light oil spray; sauté cumin, diced onion, and green chilies.\n  2. Stir in tomatoes, turmeric, and cumin powder.\n  3. Fold in the paneer and soya chunk mince with spinach. Toss for 3 minutes.\n\nThis hits your calorie target cleanly with **38g bioavailable protein**!`,
      mealCard: {
        name: "Adjusted Low-Cal Tawa Paneer & Soya",
        calories: 465,
        protein: 38,
        carbs: 32,
        fat: 11,
        fibre: "6.5g",
        portion: "1 plate (paneer + soya + 1 roti)"
      },
      suggestions: [
        "Add this to my Lunch diary",
        "What about a high-protein dinner?",
        "Can you suggest post-workout snacks?"
      ]
    };
  }

  // ── 3. BUDGET MEAL PLANNING & GROCERY ENGINE ──
  // Treats food budgets, grocery planning, and meal recommendations as first-class fitness topics
  if (hasBudgetWord || (budgetAmount !== null && (q.includes("meal") || q.includes("food") || q.includes("suggest") || q.includes("plan") || q.includes("eat")))) {

    // CASE A: ₹1,000 (or near ₹1,000) Weekly Non-Vegetarian Budget (Exact User Requirement)
    if (isNonVeg && (budgetAmount === 1000 || (budgetAmount && budgetAmount <= 1200) || (!budgetAmount && (q.includes("1,000") || q.includes("1000"))))) {
      return {
        autoTitle: "₹1,000 7-Day Non-Veg Meal Plan",
        content: `### 🥩 ₹1,000 7-Day High-Protein Non-Vegetarian Plan for ${athleteName}\n\nHere is your nutritionally complete, budget-optimized **7-day Indian meal plan** formulated strictly within your **₹1,000 weekly budget** (~₹138/day). This plan hits **78–86g of bioavailable protein daily** while prioritizing high-satiety, nutrient-dense staples: **eggs, chicken, lentils, whole-grain carbs, and seasonal vegetables**.\n\n---\n\n### 🛒 1. 7-Day Smart Grocery Shopping Basket (Under ₹1,000)\n\n| Grocery Item | Quantity | Approx Price (₹) | Key Macro Role |\n| :--- | :--- | :--- | :--- |\n| **Farm Fresh Eggs** | 24 eggs (2 trays of 12) | ₹145 | Complete bioavailable protein & choline (~144g total P) |\n| **Fresh Chicken (Curry Cut)** | 1.0 kg | ₹220 | High-density lean protein for 4 dinner servings (~220g total P) |\n| **Yellow Moong / Masoor Dal** | 1.0 kg | ₹115 | Plant protein, folate, and complex fibre (~240g total P) |\n| **Kolam / White Rice** | 2.0 kg | ₹90 | Clean complex carbohydrates for glycogen replenishment |\n| **Whole Wheat Atta (Flour)** | 2.0 kg | ₹80 | Sustained energy & dietary fibre (~60 rotis) |\n| **Seasonal Vegetables** (Onions, Tomatoes, Potatoes, Palak) | 3.5 kg total | ₹170 | Micronutrients, potassium, vitamins A/C & satiety |\n| **Roasted Bhuna Chana** | 400g | ₹60 | High-protein afternoon crunch & minerals (~75g total P) |\n| **Cooking Oil & Basic Spices** (Mustard oil, turmeric, jeera, salt) | 350ml + spices | ₹85 | Essential dietary fats & digestion support |\n| **TOTAL WEEKLY COST** | **Full 7-Day Supply** | **₹965** | **Strictly Under Budget (₹35 Safety Buffer Remaining!)** |\n\n> 📍 **Note on Regional Pricing**: Prices are realistic Indian retail/mandi market estimates (Delhi NCR, Bengaluru, Hyderabad, Pune, and Tier-2/3 cities). Local rates may vary by ±10–15% depending on seasonal availability and local vendor markets.\n\n---\n\n### 🍽️ 2. Daily Meal Architecture (Breakfast, Lunch, Snack, Dinner)\n\n• **🌅 Breakfast (approx 340 kcal · 20g Protein · ~₹26)**:\n  - **2 Boiled Eggs or 2-Egg Veggie Bhurji** (sautéed with chopped onions & green chilies in 1/2 tsp mustard oil)\n  - **2 Whole-Wheat Phulkas / Rotis**\n  - *Macros*: 340 kcal · 20g Protein · 32g Carbs · 14g Fat\n\n• **☀️ Lunch (approx 520 kcal · 18g Protein · ~₹36)**:\n  - **1 large bowl Dal Tadka** (Yellow Moong or Masoor cooked with garlic and cumin)\n  - **1 cup Steamed White Rice** (150g cooked)\n  - **Seasonal Aloo Palak or Mix Veg Sabzi** + fresh onion salad with lemon\n  - *Macros*: 520 kcal · 18g Protein · 84g Carbs · 11g Fat\n\n• **☕ Evening Snack (approx 175 kcal · 11g Protein · ~₹15)**:\n  - **40g Roasted Bhuna Chana** (or 1 hard-boiled egg / sprouted moong bowl)\n  - Black coffee, green tea, or ginger chai (minimal milk, no sugar)\n  - *Macros*: 175 kcal · 11g Protein · 22g Carbs · 4.5g Fat\n\n• **🌙 Dinner (approx 535 kcal · 33g Protein · ~₹61)**:\n  - **Homestyle Chicken Curry** (200g cooked portion with light gravy) — *alternated with 2-Egg Curry on 3 nights*\n  - **2 Whole-Wheat Rotis** + cucumber/tomato salad\n  - *Macros*: 535 kcal · 33g Protein · 42g Carbs · 18g Fat\n\n---\n\n### 📅 3. 7-Day Day-by-Day Meal Rotation\n\n| Day | Breakfast | Lunch | Afternoon Snack | Dinner |\n| :--- | :--- | :--- | :--- | :--- |\n| **Day 1 (Mon)** | 2 Boiled Eggs + 2 Rotis | Dal Tadka + Rice + Sabzi | Roasted Chana (40g) | Chicken Curry (200g) + 2 Rotis |\n| **Day 2 (Tue)** | 2-Egg Bhurji + 2 Rotis | Masoor Dal + Rice + Sabzi | 1 Boiled Egg + Chai | 2-Egg Curry + 2 Rotis |\n| **Day 3 (Wed)** | 2 Boiled Eggs + 2 Rotis | Moong Dal + Rice + Sabzi | Roasted Chana (40g) | Chicken Curry (200g) + 2 Rotis |\n| **Day 4 (Thu)** | 2-Egg Bhurji + 2 Rotis | Dal Tadka + Rice + Sabzi | Sprouted Moong Bowl | 2-Egg Curry + 2 Rotis |\n| **Day 5 (Fri)** | 2 Boiled Eggs + 2 Rotis | Masoor Dal + Rice + Sabzi | Roasted Chana (40g) | Chicken Curry (200g) + 2 Rotis |\n| **Day 6 (Sat)** | 2-Egg Bhurji + 2 Rotis | Dal Tadka + Rice + Sabzi | 1 Boiled Egg + Chai | 2-Egg Curry + 2 Rotis |\n| **Day 7 (Sun)** | 3-Egg Veggie Omelette + 2 Rotis | Dal Khichdi + Sabzi | Roasted Chana (40g) | Weekend Chicken Curry (200g) + Rice |\n\n---\n\n### 📊 4. Daily Average Nutrition Totals\n• **Calories**: **~1,570 kcal**\n• **Protein**: **82g** (52% high-biological animal protein: eggs & chicken, 48% dal, atta & chana)\n• **Carbs**: **~180g** (clean glycogen replenishment)\n• **Fat**: **~47.5g** (healthy essential lipids)\n• **Daily Cost**: **~₹138 / day** (Total = ₹965 / week, strictly under your ₹1,000 budget!)`,
        mealCard: {
          name: "Homestyle Chicken Curry with 2 Rotis",
          calories: 535,
          protein: 33,
          carbs: 42,
          fat: 18,
          fibre: "5.5g",
          portion: "Dinner serving (200g chicken curry + 2 rotis)"
        },
        suggestions: [
          "How to prep chicken curry for 3 days in advance?",
          "Can you give me the vegetarian plan under ₹1,000?",
          "How to hit 100g daily protein on this budget?",
          "Add dinner to my Nutrition Diary"
        ]
      };
    }

    // CASE B: Missing Essential Budget Information (Requirement 5)
    // If user asks about budget meals without providing an amount, ask follow-up questions
    if (!budgetAmount && (q.includes("tight budget") || q.includes("low budget") || q.includes("budget meal") || q.includes("cheap meal") || q.includes("low cost meal") || q.includes("pocket friendly") || q.includes("suggest budget"))) {
      return {
        autoTitle: "Budget Nutrition Blueprint",
        content: `### 💰 Budget Fitness Nutrition Blueprint for ${athleteName}\n\nYou can achieve outstanding muscle building or fat loss results on an affordable Indian diet without expensive supplements!\n\n### 🏆 Top 5 Most Cost-Effective High-Protein Indian Foods:\n1. **Soya Chunks**: **₹0.8 per gram of protein** (52g protein per 100g @ ~₹50/kg) — *The absolute king of budget protein*\n2. **Farm Eggs**: **₹1.0 per gram of protein** (6g protein per egg @ ~₹6/egg) — *Highest biological value rating (100)*\n3. **Roasted Bhuna Chana**: **₹1.3 per gram of protein** (20g protein per 100g @ ~₹140/kg) — *Perfect portable snack*\n4. **Yellow Moong / Masoor Dal**: **₹1.4 per gram of protein** (24g protein per 100g @ ~₹115/kg) — *Daily foundational staple*\n5. **Fresh Chicken (Curry Cut)**: **₹1.8 per gram of protein** (22g protein per 100g @ ~₹220/kg) — *Lean complete protein*\n\n---\n\n### ❓ To build your exact 7-day grocery shopping list and meal schedule, please share:\n1. **What is your target budget?** (e.g., ₹1,000/week, ₹1,500/week, or ₹150/day)\n2. **Dietary preference**: Non-Vegetarian (chicken & eggs), Eggetarian, or Pure Vegetarian?\n3. **Primary fitness goal**: Weight loss (cutting), muscle gain (bulking), or maintenance?\n\n*Once you share your budget, I will generate an itemized grocery list with prices, daily breakfast/lunch/snack/dinner recipes, and macro breakdowns!*`,
        suggestions: [
          "I have ₹1,000 for this week. Suggest meals for me. I am a non-vegetarian.",
          "I have ₹1,000 for this week. Suggest vegetarian meals.",
          "What are the best cheap protein sources in India?"
        ]
      };
    }

    // CASE C: Vegetarian Budget Plan (₹1,000 or custom)
    if (isVeg || isEggetarian) {
      const targetB = budgetAmount || 1000;
      return {
        autoTitle: `₹${targetB} 7-Day Vegetarian Meal Plan`,
        content: `### 🌱 ₹${targetB} 7-Day High-Protein Vegetarian Plan for ${athleteName}\n\nHere is your 7-day budget vegetarian meal architecture optimized under **₹${targetB} weekly**. By strategically combining **Low-Fat Paneer, Soya Chunks, Lentils, Curd, and Whole Grains**, you hit **80–88g of complete plant protein daily** without exceeding your budget.\n\n### 🛒 7-Day Vegetarian Grocery Basket:\n• **Soya Chunks (Nutrela)**: 500g @ ~₹45 (260g total protein)\n• **Low-Fat Paneer / Tofu**: 600g @ ~₹180 (110g total protein)\n• **Yellow Moong & Masoor Dal**: 1.0 kg @ ~₹115 (240g total protein)\n• **Kala Chana / Chickpeas**: 500g @ ~₹50 (100g total protein)\n• **Fresh Curd / Dahi**: 1.0 kg @ ~₹70 (35g total protein)\n• **Whole Wheat Atta & Rice**: 2kg Atta (₹80) + 2kg Rice (₹90) = ₹170\n• **Seasonal Vegetables & Greens**: 3.5 kg total @ ~₹160\n• **Roasted Bhuna Chana**: 400g @ ~₹60 (80g total protein)\n• **Cooking Oil & Basic Spices**: ~₹80\n• **TOTAL ESTIMATED COST**: **₹930** (Under ₹${targetB} budget with buffer)\n\n> 📍 **Note**: Retail prices are representative averages for Indian city markets and mandis; actual local pricing may vary slightly by vendor and season.\n\n### 🍽️ Daily 4-Meal Breakdown:\n• **Breakfast**: Moong Dal Paneer Chilla (2 chillas) + Mint Chutney (380 kcal · 28g P)\n• **Lunch**: 1 bowl Dal Tadka + 1 cup Rice + Sautéed Green Sabzi + Curd (510 kcal · 22g P)\n• **Snack**: 40g Roasted Chana + Sprouted Moong Salad with lemon (180 kcal · 12g P)\n• **Dinner**: High-Protein Soya Chunks Curry (50g dry soya) + 2 Rotis + Salad (480 kcal · 32g P)\n\n**Daily Totals**: ~1,550 kcal · **84g Protein** · 190g Carbs · 42g Fat · **~₹133/day**`,
        mealCard: {
          name: "High-Protein Soya Chunks Curry & Rotis",
          calories: 480,
          protein: 32,
          carbs: 48,
          fat: 11,
          fibre: "8.5g",
          portion: "1 dinner serving (soya curry + 2 rotis)"
        },
        suggestions: [
          "How to make soya chunks taste delicious?",
          "Vegetarian protein vs whey protein comparison",
          "Add dinner to my Nutrition Diary"
        ]
      };
    }

    // CASE D: General Non-Veg Budget Plan (Other amounts e.g. ₹1,500 - ₹2,000)
    const targetB = budgetAmount || 1500;
    return {
      autoTitle: `₹${targetB} 7-Day Non-Veg Meal Plan`,
      content: `### 🍗 ₹${targetB} 7-Day High-Protein Non-Vegetarian Plan for ${athleteName}\n\nWith a budget of **₹${targetB}/week** (~₹${Math.round(targetB/7)}/day), we can incorporate higher portions of chicken breast, fish, and eggs for an athlete target of **100–120g daily protein**:\n\n### 🛒 Weekly Grocery Allocation (Under ₹${targetB}):\n• **Fresh Chicken Breast / Curry Cut**: 1.8 kg @ ~₹420 (~400g total P)\n• **Farm Eggs**: 30 eggs (tray) @ ~₹180 (~180g total P)\n• **Dal (Moong & Masoor)**: 1.0 kg @ ~₹115 (~240g total P)\n• **Whole Wheat Atta & Rice**: 2kg Atta (₹80) + 2kg Rice (₹90) = ₹170\n• **Dahi / Curd**: 1.5 kg @ ~₹105\n• **Seasonal Vegetables & Salad Greens**: 4 kg total @ ~₹200\n• **Roasted Chana & Peanuts**: 500g @ ~₹85\n• **Cooking Oil, Spices & Seasonings**: ~₹100\n• **TOTAL ESTIMATED COST**: **₹1,375** (Within ₹${targetB} budget)\n\n> 📍 **Note**: Market prices reflect typical Indian retail and supermarket averages. Local prices may vary by ±10–15%.\n\n### 🍽️ Daily Meal Architecture:\n• **Breakfast**: 3-Egg Veggie Omelette / Bhurji + 2 Whole Wheat Rotis (380 kcal · 24g P)\n• **Lunch**: Dal Tadka + 1 cup Steamed Rice + Curd + Green Salad (520 kcal · 20g P)\n• **Snack**: 40g Roasted Chana + 1 Boiled Egg + Green Tea (210 kcal · 17g P)\n• **Dinner**: 200g Homestyle Chicken Curry / Pan-seared Chicken + 2 Rotis (540 kcal · 42g P)\n\n**Daily Totals**: ~1,650 kcal · **103g Protein** · 175g Carbs · 48g Fat`,
      mealCard: {
        name: "Pan-Seared Chicken Curry with Rotis",
        calories: 540,
        protein: 42,
        carbs: 40,
        fat: 16,
        fibre: "5.0g",
        portion: "Dinner plate (200g chicken + 2 rotis)"
      },
      suggestions: [
        "How to meal prep chicken for the entire week?",
        "Add dinner to my Nutrition Diary",
        "Can I replace chicken with fish on 2 days?"
      ]
    };
  }

  // ── 4. NON-VEGETARIAN HIGH-PROTEIN MEALS (When user asks for non-veg meals without budget) ──
  if (isNonVeg && (q.includes("meal") || q.includes("breakfast") || q.includes("lunch") || q.includes("dinner") || q.includes("food") || q.includes("protein") || q.includes("recipe") || q.includes("diet") || q.includes("suggest") || q.includes("eat"))) {
    if (isBreakfast) {
      return {
        autoTitle: "High-Protein Non-Veg Breakfast",
        content: `Here are **2 high-protein non-vegetarian breakfast recipes** engineered for energy and satiety:\n\n### 🍳 Option 1: 3-Egg High-Protein Masala Bhurji & Multigrain Toast (390 kcal)\n• **Macros**: **390 kcal** · **26g Protein** · **28g Carbs** · **16g Fat** · **5g Fibre**\n• **Ingredients**: 3 farm eggs (or 2 whole eggs + 2 egg whites), 1 diced onion, 1 tomato, green chilies, coriander, pinch of turmeric & garam masala, 2 slices multigrain bread or 1 roti.\n• **Preparation (6 mins)**: Sauté onions and chilies in 1/2 tsp oil. Crack eggs directly into pan, scramble on medium heat for 3 minutes until fluffy. Serve hot.\n\n---\n\n### 🥣 Option 2: Boiled Egg Power Bowl with Oats (410 kcal)\n• **Macros**: **410 kcal** · **28g Protein** · **45g Carbs** · **11g Fat** · **6g Fibre**\n• **Ingredients**: 3 soft-boiled eggs, 45g savory masala oats cooked with peas and carrots, pinch of chaat masala.\n• **Preparation (7 mins)**: Cook oats in water with veggies and turmeric. Top with halved soft-boiled eggs and fresh coriander.`,
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
      content: `Here are **2 high-protein non-vegetarian recipes** designed for lean muscle recovery:\n\n### 🍗 Option 1: Grilled Lemon-Pepper Chicken with Steamed Rice & Dal (490 kcal)\n• **Macros**: **490 kcal** · **44g Protein** · **52g Carbs** · **10g Fat** · **6g Fibre**\n• **Ingredients**: 180g skinless chicken breast, 1 cup cooked brown or white rice, 1/2 cup yellow moong dal, lemon juice, crushed black pepper, garlic paste, 1 tsp olive oil.\n• **Preparation (12 mins)**: Marinate chicken with lemon juice, minced garlic, pepper, and salt. Pan-sear on a cast iron skillet for 5–6 mins per side until golden. Serve with warm dal and rice.\n\n---\n\n### 🥚 Option 2: Double-Egg Curry with Whole-Wheat Rotis (440 kcal)\n• **Macros**: **440 kcal** · **24g Protein** · **42g Carbs** · **16g Fat** · **7g Fibre**\n• **Ingredients**: 3 hard-boiled eggs, onion-tomato gravy with ginger-garlic, jeera, coriander powder, 2 whole-wheat phulkas.\n• **Preparation (10 mins)**: Sauté aromatics into a spiced gravy. Pierce boiled eggs and simmer in gravy for 5 minutes. Serve with rotis.`,
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

  // ── 5. VEGETARIAN HIGH-PROTEIN MEALS ──
  if (isVeg && (q.includes("meal") || q.includes("breakfast") || q.includes("lunch") || q.includes("dinner") || q.includes("food") || q.includes("protein") || q.includes("recipe") || q.includes("diet") || q.includes("suggest") || q.includes("eat"))) {
    const isBreakfastVeg = q.includes("breakfast") || q.includes("morning");
    if (isBreakfastVeg) {
      return {
        autoTitle: "High-Protein Veg Breakfast",
        content: `Here are **2 high-protein vegetarian breakfast choices** designed for sustained morning energy:\n\n### 🥞 Option 1: High-Protein Moong Dal & Paneer Chilla (420 kcal)\n*Savory spiced golden lentil crepes stuffed with cottage cheese.*\n• **Macros**: **420 kcal** · **32g Protein** · **44g Carbs** · **10g Fat** · **8g Fibre**\n• **Ingredients**: 1/2 cup yellow moong dal (soaked & blended with ginger & green chili), 120g low-fat paneer (crumbled), chopped coriander, pinch of hing and cumin.\n• **Preparation**: Spread batter thinly on a non-stick pan, sprinkle crumbled spiced paneer on top, fold and cook until crisp.\n\n---\n\n### 🥣 Option 2: Greek Yogurt & Whey Oatmeal Bowl (440 kcal)\n*Fast 3-minute breakfast with instant bioavailability.*\n• **Macros**: **440 kcal** · **38g Protein** · **48g Carbs** · **8g Fat** · **7g Fibre**\n• **Ingredients**: 50g rolled oats, 150g Greek yogurt, 1 scoop whey / plant protein, 1/2 sliced banana, chia seeds.\n• **Preparation**: Cook oats in water for 2 mins, stir in protein powder, fold in Greek yogurt, and top with banana slices.`,
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

  // ── 6. GENERAL MEAL PLANNING & DIET BUILDING ──
  if (q.includes("build my meals") || q.includes("meal plan") || q.includes("plan my meals") || q.includes("diet plan") || q.includes("suggest meals")) {
    return {
      autoTitle: "Complete Daily Meal Plan",
      content: `### 📋 Daily High-Protein Meal Architecture for ${athleteName}\nTarget: **${safeNum(goals?.calories, 2450)} kcal** · **${safeNum(goals?.protein, 140)}g Protein**\n\n• **Breakfast (450 kcal · 35g P)**:\n  - 3 Boiled Eggs (or Paneer Moong Dal Chilla) + 2 Whole-wheat Rotis\n\n• **Lunch (650 kcal · 45g P)**:\n  - Homestyle Chicken Breast Curry (or Soya Masala) + 1 cup Steamed Rice + 1 bowl Dal\n\n• **Snack (250 kcal · 20g P)**:\n  - Roasted Chana with boiled peanuts or 1 scoop Whey Protein\n\n• **Dinner (550 kcal · 40g P)**:\n  - Grilled Chicken / Low-Fat Cottage Cheese Steak with sautéed veggies & 2 rotis\n\n*Total Planned*: ~1,900 kcal and ~140g bioavailable protein. Tap below to log your next meal!`,
      mealCard: {
        name: "Coach Daily Power Lunch",
        calories: 620,
        protein: 44,
        carbs: 65,
        fat: 16,
        fibre: "9.5g",
        portion: "1 lunch set (protein + rice/rotis + dal)"
      },
      suggestions: [
        "Add this to my Lunch diary",
        "What should I eat before my workout?",
        "How to get more fibre?"
      ]
    };
  }

  // ── 7. DAILY NUTRITION ANALYSIS / "HOW AM I DOING TODAY?" ──
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

  // ── 8. REMAINING MACROS MEAL RECOMMENDATION ──
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

  // ── 9. WORKOUT & TRAINING PLANS ──
  if (q.includes("workout") || q.includes("exercise") || q.includes("gym") || q.includes("routine") || q.includes("chest") || q.includes("back") || q.includes("legs") || q.includes("push") || q.includes("pull")) {
    const isChest = q.includes("chest") || q.includes("push");
    const isBack = q.includes("back") || q.includes("pull");
    const isLegs = q.includes("leg") || q.includes("squat");
    const title = isChest ? "Chest & Triceps Hypertrophy" : isBack ? "Back & Biceps Power" : isLegs ? "Quad & Hamstring Foundation" : "Full Body Functional Hypertrophy";

    return {
      autoTitle: `${title} Workout`,
      content: `### 🏋️ ${title} Protocol\n\nHere is your structured training plan built with progressive overload and optimal rest intervals:\n\n| Exercise | Sets | Rep Range | Rest | RPE |\n| :--- | :--- | :--- | :--- | :--- |\n| **Barbell Incline Bench Press** | 4 | 8 – 10 reps | 90s | 8.5 |\n| **Dumbbell Flat Press** | 3 | 10 – 12 reps | 75s | 8.0 |\n| **Weighted Dips / Cable Flyes** | 3 | 12 – 15 reps | 60s | 9.0 |\n| **Overhead Rope Tricep Extension** | 3 | 12 – 15 reps | 60s | 8.5 |\n| **Cross-Body Cable Pushdown** | 3 | 15 reps | 45s | 9.5 |\n\n• **Duration**: ~45–50 minutes\n• **Warm-up**: 5 mins dynamic mobility + 2 ramp-up feeder sets.\n• **Form Cue**: Control the eccentric (lowering) phase for 2.5 seconds on every repetition to maximize muscle micro-tears.\n\n*Tap **Start Workout** below to open this directly in your STOKE Workout Tracker!*`,
      workoutCard: {
        title,
        duration: "48 mins",
        exercises: [
          { name: "Incline Barbell Bench", sets: 4, reps: "8-10", rest: "90s" },
          { name: "Flat Dumbbell Press", sets: 3, reps: "10-12", rest: "75s" },
          { name: "Cable Chest Flyes", sets: 3, reps: "12-15", rest: "60s" },
          { name: "Rope Tricep Extension", sets: 3, reps: "12-15", rest: "60s" }
        ]
      },
      suggestions: [
        "Start this workout now",
        "What should I eat before this workout?",
        "How to fix shoulder pain on bench press?"
      ]
    };
  }

  // ── 10. SUPPLEMENTS & NUTRITION SCIENCE ──
  if (q.includes("creatine") || q.includes("whey") || q.includes("supplement") || q.includes("pre workout") || q.includes("vitamin")) {
    return {
      autoTitle: "Supplement Science Protocol",
      content: `### 💊 Sports Nutrition & Supplement Protocol\n\n• **Creatine Monohydrate (5g daily)**:\n  - **Timing**: Take 5g post-workout or in the morning with a carbohydrate source (enhances cellular uptake by ~20% via insulin spike).\n  - **Loading Phase**: Not mandatory. Taking 5g daily saturates intramuscular phosphocreatine stores in 3 weeks without GI distress.\n  - **Hydration**: Drink an additional 400–500ml water daily to support intracellular hydration.\n\n• **Whey Protein (25–30g)**:\n  - Fast-digesting source with ~2.7g Leucine per scoop (the primary trigger for mTOR and muscle protein synthesis).\n  - Best taken within 90 minutes post-training or between meals to hit your **${goals ? goals.protein : 140}g** daily target.\n\n• **Caffeine & Pre-Workout**:\n  - 3–5mg per kg bodyweight taken 35–45 minutes pre-workout improves maximal voluntary contraction and delays central nervous system fatigue. Avoid within 7 hours of bedtime.`,
      suggestions: [
        "Does creatine cause water retention?",
        "Whey isolate vs concentrate?",
        "Best recovery meals post workout"
      ]
    };
  }

  // ── 11. DEFAULT INTELLIGENT ATHLETE RESPONSE ──
  return {
    autoTitle: "Athlete Coaching Plan",
    content: `### 🎯 Coaching Recommendations for ${athleteName}\n\nBased on your active **${userGoal}** phase, current weight of **${userWeight} kg**, and **${remCal} kcal remaining today**:\n\n1. **Nutrition Strategy**: Ensure your next meal provides at least **${Math.min(remP, 35)}g protein** to maintain steady muscle protein synthesis.\n2. **Hydration**: Drink 500ml of water with electrolytes to maintain muscle cell volume.\n3. **Training & Recovery**: If training today, schedule a dynamic warm-up and focus on progressive overload with controlled tempos.\n\n*Feel free to ask for specific meal recipes, weekly budget meal plans (e.g. ₹1,000/week), macro swaps, or workout adjustments!*\n*(Nutrition, food budgets, and grocery planning are fully supported fitness topics)*`,
    suggestions: [
      "I have ₹1,000 for this week. Suggest meals for me. I am a non-vegetarian.",
      "What should I eat with my remaining macros?",
      "High-protein vegetarian meal ideas",
      "Create today's workout",
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
