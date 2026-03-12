"use strict;";

import { data } from "./data.js";

class BrewConfig {
    constructor(Name, Approaches) {
        this.Name = Name ?? "Fantasy";
        this.Approaches = Approaches ?? ["Agility", "Awareness", "Might", "Power", "Presence", "Wits"];
    }
}

class FAECharacter {
    constructor(config) {
        this.Name = ""; this.HighConcept = ""; this.Trouble = "";
        this.Aspects = []; this.Stunts = []; this.Notes = "";
        this.Refresh = 3; this.FatePoints = 3;
        this.Stress = [false, false, false];
        this.Consequences = { Mild: "", Moderate: "", Severe: "" };
        this.Config = config;
        this.ApproachValues = {};
        this.Config.Approaches.forEach(a => this.ApproachValues[a] = 0);
    }
}

const MyConfig = new BrewConfig();
let currentHero = new FAECharacter(MyConfig);
const STORAGE_KEY = "BrewFAE_Save";
let autoSaveInterval = null;

const init = () => {
    renderApproaches(); renderLists(); renderStress();
    populateStuntApproaches(); updateJSON();
}

const renderApproaches = () => {
    document.getElementById('approach-list').innerHTML = currentHero.Config.Approaches.map(appr => `
    <div class="approach-row">
        <label style="color:#333; margin:0; text-transform:none;">${appr}</label>
        <input type="number" value="${currentHero.ApproachValues[appr] || 0}" min="0" max="5" onchange="updateApproach('${appr}', this.value)">
    </div>
`).join('');
}

const renderStress = () => {
    document.getElementById('stress-track').innerHTML = currentHero.Stress.map((checked, i) => `
    <div class="stress-box ${checked ? 'checked' : ''}" onclick="toggleStress(${i})">${i + 1}</div>
`).join('');
}

const renderLists = () => {
    document.getElementById('aspect-list').innerHTML = currentHero.Aspects.map((val, i) => `
    <div class="list-item">
        <input type="text" value="${val}" oninput="updateListItem('Aspects', ${i}, this.value)" class="no-print">
        <div class="print-only">${val}</div>
        <button class="danger no-print" onclick="removeListItem('Aspects', ${i})">×</button>
    </div>
`).join('');

    document.getElementById('stunt-list').innerHTML = currentHero.Stunts.map((val, i) => `
    <div class="list-item">
        <input type="text" value="${val}" oninput="updateListItem('Stunts', ${i}, this.value)" class="no-print">
        <div class="print-only">${val}</div>
        <button class="danger no-print" onclick="removeListItem('Stunts', ${i})">×</button>
    </div>
`).join('');
}

const mirrorPrintFields = (v, id) => {
    const dest = document.getElementById(id);
    dest.innerText = v;
}

const updateHero = (f, v) => {
    currentHero[f] = v; 

    switch(f) {
        case "HighConcept":
            mirrorPrintFields(v, "print-HighConcept");
            break;
        case "Trouble":
            mirrorPrintFields(v, "print-Trouble");
            break;
        case "Notes":
            mirrorPrintFields(v, "print-Notes");
            break;
    }

    updateJSON(); 
}
const updateApproach = (a, v) => { currentHero.ApproachValues[a] = parseInt(v); updateJSON(); }
const updateConsequence = (l, v) => { currentHero.Consequences[l] = v; updateJSON(); }
const toggleStress = (i) => { currentHero.Stress[i] = !currentHero.Stress[i]; renderStress(); updateJSON(); }
const addListItem = (type) => { currentHero[type].push(""); renderLists(); updateJSON(); }
const removeListItem = (t, i) => { currentHero[t].splice(i, 1); renderLists(); updateJSON(); }
const updateListItem = (t, i, v) => { currentHero[t][i] = v; updateJSON(); }

const buildConcept = () => {
    const full = [document.getElementById('guide-adj').value, document.getElementById('guide-race').value, document.getElementById('guide-class').value].filter(Boolean).join(' ');
    if (full) { document.getElementById('ui-HighConcept').value = full; updateHero('HighConcept', full); }
}

const buildTrouble = () => {
    const p = document.getElementById('trouble-prefix').value;
    const s = document.getElementById('trouble-suffix').value.trim();
    const full = p === "Too" ? `Too ${s || '[...]'} for my own good` : (p && s ? `${p} ${s}` : s || p);
    if (full) { document.getElementById('ui-Trouble').value = full; updateHero('Trouble', full); }
}

const addGuidedAspect = () => {
    const t = document.getElementById('aspect-template').value;
    const d = document.getElementById('aspect-detail').value.trim();
    if (t || d) { currentHero.Aspects.push(t ? `${t} ${d || '...'}` : d); renderLists(); updateJSON(); }
}

const populateStuntApproaches = () => {
    document.getElementById('stunt-approach').innerHTML = currentHero.Config.Approaches.map(a => `<option value="${a}">${a}</option>`).join('');
}

const toggleStuntUI = () => {
    const type = document.getElementById('stunt-type').value;
    document.getElementById('stunt-ui-bonus').style.display = (type === 'bonus') ? 'inline' : 'none';
    document.getElementById('stunt-ui-special').style.display = (type === 'special') ? 'inline' : 'none';
}

const addGuidedStunt = () => {
    const type = document.getElementById('stunt-type').value;
    const reason = document.getElementById('stunt-reason').value.trim() || "...";
    const stunt = type === 'bonus' ?
        `Because I ${reason}, I get +2 to ${document.getElementById('stunt-approach').value} when I ${document.getElementById('stunt-circumstance').value || '...'}.` :
        `Because I ${reason}, once per session I can ${document.getElementById('stunt-action').value || '...'}.`;
    currentHero.Stunts.push(stunt); renderLists(); updateJSON();
}

const updateJSON = () => { document.getElementById('json-output').innerText = JSON.stringify(currentHero, null, 2); }
const saveHero = () => { localStorage.setItem(STORAGE_KEY, JSON.stringify(currentHero)); showStatus("Saved."); }
const loadHero = () => {
    const data = localStorage.getItem(STORAGE_KEY); if (!data) return;
    currentHero = Object.assign(new FAECharacter(MyConfig), JSON.parse(data));
    document.getElementById('ui-Name').value = currentHero.Name;
    document.getElementById('ui-HighConcept').value = currentHero.HighConcept;
    document.getElementById('ui-Trouble').value = currentHero.Trouble;
    document.getElementById('ui-Notes').value = currentHero.Notes;
    document.getElementById('ui-Refresh').value = currentHero.Refresh;
    document.getElementById('ui-FatePoints').value = currentHero.FatePoints;
    document.getElementById('ui-Mild').value = currentHero.Consequences.Mild;
    document.getElementById('ui-Moderate').value = currentHero.Consequences.Moderate;
    document.getElementById('ui-Severe').value = currentHero.Consequences.Severe;
    init(); showStatus("Loaded.");
}

const downloadJSON = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(currentHero, null, 2)], { type: 'application/json' }));
    a.download = `${currentHero.Name || 'hero'}.json`; a.click();
}

const toggleAutoSave = (e) => { if (e) autoSaveInterval = setInterval(saveHero, 15000); else clearInterval(autoSaveInterval); }
const showStatus = (m) => { document.getElementById('save-status').innerText = `[${new Date().toLocaleTimeString()}] ${m}`; }

window.onload = init;
