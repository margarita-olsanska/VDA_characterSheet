import { character } from "./character.js"
import { costs } from "./costs.js"
import { freebieCosts } from "./freebieCosts.js"
import { getTraitValue, getTraitType } from "./traits.js"
import { getState, STATES } from "./state.js"
import { generationData } from "./generation.js"
import { creationState } from "./creation.js"
import { archetypes } from "./archetypes.js"

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

	switch(getState()){

		case STATES.EDIT:
			return (lvl, trait) => costs[type](lvl, trait)

		case STATES.FREEBIE:
			return (lvl, trait) => freebieCosts[type](lvl, trait)

		default:
			return null
	}
}

export function renderCosts(){

	document.querySelectorAll(".dots").forEach(group => {

		const trait = group.dataset.trait
		const type = getTraitType(trait)

		if(!type) return

		const dots = group.querySelectorAll(".dot")
		const current = getTraitValue(trait)

		if(type === "disciplines" || type === "backgrounds"){

			const picked = type === "disciplines"
				? character.disciplines[trait]?.name
				: character.backgrounds[trait]?.type

			if(!picked){
				group.style.opacity = 0.3
				dots.forEach(dot => {
					dot.textContent = ""
					dot.classList.remove("cost", "filled")
				})
				return
			}

			group.style.opacity = 1
		}

		const costFunc = getCostFunction(type)

		if(!costFunc){
			dots.forEach(dot => {
				dot.textContent = ""
				dot.classList.remove("cost")
			})
			return
		}

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

				const resource = getState() === STATES.FREEBIE
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

		cb.style.display = i < character.willpower.level ? "" : "none"
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
	const gen = character.generation
	const data = generationData[gen]

	info.textContent = `Макс: ${data.bloodPool} | За ход: ${data.perTurn}`
}

export function renderSheet(){

	document.body.dataset.state = getState()

	// XP only matters while spending XP (Прокачка), freebie only while spending freebie points
	document.getElementById("xpLabel").style.display = getState() === STATES.EDIT ? "" : "none"
	document.getElementById("freebieLabel").style.display = getState() === STATES.FREEBIE ? "" : "none"

	document.getElementById("characterName").value = character.name || ""
	document.getElementById("clanSelect").value = character.clan || ""
	document.getElementById("natureSelect").value = character.nature || ""
	document.getElementById("demeanorSelect").value = character.demeanor || ""
	document.getElementById("sireNotes").value = character.sireNotes || ""
	document.getElementById("roadSelect").value = character.road.type || ""

	document.getElementById("natureCardBody").innerHTML = character.nature
		? `<strong>${archetypes[character.nature].name}</strong><p>${archetypes[character.nature].description}</p>`
		: "Не выбрана"

	document.getElementById("demeanorCardBody").innerHTML = character.demeanor
		? `<strong>${archetypes[character.demeanor].name}</strong><p>${archetypes[character.demeanor].description}</p>`
		: "Не выбрана"

	document.querySelectorAll(".disciplineSelect").forEach(select => {

		const slot = select.dataset.slot
		if(!character.disciplines[slot]) return
		select.value = character.disciplines[slot].name || ""
	})

	document.querySelectorAll(".backgroundSelect").forEach(select => {

		const slot = select.dataset.slot
		if(!character.backgrounds[slot]) return
		select.value = character.backgrounds[slot].type || ""
	})

	document.querySelectorAll(".dots").forEach(group => {

		const trait = group.dataset.trait
		const value = getTraitValue(trait)

		renderDots(group, value)
	})

	renderCosts()
	renderWillpower()
	renderBlood()
	renderBloodInfo()

	//bookmarks
	document.querySelectorAll(".bookmark").forEach(btn => btn.classList.remove("active"))

	const activeBtn = {
		[STATES.CREATE]: "btnCreation",
		[STATES.FREEBIE]: "btnFreebie",
		[STATES.EDIT]: "btnEdit",
		[STATES.VIEW]: "btnView"
	}[getState()]

	if(activeBtn) document.getElementById(activeBtn).classList.add("active")
}

export function renderResources(xpInput, freebieInput){
	xpInput.value = character.xp
	freebieInput.value = character.freebie
}

function isValidPriorityDistribution(pool){

	const values = Object.values(pool.assigned).sort((a,b) => a - b)
	const targets = [pool.tertiary, pool.secondary, pool.primary].sort((a,b) => a - b)

	return values.every((v, i) => v === targets[i])
}

export function renderCreation(){

	const el = document.getElementById("creationInfo")

	if(!el) return

	if(getState() !== STATES.CREATE){
		el.innerHTML = ""
		return
	}

	const attr = creationState.attributes
	const abil = creationState.abilities

	const priorityTargets = pool => [pool.tertiary, pool.secondary, pool.primary].sort((a,b) => a - b).join("/")

	const rows = [
		{
			label: "Атрибуты",
			current: `${attr.assigned.physical}/${attr.assigned.social}/${attr.assigned.mental}`,
			expected: priorityTargets(attr),
			done: isValidPriorityDistribution(attr)
		},
		{
			label: "Способности",
			current: `${abil.assigned.talents}/${abil.assigned.skills}/${abil.assigned.knowledges}`,
			expected: priorityTargets(abil),
			done: isValidPriorityDistribution(abil)
		},
		{
			label: "Дисциплины",
			current: `${creationState.disciplines.used}`,
			expected: `${creationState.disciplines.points}`,
			done: creationState.disciplines.used === creationState.disciplines.points
		},
		{
			label: "Биография",
			current: `${creationState.backgrounds.used}`,
			expected: `${creationState.backgrounds.points}`,
			done: creationState.backgrounds.used === creationState.backgrounds.points
		},
		{
			label: "Добродетели",
			current: `${creationState.virtues.used}`,
			expected: `${creationState.virtues.points}`,
			done: creationState.virtues.used === creationState.virtues.points
		}
	]

	el.innerHTML = `
		<table class="creationTable">
			<thead>
				<tr><th></th><th>Текущее</th><th>Ожидаемое</th></tr>
			</thead>
			<tbody>
				${rows.map(row => `
					<tr class="${row.done ? "done" : ""}">
						<td>${row.label}</td>
						<td>${row.current}</td>
						<td>${row.expected}</td>
					</tr>
				`).join("")}
			</tbody>
		</table>
	`
}
