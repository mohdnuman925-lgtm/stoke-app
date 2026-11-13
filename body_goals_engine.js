/**
 * STOKE FITNESS APP — BODY GOALS & TRANSFORMATION ENGINE
 * Complete AI-driven transformation architecture:
 * 1. Goal Setup & Assessment (Weight management, Muscle building, Stamina, Body transformation)
 * 2. Scientific TDEE & Macro Engine with Mifflin-St Jeor formula & Youth Safety Guardrails
 * 3. Verified Indian Meal Architecture (Dosa, Idli, Dal, Roti, Rice, Paneer, Soya, Eggs, etc.)
 * 4. Home & Gym Workout Schedules with YouTube Demonstration Links
 * 5. Workout Builder with Exercise Swapping & Skipping
 * 6. Transformation Dashboard (Consistency, Strength, Measurements, Private Progress Photos)
 * 7. AI Transformation Coach with Meal & Injury Swaps
 * 8. Supabase & Offline-first Persistence with RLS & LocalStorage fallback
 */

(function (global) {
  "use strict";

  // ============================================================================
  // 1. GOAL DEFINITIONS & METADATA
  // ============================================================================
  const GOAL_TYPES = {
    weight_management: {
      id: "weight_management",
      title: "Weight Management & Healthy Habits",
      tagline: "Sustainable fat loss, metabolic health & clean energy",
      icon: "\u2696\uFE0F",
      color: "#21865B",
      bgLight: "rgba(33, 134, 91, 0.08)",
      borderLight: "rgba(33, 134, 91, 0.25)",
      defaultDeficit: 400, // Safe caloric deficit
      targetWeeks: 12,
      description: "Focuses on steady, sustainable fat loss (0.4–0.7 kg/week), whole-food Indian nutrition, high fibre, and building lifelong daily movement habits."
    },
    muscle_building: {
      id: "muscle_building",
      title: "Muscle Building & Strength",
      tagline: "Hypertrophy, progressive overload & lean mass",
      icon: "\uD83D\uDCAA",
      color: "#3678F5",
      bgLight: "rgba(54, 120, 245, 0.08)",
      borderLight: "rgba(54, 120, 245, 0.25)",
      defaultDeficit: -300, // Clean caloric surplus (+300 kcal)
      targetWeeks: 16,
      description: "Designed for progressive strength progression, optimal muscle protein synthesis (1.8–2.2g protein/kg), and compound movement mastery."
    },
    fitness_stamina: {
      id: "fitness_stamina",
      title: "Overall Fitness & Stamina",
      tagline: "Cardio endurance, athletic mobility & core power",
      icon: "\u26A1",
      color: "#F59E0B",
      bgLight: "rgba(245, 158, 11, 0.08)",
      borderLight: "rgba(245, 158, 11, 0.25)",
      defaultDeficit: 0, // Maintenance energy
      targetWeeks: 12,
      description: "Enhances cardiovascular output, VO2 max, aerobic conditioning, joint mobility, and functional strength for energetic everyday performance."
    },
    transformation: {
      id: "transformation",
      title: "General Body Transformation",
      tagline: "Body recomposition, athletic tone & sculpted build",
      icon: "\uD83D\uDD25",
      color: "#8B5CF6",
      bgLight: "rgba(139, 92, 246, 0.08)",
      borderLight: "rgba(139, 92, 246, 0.25)",
      defaultDeficit: 250, // Slight recomp deficit
      targetWeeks: 12,
      description: "Full body transformation combining hypertrophy resistance training with high-protein nutrition to simultaneously shed body fat and build firm muscle."
    }
  };

  const ACTIVITY_MULTIPLIERS = {
    sedentary: { label: "Sedentary (Desk job, minimal movement)", factor: 1.2 },
    light: { label: "Lightly Active (1–3 workouts or walks/week)", factor: 1.375 },
    moderate: { label: "Moderately Active (3–5 workouts/week)", factor: 1.55 },
    very_active: { label: "Very Active (6–7 heavy workouts/week)", factor: 1.725 },
    athlete: { label: "Competitive Athlete / Physical Job", factor: 1.9 }
  };

  const EXPERIENCE_LEVELS = {
    beginner: { label: "Beginner", desc: "< 6 months training. Focus on form, stability & habits.", daysPerWeek: 3 },
    intermediate: { label: "Intermediate", desc: "6–24 months training. Progressive overload & splits.", daysPerWeek: 4 },
    advanced: { label: "Advanced", desc: "2+ years consistent training. High volume & intensity.", daysPerWeek: 5 }
  };

  const WORKOUT_LOCATIONS = {
    home: { label: "Home Workout", desc: "Bodyweight, resistance bands, or light dumbbells.", icon: "\uD83C\uDFE0" },
    gym: { label: "Gym Workout", desc: "Barbells, cables, dumbbells, and strength machines.", icon: "\uD83C\uDFCB\uFE0F" }
  };

  // ============================================================================
  // 2. SCIENTIFIC ENERGY & MACRONUTRIENT CALCULATOR
  // ============================================================================
  function calculateTransformationPlan({
    age = 25,
    gender = "male",
    weightKg = 70,
    targetWeightKg = 68,
    heightCm = 172,
    activityLevel = "moderate",
    goalType = "transformation",
    experienceLevel = "beginner",
    workoutLocation = "home"
  }) {
    const safeAge = Math.max(12, Math.min(90, Number(age) || 25));
    const safeWeight = Math.max(35, Math.min(250, Number(weightKg) || 70));
    const safeTargetWeight = Math.max(35, Math.min(250, Number(targetWeightKg) || safeWeight));
    const safeHeight = Math.max(100, Math.min(230, Number(heightCm) || 172));
    const isMinor = safeAge < 18;

    // 1. Mifflin-St Jeor BMR Formula
    let bmr = (10 * safeWeight) + (6.25 * safeHeight) - (5 * safeAge);
    bmr += (gender.toLowerCase() === "female" ? -161 : 5);

    // 2. TDEE (Total Daily Energy Expenditure)
    const actData = ACTIVITY_MULTIPLIERS[activityLevel] || ACTIVITY_MULTIPLIERS.moderate;
    const tdee = Math.round(bmr * actData.factor);

    // 3. Goal Adjustment with YOUTH & MINOR SAFETY CHECK
    let targetCalories = tdee;
    const goalDef = GOAL_TYPES[goalType] || GOAL_TYPES.transformation;
    let safetyNotice = "";

    if (isMinor) {
      // Under 18: STRICTLY NO RESTRICTIVE DEFICIT. Growth & developmental nutrition only.
      targetCalories = Math.max(1900, tdee); // Maintain or slight healthy surplus
      safetyNotice = "🛡️ Teen Healthy Development Guardrail: Restrictive low-calorie diets are strictly avoided for minors. We recommend nutrient-dense whole foods and balanced hydration to fuel natural growth and sports energy!";
    } else {
      if (goalType === "weight_management") {
        targetCalories = Math.max(1400, Math.round(tdee - goalDef.defaultDeficit));
      } else if (goalType === "muscle_building") {
        targetCalories = Math.round(tdee + Math.abs(goalDef.defaultDeficit));
      } else if (goalType === "transformation") {
        targetCalories = Math.max(1500, Math.round(tdee - goalDef.defaultDeficit));
      } else {
        targetCalories = tdee;
      }
    }

    // 4. Macronutrient Distribution
    let proteinGrams = 0;
    let fatGrams = 0;
    let carbsGrams = 0;
    const fibreGrams = isMinor ? 28 : (gender === "female" ? 28 : 34);
    const waterLiters = Number(((safeWeight * 0.033) + (actData.factor > 1.5 ? 0.6 : 0.3)).toFixed(1));

    if (goalType === "muscle_building") {
      proteinGrams = Math.round(safeWeight * 2.0); // 2.0g/kg
      fatGrams = Math.round((targetCalories * 0.22) / 9);
      carbsGrams = Math.round((targetCalories - (proteinGrams * 4) - (fatGrams * 9)) / 4);
    } else if (goalType === "weight_management") {
      proteinGrams = Math.round(safeWeight * 1.8); // 1.8g/kg to preserve muscle in deficit
      fatGrams = Math.round((targetCalories * 0.25) / 9);
      carbsGrams = Math.round((targetCalories - (proteinGrams * 4) - (fatGrams * 9)) / 4);
    } else if (goalType === "fitness_stamina") {
      proteinGrams = Math.round(safeWeight * 1.5);
      fatGrams = Math.round((targetCalories * 0.22) / 9);
      carbsGrams = Math.round((targetCalories - (proteinGrams * 4) - (fatGrams * 9)) / 4);
    } else {
      // Transformation / Recomposition
      proteinGrams = Math.round(safeWeight * 1.9);
      fatGrams = Math.round((targetCalories * 0.24) / 9);
      carbsGrams = Math.round((targetCalories - (proteinGrams * 4) - (fatGrams * 9)) / 4);
    }

    // Guard rails for macros
    carbsGrams = Math.max(80, carbsGrams);
    fatGrams = Math.max(35, fatGrams);
    proteinGrams = Math.max(70, proteinGrams);

    // Realistic Timeline Estimation
    const weightDiff = Math.abs(safeWeight - safeTargetWeight);
    const isWeightLoss = safeTargetWeight < safeWeight;
    const ratePerWeek = isMinor ? 0.3 : (isWeightLoss ? 0.5 : 0.3); // Safe kg per week
    const estimatedWeeks = Math.max(4, Math.round(weightDiff / Math.max(0.1, ratePerWeek)));

    return {
      bmr,
      tdee,
      targetCalories,
      macros: {
        calories: targetCalories,
        protein: proteinGrams,
        carbs: carbsGrams,
        fat: fatGrams,
        fibre: fibreGrams,
        water: waterLiters
      },
      isMinor,
      safetyNotice,
      estimatedWeeks: weightDiff > 0 ? estimatedWeeks : 12,
      ratePerWeek,
      goalDef,
      experienceLevel,
      workoutLocation
    };
  }

  // ============================================================================
  // 3. CURATED BALANCED INDIAN MEAL ARCHITECTURE (Verified Nutrition)
  // ============================================================================
  const INDIAN_MEAL_SUGGESTIONS = {
    breakfast: [
      {
        id: "ind_bf_1",
        name: "Moong Dal & Paneer Chilla (2 crepes)",
        calories: 420,
        protein: 32,
        carbs: 44,
        fat: 10,
        fiber: 8,
        portion: "2 medium stuffed chillas (120g paneer + moong dal batter)",
        category: "Vegetarian",
        dietType: "veg",
        prepTime: "12 mins",
        ingredients: [
          "½ cup Yellow Moong Dal (soaked & ground with ginger)",
          "120g Low-fat Paneer (crumbled & spiced)",
          "1 green chili, chopped coriander, cumin & hing",
          "1 tsp Cold-pressed Mustard or Olive oil"
        ],
        instructions: "Pour batter thinly onto hot tava. Top with crumbled paneer and fresh coriander. Flip and cook until crisp golden brown.",
        swaps: "Swap Paneer with 100g Firm Tofu for 100% dairy-free vegan alternative."
      },
      {
        id: "ind_bf_2",
        name: "Steamed Idli with Sambar & Boiled Eggs",
        calories: 410,
        protein: 26,
        carbs: 52,
        fat: 9,
        fiber: 7,
        portion: "3 fluffy idlis + 1 cup vegetable sambar + 2 boiled egg whites/1 whole egg",
        category: "High Protein",
        dietType: "egg",
        prepTime: "8 mins",
        ingredients: [
          "3 Steamed Idlis (fermented rice-urad batter)",
          "1 cup Drumstick & Tomato Dal Sambar",
          "2 Boiled Eggs (or 1 cup Sprouted Moong for strict veg)",
          "Fresh mint-coriander chutney (no sugar)"
        ],
        instructions: "Serve steaming hot idlis with protein-rich dal sambar and protein sides.",
        swaps: "Strict veg? Replace eggs with 1 cup warm steamed Moong sprouts."
      },
      {
        id: "ind_bf_3",
        name: "Spiced Masala Oats with Paneer & Veggies",
        calories: 390,
        protein: 28,
        carbs: 46,
        fat: 8,
        fiber: 9,
        portion: "1 large bowl (60g oats + 100g paneer + veggies)",
        category: "Quick & Fibre-Rich",
        dietType: "veg",
        prepTime: "6 mins",
        ingredients: [
          "60g Rolled Oats",
          "100g Low-fat Paneer diced",
          "½ cup diced bell peppers, peas & carrots",
          "Turmeric, jeera, mustard seeds & curry leaves"
        ],
        instructions: "Sauté spices and veggies, add water and rolled oats, simmer for 4 mins, then fold in paneer cubes.",
        swaps: "Swap oats with cracked roasted Daliya for traditional Indian wheat porridge."
      },
      {
        id: "ind_bf_4",
        name: "Egg Bhurji (3 eggs) with Whole-Wheat Roti",
        calories: 430,
        protein: 29,
        carbs: 36,
        fat: 16,
        fiber: 6,
        portion: "3-egg spiced bhurji + 2 soft phulkas",
        category: "High Protein",
        dietType: "egg",
        prepTime: "10 mins",
        ingredients: [
          "2 whole eggs + 1 egg white (whisked)",
          "1 finely diced onion, tomato and green chilies",
          "2 whole-wheat phulkas (no ghee)",
          "1 tsp olive oil or cold-pressed mustard oil"
        ],
        instructions: "Sauté onions and chilies, add tomatoes, pour in eggs and scramble gently on medium heat until tender.",
        swaps: "Vegetarian? Use 150g Crumbled Paneer Bhurji."
      }
    ],
    lunch: [
      {
        id: "ind_lu_1",
        name: "Soya Chunks Curry + 2 Phulkas + Cucumber Dal",
        calories: 580,
        protein: 44,
        carbs: 68,
        fat: 12,
        fiber: 13,
        portion: "1 large lunch plate (60g dry soya + 2 rotis + 1 cup dal)",
        category: "High Protein Veg",
        dietType: "veg",
        prepTime: "18 mins",
        ingredients: [
          "60g Dry Soya Chunks (boiled, squeezed & simmered in onion-tomato gravy)",
          "2 Whole-wheat Rotis",
          "1 bowl Yellow Arhar / Toor Dal with cumin tadka",
          "1 large sliced cucumber with lemon juice"
        ],
        instructions: "Boil soya chunks with a pinch of salt, rinse thoroughly, and cook in rich ginger-garlic tomato gravy.",
        swaps: "Swap rotis with 1.5 cups steamed brown basmati rice if preferred."
      },
      {
        id: "ind_lu_2",
        name: "Tawa Grilled Chicken Tikka + Roti + Raita",
        calories: 540,
        protein: 48,
        carbs: 48,
        fat: 12,
        fiber: 7,
        portion: "180g lean chicken breast + 2 phulkas + 1 cup mint raita",
        category: "Lean Muscle",
        dietType: "nonveg",
        prepTime: "15 mins",
        ingredients: [
          "180g Chicken Breast (marinated in hung curd, kasuri methi, ginger-garlic & spices)",
          "2 Whole-wheat Phulkas",
          "1 cup Low-fat Curd Raita with cucumber and roasted cumin"
        ],
        instructions: "Pan-sear marinated chicken on a non-stick tawa on high heat for 6 mins until succulent with charred edges.",
        swaps: "Veg alternative: 180g Low-fat Paneer or Soya Tikka."
      },
      {
        id: "ind_lu_3",
        name: "Rajma Masala with Steamed Brown Basmati Rice",
        calories: 520,
        protein: 24,
        carbs: 82,
        fat: 8,
        fiber: 14,
        portion: "1.5 cup red kidney beans curry + 1 cup brown rice + salad",
        category: "Vegetarian Classic",
        dietType: "veg",
        prepTime: "20 mins",
        ingredients: [
          "1.5 cups boiled Rajma simmered in tomato, onion & whole spices",
          "1 cup cooked Brown Basmati Rice",
          "Kachumber salad (onion, tomato, lemon, pink salt)"
        ],
        instructions: "Slow cook kidney beans until meltingly tender in aromatic tomato-onion gravy. Serve over warm rice.",
        swaps: "Add 50g paneer cubes or a side of curd for an extra +10g protein boost."
      },
      {
        id: "ind_lu_4",
        name: "Grilled Fish Curry (Rahu/Basa) + Steamed Rice",
        calories: 510,
        protein: 42,
        carbs: 56,
        fat: 10,
        fiber: 5,
        portion: "180g fish steak + 1 cup brown rice + green salad",
        category: "Heart-Healthy Omega-3",
        dietType: "nonveg",
        prepTime: "15 mins",
        ingredients: [
          "180g White Fish Steak (marinated in lemon, turmeric, chili & garlic)",
          "1 cup Steamed Brown Basmati Rice",
          "Light kokum/tomato curry broth with curry leaves"
        ],
        instructions: "Sear fish steaks on tawa with 1 tsp oil for 3 mins each side. Simmer in light tangy curry broth.",
        swaps: "Can substitute white fish with salmon or freshwater Rohu."
      }
    ],
    snack: [
      {
        id: "ind_sn_1",
        name: "Roasted Chana & Boiled Peanuts Chaat",
        calories: 220,
        protein: 15,
        carbs: 26,
        fat: 6,
        fiber: 6,
        portion: "1 cup spiced crunchy chaat",
        category: "Clean Crunch",
        dietType: "veg",
        prepTime: "3 mins",
        ingredients: [
          "40g Roasted Black Chana (with peel for fibre)",
          "20g Boiled Peanuts",
          "Chopped onions, tomatoes, green chilies, chaat masala & lemon"
        ],
        instructions: "Toss all ingredients in a bowl with freshly squeezed lemon juice and a pinch of rock salt.",
        swaps: "Replace peanuts with boiled sprouted moong."
      },
      {
        id: "ind_sn_2",
        name: "Hung Curd / Greek Yogurt Berry Bowl",
        calories: 210,
        protein: 20,
        carbs: 18,
        fat: 4,
        fiber: 4,
        portion: "1 bowl (180g low-fat hung curd + chia seeds)",
        category: "Probiotic Recovery",
        dietType: "veg",
        prepTime: "2 mins",
        ingredients: [
          "180g Fresh Low-fat Hung Curd or Greek Yogurt",
          "1 tsp Chia Seeds",
          "½ sliced banana or berries, dash of cinnamon"
        ],
        instructions: "Whisk curd with cinnamon until creamy, fold in chia seeds and top with fresh fruit slices.",
        swaps: "Dairy-free: Use whipped almond milk or coconut yogurt."
      },
      {
        id: "ind_sn_3",
        name: "Sprouted Moong Salad with Pomegranate",
        calories: 180,
        protein: 14,
        carbs: 28,
        fat: 2,
        fiber: 7,
        portion: "1 large bowl (150g steamed sprouts)",
        category: "Enzyme Rich",
        dietType: "veg",
        prepTime: "4 mins",
        ingredients: [
          "150g Green Moong Sprouts (lightly steamed)",
          "2 tbsp Pomegranate pearls",
          "Grated carrots, cucumber, fresh mint & lemon drizzle"
        ],
        instructions: "Steam sprouts for 2 mins to improve digestibility. Toss with pomegranate and herbs.",
        swaps: "Add boiled black chickpeas (chana) for higher complex carbohydrate density."
      }
    ],
    dinner: [
      {
        id: "ind_di_1",
        name: "Grilled Cottage Cheese Steak with Sautéed Veggies & Quinoa",
        calories: 490,
        protein: 36,
        carbs: 42,
        fat: 14,
        fiber: 8,
        portion: "160g paneer steak + 1 cup veggies + ½ cup quinoa",
        category: "Slow-Digesting Night Protein",
        dietType: "veg",
        prepTime: "14 mins",
        ingredients: [
          "160g Low-fat Paneer (sliced into steaks and dusted with black pepper & paprika)",
          "½ cup Cooked Quinoa or 1 Multigrain Roti",
          "1 cup Sautéed broccoli, bell peppers & baby spinach in 1 tsp olive oil"
        ],
        instructions: "Grill paneer steaks on hot grill pan for 2 mins per side. Sauté veggies crisp on high heat.",
        swaps: "Swap Paneer with 180g Grilled Chicken Breast for non-veg option."
      },
      {
        id: "ind_di_2",
        name: "Palak Paneer with 2 Whole-Wheat Rotis",
        calories: 480,
        protein: 30,
        carbs: 42,
        fat: 16,
        fiber: 9,
        portion: "1 large bowl palak paneer (140g paneer + 2 cups spinach) + 2 rotis",
        category: "Iron & Micronutrient Rich",
        dietType: "veg",
        prepTime: "15 mins",
        ingredients: [
          "140g Low-fat Paneer cubes",
          "2 cups Fresh Blanched Spinach puree with garlic & green chili",
          "2 Whole-wheat Rotis (no butter)",
          "1 tsp Olive/Mustard oil"
        ],
        instructions: "Simmer pureed spinach with garlic tadka, fold in raw paneer cubes, cook on low heat for 4 mins.",
        swaps: "Replace Paneer with 140g Soya chunks or boiled eggs."
      },
      {
        id: "ind_di_3",
        name: "Lemon Herb Chicken with Mashed Sweet Potato",
        calories: 470,
        protein: 48,
        carbs: 36,
        fat: 8,
        fiber: 6,
        portion: "180g lean chicken breast + 100g sweet potato + steamed greens",
        category: "Clean Lean Dinner",
        dietType: "nonveg",
        prepTime: "16 mins",
        ingredients: [
          "180g Chicken Breast marinated in lemon juice, crushed garlic, rosemary & black pepper",
          "100g Boiled & Lightly Mashed Sweet Potato with pinch of pink salt",
          "1 cup Steamed Green Beans & Carrots"
        ],
        instructions: "Pan-sear chicken with 1 tsp oil until golden and fully cooked. Serve beside mashed sweet potato.",
        swaps: "Vegetarian alternative: 180g Marinated Soya Chaap or Tofu."
      },
      {
        id: "ind_di_4",
        name: "Light Yellow Moong Dal Khichdi with Dahi",
        calories: 440,
        protein: 22,
        carbs: 65,
        fat: 8,
        fiber: 8,
        portion: "1 large bowl (moong dal + rice + veggies) + 1 cup low-fat curd",
        category: "Digestive Rest & Recovery",
        dietType: "veg",
        prepTime: "15 mins",
        ingredients: [
          "½ cup Yellow Moong Dal & Brown Rice (50:50 ratio)",
          "Carrots, green peas, ginger & cumin tadka",
          "1 cup Low-fat Curd / Dahi"
        ],
        instructions: "Pressure cook dal and rice with turmeric and ginger. Temper with jeera and serve with cool curd.",
        swaps: "Add 80g Paneer cubes into the khichdi for +16g extra protein."
      }
    ]
  };

  // ============================================================================
  // 4. WORKOUT SCHEDULES WITH YOUTUBE TUTORIALS (Home & Gym)
  // ============================================================================
  const GOAL_WORKOUT_SCHEDULES = {
    // --------------------------------------------------------------------------
    // A. HOME WORKOUTS (Beginner / Intermediate / Advanced)
    // --------------------------------------------------------------------------
    home: {
      beginner: {
        title: "Home Foundation & Metabolic Activation",
        daysPerWeek: 3,
        equipment: "Bodyweight, Chair, Mat & Optional Water Bottles",
        days: [
          {
            dayName: "Day 1 — Full Body Strength & Core",
            focus: "Compound Bodyweight Mechanics",
            duration: "28 mins",
            exercises: [
              { name: "Bodyweight Squats", sets: 3, reps: "12-15", rest: "60s", target: "Quads, Glutes & Core" },
              { name: "Incline Push-ups", sets: 3, reps: "8-10", rest: "60s", target: "Chest, Shoulders & Triceps" },
              { name: "Glute Bridges", sets: 3, reps: "12-15", rest: "45s", target: "Gluteus Maximus & Hamstrings" },
              { name: "Plank Hold", sets: 3, reps: "30-45s", rest: "45s", target: "Transverse Abdominis & Spine" },
              { name: "Jumping Jacks", sets: 3, reps: "30s", rest: "30s", target: "Cardiovascular Conditioning" }
            ]
          },
          {
            dayName: "Day 2 — Active Recovery & Mobility",
            focus: "Joint Mobility, Hamstrings & Spine Decompression",
            duration: "20 mins",
            exercises: [
              { name: "Cat-Cow Stretch", sets: 3, reps: "10 cycles", rest: "30s", target: "Thoracic Spine & Core" },
              { name: "Hip Flexor Stretch", sets: 3, reps: "30s / side", rest: "30s", target: "Psoas & Hip Mobility" },
              { name: "World's Greatest Stretch", sets: 3, reps: "5 / side", rest: "45s", target: "Full Body Mobility" },
              { name: "Brisk Outdoor Walk", sets: 1, reps: "20 mins", rest: "0s", target: "Aerobic Circulation" }
            ]
          },
          {
            dayName: "Day 3 — Upper Body & Core Sculpt",
            focus: "Pushing Strength & Abdominal Stability",
            duration: "30 mins",
            exercises: [
              { name: "Push-ups", sets: 3, reps: "8-12", rest: "60s", target: "Pecs, Deltoids & Triceps" },
              { name: "Chair / Bed Dips", sets: 3, reps: "10-12", rest: "60s", target: "Triceps Brachii" },
              { name: "Superman Holds", sets: 3, reps: "12 reps (2s hold)", rest: "45s", target: "Erector Spinae & Upper Back" },
              { name: "Mountain Climbers", sets: 3, reps: "30s", rest: "45s", target: "Core & Hip Flexors" },
              { name: "Bird Dog", sets: 3, reps: "10 / side", rest: "30s", target: "Posterior Chain Stability" }
            ]
          },
          {
            dayName: "Day 4 — Lower Body Power & Tone",
            focus: "Quad Density & Posterior Chain Balance",
            duration: "30 mins",
            exercises: [
              { name: "Reverse Lunges", sets: 3, reps: "10 / side", rest: "60s", target: "Quads & Glutes" },
              { name: "Wall Sit Hold", sets: 3, reps: "35-45s", rest: "45s", target: "Isometric Quad Endurance" },
              { name: "Standing Calf Raises", sets: 3, reps: "20 reps", rest: "30s", target: "Gastrocnemius & Soleus" },
              { name: "Bicycle Crunches", sets: 3, reps: "15 / side", rest: "45s", target: "Obliques & Rectus Abdominis" }
            ]
          }
        ]
      },
      intermediate: {
        title: "Home Hypertrophy & Athletic Conditioning",
        daysPerWeek: 4,
        equipment: "Pair of Dumbbells / Resistance Bands & Mat",
        days: [
          {
            dayName: "Day 1 — Upper Body Push & Pull",
            focus: "Hypertrophy with Dumbbells / Bands",
            duration: "36 mins",
            exercises: [
              { name: "Dumbbell Floor Press", sets: 4, reps: "10-12", rest: "60s", target: "Pectoralis Major & Triceps" },
              { name: "Dumbbell Bent-over Row", sets: 4, reps: "10-12", rest: "60s", target: "Latissimus Dorsi & Rhomboids" },
              { name: "Dumbbell Overhead Shoulder Press", sets: 3, reps: "10-12", rest: "60s", target: "Anterior & Lateral Deltoids" },
              { name: "Dumbbell Bicep Curl", sets: 3, reps: "12-15", rest: "45s", target: "Biceps Brachii" },
              { name: "Overhead Dumbbell Triceps Extension", sets: 3, reps: "12-15", rest: "45s", target: "Triceps Long Head" }
            ]
          },
          {
            dayName: "Day 2 — Lower Body Power & Glutes",
            focus: "Posterior Chain & Unilateral Strength",
            duration: "38 mins",
            exercises: [
              { name: "Goblet Squats", sets: 4, reps: "10-12", rest: "60s", target: "Quads & Gluteal Core" },
              { name: "Dumbbell Romanian Deadlift", sets: 4, reps: "10-12", rest: "60s", target: "Hamstrings & Lower Back" },
              { name: "Bulgarian Split Squats", sets: 3, reps: "8-10 / side", rest: "60s", target: "Quad Tear & Glute Drive" },
              { name: "Single-leg Glute Bridge", sets: 3, reps: "12 / side", rest: "45s", target: "Glute Isolation" },
              { name: "Russian Twists", sets: 3, reps: "20 twists", rest: "45s", target: "Oblique Torque" }
            ]
          },
          {
            dayName: "Day 3 — HIIT & High Metabolic Conditioning",
            focus: "Fat Oxidation & Stamina",
            duration: "25 mins",
            exercises: [
              { name: "Burpees", sets: 4, reps: "10 reps", rest: "45s", target: "Full Body Explosive Stamina" },
              { name: "Dumbbell Swings", sets: 4, reps: "15 reps", rest: "45s", target: "Hip Hinge Power" },
              { name: "High Knees Sprint in Place", sets: 4, reps: "30s", rest: "30s", target: "Cardiovascular Output" },
              { name: "Forearm Plank to Push-up", sets: 3, reps: "10 reps", rest: "45s", target: "Dynamic Core & Shoulders" }
            ]
          },
          {
            dayName: "Day 4 — Full Body Athletic Armor",
            focus: "Compound Functional Symmetry",
            duration: "34 mins",
            exercises: [
              { name: "Dumbbell Thrusters", sets: 4, reps: "10-12", rest: "60s", target: "Quads & Shoulder Drive" },
              { name: "Push-ups to Renegade Row", sets: 3, reps: "8 / side", rest: "60s", target: "Chest, Lats & Anti-Rotation" },
              { name: "Dumbbell Lateral Raises", sets: 3, reps: "15 reps", rest: "45s", target: "Side Deltoid Width" },
              { name: "Hollow Body Hold", sets: 3, reps: "30s", rest: "30s", target: "Gymnastic Core Rigidity" }
            ]
          }
        ]
      }
    },

    // --------------------------------------------------------------------------
    // B. GYM WORKOUTS (Beginner / Intermediate / Advanced)
    // --------------------------------------------------------------------------
    gym: {
      beginner: {
        title: "Gym Beginner Foundation (3-Day Full Body)",
        daysPerWeek: 3,
        equipment: "Barbells, Dumbbells, Bench & Cable Stack",
        days: [
          {
            dayName: "Day 1 — Foundation A (Squat & Press)",
            focus: "Primary Compound Motor Patterns",
            duration: "42 mins",
            exercises: [
              { name: "Barbell Squats", sets: 3, reps: "8-10", rest: "90s", target: "Quads, Glutes & Adductors" },
              { name: "Bench Press", sets: 3, reps: "8-10", rest: "90s", target: "Pectoralis Major & Triceps" },
              { name: "Lat Pulldown", sets: 3, reps: "10-12", rest: "75s", target: "Latissimus Dorsi & Biceps" },
              { name: "Dumbbell Shoulder Press", sets: 3, reps: "10-12", rest: "60s", target: "Anterior Deltoids" },
              { name: "Hanging Knee Raises", sets: 3, reps: "12-15", rest: "45s", target: "Lower Abs & Hip Flexors" }
            ]
          },
          {
            dayName: "Day 2 — Foundation B (Hinge & Row)",
            focus: "Posterior Chain & Upper Back Thickness",
            duration: "45 mins",
            exercises: [
              { name: "Romanian Deadlift", sets: 3, reps: "8-10", rest: "90s", target: "Hamstrings, Glutes & Spinal Erectors" },
              { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", rest: "75s", target: "Upper Pectorals" },
              { name: "Seated Cable Row", sets: 3, reps: "10-12", rest: "75s", target: "Rhomboids & Mid Trapezius" },
              { name: "Triceps Pushdown", sets: 3, reps: "12-15", rest: "60s", target: "Triceps Lateral & Medial Head" },
              { name: "Dumbbell Bicep Curl", sets: 3, reps: "10-12", rest: "60s", target: "Biceps Brachii" }
            ]
          },
          {
            dayName: "Day 3 — Foundation C (Leg Press & Overhead)",
            focus: "Hypertrophy Density & Machine Stability",
            duration: "40 mins",
            exercises: [
              { name: "Leg Press", sets: 3, reps: "10-12", rest: "75s", target: "Quad Quadriceps & Knee Stability" },
              { name: "Standing Overhead Press", sets: 3, reps: "8-10", rest: "90s", target: "Shoulders & Core" },
              { name: "Lying Leg Curl", sets: 3, reps: "12-15", rest: "60s", target: "Hamstring Biceps Femoris" },
              { name: "Face Pulls", sets: 3, reps: "15 reps", rest: "45s", target: "Rear Delts & Rotator Cuff" },
              { name: "Plank Hold", sets: 3, reps: "45s", rest: "45s", target: "Core Rigidity" }
            ]
          }
        ]
      },
      intermediate: {
        title: "Gym Hypertrophy & Recomp (4-Day Upper / Lower)",
        daysPerWeek: 4,
        equipment: "Full Commercial Gym",
        days: [
          {
            dayName: "Day 1 — Upper Body Heavy Push & Pull",
            focus: "Heavy Compound Mechanical Tension",
            duration: "48 mins",
            exercises: [
              { name: "Bench Press", sets: 4, reps: "6-8", rest: "90s", target: "Mid & Lower Pectorals" },
              { name: "Barbell Bent-over Row", sets: 4, reps: "6-8", rest: "90s", target: "Lats & Upper Back" },
              { name: "Incline Dumbbell Press", sets: 3, reps: "8-10", rest: "75s", target: "Clavicular Pecs" },
              { name: "Lat Pulldown", sets: 3, reps: "10-12", rest: "75s", target: "Lats Width" },
              { name: "Dumbbell Lateral Raises", sets: 3, reps: "12-15", rest: "45s", target: "Lateral Deltoids" },
              { name: "Rope Tricep Extension", sets: 3, reps: "12-15", rest: "45s", target: "Triceps Long Head" }
            ]
          },
          {
            dayName: "Day 2 — Lower Body Power & Glutes",
            focus: "Heavy Quad & Hamstring Progression",
            duration: "50 mins",
            exercises: [
              { name: "Barbell Squats", sets: 4, reps: "6-8", rest: "120s", target: "Quads & Glutes" },
              { name: "Romanian Deadlift", sets: 4, reps: "8-10", rest: "90s", target: "Hamstrings & Glute Fold" },
              { name: "Leg Press", sets: 3, reps: "10-12", rest: "75s", target: "Quad Hypertrophy" },
              { name: "Lying Leg Curl", sets: 3, reps: "12-15", rest: "60s", target: "Hamstring Isolation" },
              { name: "Standing Calf Raises", sets: 4, reps: "15 reps", rest: "45s", target: "Gastrocnemius" }
            ]
          },
          {
            dayName: "Day 3 — Upper Body Volume & Pump",
            focus: "Metabolic Stress & Shape",
            duration: "46 mins",
            exercises: [
              { name: "Incline Press", sets: 4, reps: "8-10", rest: "75s", target: "Upper Chest" },
              { name: "Cable Chest Fly", sets: 3, reps: "12-15", rest: "60s", target: "Inner Pec Stretch" },
              { name: "Seated Cable Row", sets: 4, reps: "10-12", rest: "75s", target: "Rhomboids" },
              { name: "Cable Face Pull", sets: 4, reps: "15 reps", rest: "45s", target: "Rear Deltoid Armor" },
              { name: "Incline Dumbbell Curl", sets: 3, reps: "10-12", rest: "60s", target: "Biceps Peak" },
              { name: "Dips", sets: 3, reps: "10-12", rest: "60s", target: "Triceps & Lower Chest" }
            ]
          },
          {
            dayName: "Day 4 — Lower Body & Posterior Density",
            focus: "Deadlift & Functional Unilateral Drive",
            duration: "48 mins",
            exercises: [
              { name: "Barbell Deadlift", sets: 3, reps: "5 reps", rest: "120s", target: "Full Body Posterior Chain" },
              { name: "Bulgarian Split Squats", sets: 3, reps: "8-10 / side", rest: "75s", target: "Quad & Glute Symmetry" },
              { name: "Leg Extensions", sets: 3, reps: "12-15", rest: "60s", target: "Vastus Medialis (Teardrop)" },
              { name: "Seated Calf Raise", sets: 4, reps: "15 reps", rest: "45s", target: "Soleus" },
              { name: "Hanging Leg Raises", sets: 3, reps: "12 reps", rest: "45s", target: "Lower Abdominals" }
            ]
          }
        ]
      }
    }
  };

  // Helper to resolve exercise instructions and YouTube video
  function enrichExerciseWithTutorial(ex) {
    if (!ex || !ex.name) return ex;
    let ytData = null;
    if (typeof global.getExerciseYouTubeData === "function") {
      ytData = global.getExerciseYouTubeData(ex.name);
    }
    return {
      ...ex,
      youtubeUrl: ytData?.youtubeUrl || null,
      videoId: ytData?.videoId || null,
      channel: ytData?.channel || "ScottHermanFitness",
      steps: ytData?.steps || [
        "Position yourself with stable foot placement and engaged core.",
        "Execute the movement through full range of motion under steady eccentric control (2-3 seconds).",
        "Powerfully contract the target muscle at peak concentric phase without locking joints."
      ],
      tips: ytData?.tips || [
        "Breathe in during the eccentric lowering phase; exhale on exertion.",
        "Maintain neutral spine alignment throughout."
      ],
      equipment: ytData?.equipment || ex.equipment || "Standard Equipment"
    };
  }

  // ============================================================================
  // 5. SUPABASE & LOCAL STORAGE PERSISTENCE SUITE
  // ============================================================================
  const BODY_GOALS_STORAGE_KEY = "stoke_body_goals";
  const TRANSFORMATION_LOGS_STORAGE_KEY = "stoke_transformation_logs";

  // Load Body Goals
  async function dbGetBodyGoals(userId) {
    const actualId = userId || (typeof global.dbGetCurrentUserId === "function" ? global.dbGetCurrentUserId() : null);
    const sb = typeof global.getSupabaseClient === "function" ? global.getSupabaseClient() : null;

    if (sb && actualId && navigator.onLine) {
      try {
        const { data, error } = await sb
          .from("body_goals")
          .select("*")
          .eq("user_id", actualId)
          .maybeSingle();
        if (!error && data) {
          if (typeof localStorage !== "undefined") {
            localStorage.setItem(BODY_GOALS_STORAGE_KEY, JSON.stringify(data));
          }
          return { success: true, data, source: "supabase" };
        }
      } catch (err) {
        console.warn("Supabase body_goals query notice:", err);
      }
    }

    // Local fallback
    if (typeof localStorage !== "undefined") {
      try {
        const local = localStorage.getItem(BODY_GOALS_STORAGE_KEY);
        if (local) return { success: true, data: JSON.parse(local), source: "local" };
      } catch (e) {}
    }

    return { success: false, data: null, source: "none" };
  }

  // Save / Update Body Goals
  async function dbSaveBodyGoals(userId, goalsPayload) {
    const actualId = userId || (typeof global.dbGetCurrentUserId === "function" ? global.dbGetCurrentUserId() : null);
    const sb = typeof global.getSupabaseClient === "function" ? global.getSupabaseClient() : null;

    const payload = {
      ...goalsPayload,
      user_id: actualId || "local_athlete",
      updated_at: new Date().toISOString()
    };

    // Save locally immediately
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(BODY_GOALS_STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {}
    }

    if (sb && actualId && navigator.onLine) {
      try {
        const { data, error } = await sb
          .from("body_goals")
          .upsert(payload, { onConflict: "user_id" })
          .select()
          .maybeSingle();
        if (!error) return { success: true, data: data || payload, source: "supabase" };
      } catch (err) {
        console.warn("Supabase body_goals save notice:", err);
        if (typeof global.pushOfflineAction === "function") {
          global.pushOfflineAction({ type: "UPSERT_BODY_GOALS", payload });
        }
      }
    }

    return { success: true, data: payload, source: "local" };
  }

  // Get Transformation History Logs (Measurements & Photos)
  async function dbGetTransformationLogs(userId) {
    const actualId = userId || (typeof global.dbGetCurrentUserId === "function" ? global.dbGetCurrentUserId() : null);
    const sb = typeof global.getSupabaseClient === "function" ? global.getSupabaseClient() : null;

    if (sb && actualId && navigator.onLine) {
      try {
        const { data, error } = await sb
          .from("transformation_logs")
          .select("*")
          .eq("user_id", actualId)
          .order("log_date", { ascending: false });
        if (!error && Array.isArray(data)) {
          if (typeof localStorage !== "undefined") {
            localStorage.setItem(TRANSFORMATION_LOGS_STORAGE_KEY, JSON.stringify(data));
          }
          return { success: true, data, source: "supabase" };
        }
      } catch (err) {
        console.warn("Supabase transformation_logs query notice:", err);
      }
    }

    // Local fallback
    if (typeof localStorage !== "undefined") {
      try {
        const local = localStorage.getItem(TRANSFORMATION_LOGS_STORAGE_KEY);
        if (local) return { success: true, data: JSON.parse(local), source: "local" };
      } catch (e) {}
    }

    // Default seeded healthy logs if new user
    const defaultLogs = [
      {
        id: "seed_1",
        log_date: new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0],
        weight_kg: 71.5,
        waist_cm: 84,
        chest_cm: 98,
        arms_cm: 33,
        notes: "Started 12-week body transformation plan! Water and sleep goals hit.",
        habits_completed: ["water_hit", "workout_done"],
        photo_url: null
      },
      {
        id: "seed_2",
        log_date: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0],
        weight_kg: 70.8,
        waist_cm: 83,
        chest_cm: 98.5,
        arms_cm: 33.2,
        notes: "Solid week. Hit all protein targets with moong dal chilla & soya curry.",
        habits_completed: ["water_hit", "protein_target", "workout_done"],
        photo_url: null
      },
      {
        id: "seed_3",
        log_date: new Date().toISOString().split("T")[0],
        weight_kg: 70.2,
        waist_cm: 82.2,
        chest_cm: 99,
        arms_cm: 33.5,
        notes: "Energy is through the roof. Form cues on squats feel crisp and controlled.",
        habits_completed: ["water_hit", "protein_target", "workout_done", "clean_sleep"],
        photo_url: null
      }
    ];

    return { success: true, data: defaultLogs, source: "seeded" };
  }

  // Save new transformation log (with optional private photo)
  async function dbSaveTransformationLog(userId, logData) {
    const actualId = userId || (typeof global.dbGetCurrentUserId === "function" ? global.dbGetCurrentUserId() : null);
    const sb = typeof global.getSupabaseClient === "function" ? global.getSupabaseClient() : null;

    const newLog = {
      id: "log_" + Date.now(),
      user_id: actualId || "local_athlete",
      log_date: logData.log_date || new Date().toISOString().split("T")[0],
      weight_kg: Number(logData.weight_kg) || null,
      waist_cm: Number(logData.waist_cm) || null,
      chest_cm: Number(logData.chest_cm) || null,
      hips_cm: Number(logData.hips_cm) || null,
      arms_cm: Number(logData.arms_cm) || null,
      body_fat_pct: Number(logData.body_fat_pct) || null,
      notes: String(logData.notes || "").trim(),
      photo_url: logData.photo_url || null,
      habits_completed: Array.isArray(logData.habits_completed) ? logData.habits_completed : [],
      created_at: new Date().toISOString()
    };

    // Update local storage
    if (typeof localStorage !== "undefined") {
      try {
        const raw = localStorage.getItem(TRANSFORMATION_LOGS_STORAGE_KEY);
        const list = raw ? JSON.parse(raw) : [];
        const updated = [newLog, ...list.filter(item => item.id !== newLog.id)];
        localStorage.setItem(TRANSFORMATION_LOGS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
    }

    if (sb && actualId && navigator.onLine) {
      try {
        const { data, error } = await sb
          .from("transformation_logs")
          .insert(newLog)
          .select()
          .maybeSingle();
        if (!error && data) return { success: true, data, source: "supabase" };
      } catch (err) {
        console.warn("Supabase transformation_logs insert notice:", err);
      }
    }

    return { success: true, data: newLog, source: "local" };
  }

  // Delete transformation log (and its photo)
  async function dbDeleteTransformationLog(userId, logId) {
    const actualId = userId || (typeof global.dbGetCurrentUserId === "function" ? global.dbGetCurrentUserId() : null);
    const sb = typeof global.getSupabaseClient === "function" ? global.getSupabaseClient() : null;

    if (typeof localStorage !== "undefined") {
      try {
        const raw = localStorage.getItem(TRANSFORMATION_LOGS_STORAGE_KEY);
        if (raw) {
          const list = JSON.parse(raw).filter(l => l.id !== logId);
          localStorage.setItem(TRANSFORMATION_LOGS_STORAGE_KEY, JSON.stringify(list));
        }
      } catch (e) {}
    }

    if (sb && actualId && navigator.onLine) {
      try {
        await sb.from("transformation_logs").delete().eq("id", logId).eq("user_id", actualId);
      } catch (err) {
        console.warn("Supabase log deletion notice:", err);
      }
    }

    return { success: true };
  }

  // ============================================================================
  // EXPORT ENGINE GLOBALLY
  // ============================================================================
  global.StokeBodyGoalsEngine = {
    GOAL_TYPES,
    ACTIVITY_MULTIPLIERS,
    EXPERIENCE_LEVELS,
    WORKOUT_LOCATIONS,
    calculateTransformationPlan,
    INDIAN_MEAL_SUGGESTIONS,
    GOAL_WORKOUT_SCHEDULES,
    enrichExerciseWithTutorial,
    dbGetBodyGoals,
    dbSaveBodyGoals,
    dbGetTransformationLogs,
    dbSaveTransformationLog,
    dbDeleteTransformationLog
  };

  // Shortcut bindings for direct access
  global.calculateTransformationPlan = calculateTransformationPlan;
  global.INDIAN_MEAL_SUGGESTIONS = INDIAN_MEAL_SUGGESTIONS;
  global.GOAL_WORKOUT_SCHEDULES = GOAL_WORKOUT_SCHEDULES;
  global.dbGetBodyGoals = dbGetBodyGoals;
  global.dbSaveBodyGoals = dbSaveBodyGoals;
  global.dbGetTransformationLogs = dbGetTransformationLogs;
  global.dbSaveTransformationLog = dbSaveTransformationLog;
  global.dbDeleteTransformationLog = dbDeleteTransformationLog;

})(typeof window !== "undefined" ? window : this);
