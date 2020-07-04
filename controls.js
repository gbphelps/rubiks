import { globals } from './globals';

export const controls = {
    click: false,
    mouse: false,
}

function assign(key) {
    return function(e) {
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