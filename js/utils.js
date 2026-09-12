import { getLocale } from "./i18n.js"

export function sortedKeysByName(dict, getName){
	return Object.keys(dict).sort((a, b) => getName(dict[a]).localeCompare(getName(dict[b]), getLocale()))
}

export function bulletsForLevel(level, groupSize = 5){

	const groups = []

	for(let i = 0; i < level; i += groupSize){
		groups.push("•".repeat(Math.min(groupSize, level - i)))
	}

	return groups.join(" ")
}

export function createLevelDots(initialLevel, maxLevel, onChange){

	const container = document.createElement("div")
	container.className = "dots"

	for(let i = 0; i < maxLevel; i++){
		const dot = document.createElement("span")
		dot.className = "dot"
		container.appendChild(dot)
	}

	const dotEls = [...container.querySelectorAll(".dot")]

	function render(level){
		dotEls.forEach((dot, i) => dot.classList.toggle("filled", i < level))
	}

	dotEls.forEach((dot, index) => {

		dot.addEventListener("click", () => {

			const current = dotEls.filter(d => d.classList.contains("filled")).length
			const newLevel = (index + 1 === current) ? current - 1 : index + 1

			render(newLevel)
			onChange(newLevel)
		})
	})

	render(initialLevel)

	return container
}
