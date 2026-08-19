# Global Population Charts

A static Vanilla JavaScript app for exploring country-level population and demographic trends from the World Bank. It pairs a responsive Chart.js visualization with the same values in an accessible data table.

Originally created in 2021 and polished in 2026 with yumeangelica's warm mauve design system, self-hosted Comfortaa, mobile-first CSS, and clearer form and result states.

## Features

- Three-letter country code lookup with inline validation
- 34 population, age, health, urbanization, and mortality indicators
- Complete published time series requested with `per_page=1000`
- Responsive line chart with indicator-aware number formatting
- Visible latest-value summary and expandable year/value table
- Loading, empty, network error, and superseded-request handling
- System-aware light/dark theme switch with a saved user preference
- Keyboard focus, reduced-motion, forced-colors, and zoom-friendly layouts

## Technology

- Semantic HTML, modern CSS, and Vanilla JavaScript
- [Chart.js 4.5.1](https://www.chartjs.org/) self-hosted in `vendor/` (no CDN request)
- [World Bank Indicators API v2](https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structures)
- Self-hosted Comfortaa 400/600/700 under the SIL Open Font License
- No framework, package manager, or build step

## Run locally

Open `index.html` directly, or serve the directory for a browser-like local origin:

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173`, enter a code such as `FIN`, choose an indicator, and generate a chart.

## Accessibility notes

The UI uses native form controls, inline field errors, a single polite status region, a keyboard-focusable result heading, a textual summary, and a table alternative to canvas. It targets WCAG 2.2 AA practices, but this is not a claim of complete conformance without assistive-technology and device testing.

## Project structure

```text
index.html       Semantic generator and results
styles.css       Palette A tokens and mobile-first styles
app.js           API, validation, chart, and table behavior
theme.js         Early theme setup, switch state, and saved preference
copyright.js     Current footer year
fonts/           Local Comfortaa files and OFL license
```

## License

Application code and content are licensed under [CC BY-NC-SA 4.0](LICENSE). Comfortaa remains under the SIL Open Font License in `fonts/OFL.txt`; Chart.js is distributed under its own MIT license.

---

Created with love by [yumeangelica](https://yumeangelica.github.io) · 2021–2026
