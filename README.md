# Obsidian Krake (OK)
Obsidian Plugin zur Aufgabenverwaltung (GTD-ish).

## TODO
- neues git-Repo
- publish git-repo
- Issues anlegen?
- in Discord veröffentlichen

## Projekt-Ziele
- flexible Aufgabenverwaltung in Obsidian
- GTD fähig
- Review-Funktion für Tasks/Projects/Topics
- Nutzer soll Styles anpassen können und/oder Styles nutzen Theme

## Fragen
- eigenes Projekt für `ui_components` nötig oder lieber alles in `plugin` Projekt verschieben?
- Code, Issues, Doku auf Deutsch oder Englisch?
- wer kennt sich ein bisschen besser mit Github aus?

## Dev
### Tools / Setup
- pnpm
- svelte-kit
- aktuellste Version von Obsidian mit [Hot Reload Plugin](https://github.com/pjeby/hot-reload)
- dieses Repo in einen Dev-Vault klonen ()`./<mein Dev Vault>/.obsidian/plugins/obsidian-krake/`)
  - main.js und styles.css (nach Build) + manifest.json befinden sich in Root-Folder, damit Dev-Vault das Plugin erkennt und nutzt

### Workflow
- aktuell sind die Svelte-Components in `./ui_components` ausgelagert, um per `pnpm dev` eine "Playground"-Seite nutzen zu können
- `pnpm build` in `./ui_components` aktualisiert Svelte Componenten (und anderen Kram) in plugin

## "Deploy"
Aktuell kann man `./plugin` bauen (`pnpm build:prod`) und den Inhalt aus `./plugin/build` und `./plugin/manifest.json` aus dem Root-Folder in einen Obsidian Vault Plugin Ordner kopieren (`./<mein Vault>/.obsidian/plugins/obsidian-krake/`).

### Tools
- ist auf die neuste Version von Obisdian ausgelegt
- sollte mit `Calendar` Plugin genutzt werden (um Aufgaben für diesen Tag zu sehen) - mögliches Template:
```
    ```krake
    type:daily-header
    ```

    ### Fällige Projekte
    ```krake
    type:projects
    due_date:<{{date+8d:DD.MM.YYYY}}
    done:={{date:DD.MM.YYYY}}
    ```

    ### Fällige Tasks
    ```krake
    type:tasks
    due_date:<{{date+8d:DD.MM.YYYY}}
    done:={{date:DD.MM.YYYY}}
    ```

    ### Geplante Tasks
    ```krake
    type:tasks
    do_date:<{{date+1d:DD.MM.YYYY}}
    done:={{date:DD.MM.YYYY}}
    ```

    ---

    ### Notizen
```