using System;
using System.IO;
using System.Text;

public class GenerateRunRedesign {
    public static void Main() {
        StringBuilder sb = new StringBuilder();

        // Include all components
        sb.AppendLine(@"
// ============================================================================
// STOKE ⚡ STRAVA-INSPIRED RUNNING & MULTI-SPORT TRACKER
// Redesigned to exact visual reference from user screen recordings (oooooo.mp4 & mmmmm.mp4)
// Features:
// 1. Full-screen Dark GPS Map with CartoDB Dark Matter tiles & vibrant orange glowing route
// 2. Top Workout Banner (""Try a Stoke workout · Limited preview · Audio cues"")
// 3. Compass button with North reset & recenter
// 4. Floating right controls (Audio cues, 3D tilt/layers, Recenter GPS)
// 5. Floating bottom stats panel (Time, Avg. pace (/km), Distance (km)) with Fullscreen HUD toggle
// 6. Bottom controls bar: Sport selector (orange icon), Large orange Start/Pause button, Add Route button
// 7. ""Choose a Sport"" scrollable sheet with real-time search, categories & 50 sports matching video
// 8. Indoor Workout mode (Weight Training, Workout, HIIT, Yoga) with Time of Day clock & sensor button
// 9. Real GPS tracking, reverse geocoding, audio splits, Supabase cloud persistence & activity history
// ============================================================================

const PRESET_ROUTES = [
  {
    id: ""route_5k"",
    name: ""City River Loop 5K"",
    distanceKm: 5.02,
    elevationGain: 35,
    desc: ""Flat scenic loop along the water with smooth pavement."",
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
    id: ""route_3k"",
    name: ""Park Trail 3K"",
    distanceKm: 3.15,
    elevationGain: 18,
    desc: ""Soft gravel paths through botanical gardens with shaded canopy."",
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
    id: ""route_10k"",
    name: ""Skyline Circuit 10K"",
    distanceKm: 10.05,
    elevationGain: 85,
    desc: ""Urban endurance challenge with rolling hills and panoramic vistas."",
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
  { id: ""run"", name: ""Run"", category: ""Foot Sports"", icon: ""shoe"", isOutdoor: true, isTop: true },
  { id: ""trail_run"", name: ""Trail Run"", category: ""Foot Sports"", icon: ""trail_shoe"", isOutdoor: true },
  { id: ""walk"", name: ""Walk"", category: ""Foot Sports"", icon: ""walk"", isOutdoor: true, isTop: true },
  { id: ""hike"", name: ""Hike"", category: ""Foot Sports"", icon: ""hike"", isOutdoor: true },
  { id: ""wheelchair"", name: ""Wheelchair"", category: ""Foot Sports"", icon: ""wheelchair"", isOutdoor: true },

  // Cycle Sports
  { id: ""ride"", name: ""Ride"", category: ""Cycle Sports"", icon: ""bike"", isOutdoor: true, isTop: true },
  { id: ""mountain_bike"", name: ""Mountain Bike Ride"", category: ""Cycle Sports"", icon: ""mountain_bike"", isOutdoor: true },
  { id: ""gravel_ride"", name: ""Gravel Ride"", category: ""Cycle Sports"", icon: ""gravel_bike"", isOutdoor: true },
  { id: ""ebike"", name: ""E-Bike Ride"", category: ""Cycle Sports"", icon: ""ebike"", isOutdoor: true },
  { id: ""emountain_bike"", name: ""E-Mountain Bike Ride"", category: ""Cycle Sports"", icon: ""emountain_bike"", isOutdoor: true },
  { id: ""handcycle"", name: ""Handcycle"", category: ""Cycle Sports"", icon: ""handcycle"", isOutdoor: true },
  { id: ""velomobile"", name: ""Velomobile Ride"", category: ""Cycle Sports"", icon: ""velomobile"", isOutdoor: true },

  // Strength
  { id: ""weight_training"", name: ""Weight Training"", category: ""Strength"", icon: ""dumbbell"", isOutdoor: false, isTop: true },
  { id: ""workout"", name: ""Workout"", category: ""Strength"", icon: ""workout"", isOutdoor: false, isTop: true },
  { id: ""hiit"", name: ""HIIT"", category: ""Strength"", icon: ""hiit"", isOutdoor: false },
  { id: ""crossfit"", name: ""Crossfit"", category: ""Strength"", icon: ""crossfit"", isOutdoor: false },
  { id: ""physical_therapy"", name: ""Physical Therapy"", category: ""Strength"", icon: ""therapy"", isOutdoor: false },

  // Racket Sports
  { id: ""tennis"", name: ""Tennis"", category: ""Racket Sports"", icon: ""tennis"", isOutdoor: false },
  { id: ""padel"", name: ""Padel"", category: ""Racket Sports"", icon: ""tennis"", isOutdoor: false },
  { id: ""pickleball"", name: ""Pickleball"", category: ""Racket Sports"", icon: ""pickleball"", isOutdoor: false },
  { id: ""racquetball"", name: ""Racquetball"", category: ""Racket Sports"", icon: ""racket"", isOutdoor: false },
  { id: ""squash"", name: ""Squash"", category: ""Racket Sports"", icon: ""racket"", isOutdoor: false },
  { id: ""badminton"", name: ""Badminton"", category: ""Racket Sports"", icon: ""badminton"", isOutdoor: false },
  { id: ""table_tennis"", name: ""Table Tennis"", category: ""Racket Sports"", icon: ""table_tennis"", isOutdoor: false },

  // Water Sports
  { id: ""swim"", name: ""Swim"", category: ""Water Sports"", icon: ""swim"", isOutdoor: false },
  { id: ""surf"", name: ""Surf"", category: ""Water Sports"", icon: ""surf"", isOutdoor: true },
  { id: ""standup_paddle"", name: ""Stand Up Paddle"", category: ""Water Sports"", icon: ""paddle"", isOutdoor: true },
  { id: ""windsurf"", name: ""Windsurf Session"", category: ""Water Sports"", icon: ""windsurf"", isOutdoor: true },
  { id: ""kitesurf"", name: ""Kitesurf Session"", category: ""Water Sports"", icon: ""kitesurf"", isOutdoor: true },
  { id: ""kayak"", name: ""Kayak"", category: ""Water Sports"", icon: ""kayak"", isOutdoor: true },
  { id: ""row"", name: ""Row"", category: ""Water Sports"", icon: ""row"", isOutdoor: true },
  { id: ""canoe"", name: ""Canoe"", category: ""Water Sports"", icon: ""canoe"", isOutdoor: true },
  { id: ""sail"", name: ""Sail"", category: ""Water Sports"", icon: ""sail"", isOutdoor: true },

  // Winter Sports
  { id: ""ice_skate"", name: ""Ice Skate"", category: ""Winter Sports"", icon: ""ice_skate"", isOutdoor: false },
  { id: ""alpine_ski"", name: ""Alpine Ski"", category: ""Winter Sports"", icon: ""ski"", isOutdoor: true },
  { id: ""nordic_ski"", name: ""Nordic Ski"", category: ""Winter Sports"", icon: ""ski"", isOutdoor: true },
  { id: ""backcountry_ski"", name: ""Backcountry Ski"", category: ""Winter Sports"", icon: ""ski"", isOutdoor: true },
  { id: ""snowboard"", name: ""Snowboard"", category: ""Winter Sports"", icon: ""snowboard"", isOutdoor: true },
  { id: ""snowshoe"", name: ""Snowshoe"", category: ""Winter Sports"", icon: ""snowshoe"", isOutdoor: true },

  // Team Sports
  { id: ""soccer"", name: ""Football (Soccer)"", category: ""Team Sports"", icon: ""soccer"", isOutdoor: true },
  { id: ""basketball"", name: ""Basketball"", category: ""Team Sports"", icon: ""basketball"", isOutdoor: false },
  { id: ""volleyball"", name: ""Volleyball"", category: ""Team Sports"", icon: ""volleyball"", isOutdoor: false },
  { id: ""cricket"", name: ""Cricket"", category: ""Team Sports"", icon: ""cricket"", isOutdoor: true },

  // Other Sports
  { id: ""inline_skate"", name: ""Inline Skate"", category: ""Other Sports"", icon: ""roller_skate"", isOutdoor: true },
  { id: ""roller_ski"", name: ""Roller Ski"", category: ""Other Sports"", icon: ""roller_ski"", isOutdoor: true },
  { id: ""rock_climb"", name: ""Rock Climb"", category: ""Other Sports"", icon: ""climb"", isOutdoor: true },
  { id: ""elliptical"", name: ""Elliptical"", category: ""Other Sports"", icon: ""elliptical"", isOutdoor: false },
  { id: ""stair_stepper"", name: ""Stair Stepper"", category: ""Other Sports"", icon: ""stepper"", isOutdoor: false },
  { id: ""yoga"", name: ""Yoga"", category: ""Other Sports"", icon: ""yoga"", isOutdoor: false },
  { id: ""dance"", name: ""Dance"", category: ""Other Sports"", icon: ""dance"", isOutdoor: false },
  { id: ""skateboard"", name: ""Skateboard"", category: ""Other Sports"", icon: ""skateboard"", isOutdoor: true },
  { id: ""golf"", name: ""Golf"", category: ""Other Sports"", icon: ""golf"", isOutdoor: true },
  { id: ""pilates"", name: ""Pilates"", category: ""Other Sports"", icon: ""yoga"", isOutdoor: false }
];

const SPORT_CATEGORIES = [
  ""Foot Sports"",
  ""Cycle Sports"",
  ""Strength"",
  ""Racket Sports"",
  ""Water Sports"",
  ""Winter Sports"",
  ""Team Sports"",
  ""Other Sports""
];

function SportIcon({ icon = ""shoe"", size = 20, color = ""#FFFFFF"" }) {
  const common = {
    width: size,
    height: size,
    viewBox: ""0 0 24 24"",
    fill: ""none"",
    stroke: color,
    strokeWidth: ""2"",
    strokeLinecap: ""round"",
    strokeLinejoin: ""round""
  };

  switch (icon) {
    case ""shoe"":
    case ""run"":
      return (
        <svg {...common}>
          <path d=""M4 17l6-1 5 1 5-2v-4l-4-2-4 1-5-1L4 12v5z"" />
          <path d=""M4 17h16"" />
          <circle cx=""9"" cy=""11"" r=""1"" fill={color} />
          <circle cx=""12"" cy=""11"" r=""1"" fill={color} />
        </svg>
      );
    case ""trail_shoe"":
      return (
        <svg {...common}>
          <path d=""M3 17l6-2 5 2 7-3v-4l-5-2-4 1-6-1L3 11v6z"" />
          <path d=""M3 18l3-1 3 1 3-1 3 1 3-1 3 1"" />
        </svg>
      );
    case ""walk"":
      return (
        <svg {...common}>
          <circle cx=""13"" cy=""4"" r=""2"" />
          <path d=""M9 20l3-6 2 2 3 4"" />
          <path d=""M6 14l3-4 3 2 4-4"" />
        </svg>
      );
    case ""hike"":
      return (
        <svg {...common}>
          <path d=""M3 20l7-12 5 7 6-4"" />
          <circle cx=""17"" cy=""5"" r=""2"" />
          <path d=""M14 14l-2 6"" />
          <path d=""M19 14l2 6"" />
        </svg>
      );
    case ""wheelchair"":
      return (
        <svg {...common}>
          <circle cx=""12"" cy=""4"" r=""2"" />
          <path d=""M8 12h5l2 5"" />
          <path d=""M10 20a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"" />
          <path d=""M14 17h4"" />
        </svg>
      );
    case ""bike"":
    case ""ride"":
      return (
        <svg {...common}>
          <circle cx=""5.5"" cy=""17.5"" r=""3.5"" />
          <circle cx=""18.5"" cy=""17.5"" r=""3.5"" />
          <path d=""M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5L8.5 10H13l3.5 4"" />
          <path d=""M12 17.5V14l-3-4"" />
          <path d=""M15 6h-2.5l-2 4"" />
        </svg>
      );
    case ""mountain_bike"":
    case ""gravel_bike"":
      return (
        <svg {...common}>
          <circle cx=""5"" cy=""17"" r=""4"" />
          <circle cx=""19"" cy=""17"" r=""4"" />
          <path d=""M12 17l-3.5-7h4.5l3.5 4"" />
          <path d=""M15 5h-2l-2 5"" />
        </svg>
      );
    case ""ebike"":
    case ""emountain_bike"":
      return (
        <svg {...common}>
          <circle cx=""5.5"" cy=""17.5"" r=""3.5"" />
          <circle cx=""18.5"" cy=""17.5"" r=""3.5"" />
          <path d=""M12 17.5l-3.5-7.5H13l3.5 4"" />
          <polygon points=""12 4 10 9 13 9 11 14 15 8 12 8 12 4"" fill={color} />
        </svg>
      );
    case ""dumbbell"":
    case ""weight_training"":
      return (
        <svg {...common}>
          <path d=""M6 5v14M18 5v14M2 9v6M22 9v6M6 12h12"" />
        </svg>
      );
    case ""workout"":
      return (
        <svg {...common}>
          <path d=""M4 14l3-6 4 9 4-6 5 3"" />
          <circle cx=""12"" cy=""4"" r=""2"" />
        </svg>
      );
    case ""hiit"":
      return (
        <svg {...common}>
          <circle cx=""12"" cy=""13"" r=""8"" />
          <path d=""M12 9v4l2.5 2.5"" />
          <path d=""M10 2h4"" />
          <path d=""M12 2v3"" />
        </svg>
      );
    case ""crossfit"":
      return (
        <svg {...common}>
          <path d=""M12 3a4 4 0 0 0-4 4v2h8V7a4 4 0 0 0-4-4z"" />
          <rect x=""6"" y=""9"" width=""12"" height=""12"" rx=""6"" />
        </svg>
      );
    case ""therapy"":
      return (
        <svg {...common}>
          <circle cx=""12"" cy=""12"" r=""9"" />
          <line x1=""12"" y1=""8"" x2=""12"" y2=""16"" />
          <line x1=""8"" y1=""12"" x2=""16"" y2=""12"" />
        </svg>
      );
    case ""swim"":
      return (
        <svg {...common}>
          <path d=""M2 15c2 0 3-1.5 5-1.5s3 1.5 5 1.5 3-1.5 5-1.5 3 1.5 5 1.5"" />
          <path d=""M2 19c2 0 3-1.5 5-1.5s3 1.5 5 1.5 3-1.5 5-1.5 3 1.5 5 1.5"" />
          <circle cx=""18"" cy=""8"" r=""2"" />
          <path d=""M14 10l-4 2-3-2"" />
        </svg>
      );
    case ""tennis"":
    case ""padel"":
    case ""racket"":
    case ""pickleball"":
    case ""badminton"":
    case ""table_tennis"":
      return (
        <svg {...common}>
          <ellipse cx=""14"" cy=""9"" rx=""5"" ry=""6"" />
          <path d=""M10 14l-6 6"" />
          <circle cx=""19"" cy=""5"" r=""2"" fill={color} />
        </svg>
      );
    case ""soccer"":
      return (
        <svg {...common}>
          <circle cx=""12"" cy=""12"" r=""9"" />
          <polygon points=""12 7 8 10 9 14 15 14 16 10"" />
        </svg>
      );
    case ""basketball"":
      return (
        <svg {...common}>
          <circle cx=""12"" cy=""12"" r=""9"" />
          <path d=""M3 12h18M12 3v18"" />
          <path d=""M5.5 5.5a11 11 0 0 1 0 13M18.5 5.5a11 11 0 0 0 0 13"" />
        </svg>
      );
    case ""yoga"":
    case ""pilates"":
      return (
        <svg {...common}>
          <circle cx=""12"" cy=""5"" r=""2"" />
          <path d=""M4 17l4-2 4 2 4-2 4 2"" />
          <path d=""M12 7v6l-3 4M12 13l3 4"" />
        </svg>
      );
    case ""climb"":
    case ""rock_climb"":
      return (
        <svg {...common}>
          <path d=""M3 21l8-14 4 6 6-10"" />
          <circle cx=""17"" cy=""4"" r=""2"" />
        </svg>
      );
    case ""route"":
      return (
        <svg {...common}>
          <circle cx=""6"" cy=""19"" r=""3"" />
          <circle cx=""18"" cy=""5"" r=""3"" />
          <path d=""M9 19h2a5 5 0 0 0 5-5V9a4 4 0 0 1 4-4"" />
        </svg>
      );
    case ""sensor"":
      return (
        <svg {...common}>
          <path d=""M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"" />
          <path d=""M8 9h2l2 4 2-6 2 4h2"" stroke=""#FFF"" strokeWidth=""1.5"" />
        </svg>
      );
    case ""compass"":
      return (
        <svg {...common}>
          <circle cx=""12"" cy=""12"" r=""9"" />
          <polygon points=""12 5 15 12 12 11 9 12"" fill=""#FC5200"" stroke=""none"" />
          <polygon points=""12 19 15 12 12 13 9 12"" fill=""#FFFFFF"" stroke=""none"" />
        </svg>
      );
    case ""layers"":
    case ""3d"":
      return (
        <svg {...common}>
          <polygon points=""12 2 2 7 12 12 22 7 12 2"" />
          <polyline points=""2 12 12 17 22 12"" />
          <polyline points=""2 17 12 22 22 17"" />
        </svg>
      );
    case ""crosshair"":
      return (
        <svg {...common}>
          <circle cx=""12"" cy=""12"" r=""7"" />
          <line x1=""12"" y1=""2"" x2=""12"" y2=""5"" />
          <line x1=""12"" y1=""19"" x2=""12"" y2=""22"" />
          <line x1=""2"" y1=""12"" x2=""5"" y2=""12"" />
          <line x1=""19"" y1=""12"" x2=""22"" y2=""12"" />
          <circle cx=""12"" cy=""12"" r=""1.5"" fill={color} />
        </svg>
      );
    case ""speaker"":
      return (
        <svg {...common}>
          <polygon points=""11 5 6 9 2 9 2 15 6 15 11 19 11 5"" />
          <path d=""M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"" />
        </svg>
      );
    case ""speaker_off"":
      return (
        <svg {...common}>
          <polygon points=""11 5 6 9 2 9 2 15 6 15 11 19 11 5"" />
          <line x1=""23"" y1=""9"" x2=""17"" y2=""15"" />
          <line x1=""17"" y1=""9"" x2=""23"" y2=""15"" />
        </svg>
      );
    case ""expand"":
      return (
        <svg {...common}>
          <polyline points=""15 3 21 3 21 9"" />
          <polyline points=""9 21 3 21 3 15"" />
          <line x1=""21"" y1=""3"" x2=""14"" y2=""10"" />
          <line x1=""3"" y1=""21"" x2=""10"" y2=""14"" />
        </svg>
      );
    case ""chevron_down"":
      return (
        <svg {...common}>
          <polyline points=""6 9 12 15 18 9"" />
        </svg>
      );
    case ""checkmark"":
      return (
        <svg {...common} stroke=""#FC5200"" strokeWidth=""3"">
          <polyline points=""20 6 9 17 4 12"" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx=""12"" cy=""12"" r=""8"" />
          <path d=""M12 8v8M8 12h8"" />
        </svg>
      );
  }
}
");

        File.WriteAllText("run_part1.js", sb.ToString(), new UTF8Encoding(false));
        Console.WriteLine("Part 1 written.");
    }
}
