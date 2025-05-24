// === Constants ===
const AU = 1.496e11;          // Astronomical Unit in metres
const HOUR = 3600;             // Seconds in one hour

// === Planet class ===
class Planet {
  /**
   * All positions (x, y) and velocities (vx, vy) are stored **in metres / m s⁻¹**
   * drawRadius is in **pixels** so we can keep the planets visible even though
   * their real‐world radii would be sub‑pixel on screen.
   */
  constructor (name, x, y, vx, vy, mass, drawRadius, col) {
    this.name       = name;
    this.pos        = createVector(x, y);          // m
    this.vel        = createVector(vx, vy);        // m s⁻¹
    this.mass       = mass;                        // kg
    this.drawRadius = drawRadius;                  // px (purely visual)
    this.col        = col;

    this.trail = [];
    this.maxTrailLength = 300;
  }

  // Physics update (called by SolarSystem)
  applyAcceleration (ax, ay, dt) {
    this.vel.x += ax * dt;   // m s⁻¹
    this.vel.y += ay * dt;
  }

  step (dt) {
    this.pos.x += this.vel.x * dt; // m
    this.pos.y += this.vel.y * dt;

    // Store a copy in screen space for the trail
    this.trail.push(createVector(this.pos.x * solarSystem.scale,
                                 this.pos.y * solarSystem.scale));
    if (this.trail.length > this.maxTrailLength) this.trail.shift();
  }

  display () {
    const sx = this.pos.x * solarSystem.scale; // convert m → px
    const sy = this.pos.y * solarSystem.scale;

    // --- trail ---
    noFill();
    stroke(this.col);
    strokeWeight(1);
    beginShape();
    for (let v of this.trail) vertex(v.x, v.y);
    endShape();

    // --- body ---
    noStroke();
    fill(this.col);
    ellipse(sx, sy, this.drawRadius * 2);

    // --- name on hover ---
    if (dist(mouseX - width / 2, mouseY - height / 2, sx, sy) < this.drawRadius + 10) {
      fill(255);
      textAlign(CENTER, BOTTOM);
      text(this.name, sx, sy - this.drawRadius - 4);
    }
  }
}

// === Solar‑system container ===
class SolarSystem {
  constructor(scalePxPerM, dt) {
    this.scale = scalePxPerM; // px m⁻¹
    this.dt    = dt;          // seconds per frame
    this.G     = 6.67430e-11; // m³ kg⁻¹ s⁻²
    this.bodies = [];
  }

  addBody (planet) { this.bodies.push(planet); }

  update () {
    // Calculate accelerations for every body (n² loop is fine for a few planets)
    for (let i = 0; i < this.bodies.length; i++) {
      const p1 = this.bodies[i];
      let ax = 0, ay = 0;

      for (let j = 0; j < this.bodies.length; j++) {
        if (i === j) continue;
        const p2 = this.bodies[j];

        const dx = p2.pos.x - p1.pos.x; // m
        const dy = p2.pos.y - p1.pos.y; // m
        const r2 = dx * dx + dy * dy;   // m²
        const r  = sqrt(r2);

        const a = this.G * p2.mass / r2; // m s⁻² (magnitude)
        ax += a * dx / r;                // project onto x
        ay += a * dy / r;                // project onto y
      }

      p1.applyAcceleration(ax, ay, this.dt);
    }

    // Now move the bodies with their updated velocities
    for (let b of this.bodies) b.step(this.dt);
  }

  draw () {
    // Draw Sun first (it is always the first body we add)
    push();
    const sun = this.bodies[0];
    noStroke();
    fill(sun.col);
    ellipse(0, 0, sun.drawRadius * 2);
    fill(0);
    textAlign(CENTER, BOTTOM);
    text("Sun", 0, -sun.drawRadius - 4);
    pop();

    // Planets
    for (let i = 1; i < this.bodies.length; i++) this.bodies[i].display();
  }
}

// === Global vars ===
let solarSystem;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('monospace');

  // 120 pixels ≈ 1 AU so the orbits fit comfortably on screen
  const scale = 120 / AU;        // px m⁻¹
  const dt    = HOUR * 3;        // 3‑hour steps
  solarSystem = new SolarSystem(scale, dt);

  // --- Sun (kept at origin) ---
  solarSystem.addBody(new Planet(
    "Sun",
    0, 0,
    0, 0,
    1.989e30,
    18,               // draw radius (px)
    color(255, 210, 0)
  ));

  // --- Mercury ---
  solarSystem.addBody(new Planet(
    "Mercury",
    0.387 * AU, 0,              // x m, y m
    0, -47.36e3,                // vx m s⁻¹, vy m s⁻¹ (negative y = upward in p5)
    0.33011e24,                // kg
    5,                         // draw radius (px)
    color(200, 150, 100)
  ));

  // === Venus ===
solarSystem.addBody(new Planet(
  "Venus",
  0.723 * AU, 0,
  0, -35.02e3,
  4.867e24,
  7,
  color(230, 200, 160)
));

// === Earth ===
solarSystem.addBody(new Planet(
  "Earth",
  1.0 * AU, 0,
  0, -29.78e3,
  5.972e24,
  8,
  color(100, 150, 255)
));

// === Mars ===
solarSystem.addBody(new Planet(
  "Mars",
  1.524 * AU, 0,
  0, -24.077e3,
  0.64171e24,
  6,
  color(255, 100, 80)
));

// === Jupiter ===
solarSystem.addBody(new Planet(
  "Jupiter",
  5.204 * AU, 0,
  0, -13.07e3,
  1.898e27,
  14,
  color(200, 150, 120)
));

// === Saturn ===
solarSystem.addBody(new Planet(
  "Saturn",
  9.582 * AU, 0,
  0, -9.68e3,
  5.683e26,
  12,
  color(210, 180, 140)
));

// === Uranus ===
solarSystem.addBody(new Planet(
  "Uranus",
  19.201 * AU, 0,
  0, -6.8e3,
  8.681e25,
  10,
  color(160, 200, 255)
));

// === Neptune ===
solarSystem.addBody(new Planet(
  "Neptune",
  30.047 * AU, 0,
  0, -5.43e3,
  1.024e26,
  10,
  color(100, 150, 255)
));


  // You can add more planets here (Earth, Venus, etc.) following the same pattern
}

function draw() {
  background(0);
  translate(width / 2, height / 2); // centre of canvas is (0, 0)

  solarSystem.update();
  solarSystem.draw();
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
