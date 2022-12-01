class TimeMovingObject {
  constructor(fx, fy, fz) {
    this.fx = fx;
    this.fy = fy;
    this.fz = fz;
  }

  getPos(t) {
    return {
        x: this.fx(t),
        y: this.fy(t),
        z: this.fz(t),
    }
  }
}

class DiffrentialMovingObject {
  constructor(dx, dy, dz, x, y, z) {
    this.dx = dx;
    this.dy = dy;
    this.dz = dz;
    this.x = x;
    this.y = y;
    this.z = z;
  }

  getPos(dt) {
    return {
      x: x + this.dx(dt),
      y: y + this.dy(dt),
      z: z + this.dz(dt),
    }
  }
}

function rand(l, r) {
  return Math.random() * (r - l) + l
}


// gen a function with 2*PI period
function genFunction() {
  let angle = Math.random() * 2 * Math.PI
  let len = rand(0.2, 1)
  let a = Math.cos(angle) * len
  let b = Math.sin(angle) * len
  let o = Math.random() * 2 * Math.PI
  return (t) => {
      return a * Math.cos(t + o) + b * Math.sin(t + o)
  }
}

export function genTimeMovingObjects(numMovingObjects) {
  const res = []
  for (let i = 0; i < numMovingObjects; i++) {
    const fx = genFunction()
    const fy = genFunction()
    const fz = genFunction()
    res.push(new TimeMovingObject(fx, fy, fz))
  }
  return res
}
