let assets = JSON.parse(localStorage.getItem('assets')) || [];
let netWorthHistory = JSON.parse(localStorage.getItem('netWorthHistory')) || [];
let pieChart, networthChart;

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
  updateInvestmentsList();
  updateNetWorth();
  updateCharts();
}

function updateAssetsList() {
  const assetsList = document.getElementById('assets-list');
  assetsList.innerHTML = '';

  const groups = assets.filter(a => ["Comic", "Purse", "Watch", "Jewelry"].includes(a.type));
  groups.forEach(asset => {
    const div = document.createElement('div');
    div.textContent = `[${asset.type}] ${asset.name} - $${asset.value.toFixed(2)}`;
    assetsList.appendChild(div);
  });
}

function updateInvestmentsList() {
  const investmentsList = document.getElementById('investments-list');
  investmentsList.innerHTML = '';

  const groups = assets.filter(a => ["Stock", "Crypto", "Cash", "Real Estate"].includes(a.type));
  groups.forEach(asset => {
    const div = document.createElement('div');
    div.textContent = `[${asset.type}] ${asset.name} - $${asset.value.toFixed(2)}`;
    investmentsList.appendChild(div);
  });
}

function updateNetWorth() {
  const netWorth = assets.reduce((sum, a) => sum + a.value, 0);
  document.getElementById('net-worth').textContent = `$${netWorth.toFixed(2)}`;

  netWorthHistory.push({ date: new Date().toLocaleString(), value: netWorth });
  localStorage.setItem('netWorthHistory', JSON.stringify(netWorthHistory));
}

function saveData() {
  localStorage.setItem('assets', JSON.stringify(assets));
}

function updateCharts() {
  const pieCtx = document.getElementById('pieChart').getContext('2d');
  const networthCtx = document.getElementById('networthChart').getContext('2d');

  if (pieChart) pieChart.destroy();
  if (networthChart) networthChart.destroy();

  pieChart = new Chart(pieCtx, {
    type: 'pie',
    data: {
      labels: assets.map(a => a.name),
      datasets: [{
        data: assets.map(a => a.value)
      }]
    }
  });

  networthChart = new Chart(networthCtx, {
    type: 'line',
    data: {
      labels: netWorthHistory.map(n => n.date),
      datasets: [{
        label: 'Net Worth Over Time',
        data: netWorthHistory.map(n => n.value),
        fill: true
      }]
    }
  });
}

function exportAssets() {
  const csv = assets.map(a => `${a.type},${a.name},${a.value}`).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'portfolio_assets.csv';
  link.click();
}

function resetApp() {
  if (confirm('Are you sure? This will erase all data.')) {
    localStorage.clear();
    location.reload();
  }
}
