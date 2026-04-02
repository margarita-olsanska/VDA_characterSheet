import { character } from "./character.js"
import { costs } from "./costs.js"
import { freebieCosts } from "./freebieCosts.js"
import { getTraitValue, getTraitType } from "./traits.js"
import { getState, STATES } from "./state.js"
import { generationData } from "./generation.js"


function getAttributeProgress(){

	const physical = sum(character.attributes.physical) - 3
	const social = sum(character.attributes.social) - 3
	const mental = sum(character.attributes.mental) - 3

	const values = [physical, social, mental].sort((a,b)=>b-a)

	const correct = [7,5,3]

	const ok = values.every((v,i) => v === correct[i])

	return {
		values,
		ok
	}
}

function getAbilityProgress(){

	const talents = sum(character.abilities.talents)
	const skills = sum(character.abilities.skills)
	const knowledges = sum(character.abilities.knowledges)

	const values = [talents, skills, knowledges].sort((a,b)=>b-a)

	const correct = [13,9,5]

	const ok = values.every((v,i) => v === correct[i])

	return {
		values,
		ok
	}
}

function getDisciplineProgress(){

	const total = Object.values(character.disciplines)
		.reduce((a,b) => a + (b.level || 0), 0)

	return {
		value: total,
		ok: total === 4  
	}
}

function getBackgroundProgress(){

	const total = Object.values(character.backgrounds)
		.reduce((a,b) => a + b, 0)

	return {
		value: total,
		ok: total === 5 
	}
}

function getVirtueProgress(){

	const total = sum(character.virtues) - 3

	return {
		value: total,
		ok: total === 7
	}
}

function checkAbilityMax(){

	for(const cat in character.abilities){
		for(const key in character.abilities[cat]){
			if(character.abilities[cat][key] > 3){
				return false
			}
		}
	}

	return true
}

export function renderChecklist(){


	console.log("CHECKLIST STATE:", getState())

	const el = document.getElementById("createChecklist")
	if(!el) return

	if(getState() !== STATES.CREATE){
		document.getElementById("createChecklist").innerHTML = ""
		return
	}

	const attr = getAttributeProgress()
	const abil = getAbilityProgress()
	const disc = getDisciplineProgress()
	const bg = getBackgroundProgress()
	const virt = getVirtueProgress()
	const abilMax = checkAbilityMax()

	const html = `
	<div>Характеристики: ${attr.values.join("/")} Требуется: 7/5/3
		<span class="${attr.ok ? "ok":"fail"}">${attr.ok ? "✔":"✖"}</span>
	</div>

	<div>Способности: ${abil.values.join("/")} Требуется: 13/9/5
		<span class="${abil.ok ? "ok":"fail"}">${abil.ok ? "✔":"✖"}</span>
	</div>

	<div>≤3 в способности: 
		<span class="${abilMax ? "ok":"fail"}">${abilMax ? "✔":"✖"}</span>
	</div>

	<div>Дисциплины: ${disc.value}/4 
		<span class="${disc.ok ? "ok":"fail"}">${disc.ok ? "✔":"✖"}</span>
	</div>

	<div>Факты биографии: ${bg.value}/5 
		<span class="${bg.ok ? "ok":"fail"}">${bg.ok ? "✔":"✖"}</span>
	</div>

	<div>Добродетели: ${virt.value}/7 
		<span class="${virt.ok ? "ok":"fail"}">${virt.ok ? "✔":"✖"}</span>
	</div>
	`

	document.getElementById("createChecklist").innerHTML = html
}

function getMaxDots(type){

	if(type === "willpower" || type === "road"){
		return 10
	}

	const gen = character.generation
	return generationData[gen].maxTrait
}

export function renderDots(group, value){

	const dots = group.querySelectorAll(".dot")
	const trait = group.dataset.trait
	const type = getTraitType(trait)

	const maxDots = getMaxDots(type)

	dots.forEach((dot, i) => {

		dot.style.display = i < maxDots ? "" : "none"
		dot.classList.toggle("filled", i < value)
	})
}

function getCostFunction(type){

	const state = getState()

	switch(state){

		case STATES.EDIT:
			return (lvl, trait) => costs[type](lvl, trait)

		case STATES.FREEBIE:
			return (lvl, trait) => freebieCosts[type](lvl, trait)

		default:
			return () => 0
	}
}

export function renderCosts(){

	const state = getState()

	if(state !== STATES.EDIT && state !== STATES.FREEBIE){
		return
	}

	document.querySelectorAll(".dots").forEach(group => {

		const trait = group.dataset.trait
		const type = getTraitType(trait)

		if(!type) return

		const costFunc = getCostFunction(type)
		const dots = group.querySelectorAll(".dot")
		const current = getTraitValue(trait)

		dots.forEach((dot,i) => {

			dot.textContent = ""
			dot.classList.remove("cost")

			if(i >= current){

				let totalCost = 0

				for(let lvl = current; lvl < i; lvl++){
					totalCost += costFunc(lvl, trait)
				}

				totalCost += costFunc(i, trait)

				dot.textContent = totalCost
				dot.classList.add("cost")

				const resource = state === STATES.FREEBIE
					? character.freebie
					: character.xp

				dot.style.color = resource < totalCost ? "red" : "green"
			}
		})
	})
}

export function renderWillpower(){

	const checkboxes = document.querySelectorAll(".willpowerCurrent input")

	checkboxes.forEach((cb, i) => {

		cb.style.display = i < character.willpower.max ? "" : "none"
		cb.checked = i < character.willpower.current
	})
}

export function renderBlood(){

	const checkboxes = document.querySelectorAll(".bloodPoints input")

	const max = character.blood.max
	const current = character.blood.current

	checkboxes.forEach((cb, i) => {

		cb.style.display = i < max ? "" : "none"
		cb.checked = i < current
	})
}

export function renderBloodInfo(){

	const info = document.getElementById("bloodInfo")
	const data = generationData[character.generation]

	if(info){
		info.textContent = `Макс: ${data.bloodPool} | За ход: ${data.perTurn}`
	}
}

export function renderSheet(){

	console.log("RENDER SHEET START")

	console.log("!!RENDER STATE:", getState())

	console.log("STATE IN RENDER:", getState())
	console.log("CHECKLIST ELEMENT:", document.getElementById("createChecklist"))

	document.body.dataset.state = getState()

	const clanSelect = document.getElementById("clanSelect")
	if(clanSelect){
		clanSelect.value = character.clan || ""
	}

	const genSelect = document.getElementById("generationSelect")
	if(genSelect){
		genSelect.value = character.generation
	}

	document.querySelectorAll(".disciplineSelect").forEach(select => {

		const slot = select.dataset.slot

		if(!character.disciplines[slot]) return

		select.value = character.disciplines[slot].name || ""
	})

	document.querySelectorAll(".dots").forEach(group => {

		const trait = group.dataset.trait
		const value = getTraitValue(trait)

		renderDots(group, value)
	})

	renderAttributesInfo()
	renderAbilitiesInfo()
	renderCosts()
	renderWillpower()
	renderBlood()
	renderBloodInfo()
	renderChecklist()
}

export function renderResources(xpInput, freebieInput){

	if(xpInput){
		xpInput.value = character.xp
	}

	if(freebieInput){
		freebieInput.value = character.freebie
	}
}

function sum(obj){
	return Object.values(obj).reduce((a,b) => a + b, 0)
}

function getAttributeTotals(){

	return {
		physical: sum(character.attributes.physical) - 3,
		social: sum(character.attributes.social) - 3,
		mental: sum(character.attributes.mental) - 3
	}
}

function getAttributeLimits(){

	const totals = getAttributeTotals()

	const sorted = Object.entries(totals)
		.sort((a,b) => b[1] - a[1])

	return {
		[sorted[0][0]]: 7,
		[sorted[1][0]]: 5,
		[sorted[2][0]]: 3
	}
}

export function renderAttributesInfo(){

	if(getState() !== STATES.CREATE) return

	const container = document.getElementById("attributesInfo")
	if(!container) return

	const totals = getAttributeTotals()
	const limits = getAttributeLimits()

	container.innerHTML = `
		Physical: ${totals.physical} / ${limits.physical} <br>
		Social: ${totals.social} / ${limits.social} <br>
		Mental: ${totals.mental} / ${limits.mental}
	`
}

function getAbilityTotals(){

	return {
		talents: sum(character.abilities.talents),
		skills: sum(character.abilities.skills),
		knowledges: sum(character.abilities.knowledges)
	}
}

function getAbilityLimits(){

	const totals = getAbilityTotals()

	const sorted = Object.entries(totals)
		.sort((a,b) => b[1] - a[1])

	return {
		[sorted[0][0]]: 13,
		[sorted[1][0]]: 9,
		[sorted[2][0]]: 5
	}
}

export function renderAbilitiesInfo(){

	if(getState() !== STATES.CREATE) return

	const container = document.getElementById("abilitiesInfo")
	if(!container) return

	const totals = getAbilityTotals()
	const limits = getAbilityLimits()

	container.innerHTML = `
		Talents: ${totals.talents} / ${limits.talents} <br>
		Skills: ${totals.skills} / ${limits.skills} <br>
		Knowledges: ${totals.knowledges} / ${limits.knowledges}
	`
}