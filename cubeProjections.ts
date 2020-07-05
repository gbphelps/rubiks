import { Vec2, ProjectionData, sides, Side } from "./utils/types";
import { globals } from "./globals";
import { getPlane, rotation } from "./rotation";
import { X } from "./utils/matrix";

const ERR = 1e-8;

export function getProjectionOntoCube(screen: Vec2){
    // Recovering 3D position from 2D input is a system of three equations:
    
    // Point must be on this plane: 
    //      Ax + By + Cz + D = 0;

    // Two equations relating actualX and actualY to actualZ,
    // Using user-selected screen (a 3D coordinate projected onto the plane z=0),
    //      x = screen.x * (cam.p.z - z)/cam.p.z;
    //      y = screen.y * (cam.p.z - z)/cam.p.z;

    let best: null | ProjectionData = null;
    const { camera: {position: { z: camZ } } } = globals;

    sides.forEach(side => {
        const { cubeCoords, cameraCoords } = getProjectionOntoSide(screen, side);

        if (
            !(
                cubeCoords.x <= 1.5+ERR && cubeCoords.x >= -1.5-ERR &&
                cubeCoords.y <= 1.5+ERR && cubeCoords.y >= -1.5-ERR &&
                cubeCoords.z <= 1.5+ERR && cubeCoords.z >= -1.5-ERR
            )
        ) return;

        const dist2 = 
            cameraCoords.x*cameraCoords.x + 
            cameraCoords.y*cameraCoords.y + 
            (camZ-cameraCoords.z)*(camZ-cameraCoords.z);

        if (!best || dist2 < best.dist2){
            best = {
                cameraCoords, // pointCameraSpace: { x, y, z }, // location of point in camera space
                cubeCoords,  // location of point in cube space
                dist2,
                side,
            }
        }
    })
    return best;
}



export function getProjectionOntoSide(screen: Vec2, side: Side){
    const { A, B, C, D } = getPlane(side);
    const { camera: {position: { z: camZ } } } = globals;

    const MM = -(A*screen.x + B*screen.y)/camZ + C;
    const BB = A*screen.x + B*screen.y + D;

    const z = -BB/MM;
    const x = (camZ - z)/camZ * screen.x;
    const y = (camZ - z)/camZ * screen.y;
    const vec = X(rotation.inv, [[x],[y],[z],[1]]);

    return {
        cubeCoords: {
            x: vec[0][0],
            y: vec[1][0],
            z: vec[2][0],
        },
        cameraCoords: {
            x, y, z
        }
    }
}