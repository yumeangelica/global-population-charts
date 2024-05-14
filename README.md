# Global Population Charts

Originally developed in 2021, this application visualizes global population data using charts. The project allows users to input a country code, select a demographic indicator, and render a graph that displays the relevant data. The application is built with Vanilla JavaScript, CSS, HTML, and Bootstrap, and it utilizes the Chart.js library for chart rendering to showcase core JavaScript skills without relying on modern frameworks. I have made several improvements and decided to release it now.

## Features:

- **Country Code Input**: Users can input a three-letter country code to specify the country for which they want to visualize data.
- **Demographic Indicators**: A dropdown list allows users to select various demographic indicators, such as total population, population by gender, age group populations, and life expectancy.
- **Chart Rendering**: Upon selection, a chart is rendered displaying the data for the chosen indicator.
- **Responsive Design**: The application layout adjusts for optimal viewing on different devices.
- **Data Source**: Utilizes the World Bank API to fetch the latest demographic data.

## Technologies Used:

- **JavaScript**: For handling user interactions, fetching data from the World Bank API, and rendering charts using Chart.js.
- **CSS**: For styling the application using custom CSS variables and classes.
- **HTML**: For structuring the content of the application.
- **Bootstrap**: For responsive layout and UI components.
- **Chart.js**: For creating interactive and customizable charts.

## Usage:

1. **Enter Country Code**: Input a valid three-letter country code (e.g., JPN for Japan, or FIN for Finland) into the text field.
2. **Select Indicator**: Choose a demographic indicator from the dropdown list.
3. **Render Chart**: Click the "Render Graph" button to fetch data and display the chart.
4. **View Data**: The chart will display the selected demographic data for the specified country.
