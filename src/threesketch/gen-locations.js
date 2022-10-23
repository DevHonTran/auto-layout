export function generateRandomCoordinates(...params) {
    const numRocks = params[0]
    const maxDistance = params[1]
    const minDistance = params[2]
    const res = []
    let time = Date.now()
    while (res.length < numRocks) {
        let x = Math.random() * 2 - 1
        let y = Math.random() * 2 - 1
        let z = Math.random() * 2 - 1
        const distance = Math.sqrt(Math.random()) * maxDistance
        const ratio = distance / Math.sqrt(x * x + y * y + z * z)
        x = x * ratio
        y = y * ratio
        z = z * ratio
        let overlapped = false;
        for (const coordinate of res) {
            let xx = coordinate[0] - x
            let yy = coordinate[1] - y
            let zz = coordinate[2] - z
            if (Math.sqrt(xx * xx + yy * yy + zz * zz) < minDistance) {
                overlapped = true
                break
            }            
        }
        if (!overlapped) res.push([x * ratio, y * ratio, z * ratio])        
        if (Date.now() - time > 1000) {
            time = Date.now()
            console.log(res.length)
        }
    }
    return res
}
