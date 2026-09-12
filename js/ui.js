import { character } from "./character.js"
import { costs } from "./costs.js"
import { freebieCosts } from "./freebieCosts.js"
import { getTraitValue, getTraitType } from "./traits.js"
import { getState, STATES } from "./state.js"
import { generationData } from "./generation.js"
import { creationState } from "./creation.js"
import { archetypes } from "./VDA20data.js"
import { t, localize } from "./i18n.js"

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

export function renderHealth(){

	document.querySelectorAll(".healthInput").forEach((input, i) => {
		input.value = character.health[i] || ""
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

	info.textContent = t("blood.info", data.bloodPool, data.perTurn)
}

export function renderSheet(){

	document.body.dataset.state = getState()

	document.getElementById("xpLabel").style.display = (getState() === STATES.EDIT || getState() === STATES.VIEW) ? "" : "none"
	document.getElementById("freebieLabel").style.display = getState() === STATES.FREEBIE ? "" : "none"

	document.getElementById("characterName").value = character.name || ""
	document.getElementById("conceptInput").value = character.concept || ""
	document.getElementById("clanSelect").value = character.clan || ""
	document.getElementById("natureSelect").value = character.nature || ""
	document.getElementById("demeanorSelect").value = character.demeanor || ""
	document.getElementById("sireNotes").value = character.sireNotes || ""
	document.getElementById("clanFlawNotes").value = character.clanFlaw || ""
	document.getElementById("notesText").value = character.notes || ""
	document.getElementById("roadSelect").value = character.road.type || ""

	const nature = character.nature && archetypes[character.nature]
	const demeanor = character.demeanor && archetypes[character.demeanor]

	document.getElementById("natureCardBody").innerHTML = nature
		? `<strong>${localize(nature.name)}</strong><p>${localize(nature.description)}</p>`
		: t("notSelected")

	document.getElementById("demeanorCardBody").innerHTML = demeanor
		? `<strong>${localize(demeanor.name)}</strong><p>${localize(demeanor.description)}</p>`
		: t("notSelected")

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

	document.querySelectorAll(".virtueChoiceSelect").forEach(select => {
		select.value = character.virtueChoices[select.dataset.virtue]
	})

	document.querySelectorAll(".dots").forEach(group => {

		const trait = group.dataset.trait
		const value = getTraitValue(trait)

		renderDots(group, value)
	})

	renderCosts()
	renderWillpower()
	renderHealth()
	renderBlood()
	renderBloodInfo()

	const creationActive = character.creation.active
	const freebieStepBtn = document.getElementById("btnFreebieStep")

	freebieStepBtn.style.display = creationActive ? "" : "none"
	freebieStepBtn.textContent = getState() === STATES.FREEBIE ? t("action.backToCreation") : t("action.toFreebie")

	document.getElementById("btnFinishCreation").style.display = creationActive ? "" : "none"

	document.getElementById("btnView").style.display = creationActive ? "none" : ""
	document.getElementById("btnSaveCurrentCharacter").style.display = creationActive ? "none" : ""
	document.getElementById("btnSaveHtml").style.display = creationActive ? "none" : ""

	const editStepBtn = document.getElementById("btnEditStep")
	editStepBtn.style.display = creationActive ? "none" : ""
	editStepBtn.textContent = getState() === STATES.EDIT ? t("action.backToView") : t("action.toEdit")

	document.querySelectorAll(".bookmark").forEach(btn => btn.classList.remove("active"))

	const activeBtn = {
		[STATES.CREATE]: "btnCreation",
		[STATES.FREEBIE]: "btnCreation",
		[STATES.EDIT]: "btnView",
		[STATES.VIEW]: "btnView"
	}[getState()]

	if(activeBtn) document.getElementById(activeBtn).classList.add("active")

	document.getElementById("btnView").disabled = getState() === STATES.VIEW
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

const creationInfoBoxIds = ["creationInfoAttributes", "creationInfoAbilities", "creationInfoAdvantages"]

function renderCreationTable(el, rows){

	el.innerHTML = `
		<table class="creationTable">
			<thead>
				<tr><th></th><th>${t("creation.current")}</th><th>${t("creation.expected")}</th></tr>
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

export function renderCreation(){

	if(getState() !== STATES.CREATE){
		creationInfoBoxIds.forEach(id => {
			const el = document.getElementById(id)
			if(el) el.innerHTML = ""
		})
		return
	}

	const attr = creationState.attributes
	const abil = creationState.abilities

	const priorityTargets = pool => [pool.tertiary, pool.secondary, pool.primary].sort((a,b) => a - b).join("/")

	renderCreationTable(document.getElementById("creationInfoAttributes"), [{
		label: t("creation.attributes"),
		current: `${attr.assigned.physical}/${attr.assigned.social}/${attr.assigned.mental}`,
		expected: priorityTargets(attr),
		done: isValidPriorityDistribution(attr)
	}])

	renderCreationTable(document.getElementById("creationInfoAbilities"), [{
		label: t("creation.abilities"),
		current: `${abil.assigned.talents}/${abil.assigned.skills}/${abil.assigned.knowledges}`,
		expected: priorityTargets(abil),
		done: isValidPriorityDistribution(abil)
	}])

	renderCreationTable(document.getElementById("creationInfoAdvantages"), [
		{
			label: t("creation.disciplines"),
			current: `${creationState.disciplines.used}`,
			expected: `${creationState.disciplines.points}`,
			done: creationState.disciplines.used === creationState.disciplines.points
		},
		{
			label: t("creation.backgrounds"),
			current: `${creationState.backgrounds.used}`,
			expected: `${creationState.backgrounds.points}`,
			done: creationState.backgrounds.used === creationState.backgrounds.points
		},
		{
			label: t("creation.virtues"),
			current: `${creationState.virtues.used}`,
			expected: `${creationState.virtues.points}`,
			done: creationState.virtues.used === creationState.virtues.points
		}
	])
}
