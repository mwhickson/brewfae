# Brew FAE

## Overview

A vibe-coded (with [Google Gemini](https://gemini.google.com/)) Fate Accelerated (FAE) character creation tool.

Long story short, I wanted a custom (fantasy) themed FAE character creation tool I could pass off to players to guide them during character creation. I started whipping something up, quickly decided I would rather be crafting play materials and actually running the game instead of writing tooling and here we are.

## Features

The tool was originally going to be a "skinnable" character creation tool, using the FAE defaults and allowing things like overriding the `Approach` names, and maybe things like the `Stress` box counts, available `Consequences`, etc. There are still shades of that in the source, but they'd need to be dredged up into something more useful.

The feature list, as it evolved, came down to:

- renamed `Approaches`
- fantasy themed, guided character creation for:
    - `High Concept`
    - `Trouble`
    - `Aspects`
    - `Stunts` (allows for both stunt templates, e.g. `+2` and `once per session`)
- freeform entry for guided character creation fields
- saving and loading using `LocalStorage`
- printing (for PDF export)
- JSON data preview and export

## TODO

Things I would like, but aren't dealbreakers at present are:

- character validation
- random name generation
- true PDF export
- if I were to release this as a bonafide tool for others, some kind of internationalization/localization support

## Screenshots

### Screen UI

![Screen UI](ui.png)

### Print Output

![Print Output](print.png)

## References

These are some helpful references for getting/playing FAE.

* [Fate Accelerated Edition at Evil Hat Producions](https://evilhat.com/product/fate-accelerated-edition/)
* [Fate Accelerated SRD at Fate SRD](https://fate-srd.com/fate-accelerated)
* [Fate RPG Stuntmaker](https://fate-srd.com/stuntmaker/index.html)
* [Sunday-Skypers : FATE Sword & Sorcery (example)](https://sunday-skypers.podbean.com/e/fate-sword-sorcery-two-had-adventure-thrust-upon-them/)
