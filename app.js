let assets = JSON.parse(localStorage.getItem('assets')) || [];
let debts = JSON.parse(localStorage.getItem('debts')) || [];
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
    if (type === "Debt" || type === "Custom Debt") {
      debts.push({ type, name, value });
      localStorage.setItem('debts', JSON.stringify(debts));
    } else {
      assets.push({ type, name, value });
      localStorage.setItem('assets', JSON.stringify(assets));
    }
    document.getElementById('asset-name').value = '';
    document.getElementById('asset-value').value = '';
    updateDisplay();
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

  const groups = assets.filter(a => ["Comic", "Purse", "Watch", "Jewelry", "Custom Asset"].includes(a.type));
  groups.forEach(asset => {
    const div = document.createElement('div');
    div.textContent = `[${asset.type}] ${asset.name} - $${asset.value.toFixed(2)}`;
    assetsList.appendChild(div);
  });
}

function updateInvestmentsList() {
  const investmentsList = document.getElementById('investments-list');
  investmentsList.innerHTML = '';

  const groups = assets.filter(a => ["Cash", "Stock", "Crypto", "Real Estate"].includes(a.type));
  groups.forEach(asset => {
    const div = document.createElement('div');
    div.textContent = `[${asset.type}] ${asset.name} - $${asset.value.toFixed(2)}`;
    investmentsList.appendChild(div);
  });
}

function updateNetWorth() {
  const assetTotal = assets.reduce((sum, a) => sum + a.value, 0);
  const debtTotal = debts.reduce((sum, d) => sum + d.value, 0);
  const netWorth = assetTotal - debtTotal;
  document.getElementById('net-worth').textContent = `$${netWorth.toFixed(2)}`;

  netWorthHistory.push({ date: new Date().toLocaleString(), value: netWorth });
  localStorage.setItem('netWorthHistory', JSON.stringify(netWorthHistory));
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
        data: assets.map(a => a.value),
        backgroundColor: generateColors(assets.length),
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
        fill: true,
        backgroundColor: 'rgba(0,210,255,0.2)',
        borderColor: '#00d2ff'
      }]
    }
  });
}

function generateColors(count) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(`hsl(${i * 360 / count}, 100%, 70%)`);
  }
  return colors;
}

function exportAssets() {
  const csv = [
    'Type,Name,Value',
    ...assets.map(a => `${a.type},${a.name},${a.value}`),
    ...debts.map(d => `${d.type},${d.name},-${d.value}`)
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'portfolio_data.csv';
  link.click();
}

function resetApp() {
  if (confirm('Are you sure? This will erase all data.')) {
    localStorage.clear();
    location.reload();
  }
}

function generateShareImage() {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = "#0d0d0d";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#00d2ff";
  ctx.font = "40px Orbitron";
  ctx.fillText("PortfolioPulse Progress", 50, 100);

  const assetTotal = assets.reduce((sum, a) => sum + a.value, 0);
  const debtTotal = debts.reduce((sum, d) => sum + d.value, 0);
  const netWorth = assetTotal - debtTotal;
  ctx.fillStyle = "#ffffff";
  ctx.font = "30px Roboto";
  ctx.fillText(`Net Worth: $${netWorth.toFixed(2)}`, 50, 200);

  if (netWorthHistory.length > 1) {
    const growth = ((netWorthHistory[netWorthHistory.length - 1].value - netWorthHistory[0].value) / Math.abs(netWorthHistory[0].value)) * 100;
    ctx.fillText(`Growth: ${growth.toFixed(2)}%`, 50, 250);
  }

  ctx.fillText(`As of: ${new Date().toLocaleDateString()}`, 50, 300);

  const link = document.createElement('a');
  link.download = 'portfolio_progress.png';
  link.href = canvas.toDataURL();
  link.click();
}
