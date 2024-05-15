// Event listener for the DOM loaded event
document.addEventListener('DOMContentLoaded', () => {
  // Array containing the options for the indicators
  const indicatorOptions = [
    { value: 'SP.POP.TOTL', text: 'Population total' },
    { value: 'SP.POP.TOTL.MA.IN', text: 'Pop. total male' },
    { value: 'SP.POP.TOTL.FE.IN', text: 'Pop. total female' },
    { value: 'SP.POP.65UP.FE.IN', text: 'Pop. yr.65 and above, (f)' },
    { value: 'SP.POP.65UP.MA.IN', text: 'Pop. yr.65 and above, (m)' },
    { value: 'SP.POP.1564.FE.IN', text: 'Pop. yr.15-64, female' },
    { value: 'SP.POP.1564.MA.IN', text: 'Pop. yr.15-64, male' },
    { value: 'SP.POP.0014.FE.IN', text: 'Pop. yr.0-14, female' },
    { value: 'SP.POP.0014.MA.IN', text: 'Pop. yr.0-14, male' },
    { value: 'SP.DYN.LE00.FE.IN', text: 'Life exp. at birth, (f)' },
    { value: 'SP.DYN.LE00.MA.IN', text: 'Life exp. at birth, (m)' }
  ];

  // Get the select element by its ID
  const indicatorSelect = document.getElementById('indicatorCode');

  // Populate the dropdown list with indicator options
  indicatorOptions.forEach(option => {
    const opt = document.createElement('option');
    opt.value = option.value;
    opt.textContent = option.text;
    indicatorSelect.appendChild(opt);
  });

  // Current chart instance
  let currentChart;

  // Event listener for the render button click
  document.getElementById('renderButton').addEventListener('click', fetchData);

  // Event listener for Enter key press on the entire document
  document.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      fetchData();
    }
  });

  // Function to fetch data from the API
  async function fetchData() {
    // Country input element
    const countryInput = document.getElementById("country");

    // Validate the country code input
    if (countryInput.value.match(/^[a-zA-Z]+$/)) {
      const url = `https://api.worldbank.org/v2/country/${countryInput.value}/indicator/${document.getElementById('indicatorCode').value}?format=json`;

      // Fetch data from the API
      const response = await fetch(url);

      // If the response is OK, parse the data and render the chart
      if (response.status === 200) {
        const fetchedData = await response.json();
        renderChart(getValues(fetchedData), getLabels(fetchedData), getCountryName(fetchedData));
      }
    } else {
      alert('Input a country code');
    }
  }

  // Extract values from the fetched data
  const getValues = (data) => data[1].sort((a, b) => a.date - b.date).map(item => item.value);

  // Extract labels from the fetched data
  const getLabels = (data) => data[1].sort((a, b) => a.date - b.date).map(item => item.date);

  // Extract country name from the fetched data
  const getCountryName = (data) => data[1][0].country.value;

  // Function to render the chart
  const renderChart = (data, labels, countryName) => {
    const ctx = document.getElementById('myChart').getContext('2d');

    // Destroy the current chart if it exists
    if (currentChart) {
      currentChart.destroy();
    }

    // Create a new chart
    currentChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: `Population, ${countryName}`,
          data: data,
          borderColor: 'rgba(178, 102, 255, 1)',
          backgroundColor: 'rgba(178, 102, 255, 0.6)',
          hoverBackgroundColor: 'rgba(178, 102, 255, 0.8)',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#50404d'
            },
            grid: {
              color: 'rgba(128, 128, 128, 0.2)'
            }
          },
          x: {
            ticks: {
              color: '#50404d'
            },
            grid: {
              color: 'rgba(128, 128, 128, 0.2)'
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: '#50404d'
            }
          }
        }
      }
    });

    // Display the chart container
    document.getElementById('chartContainer').style.display = 'block';
  }

  // Call the showCopyRight function from copyright.js
  showCopyRight();
});
