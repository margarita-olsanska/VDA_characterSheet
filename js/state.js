export const STATES = {
	CREATE: "create",
	FREEBIE: "freebie",
	EDIT: "edit",
	VIEW: "view"
}

export let currentState = STATES.VIEW

export function setState(newState){
	currentState = newState
	console.log("SET STATE:", currentState)
}

export function getState(){
	return currentState
}