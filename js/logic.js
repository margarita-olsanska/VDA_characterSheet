import { character } from "./character.js"
import { clans } from "./clans.js"
import { costs } from "./costs.js"
import { AppState } from "./state.js"
import { getTraitValue, setTraitValue, getTraitType, getTraitMin } from "./traits.js"
import { applyCreationUpgrade } from "./creationLogic.js"

export function fillClanDisciplines(){

	if(!character.clan) return

	const clan = clans[character.clan]
	if(!clan) return

	const clanDiscs = clan.disciplines

	let i = 0

	for(const slotKey of Object.keys(character.disciplines)){

		if(i >= clanDiscs.length) break

		const slot = character.disciplines[slotKey]
		slot.name = clanDiscs[i]
		slot.level = 0
		i++
	}
}

export function refundAllDisciplines(){

	let refund = 0

	for(const slotKey in character.disciplines){

		const slot = character.disciplines[slotKey]

		if(!slot || !slot.name || slot.level === 0) continue

		for(let lvl = 0; lvl < slot.level; lvl++){
			refund += costs.disciplines(lvl, slotKey)
		}

		// full reset
		slot.name = null
		slot.level = 0
	}

	character.xp += refund
}


export function applyUpgrade(trait, targetLevel) {

	if(character.state === AppState.CREATION){
		return applyCreationUpgrade(trait, targetLevel)
	}

	if(character.state === AppState.FREEBIE){
		return applyFreebieUpgrade(trait, targetLevel)
	}

	if(character.state === AppState.EDIT){
		return applyXPUpgrade(trait, targetLevel)
	}

	if(character.state === AppState.VIEW){
		return { success: false }
	}
}

export function applyXPUpgrade(trait, targetLevel){

	const current = getTraitValue(trait)
	const type = getTraitType(trait)

	// защита дисциплин
	if(type === "disciplines" && !character.disciplines[trait]?.name){
		return { success: false }
	}

	// clicking the currently topmost filled dot removes it
	if(targetLevel === current) targetLevel = Math.max(current - 1, getTraitMin(type))

	let totalCost = 0

	// 🔼 увеличение
	if(targetLevel > current){

		for(let lvl = current; lvl < targetLevel; lvl++){
			totalCost += costs[type](lvl, trait)
		}

		if(character.xp < totalCost){
			return { success: false }
		}

		character.xp -= totalCost
		setTraitValue(trait, targetLevel)
	}

	// 🔽 уменьшение (возврат XP)
	else if(targetLevel < current){

		for(let lvl = current - 1; lvl >= targetLevel; lvl--){
			totalCost += costs[type](lvl, trait)
		}

		character.xp += totalCost
		setTraitValue(trait, targetLevel)
	}

	return { success: true }
}

export function applyFreebieUpgrade(trait, targetLevel){

	const current = getTraitValue(trait)
	const type = getTraitType(trait)

	// защита дисциплин
	if(type === "disciplines" && !character.disciplines[trait]?.name){
		return { success: false }
	}

	// clicking the currently topmost filled dot removes it
	if(targetLevel === current) targetLevel = Math.max(current - 1, getTraitMin(type))

	let totalCost = 0

	// 🔼 увеличение
	if(targetLevel > current){

		for(let lvl = current; lvl < targetLevel; lvl++){
			totalCost += costs[type](lvl, trait) // можно позже заменить на freebie costs
		}

		if(character.freebie < totalCost){
			return { success: false }
		}

		character.freebie -= totalCost
		setTraitValue(trait, targetLevel)
	}

	// 🔽 уменьшение
	else if(targetLevel < current){

		for(let lvl = current - 1; lvl >= targetLevel; lvl--){
			totalCost += costs[type](lvl, trait)
		}

		character.freebie += totalCost
		setTraitValue(trait, targetLevel)
	}

	return { success: true }
}
