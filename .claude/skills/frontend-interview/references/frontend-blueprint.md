# Contratto `blueprint/frontend.yaml`

Usare questa forma come riferimento; aggiungere dettagli solo quando guidano implementazione o verifica.

```yaml
schema_version: 1
status: draft
technology:
  framework: nextjs
  language: typescript
  package_manager: pnpm
  rendering: hybrid
design_source:
  path: DESIGN
  fidelity: reference
design_language:
  layout: sidebar fissa + contenuto a card, larghezza massima 1200px
  tokens:
    colors: { primary: '#2563EB', background: '#F8FAFC', text: '#0F172A' }
    typography: { family: Inter, scale: [14, 16, 20, 28] }
    spacing: [4, 8, 16, 24, 40]
    radius: 8
  breakpoints: [768, 1200]
routes:
  - id: FE-ROUTE-001
    path: /projects
    description: Consultare i progetti
    design_ref: projects.html
    states: [loading, empty, error, success]
flows:
  - id: FE-FLOW-001
    description: Aprire un progetto
    routes: [FE-ROUTE-001]
    acceptance: [AC-PROJECT-OPEN]
    operations: [listProjects, getProject]
    required_inputs: []
    required_actions: [Apri progetto]
    expected_outcomes: [Dettaglio progetto, URL progetto]
components:
  - id: project-card
    responsibility: Mostrare il riepilogo di un progetto
data_requirements:
  - id: FE-DATA-001
    route: FE-ROUTE-001
    direction: read
    purpose: Elencare i progetti visibili
    operation_id: listProjects
verification:
  component_test: pnpm --dir frontend test
  visual_test: pnpm --dir frontend test:e2e
  accessibility_test: pnpm --dir frontend test:a11y
```

Compilare `operation_id` insieme alla skill ponte: deve coincidere con l'OpenAPI e con `backend.operations[].interface_operation`.

`flows[].operations` elenca tutte le operationId attraversate dal journey, comprese quelle derivate dai `data_requirements` delle route; `required_inputs: []` solo quando il flow non compila nulla. La journey `system-e2e` di `architecture.yaml` copia identiche queste liste e gli ID (regola completa in `SKILL.md`).

`design_language` contiene i valori osservati nella bozza (token, layout, breakpoint); `design_ref` è il file di `DESIGN/` che mostra la route. Guidano la skill `design-implement` e il filone visivo del piano.
