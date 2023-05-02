# Obsidian Krake (OK)
Obsidian Plugin zur Aufgabenverwaltung (GTD-ish).

## TODO
- Issues anlegen?

## Projekt-Ziele
- flexible Aufgabenverwaltung in Obsidian
- GTD fähig
- Review-Funktion für Tasks/Projects/Topics
- Nutzer soll Styles anpassen können und/oder Styles nutzen Theme

## Fragen
- Code, Issues, Doku auf Deutsch oder Englisch?
- wer kennt sich ein bisschen besser mit Github (Actions) aus?

## Dev
### Tools / Setup
- pnpm
- svelte-kit
- aktuellste Version von Obsidian mit [Hot Reload Plugin](https://github.com/pjeby/hot-reload)
- dieses Repo in einen Dev-Vault klonen (`./<mein Dev Vault>/.obsidian/plugins/obsidian-krake/`)
  - main.js und styles.css (nach Build) + manifest.json befinden sich in Root-Folder, damit Dev-Vault das Plugin erkennt und nutzt

### Workflows
- `pnpm dev` startet watch mode, der das Plugin automatisch im Root-Order aktualisiert
  - entspricht Plugin-Ordner in Dev-Vault, wenn aufgesetzt, wie in Setup beschrieben
- `pnpm storybook` startet Storybook
- `test:unit`führt Unit Tests aus
  - am besten mit https://marketplace.visualstudio.com/items?itemName=ZixuanChen.vitest-explorer

## "Deploy"
Aktuell kann man `./plugin` bauen (`pnpm build:prod`) und `main.js`, `styles.css` und `manifest.json` aus dem Root-Folder in einen Obsidian Vault Plugin Ordner kopieren (`./<mein Vault>/.obsidian/plugins/obsidian-krake/`).
Eventuell in Obisian Community Plugins aktivieren.

### Tools
- ist auf die neuste Version von Obisdian ausgelegt
- sollte mit `Calendar` Plugin genutzt werden (um Aufgaben für diesen Tag zu sehen) - mögliches Template:
```
    ```krake
    type:daily-header
    ```
    ### Tägliche Aktionen
    - [ ] Spazieren gehen
    - [ ] Wasser trinken

    ### Notizen
```