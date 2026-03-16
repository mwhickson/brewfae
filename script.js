// @ts-check
"use strict;";

import { data } from "./data.js";

const AppData = data;

class BrewConfig {
    constructor(
        Name = null,
        Settings = { Adjectives: null, Approaches: null, Aspects: null, Classes: null, Races: null, Scores: null, Troubles: null}
    ) {
        this.Name = Name ?? "";
        this.Adjectives = Settings.Adjectives ?? AppData.adjectives;
        this.Approaches = Settings.Approaches ?? AppData.approaches;
        this.Aspects = Settings.Aspects ?? AppData.aspects;
        this.Classes = Settings.Classes ?? AppData.classes;
        this.Races = Settings.Races ?? AppData.races;
        this.Scores = Settings.Scores ?? AppData.scores;
        this.Troubles = Settings.Troubles ?? AppData.troubles;
    }
}

class FAECharacter {
    Name;
    HighConcept;
    Trouble;
    Aspects;
    Stunts;
    Notes;
    Refresh;
    FatePoints;
    Stress;
    Consequences;
    Config;
    ApproachValues;

    constructor(config) {
        this.Name = "";
        this.HighConcept = "";
        this.Trouble = "";
        this.Aspects = [];
        this.Stunts = [];
        this.Notes = "";
        this.Refresh = 3;
        this.FatePoints = 3;
        this.Stress = [false, false, false];
        this.Consequences = { Mild: "", Moderate: "", Severe: "" };
        this.Config = config;
        this.ApproachValues = {};
        this.Config.Approaches.forEach(
            (a) => {
                this.ApproachValues[a] = 0;
            }
        );
    }
}

const FantasySettings = { Approaches: ["Agility", "Awareness", "Might", "Power", "Presence", "Wits"], };
const MyConfig = new BrewConfig("Fantasy", FantasySettings);

let currentCharacter = new FAECharacter(MyConfig);

class UIHelper {
    static GetElement(id = "") {
        return document.getElementById(id) || {};
    }

    static RegisterUI() {
        App.UI.Buttons.AddAspect.onclick = AppController.Handlers.addGuidedAspect;
        App.UI.Buttons.AddStunt.onclick = AppController.Handlers.addGuidedStunt;
        App.UI.Buttons.Download.onclick = AppController.Handlers.downloadJSON;
        App.UI.Buttons.Load.onclick = AppController.Handlers.loadHero;
        App.UI.Buttons.Print.onclick = AppController.Handlers.printCharacter;
        App.UI.Buttons.Save.onclick = AppController.Handlers.saveHero;

        App.UI.Inputs.Name.oninput = () => AppController.Handlers.updateCharacter("Name", App.UI.Inputs.Name.value);
        App.UI.Inputs.HighConcept.oninput = () => AppController.Handlers.updateCharacter("HighConcept", App.UI.Inputs.HighConcept.value);
        App.UI.Inputs.Trouble.oninput = () => AppController.Handlers.updateCharacter("Trouble", App.UI.Inputs.Trouble.value);
        App.UI.Inputs.TroubleDetail.oninput = () => AppController.Handlers.buildTrouble();
        // App.UI.Inputs.Aspect
        // App.UI.Inputs.Approach
        App.UI.Inputs.Refresh.onchange = () => AppController.Handlers.updateCharacter("Refresh", App.UI.Inputs.Refresh.value);
        App.UI.Inputs.FatePoint.onchange = () => AppController.Handlers.updateCharacter("FatePoints", App.UI.Inputs.FatePoint.value);
        App.UI.Inputs.Notes.oninput = () => AppController.Handlers.updateCharacter("Notes", App.UI.Inputs.Notes.value);
        // App.UI.Inputs.Stunt
        App.UI.Inputs.Consequence.Mild.oninput = () => AppController.Handlers.updateConsequence("Mild", App.UI.Inputs.Consequence.Mild.value);
        App.UI.Inputs.Consequence.Moderate.oninput = () => AppController.Handlers.updateConsequence("Moderate", App.UI.Inputs.Consequence.Moderate.value);
        App.UI.Inputs.Consequence.Severe.oninput = () => AppController.Handlers.updateConsequence("Severe", App.UI.Inputs.Consequence.Severe.value);

        App.UI.Selects.Adjective.onchange = () => AppController.Handlers.buildConcept();
        App.UI.Selects.Class.onchange = () => AppController.Handlers.buildConcept();
        App.UI.Selects.Race.onchange = () => AppController.Handlers.buildConcept();
        App.UI.Selects.StuntType.onchange = () => AppController.Handlers.toggleStuntUI();
        App.UI.Selects.TroubleStarter.onchange = () => AppController.Handlers.buildTrouble();
    }
}

class App {
    static UI = {
        Buttons: {
            AddAspect: UIHelper.GetElement("add-aspect-button"),
            AddStunt: UIHelper.GetElement("add-stunt-button"),
            Download: UIHelper.GetElement("download-button"),
            Load: UIHelper.GetElement("load-button"),
            Print: UIHelper.GetElement("print-button"),
            Save: UIHelper.GetElement("save-button"),
        },
        Display: {
            ScoreArray: UIHelper.GetElement("score-array"),
        },
        Inputs: {
            Name: UIHelper.GetElement("name-input"),
            HighConcept: UIHelper.GetElement("high-concept-input"),
            Trouble: UIHelper.GetElement("trouble-input"),
            TroubleDetail: UIHelper.GetElement("trouble-detail-input"),
            Aspect: UIHelper.GetElement("aspect-input"),
            Approach: {
                A: UIHelper.GetElement("approach-a-input"),
                B: UIHelper.GetElement("approach-b-input"),
                C: UIHelper.GetElement("approach-c-input"),
                D: UIHelper.GetElement("approach-d-input"),
                E: UIHelper.GetElement("approach-e-input"),
                F: UIHelper.GetElement("approach-f-input"),
            },
            Refresh: UIHelper.GetElement("refresh-input"),
            FatePoint: UIHelper.GetElement("fate-point-input"),
            Notes: UIHelper.GetElement("notes-input"),
            Stunt: UIHelper.GetElement("stunt-input"),
            Consequence: {
                Mild: UIHelper.GetElement("mild-consequence-input"),
                Moderate: UIHelper.GetElement("moderate-consequence-input"),
                Severe: UIHelper.GetElement("severe-consequence-input"),
            }
        },
        Selects: {
            Adjective: UIHelper.GetElement("adjective-selector"),
            Class: UIHelper.GetElement("class-selector"),
            Race: UIHelper.GetElement("race-selector"),
            StuntType: UIHelper.GetElement("stunt-type"),
            TroubleStarter: UIHelper.GetElement("trouble-starter"),
        },
    }
}

class AppController {
    static Handlers = {
        addGuidedAspect: () => {
            const t = UIHelper.GetElement("aspect-template").value;
            const d = App.UI.Inputs.Aspect.value?.trim();
            if (t || d) {
                currentCharacter.Aspects.push(t ? `${t} ${d || "..."}` : d);
                AppController.renderLists();
                AppController.updateJSON();

                App.UI.Inputs.Aspect.value = "";
                App.UI.Inputs.Aspect.focus();
            }
        },

        addGuidedStunt: () => {
            const type = UIHelper.GetElement("stunt-type").value;
            const reason = UIHelper.GetElement("stunt-reason").value.trim() || "...";
            const stunt = type === "bonus" ?
                `Because I ${reason}, I get +2 to ${UIHelper.GetElement("stunt-approach").value} when I ${UIHelper.GetElement("stunt-circumstance").value || "..."}.` :
                `Because I ${reason}, once per session I can ${UIHelper.GetElement("stunt-action").value || "..."}.`;
            currentCharacter.Stunts.push(stunt);
            AppController.renderLists();
            AppController.updateJSON();

            UIHelper.GetElement("stunt-reason").value = "";
            UIHelper.GetElement("stunt-approach").value = null;
            UIHelper.GetElement("stunt-circumstance").value = "";
            UIHelper.GetElement("stunt-action").value = "";
            UIHelper.GetElement("stunt-reason").focus();
        },

        addListItem: (type) => {
            currentCharacter[type].push("");
            AppController.renderLists();
            AppController.updateJSON();
        },

        buildConcept: () => {
            const full = [
                App.UI.Selects.Adjective.value,
                App.UI.Selects.Race.value,
                App.UI.Selects.Class.value
            ].filter(Boolean).join(" ");

            if (full) {
                App.UI.Inputs.HighConcept.value = full;
                AppController.Handlers.updateCharacter("HighConcept", full);
            }
        },

        buildTrouble: () => {
            const p = App.UI.Selects.TroubleStarter.value;
            const s = App.UI.Inputs.TroubleDetail.value?.trim();
            const full = p === "Too" ? `Too ${s || "[...]"} for my own good` : (p && s ? `${p} ${s}` : s || p);
            if (full) {
                App.UI.Inputs.Trouble.value = full;
                AppController.Handlers.updateCharacter("Trouble", full);
            }
        },

        downloadJSON: () => {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(
                new Blob([JSON.stringify(currentCharacter, null, 2)], { type: "application/json" })
            );
            a.download = `${currentCharacter.Name?.trim().replaceAll(/\s/g, "-").toLocaleLowerCase() || "fae-character"}.json`;
            a.click();
        },

        loadHero: () => {
            const data = localStorage.getItem(AppData.STORAGE_KEY);
            if (!data) { return; }

            currentCharacter = Object.assign(new FAECharacter(MyConfig), JSON.parse(data));

            UIHelper.GetElement("name-input").value = currentCharacter.Name;
            UIHelper.GetElement("high-concept-input").value = currentCharacter.HighConcept;
            UIHelper.GetElement("trouble-input").value = currentCharacter.Trouble;
            UIHelper.GetElement("notes-input").value = currentCharacter.Notes;
            UIHelper.GetElement("refresh-input").value = currentCharacter.Refresh;
            UIHelper.GetElement("fate-point-input").value = currentCharacter.FatePoints;
            UIHelper.GetElement("mild-consequence-input").value = currentCharacter.Consequences.Mild;
            UIHelper.GetElement("moderate-consequence-input").value = currentCharacter.Consequences.Moderate;
            UIHelper.GetElement("severe-consequence-input").value = currentCharacter.Consequences.Severe;

            AppController.init();
            AppController.showStatus("Loaded.");
        },

        printCharacter: () => {
            AppController.renderLists(); // make sure that Aspects and Stunts are up to date
            window.print();
        },

        removeListItem: (t, i) => {
            currentCharacter[t].splice(i, 1);
            AppController.renderLists();
            AppController.updateJSON();
        },

        saveHero: () => {
            localStorage.setItem(AppData.STORAGE_KEY, JSON.stringify(currentCharacter));
            AppController.showStatus("Saved.");
        },

        toggleStress: (i) => {
            currentCharacter.Stress[i] = !currentCharacter.Stress[i];
            AppController.renderStress();
            AppController.updateJSON();
        },

        toggleStuntUI: () => {
            const type = UIHelper.GetElement("stunt-type").value;
            UIHelper.GetElement("stunt-ui-bonus").style.display = (type === "bonus") ? "inline" : "none";
            UIHelper.GetElement("stunt-ui-special").style.display = (type === "special") ? "inline" : "none";
        },

        updateApproach: (a, v) => {
            console.log("updateApproach", a, v); // DEBUG:
            currentCharacter.ApproachValues[a] = parseInt(v);
            AppController.updateJSON();
        },

        updateConsequence: (l, v) => {
            currentCharacter.Consequences[l] = v;
            AppController.updateJSON();
        },

        updateCharacter: (f, v) => {
            currentCharacter[f] = v;

            switch (f) {
                case "HighConcept":
                    AppController.mirrorPrintFields(v, "high-concept-display");
                    break;
                case "Trouble":
                    AppController.mirrorPrintFields(v, "trouble-display");
                    break;
                case "Notes":
                    AppController.mirrorPrintFields(v, "notes-display");
                    break;
            }

            AppController.updateJSON();
        },

        updateListItem: (t, i, v) => {
            currentCharacter[t][i] = v;
            AppController.updateJSON();
        },
    };

    static init() {
        UIHelper.RegisterUI();

        AppController.renderApproaches();
        AppController.renderLists();
        AppController.renderStress();
        AppController.populateAll();
        AppController.updateJSON();
    }

    static mirrorPrintFields(v, id) {
        const dest = UIHelper.GetElement(id);
        dest.innerText = v;
    }

    static populateAdjectives() {
        UIHelper.GetElement("adjective-selector").innerHTML = "<option></option>" + currentCharacter.Config.Adjectives.map(
            (a) => `<option>${a}</option>`
        ).join("");
    }

    static populateAspects() {
        UIHelper.GetElement("aspect-template").innerHTML = "<option></option>" + currentCharacter.Config.Aspects.map(
            (a) => `<option value="${a.value}">${a.text}</option>`
        ).join("");
    }

    static populateClasses() {
        UIHelper.GetElement("class-selector").innerHTML = "<option></option>" + currentCharacter.Config.Classes.map(
            (c) => `<option>${c}</option>`
        ).join("");
    }

    static populateRaces() {
        UIHelper.GetElement("race-selector").innerHTML = "<option></option>" + currentCharacter.Config.Races.map(
            (r) => `<option>${r}</option>`
        ).join("");
    }

    static populateScoreArray() {
        UIHelper.GetElement("score-array").innerHTML = currentCharacter.Config.Scores.join(", ");
    }

    static populateStuntApproaches() {
        UIHelper.GetElement("stunt-approach").innerHTML = "<option></option>" + currentCharacter.Config.Approaches.map(
            (a) => `<option value="${a}">${a}</option>`
        ).join("");
    }

    static populateTroubleStarters() {
        UIHelper.GetElement("trouble-starter").innerHTML = "<option></option>" + currentCharacter.Config.Troubles.map(
            (t) => `<option value="${t.value}">${t.text}</option>`
        ).join("");
    }

    static populateAll() {
        AppController.populateAdjectives();
        AppController.populateAspects();
        AppController.populateClasses();
        AppController.populateRaces();
        AppController.populateScoreArray();
        AppController.populateStuntApproaches();
        AppController.populateTroubleStarters();
    }

    static renderApproaches() {
        UIHelper.GetElement("approach-list").innerHTML = currentCharacter.Config.Approaches.map((appr) => `
            <div class="approach-row">
                <label>${appr}</label>
                <input type="number" value="${currentCharacter.ApproachValues[appr] || 0}" min="0" max="5" onchange="controller.Handlers.updateApproach('${appr}', this.value)">
            </div>
        `).join("");
    }

    static renderLists() {
        UIHelper.GetElement("aspect-list").innerHTML = currentCharacter.Aspects.map((val, i) => `
            <div class="list-item">
                <input type="text" value="${val}" oninput="controller.Handlers.updateListItem('Aspects', ${i}, this.value)" class="no-print">
                <div class="print-only">${val}</div>
                <button class="danger no-print" onclick="controller.Handlers.removeListItem('Aspects', ${i})">×</button>
            </div>
        `).join("");

        UIHelper.GetElement("stunt-list").innerHTML = currentCharacter.Stunts.map((val, i) => `
            <div class="list-item">
                <input type="text" value="${val}" oninput="controller.Handlers.updateListItem('Stunts', ${i}, this.value)" class="no-print">
                <div class="print-only">${val}</div>
                <button class="danger no-print" onclick="controller.Handlers.removeListItem('Stunts', ${i})">×</button>
            </div>
        `).join("");
    }

    static renderStress() {
        UIHelper.GetElement("stress-track").innerHTML = currentCharacter.Stress.map((checked, i) => `
            <div class="stress-box ${checked ? "checked" : ""}" onclick="controller.Handlers.toggleStress(${i})">${i + 1}</div>
        `).join("");
    }

    static showStatus(m) {
        UIHelper.GetElement("save-status").innerText = `[${new Date().toLocaleTimeString()}] ${m}`;
    }

    static updateJSON() {
        UIHelper.GetElement("json-output").innerText = JSON.stringify(currentCharacter, null, 2);
    };
}

export { App, AppController, currentCharacter as currentHero }
