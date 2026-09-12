import {
	clans, disciplineTypes, archetypes, backgroundTypes, roadTypes,
	abilityTypes, attributeTypes, powerLibrary, ritualLibrary, pathLibrary, darkAgesDefaults
} from "./VDA20data.js"
import { masqueradeDefaults } from "./presetsMasquerade.js"
import {
	saveClans, saveDisciplineTypes, saveArchetypes, saveBackgroundTypes,
	saveRoadTypes, saveAbilityTypes, saveAttributeTypes, savePowerLibrary,
	saveRitualLibrary, savePathLibrary
} from "./storage.js"
import {
	isVaultConnected, getVaultBackend, connectVault,
	listVaultLibraries, readVaultLibraryFile, writeVaultLibrary, deleteVaultLibraryFile
} from "./vault.js"
import { t } from "./i18n.js"

const ACTIVE_PRESET_KEY = "vtmActiveLibraryPreset"

const liveDicts = {
	attributeTypes, abilityTypes, clans, disciplineTypes, archetypes, backgroundTypes, roadTypes,
	powerLibrary, ritualLibrary, pathLibrary
}

const saveFns = {
	attributeTypes: saveAttributeTypes, abilityTypes: saveAbilityTypes,
	clans: saveClans, disciplineTypes: saveDisciplineTypes,
	archetypes: saveArchetypes, backgroundTypes: saveBackgroundTypes,
	roadTypes: saveRoadTypes, powerLibrary: savePowerLibrary,
	ritualLibrary: saveRitualLibrary, pathLibrary: savePathLibrary
}

export const builtinPresets = {
	darkAges: { id: "darkAges", builtin: true, name: { ru: "Vampire the Dark Ages (v20)", en: "Vampire the Dark Ages (v20)" }, data: darkAgesDefaults },
	masquerade: { id: "masquerade", builtin: true, name: { ru: "Vampire the Masquerade (v20)", en: "Vampire the Masquerade (v20)" }, data: masqueradeDefaults }
}

function applyPresetData(data){

	for(const key in liveDicts){

		const dict = liveDicts[key]
		for(const k in dict) delete dict[k]
		Object.assign(dict, structuredClone(data[key] || {}))

		saveFns[key]()
	}
}

export function getActivePreset(){

	const saved = localStorage.getItem(ACTIVE_PRESET_KEY)
	if(!saved) return { id: "darkAges", builtin: true, name: builtinPresets.darkAges.name }

	try{
		return JSON.parse(saved)
	}catch(e){
		return { id: "darkAges", builtin: true, name: builtinPresets.darkAges.name }
	}
}

function setActivePreset(preset){
	localStorage.setItem(ACTIVE_PRESET_KEY, JSON.stringify(preset))
}

export async function listPresets(){

	const builtins = [builtinPresets.darkAges, builtinPresets.masquerade]
	const custom = isVaultConnected() ? await listVaultLibraries() : []

	return { builtins, custom }
}

export function switchToBuiltinPreset(id){

	applyPresetData(builtinPresets[id].data)
	setActivePreset({ id, builtin: true, name: builtinPresets[id].name })
}

export async function switchToCustomPreset(fileName){

	const file = await readVaultLibraryFile(fileName)
	const data = JSON.parse(await file.text())

	applyPresetData(data)
	setActivePreset({ id: fileName, builtin: false, name: { ru: data._name || fileName, en: data._name || fileName } })
}

export function resetActivePresetToDefault(){

	const active = getActivePreset()
	if(!active.builtin) return

	applyPresetData(builtinPresets[active.id].data)
}

export async function saveCurrentAsPreset(name){

	if(!isVaultConnected() && getVaultBackend() === "fs" && confirm(t("vault.connectPrompt"))){
		try{
			await connectVault()
		}catch(e){
		}
	}

	if(!isVaultConnected()) return null

	const data = { _name: name }
	for(const key in liveDicts) data[key] = liveDicts[key]

	const fileName = `${name.trim().replace(/[\\/:*?"<>|]+/g, "_") || "library"}.json`

	await writeVaultLibrary(fileName, data)
	setActivePreset({ id: fileName, builtin: false, name: { ru: name, en: name } })

	return fileName
}

export async function deleteCustomPreset(fileName){

	await deleteVaultLibraryFile(fileName)

	const active = getActivePreset()
	if(!active.builtin && active.id === fileName) switchToBuiltinPreset("darkAges")
}
