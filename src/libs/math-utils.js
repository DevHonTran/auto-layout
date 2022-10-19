const LineEq = (
    y2,
    y1,
    x2,
    x1,
    currentVal
) => {
    const m = (y2 - y1) / (x2 - x1);
    const b = y1 - m * x1;
    return m * currentVal + b;
};

const MathMap = (
    x,
    a,
    b,
    c,
    d
) => {
    return parseFloat((((x - a) * (d - c)) / (b - a) + c).toFixed(3));
};

const MathMapVector3 = (
    point,
    a,
    b,
    c,
    d
) => {
    return {
        x: MathMap(point, a, b, c.x, d.x),
        y: MathMap(point, a, b, c.y, d.y),
        z: MathMap(point, a, b, c.z, d.z),
    };
};

const MathLerp = (a, b, n) => {
    return parseFloat(((1 - n) * a + n * b).toFixed(3));
};

const RandomFloat = (min, max) => {
    return parseFloat((Math.random() * (max - min) + min).toFixed(2));
};


const MathAround = (
    r,
    {x, y}
) => {
    const z = Math.sqrt(Math.pow(y, 2) + Math.pow(x, 2));
    const sin = y / z;
    const cos = x / z;

    return {
        x: cos * r,
        y: sin * r,
    };
};

const Radians =
    (degrees) => {
        return degrees * Math.PI / 180;
    }

const Distance =
    (x1, y1, x2, y2) => {
        return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
    }

const GetOffsetThreeJs = ({left, top, width, height, winSize}) => {
    return {
        x: (left - winSize.x / 2 + width / 2),
        y: (-top + winSize.y / 2 - height / 2)
    }
}

export {MathMap, MathMapVector3, MathLerp, RandomFloat, MathAround, LineEq, Radians, Distance, GetOffsetThreeJs};