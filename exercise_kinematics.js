/* ============================================================
   STOKE 3D ATHLETIC EXERCISE KINEMATICS ENGINE
   High-Fidelity Biomechanical Human Model & Dynamic Trajectories
   ============================================================ */

(function(global) {
  "use strict";

  // Easing function for smooth 6-second repetition loop
  // 0.0 -> 0.45: Concentric drive
  // 0.45 -> 0.55: Peak contraction hold
  // 0.55 -> 0.95: Controlled eccentric lowering
  // 0.95 -> 1.00: Reset & breathe
  function calculateKinematicState(timeSec, loopDuration) {
    var dur = loopDuration || 6.0;
    var normT = (timeSec % dur) / dur;
    var k = 0;
    var phaseName = "Concentric";
    var phaseDesc = "Drive & Exhale";
    var isPeak = false;

    if (normT < 0.45) {
      // Concentric: 0 -> 1
      var progress = normT / 0.45;
      k = (1 - Math.cos(progress * Math.PI)) / 2;
      phaseName = "Concentric";
      phaseDesc = "Drive & Exhale";
    } else if (normT < 0.55) {
      // Peak hold: 1
      k = 1.0;
      isPeak = true;
      phaseName = "Peak Contraction";
      phaseDesc = "Squeeze & Hold (1.0s)";
    } else if (normT < 0.95) {
      // Eccentric: 1 -> 0
      var progress = (normT - 0.55) / 0.40;
      k = (1 + Math.cos(progress * Math.PI)) / 2;
      phaseName = "Eccentric";
      phaseDesc = "Control & Inhale";
    } else {
      // Reset: 0
      k = 0;
      phaseName = "Starting Position";
      phaseDesc = "Brace Core";
    }

    return {
      k: k,
      normT: normT,
      secondsLeft: (dur - (normT * dur)),
      phaseName: phaseName,
      phaseDesc: phaseDesc,
      isPeak: isPeak
    };
  }

  // Draw studio pedestal platform with perspective circular grid
  function drawStudioPedestal(ctx, cx, cy, width, height, viewAngle) {
    var floorY = height - 28;
    
    // Ambient soft glow on floor
    var glow = ctx.createRadialGradient(cx, floorY, 10, cx, floorY, 140);
    glow.addColorStop(0, "rgba(37, 107, 253, 0.28)");
    glow.addColorStop(0.5, "rgba(46, 212, 191, 0.12)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(cx, floorY, 150, 42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Concentric rings
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, floorY, 130, 36, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(46, 212, 191, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, floorY, 95, 26, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(37, 107, 253, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, floorY, 55, 15, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Perspective spokes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    for (var a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      var rx = cx + Math.cos(a) * 125;
      var ry = floorY + Math.sin(a) * 34;
      ctx.beginPath();
      ctx.moveTo(cx, floorY);
      ctx.lineTo(rx, ry);
      ctx.stroke();
    }
  }

  // Draw Range of Motion Trajectory Vector (Curved Green/Lime Line with Arrowheads)
  function drawTrajectoryArc(ctx, points, progress, label) {
    if (!points || points.length < 2) return;
    
    ctx.save();
    // Glowing neon green line
    ctx.shadowColor = "rgba(34, 197, 94, 0.75)";
    ctx.shadowBlur = 10;
    ctx.strokeStyle = "#22C55E";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 4]);

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (var i = 1; i < points.length; i++) {
      if (points[i].cx && points[i].cy) {
        ctx.quadraticCurveTo(points[i].cx, points[i].cy, points[i].x, points[i].y);
      } else {
        ctx.lineTo(points[i].x, points[i].y);
      }
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Start Marker
    var startP = points[0];
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.beginPath();
    ctx.arc(startP.x, startP.y, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Peak Marker
    var endP = points[points.length - 1];
    ctx.fillStyle = "#22C55E";
    ctx.beginPath();
    ctx.arc(endP.x, endP.y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Dynamic Tracking Dot (tracks the current movement position)
    var currIdx = Math.min(Math.floor(progress * (points.length - 1)), points.length - 2);
    var pA = points[currIdx];
    var pB = points[currIdx + 1];
    var localT = (progress * (points.length - 1)) - currIdx;
    var trackX = pA.x + (pB.x - pA.x) * localT;
    var trackY = pA.y + (pB.y - pA.y) * localT;

    ctx.fillStyle = "#FFFFFF";
    ctx.shadowColor = "#22C55E";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(trackX, trackY, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Trajectory Label
    if (label) {
      ctx.font = "bold 9.5px 'Space Grotesk', sans-serif";
      ctx.fillStyle = "#22C55E";
      ctx.textAlign = "center";
      ctx.fillText(label, endP.x, endP.y - 8);
    }
    ctx.restore();
  }

  // Draw Athletic Head & Neck
  function drawHead(ctx, hx, hy, facing, isGlow) {
    ctx.save();
    // Neck
    ctx.fillStyle = "#24324D";
    ctx.fillRect(hx - 4, hy + 8, 8, 12);

    // Head
    ctx.fillStyle = isGlow ? "#3B82F6" : "#2A3B5C";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(hx, hy, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eye visor / Athletic face contour
    ctx.fillStyle = "#60A5FA";
    if (facing === "side") {
      ctx.fillRect(hx + 3, hy - 2, 5, 3);
    } else {
      ctx.fillRect(hx - 5, hy - 2, 10, 3);
    }
    ctx.restore();
  }

  // Draw Muscular Torso with Pectorals and Abdominals
  function drawMuscularTorso(ctx, tx, ty, width, height, activeMuscle, k, viewAngle) {
    ctx.save();
    var isPecActive = activeMuscle === "chest";
    var isCoreActive = activeMuscle === "core";
    var isBackActive = activeMuscle === "back";

    // Primary Torso Body
    ctx.fillStyle = "#162035";
    ctx.strokeStyle = "rgba(96, 165, 250, 0.35)";
    ctx.lineWidth = 1.5;

    // V-Taper Torso Outline
    ctx.beginPath();
    ctx.moveTo(tx - width / 2, ty); // Left shoulder
    ctx.lineTo(tx + width / 2, ty); // Right shoulder
    ctx.lineTo(tx + width * 0.35, ty + height); // Right waist
    ctx.lineTo(tx - width * 0.35, ty + height); // Left waist
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Latissimus Dorsi (V-Taper Wings)
    if (viewAngle !== "side") {
      var latGlow = isBackActive ? `rgba(255, 77, 77, ${0.4 + k * 0.5})` : "rgba(37, 107, 253, 0.35)";
      ctx.fillStyle = latGlow;
      ctx.beginPath();
      ctx.moveTo(tx - width / 2, ty + 12);
      ctx.lineTo(tx - width / 2 - 8, ty + 30);
      ctx.lineTo(tx - width * 0.35, ty + height - 8);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(tx + width / 2, ty + 12);
      ctx.lineTo(tx + width / 2 + 8, ty + 30);
      ctx.lineTo(tx + width * 0.35, ty + height - 8);
      ctx.closePath();
      ctx.fill();
    }

    // Pectoral Plates (Chest)
    if (viewAngle !== "side") {
      var pecGlow = isPecActive ? `rgba(255, 77, 77, ${0.45 + k * 0.55})` : "rgba(59, 130, 246, 0.4)";
      var pecBorder = isPecActive ? "#FF4D4D" : "rgba(255, 255, 255, 0.25)";
      
      ctx.fillStyle = pecGlow;
      ctx.strokeStyle = pecBorder;
      ctx.lineWidth = 1.5;

      // Left Pec
      ctx.beginPath();
      ctx.roundRect(tx - width * 0.45, ty + 6, width * 0.4, 20, [4, 2, 8, 4]);
      ctx.fill();
      ctx.stroke();

      // Right Pec
      ctx.beginPath();
      ctx.roundRect(tx + width * 0.05, ty + 6, width * 0.4, 20, [2, 4, 4, 8]);
      ctx.fill();
      ctx.stroke();
    }

    // Abdominal 6-Pack Grid
    var abGlow = isCoreActive ? `rgba(255, 77, 77, ${0.4 + k * 0.5})` : "rgba(255, 255, 255, 0.12)";
    ctx.fillStyle = abGlow;
    var abW = width * 0.16;
    var abH = 8;
    for (var r = 0; r < 3; r++) {
      var rowY = ty + 32 + r * 11;
      ctx.fillRect(tx - abW - 2, rowY, abW, abH);
      ctx.fillRect(tx + 2, rowY, abW, abH);
    }

    ctx.restore();
  }

  // Draw Deltoid Cap (Shoulder muscle with active glow)
  function drawDeltoidCap(ctx, sx, sy, radius, isActive, k) {
    ctx.save();
    var glowColor = isActive ? `rgba(255, 77, 77, ${0.5 + k * 0.5})` : "rgba(59, 130, 246, 0.45)";
    var borderColor = isActive ? "#FF4D4D" : "#3B82F6";

    ctx.shadowColor = isActive ? "#FF4D4D" : "rgba(59, 130, 246, 0.6)";
    ctx.shadowBlur = isActive ? 14 : 6;
    ctx.fillStyle = glowColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.arc(sx, sy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Draw Arm Segment (Upper Arm or Forearm with athletic contour)
  function drawArmSegment(ctx, x1, y1, x2, y2, thickness, isActive, k) {
    ctx.save();
    var glowColor = isActive ? `rgba(255, 77, 77, ${0.45 + k * 0.55})` : "rgba(37, 107, 253, 0.85)";
    var strokeColor = isActive ? "#FF4D4D" : "#60A5FA";

    ctx.shadowColor = isActive ? "#FF4D4D" : "transparent";
    ctx.shadowBlur = isActive ? 12 : 0;
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = thickness;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Muscle highlight core line
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = thickness * 0.4;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.restore();
  }

  // Draw Muscular Legs
  function drawMuscularLegs(ctx, hipX, hipY, kx1, ky1, ax1, ay1, kx2, ky2, ax2, ay2, activeMuscle, k) {
    ctx.save();
    var isLegActive = activeMuscle === "legs" || activeMuscle === "glutes";
    var glowColor = isLegActive ? `rgba(255, 77, 77, ${0.45 + k * 0.55})` : "rgba(30, 48, 80, 0.9)";
    var coreColor = isLegActive ? "#FF4D4D" : "#3B82F6";

    // Left Thigh
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(hipX - 10, hipY);
    ctx.lineTo(kx1, ky1);
    ctx.stroke();

    // Left Shin / Calf
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(kx1, ky1);
    ctx.lineTo(ax1, ay1);
    ctx.stroke();

    // Right Thigh
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(hipX + 10, hipY);
    ctx.lineTo(kx2, ky2);
    ctx.stroke();

    // Right Shin / Calf
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(kx2, ky2);
    ctx.lineTo(ax2, ay2);
    ctx.stroke();

    // Knee Patella Joints
    ctx.fillStyle = coreColor;
    ctx.beginPath();
    ctx.arc(kx1, ky1, 4, 0, Math.PI * 2);
    ctx.arc(kx2, ky2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Athletic Shoes / Feet
    ctx.fillStyle = "#2ED4BF";
    ctx.fillRect(ax1 - 6, ay1 - 2, 14, 5);
    ctx.fillRect(ax2 - 6, ay2 - 2, 14, 5);

    ctx.restore();
  }

  // Draw Dumbbell
  function drawDumbbell(ctx, hx, hy, angle, isGlow) {
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(angle || 0);

    // Grip handle
    ctx.fillStyle = "#E2E8F0";
    ctx.fillRect(-8, -2, 16, 4);

    // Left & Right Hex Plates
    ctx.fillStyle = isGlow ? "#22C55E" : "#475569";
    ctx.strokeStyle = isGlow ? "#86EFAC" : "#94A3B8";
    ctx.lineWidth = 1;

    ctx.fillRect(-11, -8, 4, 16);
    ctx.strokeRect(-11, -8, 4, 16);

    ctx.fillRect(7, -8, 4, 16);
    ctx.strokeRect(7, -8, 4, 16);

    ctx.restore();
  }

  // Draw Barbell with Olympic Plates
  function drawBarbell(ctx, bx, by, barWidth, isGlow) {
    ctx.save();
    // Bar shaft
    ctx.fillStyle = "#CBD5E1";
    ctx.fillRect(bx - barWidth / 2, by - 2.5, barWidth, 5);

    // Center knurling
    ctx.fillStyle = "#94A3B8";
    ctx.fillRect(bx - 20, by - 2.5, 40, 5);

    // Olympic Weight Plates
    var plateColor = isGlow ? "#22C55E" : "#256BFD";
    var plateBorder = isGlow ? "#86EFAC" : "#60A5FA";

    ctx.fillStyle = plateColor;
    ctx.strokeStyle = plateBorder;
    ctx.lineWidth = 1.5;

    // Left Plates
    ctx.fillRect(bx - barWidth / 2 + 6, by - 18, 5, 36);
    ctx.strokeRect(bx - barWidth / 2 + 6, by - 18, 5, 36);
    ctx.fillRect(bx - barWidth / 2 + 13, by - 15, 4, 30);
    ctx.strokeRect(bx - barWidth / 2 + 13, by - 15, 4, 30);

    // Right Plates
    ctx.fillRect(bx + barWidth / 2 - 11, by - 18, 5, 36);
    ctx.strokeRect(bx + barWidth / 2 - 11, by - 18, 5, 36);
    ctx.fillRect(bx + barWidth / 2 - 17, by - 15, 4, 30);
    ctx.strokeRect(bx + barWidth / 2 - 17, by - 15, 4, 30);

    ctx.restore();
  }

  // ============================================================
  // SPECIFIC EXERCISE KINEMATIC RENDERERS
  // ============================================================

  // 1. LATERAL RAISE (Matches reference video pppppppp.mp4)
  function renderLateralRaise(ctx, cx, cy, k, viewAngle) {
    var athleteY = cy + 20;
    var floorY = cy + 105;

    // Body dimensions
    var shoulderY = athleteY - 45;
    var torsoW = 38;
    var torsoH = 50;

    // Head
    drawHead(ctx, cx, shoulderY - 14, viewAngle, false);

    // Torso
    drawMuscularTorso(ctx, cx, shoulderY, torsoW, torsoH, "shoulders", k, viewAngle);

    // Legs standing tall
    drawMuscularLegs(ctx, cx, shoulderY + torsoH, cx - 12, athleteY + 45, cx - 14, floorY, cx + 12, athleteY + 45, cx + 14, floorY, "legs", 0);

    // Lateral Raising Arms:
    // k = 0: arms hanging at sides (angle ~ 12°)
    // k = 1: arms parallel to shoulders (angle ~ 85°)
    var armAngle = 0.2 + k * 1.35; // radians (from ~12° to ~88°)
    var armLength = 48;

    // Left Arm
    var lsX = cx - torsoW / 2;
    var lsY = shoulderY + 4;
    var leX = lsX - Math.sin(armAngle) * (armLength * 0.55);
    var leY = lsY + Math.cos(armAngle) * (armLength * 0.55);
    var lhX = lsX - Math.sin(armAngle) * armLength;
    var lhY = lsY + Math.cos(armAngle) * armLength;

    // Right Arm
    var rsX = cx + torsoW / 2;
    var rsY = shoulderY + 4;
    var reX = rsX + Math.sin(armAngle) * (armLength * 0.55);
    var reY = rsY + Math.cos(armAngle) * (armLength * 0.55);
    var rhX = rsX + Math.sin(armAngle) * armLength;
    var rhY = rsY + Math.cos(armAngle) * armLength;

    // Draw Deltoid Caps (Shoulder Glow!)
    drawDeltoidCap(ctx, lsX, lsY, 8.5, true, k);
    drawDeltoidCap(ctx, rsX, rsY, 8.5, true, k);

    // Draw Arms
    drawArmSegment(ctx, lsX, lsY, leX, leY, 7.5, true, k);
    drawArmSegment(ctx, leX, leY, lhX, lhY, 6.5, false, 0);

    drawArmSegment(ctx, rsX, rsY, reX, reY, 7.5, true, k);
    drawArmSegment(ctx, reX, reY, rhX, rhY, 6.5, false, 0);

    // Dumbbells
    drawDumbbell(ctx, lhX, lhY, -armAngle, k > 0.8);
    drawDumbbell(ctx, rhX, rhY, armAngle, k > 0.8);

    // Dynamic Curved Trajectory Arcs (Identical to reference video pppppppp.mp4!)
    var leftArc = [
      { x: lsX - 10, y: lsY + armLength },
      { cx: lsX - armLength * 0.7, cy: lsY + armLength * 0.6, x: lsX - armLength, y: lsY }
    ];
    var rightArc = [
      { x: rsX + 10, y: rsY + armLength },
      { cx: rsX + armLength * 0.7, cy: rsY + armLength * 0.6, x: rsX + armLength, y: rsY }
    ];

    drawTrajectoryArc(ctx, leftArc, k, "ROM (85°)");
    drawTrajectoryArc(ctx, rightArc, k, "ROM (85°)");
  }

  // 2. BENCH PRESS (Horizontal Press)
  function renderBenchPress(ctx, cx, cy, k, viewAngle) {
    var benchY = cy + 25;
    
    // Draw Flat Bench & Posts
    ctx.fillStyle = "#1E293B";
    ctx.fillRect(cx - 75, benchY, 150, 10);
    ctx.fillStyle = "#0F172A";
    ctx.fillRect(cx - 60, benchY + 10, 8, 55);
    ctx.fillRect(cx + 52, benchY + 10, 8, 55);

    // Athlete lying on back
    ctx.fillStyle = "#162035";
    ctx.beginPath();
    ctx.roundRect(cx - 65, benchY - 12, 110, 14, 6);
    ctx.fill();

    // Head on bench
    drawHead(ctx, cx - 62, benchY - 14, "side", false);

    // Chest Pecs glowing
    ctx.fillStyle = `rgba(255, 77, 77, ${0.45 + k * 0.55})`;
    ctx.beginPath();
    ctx.arc(cx - 20, benchY - 14, 12, 0, Math.PI * 2);
    ctx.fill();

    // Barbell Height:
    // k = 0: bar at chest (lowest point)
    // k = 1: bar at full lockout (highest point)
    var barY = benchY - 24 - (k * 48);

    // Arms pressing
    var shoulderX = cx - 22;
    var shoulderY = benchY - 12;
    var elbowX = cx - 28 + (1 - k) * 12;
    var elbowY = (shoulderY + barY) / 2 + (1 - k) * 10;
    var handX = cx - 20;

    drawArmSegment(ctx, shoulderX, shoulderY, elbowX, elbowY, 7, true, k);
    drawArmSegment(ctx, elbowX, elbowY, handX, barY, 6, true, k);

    // Barbell
    drawBarbell(ctx, cx - 10, barY, 130, k > 0.85);

    // Trajectory vertical arrow
    var traj = [
      { x: cx - 20, y: benchY - 24 },
      { x: cx - 20, y: benchY - 72 }
    ];
    drawTrajectoryArc(ctx, traj, k, "VERTICAL DRIVE");
  }

  // 3. SQUAT / BODYWEIGHT SQUAT
  function renderSquat(ctx, cx, cy, k, viewAngle) {
    var floorY = cy + 105;
    // k = 0: standing tall
    // k = 1: deep 90° parallel squat
    var squatDepth = k * 42;

    var hipY = cy + 15 + squatDepth;
    var shoulderY = hipY - 48;
    var kneeY = floorY - 38 + squatDepth * 0.3;
    var kneeX_L = cx - 22 - k * 10;
    var kneeX_R = cx + 22 + k * 10;

    // Head
    drawHead(ctx, cx, shoulderY - 14, viewAngle, false);

    // Torso (slight forward lean on descent)
    drawMuscularTorso(ctx, cx, shoulderY, 38, 48, "legs", k, viewAngle);

    // Legs
    drawMuscularLegs(ctx, cx, hipY, kneeX_L, kneeY, cx - 18, floorY, kneeX_R, kneeY, cx + 18, floorY, "legs", k);

    // Arms clasped at chest or holding bar
    var handY = shoulderY + 20;
    drawArmSegment(ctx, cx - 18, shoulderY + 4, cx - 6, handY, 6, false, 0);
    drawArmSegment(ctx, cx + 18, shoulderY + 4, cx + 6, handY, 6, false, 0);

    // Barbell across traps
    drawBarbell(ctx, cx, shoulderY + 2, 125, k > 0.8);

    // Trajectory Vector (Vertical Squat Path)
    var traj = [
      { x: cx + 55, y: cy - 30 },
      { x: cx + 55, y: cy - 30 + 42 }
    ];
    drawTrajectoryArc(ctx, traj, k, "90° DEPTH");
  }

  // 4. PUSH-UP / INCLINE PUSH-UP
  function renderPushUp(ctx, cx, cy, k, viewAngle) {
    var floorY = cy + 70;
    // k = 0: arms extended (high plank)
    // k = 1: chest near floor
    var chestDrop = k * 35;

    var headX = cx - 55;
    var headY = floorY - 48 + chestDrop;
    var shoulderX = cx - 35;
    var shoulderY = floorY - 42 + chestDrop;
    var hipX = cx + 20;
    var hipY = floorY - 32 + chestDrop * 0.7;
    var feetX = cx + 75;
    var feetY = floorY;

    // Mat
    ctx.fillStyle = "#1E293B";
    ctx.fillRect(cx - 75, floorY + 2, 160, 6);

    // Head
    drawHead(ctx, headX, headY, "side", false);

    // Body Line (Plank)
    ctx.strokeStyle = "#162035";
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.lineTo(hipX, hipY);
    ctx.lineTo(feetX, feetY);
    ctx.stroke();

    // Chest Glow
    ctx.fillStyle = `rgba(255, 77, 77, ${0.45 + k * 0.55})`;
    ctx.beginPath();
    ctx.arc(shoulderX + 5, shoulderY + 5, 10, 0, Math.PI * 2);
    ctx.fill();

    // Arms
    var handX = shoulderX + 5;
    var handY = floorY;
    var elbowX = shoulderX - 10 + k * 12;
    var elbowY = (shoulderY + handY) / 2 + k * 8;

    drawArmSegment(ctx, shoulderX, shoulderY, elbowX, elbowY, 7, true, k);
    drawArmSegment(ctx, elbowX, elbowY, handX, handY, 6, true, k);

    // Trajectory Arc
    var traj = [
      { x: shoulderX - 18, y: floorY - 42 },
      { x: shoulderX - 18, y: floorY - 7 }
    ];
    drawTrajectoryArc(ctx, traj, k, "FULL ROM");
  }

  // 5. OVERHEAD PRESS / ARNOLD PRESS
  function renderOverheadPress(ctx, cx, cy, k, viewAngle) {
    var athleteY = cy + 20;
    var floorY = cy + 105;
    var shoulderY = athleteY - 45;
    var torsoW = 38;
    var torsoH = 50;

    // Head
    drawHead(ctx, cx, shoulderY - 14, viewAngle, false);

    // Torso
    drawMuscularTorso(ctx, cx, shoulderY, torsoW, torsoH, "shoulders", k, viewAngle);

    // Legs
    drawMuscularLegs(ctx, cx, shoulderY + torsoH, cx - 12, athleteY + 45, cx - 14, floorY, cx + 12, athleteY + 45, cx + 14, floorY, "legs", 0);

    // Barbell / Dumbbell Press Height:
    // k = 0: at clavicles (shoulderY - 4)
    // k = 1: full overhead lockout (shoulderY - 60)
    var barY = shoulderY - 4 - k * 56;

    // Arms
    var lsX = cx - torsoW / 2;
    var rsX = cx + torsoW / 2;
    var elbowY = (shoulderY + barY) / 2 + (1 - k) * 12;
    var leX = lsX - 14 * (1 - k);
    var reX = rsX + 14 * (1 - k);
    var lhX = lsX - 4;
    var rhX = rsX + 4;

    drawDeltoidCap(ctx, lsX, shoulderY + 4, 8, true, k);
    drawDeltoidCap(ctx, rsX, shoulderY + 4, 8, true, k);

    drawArmSegment(ctx, lsX, shoulderY + 4, leX, elbowY, 7, true, k);
    drawArmSegment(ctx, leX, elbowY, lhX, barY, 6, true, k);

    drawArmSegment(ctx, rsX, shoulderY + 4, reX, elbowY, 7, true, k);
    drawArmSegment(ctx, reX, elbowY, rhX, barY, 6, true, k);

    // Barbell
    drawBarbell(ctx, cx, barY, 120, k > 0.85);

    // Trajectory
    var traj = [
      { x: cx + 45, y: shoulderY - 4 },
      { x: cx + 45, y: shoulderY - 60 }
    ];
    drawTrajectoryArc(ctx, traj, k, "OVERHEAD");
  }

  // 6. BICEP CURL
  function renderBicepCurl(ctx, cx, cy, k, viewAngle) {
    var athleteY = cy + 20;
    var floorY = cy + 105;
    var shoulderY = athleteY - 45;
    var torsoW = 38;
    var torsoH = 50;

    drawHead(ctx, cx, shoulderY - 14, viewAngle, false);
    drawMuscularTorso(ctx, cx, shoulderY, torsoW, torsoH, "biceps", k, viewAngle);
    drawMuscularLegs(ctx, cx, shoulderY + torsoH, cx - 12, athleteY + 45, cx - 14, floorY, cx + 12, athleteY + 45, cx + 14, floorY, "legs", 0);

    // Fixed elbows at ribs
    var lsX = cx - torsoW / 2;
    var rsX = cx + torsoW / 2;
    var elbowY = shoulderY + 36;
    var leX = lsX - 4;
    var reX = rsX + 4;

    // Curl angle:
    // k = 0: arms down (lhY = elbowY + 36)
    // k = 1: weights at anterior delts (lhY = shoulderY + 6)
    var curlAngle = k * Math.PI * 0.75;
    var forearmLen = 32;
    var lhX = leX - Math.sin(curlAngle) * 14;
    var lhY = elbowY + Math.cos(curlAngle) * forearmLen;
    var rhX = reX + Math.sin(curlAngle) * 14;
    var rhY = elbowY + Math.cos(curlAngle) * forearmLen;

    // Biceps Glow
    drawArmSegment(ctx, lsX, shoulderY + 4, leX, elbowY, 7.5, true, k);
    drawArmSegment(ctx, leX, elbowY, lhX, lhY, 6.5, false, 0);

    drawArmSegment(ctx, rsX, shoulderY + 4, reX, elbowY, 7.5, true, k);
    drawArmSegment(ctx, reX, elbowY, rhX, rhY, 6.5, false, 0);

    drawDumbbell(ctx, lhX, lhY, 0, k > 0.8);
    drawDumbbell(ctx, rhX, rhY, 0, k > 0.8);

    // Trajectory Arc
    var curlArc = [
      { x: reX + 4, y: elbowY + forearmLen },
      { cx: reX + 24, cy: elbowY + forearmLen * 0.5, x: reX + 10, y: shoulderY + 8 }
    ];
    drawTrajectoryArc(ctx, curlArc, k, "PEAK BICEP");
  }

  // 7. PULL-UP / LAT PULLDOWN
  function renderPullUp(ctx, cx, cy, k, viewAngle) {
    var barY = cy - 65;
    // Overhead Pull-up Bar
    ctx.strokeStyle = "#94A3B8";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 70, barY);
    ctx.lineTo(cx + 70, barY);
    ctx.stroke();

    // Support brackets
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 55, barY);
    ctx.lineTo(cx - 55, barY - 30);
    ctx.moveTo(cx + 55, barY);
    ctx.lineTo(cx + 55, barY - 30);
    ctx.stroke();

    // Body Elevation:
    // k = 0: dead hang (body low)
    // k = 1: chin over bar (body high)
    var pullUpRise = k * 45;
    var shoulderY = barY + 55 - pullUpRise;
    var torsoW = 38;
    var torsoH = 48;

    // Hands glued to bar
    var lhX = cx - 45;
    var rhX = cx + 45;

    // Head
    drawHead(ctx, cx, shoulderY - 14, viewAngle, false);

    // Torso (Lats Glowing!)
    drawMuscularTorso(ctx, cx, shoulderY, torsoW, torsoH, "back", k, viewAngle);

    // Crossed Legs hanging
    drawMuscularLegs(ctx, cx, shoulderY + torsoH, cx - 8, shoulderY + torsoH + 35, cx - 4, shoulderY + torsoH + 65, cx + 8, shoulderY + torsoH + 35, cx + 4, shoulderY + torsoH + 65, "legs", 0);

    // Arms pulling
    var lsX = cx - torsoW / 2;
    var rsX = cx + torsoW / 2;
    var elbowY = (shoulderY + barY) / 2 + k * 8;
    var leX = lsX - 12 - (1 - k) * 6;
    var reX = rsX + 12 + (1 - k) * 6;

    drawArmSegment(ctx, lsX, shoulderY + 4, leX, elbowY, 8, true, k);
    drawArmSegment(ctx, leX, elbowY, lhX, barY, 6.5, true, k);

    drawArmSegment(ctx, rsX, shoulderY + 4, reX, elbowY, 8, true, k);
    drawArmSegment(ctx, reX, elbowY, rhX, barY, 6.5, true, k);

    // Trajectory
    var traj = [
      { x: cx + 38, y: barY + 55 },
      { x: cx + 38, y: barY + 10 }
    ];
    drawTrajectoryArc(ctx, traj, k, "CHIN OVER BAR");
  }

  // 8. GLUTE BRIDGE / HIP THRUST
  function renderGluteBridge(ctx, cx, cy, k, viewAngle) {
    var floorY = cy + 70;
    // Mat
    ctx.fillStyle = "#1E293B";
    ctx.fillRect(cx - 75, floorY + 2, 160, 6);

    // Hip Thrust Elevation:
    // k = 0: hips on floor
    // k = 1: full glute lock (straight line from shoulder to knee)
    var thrustH = k * 40;

    var shoulderX = cx - 55;
    var shoulderY = floorY - 8;
    var hipX = cx - 10;
    var hipY = floorY - 8 - thrustH;
    var kneeX = cx + 35;
    var kneeY = floorY - 32;
    var footX = cx + 38;
    var footY = floorY;

    // Head on mat
    drawHead(ctx, shoulderX - 16, shoulderY - 4, "side", false);

    // Upper Back & Torso
    ctx.strokeStyle = "#162035";
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.lineTo(hipX, hipY);
    ctx.lineTo(kneeX, kneeY);
    ctx.lineTo(footX, footY);
    ctx.stroke();

    // Glute Glowing Peak
    ctx.fillStyle = `rgba(255, 77, 77, ${0.45 + k * 0.55})`;
    ctx.beginPath();
    ctx.arc(hipX, hipY, 11, 0, Math.PI * 2);
    ctx.fill();

    // Arms resting on floor
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.lineTo(shoulderX + 35, floorY);
    ctx.stroke();

    // Trajectory
    var traj = [
      { x: hipX, y: floorY - 8 },
      { x: hipX, y: floorY - 48 }
    ];
    drawTrajectoryArc(ctx, traj, k, "GLUTE LOCK");
  }

  // 9. LUNGE / BULGARIAN SPLIT SQUAT
  function renderLunge(ctx, cx, cy, k, viewAngle) {
    var floorY = cy + 105;
    var lungeDrop = k * 35;

    var hipX = cx;
    var hipY = cy + 15 + lungeDrop;
    var shoulderY = hipY - 48;

    // Head & Torso
    drawHead(ctx, cx, shoulderY - 14, "side", false);
    drawMuscularTorso(ctx, cx, shoulderY, 32, 48, "legs", k, "side");

    // Front Leg (90° knee bend)
    var frontKneeX = cx + 30;
    var frontKneeY = floorY - 38 + lungeDrop * 0.4;
    var frontFootX = cx + 32;
    var frontFootY = floorY;

    // Back Leg (knee drops to 1 inch above floor)
    var backKneeX = cx - 28;
    var backKneeY = floorY - 12 - (1 - k) * 26;
    var backFootX = cx - 45;
    var backFootY = floorY;

    drawMuscularLegs(ctx, hipX, hipY, frontKneeX, frontKneeY, frontFootX, frontFootY, backKneeX, backKneeY, backFootX, backFootY, "legs", k);

    // Trajectory
    var traj = [
      { x: cx + 45, y: cy - 20 },
      { x: cx + 45, y: cy + 15 }
    ];
    drawTrajectoryArc(ctx, traj, k, "90° KNEE");
  }

  // 10. PLANK & CORE STABILITY
  function renderPlank(ctx, cx, cy, k, viewAngle) {
    var floorY = cy + 70;
    // Mat
    ctx.fillStyle = "#1E293B";
    ctx.fillRect(cx - 75, floorY + 2, 160, 6);

    // Rigid Straight Plank
    var headX = cx - 55;
    var headY = floorY - 32;
    var shoulderX = cx - 35;
    var shoulderY = floorY - 28;
    var hipX = cx + 18;
    var hipY = floorY - 26;
    var feetX = cx + 75;
    var feetY = floorY;

    drawHead(ctx, headX, headY, "side", false);

    // Torso Plank
    ctx.strokeStyle = "#162035";
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.lineTo(hipX, hipY);
    ctx.lineTo(feetX, feetY);
    ctx.stroke();

    // Forearms on ground
    ctx.strokeStyle = "#38BDF8";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.lineTo(shoulderX, floorY);
    ctx.lineTo(shoulderX + 22, floorY);
    ctx.stroke();

    // Dynamic Core Tension Pulse
    ctx.fillStyle = `rgba(255, 77, 77, ${0.4 + Math.sin(Date.now() / 250) * 0.35})`;
    ctx.shadowColor = "#FF4D4D";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.ellipse(cx - 5, hipY, 20, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // 11. CALF RAISE
  function renderCalfRaise(ctx, cx, cy, k, viewAngle) {
    var floorY = cy + 105;
    // Heel Elevation:
    // k = 0: flat on floor
    // k = 1: up on tiptoes (calves clenched)
    var ankleElevation = k * 25;
    var hipY = cy + 15 - ankleElevation;
    var shoulderY = hipY - 48;

    drawHead(ctx, cx, shoulderY - 14, viewAngle, false);
    drawMuscularTorso(ctx, cx, shoulderY, 38, 48, "legs", 0, viewAngle);

    // Legs standing, elevating ankles
    var kneeY = floorY - 40 - ankleElevation * 0.9;
    var ankleY = floorY - ankleElevation;

    drawMuscularLegs(ctx, cx, hipY, cx - 12, kneeY, cx - 14, ankleY, cx + 12, kneeY, cx + 14, ankleY, "legs", k);

    // Glowing Calves
    ctx.fillStyle = `rgba(255, 77, 77, ${0.45 + k * 0.55})`;
    ctx.beginPath();
    ctx.arc(cx - 14, kneeY + 16, 7, 0, Math.PI * 2);
    ctx.arc(cx + 14, kneeY + 16, 7, 0, Math.PI * 2);
    ctx.fill();

    // Trajectory
    var traj = [
      { x: cx + 35, y: floorY },
      { x: cx + 35, y: floorY - 25 }
    ];
    drawTrajectoryArc(ctx, traj, k, "TIPTOE PEAK");
  }

  // 12. UNIVERSAL FALLBACK KINEMATIC
  // Renders any other exercise with proper joint kinetics, motion vector, and target muscle glow
  function renderUniversalFallback(ctx, cx, cy, k, viewAngle, exDetails) {
    var cat = (exDetails && exDetails.category) || "general";
    if (cat === "chest") {
      renderPushUp(ctx, cx, cy, k, viewAngle);
    } else if (cat === "back") {
      renderPullUp(ctx, cx, cy, k, viewAngle);
    } else if (cat === "shoulders") {
      renderLateralRaise(ctx, cx, cy, k, viewAngle);
    } else if (cat === "biceps") {
      renderBicepCurl(ctx, cx, cy, k, viewAngle);
    } else if (cat === "legs") {
      renderSquat(ctx, cx, cy, k, viewAngle);
    } else if (cat === "glutes") {
      renderGluteBridge(ctx, cx, cy, k, viewAngle);
    } else if (cat === "core") {
      renderPlank(ctx, cx, cy, k, viewAngle);
    } else {
      renderSquat(ctx, cx, cy, k, viewAngle);
    }
  }

  // Draw Full Anatomical Muscle Heatmap View
  function drawAnatomicalMuscleMap(ctx, width, height, primaryMuscle, secondaryMuscle) {
    ctx.save();
    var cx = width / 2;
    var cy = height / 2 - 10;

    // High tech anatomical silhouette
    ctx.fillStyle = "#0F1626";
    ctx.strokeStyle = "rgba(59, 130, 246, 0.3)";
    ctx.lineWidth = 1.5;

    // Head
    ctx.beginPath();
    ctx.arc(cx, cy - 70, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Torso outline
    ctx.beginPath();
    ctx.moveTo(cx - 32, cy - 50);
    ctx.lineTo(cx + 32, cy - 50);
    ctx.lineTo(cx + 20, cy + 15);
    ctx.lineTo(cx - 20, cy + 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Arms
    ctx.fillRect(cx - 46, cy - 45, 12, 60);
    ctx.fillRect(cx + 34, cy - 45, 12, 60);

    // Legs
    ctx.fillRect(cx - 18, cy + 20, 15, 75);
    ctx.fillRect(cx + 3, cy + 20, 15, 75);

    // Glowing Target Muscles
    var pm = (primaryMuscle || "").toLowerCase();
    
    // Pecs / Chest
    if (pm.includes("pec") || pm.includes("chest")) {
      ctx.fillStyle = "#FF4D4D";
      ctx.shadowColor = "#FF4D4D";
      ctx.shadowBlur = 16;
      ctx.fillRect(cx - 24, cy - 42, 21, 20);
      ctx.fillRect(cx + 3, cy - 42, 21, 20);
    }
    // Deltoids / Shoulders
    else if (pm.includes("delt") || pm.includes("shoulder")) {
      ctx.fillStyle = "#FF4D4D";
      ctx.shadowColor = "#FF4D4D";
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(cx - 32, cy - 46, 12, 0, Math.PI * 2);
      ctx.arc(cx + 32, cy - 46, 12, 0, Math.PI * 2);
      ctx.fill();
    }
    // Lats / Back
    else if (pm.includes("lat") || pm.includes("back") || pm.includes("rhomboid")) {
      ctx.fillStyle = "#FF4D4D";
      ctx.shadowColor = "#FF4D4D";
      ctx.shadowBlur = 16;
      ctx.fillRect(cx - 30, cy - 35, 10, 32);
      ctx.fillRect(cx + 20, cy - 35, 10, 32);
    }
    // Quads / Legs
    else if (pm.includes("quad") || pm.includes("leg") || pm.includes("squat")) {
      ctx.fillStyle = "#FF4D4D";
      ctx.shadowColor = "#FF4D4D";
      ctx.shadowBlur = 16;
      ctx.fillRect(cx - 18, cy + 22, 15, 38);
      ctx.fillRect(cx + 3, cy + 22, 15, 38);
    }
    // Glutes
    else if (pm.includes("glute") || pm.includes("hip")) {
      ctx.fillStyle = "#FF4D4D";
      ctx.shadowColor = "#FF4D4D";
      ctx.shadowBlur = 16;
      ctx.fillRect(cx - 18, cy + 12, 36, 18);
    }
    // Biceps
    else if (pm.includes("bicep") || pm.includes("arm")) {
      ctx.fillStyle = "#FF4D4D";
      ctx.shadowColor = "#FF4D4D";
      ctx.shadowBlur = 16;
      ctx.fillRect(cx - 46, cy - 32, 12, 25);
      ctx.fillRect(cx + 34, cy - 32, 12, 25);
    }
    // Triceps
    else if (pm.includes("tricep")) {
      ctx.fillStyle = "#FF4D4D";
      ctx.shadowColor = "#FF4D4D";
      ctx.shadowBlur = 16;
      ctx.fillRect(cx - 46, cy - 32, 12, 25);
      ctx.fillRect(cx + 34, cy - 32, 12, 25);
    }
    // Core / Abs
    else {
      ctx.fillStyle = "#FF4D4D";
      ctx.shadowColor = "#FF4D4D";
      ctx.shadowBlur = 16;
      ctx.fillRect(cx - 12, cy - 20, 24, 30);
    }

    // Callout Badges
    ctx.shadowBlur = 0;
    ctx.font = "bold 11px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "#FF4D4D";
    ctx.textAlign = "center";
    ctx.fillText("PRIMARY: " + (primaryMuscle || "Target Muscle"), cx, height - 26);

    ctx.font = "10px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "#38BDF8";
    ctx.fillText("SECONDARY: " + (secondaryMuscle || "Stabilizers"), cx, height - 10);

    ctx.restore();
  }

  // Master Render Function
  function renderExerciseScene(canvas, exDetails, timeSec, viewAngle) {
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;

    // Reset & clear
    ctx.clearRect(0, 0, width, height);

    // Studio Gradient Background
    var grad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, width * 0.7);
    grad.addColorStop(0, "#101626");
    grad.addColorStop(1, "#07090F");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Muscle Map special view
    if (viewAngle === "muscles") {
      drawAnatomicalMuscleMap(ctx, width, height, exDetails.muscle, exDetails.secondary);
      return;
    }

    var cx = width / 2;
    var cy = height / 2;

    // Draw Studio Pedestal
    drawStudioPedestal(ctx, cx, cy, width, height, viewAngle);

    // Calculate Kinematic State
    var state = calculateKinematicState(timeSec, 6.0);
    var k = state.k;

    // Render based on kinematic type
    var kin = (exDetails && exDetails.kinematic) || "squat";
    if (kin === "lateral_raise") {
      renderLateralRaise(ctx, cx, cy, k, viewAngle);
    } else if (kin === "bench_press" || kin === "incline_press") {
      renderBenchPress(ctx, cx, cy, k, viewAngle);
    } else if (kin === "squat" || kin === "sumo_squat") {
      renderSquat(ctx, cx, cy, k, viewAngle);
    } else if (kin === "push_up" || kin === "incline_push_up") {
      renderPushUp(ctx, cx, cy, k, viewAngle);
    } else if (kin === "overhead_press" || kin === "arnold_press") {
      renderOverheadPress(ctx, cx, cy, k, viewAngle);
    } else if (kin === "bicep_curl" || kin === "hammer_curl") {
      renderBicepCurl(ctx, cx, cy, k, viewAngle);
    } else if (kin === "pull_up" || kin === "lat_pulldown") {
      renderPullUp(ctx, cx, cy, k, viewAngle);
    } else if (kin === "glute_bridge" || kin === "hip_thrust") {
      renderGluteBridge(ctx, cx, cy, k, viewAngle);
    } else if (kin === "lunge") {
      renderLunge(ctx, cx, cy, k, viewAngle);
    } else if (kin === "plank" || kin === "dead_bug" || kin === "bird_dog") {
      renderPlank(ctx, cx, cy, k, viewAngle);
    } else if (kin === "calf_raise") {
      renderCalfRaise(ctx, cx, cy, k, viewAngle);
    } else {
      renderUniversalFallback(ctx, cx, cy, k, viewAngle, exDetails);
    }
  }

  // Export to global scope
  global.calculateKinematicState = calculateKinematicState;
  global.renderExerciseScene = renderExerciseScene;

})(typeof window !== "undefined" ? window : this);
