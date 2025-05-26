const AU = 1.496e11;          // Astronomical Unit in metres
const HOUR = 3600;             // Seconds in one hour

class Planet {
  constructor(name, x, y, vx, vy, mass, drawRadius, col) {
    this.name = name;
    this.pos = createVector(x, y);          // m
    this.vel = createVector(vx, vy);        // m s⁻¹
    this.mass = mass;                        // kg
    this.drawRadius = drawRadius;                  // px (purely visual)
    this.col = col;

    this.trail = [];
    this.maxTrailLength = 300;
  }
}

class SolarSystem {
  constructor(scalePxPerM, dt) {
    this.scale = scalePxPerM; // px m⁻¹
    this.dt = dt;          // seconds per frame
    this.G = 6.67430e-11; // m³ kg⁻¹ s⁻²
    this.bodies = [];
  }

  addBody(planet) { this.bodies.push(planet); }

  update() {
    for (let i = 0; i < this.bodies.length; i++) {
      const p1 = this.bodies[i];
      let ax = 0, ay = 0;

      for (let j = 0; j < this.bodies.length; j++) {
        if (i === j) continue;
        const p2 = this.bodies[j];

        const dx = p2.pos.x - p1.pos.x; // m
        const dy = p2.pos.y - p1.pos.y; // m
        const r2 = dx * dx + dy * dy;   // m²
        const r = sqrt(r2);

        const a = this.G * p2.mass / r2; // m s⁻² (magnitude)
        ax += a * dx / r;                // project onto x
        ay += a * dy / r;                // project onto y
      }

      p1.vel.x += ax * this.dt;   // m s⁻¹
      p1.vel.y += ay * this.dt;

      p1.pos.x += p1.vel.x * this.dt; // m
      p1.pos.y += p1.vel.y * this.dt;

      if(i!==0){
        p1.trail.push(createVector(p1.pos.x * this.scale,
          p1.pos.y * this.scale));
        if (p1.trail.length > p1.maxTrailLength) p1.trail.shift();
      }

    }

  }



  draw() {

    let p, sx, sy;
    for (let i = 0; i < this.bodies.length; i++) {
      p = this.bodies[i];
      if (i===0) {
        fill(p.col);
        ellipse(0, 0, p.drawRadius * 2);
      } else {
        sx = p.pos.x * this.scale; // convert m → px
        sy = p.pos.y * this.scale;

        noFill();
        stroke(p.col);
        strokeWeight(1);
        beginShape();
        for (let v of p.trail) vertex(v.x, v.y);
        endShape();

        noStroke();
        fill(p.col);
        ellipse(sx, sy, p.drawRadius * 2);

        if (dist(mouseX - width / 2, mouseY - height / 2, sx, sy) < p.drawRadius + 10) {
          fill(255);
        }
      }
    }
  }
}
let solarSystem;

function setup() {
  createCanvas(windowWidth, windowHeight);

  const scale = 33 / AU;        // px m⁻¹
  const dt = HOUR * 3;        // 3‑hour steps
  solarSystem = new SolarSystem(scale, dt);

  solarSystem.addBody(new Planet(
    "Sun",
    0, 0,
    0, 0,
    1.989e30,
    10,               // draw radius (px)
    color(255, 210, 0)
  ));

  solarSystem.addBody(new Planet(
    "Mercury",
    0.387 * AU, 0,              // x m, y m
    0, -47.36e3,                // vx m s⁻¹, vy m s⁻¹ (negative y = upward in p5)
    0.33011e24,                // kg
    1,                         // draw radius (px)
    color(200, 150, 100)
  ));

  solarSystem.addBody(new Planet(
    "Venus",
    0.723 * AU, 0,
    0, -35.02e3,
    4.867e24,
    5,
    color(230, 200, 160)
  ));

  solarSystem.addBody(new Planet(
    "Earth",
    1.0 * AU, 0,
    0, -29.78e3,
    5.972e24,
    6,
    color(100, 150, 255)
  ));

  solarSystem.addBody(new Planet(
    "Mars",
    1.524 * AU, 0,
    0, -24.077e3,
    0.64171e24,
    4,
    color(255, 100, 80)
  ));

  solarSystem.addBody(new Planet(
    "Jupiter",
    5.204 * AU, 0,
    0, -13.07e3,
    1.898e27,
    6,
    color(200, 150, 120)
  ));

  solarSystem.addBody(new Planet(
    "Saturn",
    9.582 * AU, 0,
    0, -9.68e3,
    5.683e26,
    6,
    color(210, 180, 140)
  ));

  solarSystem.addBody(new Planet(
    "Uranus",
    19.201 * AU, 0,
    0, -6.8e3,
    8.681e25,
    8,
    color(160, 200, 255)
  ));

  solarSystem.addBody(new Planet(
    "Neptune",
    30.047 * AU, 0,
    0, -5.43e3,
    1.024e26,
    8,
    color(100, 150, 255)
  ));
}

function draw() {
  background(0);
  translate(width / 2, height / 2); // centre of canvas is (0, 0)

  solarSystem.update();
  solarSystem.draw();
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
