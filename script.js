// @ts-check
"use strict;";

import { data } from "./data.js";

const AppData = data;

class UIHelper {
    static GetElement(id = "") {
        return document.getElementById(id) || {};
    }
}

class App {
    static UI = {
        Buttons: {
            Save: UIHelper.GetElement("save-button"),
            Load: UIHelper.GetElement("load-button"),
            Print: UIHelper.GetElement("print-button"),
            Download: UIHelper.GetElement("download-button"),
        },
        Inputs: {
            Name: UIHelper.GetElement("name-input"),
            HighConcept: UIHelper.GetElement("high-concept-input"),
            Trouble: UIHelper.GetElement("trouble-input"),
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
        Templates: {
            // style="color:#333; margin:0; text-transform:none;"
            //  onchange="updateApproach("${appr}", this.value)"
            Approach: `
                <div class="approach-row">
                    <label>{{LABEL}}</label>
                    <input id="approach-{{TAG}}-input" type="number" value="{{VALUE}}" min="0" max="5">
                </div>
            `.trim(),
            // oninput="updateListItem("Aspects", ${i}, this.value)"
            // onclick="removeListItem("Aspects", ${i})"
            Aspect: `
                <div class="list-item">
                    <input type="text" value="{{VALUE}}" class="no-print">
                    <div class="print-only">{{VALUE}}</div>
                    <button class="danger no-print">×</button>
                </div>
            `.trim(),
            // ${checked ? "checked" : ""}
            // onclick="toggleStress(${i})"
            StressBox: `
                <div id="stress-box-{{VALUE}}" class="stress-box">{{VALUE}}</div>
            `.trim(),
            // oninput="updateListItem("Stunts", ${i}, this.value)"
            // onclick="removeListItem("Stunts", ${i})"
            Stunt: `
                <div class="list-item">
                    <input type="text" value="{{VALUE}}" class="no-print">
                    <div class="print-only">{{VALUE}}</div>
                    <button class="danger no-print">×</button>
                </div>
            `.trim(),
        }
    }
}

class AppController {
    static Handlers = {
        addGuidedAspect: () => {
            const t = UIHelper.GetElement("aspect-template").value;
            const d = UIHelper.GetElement("aspect-detail").value.trim();
            if (t || d) {
                currentHero.Aspects.push(t ? `${t} ${d || "..."}` : d);
                AppController.renderLists();
                AppController.updateJSON();
            }
        },

        addGuidedStunt: () => {
            const type = UIHelper.GetElement("stunt-type").value;
            const reason = UIHelper.GetElement("stunt-reason").value.trim() || "...";
            const stunt = type === "bonus" ?
                `Because I ${reason}, I get +2 to ${UIHelper.GetElement("stunt-approach").value} when I ${UIHelper.GetElement("stunt-circumstance").value || "..."}.` :
                `Because I ${reason}, once per session I can ${UIHelper.GetElement("stunt-action").value || "..."}.`;
            currentHero.Stunts.push(stunt);
            AppController.renderLists();
            AppController.updateJSON();
        },

        addListItem: (type) => {
            currentHero[type].push("");
            AppController.renderLists();
            AppController.updateJSON();
        },

        buildConcept: () => {
            const full = [
                UIHelper.GetElement("guide-adj").value,
                UIHelper.GetElement("guide-race").value,
                UIHelper.GetElement("guide-class").value
            ].filter(Boolean).join(" ");

            if (full) {
                UIHelper.GetElement("ui-HighConcept").value = full;
                AppController.Handlers.updateHero("HighConcept", full);
            }
        },

        buildTrouble: () => {
            const p = UIHelper.GetElement("trouble-prefix").value;
            const s = UIHelper.GetElement("trouble-suffix").value.trim();
            const full = p === "Too" ? `Too ${s || "[...]"} for my own good` : (p && s ? `${p} ${s}` : s || p);
            if (full) {
                UIHelper.GetElement("ui-Trouble").value = full;
                AppController.Handlers.updateHero("Trouble", full);
            }
        },

        downloadJSON: () => {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(
                new Blob(
                    [JSON.stringify(currentHero, null, 2)],
                    { type: "application/json" }
                )
            );
            a.download = `${currentHero.Name || "hero"}.json`;
            a.click();
        },

        loadHero: () => {
            const data = localStorage.getItem(AppData.STORAGE_KEY);
            if (!data) { return; }

            currentHero = Object.assign(new FAECharacter(MyConfig), JSON.parse(data));

            UIHelper.GetElement("ui-Name").value = currentHero.Name;
            UIHelper.GetElement("ui-HighConcept").value = currentHero.HighConcept;
            UIHelper.GetElement("ui-Trouble").value = currentHero.Trouble;
            UIHelper.GetElement("ui-Notes").value = currentHero.Notes;
            UIHelper.GetElement("ui-Refresh").value = currentHero.Refresh;
            UIHelper.GetElement("ui-FatePoints").value = currentHero.FatePoints;
            UIHelper.GetElement("ui-Mild").value = currentHero.Consequences.Mild;
            UIHelper.GetElement("ui-Moderate").value = currentHero.Consequences.Moderate;
            UIHelper.GetElement("ui-Severe").value = currentHero.Consequences.Severe;

            AppController.init();
            AppController.showStatus("Loaded.");
        },

        printCharacter: () => { window.print(); },

        removeListItem: (t, i) => {
            currentHero[t].splice(i, 1);
            AppController.renderLists();
            AppController.updateJSON();
        },

        saveHero: () => {
            localStorage.setItem(AppData.STORAGE_KEY, JSON.stringify(currentHero));
            AppController.showStatus("Saved.");
        },

        toggleStress: (i) => {
            currentHero.Stress[i] = !currentHero.Stress[i];
            AppController.renderStress();
            AppController.updateJSON();
        },

        toggleStuntUI: () => {
            const type = UIHelper.GetElement("stunt-type").value;
            UIHelper.GetElement("stunt-ui-bonus").style.display = (type === "bonus") ? "inline" : "none";
            UIHelper.GetElement("stunt-ui-special").style.display = (type === "special") ? "inline" : "none";
        },

        updateApproach: (a, v) => {
            currentHero.ApproachValues[a] = parseInt(v);
            AppController.updateJSON();
        },

        updateConsequence: (l, v) => {
            currentHero.Consequences[l] = v;
            AppController.updateJSON();
        },

        updateHero: (f, v) => {
            currentHero[f] = v;

            switch (f) {
                case "HighConcept":
                    AppController.mirrorPrintFields(v, "print-HighConcept");
                    break;
                case "Trouble":
                    AppController.mirrorPrintFields(v, "print-Trouble");
                    break;
                case "Notes":
                    AppController.mirrorPrintFields(v, "print-Notes");
                    break;
            }

            AppController.updateJSON();
        },

        updateListItem: (t, i, v) => {
            currentHero[t][i] = v;
            AppController.updateJSON();
        },
    };

    static init() {
        AppController.renderApproaches();
        AppController.renderLists();
        AppController.renderStress();
        AppController.populateStuntApproaches();
        AppController.updateJSON();
    }

    static mirrorPrintFields(v, id) {
        const dest = UIHelper.GetElement(id);
        dest.innerText = v;
    }

    static populateStuntApproaches() {
        UIHelper.GetElement("stunt-approach").innerHTML = currentHero.Config.Approaches.map(a => `<option value="${a}">${a}</option>`).join("");
    }

    static renderApproaches() {
        UIHelper.GetElement("approach-list").innerHTML = currentHero.Config.Approaches.map(appr => `
            <div class="approach-row">
                <label style="color:#333; margin:0; text-transform:none;">${appr}</label>
                <input type="number" value="${currentHero.ApproachValues[appr] || 0}" min="0" max="5" onchange="updateApproach("${appr}", this.value)">
            </div>
        `).join("");
    }

    static renderLists() {
        UIHelper.GetElement("aspect-list").innerHTML = currentHero.Aspects.map((val, i) => `
            <div class="list-item">
                <input type="text" value="${val}" oninput="updateListItem("Aspects", ${i}, this.value)" class="no-print">
                <div class="print-only">${val}</div>
                <button class="danger no-print" onclick="removeListItem("Aspects", ${i})">×</button>
            </div>
        `).join("");

        UIHelper.GetElement("stunt-list").innerHTML = currentHero.Stunts.map((val, i) => `
            <div class="list-item">
                <input type="text" value="${val}" oninput="updateListItem("Stunts", ${i}, this.value)" class="no-print">
                <div class="print-only">${val}</div>
                <button class="danger no-print" onclick="removeListItem("Stunts", ${i})">×</button>
            </div>
        `).join("");
    }

    static renderStress() {
        UIHelper.GetElement("stress-track").innerHTML = currentHero.Stress.map((checked, i) => `
            <div class="stress-box ${checked ? "checked" : ""}" onclick="toggleStress(${i})">${i + 1}</div>
        `).join("");
    }

    static showStatus(m) {
        UIHelper.GetElement("save-status").innerText = `[${new Date().toLocaleTimeString()}] ${m}`;
    }

    static updateJSON() {
        UIHelper.GetElement("json-output").innerText = JSON.stringify(currentHero, null, 2);
    };
}

class BrewConfig {
    constructor(Name = "", Approaches = [""]) {
        this.Name = Name ?? "Fantasy";
        this.Approaches = Approaches ?? ["Agility", "Awareness", "Might", "Power", "Presence", "Wits"];
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
        this.Config.Approaches.forEach(a => this.ApproachValues[a] = 0);
    }
}

const MyConfig = new BrewConfig();
let currentHero = new FAECharacter(MyConfig);

window.onload = AppController.init;
