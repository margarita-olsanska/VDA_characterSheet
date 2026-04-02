import { character } from "./character.js"
import { getTraitValue, setTraitValue, getTraitType } from "./traits.js"

function sum(obj){
	return Object.values(obj).reduce((a,b) => a + b, 0)
}

function sumNested(obj){
	return Object.values(obj)
		.map(group => sum(group))
		.reduce((a,b) => a + b, 0)
}

function getAttributeTotals(){

	return {
		physical: sum(character.attributes.physical) - 3,
		social: sum(character.attributes.social) - 3,
		mental: sum(character.attributes.mental) - 3
	}
}

function getSortedAttributeCategories(){

	const totals = getAttributeTotals()

	return Object.entries(totals)
		.sort((a,b) => b[1] - a[1])
}

export function getAttributeLimits(){

	const sorted = getSortedAttributeCategories()

	return {
		[sorted[0][0]]: 7,
		[sorted[1][0]]: 5,
		[sorted[2][0]]: 3
	}
}

function findAttributeCategory(trait){

	for(const cat in character.attributes){
		if(character.attributes[cat][trait] !== undefined){
			return cat
		}
	}
}

function canIncreaseAttribute(trait){

	const category = findAttributeCategory(trait)
	const limits = getAttributeLimits()
	const totals = getAttributeTotals()

	return totals[category] < limits[category]
}

function getAbilityTotals(){

	return {
		talents: sum(character.abilities.talents),
		skills: sum(character.abilities.skills),
		knowledges: sum(character.abilities.knowledges)
	}
}

function getSortedAbilityCategories(){

	const totals = getAbilityTotals()

	return Object.entries(totals)
		.sort((a,b) => b[1] - a[1])
}

function getAbilityLimits(){

	const sorted = getSortedAbilityCategories()

	return {
		[sorted[0][0]]: 13,
		[sorted[1][0]]: 9,
		[sorted[2][0]]: 5
	}
}

function findAbilityCategory(trait){

	for(const cat in character.abilities){
		if(character.abilities[cat][trait] !== undefined){
			return cat
		}
	}
}

function canIncreaseAbility(trait, nextLevel){

	// max 3 pt per ability
	if(nextLevel > 3){
		return false
	}

	const category = findAbilityCategory(trait)
	const limits = getAbilityLimits()
	const totals = getAbilityTotals()

	return totals[category] < limits[category]
}

function sumDisciplines(){
	return Object.values(character.disciplines)
		.reduce((a,b) => a + (b.level || 0), 0)
}

function sumBackgrounds(){
	return Object.values(character.backgrounds)
		.reduce((a,b) => a + b, 0)
}

function sumVirtues(){
	return sum(character.virtues) - 3
}


function updateDerivedStats(){

	const conscience = character.virtues.virtue1
	const selfControl = character.virtues.virtue2
	const courage = character.virtues.virtue3

	// 🛤 дорога
	character.road.level = conscience + selfControl

	// 💪 воля
	character.willpower.max = courage

	if(character.willpower.current > courage){
		character.willpower.current = courage
	}
}

export function updateCreate(trait, clickedLevel){

	const current = getTraitValue(trait)
	const type = getTraitType(trait)


	if(type === "road" || type === "willpower"){
		return
	}

	let targetLevel = clickedLevel

	if(clickedLevel === current){
		targetLevel = current - 1
	}


	if(targetLevel > current){

		let allowed = true

		switch(type){

			case "attributes":
				allowed = canIncreaseAttribute(trait)
				break

			case "abilities":
				allowed = canIncreaseAbility(trait, targetLevel)
				break

			case "disciplines":
				allowed = sumDisciplines() < 4
				break

			case "backgrounds":
				allowed = sumBackgrounds() < 5
				break

			case "virtues":
				allowed = sumVirtues() < 7
				break
		}

		if(!allowed) return

		setTraitValue(trait, targetLevel)
	}

	if(targetLevel < current){
		setTraitValue(trait, targetLevel)
	}

	updateDerivedStats()
}