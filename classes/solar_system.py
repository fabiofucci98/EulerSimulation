from dataclasses import dataclass
from math import sqrt,pow 

@dataclass
class CelestialBody:
    name: str
    x: float
    y: float
    vx: float
    vy: float
    m: float


class SolarSystem:
    G: float = 1.0
    dt: float = .05

    def __init__(self, *bodies:CelestialBody):
        self.bodies = bodies

    def update(self):
        for i,body1 in enumerate(self.bodies):
            ax = 0
            ay = 0
            for j,body2 in enumerate(self.bodies):
                if i!=j:
                    dx = body2.x - body1.x
                    dy = body2.y - body1.y
                    distance = sqrt(pow(dx,2)+pow(dy,2))

                    ax += (body2.m*dx)/pow(distance,3)
                    ay += (body2.m*dy)/pow(distance,3)
                
            ax *= self.G
            ay *= self.G

            body1.vx += ax*self.dt
            body1.vy += ay*self.dt
            body1.x += body1.vx*self.dt
            body1.y += body1.vy*self.dt

    def get_bodies(self) -> list[dict]:
        self.update()
        return [
            {"name": body.name, "x": body.x, "y": body.y, "m":body.m}
            for body in self.bodies
        ]
        