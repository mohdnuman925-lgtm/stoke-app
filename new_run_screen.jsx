// ============================================================================
// STOKE ⚡ STRAVA-INSPIRED RUNNING & MULTI-SPORT TRACKER
// Redesigned to exact visual reference from user screen recordings (oooooo.mp4 & mmmmm.mp4)
// Features:
// 1. Full-screen Dark GPS Map with CartoDB Dark Matter tiles & vibrant orange glowing route
// 2. Top Workout Banner ("Try a Stoke workout · Limited preview · Audio cues")
// 3. Compass button with North reset & recenter
// 4. Floating right controls (Audio cues, 3D tilt/layers, Recenter GPS)
// 5. Floating bottom stats panel (Time, Avg. pace (/km), Distance (km)) with Fullscreen HUD toggle
// 6. Bottom controls bar: Sport selector (orange icon), Large orange Start/Pause button, Add Route button
// 7. "Choose a Sport" scrollable sheet with real-time search, categories & 50 sports matching video
// 8. Indoor Workout mode (Weight Training, Workout, HIIT, Yoga) with Time of Day clock & sensor button
// 9. Real GPS tracking, reverse geocoding, audio splits, Supabase cloud persistence & activity history
// ============================================================================

const PRESET_ROUTES = [
  {
    id: "route_5k",
    name: "City River Loop 5K",
    distanceKm: 5.02,
    elevationGain: 35,
    desc: "Flat scenic loop along the water with smooth pavement.",
    coords: [
      { lat: 17.3345, lng: 77.9012 },
      { lat: 17.3365, lng: 77.9015 },
      { lat: 17.3382, lng: 77.9002 },
      { lat: 17.3398, lng: 77.8998 },
      { lat: 17.3415, lng: 77.9004 },
      { lat: 17.3428, lng: 77.9015 },
      { lat: 17.3432, lng: 77.9032 },
      { lat: 17.3426, lng: 77.9048 },
      { lat: 17.3418, lng: 77.9061 },
      { lat: 17.3402, lng: 77.9070 },
      { lat: 17.3385, lng: 77.9065 },
      { lat: 17.3368, lng: 77.9052 },
      { lat: 17.3352, lng: 77.9035 },
      { lat: 17.3345, lng: 77.9012 }
    ]
  },
  {
    id: "route_3k",
    name: "Park Trail 3K",
    distanceKm: 3.15,
    elevationGain: 18,
    desc: "Soft gravel paths through botanical gardens with shaded canopy.",
    coords: [
      { lat: 17.3350, lng: 77.9020 },
      { lat: 17.3370, lng: 77.9025 },
      { lat: 17.3390, lng: 77.9018 },
      { lat: 17.3405, lng: 77.9030 },
      { lat: 17.3395, lng: 77.9045 },
      { lat: 17.3375, lng: 77.9040 },
      { lat: 17.3350, lng: 77.9020 }
    ]
  },
  {
    id: "route_10k",
    name: "Skyline Circuit 10K",
    distanceKm: 10.05,
    elevationGain: 85,
    desc: "Urban endurance challenge with rolling hills and panoramic vistas.",
    coords: [
      { lat: 17.3340, lng: 77.9010 },
      { lat: 17.3380, lng: 77.9000 },
      { lat: 17.3430, lng: 77.9010 },
      { lat: 17.3470, lng: 77.9040 },
      { lat: 17.3490, lng: 77.9080 },
      { lat: 17.3460, lng: 77.9120 },
      { lat: 17.3410, lng: 77.9110 },
      { lat: 17.3360, lng: 77.9080 },
      { lat: 17.3340, lng: 77.9010 }
    ]
  }
];

const ALL_SPORTS = [
  // Foot Sports
  { id: "run", name: "Run", category: "Foot Sports", icon: "shoe", isOutdoor: true, isTop: true },
  { id: "trail_run", name: "Trail Run", category: "Foot Sports", icon: "trail_shoe", isOutdoor: true },
  { id: "walk", name: "Walk", category: "Foot Sports", icon: "walk", isOutdoor: true, isTop: true },
  { id: "hike", name: "Hike", category: "Foot Sports", icon: "hike", isOutdoor: true },
  { id: "wheelchair", name: "Wheelchair", category: "Foot Sports", icon: "wheelchair", isOutdoor: true },

  // Cycle Sports
  { id: "ride", name: "Ride", category: "Cycle Sports", icon: "bike", isOutdoor: true, isTop: true },
  { id: "mountain_bike", name: "Mountain Bike Ride", category: "Cycle Sports", icon: "mountain_bike", isOutdoor: true },
  { id: "gravel_ride", name: "Gravel Ride", category: "Cycle Sports", icon: "gravel_bike", isOutdoor: true },
  { id: "ebike", name: "E-Bike Ride", category: "Cycle Sports", icon: "ebike", isOutdoor: true },
  { id: "emountain_bike", name: "E-Mountain Bike Ride", category: "Cycle Sports", icon: "emountain_bike", isOutdoor: true },
  { id: "handcycle", name: "Handcycle", category: "Cycle Sports", icon: "handcycle", isOutdoor: true },
  { id: "velomobile", name: "Velomobile Ride", category: "Cycle Sports", icon: "velomobile", isOutdoor: true },

  // Strength
  { id: "weight_training", name: "Weight Training", category: "Strength", icon: "dumbbell", isOutdoor: false, isTop: true },
  { id: "workout", name: "Workout", category: "Strength", icon: "workout", isOutdoor: false, isTop: true },
  { id: "hiit", name: "HIIT", category: "Strength", icon: "hiit", isOutdoor: false },
  { id: "crossfit", name: "Crossfit", category: "Strength", icon: "crossfit", isOutdoor: false },
  { id: "physical_therapy", name: "Physical Therapy", category: "Strength", icon: "therapy", isOutdoor: false },

  // Racket Sports
  { id: "tennis", name: "Tennis", category: "Racket Sports", icon: "tennis", isOutdoor: false },
  { id: "padel", name: "Padel", category: "Racket Sports", icon: "tennis", isOutdoor: false },
  { id: "pickleball", name: "Pickleball", category: "Racket Sports", icon: "pickleball", isOutdoor: false },
  { id: "racquetball", name: "Racquetball", category: "Racket Sports", icon: "racket", isOutdoor: false },
  { id: "squash", name: "Squash", category: "Racket Sports", icon: "racket", isOutdoor: false },
  { id: "badminton", name: "Badminton", category: "Racket Sports", icon: "badminton", isOutdoor: false },
  { id: "table_tennis", name: "Table Tennis", category: "Racket Sports", icon: "table_tennis", isOutdoor: false },

  // Water Sports
  { id: "swim", name: "Swim", category: "Water Sports", icon: "swim", isOutdoor: false },
  { id: "surf", name: "Surf", category: "Water Sports", icon: "surf", isOutdoor: true },
  { id: "standup_paddle", name: "Stand Up Paddle", category: "Water Sports", icon: "paddle", isOutdoor: true },
  { id: "windsurf", name: "Windsurf Session", category: "Water Sports", icon: "windsurf", isOutdoor: true },
  { id: "kitesurf", name: "Kitesurf Session", category: "Water Sports", icon: "kitesurf", isOutdoor: true },
  { id: "kayak", name: "Kayak", category: "Water Sports", icon: "kayak", isOutdoor: true },
  { id: "row", name: "Row", category: "Water Sports", icon: "row", isOutdoor: true },
  { id: "canoe", name: "Canoe", category: "Water Sports", icon: "canoe", isOutdoor: true },
  { id: "sail", name: "Sail", category: "Water Sports", icon: "sail", isOutdoor: true },

  // Winter Sports
  { id: "ice_skate", name: "Ice Skate", category: "Winter Sports", icon: "ice_skate", isOutdoor: false },
  { id: "alpine_ski", name: "Alpine Ski", category: "Winter Sports", icon: "ski", isOutdoor: true },
  { id: "nordic_ski", name: "Nordic Ski", category: "Winter Sports", icon: "ski", isOutdoor: true },
  { id: "backcountry_ski", name: "Backcountry Ski", category: "Winter Sports", icon: "ski", isOutdoor: true },
  { id: "snowboard", name: "Snowboard", category: "Winter Sports", icon: "snowboard", isOutdoor: true },
  { id: "snowshoe", name: "Snowshoe", category: "Winter Sports", icon: "snowshoe", isOutdoor: true },

  // Team Sports
  { id: "soccer", name: "Football (Soccer)", category: "Team Sports", icon: "soccer", isOutdoor: true },
  { id: "basketball", name: "Basketball", category: "Team Sports", icon: "basketball", isOutdoor: false },
  { id: "volleyball", name: "Volleyball", category: "Team Sports", icon: "volleyball", isOutdoor: false },
  { id: "cricket", name: "Cricket", category: "Team Sports", icon: "cricket", isOutdoor: true },

  // Other Sports
  { id: "inline_skate", name: "Inline Skate", category: "Other Sports", icon: "roller_skate", isOutdoor: true },
  { id: "roller_ski", name: "Roller Ski", category: "Other Sports", icon: "roller_ski", isOutdoor: true },
  { id: "rock_climb", name: "Rock Climb", category: "Other Sports", icon: "climb", isOutdoor: true },
  { id: "elliptical", name: "Elliptical", category: "Other Sports", icon: "elliptical", isOutdoor: false },
  { id: "stair_stepper", name: "Stair Stepper", category: "Other Sports", icon: "stepper", isOutdoor: false },
  { id: "yoga", name: "Yoga", category: "Other Sports", icon: "yoga", isOutdoor: false },
  { id: "dance", name: "Dance", category: "Other Sports", icon: "dance", isOutdoor: false },
  { id: "skateboard", name: "Skateboard", category: "Other Sports", icon: "skateboard", isOutdoor: true },
  { id: "golf", name: "Golf", category: "Other Sports", icon: "golf", isOutdoor: true },
  { id: "pilates", name: "Pilates", category: "Other Sports", icon: "yoga", isOutdoor: false }
];

const SPORT_CATEGORIES = [
  "Foot Sports",
  "Cycle Sports",
  "Strength",
  "Racket Sports",
  "Water Sports",
  "Winter Sports",
  "Team Sports",
  "Other Sports"
];
