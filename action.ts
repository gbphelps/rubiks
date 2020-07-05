
interface Action extends Record<any, any>{};

let action: Action | null = null;


export function getAction() {
    return action;
}

export function setAction(incomingAction: Record<string, any> | null) {
    action = incomingAction;
}