from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
from classes.solar_system import SolarSystem, CelestialBody

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client_simulations = {}
    
@app.middleware("http")
async def session_and_cors(request: Request, call_next):
    session_id = request.cookies.get("session_id")
    
    if not session_id:
        session_id = str(uuid4())

    request.state.session_id = session_id
    response = await call_next(request)
    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        samesite="None", 
        secure=True     
    )    
    return response



def create_new_simulation():
    sun = CelestialBody("Sun", 0, 0, 0, 0, 1.0)
    planets = [
        CelestialBody("Mercury", 0.39, 0, 0, 1.59, 1.65e-7),
        CelestialBody("Venus", 0.72, 0, 0, 1.18, 2.45e-6),
        CelestialBody("Earth", 1.0, 0, 0, 1.0, 3.0e-6),
        CelestialBody("Mars", 1.52, 0, 0, 0.81, 3.2e-7),
        CelestialBody("Jupiter", 5.20, 0, 0, 0.43, 9.5e-4),
        CelestialBody("Saturn", 9.58, 0, 0, 0.32, 2.85e-4),
        CelestialBody("Uranus", 19.18, 0, 0, 0.23, 4.4e-5),
        CelestialBody("Neptune", 30.07, 0, 0, 0.18, 5.15e-5),
    ]

    return SolarSystem(sun, *planets)


@app.post("/initialize")
async def initialize_simulation(request: Request):
    session_id = request.state.session_id
    client_simulations[session_id] = create_new_simulation()
    return {"message": "Simulation initialized"}

def get_simulation(request: Request):
    session_id = request.cookies.get("session_id")
    if not session_id or session_id not in client_simulations:
        raise HTTPException(status_code=401, detail="Session not initialized")
    return client_simulations[session_id]

@app.get("/bodies")
async def get_bodies(system: SolarSystem = Depends(get_simulation)):
    return system.get_bodies()


