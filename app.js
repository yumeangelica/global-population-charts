// Global Population Charts Application
document.addEventListener('DOMContentLoaded', () => {
  // World Bank population indicators configuration
  const POPULATION_INDICATORS = [
    { value: 'SP.POP.TOTL', text: 'Population total' },
    { value: 'SP.POP.TOTL.MA.IN', text: 'Pop. total male' },
    { value: 'SP.POP.TOTL.FE.IN', text: 'Pop. total female' },
    { value: 'SP.POP.GROW', text: 'Population growth (annual %)' },
    { value: 'SP.POP.DPND', text: 'Age dependency ratio (% of working-age pop.)' },
    { value: 'SP.POP.DPND.YG', text: 'Age dependency ratio, young (% of working-age pop.)' },
    { value: 'SP.POP.DPND.OL', text: 'Age dependency ratio, old (% of working-age pop.)' },
    { value: 'SP.DYN.CBRT.IN', text: 'Birth rate, crude (per 1,000 people)' },
    { value: 'SP.DYN.CDRT.IN', text: 'Death rate, crude (per 1,000 people)' },
    { value: 'SP.DYN.TFRT.IN', text: 'Fertility rate, total (births per woman)' },
    { value: 'SP.DYN.LE00.IN', text: 'Life expectancy at birth, total (years)' },
    { value: 'SP.DYN.LE00.FE.IN', text: 'Life exp. at birth, female (years)' },
    { value: 'SP.DYN.LE00.MA.IN', text: 'Life exp. at birth, male (years)' },
    { value: 'SP.DYN.IMRT.IN', text: 'Mortality rate, infant (per 1,000 live births)' },
    { value: 'SP.DYN.AMRT.FE', text: 'Mortality rate, adult, female (per 1,000 female adults)' },
    { value: 'SP.DYN.AMRT.MA', text: 'Mortality rate, adult, male (per 1,000 male adults)' },
    { value: 'SP.POP.65UP.TO.ZS', text: 'Population ages 65 and above (% of total)' },
    { value: 'SP.POP.65UP.FE.IN', text: 'Pop. ages 65 and above, female' },
    { value: 'SP.POP.65UP.MA.IN', text: 'Pop. ages 65 and above, male' },
    { value: 'SP.POP.1564.TO.ZS', text: 'Population ages 15-64 (% of total)' },
    { value: 'SP.POP.1564.FE.IN', text: 'Pop. ages 15-64, female' },
    { value: 'SP.POP.1564.MA.IN', text: 'Pop. ages 15-64, male' },
    { value: 'SP.POP.0014.TO.ZS', text: 'Population ages 0-14 (% of total)' },
    { value: 'SP.POP.0014.FE.IN', text: 'Pop. ages 0-14, female' },
    { value: 'SP.POP.0014.MA.IN', text: 'Pop. ages 0-14, male' },
    { value: 'SP.URB.TOTL.IN.ZS', text: 'Urban population (% of total)' },
    { value: 'SP.URB.TOTL', text: 'Urban population' },
    { value: 'SP.URB.GROW', text: 'Urban population growth (annual %)' },
    { value: 'SP.RUR.TOTL.ZS', text: 'Rural population (% of total)' },
    { value: 'SP.RUR.TOTL', text: 'Rural population' },
    { value: 'SP.RUR.TOTL.ZG', text: 'Rural population growth (annual %)' },
    { value: 'EN.POP.DNST', text: 'Population density (people per sq. km)' },
    { value: 'SP.DYN.TO65.FE.ZS', text: 'Survival to age 65, female (% of cohort)' },
    { value: 'SP.DYN.TO65.MA.ZS', text: 'Survival to age 65, male (% of cohort)' }
  ];

  // DOM element references
  const elements = {
    countryInput: document.getElementById('country'),
    indicatorSelect: document.getElementById('indicatorCode'),
    renderButton: document.getElementById('renderButton'),
    chartContainer: document.getElementById('chartContainer'),
    chartTitle: document.getElementById('chartTitle'),
    chartCanvas: document.getElementById('myChart')
  };

  // Application state
  let currentChart = null;

  // Initialize the application
  initializeApp();

  /**
   * Initialize the application by populating dropdowns and setting up event listeners
   */
  function initializeApp() {
    populateIndicatorDropdown();
    setupEventListeners();
    showCopyRight();
  }

  /**
   * Populate the indicator dropdown with available options
   */
  function populateIndicatorDropdown() {
    POPULATION_INDICATORS.forEach(indicator => {
      const optionElement = document.createElement('option');
      optionElement.value = indicator.value;
      optionElement.textContent = indicator.text;
      elements.indicatorSelect.appendChild(optionElement);
    });
  }

  /**
   * Set up all event listeners for the application
   */
  function setupEventListeners() {
    elements.renderButton.addEventListener('click', handleChartGeneration);

    document.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        handleChartGeneration();
      }
    });
  }

  /**
   * Handle chart generation with validation and error handling
   */
  async function handleChartGeneration() {
    if (!validateInputs()) {
      return;
    }

    try {
      setLoadingState(true);
      const apiData = await fetchPopulationData();

      if (!isValidApiResponse(apiData)) {
        showAlert('No data found for the selected country and indicator');
        return;
      }

      const chartData = processApiData(apiData);
      renderPopulationChart(chartData);

    } catch (error) {
      handleApiError(error);
    } finally {
      setLoadingState(false);
    }
  }

  /**
   * Validate user inputs for country code and indicator selection
   * @returns {boolean} True if inputs are valid
   */
  function validateInputs() {
    const countryCode = elements.countryInput.value.trim();
    const selectedIndicator = elements.indicatorSelect.value;

    // Reset previous validation states
    elements.countryInput.setAttribute('aria-invalid', 'false');
    elements.indicatorSelect.setAttribute('aria-invalid', 'false');

    if (!countryCode) {
      showValidationError(elements.countryInput, 'Please enter a country code');
      return false;
    }

    if (!selectedIndicator) {
      showValidationError(elements.indicatorSelect, 'Please select an indicator');
      return false;
    }

    if (!isValidCountryCode(countryCode)) {
      showValidationError(elements.countryInput, 'Please enter a valid 3-letter country code (e.g., JPN, USA, FIN)');
      return false;
    }

    return true;
  }

  /**
   * Check if country code is valid (3 letters)
   * @param {string} countryCode - The country code to validate
   * @returns {boolean} True if valid
   */
  function isValidCountryCode(countryCode) {
    return /^[a-zA-Z]{3}$/.test(countryCode);
  }

  /**
   * Show validation error for a specific input field
   * @param {HTMLElement} inputElement - The input element with error
   * @param {string} message - Error message to display
   */
  function showValidationError(inputElement, message) {
    inputElement.setAttribute('aria-invalid', 'true');
    inputElement.focus();
    showAlert(message);
  }

  /**
   * Display alert message to user
   * @param {string} message - Message to display
   */
  function showAlert(message) {
    alert(message);
  }

  /**
   * Fetch population data from World Bank API
   * @returns {Promise<Object>} API response data
   */
  async function fetchPopulationData() {
    const countryCode = elements.countryInput.value.toUpperCase();
    const indicatorCode = elements.indicatorSelect.value;
    const apiUrl = `https://api.worldbank.org/v2/country/${countryCode}/indicator/${indicatorCode}?format=json`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error('Error fetching data. Please check your country code and try again.');
    }

    return await response.json();
  }

  /**
   * Check if API response contains valid data
   * @param {Object} apiData - Raw API response data
   * @returns {boolean} True if data is valid
   */
  function isValidApiResponse(apiData) {
    return apiData && apiData[1] && apiData[1].length > 0;
  }

  /**
   * Process raw API data into chart-ready format
   * @param {Object} apiData - Raw API response data
   * @returns {Object} Processed chart data
   */
  function processApiData(apiData) {
    const rawData = apiData[1].filter(item => item.value !== null);
    const sortedData = rawData.sort((a, b) => a.date - b.date);

    return {
      values: sortedData.map(item => item.value),
      labels: sortedData.map(item => item.date),
      countryName: apiData[1][0]?.country?.value || 'Unknown Country'
    };
  }

  /**
   * Set loading state for the render button
   * @param {boolean} isLoading - Whether to show loading state
   */
  function setLoadingState(isLoading) {
    if (isLoading) {
      elements.renderButton.innerHTML = '<span class="btn-text">Loading...</span><span class="btn-icon">⏳</span>';
      elements.renderButton.disabled = true;
    } else {
      elements.renderButton.innerHTML = '<span class="btn-text">Generate Chart</span><span class="btn-icon">📊</span>';
      elements.renderButton.disabled = false;
    }
  }

  /**
   * Handle API errors with appropriate user feedback
   * @param {Error} error - The error that occurred
   */
  function handleApiError(error) {
    console.error('API Error:', error);
    showAlert('Network error. Please check your internet connection and try again.');
  }

  /**
   * Render the population chart with the provided data
   * @param {Object} chartData - Processed chart data
   */
  function renderPopulationChart({ values, labels, countryName }) {
    const chartContext = elements.chartCanvas.getContext('2d');

    // Destroy existing chart if present
    if (currentChart) {
      currentChart.destroy();
    }

    // Update chart title
    const selectedIndicatorText = getSelectedIndicatorText();
    elements.chartTitle.textContent = `${selectedIndicatorText} - ${countryName}`;

    // Create new chart instance
    currentChart = createChartInstance(chartContext, {
      values,
      labels,
      countryName,
      indicatorText: selectedIndicatorText
    });

    // Display chart with animation and accessibility features
    displayChart(selectedIndicatorText, countryName, labels);
  }

  /**
   * Get the text of the currently selected indicator
   * @returns {string} Selected indicator display text
   */
  function getSelectedIndicatorText() {
    const selectedOption = elements.indicatorSelect.options[elements.indicatorSelect.selectedIndex];
    return selectedOption.text;
  }

  /**
   * Create a new Chart.js instance with configuration
   * @param {CanvasRenderingContext2D} context - Canvas context
   * @param {Object} data - Chart data and metadata
   * @returns {Chart} Chart.js instance
   */
  function createChartInstance(context, { values, labels, countryName, indicatorText }) {
    return new Chart(context, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: `${indicatorText}, ${countryName}`,
          data: values,
          borderColor: 'rgb(178, 77, 137)',
          backgroundColor: 'rgba(178, 77, 137, 0.7)',
          hoverBackgroundColor: 'rgba(165, 79, 144, 0.9)',
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
        }]
      },
      options: getChartOptions()
    });
  }

  /**
   * Get Chart.js configuration options
   * @returns {Object} Chart options configuration
   */
  function getChartOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        legend: {
          labels: {
            color: 'rgb(178, 77, 137)',
            font: { size: 14, weight: 600 }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(178, 77, 137, 0.9)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: 'rgb(178, 77, 137)',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            label: function (context) {
              const value = context.parsed.y;
              return `${context.dataset.label}: ${value.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: 'rgb(33, 33, 33)',
            font: { size: 12, weight: 500 }
          },
          grid: {
            color: 'rgba(178, 77, 137, 0.15)',
            lineWidth: 1
          },
          border: {
            color: 'rgba(178, 77, 137, 0.3)'
          }
        },
        x: {
          ticks: {
            color: 'rgb(33, 33, 33)',
            font: { size: 12, weight: 500 }
          },
          grid: {
            color: 'rgba(178, 77, 137, 0.1)',
            lineWidth: 1
          },
          border: {
            color: 'rgba(178, 77, 137, 0.3)'
          }
        }
      }
    };
  }

  /**
   * Display the chart container with animation and accessibility features
   * @param {string} indicatorText - The selected indicator display text
   * @param {string} countryName - The country name
   * @param {Array} labels - Chart data labels (years)
   */
  function displayChart(indicatorText, countryName, labels) {
    // Update canvas accessibility attributes
    const chartDescription = `Bar chart showing ${indicatorText} for ${countryName} from ${labels[0]} to ${labels[labels.length - 1]}`;
    elements.chartCanvas.setAttribute('aria-label', chartDescription);

    // Show chart container with animation
    elements.chartContainer.style.display = 'block';
    elements.chartContainer.classList.add('show');

    // Announce chart completion to screen readers
    announceChartCompletion(chartDescription);
  }

  /**
   * Announce chart completion to screen readers
   * @param {string} chartDescription - Description of the generated chart
   */
  function announceChartCompletion(chartDescription) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'visually-hidden';
    announcement.textContent = `Chart generated successfully. ${chartDescription}`;

    document.body.appendChild(announcement);

    // Remove announcement after screen reader has time to read it
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 3000);
  }
});
