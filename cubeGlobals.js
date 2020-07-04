function X(m1,m2){
    const result = [];
    for (let i=0; i<m1.length; i++){
        const r = [];
        for (let j=0; j<m2[0].length; j++){
            r.push(null);
        }
        result.push(r);
    }

    if (m1[0].length !== m2.length) throw new Error('dimensional mismatch');

    for (let row = 0; row < m1.length; row++){
        for (let col = 0; col < m2[0].length; col++){
            let sum = 0;
            for (let k=0; k < m1[0].length; k++){
                sum += m1[row][k]*m2[k][col];
            }
            result[row][col] = sum;
        }
    }
    return result;
}

function Rx(t){ 
    return [
        [1, 0, 0],
        [0, Math.cos(t), -Math.sin(t)],
        [0, Math.sin(t), Math.cos(t)],
    ]
}

function Ry(t){ 
    return [
        [Math.cos(t), 0, Math.sin(t)],
        [0, 1, 0],
        [-Math.sin(t), 0, Math.cos(t)],
    ]
}

function Rz(t){ 
    return [
        [Math.cos(t), -Math.sin(t), 0],
        [Math.sin(t), Math.cos(t), 0],
        [0, 0, 1],
    ]
}

let mx = [
    [1,0,0],
    [0,1,0],
    [0,0,1],
]

let inv = [
    [1,0,0],
    [0,1,0],
    [0,0,1]
]

function rotate(tx, ty, tz){
    const rx = X(Rx(tx),mx);
    const ry = X(Ry(ty),rx);
    const rz = X(Rz(tz),ry);
    mx = rz;

    const ix = X(inv, Rx(-tx));
    const iy = X(ix, Ry(-ty));
    const iz = X(iy, Rz(-tz));
    inv = iz;

    console.log(mx, inv);
    console.log(X(mx, inv));
}