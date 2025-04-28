let assets = JSON.parse(localStorage.getItem('assets')) || [];
let netWorthHistory = JSON.parse(localStorage.getItem('netWorthHistory')) || [];
let chart, networthChart;

const apiKey = '96459ccc34b340bb9934727ea0e55979';

updateDisplay();

function switchScreen(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`${screen}-screen`).classList.add('active');
}

function addAsset() {
  const type = document.getElementById('asset-type').value;
  const name = document.getElementById('asset-name').value.trim();
  const value = parseFloat(document.getElementById('asset-value').value);

  if (name && !isNaN(value)) {
    assets.push({ type, name, value });
    saveData();
    updateDisplay();
    document.getElementById('asset-name').value = '';
    document.getElementById('asset-value').value = '';
  } else {
    alert('Please fill out all fields.');
  }
}

function updateDisplay() {
  updateAssetsList();
  updateCharts();
}

function updateAssetsList() {
  const assetsList = document.getElementById('assets-list');
  assetsList.innerHTML = '';

  const groups = assets.reduce((acc, asset) => {
    if (!acc[asset.type]) acc[asset.type] = [];
    acc[asset.type].push(asset);
    return acc;
  }, {});

  for (const type in groups) {
    const section = document.createElement('div');
    section.innerHTML = `<h3>${type}</h3>`;
    const ul = document.createElement('ul');
    groups[type].forEach(asset => {
      const li = document.createElement('li');
      li.textContent = `${asset.name}: $${asset.value.toFixed(2)}`;
      ul.appendChild(li);
    });
    section.appendChild(ul);
    assetsList.appendChild(section);
  }
}

function saveData() {
  localStorage.setItem('assets', JSON.stringify(assets));
  const totalNetWorth = assets.reduce((sum, a) => sum + a.value, 0);
  netWorthHistory.push({ date: new Date().toLocaleString(), value: totalNetWorth });
  localStorage.setItem('netWorthHistory', JSON.stringify(netWorthHistory));
}

function updateCharts() {
  const portfolioCtx = document.getElementById('portfolioChart').getContext('2d');
  const networthCtx = document.getElementById('networthChart').getContext('2d');

  const labels = assets.map(a => `${a.type}: ${a.name}`);
  const values = assets.map(a => a.value);

  if (chart) chart.destroy();
  if (networthChart) networthChart.destroy();

  chart = new Chart(portfolioCtx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{ data: values }]
    }
  });

  networthChart = new Chart(networthCtx, {
    type: 'line',
    data: {
      labels: netWorthHistory.map(n => n.date),
      datasets: [{
        label: 'Net Worth',
        data: netWorthHistory.map(n => n.value),
        fill: true
      }]
    }
  });
}

