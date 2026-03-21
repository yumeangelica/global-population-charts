# Global Population Charts

A vanilla JavaScript application that visualizes global population data through interactive charts, using World Bank API data. Zero framework dependencies — only Chart.js for visualization.

Originally developed in 2021, modernized in 2024–2026 with portfolio-synced design, accessibility support, and responsive layout.

## Features

- **Country Code Input** — enter any three-letter ISO 3166-1 alpha-3 code
- **34 Demographic Indicators** — population totals, growth rates, age distribution, dependency ratios, birth/death rates, fertility, life expectancy, mortality, urban/rural data, density, survival rates
- **Interactive Charts** — responsive bar charts powered by Chart.js with custom portfolio-themed colors
- **Input Validation** — 3-letter code validation with error feedback
- **Loading States** — button state changes during API fetch
- **Accessibility** — ARIA labels, keyboard navigation (Enter to submit), screen reader announcements
- **Responsive Design** — mobile-first layout from 480px to desktop

## Technologies

- **Vanilla JavaScript (ES6+)** — async/await, DOM manipulation, no frameworks
- **HTML5** — semantic markup with ARIA attributes
- **CSS3** — custom properties, Flexbox, responsive design
- **Google Fonts (Inter)** — consistent typography across portfolio
- **Chart.js 4.5.0** — interactive data visualization
- **World Bank API** — real-time demographic data
- **Zero Framework Dependencies** — no Bootstrap, no npm packages

## Getting Started

1. Open `index.html` in any modern web browser
2. Enter a valid three-letter country code (e.g., `JPN`, `USA`, `FIN`)
3. Select a population indicator from the dropdown
4. Click "Generate Chart" or press Enter

## Project Structure

```
├── index.html      # Main HTML document
├── styles.css      # All styles with CSS custom properties
├── app.js          # API integration, chart rendering, validation
├── copyright.js    # Dynamic footer copyright year
├── LICENSE         # CC BY-NC-SA 4.0
└── README.md
```

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+
- Mobile: iOS Safari, Chrome Mobile, Samsung Internet

## License

This project is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License. See the [LICENSE](LICENSE) file for details.

---

**Created with love by [yumeangelica](https://yumeangelica.github.io) | 2021–2026**