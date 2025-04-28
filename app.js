let assets = JSON.parse(localStorage.getItem('assets')) || [];
let netWorth = parseFloat(localStorage.getItem('netWorth')) || 0;
let netWorthHistory = JSON.parse(localStorage.getItem('netWorthHistory')) || [];
let chart;
let networthChart;

const apiKey = '96459ccc34b340bb9934727ea0e55979';

updateDisplay();

async function addAsset() {
  const typeSelect = document.getElementById('asset-type');
  const assetType = typeSelect.value;
  const nameInput = document.getElementById('asset-name');
  const assetName = nameInput.value.trim().toUpperCase();
  const loading = document.getElementById('loading');

  if (assetName) {
    try {
      loading.style.display = 'flex';

      let assetValue = 0;
      if (assetType === 'Stock' || assetType === 'Crypto') {
        const response = await fetch(`https://api.twelvedata.com/price?symbol=${assetName}&apikey=${apiKey}`);
        const data = await response.json();
        if (data.price) {
          assetValue = parseFloat(data.price);
        } else {
          alert("Couldn't fetch price. Check the symbol!");
          return;
        }
      } else {
        assetValue = parseFloat(prompt("Enter the value in dollars:"));
      }

      if (!isNaN(assetValue)) {
        assets.push({ type: assetType, name: assetName, value: assetValue });
        netWorth += assetValue;

        netWorthHistory.push({
          date: new Date().toLocaleString(),
          value: netWorth
        });

        saveData();
        updateDisplay();
        nameInput.value = '';
      } else {
        alert("Invalid value entered.");
      }
    } catch (error) {
      console.error(error);
      alert("Error fetching asset price!");
    } finally {
      loading.style.display = 'none';
    }
  } else {
    alert("Please enter an asset name!");
  }
}

function importCSV() {
  const fileInput = document.getElementById('csv-file');
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    const lines = text.split('\n');
    assets = [];
    netWorth = 0;
    netWorthHistory = [];

    for (let line of lines) {
      const [type, name, value] = line.split(',');
      if (type && name && value) {
        assets.push({
          type: type.trim(),
          name: name.trim(),
          value: parseFloat(value.trim())
        });
        netWorth += parseFloat(value.trim());
      }
    }

    netWorthHistory.push({
      date: new Date().toLocaleString(),
      value: netWorth
    });

    saveData();
    updateDisplay();
  };

  reader.readAsText(file);
}

function updateDisplay() {
  const assetsList = document.getElementById('assets-list');
  const networthDisplay = document.getElementById('networth');

  networthDisplay.textContent = `$${netWorth.toFixed(2)}`;
  assetsList.innerHTML = '';

  assets.forEach((asset, index) => {
    const li = document.createElement('li');
    li.textContent = `[${asset.type}] ${asset.name}: $${asset.value.toFixed(2)}`;
    assetsList.appendChild(li);
  });

  updateCharts();
}

function saveData() {
  localStorage.setItem('assets', JSON.stringify(assets));
  localStorage.setItem('netWorth', netWorth.toString());
  localStorage.setItem('netWorthHistory', JSON.stringify(netWorthHistory));
}

function updateCharts() {
  const portfolioCtx = document.getElementById('portfolioChart').getContext('2d');
  const networthCtx = document.getElementById('networthChart').getContext('2d');

  const labels = assets.map(asset => `${asset.type}-${asset.name}`);
  const values = assets.map(asset => asset.value);

  if (chart) chart.destroy();
  if (networthChart) networthChart.destroy();

  chart = new Chart(portfolioCtx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: ['#00f5d4', '#f72585', '#7209b7', '#3a0ca3', '#4361ee', '#4cc9f0'],
        borderColor: 'white',
        borderWidth: 2
      }]
    },
    options: {
      plugins: {
        legend: { labels: { color: '#00f5d4' } }
      }
    }
  });

  networthChart = new Chart(networthCtx, {
    type: 'line',
    data: {
      labels: netWorthHistory.map(entry => entry.date),
      datasets: [{
        label: 'Net Worth',
        data: netWorthHistory.map(entry => entry.value),
        borderColor: '#00f5d4',
        backgroundColor: 'rgba(0,245,212,0.2)',
        pointBackgroundColor: '#f72585',
        borderWidth: 2
      }]
    },
    options: {
      plugins: {
        legend: { labels: { color: '#00f5d4' } }
      },
      scales: {
        x: { ticks: { color: '#fff' } },
        y: { ticks: { color: '#fff' } }
      }
    }
  });
}
