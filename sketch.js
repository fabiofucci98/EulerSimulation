let bodies = [];
let loading = true;
let error = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  initializeSimulation();
}

async function initializeSimulation() {
  try {
    const response = await fetch('http://localhost:8000/initialize', {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) throw new Error(`Init error: ${response.status}`);
    
  } catch (err) {
    error = err.message;
    console.error('Initialization error:', err);
  } finally {
    loading = false;
  }
}

async function fetchBodies() {
  try {
    const response = await fetch('http://localhost:8000/bodies', {
      method: 'GET',
      mode: 'cors', 
      credentials: 'include',  // This is correct - keep it
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Invalid response format");
    
    bodies = data;
    error = null;
  } catch (err) {
    error = err.message;
    console.error('Fetch error:', err);
  }
}

function draw() {
  background(0);

  if (loading) {
    drawLoading();
    return;
  }

  if (error) {
    drawError();
    return;
  }

  drawBodies();
  if(frameCount%3===0)
    fetchBodies();
}

function drawLoading() {
  fill(255);
  textSize(20);
  textAlign(CENTER, CENTER);
  text("Loading...", width / 2, height / 2);
}

function drawError() {
  fill(255, 0, 0);
  textSize(16);
  textAlign(CENTER, CENTER);
  text(`Error: ${error}`, width/2, height/2);
}

function drawBodies() {
  const centerX = width / 2;
  const centerY = height / 2;

  // Find max distance (in AU) from the Sun
  const maxDistance = Math.max(...bodies.map(b => Math.sqrt(b.x * b.x + b.y * b.y)));

  // Set scale based on canvas size and maxDistance
  const maxRadiusPixels = Math.min(width, height) / 2 ;
  const scale = maxRadiusPixels / maxDistance*2;

  bodies.forEach(body => {
    const x = centerX + body.x * scale;
    const y = centerY + body.y * scale;
    const size = map(log(body.m + 1), 0, 10, 5, 50);

    fill(255);
    noStroke();
    circle(x, y, size);

    fill(200);
    textSize(12);
  });
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function log(x) {
  return Math.log(x + 1);
}
