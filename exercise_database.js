/* ============================================================
   STOKE EXERCISE DETAILS & ANIMATION MAPPING DATABASE
   ============================================================ */

const EXERCISE_DATABASE = {
  // CHEST
  "Bench Press": {
    muscle: "Pectoralis Major (Mid & Lower)",
    secondary: "Anterior Deltoids, Triceps Brachii",
    equipment: "Barbell & Flat Bench",
    category: "chest",
    kinematic: "bench_press",
    difficulty: "Intermediate",
    steps: [
      "Lie flat on bench with eyes directly under the racked bar. Plant feet flat into the floor.",
      "Grip the bar slightly wider than shoulder-width. Retract and depress shoulder blades into bench.",
      "Unrack the bar and lower it under control to mid-chest, keeping elbows tucked at roughly 45 degrees.",
      "Drive feet into the ground and press the bar powerfully back up to lockout, exhaling at the top."
    ],
    tips: [
      "Keep wrists straight and directly above elbows throughout the movement.",
      "Never flare elbows out to 90 degrees to protect the rotator cuff.",
      "Maintain a natural arch in lower back while keeping glutes glued to the bench."
    ]
  },
  "Incline Press": {
    muscle: "Clavicular Pectoralis (Upper Chest)",
    secondary: "Anterior Deltoids, Triceps",
    equipment: "Incline Bench (30-45°) & Barbell/Dumbbells",
    category: "chest",
    kinematic: "incline_press",
    difficulty: "Intermediate",
    steps: [
      "Set bench to 30-45 degrees. Plant feet firmly on the ground with chest puffed high.",
      "Lower bar or dumbbells to the upper chest near collarbones under steady control.",
      "Pause for a fraction of a second at full stretch without bouncing.",
      "Press straight upward and slightly back toward eye line, contracting the upper pecs."
    ],
    tips: [
      "Avoid setting the incline too high (above 45°) which shifts load entirely to front delts.",
      "Keep shoulder blades pinned to the bench throughout the set."
    ]
  },
  "Chest Fly": {
    muscle: "Pectoralis Major (Sternal Head)",
    secondary: "Anterior Deltoids, Biceps Short Head",
    equipment: "Dumbbells / Cable Machine & Bench",
    category: "chest",
    kinematic: "chest_fly",
    difficulty: "Beginner-Friendly",
    steps: [
      "Lie on flat bench holding dumbbells directly above chest with palms facing each other.",
      "Maintain a slight, fixed bend at the elbows (around 15 degrees).",
      "Lower weights out wide in a sweeping hugging arc until a deep chest stretch is felt.",
      "Bring weights back together in the same arc, squeezing inner chest at the peak."
    ],
    tips: [
      "Do not turn this into a press by excessively bending elbows at the bottom.",
      "Stop when elbows reach bench height to prevent shoulder strain."
    ]
  },
  "Push-up": {
    muscle: "Pectoralis Major & Core",
    secondary: "Triceps, Anterior Deltoids, Serratus",
    equipment: "Bodyweight (No Equipment)",
    category: "chest",
    kinematic: "push_up",
    difficulty: "Beginner-Friendly",
    steps: [
      "Place hands on floor slightly wider than shoulder-width, fingers spread forward.",
      "Form a rigid plank from head to heels by squeezing glutes and bracing abs.",
      "Lower chest smoothly until 2 inches from the floor, elbows tracking back at 45 degrees.",
      "Push the floor away powerfully to return to full lockout, spreading shoulder blades at the top."
    ],
    tips: [
      "Never let hips sag toward the floor or pike upward.",
      "Keep neck neutral by looking at a spot on the floor 6 inches ahead."
    ]
  },
  "Incline / Knee Push-up": {
    muscle: "Pectoralis Major & Core",
    secondary: "Triceps, Shoulders",
    equipment: "Bodyweight / Elevated Surface",
    category: "chest",
    kinematic: "incline_push_up",
    difficulty: "Beginner",
    steps: [
      "Place hands on a wall, sturdy counter, or bench with body at a comfortable incline.",
      "Keep core braced and spine neutral in one unbroken line.",
      "Lower chest toward the surface until elbows form 90 degrees.",
      "Press away smoothly to return to starting position, exhaling with control."
    ],
    tips: [
      "Great regression for building upper body pressing strength without joint stress.",
      "Keep core tight so hips move in unison with the torso."
    ]
  },
  "Dips": {
    muscle: "Lower Pectorals & Triceps",
    secondary: "Anterior Deltoids, Latissimus",
    equipment: "Parallel Dip Bars",
    category: "chest",
    kinematic: "dips",
    difficulty: "Advanced",
    steps: [
      "Grip parallel bars and suspend your body with arms straight.",
      "Lean torso forward roughly 20-30 degrees to bias chest over triceps.",
      "Lower your body until elbows bend to 90 degrees and you feel a gentle chest stretch.",
      "Press firmly through your palms to return to starting position."
    ],
    tips: [
      "Keep shoulders depressed down away from ears.",
      "Avoid sinking too deep if you experience shoulder discomfort."
    ]
  },

  // SHOULDERS
  "Lateral Raise": {
    muscle: "Lateral Deltoids (Side Delts)",
    secondary: "Anterior Deltoids, Trapezius",
    equipment: "Dumbbells / Cables",
    category: "shoulders",
    kinematic: "lateral_raise",
    video: "pppppppp.mp4",
    difficulty: "Beginner-Friendly",
    steps: [
      "Stand tall with feet shoulder-width apart, holding dumbbells at sides with palms inward.",
      "Maintain a soft bend in knees and a slight forward torso lean (5-10 degrees).",
      "Raise arms out to the sides in a wide sweeping arc until elbows reach shoulder height.",
      "Pause for a brief peak contraction, then lower slowly over 2-3 seconds."
    ],
    tips: [
      "Lead with your elbows, not your hands or wrists.",
      "Avoid shrugging shoulders up toward your neck.",
      "Never swing torso or use momentum—keep movement strict and isolated."
    ]
  },
  "Arnold Press": {
    muscle: "All Three Deltoid Heads",
    secondary: "Triceps, Upper Traps",
    equipment: "Dumbbells & Bench",
    category: "shoulders",
    kinematic: "arnold_press",
    video: "ppppp.mp4",
    difficulty: "Intermediate",
    steps: [
      "Sit on an upright bench holding dumbbells at chin level, palms facing your chest.",
      "As you press upward, rotate wrists so palms face forward at the midpoint.",
      "Continue pressing to full overhead lockout with palms facing forward.",
      "Reverse the rotation smoothly on the descent back to chin level."
    ],
    tips: [
      "Perform the rotation smoothly throughout the press rather than abruptly at the top.",
      "Keep core engaged so you do not hyperextend your lower back."
    ]
  },
  "Overhead Press": {
    muscle: "Anterior & Lateral Deltoids",
    secondary: "Triceps, Upper Traps, Core",
    equipment: "Barbell / Standing",
    category: "shoulders",
    kinematic: "overhead_press",
    difficulty: "Intermediate",
    steps: [
      "Stand with bar resting across front clavicles, hands just outside shoulders.",
      "Squeeze glutes and brace abdominals firmly to create a stable pillar.",
      "Pull chin back slightly and press the bar vertically in a straight path.",
      "Once bar clears head, bring head forward and lock out arms overhead."
    ],
    tips: [
      "Do not lean back excessively—keep ribs clamped down.",
      "Press the bar directly over mid-foot for optimal balance."
    ]
  },

  // BACK
  "Barbell Row": {
    muscle: "Latissimus Dorsi, Rhomboids, Trapezius",
    secondary: "Rear Deltoids, Biceps, Spinal Erectors",
    equipment: "Barbell",
    category: "back",
    kinematic: "barbell_row",
    difficulty: "Intermediate",
    steps: [
      "Hinge forward at hips with knees slightly bent and spine flat at roughly 45 degrees.",
      "Grip the bar with overhand or underhand grip just wider than shoulder-width.",
      "Pull the bar toward your lower ribcage, driving elbows up and back.",
      "Squeeze shoulder blades together at the top, then lower bar smoothly under control."
    ],
    tips: [
      "Never round your lower back under load.",
      "Pull with your back and elbows, not just your hands and biceps."
    ]
  },
  "Lat Pulldown": {
    muscle: "Latissimus Dorsi (Lats)",
    secondary: "Biceps Brachii, Rear Delts, Rhomboids",
    equipment: "Cable Pulldown Machine",
    category: "back",
    kinematic: "lat_pulldown",
    difficulty: "Beginner-Friendly",
    steps: [
      "Sit at machine with thighs secured snugly under pads. Grip bar wide with overhand grip.",
      "Puff chest up with a slight lean back (10-15 degrees).",
      "Pull bar down to touch upper chest, driving elbows downward and back.",
      "Control the bar on the way up until arms are fully extended and lats are stretched."
    ],
    tips: [
      "Do not yank with momentum or swing backward excessively.",
      "Focus on squeezing armpits down toward your hips."
    ]
  },
  "Pull-up": {
    muscle: "Latissimus Dorsi & Upper Back",
    secondary: "Biceps, Forearms, Core",
    equipment: "Pull-up Bar",
    category: "back",
    kinematic: "pull_up",
    difficulty: "Advanced",
    steps: [
      "Hang from overhead bar with hands slightly wider than shoulder-width.",
      "Engage scapulae by pulling shoulder blades down before bending elbows.",
      "Pull body up until chin clears the bar, leading with your upper chest.",
      "Lower under control over 2-3 seconds back to a dead hang."
    ],
    tips: [
      "Avoid kipping or swinging legs to gain artificial momentum.",
      "Keep core braced and legs straight or crossed behind you."
    ]
  },

  // ARMS
  "Bicep Curl": {
    muscle: "Biceps Brachii (Short & Long Head)",
    secondary: "Brachialis, Forearm Flexors",
    equipment: "Dumbbells / Barbell",
    category: "biceps",
    kinematic: "bicep_curl",
    difficulty: "Beginner-Friendly",
    steps: [
      "Stand tall holding weights at arms length, palms facing forward or neutral.",
      "Pin elbows against your ribcage to keep shoulders stationary.",
      "Curl weights upward toward shoulders, supinating wrists as you lift.",
      "Squeeze biceps hard at the peak, then lower slowly over 2-3 seconds."
    ],
    tips: [
      "Do not swing hips or lean back to hoist the weight.",
      "Keep elbows in place—do not let them drift forward excessively."
    ]
  },
  "Hammer Curl": {
    muscle: "Brachialis & Brachioradialis",
    secondary: "Biceps Brachii",
    equipment: "Dumbbells",
    category: "biceps",
    kinematic: "hammer_curl",
    difficulty: "Beginner-Friendly",
    steps: [
      "Hold dumbbells with a neutral grip (palms facing each other) at sides.",
      "Keep upper arms stationary and curl weights upward.",
      "Squeeze forearms and outer biceps at top of movement.",
      "Lower weights under control back to full extension."
    ],
    tips: [
      "Great for building arm thickness and grip strength.",
      "Resist the urge to alternate with rapid swinging."
    ]
  },
  "Triceps Pushdown": {
    muscle: "Triceps Brachii (Lateral & Medial Head)",
    secondary: "Anconeus",
    equipment: "Cable Pulley & Rope/Bar",
    category: "triceps",
    kinematic: "triceps_pushdown",
    difficulty: "Beginner-Friendly",
    steps: [
      "Face cable stack, grip bar or rope with elbows bent at 90 degrees pinned to ribs.",
      "Hinge slightly forward at hips for balance.",
      "Push hands straight down until elbows are fully locked out.",
      "Spread rope ends slightly apart at bottom for extra peak contraction, then return slowly."
    ],
    tips: [
      "Keep upper arms glued to torso throughout the entire set.",
      "Do not let shoulders roll forward on the way up."
    ]
  },
  "Overhead Triceps Extension": {
    muscle: "Triceps Brachii (Long Head)",
    secondary: "Anterior Deltoids, Core",
    equipment: "Dumbbell / Cable",
    category: "triceps",
    kinematic: "overhead_triceps",
    difficulty: "Intermediate",
    steps: [
      "Hold dumbbell vertically overhead with both hands cup-gripping top plate.",
      "Keep upper arms close to ears and elbows pointing forward.",
      "Lower weight behind head by bending elbows until full tricep stretch.",
      "Extend arms back upward overhead to full contraction."
    ],
    tips: [
      "Keep ribs down to prevent arching lower back.",
      "Keep elbows relatively tucked rather than flaring out wide."
    ]
  },
  "Floor Tricep Dips": {
    muscle: "Triceps Brachii",
    secondary: "Anterior Delts, Upper Chest",
    equipment: "Bodyweight / Floor Mat",
    category: "triceps",
    kinematic: "floor_dips",
    difficulty: "Beginner",
    steps: [
      "Sit on mat with knees bent and feet flat on floor.",
      "Place hands behind hips with fingers pointing forward toward feet.",
      "Elevate hips slightly and bend elbows straight back to lower body.",
      "Press through palms to straighten arms and contract triceps."
    ],
    tips: [
      "Direct your elbows straight behind you rather than flaring outward.",
      "Ensure shoulders stay down away from ears."
    ]
  },

  // LEGS & GLUTES
  "Squat": {
    muscle: "Quadriceps & Gluteus Maximus",
    secondary: "Hamstrings, Core, Calves",
    equipment: "Barbell / Bodyweight",
    category: "legs",
    kinematic: "squat",
    difficulty: "Intermediate",
    steps: [
      "Position bar comfortably across upper traps with feet shoulder-width apart.",
      "Take a deep breath into belly, brace core, and initiate movement by hinging hips back.",
      "Bend knees and descend until thighs are at least parallel to floor.",
      "Drive through whole foot to stand back tall, exhaling as you pass sticking point."
    ],
    tips: [
      "Keep chest proud and eyes looking forward.",
      "Ensure knees track directly in line with toes, never collapsing inward."
    ]
  },
  "Bodyweight Squat": {
    muscle: "Quadriceps & Glutes",
    secondary: "Hamstrings, Core",
    equipment: "Bodyweight (No Equipment)",
    category: "legs",
    kinematic: "squat",
    difficulty: "Beginner-Friendly",
    steps: [
      "Stand tall with feet slightly wider than hips, toes angled outward 15 degrees.",
      "Reach arms out in front for balance.",
      "Sit hips back and down like sitting into a deep chair.",
      "Press through heels and mid-foot to stand tall and squeeze glutes at the top."
    ],
    tips: [
      "Keep heels firmly planted on the floor.",
      "Maintain an upright torso without folding forward."
    ]
  },
  "Sumo Squat": {
    muscle: "Adductors (Inner Thighs) & Glutes",
    secondary: "Quadriceps, Hamstrings",
    equipment: "Bodyweight / Dumbbell",
    category: "legs",
    kinematic: "sumo_squat",
    difficulty: "Beginner-Friendly",
    steps: [
      "Take a wide stance (1.5x shoulder width) with toes turned out 45 degrees.",
      "Keep torso tall as you bend knees and lower hips down.",
      "Keep knees actively pushed wide over your second toe.",
      "Press through heels and inner feet to drive upward, squeezing inner thighs and glutes."
    ],
    tips: [
      "Do not let knees cave inward during the movement.",
      "Stay upright to maximize glute and inner thigh recruitment."
    ]
  },
  "Romanian Deadlift": {
    muscle: "Hamstrings & Gluteus Maximus",
    secondary: "Erectors, Lats, Forearms",
    equipment: "Barbell / Dumbbells",
    category: "legs",
    kinematic: "rdl",
    difficulty: "Intermediate",
    steps: [
      "Hold barbell at hips with a soft bend in knees (approx 15 degrees).",
      "Hinge backward at hips as if trying to touch the wall behind you with glutes.",
      "Slide the weight down along front of thighs until a strong stretch is felt in hamstrings.",
      "Contract glutes and drive hips forward to return to standing tall."
    ],
    tips: [
      "This is a hip hinge, not a squat—knees do not bend further after the initial unlock.",
      "Keep bar in contact with legs throughout the entire descent."
    ]
  },
  "Glute Bridge": {
    muscle: "Gluteus Maximus",
    secondary: "Hamstrings, Core Stabilizers",
    equipment: "Bodyweight / Floor Mat",
    category: "glutes",
    kinematic: "glute_bridge",
    difficulty: "Beginner-Friendly",
    steps: [
      "Lie on back with knees bent at 90 degrees and feet flat, hip-width apart.",
      "Tuck pelvis slightly to flatten lower back against the mat.",
      "Drive through heels and lift hips until thighs and torso form a straight diagonal.",
      "Squeeze glutes hard at the top for 2 seconds, then lower with control."
    ],
    tips: [
      "Do not hyperextend lower back at the top—lift with glutes, not spine.",
      "Keep ribs drawn down toward pelvis throughout."
    ]
  },
  "Glute Bridge Isometric Hold": {
    muscle: "Gluteus Maximus & Pelvic Floor",
    secondary: "Hamstrings, Transverse Abdominis",
    equipment: "Bodyweight / Floor Mat",
    category: "glutes",
    kinematic: "glute_bridge_hold",
    difficulty: "Beginner-Friendly",
    steps: [
      "Elevate hips into full glute bridge position.",
      "Lock glutes and core, keeping thighs parallel and stable.",
      "Hold peak bridge height for the full target duration (e.g. 30 seconds).",
      "Maintain smooth, rhythmic nasal breathing without letting hips drop."
    ],
    tips: [
      "If you feel strain in your lower back, lower hips slightly and focus on tucking your tailbone.",
      "Keep glute tension locked 100% of the time."
    ]
  },
  "Reverse Lunges": {
    muscle: "Quadriceps & Gluteus Maximus",
    secondary: "Hamstrings, Calves, Core",
    equipment: "Bodyweight (No Equipment)",
    category: "legs",
    kinematic: "lunge",
    difficulty: "Beginner-Friendly",
    steps: [
      "Stand tall with feet together and hands on hips or chest.",
      "Step back smoothly with one leg, landing on ball of rear foot.",
      "Lower both knees until front thigh is parallel to floor and back knee hovers 1 inch above mat.",
      "Press through front heel to step back forward to starting position."
    ],
    tips: [
      "Reverse lunges are gentler on knees than forward lunges.",
      "Keep front shin relatively vertical and front heel grounded."
    ]
  },
  "Wall Sit Hold": {
    muscle: "Quadriceps (Isometric)",
    secondary: "Glutes, Core, Calves",
    equipment: "Wall (No Equipment)",
    category: "legs",
    kinematic: "wall_sit",
    difficulty: "Beginner-Friendly",
    steps: [
      "Lean back against a flat wall and slide down until knees are bent at 90 degrees.",
      "Thighs should be parallel to the floor, feet planted firmly hip-width apart.",
      "Press entire spine and head flat against the wall.",
      "Rest hands on chest or sides (never on thighs) and hold position for time."
    ],
    tips: [
      "Do not allow knees to extend past toes.",
      "Keep breathing steady and calm to resist quad burn."
    ]
  },
  "Standing Calf Raises": {
    muscle: "Gastrocnemius & Soleus",
    secondary: "Tibialis Posterior",
    equipment: "Bodyweight (No Equipment)",
    category: "legs",
    kinematic: "calf_raise",
    difficulty: "Beginner-Friendly",
    steps: [
      "Stand with feet hip-width apart on flat floor or ball of foot on a raised step.",
      "Press through big toes and lift heels as high as possible.",
      "Hold maximum height at the peak for 1 full second with a strong calf squeeze.",
      "Lower down slowly over 2-3 seconds until heels reach full stretch."
    ],
    tips: [
      "Avoid bouncing or using elastic rebound—use slow, controlled tempo.",
      "Distribute weight evenly across the ball of the foot."
    ]
  },
  "Donkey Kicks": {
    muscle: "Gluteus Maximus",
    secondary: "Hamstrings, Core",
    equipment: "Bodyweight / Floor Mat",
    category: "glutes",
    kinematic: "donkey_kick",
    difficulty: "Beginner-Friendly",
    steps: [
      "Start on all fours with hands under shoulders and knees directly under hips.",
      "Keeping knee bent at 90 degrees, kick one heel up toward the ceiling.",
      "Squeeze glute at top of range without twisting or rotating your hips.",
      "Lower leg slowly back to starting position without touching floor."
    ],
    tips: [
      "Keep core braced so lower back does not arch as the leg lifts.",
      "Focus purely on isolating the glute muscle."
    ]
  },
  "Single-Leg Balance Hold": {
    muscle: "Ankle Stabilizers & Gluteus Medius",
    secondary: "Core, Quadriceps",
    equipment: "Bodyweight (No Equipment)",
    category: "legs",
    kinematic: "balance_hold",
    difficulty: "Beginner-Friendly",
    steps: [
      "Stand tall near a wall or chair for light touch balance if needed.",
      "Shift weight onto one foot and lift opposite knee slightly off ground.",
      "Fix your gaze on a stationary point 6 feet ahead on the wall or floor.",
      "Hold stable posture for target seconds, then switch sides."
    ],
    tips: [
      "Keep standing knee micro-bent rather than locked out rigidly.",
      "Engage your side glute to keep pelvis level."
    ]
  },

  // CORE & CARDIO
  "Dead Bug": {
    muscle: "Transverse Abdominis & Deep Core",
    secondary: "Hip Flexors, Anterior Delts",
    equipment: "Bodyweight / Floor Mat",
    category: "core",
    kinematic: "dead_bug",
    difficulty: "Beginner-Friendly",
    steps: [
      "Lie on back with arms reaching straight up and knees bent at 90 degrees in tabletop.",
      "Press lower back firmly into the floor so there is zero gap under your spine.",
      "Slowly extend right arm overhead and left leg straight toward floor simultaneously.",
      "Return to starting position and alternate with left arm and right leg."
    ],
    tips: [
      "The key is keeping the lower back glued to the floor at all times.",
      "Move slowly—speed defeats the core stabilization effect."
    ]
  },
  "Bird Dog": {
    muscle: "Erectors & Core Stabilizers",
    secondary: "Glutes, Shoulders",
    equipment: "Bodyweight / Floor Mat",
    category: "core",
    kinematic: "bird_dog",
    difficulty: "Beginner-Friendly",
    steps: [
      "Start on hands and knees with neutral spine and gaze on floor.",
      "Simultaneously reach right arm straight forward and left leg straight back.",
      "Hold top position for 2 seconds, forming a straight line from hand to foot.",
      "Return with control and repeat on opposite diagonal side."
    ],
    tips: [
      "Do not allow hips or torso to tilt or rotate as limbs extend.",
      "Think about reaching long rather than kicking high."
    ]
  },
  "Plank": {
    muscle: "Rectus Abdominis & Core Pillar",
    secondary: "Transverse Abdominis, Glutes, Delts",
    equipment: "Bodyweight / Floor Mat",
    category: "core",
    kinematic: "plank",
    difficulty: "Beginner-Friendly",
    steps: [
      "Place forearms on floor with elbows directly under shoulders.",
      "Extend legs back and lift hips so body forms a rigid, unbroken line from head to heels.",
      "Squeeze glutes hard and pull belly button toward spine.",
      "Breathe steadily into the diaphragm while maintaining rock-solid tension."
    ],
    tips: [
      "Do not let lower back sag or hips hike into a pyramid.",
      "Actively pull elbows toward toes to engage the anterior chain."
    ]
  },
  "Plank Shoulder Taps": {
    muscle: "Antirotational Core & Deltoids",
    secondary: "Obliques, Chest",
    equipment: "Bodyweight / Floor Mat",
    category: "core",
    kinematic: "plank_taps",
    difficulty: "Intermediate",
    steps: [
      "Assume a high plank push-up position with feet spread slightly wider for balance.",
      "Brace core firmly to keep hips completely level and still.",
      "Slowly lift right hand and tap left shoulder, then plant hand back down.",
      "Repeat on opposite side with minimal hip sway."
    ],
    tips: [
      "Imagine balancing a glass of water on your lower back that cannot spill.",
      "Spread feet wider if your hips are swaying excessively."
    ]
  },
  "Prone Cobra Back Extension": {
    muscle: "Lower & Mid Traps, Rhomboids, Erector Spinae",
    secondary: "Glutes, Rear Delts",
    equipment: "Bodyweight / Floor Mat",
    category: "core",
    kinematic: "prone_cobra",
    difficulty: "Beginner-Friendly",
    steps: [
      "Lie face down on mat with arms at sides and legs together.",
      "Rotate thumbs toward the ceiling so palms face outward.",
      "Gently elevate chest, head, and arms 2-3 inches off floor by contracting upper back.",
      "Pinch shoulder blades tightly together and hold for 2-3 seconds before lowering."
    ],
    tips: [
      "Look down at the mat to keep cervical spine neutral—do not crane your neck.",
      "Excellent posture corrective movement for desk workers."
    ]
  },
  "Slow Controlled Mountain Climbers": {
    muscle: "Rectus Abdominis & Hip Flexors",
    secondary: "Shoulders, Chest, Triceps",
    equipment: "Bodyweight / Floor Mat",
    category: "core",
    kinematic: "mountain_climbers",
    difficulty: "Beginner-Friendly",
    steps: [
      "Start in a solid high plank position with shoulders directly above wrists.",
      "Slowly draw right knee toward chest without rounding lower back.",
      "Pause for 1 second with knee near chest, squeezing lower abdominals.",
      "Return foot to starting plank and alternate with left knee."
    ],
    tips: [
      "Slow tempo activates deep abdominal fibers much better than rapid running.",
      "Keep hips at shoulder level throughout the exercise."
    ]
  },
  "Low-Impact Step Jacks": {
    muscle: "Full Body Cardiovascular",
    secondary: "Deltoids, Calves, Adductors",
    equipment: "Bodyweight (No Equipment)",
    category: "cardio",
    kinematic: "step_jacks",
    difficulty: "Beginner",
    steps: [
      "Stand tall with feet together and arms at sides.",
      "Step right foot out wide while sweeping both arms overhead.",
      "Return right foot and arms to center.",
      "Immediately step left foot out wide with sweeping arm raise, repeating rhythmically."
    ],
    tips: [
      "100% low impact—zero jumping or joint concussion.",
      "Keep tempo steady and pump arms to elevate heart rate smoothly."
    ]
  },
  "High Knee March in Place": {
    muscle: "Hip Flexors, Core, Cardiovascular",
    secondary: "Quads, Calves",
    equipment: "Bodyweight (No Equipment)",
    category: "cardio",
    kinematic: "high_knees",
    difficulty: "Beginner-Friendly",
    steps: [
      "Stand tall with chest proud and shoulders pulled back.",
      "Drive right knee up toward hip height while pumping opposite arm forward.",
      "Step down softly and immediately drive left knee up.",
      "Maintain a rhythmic, energetic marching tempo."
    ],
    tips: [
      "Keep core engaged so you do not lean backward as knees rise.",
      "Land lightly on balls of feet."
    ]
  },

  // MOBILITY & STRETCHING
  "World's Greatest Stretch": {
    muscle: "Thoracic Spine, Hip Flexors, Hamstrings",
    secondary: "Glutes, Adductors, Shoulders",
    equipment: "Bodyweight / Floor Mat",
    category: "mobility",
    kinematic: "greatest_stretch",
    difficulty: "Beginner-Friendly",
    steps: [
      "Step into a deep forward lunge and place both hands on floor inside front foot.",
      "Drop back knee or keep it hovering with back leg extended.",
      "Take hand closest to front foot and rotate chest upward, reaching arm toward ceiling.",
      "Follow fingertips with eyes, hold 2-3 seconds, return hand and switch sides."
    ],
    tips: [
      "Breathe deeply into the rotation to release thoracic spine tension.",
      "Keep front foot flat with weight centered."
    ]
  },
  "Child's Pose Deep Breathing": {
    muscle: "Latissimus Dorsi, Hips, Spine Decompression",
    secondary: "Ankles, Shoulders",
    equipment: "Bodyweight / Floor Mat",
    category: "mobility",
    kinematic: "childs_pose",
    difficulty: "Beginner-Friendly",
    steps: [
      "Kneel on mat, bring big toes together and separate knees hip-width apart.",
      "Sit hips back onto heels and walk hands forward along the floor.",
      "Rest forehead gently on the mat and relax belly between thighs.",
      "Take slow, expansive 4-second nasal inhales and long 6-second exhales."
    ],
    tips: [
      "Allow gravity to sink hips closer to heels with each out-breath.",
      "Keep shoulders relaxed away from neck."
    ]
  },
  "Seated Hamstring Stretch": {
    muscle: "Hamstrings & Lower Back",
    secondary: "Calves",
    equipment: "Floor Mat / Chair",
    category: "mobility",
    kinematic: "hamstring_stretch",
    difficulty: "Beginner-Friendly",
    steps: [
      "Sit on mat or edge of sturdy chair, extend one leg forward with heel on floor and toes pointing up.",
      "Sit tall through spine and hinge forward from hips toward extended foot.",
      "Stop when a comfortable, mild stretch is felt behind the thigh.",
      "Hold for target duration with relaxed, continuous breathing."
    ],
    tips: [
      "Hinge at the hips—do not round upper back to reach further.",
      "Never bounce into a hamstring stretch."
    ]
  },
  "Seated Butterfly Stretch": {
    muscle: "Adductors (Inner Thighs) & Groin",
    secondary: "Hip Joint Capsules",
    equipment: "Floor Mat",
    category: "mobility",
    kinematic: "butterfly_stretch",
    difficulty: "Beginner-Friendly",
    steps: [
      "Sit tall on floor and bring soles of feet together, letting knees fall open to sides.",
      "Hold onto ankles or feet and gently lift chest up tall.",
      "Allow knees to lower toward floor under natural relaxation and gentle gravity.",
      "Optionally hinge forward slightly at hips to deepen stretch."
    ],
    tips: [
      "Do not forcefully push down on knees with elbows.",
      "Keep spine long and breathe calmly into hips."
    ]
  },
  "Thoracic Spine Openers": {
    muscle: "Thoracic Spine & Pectorals",
    secondary: "Anterior Delts, Upper Back",
    equipment: "Floor Mat",
    category: "mobility",
    kinematic: "thoracic_openers",
    difficulty: "Beginner-Friendly",
    steps: [
      "Lie on side with knees bent at 90 degrees and arms stacked straight out in front.",
      "Keep hips and knees glued together against the floor.",
      "Trace a wide rainbow arc with top arm opening across chest to opposite side.",
      "Turn head with hand and feel upper back open, then reverse smoothly."
    ],
    tips: [
      "Keep hips stacked so movement comes purely from mid-back.",
      "Inhale to prepare, exhale as you open wide."
    ]
  },
  "Cat-Cow Spine Mobility": {
    muscle: "Spinal Extensors & Abdominals",
    secondary: "Neck, Pelvis",
    equipment: "Floor Mat",
    category: "mobility",
    kinematic: "cat_cow",
    difficulty: "Beginner-Friendly",
    steps: [
      "Start on all fours with hands under shoulders and knees under hips.",
      "Inhale (Cow): drop belly toward mat, lift chest and gaze toward ceiling.",
      "Exhale (Cat): tuck chin to chest, draw belly button up, and round spine toward ceiling.",
      "Move smoothly between both positions following the natural rhythm of breathing."
    ],
    tips: [
      "Initiate movement from tailbone and let wave travel up through head.",
      "Great for mobilizing tight vertebrae and improving daily posture."
    ]
  }
};

// Fallback resolver for any unlisted exercise:
function getExerciseDetails(name) {
  if (EXERCISE_DATABASE[name]) {
    return { name, ...EXERCISE_DATABASE[name] };
  }
  // Case-insensitive lookup
  const key = Object.keys(EXERCISE_DATABASE).find(k => k.toLowerCase() === (name || "").toLowerCase());
  if (key) {
    return { name, ...EXERCISE_DATABASE[key] };
  }
  
  // Intelligent kinematic classification fallback
  const n = (name || "").toLowerCase();
  let kinematic = "squat";
  let muscle = "Target Muscle Group";
  let category = "full_body";
  let equipment = "Bodyweight / Gym Equipment";

  if (n.includes("bench") || n.includes("chest") || n.includes("pec")) {
    kinematic = n.includes("incline") ? "incline_press" : "bench_press";
    muscle = "Pectoralis Major & Triceps";
    category = "chest";
    equipment = "Bench & Barbell/Dumbbells";
  } else if (n.includes("push-up") || n.includes("pushup")) {
    kinematic = n.includes("incline") || n.includes("knee") ? "incline_push_up" : "push_up";
    muscle = "Pectoralis Major & Core";
    category = "chest";
    equipment = "Bodyweight (No Equipment)";
  } else if (n.includes("dip")) {
    kinematic = n.includes("floor") ? "floor_dips" : "dips";
    muscle = "Triceps Brachii & Lower Chest";
    category = "triceps";
    equipment = n.includes("floor") ? "Bodyweight (No Equipment)" : "Dip Bars";
  } else if (n.includes("squat") || n.includes("leg press")) {
    kinematic = n.includes("sumo") ? "sumo_squat" : "squat";
    muscle = "Quadriceps & Gluteus Maximus";
    category = "legs";
    equipment = n.includes("bodyweight") ? "Bodyweight (No Equipment)" : "Barbell / Machine";
  } else if (n.includes("deadlift") || n.includes("rdl")) {
    kinematic = "rdl";
    muscle = "Hamstrings, Glutes & Erector Spinae";
    category = "legs";
    equipment = "Barbell / Dumbbells";
  } else if (n.includes("lunge")) {
    kinematic = "lunge";
    muscle = "Quadriceps & Glutes";
    category = "legs";
    equipment = "Bodyweight / Dumbbells";
  } else if (n.includes("bridge") || n.includes("hip thrust")) {
    kinematic = n.includes("hold") ? "glute_bridge_hold" : "glute_bridge";
    muscle = "Gluteus Maximus";
    category = "glutes";
    equipment = "Bodyweight (No Equipment)";
  } else if (n.includes("shoulder") || n.includes("press") || n.includes("arnold")) {
    kinematic = n.includes("arnold") ? "arnold_press" : "overhead_press";
    muscle = "Deltoids (Shoulders)";
    category = "shoulders";
    equipment = "Dumbbells / Barbell";
  } else if (n.includes("lateral raise") || n.includes("side raise")) {
    kinematic = "lateral_raise";
    muscle = "Lateral Deltoids (Side Delts)";
    category = "shoulders";
    equipment = "Dumbbells / Cables";
  } else if (n.includes("row")) {
    kinematic = "barbell_row";
    muscle = "Latissimus Dorsi & Rhomboids";
    category = "back";
    equipment = "Barbell / Dumbbells";
  } else if (n.includes("pull-up") || n.includes("chin-up") || n.includes("pulldown")) {
    kinematic = n.includes("pull-up") ? "pull_up" : "lat_pulldown";
    muscle = "Latissimus Dorsi & Upper Back";
    category = "back";
    equipment = n.includes("pulldown") ? "Cable Machine" : "Pull-up Bar";
  } else if (n.includes("curl") && !n.includes("leg")) {
    kinematic = n.includes("hammer") ? "hammer_curl" : "bicep_curl";
    muscle = "Biceps Brachii";
    category = "biceps";
    equipment = "Dumbbells / Barbell";
  } else if (n.includes("tricep") || n.includes("extension") || n.includes("skull")) {
    kinematic = n.includes("overhead") ? "overhead_triceps" : "triceps_pushdown";
    muscle = "Triceps Brachii";
    category = "triceps";
    equipment = "Cable / Dumbbells";
  } else if (n.includes("calf") || n.includes("calves")) {
    kinematic = "calf_raise";
    muscle = "Gastrocnemius & Soleus (Calves)";
    category = "legs";
    equipment = "Bodyweight (No Equipment)";
  } else if (n.includes("plank")) {
    kinematic = n.includes("tap") ? "plank_taps" : "plank";
    muscle = "Transverse & Rectus Abdominis";
    category = "core";
    equipment = "Bodyweight (No Equipment)";
  } else if (n.includes("dead bug") || n.includes("bird dog")) {
    kinematic = n.includes("dead bug") ? "dead_bug" : "bird_dog";
    muscle = "Deep Core Stabilizers & Spine";
    category = "core";
    equipment = "Bodyweight (No Equipment)";
  } else if (n.includes("stretch") || n.includes("pose") || n.includes("mobility")) {
    kinematic = "greatest_stretch";
    muscle = "Hip Flexors, Spine & Mobility";
    category = "mobility";
    equipment = "Bodyweight (No Equipment)";
  }

  return {
    name,
    muscle,
    secondary: "Core Stabilizers & Supporting Muscles",
    equipment,
    category,
    kinematic,
    difficulty: "Beginner-Friendly",
    steps: [
      `Assume proper setup for ${name} with neutral spine and engaged core.`,
      "Initiate the movement under control, feeling tension in the target muscles.",
      "Reach peak range of motion and squeeze the working muscle for a brief pause.",
      "Return smoothly along the same path to complete the repetition."
    ],
    tips: [
      "Breathe rhythmically: exhale during exertion, inhale during lowering.",
      "Control the eccentric (lowering) phase for maximum muscular recruitment.",
      "Stop if you experience sharp pain or loss of proper joint alignment."
    ]
  };
}

if (typeof window !== "undefined") {
  window.EXERCISE_DATABASE = EXERCISE_DATABASE;
  window.getExerciseDetails = getExerciseDetails;
}

