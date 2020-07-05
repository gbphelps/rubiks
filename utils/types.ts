export type Side = 'bottom' | 'top' | 'left' | 'right' | 'back' | 'front';
export interface Face {
    side: Side,
    color: THREE.Color,
}
export interface Vec3 {
    x: number,
    y: number,
    z: number
}

export interface Vec2 {
    x: number,
    y: number,
}

export interface ProjectionData {
    dist2: number, 
    point: Vec3, 
    side: Side, 
    cubeCoords: Vec3,
    boxRegistryNode: Vec3,
}

export const sides: Side[] = ['top', 'bottom', 'back', 'front', 'left', 'right'];