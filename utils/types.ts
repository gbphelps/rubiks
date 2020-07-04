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