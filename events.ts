import { globals } from './globals';

interface Vec2 {
    x: number;
    y: number;
}

const action: false | any = false;

const events: Record<string, false | MouseEvent> = {
    mousemove: false,
    mousedown: false,
    mouseup: false,
}

function assign(key: string) {
    return function(e: MouseEvent) {
        events[key] = e;
    }
}

export function extractScreenCoords(e: MouseEvent) {
    const { container } = globals;
    const { top: y0, left: x0, height, width } = container.getBoundingClientRect();

    const x = ((e.clientX - x0) - width/2)/globals.pixPerUnit;
    const y = (height/2 - (e.clientY - y0))/globals.pixPerUnit;
    
    return { x, y };
}

export function init(){
    const { container } = globals;     
    container.addEventListener('mousemove', assign('mousemove')); 
    container.addEventListener('mousedown', assign('mousedown'));
    container.addEventListener('mouseup', assign('mouseup'));
}

export function drain(key: string) {
    const result = events[key];
    events[key] = false;
    return result;
}

export function peek(key: string){
    return !!events[key];
}