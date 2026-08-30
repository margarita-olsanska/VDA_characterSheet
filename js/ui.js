import { character } from "./character.js"
import { costs } from "./costs.js"
import { getTraitValue, getTraitType } from "./traits.js"
import { creationState } from "./creation.js"
import { AppState } from "./state.js"
export function renderDots(group, value){
	const dots = group.querySelectorAll(".dot")

	dots.forEach((dot,i) => {
		dot.classList.toggle("filled", i < value)
	})
}

export function renderCosts(){


	document.querySelectorAll(".dots").forEach(group => {

		const trait = group.dataset.trait
		const dots = group.querySelectorAll(".dot")

		const current = getTraitValue(trait)
		const type = getTraitType(trait)

		dots.forEach((dot,i) => {

			if(character.state !== AppState.EDIT){
				dot.textContent = ""
				return
			}
			if(type === "disciplines"){
				const discipline = character.disciplines[trait]?.name

				// styling if discipline not selected
				if(!discipline){
					group.style.opacity = 0.3
					// dits without costs
					group.querySelectorAll(".dot").forEach(dot => {
						dot.textContent = ""
						dot.classList.remove("cost", "filled")
					})
					return 
				}

				// if discipline selected - normal styling
				group.style.opacity = 1
			}
			dot.textContent = ""
			dot.classList.remove("cost")

			if (i >= current) {

				let totalCost = 0

				for (let lvl = current; lvl < i; lvl++) {
					totalCost += costs[type](lvl, trait)
				}

				totalCost += costs[type](i, trait)

				dot.textContent = totalCost
				dot.classList.add("cost")

				dot.style.color = character.xp < totalCost ? "red" : "green"
			}
		})
	})
}

export function renderSheet(){

	document.getElementById("characterName").value = character.name || ""
	document.getElementById("clanSelect").value = character.clan || ""

	// sync disciplines
	document.querySelectorAll(".disciplineSelect").forEach(select => {

		const slot = select.dataset.slot
		if(!character.disciplines[slot]) return
		select.value = character.disciplines[slot].name || ""
	})

	//dots
	document.querySelectorAll(".dots").forEach(group => {

		const trait = group.dataset.trait
		const value = getTraitValue(trait)

		renderDots(group, value)
	})

	//costs
	renderCosts()

	//bookmarks
	document.querySelectorAll(".bookmark").forEach(btn => btn.classList.remove("active"))

	const activeBtn = {
		[AppState.CREATION]: "btnCreation",
		[AppState.FREEBIE]: "btnFreebie",
		[AppState.EDIT]: "btnEdit",
		[AppState.VIEW]: "btnView"
	}[character.state]

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

	if(character.state !== AppState.CREATION){
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