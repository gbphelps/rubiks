import { globals } from './globals';

interface Vec2 {
    x: number;
    y: number;
}

export const controls: Record<string, false | Vec2> = {
    click: false,
    mouse: false,
}

function getMode(){

}

function assign(key: string) {
    return function(e: MouseEvent) {
        const { container } = globals;
        const { top: y0, left: x0, height, width } = container.getBoundingClientRect();

        const x = ((e.clientX - x0) - width/2)/globals.pixPerUnit;
        const y = (height/2 - (e.clientY - y0))/globals.pixPerUnit;
        
        controls[key] = { x, y };
    }
}


export function init(){
    const { container } = globals;
      
    container.addEventListener('mousemove', assign('mouse')); 
    container.addEventListener('mousedown', assign('click'));

    container.addEventListener('mouseup',() => {
        controls.click = false;
    }) 

}