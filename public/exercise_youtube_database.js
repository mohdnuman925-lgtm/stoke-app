/* ============================================================
   STOKE EXERCISE YOUTUBE TUTORIAL DATABASE & MAPPING SYSTEM
   Exact, beginner-friendly workout tutorials from reliable channels
   (ScottHermanFitness, Bowflex, Calisthenicmovement, Jeff Nippard,
   Alan Thrall, Bodybuilding.com, HASfit, Squat University, etc.)
   ============================================================ */

(function(global) {
  "use strict";

  var EXERCISE_YOUTUBE_MAP = {
    // ------------------------------------------------------------
    // CHEST
    // ------------------------------------------------------------
    "Bench Press": {
      youtubeUrl: "https://www.youtube.com/watch?v=rT7DgCr-3pg",
      videoId: "rT7DgCr-3pg",
      channel: "ScottHermanFitness",
      muscle: "Pectoralis Major (Mid & Lower)",
      secondary: "Anterior Deltoids, Triceps Brachii",
      equipment: "Barbell & Flat Bench",
      category: "chest",
      difficulty: "Intermediate",
      steps: [
        "Lie flat on the bench with eyes directly under the racked bar. Plant feet firmly into the floor.",
        "Grip the bar slightly wider than shoulder-width. Retract shoulder blades firmly into the bench.",
        "Unrack the bar and lower it under control to mid-chest, keeping elbows tucked at roughly 45 degrees.",
        "Drive feet into the ground and press the bar powerfully back up to lockout, exhaling at the top."
      ],
      tips: [
        "Keep wrists straight and stacked directly above elbows.",
        "Do not flare elbows out to 90 degrees to protect the rotator cuff.",
        "Keep glutes glued to the bench throughout the lift."
      ]
    },
    "Incline Press": {
      youtubeUrl: "https://www.youtube.com/watch?v=cq-4gME3IFY",
      videoId: "cq-4gME3IFY",
      channel: "ScottHermanFitness",
      muscle: "Clavicular Pectoralis (Upper Chest)",
      secondary: "Anterior Deltoids, Triceps",
      equipment: "Incline Bench (30-45°) & Barbell",
      category: "chest",
      difficulty: "Intermediate",
      steps: [
        "Set bench to a 30 to 45 degree angle. Plant feet firmly on the ground with chest puffed high.",
        "Lower the barbell under steady control to your upper chest near the collarbones.",
        "Pause for a fraction of a second at full stretch without bouncing the bar off ribs.",
        "Press straight upward and slightly back toward eye line, contracting the upper pecs."
      ],
      tips: [
        "Avoid inclines greater than 45 degrees which shift tension to shoulders.",
        "Keep shoulder blades pinned back into the bench padding."
      ]
    },
    "Incline Dumbbell Press": {
      youtubeUrl: "https://www.youtube.com/watch?v=8iPEnn-ltC8",
      videoId: "8iPEnn-ltC8",
      channel: "ScottHermanFitness",
      muscle: "Clavicular Pectoralis (Upper Chest)",
      secondary: "Anterior Deltoids, Triceps",
      equipment: "Incline Bench & Dumbbells",
      category: "chest",
      difficulty: "Intermediate",
      steps: [
        "Sit on an incline bench holding dumbbells on knees, then kick weights up to shoulders as you lie back.",
        "Position dumbbells at a 45-degree angle with palms facing forward.",
        "Lower dumbbells until elbows reach chest level, feeling a deep stretch in upper pecs.",
        "Press up and slightly inward over chest, stopping just short of touching at top."
      ],
      tips: [
        "Control the lowering phase over 2-3 seconds.",
        "Keep feet planted firmly for maximum driving stability."
      ]
    },
    "Flat Dumbbell Press": {
      youtubeUrl: "https://www.youtube.com/watch?v=sDFRLKOEPwA",
      videoId: "sDFRLKOEPwA",
      channel: "ScottHermanFitness",
      muscle: "Pectoralis Major (Mid & Outer)",
      secondary: "Triceps, Front Delts",
      equipment: "Flat Bench & Dumbbells",
      category: "chest",
      difficulty: "Intermediate",
      steps: [
        "Sit on edge of flat bench holding dumbbells on thighs. Lie back kicking weights into pressing position.",
        "Keep elbows angled at 45 degrees relative to torso.",
        "Lower dumbbells down smoothly until a full chest stretch is achieved.",
        "Press dumbbells back up, focusing on squeezing pecs together."
      ],
      tips: [
        "Keep wrists firm and neutral.",
        "Do not clang the dumbbells together at the top."
      ]
    },
    "Chest Fly": {
      youtubeUrl: "https://www.youtube.com/watch?v=eozdVDA78K0",
      videoId: "eozdVDA78K0",
      channel: "ScottHermanFitness",
      muscle: "Pectoralis Major (Sternal Head)",
      secondary: "Anterior Deltoids, Biceps Short Head",
      equipment: "Dumbbells & Flat Bench",
      category: "chest",
      difficulty: "Beginner-Friendly",
      steps: [
        "Lie on flat bench holding dumbbells directly above chest with palms facing each other.",
        "Maintain a slight, fixed bend at the elbows (around 15 degrees).",
        "Lower weights out wide in a sweeping hugging arc until a deep chest stretch is felt.",
        "Bring weights back together in the same arc, squeezing inner chest at the peak."
      ],
      tips: [
        "Do not turn this into a press by excessively bending elbows at bottom.",
        "Stop when elbows reach bench height to protect shoulder capsule."
      ]
    },
    "Cable Crossover": {
      youtubeUrl: "https://www.youtube.com/watch?v=8O9RkI2pVfk",
      videoId: "8O9RkI2pVfk",
      channel: "THE GYM SM",
      muscle: "Pectoralis Major (Sternal & Lower)",
      secondary: "Anterior Deltoids",
      equipment: "Dual Cable Machine",
      category: "chest",
      difficulty: "Intermediate",
      steps: [
        "Set pulleys at high position. Step forward with a staggered stance and lean torso slightly forward.",
        "With a slight bend in elbows, pull handles downward and across body.",
        "Cross hands slightly at bottom to maximize peak chest contraction.",
        "Return arms under control until chest is fully stretched."
      ],
      tips: [
        "Keep torso stationary—do not use swinging momentum.",
        "Maintain continuous cable tension on the pecs."
      ]
    },
    "High-to-Low Cable Fly": {
      youtubeUrl: "https://www.youtube.com/watch?v=8Um35Es-ROE",
      videoId: "8Um35Es-ROE",
      channel: "ScottHermanFitness",
      muscle: "Lower Pectoralis Major",
      secondary: "Anterior Deltoids",
      equipment: "Dual Cable Machine",
      category: "chest",
      difficulty: "Intermediate",
      steps: [
        "Set pulleys at shoulder height or higher. Grip handles and take a step forward.",
        "Drive handles downward and inward toward hips in a sweeping hugging arc.",
        "Squeeze lower chest tightly for a full second.",
        "Allow arms to open wide back to the starting stretch."
      ],
      tips: [
        "Focus on bringing your elbows toward each other.",
        "Breathe out forcefully as hands meet."
      ]
    },
    "Low-to-High Cable Fly": {
      youtubeUrl: "https://www.youtube.com/watch?v=u5X5x1fw_SA",
      videoId: "u5X5x1fw_SA",
      channel: "TylerPath",
      muscle: "Upper Pectoralis (Clavicular Head)",
      secondary: "Anterior Deltoids",
      equipment: "Dual Cable Machine",
      category: "chest",
      difficulty: "Intermediate",
      steps: [
        "Set pulleys at lowest position. Grab handles with palms facing forward.",
        "Step forward into a staggered stance with chest high.",
        "Scoop arms upward and inward until hands meet at eye level.",
        "Hold the peak contraction, then lower with control back to start."
      ],
      tips: [
        "Do not shrug shoulders up into your neck.",
        "Keep elbows soft but locked in position."
      ]
    },
    "Push-up": {
      youtubeUrl: "https://www.youtube.com/watch?v=IODxDxX7oi4",
      videoId: "IODxDxX7oi4",
      channel: "Calisthenicmovement",
      muscle: "Pectoralis Major & Core",
      secondary: "Triceps, Anterior Deltoids, Serratus",
      equipment: "Bodyweight (No Equipment)",
      category: "chest",
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
      youtubeUrl: "https://www.youtube.com/watch?v=4dF1DOWzf20",
      videoId: "4dF1DOWzf20",
      channel: "Calisthenicmovement",
      muscle: "Pectoralis Major & Core",
      secondary: "Triceps, Shoulders",
      equipment: "Bodyweight (No Equipment)",
      category: "chest",
      difficulty: "Beginner-Friendly",
      steps: [
        "Place hands on a wall, sturdy counter, bench, or on knees on a mat.",
        "Keep core braced and spine neutral in one unbroken line.",
        "Lower chest toward the surface until elbows form 90 degrees.",
        "Press away smoothly to return to starting position, exhaling with control."
      ],
      tips: [
        "Great regression for building upper body pressing strength without joint stress.",
        "Keep core tight so hips move in unison with torso."
      ]
    },
    "Diamond Push-up": {
      youtubeUrl: "https://www.youtube.com/watch?v=J0DnG1_S92I",
      videoId: "J0DnG1_S92I",
      channel: "ScottHermanFitness",
      muscle: "Triceps Brachii & Inner Chest",
      secondary: "Anterior Deltoids, Core",
      equipment: "Bodyweight (No Equipment)",
      category: "chest",
      difficulty: "Intermediate",
      steps: [
        "Assume push-up position with thumbs and index fingers touching to form a diamond shape under center chest.",
        "Brace core and lower chest until it lightly touches hands.",
        "Press powerfully through palms to full arm extension.",
        "Keep elbows tracking back along ribs rather than flaring out."
      ],
      tips: [
        "If full bodyweight is too intense, perform from knees first.",
        "Keep wrists relaxed and straight."
      ]
    },
    "Close-Grip Push-up": {
      youtubeUrl: "https://www.youtube.com/watch?v=J0DnG1_S92I",
      videoId: "J0DnG1_S92I",
      channel: "Calisthenicmovement",
      muscle: "Triceps Brachii & Pectorals",
      secondary: "Shoulders, Core",
      equipment: "Bodyweight (No Equipment)",
      category: "chest",
      difficulty: "Beginner-Friendly",
      steps: [
        "Set hands directly under shoulders, slightly narrower than shoulder-width.",
        "Keep body in a tight plank line.",
        "Lower body keeping upper arms brushing against your sides.",
        "Press floor away to full extension."
      ],
      tips: [
        "Keep elbows pinned against ribcage.",
        "Engage abs to prevent lumbar hyperextension."
      ]
    },
    "Decline Bench Press": {
      youtubeUrl: "https://www.youtube.com/watch?v=LfyQBUKR8SE",
      videoId: "LfyQBUKR8SE",
      channel: "ScottHermanFitness",
      muscle: "Lower Pectoralis Major",
      secondary: "Triceps Brachii, Anterior Delts",
      equipment: "Decline Bench & Barbell",
      category: "chest",
      difficulty: "Intermediate",
      steps: [
        "Secure legs in decline bench pad and lie back.",
        "Grip bar with medium overhand grip and unrack.",
        "Lower bar under control to lower chest line.",
        "Press bar back to lockout over lower chest."
      ],
      tips: [
        "Ensure shins are securely anchored in the roller pads.",
        "Maintain controlled tempo."
      ]
    },
    "Machine Chest Press": {
      youtubeUrl: "https://www.youtube.com/watch?v=xUm0BiZCWlQ",
      videoId: "xUm0BiZCWlQ",
      channel: "ScottHermanFitness",
      muscle: "Pectoralis Major",
      secondary: "Triceps, Shoulders",
      equipment: "Chest Press Machine",
      category: "chest",
      difficulty: "Beginner-Friendly",
      steps: [
        "Adjust seat height so handles align with mid-chest.",
        "Plant feet flat, pin shoulder blades into backrest.",
        "Push handles forward to lockout without locking elbows harshly.",
        "Lower weight slowly back until chest feels a mild stretch."
      ],
      tips: [
        "Do not let weights slam into the stack between reps.",
        "Keep head and upper back glued to the pad."
      ]
    },
    "Floor Press": {
      youtubeUrl: "https://www.youtube.com/watch?v=uUGDRwge4F8",
      videoId: "uUGDRwge4F8",
      channel: "ScottHermanFitness",
      muscle: "Pectoralis Major & Triceps Lockout",
      secondary: "Anterior Deltoids",
      equipment: "Barbell / Dumbbells & Floor Mat",
      category: "chest",
      difficulty: "Intermediate",
      steps: [
        "Lie on back on floor with knees bent and feet flat.",
        "Hold barbell or dumbbells directly over chest.",
        "Lower weights until triceps gently touch floor.",
        "Pause briefly, eliminating bounce, then press explosively to lockout."
      ],
      tips: [
        "Do not slam elbows into the floor.",
        "Excellent exercise for shoulder-friendly chest training."
      ]
    },
    "Pec Deck": {
      youtubeUrl: "https://www.youtube.com/watch?v=o3aKaOep8z8",
      videoId: "o3aKaOep8z8",
      channel: "TylerPath",
      muscle: "Pectoralis Major (Sternal Squeeze)",
      secondary: "Anterior Deltoids",
      equipment: "Pec Deck Machine",
      category: "chest",
      difficulty: "Beginner-Friendly",
      steps: [
        "Sit with back flat against pad and handles adjusted to chest level.",
        "Bring arms together in front of chest in a smooth clapping arc.",
        "Squeeze inner pecs hard for 1 second at peak contraction.",
        "Slowly release back until chest feels comfortable stretch."
      ],
      tips: [
        "Keep elbows slightly bent and level with shoulders.",
        "Do not allow weights to pull shoulders too far back."
      ]
    },
    "Dips": {
      youtubeUrl: "https://www.youtube.com/watch?v=2z8JmcrW-As",
      videoId: "2z8JmcrW-As",
      channel: "Calisthenicmovement",
      muscle: "Lower Pectorals & Triceps",
      secondary: "Anterior Deltoids, Lats",
      equipment: "Parallel Dip Bars",
      category: "chest",
      difficulty: "Advanced",
      steps: [
        "Grip parallel bars and suspend your body with arms straight.",
        "Lean torso forward roughly 20 to 30 degrees to bias chest over triceps.",
        "Lower your body until elbows bend to 90 degrees and you feel a gentle chest stretch.",
        "Press firmly through your palms to return to starting position."
      ],
      tips: [
        "Keep shoulders depressed down away from ears.",
        "Avoid sinking too deep if you experience shoulder discomfort."
      ]
    },
    "Ring Dip": {
      youtubeUrl: "https://www.youtube.com/watch?v=-pChKm_jMYY",
      videoId: "-pChKm_jMYY",
      channel: "DIE RINGE - App",
      muscle: "Pectorals, Triceps & Stabilizers",
      secondary: "Shoulders, Core",
      equipment: "Gymnastic Rings",
      category: "chest",
      difficulty: "Advanced",
      steps: [
        "Hold support position on rings with arms locked out.",
        "Lower body with slight forward lean while keeping rings close to hips.",
        "Reach 90 degrees of elbow flexion.",
        "Press up and turn rings out slightly at the top for peak contraction."
      ],
      tips: [
        "Ensure rings are stabilized before descending.",
        "Keep core tight to prevent swaying."
      ]
    },
    "Dumbbell Pullover": {
      youtubeUrl: "https://www.youtube.com/watch?v=FK4rHfWKEac",
      videoId: "FK4rHfWKEac",
      channel: "ScottHermanFitness",
      muscle: "Pectoralis Major & Latissimus Dorsi",
      secondary: "Serratus Anterior, Triceps",
      equipment: "Flat Bench & Dumbbell",
      category: "chest",
      difficulty: "Intermediate",
      steps: [
        "Lie across flat bench with upper back supported and hips slightly dropped.",
        "Cup both hands under inner plate of dumbbell over chest.",
        "Lower dumbbell in a controlled arc behind head until a deep stretch is felt.",
        "Pull dumbbell back over chest using pecs and lats."
      ],
      tips: [
        "Maintain a slight bend in elbows throughout.",
        "Do not drop hips too low to avoid lumbar strain."
      ]
    },
    "Svend Press": {
      youtubeUrl: "https://www.youtube.com/watch?v=cIoUZOnypS8",
      videoId: "cIoUZOnypS8",
      channel: "Bodybuilding.com",
      muscle: "Inner Pectoralis Major",
      secondary: "Anterior Deltoids",
      equipment: "Weight Plates / Dumbbell",
      category: "chest",
      difficulty: "Beginner-Friendly",
      steps: [
        "Stand tall pinching two light weight plates together between palms at chest level.",
        "Squeeze plates together as hard as possible with chest muscles.",
        "Press plates straight out forward to arm extension.",
        "Pull back to chest while maintaining constant inward squeezing pressure."
      ],
      tips: [
        "Tension comes from squeezing palms together, not the weight itself.",
        "Keep shoulders relaxed."
      ]
    },

    // ------------------------------------------------------------
    // BACK
    // ------------------------------------------------------------
    "Deadlift": {
      youtubeUrl: "https://www.youtube.com/watch?v=op9kVnSso6Q",
      videoId: "op9kVnSso6Q",
      channel: "Alan Thrall",
      muscle: "Erector Spinae, Latissimus Dorsi, Glutes",
      secondary: "Hamstrings, Trapezius, Forearms",
      equipment: "Barbell & Olympic Plates",
      category: "back",
      difficulty: "Advanced",
      steps: [
        "Stand with feet hip-width apart, barbell over mid-foot (1 inch from shins).",
        "Hinge at hips, bend knees slightly, and grip bar just outside legs with straight arms.",
        "Bring shins to touch bar, lift chest high, and pull slack out of bar.",
        "Drive floor away through whole foot, standing tall by extending hips and knees simultaneously."
      ],
      tips: [
        "Never round your lumbar spine under heavy load.",
        "Keep the barbell path strictly vertical, scraping along shins and thighs."
      ]
    },
    "Pull-up": {
      youtubeUrl: "https://www.youtube.com/watch?v=eGo4IYlbE5g",
      videoId: "eGo4IYlbE5g",
      channel: "Calisthenicmovement",
      muscle: "Latissimus Dorsi & Upper Back",
      secondary: "Biceps, Forearms, Core",
      equipment: "Pull-up Bar",
      category: "back",
      difficulty: "Advanced",
      steps: [
        "Hang from overhead bar with hands slightly wider than shoulder-width, palms forward.",
        "Engage scapulae by pulling shoulder blades down before bending elbows.",
        "Pull body up until chin clears the bar, driving elbows down into ribs.",
        "Lower under control over 2-3 seconds back to a dead hang."
      ],
      tips: [
        "Avoid kipping or swinging legs to gain artificial momentum.",
        "Keep core braced and legs straight or crossed behind you."
      ]
    },
    "Chin-up": {
      youtubeUrl: "https://www.youtube.com/watch?v=brhRXlOhsAM",
      videoId: "brhRXlOhsAM",
      channel: "ScottHermanFitness",
      muscle: "Latissimus Dorsi & Biceps Brachii",
      secondary: "Upper Back, Forearms",
      equipment: "Pull-up Bar",
      category: "back",
      difficulty: "Intermediate",
      steps: [
        "Hang with an underhand grip (palms facing you), shoulder-width apart.",
        "Pull chest upward toward bar by bending elbows and retracting scapulae.",
        "Clear chin over bar and squeeze biceps and lats.",
        "Lower with full control to dead hang."
      ],
      tips: [
        "Great variation for maximizing bicep recruitment with back training.",
        "Control the negative descent."
      ]
    },
    "Lat Pulldown": {
      youtubeUrl: "https://www.youtube.com/watch?v=CAwf7n6Luuc",
      videoId: "CAwf7n6Luuc",
      channel: "ScottHermanFitness",
      muscle: "Latissimus Dorsi (Lats)",
      secondary: "Biceps Brachii, Rear Delts, Rhomboids",
      equipment: "Cable Pulldown Machine",
      category: "back",
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
    "Wide-Grip Lat Pulldown": {
      youtubeUrl: "https://www.youtube.com/watch?v=CAwf7n6Luuc",
      videoId: "CAwf7n6Luuc",
      channel: "ScottHermanFitness",
      muscle: "Upper Latissimus Dorsi",
      secondary: "Teres Major, Biceps",
      equipment: "Cable Pulldown Machine",
      category: "back",
      difficulty: "Beginner-Friendly",
      steps: [
        "Take a wide overhand grip on the lat bar.",
        "Set shoulders down and back, pull bar to collarbones.",
        "Squeeze outer lats at peak contraction.",
        "Return smoothly to full overhead stretch."
      ],
      tips: [
        "Do not pull the bar behind your neck to prevent cervical spine stress.",
        "Keep motion smooth and controlled."
      ]
    },
    "Single-Arm Lat Pulldown": {
      youtubeUrl: "https://www.youtube.com/watch?v=j25Ek-TNHAE",
      videoId: "j25Ek-TNHAE",
      channel: "ScottHermanFitness",
      muscle: "Latissimus Dorsi (Unilateral)",
      secondary: "Biceps, Obliques",
      equipment: "Cable Machine & Single Handle",
      category: "back",
      difficulty: "Intermediate",
      steps: [
        "Kneel or sit at cable machine holding single handle overhead.",
        "Pull elbow down and tight into ribcage, feeling deep unilateral lat squeeze.",
        "Pause for 1 second, then control back up to full stretch overhead."
      ],
      tips: [
        "Great for correcting muscular imbalances between sides.",
        "Keep torso square."
      ]
    },
    "Barbell Row": {
      youtubeUrl: "https://www.youtube.com/watch?v=QlJeL9GZMtU",
      videoId: "QlJeL9GZMtU",
      channel: "ScottHermanFitness",
      muscle: "Latissimus Dorsi, Rhomboids, Trapezius",
      secondary: "Rear Deltoids, Biceps, Spinal Erectors",
      equipment: "Barbell",
      category: "back",
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
    "Pendlay Row": {
      youtubeUrl: "https://www.youtube.com/watch?v=Weu9HMHdiDA",
      videoId: "Weu9HMHdiDA",
      channel: "ScottHermanFitness",
      muscle: "Upper Back, Lats & Posterior Chain",
      secondary: "Rhomboids, Biceps",
      equipment: "Barbell on Floor",
      category: "back",
      difficulty: "Advanced",
      steps: [
        "Set torso parallel to floor with bar resting on plates on floor.",
        "Pull bar explosively into lower chest/sternum.",
        "Lower bar completely to dead stop on floor between every rep."
      ],
      tips: [
        "Reset posture before every single pull.",
        "Do not stand up during the pull."
      ]
    },
    "Seated Cable Row": {
      youtubeUrl: "https://www.youtube.com/watch?v=GZbfZ033f74",
      videoId: "GZbfZ033f74",
      channel: "ScottHermanFitness",
      muscle: "Rhomboids, Middle Trapezius, Lats",
      secondary: "Biceps Brachii, Forearms",
      equipment: "Seated Cable Row Machine",
      category: "back",
      difficulty: "Beginner-Friendly",
      steps: [
        "Sit on bench with knees slightly bent and feet placed firmly on footrests.",
        "Grip V-bar handle with arms extended and torso upright with neutral spine.",
        "Pull handle into belly button while driving elbows straight back.",
        "Pinch shoulder blades together tightly, then extend arms forward under control."
      ],
      tips: [
        "Avoid swinging back and forth excessively with your lower back.",
        "Keep shoulders pulled down away from ears."
      ]
    },
    "One-Arm Dumbbell Row": {
      youtubeUrl: "https://www.youtube.com/watch?v=pYcpY20QaE8",
      videoId: "pYcpY20QaE8",
      channel: "ScottHermanFitness",
      muscle: "Latissimus Dorsi & Rhomboids",
      secondary: "Biceps, Core Stabilizers",
      equipment: "Flat Bench & Dumbbell",
      category: "back",
      difficulty: "Beginner-Friendly",
      steps: [
        "Place one knee and hand on flat bench for support with spine parallel to floor.",
        "Hold dumbbell in opposite hand letting it hang straight down.",
        "Pull dumbbell up toward hip pocket, driving elbow to ceiling.",
        "Squeeze back at top, then lower weight to full stretch."
      ],
      tips: [
        "Pull back toward hip rather than straight up to shoulder.",
        "Do not twist torso to hoist weight."
      ]
    },
    "T-Bar Row": {
      youtubeUrl: "https://www.youtube.com/watch?v=j3Igk5nyZE4",
      videoId: "j3Igk5nyZE4",
      channel: "ScottHermanFitness",
      muscle: "Middle Back, Rhomboids, Lats",
      secondary: "Biceps, Rear Delts",
      equipment: "T-Bar Row Station / Landmine",
      category: "back",
      difficulty: "Intermediate",
      steps: [
        "Straddle bar with knees bent and torso hinged at 45 degrees.",
        "Grip handles with arms extended.",
        "Pull bar toward chest squeezing shoulder blades together.",
        "Lower under control without rounding back."
      ],
      tips: [
        "Keep chest up and spine rigid.",
        "Drive through elbows."
      ]
    },
    "Face Pull": {
      youtubeUrl: "https://www.youtube.com/watch?v=rep-qVOkqgk",
      videoId: "rep-qVOkqgk",
      channel: "Omar Isuf",
      muscle: "Rear Deltoids, Rotator Cuff, Rhomboids",
      secondary: "Upper Trapezius",
      equipment: "Cable Pulley & Rope Attachment",
      category: "back",
      difficulty: "Beginner-Friendly",
      steps: [
        "Attach rope to cable pulley at eye level. Grip rope ends with thumbs pointing backward.",
        "Step back to create tension and stand with feet hip-width apart.",
        "Pull rope directly toward bridge of nose, separating hands out wide.",
        "Rotate hands back so forearms are vertical in a double-bicep pose, holding for 1 second."
      ],
      tips: [
        "Focus on external shoulder rotation rather than just pulling with arms.",
        "Essential exercise for shoulder health and correcting rounded posture."
      ]
    },
    "Straight-Arm Pulldown": {
      youtubeUrl: "https://www.youtube.com/watch?v=hAMcfubonDc",
      videoId: "hAMcfubonDc",
      channel: "Andrew Kwong (DeltaBolic)",
      muscle: "Latissimus Dorsi & Teres Major",
      secondary: "Triceps Long Head, Core",
      equipment: "Cable Stack & Straight Bar / Rope",
      category: "back",
      difficulty: "Beginner-Friendly",
      steps: [
        "Stand facing high pulley with slight forward hip hinge.",
        "Grip bar with arms straight and elbows slightly soft.",
        "Sweep bar down in an arc to thighs using pure lat contraction.",
        "Squeeze lats hard at bottom, then return slowly to eye level."
      ],
      tips: [
        "Do not bend elbows to turn this into a pushdown.",
        "Keep chest proud throughout."
      ]
    },
    "Chest-Supported Row": {
      youtubeUrl: "https://www.youtube.com/watch?v=0UBRfiO4zDs",
      videoId: "0UBRfiO4zDs",
      channel: "ScottHermanFitness",
      muscle: "Upper Back & Rhomboids",
      secondary: "Rear Delts, Biceps",
      equipment: "Incline Bench & Dumbbells",
      category: "back",
      difficulty: "Beginner-Friendly",
      steps: [
        "Lie face down on an incline bench with chest firmly supported.",
        "Let dumbbells hang straight down with palms facing each other.",
        "Row weights upward driving elbows back past torso.",
        "Pinch shoulder blades together, then lower slowly."
      ],
      tips: [
        "Removes lower back fatigue, allowing pure upper back isolation.",
        "Do not lift chest off bench."
      ]
    },
    "Rack Pull": {
      youtubeUrl: "https://www.youtube.com/watch?v=42LOtkXRF3s",
      videoId: "42LOtkXRF3s",
      channel: "ScottHermanFitness",
      muscle: "Upper Back, Trapezius, Spinal Erectors",
      secondary: "Glutes, Forearms",
      equipment: "Power Rack & Barbell",
      category: "back",
      difficulty: "Intermediate",
      steps: [
        "Set safety pins in rack just below or above knee height.",
        "Assume standard deadlift stance and grip.",
        "Brace core, pull shoulders back, and drive hips forward to lockout.",
        "Lower bar back to pins under control."
      ],
      tips: [
        "Focus on upper back density and grip strength.",
        "Do not hyperextend spine at top."
      ]
    },
    "Trap Bar Deadlift": {
      youtubeUrl: "https://www.youtube.com/watch?v=7K9wTlqg_OE",
      videoId: "7K9wTlqg_OE",
      channel: "ScottHermanFitness",
      muscle: "Quads, Glutes & Upper Back",
      secondary: "Hamstrings, Core",
      equipment: "Hex / Trap Bar",
      category: "back",
      difficulty: "Intermediate",
      steps: [
        "Step inside hexagonal trap bar with feet hip-width apart.",
        "Hinge hips and bend knees to grip neutral handles.",
        "Keep chest proud, drive through heels, and stand tall.",
        "Lower weight smoothly along vertical path back to floor."
      ],
      tips: [
        "Very beginner-friendly and easier on lower back than straight barbell.",
        "Keep shoulders back and down."
      ]
    },

    // ------------------------------------------------------------
    // SHOULDERS
    // ------------------------------------------------------------
    "Overhead Press": {
      youtubeUrl: "https://www.youtube.com/watch?v=2yjwXTZQDDI",
      videoId: "2yjwXTZQDDI",
      channel: "ScottHermanFitness",
      muscle: "Anterior & Lateral Deltoids",
      secondary: "Triceps, Upper Traps, Core",
      equipment: "Barbell / Standing",
      category: "shoulders",
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
    "Arnold Press": {
      youtubeUrl: "https://www.youtube.com/watch?v=3ml7BH7mNwQ",
      videoId: "3ml7BH7mNwQ",
      channel: "ScottHermanFitness",
      muscle: "All Three Deltoid Heads",
      secondary: "Triceps, Upper Traps",
      equipment: "Dumbbells & Bench",
      category: "shoulders",
      difficulty: "Intermediate",
      steps: [
        "Sit on an upright bench holding dumbbells at chin level, palms facing your chest.",
        "As you press upward, rotate wrists so palms face forward at the midpoint.",
        "Continue pressing to full overhead lockout with palms facing forward.",
        "Reverse the rotation smoothly on the descent back to chin level."
      ],
      tips: [
        "Perform the rotation smoothly throughout the press rather than abruptly at top.",
        "Keep core engaged so you do not hyperextend lower back."
      ]
    },
    "Lateral Raise": {
      youtubeUrl: "https://www.youtube.com/watch?v=3VcKaXpzqRo",
      videoId: "3VcKaXpzqRo",
      channel: "ScottHermanFitness",
      muscle: "Lateral Deltoids (Side Delts)",
      secondary: "Anterior Deltoids, Trapezius",
      equipment: "Dumbbells",
      category: "shoulders",
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
    "Cable Lateral Raise": {
      youtubeUrl: "https://www.youtube.com/watch?v=PPrzBWZDOhA",
      videoId: "PPrzBWZDOhA",
      channel: "Jeff Nippard",
      muscle: "Lateral Deltoids (Side Delts)",
      secondary: "Trapezius",
      equipment: "Cable Machine & Single Handle",
      category: "shoulders",
      difficulty: "Intermediate",
      steps: [
        "Set pulley to lowest setting. Stand adjacent to cable machine holding handle in outer hand.",
        "Raise handle laterally in a wide arc until arm is parallel to floor.",
        "Control descent, enjoying continuous tension at the bottom of the movement."
      ],
      tips: [
        "Cables provide continuous tension that dumbbells cannot match at bottom.",
        "Keep wrist firm and straight."
      ]
    },
    "Seated Dumbbell Press": {
      youtubeUrl: "https://www.youtube.com/watch?v=qEwKCR5JCog",
      videoId: "qEwKCR5JCog",
      channel: "ScottHermanFitness",
      muscle: "Anterior & Lateral Deltoids",
      secondary: "Triceps Brachii",
      equipment: "Upright Bench & Dumbbells",
      category: "shoulders",
      difficulty: "Beginner-Friendly",
      steps: [
        "Sit on bench with backrest vertical, dumbbells held at shoulder level with palms forward.",
        "Press dumbbells upward until arms are fully extended overhead.",
        "Lower dumbbells under control until elbows reach 90 degrees.",
        "Repeat with steady breathing tempo."
      ],
      tips: [
        "Keep lower back supported against the pad.",
        "Avoid clanging dumbbells together overhead."
      ]
    },
    "Push Press": {
      youtubeUrl: "https://www.youtube.com/watch?v=Y0Ffbb0Ey4c",
      videoId: "Y0Ffbb0Ey4c",
      channel: "Monroe Miller",
      muscle: "Deltoids & Kinetic Chain Power",
      secondary: "Triceps, Quads, Core",
      equipment: "Barbell",
      category: "shoulders",
      difficulty: "Advanced",
      steps: [
        "Rack barbell across front shoulders in standing position.",
        "Dip knees 2-3 inches with vertical torso.",
        "Drive upward aggressively through legs, transferring momentum into bar.",
        "Press bar through to full overhead lockout."
      ],
      tips: [
        "Do not turn this into a deep squat—it is a quick, crisp knee dip.",
        "Lock out overhead with bar directly over heels."
      ]
    },
    "Rear Delt Fly": {
      youtubeUrl: "https://www.youtube.com/watch?v=ttvfGg9d76c",
      videoId: "ttvfGg9d76c",
      channel: "ScottHermanFitness",
      muscle: "Posterior Deltoids (Rear Delts)",
      secondary: "Rhomboids, Middle Trapezius",
      equipment: "Dumbbells / Bench",
      category: "shoulders",
      difficulty: "Beginner-Friendly",
      steps: [
        "Hinge forward at hips until torso is roughly parallel to floor.",
        "Hold light dumbbells with arms hanging down and palms facing inward.",
        "Raise arms out wide to sides until elbows reach shoulder level.",
        "Squeeze rear shoulders, then lower weights with control."
      ],
      tips: [
        "Do not pinch shoulder blades excessively—focus on rear delt isolation.",
        "Use light weights to maintain strict form."
      ]
    },
    "Reverse Pec Deck": {
      youtubeUrl: "https://www.youtube.com/watch?v=KaKYF9i_EVI",
      videoId: "KaKYF9i_EVI",
      channel: "TylerPath",
      muscle: "Posterior Deltoids",
      secondary: "Rhomboids",
      equipment: "Pec Deck Machine",
      category: "shoulders",
      difficulty: "Beginner-Friendly",
      steps: [
        "Sit facing machine with chest flat against back pad.",
        "Grip handles with arms straight at shoulder height.",
        "Pull handles backward in a horizontal arc until arms are out to sides.",
        "Hold for 1 second, then return slowly to start."
      ],
      tips: [
        "Keep shoulders pressed down away from ears.",
        "Great for isolating rear deltoids safely."
      ]
    },
    "Shrugs": {
      youtubeUrl: "https://www.youtube.com/watch?v=cJRVVxmytaM",
      videoId: "cJRVVxmytaM",
      channel: "ScottHermanFitness",
      muscle: "Upper Trapezius",
      secondary: "Levator Scapulae, Forearms",
      equipment: "Dumbbells / Barbell",
      category: "shoulders",
      difficulty: "Beginner-Friendly",
      steps: [
        "Stand tall holding heavy weights at your sides with arms straight.",
        "Elevate shoulders straight up toward your ears in a shrugging motion.",
        "Hold the peak contraction at the top for 1 to 2 seconds.",
        "Lower shoulders smoothly back to full resting position."
      ],
      tips: [
        "Never roll shoulders in circles—move strictly straight up and down.",
        "Keep head and neck neutral; do not jut chin forward."
      ]
    },
    "Upright Row": {
      youtubeUrl: "https://www.youtube.com/watch?v=amCU-ziHITM",
      videoId: "amCU-ziHITM",
      channel: "ScottHermanFitness",
      muscle: "Lateral Deltoids & Upper Traps",
      secondary: "Biceps",
      equipment: "Barbell / Cable",
      category: "shoulders",
      difficulty: "Intermediate",
      steps: [
        "Stand holding barbell with overhand grip slightly narrower than shoulder-width.",
        "Pull bar vertically upward leading with elbows.",
        "Stop when elbows reach shoulder height.",
        "Lower under control over 2 seconds."
      ],
      tips: [
        "Do not pull too high past chest level to protect shoulder impingement.",
        "Lead with elbows high."
      ]
    },
    "Front Raise": {
      youtubeUrl: "https://www.youtube.com/watch?v=-t7fuZ0KhDA",
      videoId: "-t7fuZ0KhDA",
      channel: "ScottHermanFitness",
      muscle: "Anterior Deltoids (Front Delts)",
      secondary: "Upper Pectorals",
      equipment: "Dumbbells",
      category: "shoulders",
      difficulty: "Beginner-Friendly",
      steps: [
        "Stand tall holding dumbbells across front of thighs.",
        "With straight arms, raise dumbbells forward until eye level.",
        "Hold for a brief moment, then lower slowly back to thighs."
      ],
      tips: [
        "Do not lean back or rock hips.",
        "Keep core tight throughout."
      ]
    },
    "Band Pull-Apart": {
      youtubeUrl: "https://www.youtube.com/watch?v=P-_4Ek-KYMA",
      videoId: "P-_4Ek-KYMA",
      channel: "Fitness Magic 3D | by Iram",
      muscle: "Rear Deltoids & Rhomboids",
      secondary: "Rotator Cuff",
      equipment: "Resistance Band / Bodyweight",
      category: "shoulders",
      difficulty: "Beginner-Friendly",
      steps: [
        "Hold band at chest height with arms extended.",
        "Pull band apart by moving arms out wide until band touches chest.",
        "Squeeze shoulder blades together, then return with control."
      ],
      tips: [
        "Keep shoulders depressed down away from ears.",
        "Excellent warmup and postural exercise."
      ]
    },

    // ------------------------------------------------------------
    // ARMS (BICEPS & TRICEPS)
    // ------------------------------------------------------------
    "Bicep Curl": {
      youtubeUrl: "https://www.youtube.com/watch?v=ykJmrZ5v0Oo",
      videoId: "ykJmrZ5v0Oo",
      channel: "ScottHermanFitness",
      muscle: "Biceps Brachii (Short & Long Head)",
      secondary: "Brachialis, Forearm Flexors",
      equipment: "Dumbbells / Barbell",
      category: "biceps",
      difficulty: "Beginner-Friendly",
      steps: [
        "Stand tall holding weights at arms length, palms facing forward.",
        "Pin elbows against your ribcage to keep upper arms stationary.",
        "Curl weights upward toward shoulders, squeezing biceps hard at the peak.",
        "Lower slowly over 2-3 seconds back to full arm extension."
      ],
      tips: [
        "Do not swing hips or lean back to hoist the weight.",
        "Keep elbows in place—do not let them drift forward excessively."
      ]
    },
    "Hammer Curl": {
      youtubeUrl: "https://www.youtube.com/watch?v=TwD-YGVP4Bk",
      videoId: "TwD-YGVP4Bk",
      channel: "ScottHermanFitness",
      muscle: "Brachialis & Brachioradialis",
      secondary: "Biceps Brachii",
      equipment: "Dumbbells",
      category: "biceps",
      difficulty: "Beginner-Friendly",
      steps: [
        "Hold dumbbells with a neutral grip (palms facing each other) at sides.",
        "Keep upper arms stationary and curl weights upward.",
        "Squeeze forearms and outer biceps at top of movement.",
        "Lower weights under control back to full extension."
      ],
      tips: [
        "Great for building arm thickness and forearm grip strength.",
        "Keep elbows locked at sides."
      ]
    },
    "Preacher Curl": {
      youtubeUrl: "https://www.youtube.com/watch?v=fIWP-FRFNU0",
      videoId: "fIWP-FRFNU0",
      channel: "ScottHermanFitness",
      muscle: "Biceps Brachii (Short Head Focus)",
      secondary: "Forearms",
      equipment: "Preacher Bench & EZ-Bar / Dumbbells",
      category: "biceps",
      difficulty: "Intermediate",
      steps: [
        "Sit on preacher bench with armpits snug against top pad and triceps flat on incline.",
        "Hold bar with underhand grip at arms length.",
        "Curl weight upward toward face until forearms are nearly vertical.",
        "Lower under control stopping just before complete joint lockout to maintain tension."
      ],
      tips: [
        "Do not lift elbows off the pad.",
        "Avoid hyperextending elbows at the bottom of the movement."
      ]
    },
    "Concentration Curl": {
      youtubeUrl: "https://www.youtube.com/watch?v=Jvj2wV0vOYU",
      videoId: "Jvj2wV0vOYU",
      channel: "ScottHermanFitness",
      muscle: "Biceps Peak (Brachii Long Head)",
      secondary: "Forearm Flexors",
      equipment: "Bench & Dumbbell",
      category: "biceps",
      difficulty: "Beginner-Friendly",
      steps: [
        "Sit on bench with legs spread wide. Rest back of working elbow against inner thigh.",
        "Hang dumbbell down with palm facing inward.",
        "Curl weight upward while rotating wrist outward slightly (supination).",
        "Squeeze bicep peak for 1 second, then lower slowly."
      ],
      tips: [
        "Keep upper arm braced against thigh so torso cannot assist.",
        "Pure bicep isolation."
      ]
    },
    "Incline Dumbbell Curl": {
      youtubeUrl: "https://www.youtube.com/watch?v=soxrZlIl35U",
      videoId: "soxrZlIl35U",
      channel: "ScottHermanFitness",
      muscle: "Biceps Brachii (Long Head Stretch)",
      secondary: "Forearms",
      equipment: "Incline Bench & Dumbbells",
      category: "biceps",
      difficulty: "Intermediate",
      steps: [
        "Set bench to 45-60 degree incline. Lie back with dumbbells hanging straight down.",
        "Feel the deep stretch in biceps at bottom.",
        "Curl weights upward while keeping elbows back.",
        "Lower under control back to full stretch."
      ],
      tips: [
        "Keep upper arms perpendicular to floor.",
        "Do not swing shoulders forward."
      ]
    },
    "Cable Curl": {
      youtubeUrl: "https://www.youtube.com/watch?v=dyEZvuMZXsY",
      videoId: "dyEZvuMZXsY",
      channel: "TylerPath",
      muscle: "Biceps Brachii",
      secondary: "Brachialis",
      equipment: "Cable Machine & Straight / EZ Bar",
      category: "biceps",
      difficulty: "Beginner-Friendly",
      steps: [
        "Attach bar to low pulley. Stand tall with elbows pinned to sides.",
        "Curl bar upward to shoulders enjoying smooth continuous cable tension.",
        "Squeeze at top, then lower with control."
      ],
      tips: [
        "Continuous tension throughout the entire range of motion.",
        "Keep shoulders stationary."
      ]
    },
    "Triceps Pushdown": {
      youtubeUrl: "https://www.youtube.com/watch?v=2-LAMcpzODU",
      videoId: "2-LAMcpzODU",
      channel: "ScottHermanFitness",
      muscle: "Triceps Brachii (Lateral & Medial Head)",
      secondary: "Anconeus",
      equipment: "Cable Pulley & Straight / V-Bar",
      category: "triceps",
      difficulty: "Beginner-Friendly",
      steps: [
        "Face cable stack, grip bar with elbows bent at 90 degrees pinned to ribs.",
        "Hinge slightly forward at hips for balance.",
        "Push hands straight down until elbows are fully locked out.",
        "Hold peak contraction for 1 second, then return slowly to 90 degrees."
      ],
      tips: [
        "Keep upper arms glued to torso throughout the entire set.",
        "Do not let shoulders roll forward on the way up."
      ]
    },
    "Rope Pushdown": {
      youtubeUrl: "https://www.youtube.com/watch?v=DMPmiZWiwDc",
      videoId: "DMPmiZWiwDc",
      channel: "ScottHermanFitness",
      muscle: "Triceps Brachii (Lateral Head Focus)",
      secondary: "Anconeus",
      equipment: "Cable Pulley & Rope Attachment",
      category: "triceps",
      difficulty: "Beginner-Friendly",
      steps: [
        "Grip rope attachment with palms facing inward and elbows pinned to sides.",
        "Push down until arms are straight, then spread rope ends apart at the bottom.",
        "Squeeze triceps intensely at lockout, then return slowly."
      ],
      tips: [
        "Spreading rope ends at bottom maximizes peak contraction.",
        "Do not swing with upper body."
      ]
    },
    "Overhead Triceps Extension": {
      youtubeUrl: "https://www.youtube.com/watch?v=fYqswDVbJDg",
      videoId: "fYqswDVbJDg",
      channel: "ScottHermanFitness",
      muscle: "Triceps Brachii (Long Head)",
      secondary: "Anterior Deltoids, Core",
      equipment: "Dumbbell / Cable",
      category: "triceps",
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
    "Skull Crushers": {
      youtubeUrl: "https://www.youtube.com/watch?v=RavQHfFxbdA",
      videoId: "RavQHfFxbdA",
      channel: "ScottHermanFitness",
      muscle: "Triceps Brachii",
      secondary: "Forearms",
      equipment: "EZ-Curl Bar & Flat Bench",
      category: "triceps",
      difficulty: "Intermediate",
      steps: [
        "Lie on bench holding EZ-bar above chest with narrow overhand grip.",
        "Angle upper arms slightly back toward head to maintain tension.",
        "Bend elbows to lower bar smoothly to forehead / top of head.",
        "Extend elbows to press bar back up to start."
      ],
      tips: [
        "Keep elbows pointing to ceiling without flaring out wide.",
        "Use a secure grip."
      ]
    },
    "Bench Dip": {
      youtubeUrl: "https://www.youtube.com/watch?v=ikyoBJex0yE",
      videoId: "ikyoBJex0yE",
      channel: "Anshuman Pandit",
      muscle: "Triceps Brachii",
      secondary: "Anterior Delts",
      equipment: "Flat Bench / Chair",
      category: "triceps",
      difficulty: "Beginner-Friendly",
      steps: [
        "Sit on edge of bench, hands gripping edge next to hips.",
        "Slide hips forward off bench with knees bent or legs straight.",
        "Lower body by bending elbows straight back to 90 degrees.",
        "Press through palms to lockout arms."
      ],
      tips: [
        "Keep back close to bench as you descend.",
        "Do not shrug shoulders up."
      ]
    },
    "Floor Tricep Dips": {
      youtubeUrl: "https://www.youtube.com/watch?v=0326dy_-CzM",
      videoId: "0326dy_-CzM",
      channel: "Bowflex",
      muscle: "Triceps Brachii",
      secondary: "Shoulders, Upper Chest",
      equipment: "Bodyweight (No Equipment)",
      category: "triceps",
      difficulty: "Beginner-Friendly",
      steps: [
        "Sit on floor mat with knees bent and feet flat on floor.",
        "Place hands behind hips with fingers pointing forward toward feet.",
        "Elevate hips slightly and bend elbows straight back to lower body.",
        "Press through palms to straighten arms and contract triceps."
      ],
      tips: [
        "Direct your elbows straight behind you rather than flaring outward.",
        "Ensure shoulders stay down away from ears."
      ]
    },
    "Triceps Kickback": {
      youtubeUrl: "https://www.youtube.com/watch?v=lwPfnM9uwLQ",
      videoId: "lwPfnM9uwLQ",
      channel: "Ty Training",
      muscle: "Triceps Brachii (Peak Contraction)",
      secondary: "Rear Deltoid",
      equipment: "Dumbbell & Bench",
      category: "triceps",
      difficulty: "Beginner-Friendly",
      steps: [
        "Hinge forward with one knee on bench, upper arm parallel to floor.",
        "Extend elbow straight back until arm is fully straight.",
        "Hold peak squeeze for 1 second, then bend elbow back to 90 degrees."
      ],
      tips: [
        "Upper arm must stay stationary parallel to floor.",
        "Do not swing weight with shoulder."
      ]
    },

    // ------------------------------------------------------------
    // LEGS & GLUTES
    // ------------------------------------------------------------
    "Squat": {
      youtubeUrl: "https://www.youtube.com/watch?v=bEv6CCg2BC8",
      videoId: "bEv6CCg2BC8",
      channel: "Alan Thrall",
      muscle: "Quadriceps & Gluteus Maximus",
      secondary: "Hamstrings, Core, Calves",
      equipment: "Barbell & Squat Rack",
      category: "legs",
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
      youtubeUrl: "https://www.youtube.com/watch?v=aclHkVaku9U",
      videoId: "aclHkVaku9U",
      channel: "Reebok / CrossFit",
      muscle: "Quadriceps & Glutes",
      secondary: "Hamstrings, Core",
      equipment: "Bodyweight (No Equipment)",
      category: "legs",
      difficulty: "Beginner-Friendly",
      steps: [
        "Stand tall with feet shoulder-width apart, toes turned out slightly.",
        "Clasp hands at chest or extend arms forward for counter-balance.",
        "Sit hips back and down as if lowering into a chair until thighs are parallel to floor.",
        "Push through heels and mid-foot to stand back up, squeezing glutes at the top."
      ],
      tips: [
        "Keep weight balanced over whole foot, keeping heels glued to floor.",
        "Keep chest upright and spine neutral throughout."
      ]
    },
    "Front Squat": {
      youtubeUrl: "https://www.youtube.com/watch?v=uYumuL_G_V0",
      videoId: "uYumuL_G_V0",
      channel: "Alan Thrall",
      muscle: "Quadriceps Focus & Upper Back",
      secondary: "Glutes, Core",
      equipment: "Barbell & Rack",
      category: "legs",
      difficulty: "Advanced",
      steps: [
        "Rack barbell across front deltoids with high elbows in clean grip or cross-arm grip.",
        "Keep torso upright and descend into deep squat.",
        "Drive out of hole keeping elbows pointed high.",
        "Stand tall to full lockout."
      ],
      tips: [
        "High elbows keep bar from sliding forward off shoulders.",
        "Demands upright spinal posture."
      ]
    },
    "Goblet Squat": {
      youtubeUrl: "https://www.youtube.com/watch?v=MeIiIdhvXT4",
      videoId: "MeIiIdhvXT4",
      channel: "ScottHermanFitness",
      muscle: "Quadriceps, Glutes & Core",
      secondary: "Hamstrings, Upper Back",
      equipment: "Kettlebell / Dumbbell",
      category: "legs",
      difficulty: "Beginner-Friendly",
      steps: [
        "Hold kettlebell by horns or dumbbell vertically against chest.",
        "Squat down keeping chest proud until elbows touch inside of knees.",
        "Drive through whole foot to stand tall."
      ],
      tips: [
        "One of the best exercises for learning pristine squat mechanics.",
        "Keep weight pressed against sternum."
      ]
    },
    "Romanian Deadlift": {
      youtubeUrl: "https://www.youtube.com/watch?v=JCXUYuzwNrM",
      videoId: "JCXUYuzwNrM",
      channel: "ScottHermanFitness",
      muscle: "Hamstrings & Gluteus Maximus",
      secondary: "Erector Spinae, Core",
      equipment: "Barbell / Dumbbells",
      category: "legs",
      difficulty: "Intermediate",
      steps: [
        "Stand tall holding bar at hip level with shoulder-width stance and soft knees.",
        "Push hips straight back horizontally while bar glides down along thighs.",
        "Lower until you feel a deep, intense stretch in hamstrings (around mid-shin).",
        "Drive hips forward to stand tall, locking out glutes firmly at top."
      ],
      tips: [
        "This is a hip hinge, not a squat—knees bend only slightly and stay fixed.",
        "Keep bar close to legs at all times to prevent lumbar torque."
      ]
    },
    "Leg Press": {
      youtubeUrl: "https://www.youtube.com/watch?v=IZxyjW7MPJQ",
      videoId: "IZxyjW7MPJQ",
      channel: "ScottHermanFitness",
      muscle: "Quadriceps & Gluteus Maximus",
      secondary: "Hamstrings, Calves",
      equipment: "45-Degree Leg Press Machine",
      category: "legs",
      difficulty: "Beginner-Friendly",
      steps: [
        "Sit on sled with lower back and hips firmly pressed against backrest.",
        "Place feet shoulder-width in middle of platform.",
        "Unlock safety levers and lower weight sled until knees form 90 degrees.",
        "Press through whole foot to return to start without locking knees abruptly."
      ],
      tips: [
        "Never allow lower back or tailbone to lift off backrest.",
        "Do not hyperextend or violently snap knees at lockout."
      ]
    },
    "Bulgarian Split Squat": {
      youtubeUrl: "https://www.youtube.com/watch?v=2C-uNgKwPLE",
      videoId: "2C-uNgKwPLE",
      channel: "ScottHermanFitness",
      muscle: "Quadriceps, Glutes & Adductors",
      secondary: "Hamstrings, Balance Stabilizers",
      equipment: "Bench & Dumbbells / Bodyweight",
      category: "legs",
      difficulty: "Intermediate",
      steps: [
        "Stand 2-3 feet in front of bench. Place top of rear foot laces-down on bench.",
        "Lower body under control until front thigh is parallel to floor and rear knee hovers above mat.",
        "Keep front knee tracking over toes and torso slightly leaned forward.",
        "Drive through front heel to stand tall."
      ],
      tips: [
        "Keep majority of weight on front working leg.",
        "Outstanding unilateral builder for leg strength and hip symmetry."
      ]
    },
    "Walking Lunge": {
      youtubeUrl: "https://www.youtube.com/watch?v=L8fvypPrzzs",
      videoId: "L8fvypPrzzs",
      channel: "ScottHermanFitness",
      muscle: "Quadriceps & Glutes",
      secondary: "Hamstrings, Core Stabilizers",
      equipment: "Dumbbells / Bodyweight",
      category: "legs",
      difficulty: "Intermediate",
      steps: [
        "Take an exaggerated step forward, lowering hips until both knees form 90 degrees.",
        "Keep torso upright and back knee hovering 1 inch from floor.",
        "Push through front heel to step forward into next lunge stride with opposite leg."
      ],
      tips: [
        "Keep front knee tracking over middle toes.",
        "Maintain upright proud chest."
      ]
    },
    "Reverse Lunges": {
      youtubeUrl: "https://www.youtube.com/watch?v=sjlsISvHyZs",
      videoId: "sjlsISvHyZs",
      channel: "ScottHermanFitness",
      muscle: "Quadriceps, Glutes & Hamstrings",
      secondary: "Core Stabilizers",
      equipment: "Bodyweight (No Equipment)",
      category: "legs",
      difficulty: "Beginner-Friendly",
      steps: [
        "Stand tall with feet hip-width apart.",
        "Take a controlled step backward with one leg and lower hips until both knees bend to 90 degrees.",
        "Front knee stays stacked over front ankle, rear knee hovers 1 inch above floor.",
        "Drive through front heel to return smoothly to standing starting position."
      ],
      tips: [
        "Step straight back rather than angling across.",
        "Easier on knees than forward lunges."
      ]
    },
    "Sumo Squat": {
      youtubeUrl: "https://www.youtube.com/watch?v=9ZuXKqRbT9k",
      videoId: "9ZuXKqRbT9k",
      channel: "Bowflex",
      muscle: "Adductors (Inner Thighs) & Glutes",
      secondary: "Quadriceps, Hamstrings",
      equipment: "Bodyweight (No Equipment)",
      category: "legs",
      difficulty: "Beginner-Friendly",
      steps: [
        "Take a wide stance roughly 1.5 times shoulder-width with toes angled outward at 45 degrees.",
        "Keep chest proud, hinge hips slightly and lower body by pushing knees out over toes.",
        "Descend until thighs are parallel to ground.",
        "Drive through heels and squeeze inner thighs and glutes at the top."
      ],
      tips: [
        "Do not let knees cave inward toward each other.",
        "Keep torso upright."
      ]
    },
    "Glute Bridge": {
      youtubeUrl: "https://www.youtube.com/watch?v=wPM8icPu6H8",
      videoId: "wPM8icPu6H8",
      channel: "Bowflex",
      muscle: "Gluteus Maximus",
      secondary: "Hamstrings, Core, Lower Back",
      equipment: "Bodyweight (No Equipment)",
      category: "glutes",
      difficulty: "Beginner-Friendly",
      steps: [
        "Lie on back with knees bent at 90 degrees and feet flat on floor, hip-width apart.",
        "Arms rest by sides. Brace abdominals and drive through heels to elevate hips.",
        "Form a straight diagonal line from shoulders to knees.",
        "Squeeze glutes hard at the top for 2 full seconds, then lower under control."
      ],
      tips: [
        "Do not hyperextend lower back—motion comes purely from hip extension.",
        "Keep feet planted firmly without lifting toes."
      ]
    },
    "Glute Bridge Isometric Hold": {
      youtubeUrl: "https://www.youtube.com/watch?v=wPM8icPu6H8",
      videoId: "wPM8icPu6H8",
      channel: "Bowflex",
      muscle: "Gluteus Maximus",
      secondary: "Hamstrings, Core",
      equipment: "Bodyweight (No Equipment)",
      category: "glutes",
      difficulty: "Beginner-Friendly",
      steps: [
        "Elevate hips into peak glute bridge position.",
        "Tuck pelvis under slightly to engage lower abdominals.",
        "Maintain maximum glute tension continuously for the full prescribed duration."
      ],
      tips: [
        "Breathe steadily from diaphragm.",
        "Do not allow hips to sag downward over time."
      ]
    },
    "Hip Thrust": {
      youtubeUrl: "https://www.youtube.com/watch?v=SEdqd1n0cvg",
      videoId: "SEdqd1n0cvg",
      channel: "ScottHermanFitness",
      muscle: "Gluteus Maximus (Full Contraction)",
      secondary: "Hamstrings, Adductors",
      equipment: "Bench & Barbell / Dumbbell",
      category: "glutes",
      difficulty: "Intermediate",
      steps: [
        "Sit on floor with upper back against bench and barbell cushioned across hips.",
        "Plant feet flat hip-width apart.",
        "Drive through heels to extend hips fully until thighs and torso are parallel to floor.",
        "Squeeze glutes hard at top, keep chin tucked, and lower hips down."
      ],
      tips: [
        "Keep chin tucked to prevent lower back arching.",
        "Shins should be vertical at peak of thrust."
      ]
    },
    "Donkey Kicks": {
      youtubeUrl: "https://www.youtube.com/watch?v=SJ1Xuz9D-ZQ",
      videoId: "SJ1Xuz9D-ZQ",
      channel: "Bowflex",
      muscle: "Gluteus Maximus",
      secondary: "Hamstrings, Core",
      equipment: "Bodyweight (No Equipment)",
      category: "glutes",
      difficulty: "Beginner-Friendly",
      steps: [
        "Start on hands and knees with hands under shoulders and knees under hips.",
        "Keep right knee bent at 90 degrees and flex right foot.",
        "Drive right heel straight toward ceiling by squeezing glute.",
        "Hold for 1 second at top, then lower knee back toward floor without touching."
      ],
      tips: [
        "Keep hips level and square with floor—do not rotate pelvis open.",
        "Keep core tight so lower back does not arch."
      ]
    },
    "Leg Curl": {
      youtubeUrl: "https://www.youtube.com/watch?v=ELOCsoDSmrg",
      videoId: "ELOCsoDSmrg",
      channel: "ScottHermanFitness",
      muscle: "Hamstrings (Knee Flexion)",
      secondary: "Calves",
      equipment: "Leg Curl Machine",
      category: "legs",
      difficulty: "Beginner-Friendly",
      steps: [
        "Lie face down on machine with roller pad resting on back of calves.",
        "Curl heels upward toward glutes in a smooth sweeping arc.",
        "Squeeze hamstrings tightly at peak, then lower slowly."
      ],
      tips: [
        "Do not lift hips off pad during curl.",
        "Control negative lowering phase."
      ]
    },
    "Seated Leg Curl": {
      youtubeUrl: "https://www.youtube.com/watch?v=Orxowest56U",
      videoId: "Orxowest56U",
      channel: "ScottHermanFitness",
      muscle: "Hamstrings",
      secondary: "Calves",
      equipment: "Seated Leg Curl Machine",
      category: "legs",
      difficulty: "Beginner-Friendly",
      steps: [
        "Sit on machine with thigh pad secured down.",
        "Bend knees to curl weight back under seat.",
        "Squeeze hamstrings at full flexion, then return slowly."
      ],
      tips: [
        "Keep back flat against seat pad.",
        "Resist weight on the way up."
      ]
    },
    "Leg Extension": {
      youtubeUrl: "https://www.youtube.com/watch?v=YyvSfVjQeL0",
      videoId: "YyvSfVjQeL0",
      channel: "ScottHermanFitness",
      muscle: "Quadriceps (Rectus Femoris & Vastus)",
      secondary: "Patellar Tendon",
      equipment: "Leg Extension Machine",
      category: "legs",
      difficulty: "Beginner-Friendly",
      steps: [
        "Sit with back against pad, roller pad resting above ankles.",
        "Extend knees to lift weight up until legs are almost straight.",
        "Squeeze quads hard for 1 second, then lower slowly."
      ],
      tips: [
        "Do not violently kick the weight up.",
        "Maintain controlled tempo."
      ]
    },
    "Calf Raise": {
      youtubeUrl: "https://www.youtube.com/watch?v=ORT4oJ_R8Qs",
      videoId: "ORT4oJ_R8Qs",
      channel: "ScottHermanFitness",
      muscle: "Gastrocnemius & Soleus",
      secondary: "Tibialis Posterior",
      equipment: "Calf Raise Machine / Bodyweight",
      category: "legs",
      difficulty: "Beginner-Friendly",
      steps: [
        "Place balls of feet on elevated ledge with heels hanging off.",
        "Lower heels down into deep stretch.",
        "Drive up onto balls of feet as high as possible.",
        "Squeeze calves at peak, then lower slowly."
      ],
      tips: [
        "Pause at bottom stretch for 1 second to eliminate tendon bounce.",
        "Elevate as high as possible on big toes."
      ]
    },
    "Standing Calf Raises": {
      youtubeUrl: "https://www.youtube.com/watch?v=sNqa1ad2qIQ",
      videoId: "sNqa1ad2qIQ",
      channel: "Fitonomy - Get Fit at Home ",
      muscle: "Gastrocnemius (Calves)",
      secondary: "Soleus, Ankle Stabilizers",
      equipment: "Bodyweight (No Equipment)",
      category: "legs",
      difficulty: "Beginner-Friendly",
      steps: [
        "Stand tall with feet hip-width apart near wall or counter for balance.",
        "Press down into balls of feet to elevate heels as high as possible.",
        "Hold peak contraction at the top for 1 full second.",
        "Lower heels smoothly back to floor over 2 seconds."
      ],
      tips: [
        "Distribute weight evenly across all toes.",
        "Do not bounce quickly; control the tempo."
      ]
    },
    "Wall Sit Hold": {
      youtubeUrl: "https://www.youtube.com/watch?v=mDdLC-yKudY",
      videoId: "mDdLC-yKudY",
      channel: "YOGABODY",
      muscle: "Quadriceps & Glutes (Isometric)",
      secondary: "Calves, Core",
      equipment: "Flat Wall / Bodyweight",
      category: "legs",
      difficulty: "Beginner-Friendly",
      steps: [
        "Stand with back against flat wall and slide down until thighs are parallel to floor.",
        "Knees stacked directly above ankles at a 90-degree angle.",
        "Press entire back firmly into wall and breathe evenly for the duration."
      ],
      tips: [
        "Do not rest hands on knees or thighs.",
        "Keep thighs parallel to ground."
      ]
    },

    // ------------------------------------------------------------
    // CORE & ABS
    // ------------------------------------------------------------
    "Plank": {
      youtubeUrl: "https://www.youtube.com/watch?v=ASdvN_XEl_c",
      videoId: "ASdvN_XEl_c",
      channel: "Bowflex",
      muscle: "Transverse Abdominis & Rectus Abdominis",
      secondary: "Glutes, Shoulders, Lower Back",
      equipment: "Bodyweight (No Equipment)",
      category: "core",
      difficulty: "Beginner-Friendly",
      steps: [
        "Place forearms on floor with elbows directly under shoulders.",
        "Extend legs back on toes, creating a rigid straight line from crown of head to heels.",
        "Brace abs tightly as if taking a punch, squeeze glutes, and tuck pelvis slightly.",
        "Breathe rhythmically while maintaining continuous total-body tension."
      ],
      tips: [
        "Never allow lower back to sag toward the floor.",
        "Do not pike hips up into the air."
      ]
    },
    "Side Plank": {
      youtubeUrl: "https://www.youtube.com/watch?v=BFOyHDlY2UE",
      videoId: "BFOyHDlY2UE",
      channel: "PS Fit ",
      muscle: "Obliques & Quadratus Lumborum",
      secondary: "Shoulder Stabilizers, Glutes",
      equipment: "Bodyweight (No Equipment)",
      category: "core",
      difficulty: "Beginner-Friendly",
      steps: [
        "Lie on side with legs straight and feet stacked or staggered.",
        "Prop upper body on forearm with elbow directly below shoulder.",
        "Lift hips until body forms a straight diagonal line from head to feet.",
        "Hold position while breathing steadily, then switch sides."
      ],
      tips: [
        "Keep top hip rolled slightly forward, not backward.",
        "Keep neck in line with spine."
      ]
    },
    "Dead Bug": {
      youtubeUrl: "https://www.youtube.com/watch?v=g_BYB0R-4Ws",
      videoId: "g_BYB0R-4Ws",
      channel: "Bowflex",
      muscle: "Deep Transverse Abdominis & Pelvic Floor",
      secondary: "Hip Flexors, Obliques",
      equipment: "Bodyweight (No Equipment)",
      category: "core",
      difficulty: "Beginner-Friendly",
      steps: [
        "Lie on back with arms pointing to ceiling and knees bent at 90 degrees above hips.",
        "Flatten lower back into the floor so there is zero gap under lumbar spine.",
        "Slowly lower right arm back overhead while extending left leg forward toward floor.",
        "Return smoothly to center and repeat on opposite side."
      ],
      tips: [
        "The critical cue is keeping lower back glued to the floor throughout.",
        "Move slowly with precision rather than rushing."
      ]
    },
    "Bird Dog": {
      youtubeUrl: "https://www.youtube.com/watch?v=wiFNA3sqjCA",
      videoId: "wiFNA3sqjCA",
      channel: "Howcast",
      muscle: "Multifidus, Spinal Erectors, Deep Core",
      secondary: "Gluteus Maximus, Deltoids",
      equipment: "Bodyweight (No Equipment)",
      category: "core",
      difficulty: "Beginner-Friendly",
      steps: [
        "Start on all fours with hands directly under shoulders and knees under hips.",
        "Simultaneously reach right arm forward and left leg straight back.",
        "Form a straight line from fingertips to heel without tilting pelvis.",
        "Hold for 2 seconds at the peak, return under control, and switch sides."
      ],
      tips: [
        "Do not allow lower back to hyperextend or belly to drop.",
        "Imagine balancing a glass of water on your lower back."
      ]
    },
    "Plank Shoulder Taps": {
      youtubeUrl: "https://www.youtube.com/watch?v=pSHjTRCQxIw",
      videoId: "pSHjTRCQxIw",
      channel: "Bowflex",
      muscle: "Anti-Rotational Core & Obliques",
      secondary: "Shoulders, Glutes",
      equipment: "Bodyweight (No Equipment)",
      category: "core",
      difficulty: "Beginner-Friendly",
      steps: [
        "Assume high push-up plank position with feet slightly wider than hip-width for balance.",
        "Brace core firmly to keep hips completely level and locked.",
        "Lift right hand and tap left shoulder, then place hand back down.",
        "Repeat with left hand tapping right shoulder, minimizing any torso rocking."
      ],
      tips: [
        "Widen feet if hips are swaying from side to side.",
        "Move slowly with deliberate control."
      ]
    },
    "Russian Twist": {
      youtubeUrl: "https://www.youtube.com/watch?v=wkD8rjkodUI",
      videoId: "wkD8rjkodUI",
      channel: "Bowflex",
      muscle: "Obliques & Rectus Abdominis",
      secondary: "Hip Flexors",
      equipment: "Bodyweight / Light Weight",
      category: "core",
      difficulty: "Beginner-Friendly",
      steps: [
        "Sit on floor with knees bent, lean torso back to roughly 45 degrees.",
        "Clasp hands in front of chest (feet can rest on floor or hover).",
        "Rotate torso smoothly to right side touching hands to floor, then rotate to left side."
      ],
      tips: [
        "Rotate from ribs and mid-back, not just waving arms.",
        "Keep spine elongated and chest proud."
      ]
    },
    "Hanging Leg Raise": {
      youtubeUrl: "https://www.youtube.com/watch?v=hdng3Nm1x_E",
      videoId: "hdng3Nm1x_E",
      channel: "ScottHermanFitness",
      muscle: "Lower Rectus Abdominis",
      secondary: "Hip Flexors, Grip",
      equipment: "Pull-up Bar",
      category: "core",
      difficulty: "Advanced",
      steps: [
        "Hang from bar with overhand grip and legs straight.",
        "Tilt pelvis up and raise legs forward until parallel to floor (or knees to chest).",
        "Hold top contraction for a moment, then lower slowly without swinging."
      ],
      tips: [
        "Curl pelvis up toward ribs rather than merely lifting legs.",
        "Avoid swinging momentum."
      ]
    },
    "Ab Wheel Rollout": {
      youtubeUrl: "https://www.youtube.com/watch?v=rqiTPdK1c_I",
      videoId: "rqiTPdK1c_I",
      channel: "ScottHermanFitness",
      muscle: "Rectus & Transverse Abdominis (Anti-Extension)",
      secondary: "Lats, Shoulders",
      equipment: "Ab Roller Wheel",
      category: "core",
      difficulty: "Advanced",
      steps: [
        "Kneel on mat holding wheel handles directly under shoulders.",
        "Roll wheel forward, extending body into a straight line.",
        "Contract abs forcefully to pull wheel back to starting position."
      ],
      tips: [
        "Never allow lower back to sag.",
        "Tuck pelvis under slightly throughout."
      ]
    },

    // ------------------------------------------------------------
    // HOME WORKOUTS & LOW-IMPACT EXERCISES
    // ------------------------------------------------------------
    "Low-Impact Step Jacks": {
      youtubeUrl: "https://www.youtube.com/watch?v=FJ-seqGfwzA",
      videoId: "FJ-seqGfwzA",
      channel: "Coach Molly Fitness | Personal Training",
      muscle: "Full Body Cardio & Calves",
      secondary: "Shoulders, Outer Hips",
      equipment: "Bodyweight (No Equipment)",
      category: "cardio",
      difficulty: "Beginner-Friendly",
      steps: [
        "Stand tall with feet together and arms at sides.",
        "Step right foot out to the side while sweeping both arms overhead.",
        "Step right foot back to center while lowering arms.",
        "Immediately step left foot out to opposite side, alternating rhythmically."
      ],
      tips: [
        "Zero jumping required—exceptionally friendly on knees and joints.",
        "Keep movements brisk and breathe rhythmically."
      ]
    },
    "High Knee March in Place": {
      youtubeUrl: "https://www.youtube.com/watch?v=0X0Q8wKLEfo",
      videoId: "0X0Q8wKLEfo",
      channel: "QIM FITNESS",
      muscle: "Hip Flexors & Core",
      secondary: "Quadriceps, Calves",
      equipment: "Bodyweight (No Equipment)",
      category: "cardio",
      difficulty: "Beginner-Friendly",
      steps: [
        "Stand upright with chest tall and core engaged.",
        "Lift right knee up toward hip level while pumping left arm forward.",
        "Place foot down and immediately drive left knee up with right arm.",
        "Continue marching in a steady, energetic rhythm."
      ],
      tips: [
        "Focus on standing tall without leaning backward as knee rises.",
        "Pump arms to elevate heart rate comfortably."
      ]
    },
    "Skater Step Touches": {
      youtubeUrl: "https://www.youtube.com/watch?v=hy8BXCeu65s",
      videoId: "hy8BXCeu65s",
      channel: "Viktor Thorup",
      muscle: "Gluteus Medius & Outer Hips",
      secondary: "Quadriceps, Core",
      equipment: "Bodyweight (No Equipment)",
      category: "cardio",
      difficulty: "Beginner-Friendly",
      steps: [
        "Step laterally to the right, bending right knee slightly.",
        "Sweep left leg behind right leg, tapping left toe lightly on floor.",
        "Push off right foot to step wide to the left, tapping right toe behind.",
        "Swing arms naturally in coordination with your strides."
      ],
      tips: [
        "Keep movements low-impact and smooth.",
        "Keep hips back and chest upright."
      ]
    },
    "Standing Oblique Crunches": {
      youtubeUrl: "https://www.youtube.com/watch?v=iEDwsKopMzc",
      videoId: "iEDwsKopMzc",
      channel: "Anastasia Arnold Fitness",
      muscle: "Obliques & Core",
      secondary: "Hip Abductors",
      equipment: "Bodyweight (No Equipment)",
      category: "core",
      difficulty: "Beginner-Friendly",
      steps: [
        "Stand tall with feet shoulder-width apart, fingertips lightly behind head.",
        "Shift weight to left leg and raise right knee up and out to side.",
        "Simultaneously crunch right elbow down toward right knee.",
        "Squeeze waistline at the top, then lower foot and repeat."
      ],
      tips: [
        "Do not pull on your neck with your hands.",
        "Focus on shortening the distance between ribs and hip."
      ]
    },
    "Butt Kick Steps": {
      youtubeUrl: "https://www.youtube.com/watch?v=oMW59TKZvaI",
      videoId: "oMW59TKZvaI",
      channel: "Get Healthy U - with Chris Freytag",
      muscle: "Hamstrings & Quads Stretch",
      secondary: "Calves, Balance",
      equipment: "Bodyweight (No Equipment)",
      category: "cardio",
      difficulty: "Beginner-Friendly",
      steps: [
        "Stand tall with feet hip-width apart.",
        "Step in place, bending knee to bring right heel up toward right glute.",
        "Lower right foot and bring left heel up toward left glute.",
        "Maintain a steady, rhythmic pace with gentle arm pumps."
      ],
      tips: [
        "Feel a gentle stretch in the front of your thighs.",
        "Keep torso upright."
      ]
    },
    "Single-Leg Balance Hold": {
      youtubeUrl: "https://www.youtube.com/watch?v=vj5G3TX0xJI",
      videoId: "vj5G3TX0xJI",
      channel: "Explore Movement ",
      muscle: "Ankle Stabilizers & Core",
      secondary: "Gluteus Medius, Calves",
      equipment: "Bodyweight (Near Wall / Chair)",
      category: "mobility",
      difficulty: "Beginner-Friendly",
      steps: [
        "Stand tall with feet together near a wall or sturdy chair for safety.",
        "Fix your gaze on a stationary point at eye level.",
        "Slowly lift one foot 2-3 inches off floor, balancing entirely on standing leg.",
        "Hold for prescribed duration, breathing calmly, then switch sides."
      ],
      tips: [
        "Keep standing knee soft, not rigidly hyperextended.",
        "Rest fingertips lightly on wall if you feel unsteady."
      ]
    },
    "Prone Cobra Back Extension": {
      youtubeUrl: "https://www.youtube.com/watch?v=hgjCwjO2YUY",
      videoId: "hgjCwjO2YUY",
      channel: "Commit To Life Fitness",
      muscle: "Rhomboids, Lower Traps, Spinal Erectors",
      secondary: "Glutes, Rear Delts",
      equipment: "Floor Mat / Bodyweight",
      category: "back",
      difficulty: "Beginner-Friendly",
      steps: [
        "Lie face down on floor with legs straight and arms at sides, palms facing floor.",
        "Contract glutes and rotate hands so thumbs point toward ceiling.",
        "Gently lift chest, arms, and head 2-3 inches off floor, pinching shoulder blades.",
        "Hold the peak contraction for 2-3 seconds, then lower smoothly."
      ],
      tips: [
        "Keep gaze directed toward floor to maintain a neutral cervical spine.",
        "Do not aggressively crane neck backward."
      ]
    },
    "Cat-Cow Spine Mobility": {
      youtubeUrl: "https://www.youtube.com/watch?v=RABQ3n82bYw",
      videoId: "RABQ3n82bYw",
      channel: "Physio with Saikat Paul",
      muscle: "Spinal Extensors & Abdominals",
      secondary: "Neck, Pelvis",
      equipment: "Floor Mat / Bodyweight",
      category: "mobility",
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
    },

    // ------------------------------------------------------------
    // CARDIO & FULL BODY
    // ------------------------------------------------------------
    "Kettlebell Swing": {
      youtubeUrl: "https://www.youtube.com/watch?v=sSESeQAir2M",
      videoId: "sSESeQAir2M",
      channel: "Bodybuilding.com",
      muscle: "Glutes, Hamstrings & Posterior Chain",
      secondary: "Core, Shoulders, Forearms",
      equipment: "Kettlebell",
      category: "cardio",
      difficulty: "Intermediate",
      steps: [
        "Stand with feet shoulder-width apart, kettlebell 1 foot in front.",
        "Hinge at hips, grip handle with both hands, hike bell back between thighs.",
        "Snap hips forward explosively, driving kettlebell up to chest height.",
        "Let bell float, then guide it back down into hip hinge."
      ],
      tips: [
        "Power comes from hips snapping forward, not arms lifting.",
        "Keep spine straight and neutral throughout."
      ]
    },
    "Mountain Climbers": {
      youtubeUrl: "https://www.youtube.com/watch?v=nmwgirgXLYM",
      videoId: "nmwgirgXLYM",
      channel: "Howcast",
      muscle: "Core & Cardiovascular Conditioning",
      secondary: "Shoulders, Quads, Hip Flexors",
      equipment: "Bodyweight (No Equipment)",
      category: "cardio",
      difficulty: "Beginner-Friendly",
      steps: [
        "Assume high push-up plank with hands under shoulders and body straight.",
        "Drive right knee up toward chest without raising hips.",
        "Quickly return right foot and drive left knee up.",
        "Alternate knees in a rapid, continuous running rhythm."
      ],
      tips: [
        "Keep shoulders over wrists.",
        "Do not allow hips to bounce high into the air."
      ]
    },
    "Burpees": {
      youtubeUrl: "https://www.youtube.com/watch?v=dZgVxmf6jkA",
      videoId: "dZgVxmf6jkA",
      channel: "CrossFit",
      muscle: "Full Body & Cardiovascular Endurance",
      secondary: "Chest, Quads, Core",
      equipment: "Bodyweight (No Equipment)",
      category: "cardio",
      difficulty: "Intermediate",
      steps: [
        "Stand tall, drop into a squat, and place hands on floor.",
        "Jump feet back into push-up plank, lower chest to floor.",
        "Press up, jump feet back under hips, and jump vertically into air with arms overhead."
      ],
      tips: [
        "Land softly on balls of feet.",
        "Pace your breathing rhythm."
      ]
    },
    "Jump Rope": {
      youtubeUrl: "https://www.youtube.com/watch?v=u3zgHI8QnqE",
      videoId: "u3zgHI8QnqE",
      channel: "Jump Rope Dudes",
      muscle: "Calves, Cardiovascular Stamina & Coordination",
      secondary: "Forearms, Shoulders",
      equipment: "Jump Rope",
      category: "cardio",
      difficulty: "Beginner-Friendly",
      steps: [
        "Hold rope handles at hip height with elbows tucked close to sides.",
        "Rotate wrists to turn rope, jumping 1-2 inches off floor as rope passes under.",
        "Land softly on the balls of your feet with soft knees."
      ],
      tips: [
        "Turn rope with wrists, not whole arms.",
        "Keep jumps low and compact."
      ]
    },
    "Battle Ropes": {
      youtubeUrl: "https://www.youtube.com/watch?v=WJ5krF7WLiA",
      videoId: "WJ5krF7WLiA",
      channel: "Sohel Fitness Zone",
      muscle: "Shoulders, Arms & Conditioning",
      secondary: "Core, Upper Back",
      equipment: "Battle Ropes",
      category: "cardio",
      difficulty: "Intermediate",
      steps: [
        "Stand in quarter squat holding rope ends with neutral grip.",
        "Create alternating waves by rapidly whipping arms up and down.",
        "Maintain high cadence and braced core for prescribed time."
      ],
      tips: [
        "Keep athletic knee bend.",
        "Breathe through the burn."
      ]
    },
    "Box Jump": {
      youtubeUrl: "https://www.youtube.com/watch?v=52r_Ul5k03g",
      videoId: "52r_Ul5k03g",
      channel: "CrossFit",
      muscle: "Explosive Leg Power & Quads",
      secondary: "Glutes, Calves",
      equipment: "Plyo Box",
      category: "cardio",
      difficulty: "Intermediate",
      steps: [
        "Stand 1 foot away from plyo box.",
        "Swing arms back and hinge hips into quarter squat.",
        "Explode upward onto box landing softly in squat position.",
        "Step down safely one foot at a time."
      ],
      tips: [
        "Land softly with knees absorbing impact.",
        "Step down rather than jumping down to preserve Achilles tendon."
      ]
    },
    "Farmer's Carry": {
      youtubeUrl: "https://www.youtube.com/watch?v=Tgi5SNDbBZQ",
      videoId: "Tgi5SNDbBZQ",
      channel: "ScottHermanFitness",
      muscle: "Forearms, Grip, Traps & Core",
      secondary: "Glutes, Legs",
      equipment: "Heavy Dumbbells / Kettlebells",
      category: "full_body",
      difficulty: "Beginner-Friendly",
      steps: [
        "Deadlift two heavy weights off floor.",
        "Stand tall with shoulders back and ribs down.",
        "Walk forward with short, deliberate, controlled strides.",
        "Lower weights safely when distance is completed."
      ],
      tips: [
        "Do not let weights sway against legs.",
        "Keep posture completely upright."
      ]
    },
    "Turkish Get-Up": {
      youtubeUrl: "https://www.youtube.com/watch?v=0bWRPC49-KI",
      videoId: "0bWRPC49-KI",
      channel: "StrongFirst",
      muscle: "Shoulder Stability, Core & Full Body Coordination",
      secondary: "Hips, Glutes",
      equipment: "Kettlebell / Dumbbell",
      category: "full_body",
      difficulty: "Advanced",
      steps: [
        "Lie on back pressing kettlebell locked overhead.",
        "Roll onto elbow, then hand, sweep leg through to half-kneeling.",
        "Stand tall while keeping kettlebell locked straight overhead.",
        "Reverse movement with control back to floor."
      ],
      tips: [
        "Keep eyes glued to the kettlebell overhead at all times.",
        "Move through each transition deliberately."
      ]
    },
    "Thruster": {
      youtubeUrl: "https://www.youtube.com/watch?v=L219ltL15zk",
      videoId: "L219ltL15zk",
      channel: "CrossFit",
      muscle: "Quads, Glutes & Shoulders",
      secondary: "Triceps, Core",
      equipment: "Barbell / Dumbbells",
      category: "full_body",
      difficulty: "Advanced",
      steps: [
        "Hold barbell at front rack position, squat below parallel.",
        "Drive out of squat and use hip momentum to press bar overhead in one fluid motion.",
        "Lock out overhead, then lower bar back to shoulders as you enter next squat."
      ],
      tips: [
        "Combine squat and press into a single continuous kinetic chain.",
        "Exhale forcefully on the drive."
      ]
    },

// ------------------------------------------------------------
    // ADDITIONAL EXPANDED EXERCISES & HOME WORKOUTS
    // ------------------------------------------------------------
    "21s Bicep Curl": {
      youtubeUrl: "https://www.youtube.com/watch?v=YCtC_vkPbdw",
      videoId: "YCtC_vkPbdw",
      channel: "TylerPath",
      muscle: "Biceps Brachii (Total Fatigue)",
      secondary: "Forearms",
      equipment: "Barbell / EZ-Curl Bar",
      category: "biceps",
      steps: [
        "Perform 7 reps from bottom to midpoint (90 degrees).",
        "Immediately perform 7 reps from midpoint to top contraction.",
        "Finish with 7 full-range repetitions without pausing."
      ],
      tips: ["Keep elbows pinned to sides.", "Do not swing with lower back."]
    },
    "Assault Bike": {
      youtubeUrl: "https://www.youtube.com/watch?v=PMRUrTVrCbM",
      videoId: "PMRUrTVrCbM",
      channel: "The Hunger Command Protocol ",
      muscle: "Cardiovascular System, Quads & Upper Body",
      secondary: "Calves, Core",
      equipment: "Air Bike",
      category: "cardio",
      steps: [
        "Adjust seat so knees have a slight bend at bottom of pedal stroke.",
        "Push and pull handles with arms while pedaling forcefully.",
        "Maintain steady pacing or explosive intervals."
      ],
      tips: ["Keep shoulders relaxed.", "Breathe with rhythm."]
    },
    "Assisted Pull-up": {
      youtubeUrl: "https://www.youtube.com/watch?v=CdO5BvP6Ti8",
      videoId: "CdO5BvP6Ti8",
      channel: "Aakash Wadhwani",
      muscle: "Latissimus Dorsi",
      secondary: "Biceps, Upper Back",
      equipment: "Assisted Machine / Resistance Band",
      category: "back",
      steps: [
        "Rest knees or feet on assistance pad or band.",
        "Grip handles with overhand grip and pull body up until chin clears bar.",
        "Lower smoothly to full extension."
      ],
      tips: ["Progressively reduce assistance over weeks.", "Engage lats before bending elbows."]
    },
    "Barbell Shrug": {
      youtubeUrl: "https://www.youtube.com/watch?v=jTVbilkxSAk",
      videoId: "jTVbilkxSAk",
      channel: "ScottHermanFitness",
      muscle: "Upper Trapezius",
      secondary: "Forearms, Grip",
      equipment: "Barbell",
      category: "shoulders",
      steps: [
        "Hold barbell with shoulder-width overhand grip.",
        "Elevate shoulders straight toward ears.",
        "Pause for 1-2 seconds at peak squeeze, then lower slowly."
      ],
      tips: ["Do not roll shoulders in circles.", "Keep chin neutral."]
    },
    "Battle Rope Slam": {
      youtubeUrl: "https://www.youtube.com/watch?v=a-zTK6okBtY",
      videoId: "a-zTK6okBtY",
      channel: "DarrylEubanks-Still Life Fitness",
      muscle: "Lats, Core & Cardiovascular Power",
      secondary: "Shoulders, Quads",
      equipment: "Battle Ropes",
      category: "cardio",
      steps: [
        "Lift both rope ends overhead with high hips.",
        "Slam ropes forcefully into floor, dropping into quarter squat.",
        "Repeat with explosive cadence."
      ],
      tips: ["Use entire core and hips to drive slam.", "Brace abdominals on impact."]
    },
    "Bear Crawl": {
      youtubeUrl: "https://www.youtube.com/watch?v=WMXbyYpZ9oY",
      videoId: "WMXbyYpZ9oY",
      channel: "ScottHermanFitness",
      muscle: "Deep Core Stabilizers & Shoulders",
      secondary: "Quads, Hip Flexors",
      equipment: "Bodyweight (No Equipment)",
      category: "core",
      steps: [
        "Start on all fours with knees hovering 1-2 inches above floor.",
        "Crawl forward moving opposite hand and foot in unison.",
        "Keep back flat and hips down."
      ],
      tips: ["Do not allow hips to rise up into bear pike.", "Keep steps short and controlled."]
    },
    "Behind-the-Neck Press": {
      youtubeUrl: "https://www.youtube.com/watch?v=x_LEzYJFQg4",
      videoId: "x_LEzYJFQg4",
      channel: "Fit Blueprint",
      muscle: "Lateral & Posterior Deltoids",
      secondary: "Triceps, Trapezius",
      equipment: "Barbell & Bench",
      category: "shoulders",
      steps: [
        "Sit on upright bench with bar across upper traps.",
        "Press bar vertically overhead to full lockout.",
        "Lower under control stopping at upper ear level."
      ],
      tips: ["Requires good shoulder mobility.", "Do not lower bar too deep behind neck."]
    },
    "Belt Squat": {
      youtubeUrl: "https://www.youtube.com/watch?v=DeI5yPMbgAA",
      videoId: "DeI5yPMbgAA",
      channel: "Squat University",
      muscle: "Quadriceps & Gluteus Maximus",
      secondary: "Adductors, Hamstrings",
      equipment: "Belt Squat Machine",
      category: "legs",
      steps: [
        "Attach weight belt around hips.",
        "Stand tall on platform with feet shoulder-width.",
        "Squat to parallel depth with zero axial spinal compression.",
        "Drive through heels to stand tall."
      ],
      tips: ["Allows pure quad hypertrophy with zero lower back strain.", "Keep knees tracking over toes."]
    },
    "Box Squat": {
      youtubeUrl: "https://www.youtube.com/watch?v=DuE_ScvXwtg",
      videoId: "DuE_ScvXwtg",
      channel: "ScottHermanFitness",
      muscle: "Glutes, Hamstrings & Quads",
      secondary: "Core",
      equipment: "Barbell & Plyo Box",
      category: "legs",
      steps: [
        "Sit hips back onto box with control.",
        "Pause briefly on box maintaining spinal tightness.",
        "Drive through heels explosively off box to standing."
      ],
      tips: ["Do not rock or bounce off box.", "Keep shins nearly vertical."]
    },
    "Broad Jump": {
      youtubeUrl: "https://www.youtube.com/watch?v=nPEmAWI03aI",
      videoId: "nPEmAWI03aI",
      channel: "HansenAthletics",
      muscle: "Explosive Posterior Chain & Quads",
      secondary: "Calves, Core",
      equipment: "Bodyweight (No Equipment)",
      category: "cardio",
      steps: [
        "Swing arms back, hinge hips into quarter squat.",
        "Explode forward horizontally through air.",
        "Land softly in squat absorbing impact smoothly."
      ],
      tips: ["Stick the landing with balanced feet.", "Reset before next repetition."]
    },
    "Cable Crunch": {
      youtubeUrl: "https://www.youtube.com/watch?v=x10ihjIYy8s",
      videoId: "x10ihjIYy8s",
      channel: "ScottHermanFitness",
      muscle: "Rectus Abdominis (Six-Pack)",
      secondary: "Obliques",
      equipment: "High Cable Pulley & Rope",
      category: "core",
      steps: [
        "Kneel facing or away from high cable pulley holding rope at temples.",
        "Flex spine to draw elbows toward thighs using pure ab contraction.",
        "Hold squeeze for 1 second, then return slowly to vertical."
      ],
      tips: ["Curl spine down like a ball; do not sit back onto heels.", "Exhale all air on the crunch."]
    },
    "Cable Face Pull": {
      youtubeUrl: "https://www.youtube.com/watch?v=rep-qVOkqgk",
      videoId: "rep-qVOkqgk",
      channel: "Omar Isuf",
      muscle: "Rear Deltoids & External Rotators",
      secondary: "Upper Traps, Rhomboids",
      equipment: "Cable & Rope Attachment",
      category: "shoulders",
      steps: [
        "Set pulley at nose height.",
        "Pull rope toward face separating hands.",
        "Rotate hands back so thumbs point behind you.",
        "Squeeze rear shoulders, then extend arms forward."
      ],
      tips: ["Crucial exercise for shoulder health.", "Keep chest up and elbows high."]
    },
    "Cable Kickback": {
      youtubeUrl: "https://www.youtube.com/watch?v=sD1_HD7Gzc8",
      videoId: "sD1_HD7Gzc8",
      channel: "ps_ladymaverick",
      muscle: "Gluteus Maximus",
      secondary: "Hamstrings",
      equipment: "Cable Machine & Ankle Strap",
      category: "glutes",
      steps: [
        "Attach ankle cuff to low pulley, face stack with hands on support.",
        "Kick leg straight back squeezing glute at peak.",
        "Lower leg under control without letting weight stack touch."
      ],
      tips: ["Do not arch lower back to kick higher.", "Keep hips square."]
    },
    "Cable Shrug": {
      youtubeUrl: "https://www.youtube.com/watch?v=JxaV9n9l2Y8",
      videoId: "JxaV9n9l2Y8",
      channel: "Bradley Bowden",
      muscle: "Upper Trapezius",
      secondary: "Forearms",
      equipment: "Low Cable Stack & Bar",
      category: "shoulders",
      steps: [
        "Stand tall gripping low cable bar.",
        "Shrug shoulders straight up toward ears.",
        "Pause for 1-2 seconds, then lower with control."
      ],
      tips: ["Continuous cable tension builds thick traps.", "Never roll shoulders."]
    },
    "Cable Woodchopper": {
      youtubeUrl: "https://www.youtube.com/watch?v=YIU0U_B57rU",
      videoId: "YIU0U_B57rU",
      channel: "adrianleungfit",
      muscle: "Obliques & Rotational Core",
      secondary: "Shoulders, Hips",
      equipment: "Cable Machine & Single Handle",
      category: "core",
      steps: [
        "Set pulley high, stand sideways gripping handle with both hands.",
        "Rotate torso diagonally downward across body toward opposite knee.",
        "Pivot back foot and engage core.",
        "Return smoothly to starting position."
      ],
      tips: ["Rotate through torso, not just pulling with arms.", "Keep core braced."]
    },
    "Cable Y-Raise": {
      youtubeUrl: "https://www.youtube.com/watch?v=Zy0M8JMLnD0",
      videoId: "Zy0M8JMLnD0",
      channel: "Bradley Bowden",
      muscle: "Lateral Deltoids & Lower Traps",
      secondary: "Rear Deltoids",
      equipment: "Dual Low Cables",
      category: "shoulders",
      steps: [
        "Grip opposite cables with arms crossed at thighs.",
        "Raise arms diagonally upward into a 'Y' shape overhead.",
        "Squeeze side delts at top, then lower under control."
      ],
      tips: ["Follows natural fiber orientation of lateral delts.", "Use light weight with high control."]
    },
    "Chest-Supported Rear Delt Fly": {
      youtubeUrl: "https://www.youtube.com/watch?v=ttvfGg9d76c",
      videoId: "ttvfGg9d76c",
      channel: "ScottHermanFitness",
      muscle: "Rear Deltoids",
      secondary: "Rhomboids",
      equipment: "Incline Bench & Dumbbells",
      category: "shoulders",
      steps: [
        "Lie face down on incline bench holding light dumbbells.",
        "Raise arms out wide in sweeping arc to shoulder height.",
        "Squeeze rear shoulders, then lower slowly."
      ],
      tips: ["Keep palms facing down.", "Do not shrug with traps."]
    },
    "Close-Grip Bench Press": {
      youtubeUrl: "https://www.youtube.com/watch?v=nEF0bv2FW94",
      videoId: "nEF0bv2FW94",
      channel: "ScottHermanFitness",
      muscle: "Triceps Brachii (All Three Heads)",
      secondary: "Inner Pectorals, Front Delts",
      equipment: "Barbell & Flat Bench",
      category: "triceps",
      steps: [
        "Grip bar with hands shoulder-width apart (do not go narrower than 12 inches).",
        "Lower bar to lower sternum with elbows tucked tightly against sides.",
        "Press powerfully back to lockout using triceps."
      ],
      tips: ["Keep elbows tucked against ribcage.", "Going too narrow strains wrists."]
    },
    "Curtsy Lunge": {
      youtubeUrl: "https://www.youtube.com/watch?v=WAW-2ehQ1GM",
      videoId: "WAW-2ehQ1GM",
      channel: "Katja Believe",
      muscle: "Gluteus Medius & Quads",
      secondary: "Adductors, Core",
      equipment: "Bodyweight (No Equipment)",
      category: "glutes",
      steps: [
        "Step right foot back and diagonally behind left leg.",
        "Bend both knees lowering hips until front thigh is parallel to floor.",
        "Drive through front heel to return to standing, then switch sides."
      ],
      tips: ["Keep hips as square to the front as possible.", "Great for outer glute contour."]
    },
    "Decline Sit-up": {
      youtubeUrl: "https://www.youtube.com/watch?v=QhGU5cmNZds",
      videoId: "QhGU5cmNZds",
      channel: "ScottHermanFitness",
      muscle: "Rectus Abdominis",
      secondary: "Hip Flexors",
      equipment: "Decline Bench",
      category: "core",
      steps: [
        "Secure ankles under decline bench rollers.",
        "Cross arms over chest or fingertips at ears.",
        "Curl spine upward toward knees using abdominal contraction.",
        "Lower under control over 2 seconds."
      ],
      tips: ["Curl spine instead of pivoting purely at hips.", "Keep chin off chest."]
    },
    "Devil Press": {
      youtubeUrl: "https://www.youtube.com/watch?v=G8X0caSapoY",
      videoId: "G8X0caSapoY",
      channel: "MISHEL AVISHKA ",
      muscle: "Full Body Power, Shoulders & Conditioning",
      secondary: "Chest, Glutes, Hamstrings",
      equipment: "Pair of Dumbbells",
      category: "cardio",
      steps: [
        "Burpee down to floor gripping two dumbbells.",
        "Jump feet forward between dumbbells.",
        "Snatch/swing dumbbells directly overhead in one fluid explosive pull."
      ],
      tips: ["Hinge at hips to generate overhead momentum.", "Pace yourself on longer sets."]
    },
    "Donkey Calf Raise": {
      youtubeUrl: "https://www.youtube.com/watch?v=DHu3sPCCCGM",
      videoId: "DHu3sPCCCGM",
      channel: "Micah LaCerte",
      muscle: "Gastrocnemius (Calves Deep Stretch)",
      secondary: "Soleus",
      equipment: "Donkey Calf Machine / Ledge",
      category: "legs",
      steps: [
        "Hinge forward at 90 degrees with hips under machine pad.",
        "Lower heels into deep calf stretch.",
        "Drive high onto balls of feet, squeezing calves at top."
      ],
      tips: ["Hamstring stretch amplifies calf activation.", "Pause at bottom to prevent bounce."]
    },
    "Drag Curl": {
      youtubeUrl: "https://www.youtube.com/watch?v=LMdNTHH6G8I",
      videoId: "LMdNTHH6G8I",
      channel: "ScottHermanFitness",
      muscle: "Biceps Brachii (Short Head & Peak)",
      secondary: "Forearms",
      equipment: "Barbell",
      category: "biceps",
      steps: [
        "Hold barbell with underhand grip against thighs.",
        "Pull elbows back while dragging bar straight up against torso to chest.",
        "Squeeze biceps hard, then drag bar back down along shirt."
      ],
      tips: ["Elbows travel backward, not forward.", "Eliminates front delt assistance."]
    },
    "EZ-Bar Skull Crusher": {
      youtubeUrl: "https://www.youtube.com/watch?v=d_KZxkY_0cM",
      videoId: "d_KZxkY_0cM",
      channel: "ScottHermanFitness",
      muscle: "Triceps Brachii",
      secondary: "Forearms",
      equipment: "EZ-Bar & Flat Bench",
      category: "triceps",
      steps: [
        "Lie on bench holding EZ-bar above chest.",
        "Angle upper arms back 10 degrees.",
        "Lower bar to forehead by bending elbows.",
        "Extend arms back to start."
      ],
      tips: ["EZ bar relieves wrist strain.", "Keep elbows pointing at ceiling."]
    },
    "Frog Pump": {
      youtubeUrl: "https://www.youtube.com/watch?v=5b4TonBLVgM",
      videoId: "5b4TonBLVgM",
      channel: "Colossus Fitness",
      muscle: "Gluteus Maximus",
      secondary: "Adductors",
      equipment: "Bodyweight (No Equipment)",
      category: "glutes",
      steps: [
        "Lie on back with soles of feet pressed together (butterfly position).",
        "Drive outer edges of feet into floor and thrust hips upward.",
        "Squeeze glutes hard at top, then lower."
      ],
      tips: ["Keep chin tucked.", "High-rep glute burnout exercise."]
    },
    "Glute-Ham Raise": {
      youtubeUrl: "https://www.youtube.com/watch?v=blX1If7ScxY",
      videoId: "blX1If7ScxY",
      channel: "TylerPath",
      muscle: "Hamstrings & Gluteus Maximus",
      secondary: "Calves, Lower Back",
      equipment: "GHD Machine",
      category: "legs",
      steps: [
        "Secure feet in GHD machine with knees on curved pad.",
        "Lower torso forward under control until horizontal.",
        "Flex hamstrings and calves to pull torso back upright."
      ],
      tips: ["Unrivaled hamstring hypertrophy builder.", "Keep hips extended throughout."]
    },
    "Good Morning": {
      youtubeUrl: "https://www.youtube.com/watch?v=5Xj6XUa77qc",
      videoId: "5Xj6XUa77qc",
      channel: "ScottHermanFitness",
      muscle: "Hamstrings, Glutes & Erector Spinae",
      secondary: "Core",
      equipment: "Barbell across Traps",
      category: "legs",
      steps: [
        "Stand tall with barbell on upper back.",
        "Push hips straight back while hinging torso forward to roughly 45 degrees.",
        "Feel deep stretch in hamstrings, then drive hips forward to stand."
      ],
      tips: ["Keep knees slightly soft but fixed.", "Never allow spine to round."]
    },
    "Hack Squat": {
      youtubeUrl: "https://www.youtube.com/watch?v=0tn5K9NlCfo",
      videoId: "0tn5K9NlCfo",
      channel: "ScottHermanFitness",
      muscle: "Quadriceps (Maximum Load)",
      secondary: "Glutes",
      equipment: "Hack Squat Machine",
      category: "legs",
      steps: [
        "Position shoulders under pads and back firmly against backrest.",
        "Lower sled smoothly until knees bend to 90 degrees.",
        "Drive through whole foot to press sled back up without locking knees violently."
      ],
      tips: ["Keep lower back glued to backrest.", "Deep quad stretch at bottom."]
    },
    "Hollow Body Hold": {
      youtubeUrl: "https://www.youtube.com/watch?v=44ScXWFaVBs",
      videoId: "44ScXWFaVBs",
      channel: "Calisthenicmovement",
      muscle: "Deep Core & Anterior Chain",
      secondary: "Hip Flexors",
      equipment: "Bodyweight (No Equipment)",
      category: "core",
      steps: [
        "Lie on back with arms extended overhead and legs straight.",
        "Press lower back flat into floor and lift shoulders and heels 2-3 inches off ground.",
        "Hold the shallow curved 'banana' position with steady breathing."
      ],
      tips: ["If lower back arches off floor, bend knees slightly to regress.", "Fundamental gymnastics core hold."]
    },
    "Incline Treadmill Walk": {
      youtubeUrl: "https://www.youtube.com/watch?v=y_CoBECEdNA",
      videoId: "y_CoBECEdNA",
      channel: "DilekFit",
      muscle: "Cardiovascular System, Calves & Glutes",
      secondary: "Hamstrings",
      equipment: "Treadmill",
      category: "cardio",
      steps: [
        "Set incline to 8-12% and speed to 3.0-3.8 mph.",
        "Walk with upright posture without holding onto handrails.",
        "Drive through heels with energetic arm swing."
      ],
      tips: ["Do not hold handrails—holding eliminates core and glute workload.", "Breathe steadily."]
    },
    "JM Press": {
      youtubeUrl: "https://www.youtube.com/watch?v=lA7XQZsalVg",
      videoId: "lA7XQZsalVg",
      channel: "Alex Leonidas",
      muscle: "Triceps Brachii Lockout Power",
      secondary: "Pectorals",
      equipment: "Barbell & Bench",
      category: "triceps",
      steps: [
        "Lie on bench holding bar above neck with shoulder-width grip.",
        "Lower bar toward throat by bending elbows while keeping upper arms angled.",
        "Press bar back to start with triceps."
      ],
      tips: ["Hybrid between close-grip bench and skull crusher.", "Use moderate weight."]
    },
    "Kettlebell Clean and Press": {
      youtubeUrl: "https://www.youtube.com/watch?v=ckjR4jYtuYc",
      videoId: "ckjR4jYtuYc",
      channel: "Nuffield Health",
      muscle: "Full Body Power, Shoulders & Hips",
      secondary: "Core, Lats",
      equipment: "Kettlebell",
      category: "full_body",
      steps: [
        "Hike kettlebell back, snap hips to clean bell into front rack.",
        "Dip knees slightly and press kettlebell straight overhead to lockout.",
        "Lower with control back to rack, then into next hike."
      ],
      tips: ["Do not let bell slam onto wrist.", "Drive with hips."]
    },
    "Landmine Press": {
      youtubeUrl: "https://www.youtube.com/watch?v=7i64SnEJv6A",
      videoId: "7i64SnEJv6A",
      channel: "ScottHermanFitness",
      muscle: "Upper Chest & Anterior Deltoid",
      secondary: "Triceps, Scapular Stabilizers",
      equipment: "Landmine Station & Barbell",
      category: "shoulders",
      steps: [
        "Stand holding sleeve of landmine barbell at shoulder.",
        "Press bar upward and forward at natural 45-degree angle.",
        "Lower under control back to shoulder."
      ],
      tips: ["Extremely shoulder-friendly pressing angle.", "Brace core to prevent rotation."]
    },
    "Landmine Rotation": {
      youtubeUrl: "https://www.youtube.com/watch?v=epdBIT32SS0",
      videoId: "epdBIT32SS0",
      channel: "ScottHermanFitness",
      muscle: "Obliques & Core",
      secondary: "Shoulders, Hips",
      equipment: "Landmine Station & Barbell",
      category: "core",
      steps: [
        "Hold end of landmine bar with both hands at eye level.",
        "Rotate bar in an arc down to right hip, pivoting feet.",
        "Drive bar back to center and rotate down to left hip."
      ],
      tips: ["Control weight with core, not arms.", "Keep arms relatively straight."]
    },
    "Lateral Lunge": {
      youtubeUrl: "https://www.youtube.com/watch?v=FR2habAAum4",
      videoId: "FR2habAAum4",
      channel: "Red5 Performance",
      muscle: "Adductors, Quads & Gluteus Medius",
      secondary: "Hamstrings",
      equipment: "Bodyweight (No Equipment)",
      category: "legs",
      steps: [
        "Take wide step out to side, sitting hips back over bent knee.",
        "Keep trailing leg completely straight with foot flat on floor.",
        "Drive off bent foot to return to center standing."
      ],
      tips: ["Keep chest up and trailing foot flat.", "Great for frontal plane hip mobility."]
    },
    "Leaning Cable Lateral Raise": {
      youtubeUrl: "https://www.youtube.com/watch?v=PPrzBWZDOhA",
      videoId: "PPrzBWZDOhA",
      channel: "Jeff Nippard",
      muscle: "Lateral Deltoids (Peak Range)",
      secondary: "Trapezius",
      equipment: "Cable Machine",
      category: "shoulders",
      steps: [
        "Hold pole of cable machine with one hand, leaning body out at 20 degrees.",
        "Raise cable handle out wide with other arm.",
        "Lower with control to thigh."
      ],
      tips: ["Lean shifts resistance profile to peak shoulder isolation.", "Control the negative."]
    },
    "Light Cycling": {
      youtubeUrl: "https://www.youtube.com/watch?v=izkkfnhirak",
      videoId: "izkkfnhirak",
      channel: "Posture Guy",
      muscle: "Cardiovascular System, Quads & Recovery",
      secondary: "Calves, Hamstrings",
      equipment: "Stationary Bike / Road Bike",
      category: "cardio",
      steps: [
        "Pedal at moderate cadence (80-90 RPM) with light resistance.",
        "Breathe comfortably and maintain upright spine."
      ],
      tips: ["Outstanding low-impact active recovery for flushing leg fatigue.", "Keep cadence smooth."]
    },
    "Light Elliptical": {
      youtubeUrl: "https://www.youtube.com/watch?v=F28VZNLNyWo",
      videoId: "F28VZNLNyWo",
      channel: "Your Pharmacist ",
      muscle: "Full Body Cardio & Recovery",
      secondary: "Legs, Arms",
      equipment: "Elliptical Machine",
      category: "cardio",
      steps: [
        "Step onto pedals and glide smoothly in forward strides.",
        "Push and pull handles in coordination with legs."
      ],
      tips: ["Zero joint impact.", "Great for gentle calorie burn."]
    },
    "Light Rowing": {
      youtubeUrl: "https://www.youtube.com/watch?v=OD1xrYEzNXs",
      videoId: "OD1xrYEzNXs",
      channel: "Natalie Eva Marie",
      muscle: "Legs, Back & Cardiovascular Endurance",
      secondary: "Core, Arms",
      equipment: "Rowing Ergometer",
      category: "cardio",
      steps: [
        "Drive with legs first, lean back slightly with torso, then pull handle to sternum.",
        "Reverse: arms forward, torso forward, knees bend back to catch."
      ],
      tips: ["Legs 60%, Core 20%, Arms 20%.", "Maintain steady stroke rate."]
    },
    "Light Swimming": {
      youtubeUrl: "https://www.youtube.com/watch?v=AiYOfH2jtos",
      videoId: "AiYOfH2jtos",
      channel: "Step-It-Up Fitness",
      muscle: "Full Body & Respiratory Health",
      secondary: "Shoulders, Lats",
      equipment: "Swimming Pool",
      category: "cardio",
      steps: [
        "Swim freestyle or breaststroke at relaxed, steady pace.",
        "Focus on long gliding strokes and bilateral breathing."
      ],
      tips: ["Ultimate zero-gravity full-body exercise.", "Keep body streamlined in water."]
    },
    "Machine Row": {
      youtubeUrl: "https://www.youtube.com/watch?v=GZbfZ033f74",
      videoId: "GZbfZ033f74",
      channel: "ScottHermanFitness",
      muscle: "Upper Back, Lats & Rhomboids",
      secondary: "Biceps",
      equipment: "Row Machine",
      category: "back",
      steps: [
        "Adjust chest pad to sternum height.",
        "Grip handles and row back driving elbows behind torso.",
        "Pinch shoulder blades, then return under control."
      ],
      tips: ["Keep chest against pad to isolate back completely.", "Do not yank."]
    },
    "Man Maker": {
      youtubeUrl: "https://www.youtube.com/watch?v=uIOb2DZMtzA",
      videoId: "uIOb2DZMtzA",
      channel: "fitness__kaykay",
      muscle: "Total Body Conditioning & Strength",
      secondary: "Chest, Back, Quads, Shoulders",
      equipment: "Pair of Dumbbells",
      category: "full_body",
      steps: [
        "Drop to push-up gripping dumbbells, perform push-up.",
        "Row right dumbbell, row left dumbbell.",
        "Jump feet forward, clean dumbbells to shoulders, and squat thruster overhead."
      ],
      tips: ["Pace yourself rhythmically.", "Use dumbbells with flat hex heads for stability."]
    },
    "Meadows Row": {
      youtubeUrl: "https://www.youtube.com/watch?v=pEif-yJMvfw",
      videoId: "pEif-yJMvfw",
      channel: "ScottHermanFitness",
      muscle: "Lower & Lateral Latissimus",
      secondary: "Rear Deltoid, Biceps",
      equipment: "Landmine & Barbell",
      category: "back",
      steps: [
        "Stand perpendicular to landmine bar in staggered stance.",
        "Grip end of bar with overhand grip and row back flared elbow.",
        "Squeeze outer lat at top, then lower to full stretch."
      ],
      tips: ["Created by legendary bodybuilder John Meadows.", "Provides incredible lower lat stretch."]
    },
    "Medicine Ball Slam": {
      youtubeUrl: "https://www.youtube.com/watch?v=cgKqNn90MEo",
      videoId: "cgKqNn90MEo",
      channel: "Gerardi Performance",
      muscle: "Abdominals, Lats & Kinetic Power",
      secondary: "Shoulders, Quads",
      equipment: "Slam Ball",
      category: "cardio",
      steps: [
        "Hold slam ball overhead with arms extended.",
        "Hinge hips and violently throw ball into floor between feet.",
        "Catch on bounce or scoop up into next repetition."
      ],
      tips: ["Slam with whole body and core, not just arms.", "Use dead-bounce slam ball."]
    },
    "Medicine Ball Twist": {
      youtubeUrl: "https://www.youtube.com/watch?v=wkD8rjkodUI",
      videoId: "wkD8rjkodUI",
      channel: "Bowflex",
      muscle: "Obliques & Core",
      secondary: "Hip Flexors",
      equipment: "Medicine Ball / Floor Mat",
      category: "core",
      steps: [
        "Sit in V-sit position holding medicine ball.",
        "Rotate ball smoothly from side to side tapping mat.",
        "Keep core tight."
      ],
      tips: ["Rotate ribcage, not just waving ball.", "Maintain upright posture."]
    },
    "Neutral-Grip Pull-up": {
      youtubeUrl: "https://www.youtube.com/watch?v=mcC5rRX5sR0",
      videoId: "mcC5rRX5sR0",
      channel: "Coach Miranda ",
      muscle: "Latissimus Dorsi & Brachialis",
      secondary: "Biceps, Forearms",
      equipment: "Pull-up Bar with Parallel Handles",
      category: "back",
      steps: [
        "Grip parallel handles with palms facing each other.",
        "Pull body up until chest reaches handles.",
        "Lower under control over 2-3 seconds."
      ],
      tips: ["Extremely friendly on wrists and shoulders.", "Full dead hang at bottom."]
    },
    "Nordic Curl": {
      youtubeUrl: "https://www.youtube.com/watch?v=2djC5e7XG10",
      videoId: "2djC5e7XG10",
      channel: "Shredded Dad Garage Gym",
      muscle: "Hamstrings (Eccentric Overload)",
      secondary: "Glutes, Calves",
      equipment: "Ankle Anchor / Partner",
      category: "legs",
      steps: [
        "Kneel on mat with ankles securely anchored.",
        "Lower torso forward as slowly as possible resisting gravity with hamstrings.",
        "Catch yourself on floor with hands, push off lightly and pull back up."
      ],
      tips: ["Gold standard exercise for hamstring injury prevention.", "Resist the drop as long as possible."]
    },
    "Pallof Press": {
      youtubeUrl: "https://www.youtube.com/watch?v=5aZ0IhJS8O8",
      videoId: "5aZ0IhJS8O8",
      channel: "Beyond Measure Fitness Training",
      muscle: "Anti-Rotational Core & Obliques",
      secondary: "Shoulders, Glutes",
      equipment: "Cable Machine / Resistance Band",
      category: "core",
      steps: [
        "Stand sideways to cable machine holding handle at chest.",
        "Press hands straight out forward resisting cable's rotational pull.",
        "Hold for 2 seconds, then bring hands back to chest."
      ],
      tips: ["Resist any twisting; keep chest and hips locked forward.", "Breathe steadily."]
    },
    "Pause Squat": {
      youtubeUrl: "https://www.youtube.com/watch?v=lSXRJmOWpWM",
      videoId: "lSXRJmOWpWM",
      channel: "Squat University",
      muscle: "Quads & Glutes (Hole Strength)",
      secondary: "Core",
      equipment: "Barbell & Rack",
      category: "legs",
      steps: [
        "Descend to parallel squat.",
        "Pause dead still in bottom for 2 full seconds without bouncing.",
        "Drive powerfully up to standing."
      ],
      tips: ["Eliminates stretch reflex to build raw starting strength.", "Keep core fully braced."]
    },
    "Pendulum Squat": {
      youtubeUrl: "https://www.youtube.com/watch?v=bEv6CCg2BC8",
      videoId: "bEv6CCg2BC8",
      channel: "Squat University",
      muscle: "Quadriceps (Vastus Medialis)",
      secondary: "Glutes",
      equipment: "Pendulum Squat Machine",
      category: "legs",
      steps: [
        "Step onto machine platform with back against pad.",
        "Lower through deep arc into full knee flexion.",
        "Drive back up to top."
      ],
      tips: ["Curved arc matches knee biomechanics.", "Allows deep knee flexion safely."]
    },
    "Rear Delt Row": {
      youtubeUrl: "https://www.youtube.com/watch?v=ttvfGg9d76c",
      videoId: "ttvfGg9d76c",
      channel: "ScottHermanFitness",
      muscle: "Posterior Deltoids & Rhomboids",
      secondary: "Trapezius, Biceps",
      equipment: "Dumbbells / Barbell",
      category: "shoulders",
      steps: [
        "Hinge forward at 45 degrees holding dumbbells.",
        "Row weights up with elbows flared out at 90 degrees.",
        "Squeeze rear shoulders, then lower smoothly."
      ],
      tips: ["Keep elbows high and wide to bias rear deltoids.", "Do not tuck elbows into ribs."]
    },
    "Renegade Row": {
      youtubeUrl: "https://www.youtube.com/watch?v=YUMXGLL2IKE",
      videoId: "YUMXGLL2IKE",
      channel: "Kraken Exercise Library",
      muscle: "Core Stability, Lats & Upper Back",
      secondary: "Chest, Shoulders",
      equipment: "Pair of Hex Dumbbells",
      category: "back",
      steps: [
        "Hold push-up plank gripping hex dumbbells on floor.",
        "Row right dumbbell to ribcage while resisting hip rotation.",
        "Place dumbbell down and row left dumbbell."
      ],
      tips: ["Keep feet wide to stabilize hips.", "Do not let hips tilt side to side."]
    },
    "Reverse Crunch": {
      youtubeUrl: "https://www.youtube.com/watch?v=7UVgs18Y1P4",
      videoId: "7UVgs18Y1P4",
      channel: "ScottHermanFitness",
      muscle: "Lower Abdominals",
      secondary: "Hip Flexors",
      equipment: "Floor Mat / Bench",
      category: "core",
      steps: [
        "Lie on back with knees bent at 90 degrees, hands by sides.",
        "Curl pelvis up off floor toward chest using lower abs.",
        "Hold for 1 second, then lower pelvis back down with control."
      ],
      tips: ["Initiate movement by curling tailbone, not swinging legs.", "Control the lowering phase."]
    },
    "Reverse Fly": {
      youtubeUrl: "https://www.youtube.com/watch?v=SlViLQ2qVGM",
      videoId: "SlViLQ2qVGM",
      channel: "KC FITNESS",
      muscle: "Rear Deltoids & Rhomboids",
      secondary: "Upper Back",
      equipment: "Dumbbells / Cables",
      category: "shoulders",
      steps: [
        "Hinge forward at hips with flat back.",
        "Fly arms out wide to sides until parallel to floor.",
        "Squeeze rear shoulders, then lower."
      ],
      tips: ["Keep a soft elbow bend.", "Use light weights to keep movement strict."]
    },
    "Row Erg Sprint": {
      youtubeUrl: "https://www.youtube.com/watch?v=A-35F9TR0OA",
      videoId: "A-35F9TR0OA",
      channel: "mrdiversify",
      muscle: "Cardiovascular Power, Legs & Back",
      secondary: "Core, Grip",
      equipment: "Rowing Machine",
      category: "cardio",
      steps: [
        "Drive legs back explosively with maximum wattage.",
        "Keep stroke rate high and maintain powerful pull.",
        "Recover quickly back to catch."
      ],
      tips: ["Drive through heels.", "Breathe with each stroke."]
    },
    "Rowing Machine": {
      youtubeUrl: "https://www.youtube.com/watch?v=SfSe485Bxt8",
      videoId: "SfSe485Bxt8",
      channel: "Mazin Alneami",
      muscle: "Full Body Endurance, Legs & Back",
      secondary: "Core, Biceps",
      equipment: "Concept2 / Rowing Machine",
      category: "cardio",
      steps: [
        "Drive legs back, swing torso slightly back, pull handle to chest.",
        "Extend arms, lean torso forward, slide knees forward to catch."
      ],
      tips: ["Smooth rhythm: 1 count drive, 2 counts recovery.", "Keep chain level."]
    },
    "Sandbag Carry": {
      youtubeUrl: "https://www.youtube.com/watch?v=N79hPp2h8Pc",
      videoId: "N79hPp2h8Pc",
      channel: "Rogue Fitness",
      muscle: "Core, Upper Back, Biceps & Conditioning",
      secondary: "Glutes, Forearms",
      equipment: "Heavy Sandbag",
      category: "full_body",
      steps: [
        "Bear hug heavy sandbag against chest with interlocked arms.",
        "Stand tall and walk forward with short, rapid strides.",
        "Maintain upright torso under load."
      ],
      tips: ["Do not lean backward.", "Breathe through upper chest."]
    },
    "Seated Calf Raise": {
      youtubeUrl: "https://www.youtube.com/watch?v=JbyjNymZOt0",
      videoId: "JbyjNymZOt0",
      channel: "ScottHermanFitness",
      muscle: "Soleus (Deep Calf Muscle)",
      secondary: "Achilles Tendon",
      equipment: "Seated Calf Machine",
      category: "legs",
      steps: [
        "Sit on machine with thigh pad secured above knees.",
        "Lower heels into full deep stretch.",
        "Elevate heels as high as possible, squeezing soleus."
      ],
      tips: ["Bent-knee angle targets soleus muscle under gastrocnemius.", "Hold peak squeeze."]
    },
    "Shuttle Run": {
      youtubeUrl: "https://www.youtube.com/watch?v=NoDVEwnq2Gs",
      videoId: "NoDVEwnq2Gs",
      channel: "Coach Schuman Sports and Entertainment",
      muscle: "Agility, Quads & Cardiovascular Speed",
      secondary: "Calves, Hamstrings",
      equipment: "Cones / Open Space",
      category: "cardio",
      steps: [
        "Sprint 25 yards to cone, touch ground.",
        "Pivot, decelerate, and sprint back to start.",
        "Repeat for designated intervals."
      ],
      tips: ["Stay low on direction change.", "Push off outside foot."]
    },
    "Single-Arm Dumbbell Press": {
      youtubeUrl: "https://www.youtube.com/watch?v=qEwKCR5JCog",
      videoId: "qEwKCR5JCog",
      channel: "ScottHermanFitness",
      muscle: "Anterior & Lateral Deltoid",
      secondary: "Triceps, Obliques",
      equipment: "Dumbbell",
      category: "shoulders",
      steps: [
        "Stand tall holding dumbbell at shoulder with neutral spine.",
        "Press dumbbell straight overhead without leaning sideways.",
        "Lower under control back to shoulder."
      ],
      tips: ["Core must work hard to resist lateral leaning.", "Keep ribs clamped down."]
    },
    "Single-Arm Pushdown": {
      youtubeUrl: "https://www.youtube.com/watch?v=CsUQLMngO7w",
      videoId: "CsUQLMngO7w",
      channel: "TylerPath",
      muscle: "Triceps Brachii (Unilateral Focus)",
      secondary: "Anconeus",
      equipment: "Cable Machine & Single Handle",
      category: "triceps",
      steps: [
        "Grip handle with elbow pinned to side.",
        "Push handle straight down to full lockout.",
        "Hold squeeze for 1 second, then return slowly."
      ],
      tips: ["Isolates each tricep independently.", "Keep upper arm pinned."]
    },
    "Single-Leg RDL": {
      youtubeUrl: "https://www.youtube.com/watch?v=JCXUYuzwNrM",
      videoId: "JCXUYuzwNrM",
      channel: "Bowflex",
      muscle: "Hamstrings, Gluteus Medius & Balance",
      secondary: "Core, Ankle Stabilizers",
      equipment: "Dumbbell / Bodyweight",
      category: "legs",
      steps: [
        "Stand on one leg with soft knee.",
        "Hinge forward at hip, extending opposite leg straight back.",
        "Lower weight along standing shin until deep hamstring stretch.",
        "Drive through standing heel to return to tall posture."
      ],
      tips: ["Keep hips level with floor—do not rotate pelvis open.", "Keep spine neutral."]
    },
    "Sissy Squat": {
      youtubeUrl: "https://www.youtube.com/watch?v=V37sDEWxLLw",
      videoId: "V37sDEWxLLw",
      channel: "Mike O'Hearn",
      muscle: "Quadriceps (Rectus Femoris Deep Stretch)",
      secondary: "Knee Tendons, Core",
      equipment: "Sissy Squat Bench / Bodyweight",
      category: "legs",
      steps: [
        "Lock shins into sissy squat bench.",
        "Lean torso back while bending knees deeply to 90 degrees.",
        "Drive through balls of feet to stand tall."
      ],
      tips: ["Intense quad isolation without hip hinge.", "Move through comfortable joint range."]
    },
    "Sled Pull": {
      youtubeUrl: "https://www.youtube.com/watch?v=H3xT0dYP1UU",
      videoId: "H3xT0dYP1UU",
      channel: "Lizzie May",
      muscle: "Posterior Chain, Hamstrings & Glutes",
      secondary: "Core, Calves",
      equipment: "Prowler / Weight Sled & Strap",
      category: "cardio",
      steps: [
        "Attach strap to sled and hold with arms straight.",
        "Walk backward with powerful strides dragging sled.",
        "Keep knees soft and chest proud."
      ],
      tips: ["Amazing knee rehabilitation and quad/hamstring builder.", "Maintain continuous tension."]
    },
    "Sled Push": {
      youtubeUrl: "https://www.youtube.com/watch?v=HqQdYraid5Y",
      videoId: "HqQdYraid5Y",
      channel: "JeremyScottFitness",
      muscle: "Quadriceps, Calves & Conditioning",
      secondary: "Glutes, Core, Shoulders",
      equipment: "Prowler / Weight Sled",
      category: "cardio",
      steps: [
        "Grip high or low handles with straight arms.",
        "Drive aggressively into ground through balls of feet.",
        "Sprint or march forward pushing sled."
      ],
      tips: ["Keep spine aligned in 45-degree forward lean.", "Zero eccentric muscle damage."]
    },
    "Smith Machine Incline Press": {
      youtubeUrl: "https://www.youtube.com/watch?v=b8DqTO6ak0k",
      videoId: "b8DqTO6ak0k",
      channel: "ScottHermanFitness",
      muscle: "Upper Pectoralis (Clavicular Head)",
      secondary: "Triceps, Anterior Delts",
      equipment: "Smith Machine & Incline Bench",
      category: "chest",
      steps: [
        "Position incline bench so bar tracks to upper clavicle.",
        "Unrack bar and lower under control to upper chest.",
        "Press powerfully to lockout."
      ],
      tips: ["Fixed bar path allows deep focus on mind-muscle connection.", "Keep shoulders pinned back."]
    },
    "Spider Curl": {
      youtubeUrl: "https://www.youtube.com/watch?v=8N5sBROvWpI",
      videoId: "8N5sBROvWpI",
      channel: "JayCutlerTV",
      muscle: "Biceps Brachii (Short Head)",
      secondary: "Forearms",
      equipment: "Incline Bench & Dumbbells / Barbell",
      category: "biceps",
      steps: [
        "Lie face down on 45-degree incline bench with arms hanging over front.",
        "Curl weight upward toward face without letting upper arms swing forward.",
        "Squeeze peak bicep contraction, then lower slowly."
      ],
      tips: ["Eliminates all body swing.", "Pure arm isolation."]
    },
    "Stair Climber": {
      youtubeUrl: "https://www.youtube.com/watch?v=DXC6V1vDhDI",
      videoId: "DXC6V1vDhDI",
      channel: "PowerMax ",
      muscle: "Glutes, Quads & Cardiovascular Endurance",
      secondary: "Calves",
      equipment: "StairMaster / Stepper",
      category: "cardio",
      steps: [
        "Step onto moving stairs with upright posture.",
        "Take full steps placing whole foot on tread.",
        "Breathe with cadence without leaning on handrails."
      ],
      tips: ["Do not slouch or lean body weight on handrails.", "Drive through heels."]
    },
    "Step-up": {
      youtubeUrl: "https://www.youtube.com/watch?v=LTcEeM-Z8kU",
      videoId: "LTcEeM-Z8kU",
      channel: "Fitness Happy Time",
      muscle: "Gluteus Maximus & Quads",
      secondary: "Hamstrings, Calves",
      equipment: "Plyo Box / Bench & Dumbbells",
      category: "legs",
      steps: [
        "Place one entire foot flat on sturdy box or bench.",
        "Drive through front heel to step up to standing on box.",
        "Lower under control with trailing leg touching floor lightly."
      ],
      tips: ["Minimize pushing off with trailing foot.", "Let front leg do all the work."]
    },
    "Stiff-Leg Deadlift": {
      youtubeUrl: "https://www.youtube.com/watch?v=JCXUYuzwNrM",
      videoId: "JCXUYuzwNrM",
      channel: "ScottHermanFitness",
      muscle: "Hamstrings & Lower Back",
      secondary: "Glutes",
      equipment: "Barbell",
      category: "legs",
      steps: [
        "Stand tall with nearly straight knees.",
        "Hinge forward at hips lowering bar to top of feet.",
        "Feel intense hamstring stretch, then contract to return to standing."
      ],
      tips: ["Keep back flat and bar close to legs.", "Do not lock knees completely."]
    },
    "Stir-the-Pot": {
      youtubeUrl: "https://www.youtube.com/watch?v=ASdvN_XEl_c",
      videoId: "ASdvN_XEl_c",
      channel: "Squat University",
      muscle: "Transverse Abdominis & Rotational Core",
      secondary: "Shoulders, Glutes",
      equipment: "Stability Ball",
      category: "core",
      steps: [
        "Hold forearm plank with elbows resting on stability ball.",
        "Trace small circular circles with elbows without moving hips.",
        "Reverse circular direction."
      ],
      tips: ["Stuart McGill approved ultimate core stability exercise.", "Keep hips rock solid."]
    },
    "Suitcase Carry": {
      youtubeUrl: "https://www.youtube.com/watch?v=KjIK4l_AS5U",
      videoId: "KjIK4l_AS5U",
      channel: "Luke Consbruck",
      muscle: "Obliques (Anti-Lateral Flexion) & Grip",
      secondary: "Traps, Glutes",
      equipment: "Single Dumbbell / Kettlebell",
      category: "core",
      steps: [
        "Hold single heavy weight in one hand at side.",
        "Walk forward maintaining completely upright posture with zero side lean.",
        "Switch hands after prescribed distance."
      ],
      tips: ["Fight the urge to lean away from the weight.", "Keep shoulders level."]
    },
    "Sumo Deadlift": {
      youtubeUrl: "https://www.youtube.com/watch?v=1v4r9hht_K4",
      videoId: "1v4r9hht_K4",
      channel: "ScottHermanFitness",
      muscle: "Adductors, Quads & Gluteus Maximus",
      secondary: "Erector Spinae, Traps",
      equipment: "Barbell & Olympic Plates",
      category: "back",
      steps: [
        "Take a very wide stance with toes pointed outward at 45 degrees.",
        "Grip bar with arms hanging straight inside legs.",
        "Keep chest proud, drive floor away, and push hips forward to lockout."
      ],
      tips: ["More upright torso angle than conventional deadlift.", "Keep knees pushed out over toes."]
    },
    "Tate Press": {
      youtubeUrl: "https://www.youtube.com/watch?v=IgSjoXbpy1M",
      videoId: "IgSjoXbpy1M",
      channel: "ScottHermanFitness",
      muscle: "Triceps Brachii (Medial & Lateral Head)",
      secondary: "Anconeus",
      equipment: "Flat Bench & Dumbbells",
      category: "triceps",
      steps: [
        "Lie on bench holding dumbbells over chest, palms facing feet.",
        "Bend elbows outward to lower dumbbell inside heads to touch chest.",
        "Extend elbows to press weights back up to lockout."
      ],
      tips: ["Keep movement controlled at bottom.", "Unique angle for elbow extension."]
    },
    "Toes-to-Bar": {
      youtubeUrl: "https://www.youtube.com/watch?v=9Tx0QKP1A0I",
      videoId: "9Tx0QKP1A0I",
      channel: "M Squared Fitness",
      muscle: "Rectus Abdominis & Grip",
      secondary: "Hip Flexors, Lats",
      equipment: "Pull-up Bar",
      category: "core",
      steps: [
        "Hang from bar with active shoulders.",
        "Engage lats and curl hips and legs up until toes touch bar.",
        "Lower under control to start."
      ],
      tips: ["Curl pelvis up rather than merely lifting legs.", "Control the swing."]
    },
    "V-Ups": {
      youtubeUrl: "https://www.youtube.com/watch?v=7UVgs18Y1P4",
      videoId: "7UVgs18Y1P4",
      channel: "Bowflex",
      muscle: "Upper & Lower Rectus Abdominis",
      secondary: "Hip Flexors",
      equipment: "Floor Mat / Bodyweight",
      category: "core",
      steps: [
        "Lie flat on back with arms extended overhead.",
        "Simultaneously lift torso and straight legs to touch toes at peak.",
        "Form a 'V' shape balancing on tailbone, then lower with control."
      ],
      tips: ["Move smoothly without jerking.", "Keep legs as straight as possible."]
    },
    "Wall Ball": {
      youtubeUrl: "https://www.youtube.com/watch?v=dbUvzV_GY1M",
      videoId: "dbUvzV_GY1M",
      channel: "NAOMI CLAIRE",
      muscle: "Quads, Glutes & Shoulders",
      secondary: "Core, Triceps",
      equipment: "Medicine Ball & Target Wall",
      category: "cardio",
      steps: [
        "Hold ball at chest, squat below parallel.",
        "Drive out of squat explosively and throw ball to 10-foot target on wall.",
        "Catch ball on rebound and descend into next squat."
      ],
      tips: ["One continuous fluid rhythm.", "Breathe out on throw."]
    },
    "Weighted Dip": {
      youtubeUrl: "https://www.youtube.com/watch?v=2z8JmcrW-As",
      videoId: "2z8JmcrW-As",
      channel: "Calisthenicmovement",
      muscle: "Lower Pectorals & Triceps",
      secondary: "Anterior Delts",
      equipment: "Dip Belt & Weight Plates",
      category: "chest",
      steps: [
        "Attach weight plate to dip belt around waist.",
        "Suspend on dip bars, lean torso slightly forward.",
        "Lower to 90 degrees, press powerfully to lockout."
      ],
      tips: ["Premier upper body mass builder.", "Do not sink past comfortable range."]
    },
    "Weighted Plank": {
      youtubeUrl: "https://www.youtube.com/watch?v=ASdvN_XEl_c",
      videoId: "ASdvN_XEl_c",
      channel: "ScottHermanFitness",
      muscle: "Deep Transverse & Rectus Abdominis",
      secondary: "Glutes, Shoulders",
      equipment: "Weight Plate on Upper Back",
      category: "core",
      steps: [
        "Place weight plate on mid-upper back.",
        "Hold rock-solid forearm plank line.",
        "Breathe steadily from diaphragm."
      ],
      tips: ["Ensure plate is centered.", "Never let hips sag."]
    },
    "Weighted Push-up": {
      youtubeUrl: "https://www.youtube.com/watch?v=IODxDxX7oi4",
      videoId: "IODxDxX7oi4",
      channel: "Calisthenicmovement",
      muscle: "Pectoralis Major & Triceps",
      secondary: "Core, Shoulders",
      equipment: "Weight Plate on Back",
      category: "chest",
      steps: [
        "Position weight plate flat across mid-back.",
        "Perform full-depth push-ups touching chest to floor.",
        "Press up to full lockout."
      ],
      tips: ["Superior chest builder with zero shoulder strain.", "Keep core braced."]
    },
    "Z-Press": {
      youtubeUrl: "https://www.youtube.com/watch?v=2yjwXTZQDDI",
      videoId: "2yjwXTZQDDI",
      channel: "Alan Thrall",
      muscle: "Deltoids & Core Pillar Strength",
      secondary: "Upper Traps, Triceps",
      equipment: "Barbell / Dumbbells on Floor",
      category: "shoulders",
      steps: [
        "Sit flat on floor with legs extended straight in front in a 'V'.",
        "Hold barbell or dumbbells at shoulder level with tall vertical posture.",
        "Press weights straight overhead without leaning back or shifting pelvis."
      ],
      tips: ["Demands incredible core and thoracic spine integrity.", "Do not slouch."]
    },
    "Zottman Curl": {
      youtubeUrl: "https://www.youtube.com/watch?v=ZrpRBgswtHs",
      videoId: "ZrpRBgswtHs",
      channel: "ScottHermanFitness",
      muscle: "Biceps Brachii & Forearm Brachioradialis",
      secondary: "Forearm Extensors",
      equipment: "Dumbbells",
      category: "biceps",
      steps: [
        "Curl dumbbells upward with palms facing up (supinated).",
        "At top of curl, rotate wrists 180 degrees so palms face forward/down (pronated).",
        "Lower dumbbells slowly with palms down to overload forearms."
      ],
      tips: ["Complete arm developer for both biceps and forearms.", "Control the pronated descent."]
    }
  };

  // Helper resolver for any exercise name (direct, case-insensitive, or substring matching)
  function getExerciseYouTubeData(exerciseName) {
    if (!exerciseName) return null;
    var raw = exerciseName.trim();
    var lower = raw.toLowerCase();

    // 1. Direct key match
    if (EXERCISE_YOUTUBE_MAP[raw]) {
      return Object.assign({ name: raw }, EXERCISE_YOUTUBE_MAP[raw]);
    }

    // 2. Case-insensitive match
    for (var k in EXERCISE_YOUTUBE_MAP) {
      if (k.toLowerCase() === lower) {
        return Object.assign({ name: raw }, EXERCISE_YOUTUBE_MAP[k]);
      }
    }

    // 3. Normalized keyword match
    for (var k2 in EXERCISE_YOUTUBE_MAP) {
      var kLower = k2.toLowerCase();
      if (lower.indexOf(kLower) !== -1 || kLower.indexOf(lower) !== -1) {
        return Object.assign({ name: raw }, EXERCISE_YOUTUBE_MAP[k2]);
      }
    }

    // Fallback: If no verified link exists, return null so Watch Tutorial button is cleanly hidden
    return null;
  }

  // Export to global window scope
  global.EXERCISE_YOUTUBE_MAP = EXERCISE_YOUTUBE_MAP;
  global.getExerciseYouTubeData = getExerciseYouTubeData;

})(typeof window !== "undefined" ? window : this);
