import { clans, disciplineTypes, archetypes, backgroundTypes, roadTypes, abilityTypes, attributeTypes, powerLibrary, ritualLibrary, pathLibrary, getEffectiveRoadSins } from "./VDA20data.js"
import { saveClans, saveDisciplineTypes, saveArchetypes, saveBackgroundTypes, saveRoadTypes, saveAbilityTypes, saveAttributeTypes, savePowerLibrary, saveRitualLibrary, savePathLibrary, exportLibraryToFile, importLibraryFromFile } from "./storage.js"
import { t, localize, getLocale } from "./i18n.js"
import { sortedKeysByName, bulletsForLevel } from "./utils.js"
import {
	builtinPresets, getActivePreset, listPresets,
	switchToBuiltinPreset, switchToCustomPreset, resetActivePresetToDefault, saveCurrentAsPreset, deleteCustomPreset
} from "./libraryPresets.js"

function makeKey(prefix){
	return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`
}

const bilingual = text => ({ ru: text, en: text })

function renameEntry(dict, key, newName){
	dict[key].name[getLocale()] = newName
}

function renderLibraryList(container, dict, onDelete, formatLabel = item => localize(item.name), onRename = null){

	container.innerHTML = ""

	const keys = sortedKeysByName(dict, item => localize(item.name))

	if(!keys.length){
		const empty = document.createElement("div")
		empty.className = "libraryEmpty"
		empty.textContent = t("library.empty")
		container.appendChild(empty)
		return
	}

	keys.forEach(key => {

		const row = document.createElement("div")
		row.className = "libraryListItem"

		const label = document.createElement("span")
		label.textContent = formatLabel(dict[key])

		row.appendChild(label)

		if(onRename){

			const renameBtn = document.createElement("button")
			renameBtn.type = "button"
			renameBtn.className = "libraryRenameBtn"
			renameBtn.textContent = "✎"
			renameBtn.addEventListener("click", () => {

				const newName = prompt(t("library.renamePrompt"), localize(dict[key].name))
				if(newName === null) return

				const trimmed = newName.trim()
				if(!trimmed) return

				onRename(key, trimmed)
			})

			row.appendChild(renameBtn)
		}

		if(onDelete){

			const deleteBtn = document.createElement("button")
			deleteBtn.type = "button"
			deleteBtn.className = "libraryDeleteBtn"
			deleteBtn.textContent = "×"
			deleteBtn.addEventListener("click", () => {
				if(!confirm(t("library.confirmDelete", formatLabel(dict[key])))) return
				onDelete(key)
			})

			row.appendChild(deleteBtn)
		}

		container.appendChild(row)
	})
}

export function setupLibraryUI({ onLibraryChanged, afterHide, deletePowerFromLibrary, deletePathFromLibrary, deleteRitualFromLibrary }){

	function renderAllLists(){
		renderAttributeList()
		renderArchetypeList()
		renderClanList()
		renderDisciplineList()
		renderBackgroundList()
		renderRoadList()
		renderAbilityList()
		renderPowerList()
		renderRitualList()
		renderPathList()
		refreshDisciplineDependentSelects()
	}


	function renderAttributeList(){
		renderLibraryList(
			document.getElementById("libraryAttributeList"),
			attributeTypes,
			null,
			item => localize(item.name),
			(key, newName) => {
				renameEntry(attributeTypes, key, newName)
				saveAttributeTypes()
				renderAttributeList()
				changed()
			}
		)
	}


	async function renderPresetBar(){

		const select = document.getElementById("libraryPresetSelect")
		const active = getActivePreset()

		const { builtins, custom } = await listPresets()

		select.innerHTML = ""

		const builtinGroup = document.createElement("optgroup")
		builtinGroup.label = t("library.presetBuiltinGroup")
		builtins.forEach(preset => builtinGroup.appendChild(new Option(localize(preset.name), preset.id)))
		select.appendChild(builtinGroup)

		if(custom.length){
			const customGroup = document.createElement("optgroup")
			customGroup.label = t("library.presetCustomGroup")
			custom.forEach(entry => customGroup.appendChild(new Option(entry.name, entry.fileName)))
			select.appendChild(customGroup)
		}

		select.value = active.id

		document.getElementById("btnResetPreset").style.display = active.builtin ? "" : "none"
		document.getElementById("btnDeletePreset").style.display = active.builtin ? "none" : ""
	}

	document.getElementById("libraryPresetSelect").addEventListener("change", async (e) => {

		const id = e.target.value

		if(builtinPresets[id]){
			switchToBuiltinPreset(id)
		}else{
			await switchToCustomPreset(id)
		}

		renderAllLists()
		await renderPresetBar()
		changed()
	})

	document.getElementById("btnResetPreset").addEventListener("click", () => {

		if(!confirm(t("library.confirmResetPreset"))) return

		resetActivePresetToDefault()

		renderAllLists()
		changed()
	})

	document.getElementById("btnSavePreset").addEventListener("click", async () => {

		const name = prompt(t("library.savePresetPrompt"))
		if(!name || !name.trim()) return

		const fileName = await saveCurrentAsPreset(name.trim())

		if(!fileName){
			alert(t("library.presetSaveFailed"))
			return
		}

		await renderPresetBar()
	})

	document.getElementById("btnDeletePreset").addEventListener("click", async () => {

		const active = getActivePreset()
		if(active.builtin) return

		if(!confirm(t("library.confirmDeletePreset", localize(active.name)))) return

		await deleteCustomPreset(active.id)

		renderAllLists()
		await renderPresetBar()
		changed()
	})

	function showLibraryScreen(){

		document.querySelector(".sheet").style.display = "none"
		document.querySelector(".cardPanel").style.display = "none"
		document.getElementById("cardOverflow").style.display = "none"
		document.getElementById("sinsSection").style.display = "none"
		document.getElementById("vaultScreen").style.display = "none"
		document.getElementById("libraryScreen").style.display = ""

		document.querySelector(".book").classList.add("overlayShown")

		document.querySelectorAll(".bookmark").forEach(btn => btn.classList.remove("active"))
		document.getElementById("btnLibrary").classList.add("active")

		document.getElementById("btnView").disabled = false

		renderAllLists()
		renderPresetBar()
	}

	function hideLibraryScreen(){

		document.getElementById("libraryScreen").style.display = "none"
		document.querySelector(".sheet").style.display = ""
		document.querySelector(".cardPanel").style.display = ""
		document.querySelector(".book").classList.remove("overlayShown")

		afterHide()
	}

	function changed(){
		onLibraryChanged()
	}


	function renderArchetypeList(){
		renderLibraryList(document.getElementById("libraryArchetypeList"), archetypes, (key) => {
			delete archetypes[key]
			saveArchetypes()
			renderArchetypeList()
			changed()
		})
	}

	document.getElementById("libArchetypeAdd").addEventListener("click", () => {

		const nameInput = document.getElementById("libArchetypeName")
		const descInput = document.getElementById("libArchetypeDesc")

		const name = nameInput.value.trim()
		if(!name){ alert(t("library.enterName")); return }

		archetypes[makeKey("archetype")] = {
			name: bilingual(name),
			description: bilingual(descInput.value.trim())
		}

		saveArchetypes()

		nameInput.value = ""
		descInput.value = ""

		renderArchetypeList()
		changed()
	})


	function formatDisciplineLabel(item){
		return item.ritualPaths ? `${localize(item.name)} (${t("ritualPath.checkboxLabel")})` : localize(item.name)
	}

	function renderDisciplineList(){
		renderLibraryList(document.getElementById("libraryDisciplineList"), disciplineTypes, (key) => {
			delete disciplineTypes[key]
			saveDisciplineTypes()
			renderDisciplineList()
			refreshDisciplineDependentSelects()
			changed()
		}, formatDisciplineLabel)
	}

	document.getElementById("libDisciplineAdd").addEventListener("click", () => {

		const nameInput = document.getElementById("libDisciplineName")
		const ritualPathsCheckbox = document.getElementById("libDisciplineRitualPaths")

		const name = nameInput.value.trim()
		if(!name){ alert(t("library.enterName")); return }

		disciplineTypes[makeKey("discipline")] = { name: bilingual(name), ritualPaths: ritualPathsCheckbox.checked }

		saveDisciplineTypes()

		nameInput.value = ""
		ritualPathsCheckbox.checked = false

		renderDisciplineList()
		refreshDisciplineDependentSelects()
		changed()
	})

	function refreshDisciplineDependentSelects(){

		const keys = sortedKeysByName(disciplineTypes, d => localize(d.name))

		;["libClanDiscipline1", "libClanDiscipline2", "libClanDiscipline3", "libPowerDiscipline"].forEach(id => {

			const select = document.getElementById(id)
			const current = select.value

			select.innerHTML = ""
			keys.forEach(key => select.appendChild(new Option(localize(disciplineTypes[key].name), key)))

			if(keys.includes(current)) select.value = current
		})

		const ritualPathKeys = keys.filter(key => disciplineTypes[key].ritualPaths)

		;["libRitualDiscipline", "libPathDiscipline"].forEach(id => {

			const select = document.getElementById(id)
			const current = select.value

			select.innerHTML = ""
			ritualPathKeys.forEach(key => select.appendChild(new Option(localize(disciplineTypes[key].name), key)))

			if(ritualPathKeys.includes(current)) select.value = current
		})
	}


	function renderClanList(){
		renderLibraryList(document.getElementById("libraryClanList"), clans, (key) => {
			delete clans[key]
			saveClans()
			renderClanList()
			changed()
		})
	}

	document.getElementById("libClanAdd").addEventListener("click", () => {

		const nameInput = document.getElementById("libClanName")

		const name = nameInput.value.trim()
		if(!name){ alert(t("library.enterName")); return }

		const disciplineKeys = [
			document.getElementById("libClanDiscipline1").value,
			document.getElementById("libClanDiscipline2").value,
			document.getElementById("libClanDiscipline3").value
		].filter(Boolean)

		clans[makeKey("clan")] = { name: bilingual(name), disciplines: disciplineKeys }

		saveClans()

		nameInput.value = ""

		renderClanList()
		changed()
	})


	function renderBackgroundList(){
		renderLibraryList(document.getElementById("libraryBackgroundList"), backgroundTypes, (key) => {
			delete backgroundTypes[key]
			saveBackgroundTypes()
			renderBackgroundList()
			changed()
		})
	}

	document.getElementById("libBackgroundAdd").addEventListener("click", () => {

		const nameInput = document.getElementById("libBackgroundName")
		const levelInputs = [1, 2, 3, 4, 5].map(n => document.getElementById(`libBackgroundLevel${n}`))

		const name = nameInput.value.trim()
		if(!name){ alert(t("library.enterName")); return }

		backgroundTypes[makeKey("background")] = {
			name: bilingual(name),
			levels: levelInputs.map(input => bilingual(input.value.trim()))
		}

		saveBackgroundTypes()

		nameInput.value = ""
		levelInputs.forEach(input => input.value = "")

		renderBackgroundList()
		changed()
	})


	function buildSinsRows(placeholderSins = null){

		const tbody = document.getElementById("libRoadSinsBody")
		tbody.innerHTML = ""

		const placeholderByValue = {}
		if(placeholderSins) placeholderSins.forEach(row => { placeholderByValue[row.value] = row })

		for(let value = 10; value >= 1; value--){

			const tr = document.createElement("tr")
			tr.dataset.value = value

			const valueTd = document.createElement("td")
			valueTd.textContent = value

			const placeholder = placeholderByValue[value]

			const sinTd = document.createElement("td")
			const sinInput = document.createElement("input")
			sinInput.type = "text"
			sinInput.className = "libRoadSinInput"
			if(placeholder) sinInput.placeholder = localize(placeholder.sin)
			sinTd.appendChild(sinInput)

			const rationaleTd = document.createElement("td")
			const rationaleInput = document.createElement("input")
			rationaleInput.type = "text"
			rationaleInput.className = "libRoadRationaleInput"
			if(placeholder) rationaleInput.placeholder = localize(placeholder.rationale)
			rationaleTd.appendChild(rationaleInput)

			tr.appendChild(valueTd)
			tr.appendChild(sinTd)
			tr.appendChild(rationaleTd)

			tbody.appendChild(tr)
		}
	}

	function populateRoadParentSelect(){

		const select = document.getElementById("libRoadParent")
		const current = select.value

		select.innerHTML = ""
		select.appendChild(new Option(t("library.roadParentNone"), ""))

		for(const key of sortedKeysByName(roadTypes, r => localize(r.name))){
			select.appendChild(new Option(localize(roadTypes[key].name), key))
		}

		if([...select.options].some(o => o.value === current)) select.value = current
	}

	function formatRoadLabel(item){

		if(!item.parentRoad) return localize(item.name)

		const parent = roadTypes[item.parentRoad]
		return `${localize(item.name)} (${t("library.pathOf")} ${parent ? localize(parent.name) : item.parentRoad})`
	}

	function renderRoadList(){

		renderLibraryList(document.getElementById("libraryRoadList"), roadTypes, (key) => {
			delete roadTypes[key]
			saveRoadTypes()
			renderRoadList()
			changed()
		}, formatRoadLabel)

		populateRoadParentSelect()
	}

	document.getElementById("libRoadParent").addEventListener("change", (e) => {

		const parentKey = e.target.value

		document.getElementById("libRoadSinsNote").textContent = parentKey ? t("library.overridesNote") : t("library.sinsOptional")

		buildSinsRows(parentKey ? getEffectiveRoadSins(parentKey) : null)
	})

	document.getElementById("libRoadAdd").addEventListener("click", () => {

		const nameInput = document.getElementById("libRoadName")
		const parentSelect = document.getElementById("libRoadParent")
		const parentKey = parentSelect.value

		const name = nameInput.value.trim()
		if(!name){ alert(t("library.enterName")); return }

		const rows = [...document.querySelectorAll("#libRoadSinsBody tr")]
			.map(tr => {

				const sin = tr.querySelector(".libRoadSinInput").value.trim()
				const rationale = tr.querySelector(".libRoadRationaleInput").value.trim()

				if(!sin && !rationale) return null

				return { value: parseInt(tr.dataset.value), sin: bilingual(sin), rationale: bilingual(rationale) }
			})
			.filter(Boolean)

		roadTypes[makeKey("road")] = parentKey
			? {
				name: bilingual(name),
				parentRoad: parentKey,
				overrides: Object.fromEntries(rows.map(row => [row.value, { sin: row.sin, rationale: row.rationale }]))
			}
			: { name: bilingual(name), sins: rows }

		saveRoadTypes()

		nameInput.value = ""
		parentSelect.value = ""
		document.getElementById("libRoadSinsNote").textContent = t("library.sinsOptional")
		buildSinsRows()

		renderRoadList()
		changed()
	})

	buildSinsRows()
	populateRoadParentSelect()


	function renderAbilityList(){
		document.querySelectorAll("[data-ability-category]").forEach(container => {

			const category = container.dataset.abilityCategory

			const filtered = {}
			for(const key in abilityTypes){
				if(abilityTypes[key].category === category) filtered[key] = abilityTypes[key]
			}

			renderLibraryList(
				container,
				filtered,
				(key) => {
					delete abilityTypes[key]
					saveAbilityTypes()
					renderAbilityList()
					changed()
				},
				item => localize(item.name),
				(key, newName) => {
					renameEntry(abilityTypes, key, newName)
					saveAbilityTypes()
					renderAbilityList()
					changed()
				}
			)
		})
	}

	document.querySelectorAll(".libAbilityAddBtn").forEach(btn => {

		btn.addEventListener("click", () => {

			const category = btn.dataset.category
			const nameInput = document.querySelector(`.libAbilityNameInput[data-category="${category}"]`)

			const name = nameInput.value.trim()
			if(!name){ alert(t("library.enterName")); return }

			abilityTypes[makeKey("abilitytype")] = { name: bilingual(name), category }

			saveAbilityTypes()

			nameInput.value = ""

			renderAbilityList()
			changed()
		})
	})


	function renderPowerList(){

		const container = document.getElementById("libraryPowerList")
		container.innerHTML = ""

		const keys = Object.keys(powerLibrary).sort((a, b) => powerLibrary[a].name.localeCompare(powerLibrary[b].name))

		if(!keys.length){
			const empty = document.createElement("div")
			empty.className = "libraryEmpty"
			empty.textContent = t("library.empty")
			container.appendChild(empty)
			return
		}

		keys.forEach(key => {

			const power = powerLibrary[key]
			const discName = disciplineTypes[power.discipline] ? localize(disciplineTypes[power.discipline].name) : power.discipline

			const row = document.createElement("div")
			row.className = "libraryListItem"

			const label = document.createElement("span")
			label.textContent = `${discName}: ${bulletsForLevel(power.level)} ${power.name}`

			const deleteBtn = document.createElement("button")
			deleteBtn.type = "button"
			deleteBtn.className = "libraryDeleteBtn"
			deleteBtn.textContent = "×"
			deleteBtn.addEventListener("click", () => {
				deletePowerFromLibrary(key)
				renderPowerList()
			})

			row.appendChild(label)
			row.appendChild(deleteBtn)
			container.appendChild(row)
		})
	}

	document.getElementById("libPowerAdd").addEventListener("click", () => {

		const nameInput = document.getElementById("libPowerName")
		const descInput = document.getElementById("libPowerDesc")
		const rulesInput = document.getElementById("libPowerRules")
		const disciplineSelect = document.getElementById("libPowerDiscipline")
		const levelSelect = document.getElementById("libPowerLevel")

		const name = nameInput.value.trim()
		if(!name){ alert(t("power.enterName")); return }

		powerLibrary[makeKey("power")] = {
			discipline: disciplineSelect.value,
			level: parseInt(levelSelect.value),
			name,
			description: descInput.value.trim(),
			rules: rulesInput.value.trim()
		}

		savePowerLibrary()

		nameInput.value = ""
		descInput.value = ""
		rulesInput.value = ""

		renderPowerList()
		changed()
	})


	function renderDisciplineEntryList(containerId, library, onDelete){

		const container = document.getElementById(containerId)
		container.innerHTML = ""

		const keys = Object.keys(library).sort((a, b) => library[a].name.localeCompare(library[b].name))

		if(!keys.length){
			const empty = document.createElement("div")
			empty.className = "libraryEmpty"
			empty.textContent = t("library.empty")
			container.appendChild(empty)
			return
		}

		keys.forEach(key => {

			const entry = library[key]
			const discName = disciplineTypes[entry.discipline] ? localize(disciplineTypes[entry.discipline].name) : entry.discipline

			const row = document.createElement("div")
			row.className = "libraryListItem"

			const label = document.createElement("span")
			label.textContent = `${discName}: ${bulletsForLevel(entry.level)} ${entry.name}`

			const deleteBtn = document.createElement("button")
			deleteBtn.type = "button"
			deleteBtn.className = "libraryDeleteBtn"
			deleteBtn.textContent = "×"
			deleteBtn.addEventListener("click", () => onDelete(key))

			row.appendChild(label)
			row.appendChild(deleteBtn)
			container.appendChild(row)
		})
	}

	function renderRitualList(){
		renderDisciplineEntryList("libraryRitualList", ritualLibrary, (key) => {
			deleteRitualFromLibrary(key)
			renderRitualList()
		})
	}

	function renderPathList(){
		renderDisciplineEntryList("libraryPathList", pathLibrary, (key) => {
			deletePathFromLibrary(key)
			renderPathList()
		})
	}

	document.getElementById("libRitualAdd").addEventListener("click", () => {

		const nameInput = document.getElementById("libRitualName")
		const descInput = document.getElementById("libRitualDesc")
		const rulesInput = document.getElementById("libRitualRules")
		const disciplineSelect = document.getElementById("libRitualDiscipline")
		const levelSelect = document.getElementById("libRitualLevel")

		if(!disciplineSelect.value){ alert(t("ritualPath.noDisciplines")); return }

		const name = nameInput.value.trim()
		if(!name){ alert(t("ritual.enterName")); return }

		ritualLibrary[makeKey("ritual")] = {
			discipline: disciplineSelect.value,
			level: parseInt(levelSelect.value),
			name,
			description: descInput.value.trim(),
			rules: rulesInput.value.trim(),
			isRitual: true
		}

		saveRitualLibrary()

		nameInput.value = ""
		descInput.value = ""
		rulesInput.value = ""

		renderRitualList()
		changed()
	})

	document.getElementById("libPathAdd").addEventListener("click", () => {

		const nameInput = document.getElementById("libPathName")
		const disciplineSelect = document.getElementById("libPathDiscipline")
		const levelSelect = document.getElementById("libPathLevel")

		if(!disciplineSelect.value){ alert(t("ritualPath.noDisciplines")); return }

		const name = nameInput.value.trim()
		if(!name){ alert(t("path.enterName")); return }

		pathLibrary[makeKey("path")] = {
			discipline: disciplineSelect.value,
			level: parseInt(levelSelect.value),
			name
		}

		savePathLibrary()

		nameInput.value = ""

		renderPathList()
		changed()
	})

	document.getElementById("btnLibrary").addEventListener("click", showLibraryScreen)

	document.getElementById("btnSaveLibrary").onclick = () => {
		exportLibraryToFile()
	}

	document.getElementById("btnLoadLibrary").onclick = () => {
		document.getElementById("loadLibraryInput").click()
	}

	document.getElementById("loadLibraryInput").addEventListener("change", (e) => {

		const file = e.target.files[0]
		if(!file) return

		importLibraryFromFile(file, () => {
			renderAllLists()
			changed()
		})

		e.target.value = ""
	})

	return { hideLibraryScreen }
}
