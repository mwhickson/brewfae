# Brew FAE

## Overview

A guided Fate Accelerated Edition (FAE) character creation tool.

Intended to be a custom, easy to use, fantasy-themed FAE character creation tool to guide new players through character creation.

> Initially vibe-coded (with [Google Gemini](https://gemini.google.com/)); however, it didn't take long before the generated app reached a point where Gemini wasn't effective at maintaining it. Also, after code review, I didn't like the code and refactored. The initial vibe-coded version did get me over the hurdle of getting started though, and almost got me to where I wanted to go.

## Features

The tool was originally going to be a "skinnable" character creation tool, using the FAE defaults and allowing things like overriding the `Approach` names, and things like the `Stress` box counts, available `Consequences`, etc.

I would like to revisit that in future.

A list of current features includes:

- renamed `Approaches` to more closely align with other fantasy RPG attribute names
- fantasy themed, guided character creation for:
    - `High Concept`
    - `Trouble`
    - `Aspects`
    - `Stunts` (allows for both stunt templates, e.g. `+2` and `once per session`)
- saving and loading using `LocalStorage` (single character slot)
- printing (for PDF export)
- JSON data export
- system aligned light or dark mode

## TODO

Future niceties:

- random name generation
- random character generation
- more character save slots
- character validation based on scenario/campaign appropriate rules
- true PDF export
- multi-genre support (horror, sci-fi, spy, etc.)
- if I were to release this as a bonafide tool for others, some kind of internationalization/localization support
- external character JSON parsing utility for things like printing, sharing, VTT imports, etc.

## Screenshots

### Screen UI

![Screen UI](ui.png)

### Print Output

![Print Output](print.png)

## Running locally

Now that files have been split out into `CSS` and `JS` there is `CORS` to consider for local development.

Run a local webserver to serve up a functional version.

I recommend Python (if it's available), but many other quick 'n' dirty serve solutions exist.

```bash
cd /path/to/brewfae/
python -m http.server # you might need to use `python3`

# visit the hosting url in your browser (default is http://0.0.0.0:8000/)
```

## References

These are some helpful references for getting/playing FAE.

* [Fate Accelerated Edition at Evil Hat Producions](https://evilhat.com/product/fate-accelerated-edition/)
* [Fate Accelerated SRD at Fate SRD](https://fate-srd.com/fate-accelerated)
* [Fate RPG Stuntmaker](https://fate-srd.com/stuntmaker/index.html)
* [Sunday-Skypers : FATE Sword & Sorcery (example)](https://sunday-skypers.podbean.com/e/fate-sword-sorcery-two-had-adventure-thrust-upon-them/)
