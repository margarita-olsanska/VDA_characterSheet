import { character } from "./character.js"
import { clans } from "./clans.js"
import { costs } from "./costs.js"

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

	// 🔥 ВОТ СЮДА
	if(character.creation?.active){
		return applyCreationUpgrade(trait, targetLevel)
	}

	const current = getTraitValue(trait)
	const type = getTraitType(trait)

	let totalCost = 0

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

	if(targetLevel < current){
		// логика возврата XP
	}

	return { success: true }
}