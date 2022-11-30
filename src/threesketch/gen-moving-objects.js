class MovingObject {
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

export function genMovingObjects(numMovingObjects) {
  const res = []
  for (let i = 0; i < numMovingObjects; i++) {
    const fx = genFunction()
    const fy = genFunction()
    const fz = genFunction()
    res.push(new MovingObject(fx, fy, fz))
  }
  return res
}
