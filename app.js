(() => {
  'use strict';

  /** @typedef {'integer' | 'percent' | 'decimal'} ValueFormat */
  /** @typedef {{ value: string, label: string, format: ValueFormat }} Indicator */
  /** @typedef {{ year: string, value: number }} DataRow */
  /** @typedef {{ rows: DataRow[], countryName: string, indicator: Indicator }} ChartData */
  /** @typedef {{ date?: string | number, value?: unknown, country?: { value?: string } }} WorldBankRecord */
  /** @typedef {{ destroy: () => void }} ChartInstance */
  /** @typedef {new (canvas: HTMLCanvasElement, config: object) => ChartInstance} ChartConstructor */

  /** @type {Indicator[]} */
  const INDICATORS = [
    { value: 'SP.POP.TOTL', label: 'Population, total', format: 'integer' },
    { value: 'SP.POP.TOTL.MA.IN', label: 'Male population, total', format: 'integer' },
    { value: 'SP.POP.TOTL.FE.IN', label: 'Female population, total', format: 'integer' },
    { value: 'SP.POP.GROW', label: 'Population growth (annual %)', format: 'percent' },
    { value: 'SP.POP.DPND', label: 'Age dependency ratio (% of working-age population)', format: 'percent' },
    { value: 'SP.POP.DPND.YG', label: 'Young dependency ratio (% of working-age population)', format: 'percent' },
    { value: 'SP.POP.DPND.OL', label: 'Old-age dependency ratio (% of working-age population)', format: 'percent' },
    { value: 'SP.DYN.CBRT.IN', label: 'Birth rate (per 1,000 people)', format: 'decimal' },
    { value: 'SP.DYN.CDRT.IN', label: 'Death rate (per 1,000 people)', format: 'decimal' },
    { value: 'SP.DYN.TFRT.IN', label: 'Fertility rate (births per woman)', format: 'decimal' },
    { value: 'SP.DYN.LE00.IN', label: 'Life expectancy at birth, total (years)', format: 'decimal' },
    { value: 'SP.DYN.LE00.FE.IN', label: 'Life expectancy at birth, female (years)', format: 'decimal' },
    { value: 'SP.DYN.LE00.MA.IN', label: 'Life expectancy at birth, male (years)', format: 'decimal' },
    { value: 'SP.DYN.IMRT.IN', label: 'Infant mortality rate (per 1,000 live births)', format: 'decimal' },
    { value: 'SP.DYN.AMRT.FE', label: 'Adult mortality rate, female (per 1,000 adults)', format: 'decimal' },
    { value: 'SP.DYN.AMRT.MA', label: 'Adult mortality rate, male (per 1,000 adults)', format: 'decimal' },
    { value: 'SP.POP.65UP.TO.ZS', label: 'Population ages 65+ (% of total)', format: 'percent' },
    { value: 'SP.POP.65UP.FE.IN', label: 'Female population ages 65+', format: 'integer' },
    { value: 'SP.POP.65UP.MA.IN', label: 'Male population ages 65+', format: 'integer' },
    { value: 'SP.POP.1564.TO.ZS', label: 'Population ages 15–64 (% of total)', format: 'percent' },
    { value: 'SP.POP.1564.FE.IN', label: 'Female population ages 15–64', format: 'integer' },
    { value: 'SP.POP.1564.MA.IN', label: 'Male population ages 15–64', format: 'integer' },
    { value: 'SP.POP.0014.TO.ZS', label: 'Population ages 0–14 (% of total)', format: 'percent' },
    { value: 'SP.POP.0014.FE.IN', label: 'Female population ages 0–14', format: 'integer' },
    { value: 'SP.POP.0014.MA.IN', label: 'Male population ages 0–14', format: 'integer' },
    { value: 'SP.URB.TOTL.IN.ZS', label: 'Urban population (% of total)', format: 'percent' },
    { value: 'SP.URB.TOTL', label: 'Urban population, total', format: 'integer' },
    { value: 'SP.URB.GROW', label: 'Urban population growth (annual %)', format: 'percent' },
    { value: 'SP.RUR.TOTL.ZS', label: 'Rural population (% of total)', format: 'percent' },
    { value: 'SP.RUR.TOTL', label: 'Rural population, total', format: 'integer' },
    { value: 'SP.RUR.TOTL.ZG', label: 'Rural population growth (annual %)', format: 'percent' },
    { value: 'EN.POP.DNST', label: 'Population density (people per sq. km)', format: 'decimal' },
    { value: 'SP.DYN.TO65.FE.ZS', label: 'Survival to age 65, female (% of cohort)', format: 'percent' },
    { value: 'SP.DYN.TO65.MA.ZS', label: 'Survival to age 65, male (% of cohort)', format: 'percent' },
  ];

  const elements = {
    form: /** @type {HTMLFormElement} */ (document.getElementById('chart-form')),
    country: /** @type {HTMLInputElement} */ (document.getElementById('country')),
    countryError: /** @type {HTMLParagraphElement} */ (document.getElementById('country-error')),
    indicator: /** @type {HTMLSelectElement} */ (document.getElementById('indicator-code')),
    indicatorError: /** @type {HTMLParagraphElement} */ (document.getElementById('indicator-error')),
    button: /** @type {HTMLButtonElement} */ (document.getElementById('generate-button')),
    buttonLabel: /** @type {HTMLSpanElement} */ (document.querySelector('#generate-button .button-label')),
    buttonIcon: /** @type {HTMLSpanElement} */ (document.querySelector('#generate-button .button-icon')),
    status: /** @type {HTMLParagraphElement} */ (document.getElementById('form-status')),
    results: /** @type {HTMLElement} */ (document.getElementById('results')),
    resultTitle: /** @type {HTMLHeadingElement} */ (document.getElementById('result-title')),
    resultSummary: /** @type {HTMLParagraphElement} */ (document.getElementById('result-summary')),
    canvas: /** @type {HTMLCanvasElement} */ (document.getElementById('population-chart')),
    tableCaption: /** @type {HTMLTableCaptionElement} */ (document.getElementById('data-caption')),
    tableBody: /** @type {HTMLTableSectionElement} */ (document.getElementById('data-table-body')),
  };

  const chartWindow = /** @type {Window & typeof globalThis & { Chart?: ChartConstructor }} */ (window);
  /** @type {ChartInstance | null} */
  let chart = null;
  /** @type {ChartData | null} */
  let lastChartData = null;
  /** @type {AbortController | null} */
  let activeController = null;
  let activeRequestId = 0;

  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const populateIndicators = () => {
    const fragment = document.createDocumentFragment();

    INDICATORS.forEach((indicator) => {
      const option = document.createElement('option');
      option.value = indicator.value;
      option.textContent = indicator.label;
      fragment.appendChild(option);
    });

    elements.indicator.appendChild(fragment);
  };

  const getSelectedIndicator = () => INDICATORS.find(({ value }) => value === elements.indicator.value);

  /**
   * @param {number} value
   * @param {ValueFormat} format
   * @param {boolean} [compact]
   */
  const formatValue = (value, format, compact = false) => {
    const useCompact = compact && Math.abs(value) >= 1000;
    const formatter = new Intl.NumberFormat('en-US', {
      notation: useCompact ? 'compact' : 'standard',
      maximumFractionDigits: format === 'integer' ? (useCompact ? 1 : 0) : 2,
    });
    const suffix = format === 'percent' ? '%' : '';
    return `${formatter.format(value)}${suffix}`;
  };

  /**
   * Keep compact axis labels distinct when the visible range is narrow.
   * @param {number} value
   * @param {ValueFormat} format
  * @param {{ value: string | number }[]} ticks
  */
  const formatAxisValue = (value, format, ticks) => {
    if (Math.abs(value) < 1000) return formatValue(value, format);

    const magnitude = Math.abs(value);
    const divisor = magnitude >= 1_000_000_000_000
      ? 1_000_000_000_000
      : magnitude >= 1_000_000_000
        ? 1_000_000_000
        : magnitude >= 1_000_000
          ? 1_000_000
          : 1_000;
    const values = ticks.map(({ value: tickValue }) => Number(tickValue)).filter(Number.isFinite);
    const steps = values.slice(1)
      .map((tickValue, index) => Math.abs(tickValue - values[index]))
      .filter((step) => step > 0);
    const scaledStep = Math.min(...steps) / divisor;
    const maximumFractionDigits = Number.isFinite(scaledStep)
      ? Math.min(3, Math.max(1, Math.ceil(-Math.log10(scaledStep))))
      : 1;

    const formattedValue = new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits,
    }).format(value);
    return `${formattedValue}${format === 'percent' ? '%' : ''}`;
  };

  /** @param {string} [message] @param {string} [state] */
  const setStatus = (message = '', state = '') => {
    elements.status.textContent = message;
    if (state) {
      elements.status.dataset.state = state;
    } else {
      delete elements.status.dataset.state;
    }
  };

  /**
   * @param {HTMLInputElement | HTMLSelectElement} control
   * @param {HTMLElement} errorElement
   */
  const clearFieldError = (control, errorElement) => {
    control.setAttribute('aria-invalid', 'false');
    errorElement.textContent = '';
    errorElement.hidden = true;
  };

  /**
   * @param {HTMLInputElement | HTMLSelectElement} control
   * @param {HTMLElement} errorElement
   * @param {string} message
   */
  const setFieldError = (control, errorElement, message) => {
    control.setAttribute('aria-invalid', 'true');
    errorElement.textContent = message;
    errorElement.hidden = false;
  };

  /** @returns {{ countryCode: string, indicator: Indicator } | null} */
  const validateForm = () => {
    clearFieldError(elements.country, elements.countryError);
    clearFieldError(elements.indicator, elements.indicatorError);

    const countryCode = elements.country.value.trim().toUpperCase();
    /** @type {HTMLInputElement | HTMLSelectElement | null} */
    let firstInvalidControl = null;

    if (!/^[A-Z]{3}$/.test(countryCode)) {
      setFieldError(elements.country, elements.countryError, 'Enter a three-letter country code, such as FIN.');
      firstInvalidControl = elements.country;
    }

    if (!getSelectedIndicator()) {
      setFieldError(elements.indicator, elements.indicatorError, 'Choose a population indicator.');
      firstInvalidControl ??= elements.indicator;
    }

    if (firstInvalidControl) {
      setStatus('Check the highlighted field and try again.', 'error');
      firstInvalidControl.focus();
      return null;
    }

    const indicator = getSelectedIndicator();
    if (!indicator) return null;

    elements.country.value = countryCode;
    return { countryCode, indicator };
  };

  /** @param {boolean} isLoading */
  const setLoading = (isLoading) => {
    elements.form.setAttribute('aria-busy', String(isLoading));
    elements.button.disabled = isLoading;
    elements.buttonLabel.textContent = isLoading ? 'Loading data…' : 'Generate chart';
    elements.buttonIcon.textContent = isLoading ? '⏳' : '📈';
  };

  /**
   * @param {string} countryCode
   * @param {string} indicatorCode
   * @param {AbortSignal} signal
   * @returns {Promise<unknown>}
   */
  const fetchData = async (countryCode, indicatorCode, signal) => {
    const endpoint = new URL(`https://api.worldbank.org/v2/country/${encodeURIComponent(countryCode)}/indicator/${encodeURIComponent(indicatorCode)}`);
    endpoint.searchParams.set('format', 'json');
    endpoint.searchParams.set('per_page', '1000');

    const response = await fetch(endpoint, { signal });
    if (!response.ok) {
      throw new Error('The World Bank service did not respond successfully.');
    }

    return response.json();
  };

  /** @param {unknown} payload */
  const processData = (payload) => {
    const records = Array.isArray(payload) && Array.isArray(payload[1])
      ? /** @type {WorldBankRecord[]} */ (payload[1])
      : [];
    const rows = records
      .filter((record) => record?.value !== null && Number.isFinite(Number(record.value)))
      .map((record) => ({ year: String(record.date), value: Number(record.value) }))
      .sort((a, b) => Number(a.year) - Number(b.year));

    if (!rows.length) {
      throw new Error('No published values were found for this country and indicator.');
    }

    return {
      rows,
      countryName: records.find((record) => record?.country?.value)?.country?.value ?? 'Selected country',
    };
  };

  /** @param {string} token */
  const getThemeColor = (token) => getComputedStyle(document.documentElement).getPropertyValue(token).trim();

  /** @param {ChartData} data */
  const renderTable = ({ rows, countryName, indicator }) => {
    const fragment = document.createDocumentFragment();

    [...rows].reverse().forEach(({ year, value }) => {
      const row = document.createElement('tr');
      const yearCell = document.createElement('th');
      const valueCell = document.createElement('td');
      yearCell.scope = 'row';
      yearCell.textContent = year;
      valueCell.textContent = formatValue(value, indicator.format);
      row.append(yearCell, valueCell);
      fragment.appendChild(row);
    });

    elements.tableBody.replaceChildren(fragment);
    elements.tableCaption.textContent = `${indicator.label} for ${countryName}, newest year first`;
  };

  /** @param {ChartData} data */
  const renderChart = ({ rows, countryName, indicator }) => {
    lastChartData = { rows, countryName, indicator };
    elements.results.hidden = false;

    if (chart) {
      chart.destroy();
    }

    const primary = getThemeColor('--color-primary');
    const primaryDark = getThemeColor('--color-primary-dark');
    const primarySoft = getThemeColor('--color-primary-soft');
    const borderSoft = getThemeColor('--color-border-soft');
    const text = getThemeColor('--color-text');
    const white = getThemeColor('--color-white');
    const tooltipBackground = getThemeColor('--chart-tooltip-bg');
    const tooltipText = getThemeColor('--chart-tooltip-text');
    const fontFamily = 'Comfortaa, Arial, sans-serif';

    const ChartLibrary = chartWindow.Chart;
    if (!ChartLibrary) throw new Error('The chart library is unavailable.');

    chart = new ChartLibrary(elements.canvas, {
      type: 'line',
      data: {
        labels: rows.map(({ year }) => year),
        datasets: [{
          label: `${indicator.label}, ${countryName}`,
          data: rows.map(({ value }) => value),
          borderColor: primary,
          backgroundColor: primarySoft,
          pointBackgroundColor: primaryDark,
          pointBorderColor: white,
          pointRadius: 0,
          pointHoverRadius: 5,
          borderWidth: 3,
          fill: true,
          tension: 0.25,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: prefersReducedMotion() ? false : { duration: 350 },
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: tooltipBackground,
            titleColor: tooltipText,
            bodyColor: tooltipText,
            borderColor: primary,
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            titleFont: { family: fontFamily, weight: 700 },
            bodyFont: { family: fontFamily },
            callbacks: {
              label: (/** @type {{ parsed: { y: number } }} */ context) => formatValue(context.parsed.y, indicator.format),
            },
          },
        },
        scales: {
          x: {
            grid: { color: borderSoft },
            border: { color: primary },
            ticks: { color: text, font: { family: fontFamily, size: 11 }, maxTicksLimit: 10 },
          },
          y: {
            grid: { color: borderSoft },
            border: { color: primary },
            ticks: {
              color: text,
              font: { family: fontFamily, size: 11 },
              maxTicksLimit: 7,
              callback: (
                /** @type {string | number} */ value,
                /** @type {number} */ _index,
                /** @type {{ value: string | number }[]} */ ticks,
              ) => formatAxisValue(Number(value), indicator.format, ticks),
            },
          },
        },
      },
    });
  };

  /** @param {ChartData} data */
  const showResults = ({ rows, countryName, indicator }) => {
    const first = rows[0];
    const latest = rows.at(-1);
    if (!first || !latest) throw new Error('No chartable rows were provided.');
    const title = `${indicator.label} — ${countryName}`;
    const summary = `${rows.length} annual observations from ${first.year} to ${latest.year}. Latest available value: ${formatValue(latest.value, indicator.format)} in ${latest.year}.`;

    elements.resultTitle.textContent = title;
    elements.resultSummary.textContent = summary;
    elements.canvas.setAttribute('aria-label', `Line chart. ${summary}`);
    renderTable({ rows, countryName, indicator });
    renderChart({ rows, countryName, indicator });
    setStatus(`Chart ready for ${countryName}.`, 'success');

    elements.resultTitle.focus({ preventScroll: true });
    elements.results.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  /** @param {SubmitEvent} event */
  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = validateForm();
    if (!formData) return;

    if (typeof chartWindow.Chart !== 'function') {
      setStatus('The chart library could not be loaded. Check your connection and try again.', 'error');
      return;
    }

    activeController?.abort();
    activeController = new AbortController();
    const requestId = ++activeRequestId;

    setLoading(true);
    setStatus(`Loading ${formData.indicator.label.toLowerCase()}…`, 'loading');

    try {
      const payload = await fetchData(formData.countryCode, formData.indicator.value, activeController.signal);
      if (requestId !== activeRequestId) return;
      const { rows, countryName } = processData(payload);
      showResults({ rows, countryName, indicator: formData.indicator });
    } catch (error) {
      if ((error instanceof DOMException && error.name === 'AbortError') || requestId !== activeRequestId) return;
      const message = error instanceof TypeError
        ? 'The data request failed. Check your connection and try again.'
        : error instanceof Error ? error.message : 'The chart could not be generated.';
      setStatus(message, 'error');
    } finally {
      if (requestId === activeRequestId) {
        setLoading(false);
      }
    }
  };

  elements.country.addEventListener('input', () => {
    const selectionStart = elements.country.selectionStart;
    elements.country.value = elements.country.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
    if (selectionStart !== null) elements.country.setSelectionRange(selectionStart, selectionStart);
    clearFieldError(elements.country, elements.countryError);
    if (elements.status.dataset.state === 'error') setStatus();
  });

  elements.indicator.addEventListener('change', () => {
    clearFieldError(elements.indicator, elements.indicatorError);
    if (elements.status.dataset.state === 'error') setStatus();
  });

  elements.form.addEventListener('submit', handleSubmit);
  window.addEventListener('themechange', () => {
    if (lastChartData) renderChart(lastChartData);
  });
  window.addEventListener('beforeunload', () => {
    activeController?.abort();
    chart?.destroy();
  });

  populateIndicators();
})();
