// Premium SWP & FIRE Calculator Suite

document.addEventListener('DOMContentLoaded', () => {
  // --- Theme Toggle ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  
  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    themeIcon.className = newTheme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    updateCalculationsAndUI();
  });

  // --- Active Mode Management ---
  let activeMode = 'swp'; // 'swp' or 'fire'
  const btnModeSWP = document.getElementById('mode-swp-btn');
  const btnModeFIRE = document.getElementById('mode-fire-btn');
  
  const swpInputsContainer = document.getElementById('swp-inputs');
  const fireInputsContainer = document.getElementById('fire-inputs');
  
  const swpResultsContainer = document.getElementById('swp-results-container');
  const fireResultsContainer = document.getElementById('fire-results-container');

  btnModeSWP.addEventListener('click', () => {
    activeMode = 'swp';
    btnModeSWP.classList.add('active');
    btnModeFIRE.classList.remove('active');
    swpInputsContainer.style.display = 'block';
    fireInputsContainer.style.display = 'none';
    swpResultsContainer.classList.add('active');
    fireResultsContainer.classList.remove('active');
    updateCalculationsAndUI();
  });

  btnModeFIRE.addEventListener('click', () => {
    activeMode = 'fire';
    btnModeFIRE.classList.add('active');
    btnModeSWP.classList.remove('active');
    fireInputsContainer.style.display = 'block';
    swpInputsContainer.style.display = 'none';
    fireResultsContainer.classList.add('active');
    swpResultsContainer.classList.remove('active');
    updateCalculationsAndUI();
  });

  // --- Input Bindings and Sliders ---
  const inputs = {
    // SWP Fields
    initialInvestment: {
      val: document.getElementById('initial-investment-val'),
      slider: document.getElementById('initial-investment-slider')
    },
    enableHold: document.getElementById('enable-hold'),
    holdDuration: {
      val: document.getElementById('hold-duration-val'),
      slider: document.getElementById('hold-duration-slider'),
      unit: document.getElementById('hold-duration-unit')
    },
    enableHoldSip: document.getElementById('enable-hold-sip'),
    holdSip: {
      val: document.getElementById('hold-sip-val'),
      slider: document.getElementById('hold-sip-slider'),
      frequency: document.getElementById('hold-sip-frequency')
    },
    swpAmount: {
      val: document.getElementById('swp-amount-val'),
      slider: document.getElementById('swp-amount-slider')
    },
    duration: {
      val: document.getElementById('duration-val'),
      slider: document.getElementById('duration-slider'),
      unit: document.getElementById('duration-unit')
    },
    expectedReturn: {
      val: document.getElementById('expected-return-val'),
      slider: document.getElementById('expected-return-slider'),
      compounding: document.getElementById('compounding-frequency')
    },
    enableInflation: document.getElementById('enable-inflation'),
    inflationRate: {
      val: document.getElementById('inflation-rate-val'),
      slider: document.getElementById('inflation-rate-slider'),
      adjustSwp: document.getElementById('adjust-swp-inflation')
    },
    enableTax: document.getElementById('enable-tax'),
    taxRate: {
      val: document.getElementById('tax-rate-val'),
      slider: document.getElementById('tax-rate-slider'),
      deduct: document.getElementById('deduct-tax')
    },

    // FIRE Fields
    fireSavings: {
      val: document.getElementById('fire-savings-val'),
      slider: document.getElementById('fire-savings-slider')
    },
    fireTarget: {
      val: document.getElementById('fire-target-val'),
      slider: document.getElementById('fire-target-slider')
    },
    fireYears: {
      val: document.getElementById('fire-years-val'),
      slider: document.getElementById('fire-years-slider')
    },
    fireCAGR: {
      val: document.getElementById('fire-cagr-val'),
      slider: document.getElementById('fire-cagr-slider')
    },
    fireSIP: {
      val: document.getElementById('fire-sip-val'),
      slider: document.getElementById('fire-sip-slider')
    },
    fireVolatility: {
      val: document.getElementById('fire-volatility-val'),
      slider: document.getElementById('fire-volatility-slider')
    }
  };

  const panels = {
    hold: document.getElementById('hold-panel'),
    holdSip: document.getElementById('hold-sip-panel'),
    advancedToggle: document.getElementById('advanced-toggle'),
    advanced: document.getElementById('advanced-panel'),
    inflation: document.getElementById('inflation-panel'),
    tax: document.getElementById('tax-panel'),
    infoBanner: document.getElementById('info-banner'),
    infoBannerText: document.getElementById('info-banner-text')
  };

  // Buttons and Tabs
  const btnCalculate = document.getElementById('calculate-btn');
  const btnChartBalance = document.getElementById('btn-chart-balance');
  const btnChartVs = document.getElementById('btn-chart-vs');
  const btnViewYearly = document.getElementById('btn-view-yearly');
  const btnViewMonthly = document.getElementById('btn-view-monthly');
  const btnExportCsv = document.getElementById('export-csv-btn');
  const btnExportFireCsv = document.getElementById('export-fire-csv-btn');
  
  // Pagination
  const paginationInfo = document.getElementById('pagination-info');
  const btnPaginationPrev = document.getElementById('btn-pagination-prev');
  const btnPaginationNext = document.getElementById('btn-pagination-next');

  // Table elements
  const tableHeaders = document.getElementById('table-headers');
  const tableBody = document.getElementById('table-body');
  const tablePagination = document.getElementById('table-pagination');

  // Charts references
  let swpChartInstance = null;
  let fireChartInstance = null;

  // State
  let swpResults = null;
  let fireResults = null;
  let activeChartTab = 'balance'; // 'balance' or 'comparison'
  let activeTableTab = 'yearly'; // 'yearly' or 'monthly'
  let currentSwpPage = 1;
  const rowsPerPage = 12;

  // Currency Formatter (Indian Numbering)
  const inrFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  function formatCurrency(val) {
    if (val === undefined || isNaN(val)) return '₹0';
    return inrFormatter.format(val);
  }

  // --- Input & Slider Syncing Helper ---
  function setupSync(valEl, sliderEl, min, max, step) {
    if (!valEl || !sliderEl) return;
    
    sliderEl.addEventListener('input', (e) => {
      valEl.value = e.target.value;
      updateCalculationsAndUI();
    });

    valEl.addEventListener('input', (e) => {
      let val = parseFloat(e.target.value);
      if (isNaN(val)) return;
      if (val < min) val = min;
      if (val > max) val = max;
      sliderEl.value = val;
      updateCalculationsAndUI();
    });
  }

  // SWP Syncs
  setupSync(inputs.initialInvestment.val, inputs.initialInvestment.slider, 10000, 100000000, 50000);
  setupSync(inputs.swpAmount.val, inputs.swpAmount.slider, 0, 10000000, 500);
  setupSync(inputs.expectedReturn.val, inputs.expectedReturn.slider, 1, 30, 0.1);
  setupSync(inputs.holdDuration.val, inputs.holdDuration.slider, 1, 360, 1);
  setupSync(inputs.holdSip.val, inputs.holdSip.slider, 0, 10000000, 1000);
  setupSync(inputs.duration.val, inputs.duration.slider, 1, 600, 1);
  setupSync(inputs.inflationRate.val, inputs.inflationRate.slider, 0, 30, 0.1);
  setupSync(inputs.taxRate.val, inputs.taxRate.slider, 0, 50, 0.5);

  // FIRE Syncs
  setupSync(inputs.fireSavings.val, inputs.fireSavings.slider, 0, 100000000, 50000);
  setupSync(inputs.fireTarget.val, inputs.fireTarget.slider, 100000, 1000000000, 100000);
  setupSync(inputs.fireYears.val, inputs.fireYears.slider, 1, 50, 1);
  setupSync(inputs.fireCAGR.val, inputs.fireCAGR.slider, 1, 30, 0.1);
  setupSync(inputs.fireSIP.val, inputs.fireSIP.slider, 0, 5000000, 1000);
  setupSync(inputs.fireVolatility.val, inputs.fireVolatility.slider, 0, 50, 0.5);

  // Adjust input configurations based on units
  inputs.holdDuration.unit.addEventListener('change', () => {
    const isYears = inputs.holdDuration.unit.value === 'years';
    inputs.holdDuration.slider.min = 1;
    inputs.holdDuration.slider.max = isYears ? 30 : 360;
    if (isYears && parseInt(inputs.holdDuration.val.value) > 30) {
      inputs.holdDuration.val.value = 5;
      inputs.holdDuration.slider.value = 5;
    } else if (!isYears && parseInt(inputs.holdDuration.val.value) <= 30) {
      inputs.holdDuration.val.value = parseInt(inputs.holdDuration.val.value) * 12;
      inputs.holdDuration.slider.value = inputs.holdDuration.val.value;
    }
    updateCalculationsAndUI();
  });

  inputs.duration.unit.addEventListener('change', () => {
    const isYears = inputs.duration.unit.value === 'years';
    inputs.duration.slider.min = 1;
    inputs.duration.slider.max = isYears ? 50 : 600;
    if (isYears && parseInt(inputs.duration.val.value) > 50) {
      inputs.duration.val.value = 20;
      inputs.duration.slider.value = 20;
    } else if (!isYears && parseInt(inputs.duration.val.value) <= 50) {
      inputs.duration.val.value = parseInt(inputs.duration.val.value) * 12;
      inputs.duration.slider.value = inputs.duration.val.value;
    }
    updateCalculationsAndUI();
  });

  // Visibilities
  inputs.enableHold.addEventListener('change', () => {
    panels.hold.classList.toggle('show', inputs.enableHold.checked);
    updateCalculationsAndUI();
  });

  inputs.enableHoldSip.addEventListener('change', () => {
    panels.holdSip.classList.toggle('show', inputs.enableHoldSip.checked);
    updateCalculationsAndUI();
  });

  inputs.enableInflation.addEventListener('change', () => {
    panels.inflation.classList.toggle('show', inputs.enableInflation.checked);
    updateCalculationsAndUI();
  });

  inputs.enableTax.addEventListener('change', () => {
    panels.tax.classList.toggle('show', inputs.enableTax.checked);
    updateCalculationsAndUI();
  });

  panels.advancedToggle.addEventListener('click', () => {
    panels.advancedToggle.classList.toggle('active');
    panels.advanced.classList.toggle('show');
  });

  // --- Box-Muller normal distribution generator ---
  function randomNormal(mean, stdDev) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return num * stdDev + mean;
  }

  // --- CAGR Secant Solver ---
  function solveRequiredCAGR(S0, M, N, X) {
    if (S0 >= X) return 0;
    
    function F(r) {
      if (r === 0) return S0 + M * 12 * N - X;
      // Monthly compounding mapping for yearly CAGR
      let rm = Math.pow(1 + r, 1/12) - 1;
      let months = N * 12;
      let term1 = S0 * Math.pow(1 + rm, months);
      let term2 = M * (Math.pow(1 + rm, months) - 1) / rm;
      return term1 + term2 - X;
    }

    let r0 = 0.05;
    let r1 = 0.15;
    let maxIterations = 50;
    let tolerance = 1e-4;

    for (let i = 0; i < maxIterations; i++) {
      let y0 = F(r0);
      let y1 = F(r1);
      if (Math.abs(y1 - y0) < 1e-12) break;
      let r2 = r1 - y1 * (r1 - r0) / (y1 - y0);
      if (Math.abs(r2 - r1) < tolerance) {
        return r2 * 100;
      }
      r0 = r1;
      r1 = r2;
    }
    return r1 * 100;
  }

  // --- Analytical Required SIP Finder ---
  function calculateRequiredSIP(S0, N, cagrPercentage, X) {
    if (S0 >= X) return 0;
    let r_annual = cagrPercentage / 100;
    let rm = Math.pow(1 + r_annual, 1/12) - 1;
    let months = N * 12;

    if (rm === 0) {
      return (X - S0) / months;
    }

    let numerator = X - S0 * Math.pow(1 + rm, months);
    if (numerator <= 0) return 0;
    let denominator = (Math.pow(1 + rm, months) - 1) / rm;
    return numerator / denominator;
  }

  // --- SWP Calculation Logic ---
  function calculateSWP() {
    const initialInvestment = parseFloat(inputs.initialInvestment.val.value) || 0;
    const isHoldEnabled = inputs.enableHold.checked;
    
    let holdMonths = 0;
    if (isHoldEnabled) {
      const holdVal = parseInt(inputs.holdDuration.val.value) || 0;
      const isYears = inputs.holdDuration.unit.value === 'years';
      holdMonths = isYears ? holdVal * 12 : holdVal;
    }

    const isHoldSipEnabled = isHoldEnabled && inputs.enableHoldSip.checked;
    const sipAmount = isHoldSipEnabled ? (parseFloat(inputs.holdSip.val.value) || 0) : 0;
    const sipFreq = isHoldSipEnabled ? inputs.holdSip.frequency.value : 'monthly';

    const baseSwpAmount = parseFloat(inputs.swpAmount.val.value) || 0;
    const durationVal = parseInt(inputs.duration.val.value) || 0;
    const isDurationYears = inputs.duration.unit.value === 'years';
    const durationMonths = isDurationYears ? durationVal * 12 : durationVal;

    const expectedReturnAnnual = parseFloat(inputs.expectedReturn.val.value) || 0;
    const compoundingFreq = inputs.expectedReturn.compounding.value;
    
    const isInflationEnabled = inputs.enableInflation.checked;
    const inflationRateAnnual = isInflationEnabled ? (parseFloat(inputs.inflationRate.val.value) || 0) : 0;
    const isSwpAdjustedForInflation = isInflationEnabled && inputs.inflationRate.adjustSwp.checked;

    const isTaxEnabled = inputs.enableTax.checked;
    const taxRate = isTaxEnabled ? (parseFloat(inputs.taxRate.val.value) || 0) : 0;
    const isTaxDeducted = isTaxEnabled && inputs.taxRate.deduct.checked;

    let r = 0;
    const R_frac = expectedReturnAnnual / 100;
    if (compoundingFreq === 'yearly') {
      r = Math.pow(1 + R_frac, 1/12) - 1;
    } else if (compoundingFreq === 'monthly') {
      r = R_frac / 12;
    }

    let balance = initialInvestment;
    let costBasis = initialInvestment;
    let totalInvested = initialInvestment;

    const timeline = [];
    let holdTotalSipAdded = 0;
    
    // Hold Phase
    for (let m = 1; m <= holdMonths; m++) {
      const openingBalance = balance;
      let addition = 0;

      if (isHoldSipEnabled) {
        if (sipFreq === 'monthly') {
          addition = sipAmount;
        } else if (sipFreq === 'yearly' && (m - 1) % 12 === 0) {
          addition = sipAmount;
        }
      }

      balance += addition;
      costBasis += addition;
      totalInvested += addition;
      holdTotalSipAdded += addition;

      const growth = balance * r;
      balance += growth;

      timeline.push({
        month: m,
        phase: 'hold',
        yearNumber: Math.ceil(m / 12),
        monthInYear: (m - 1) % 12 + 1,
        openingBalance,
        addition,
        growth,
        withdrawal: 0,
        tax: 0,
        closingBalance: balance,
        costBasis,
        nominalSWP: 0,
        swpInflationValue: 0
      });
    }

    const valueAtStartOfSWP = balance;
    
    // SWP Phase
    let cumulativeWithdrawals = 0;
    let cumulativeTax = 0;
    let cumulativeGainsTaxNotDeducted = 0;

    for (let m = 1; m <= durationMonths; m++) {
      const overallMonth = holdMonths + m;
      const openingBalance = balance;
      
      let currentSwp = baseSwpAmount;
      if (isSwpAdjustedForInflation) {
        const yearIndex = Math.floor((m - 1) / 12);
        currentSwp = baseSwpAmount * Math.pow(1 + (inflationRateAnnual / 100), yearIndex);
      }

      const totalMonthsPassed = overallMonth;
      const inflationDiscountFactor = Math.pow(1 + (inflationRateAnnual / 100), totalMonthsPassed / 12);
      const swpInflationDisplayValue = currentSwp * inflationDiscountFactor;

      const growth = balance * r;
      
      let withdrawal = currentSwp;
      const totalAvailable = balance + growth;
      
      if (withdrawal > totalAvailable) {
        withdrawal = Math.max(0, totalAvailable);
      }

      let tax = 0;
      let gainRatio = 0;

      if (withdrawal > 0 && isTaxEnabled) {
        const currentValueBeforeWithdrawal = balance + growth;
        if (currentValueBeforeWithdrawal > costBasis) {
          gainRatio = (currentValueBeforeWithdrawal - costBasis) / currentValueBeforeWithdrawal;
        } else {
          gainRatio = 0;
        }

        const gainsPortion = withdrawal * gainRatio;
        tax = gainsPortion * (taxRate / 100);
        costBasis = costBasis * (1 - withdrawal / currentValueBeforeWithdrawal);
      }

      let closingBalance = totalAvailable - withdrawal;
      if (isTaxDeducted) {
        closingBalance = Math.max(0, closingBalance - tax);
        cumulativeTax += tax;
      } else {
        cumulativeGainsTaxNotDeducted += tax;
      }

      cumulativeWithdrawals += withdrawal;

      timeline.push({
        month: overallMonth,
        phase: 'swp',
        yearNumber: Math.ceil(overallMonth / 12),
        monthInYear: (overallMonth - 1) % 12 + 1,
        openingBalance,
        addition: 0,
        growth,
        withdrawal,
        tax,
        closingBalance,
        costBasis,
        nominalSWP: currentSwp,
        swpInflationValue: swpInflationDisplayValue
      });

      balance = closingBalance;
    }

    return {
      timeline,
      initialInvestment,
      holdMonths,
      holdTotalSipAdded,
      totalInvested,
      valueAtStartOfSWP,
      totalWithdrawn: cumulativeWithdrawals,
      finalBalance: balance,
      totalTax: isTaxDeducted ? cumulativeTax : cumulativeGainsTaxNotDeducted,
      isTaxDeducted
    };
  }

  // --- FIRE Calculation & Monte Carlo Engine ---
  function calculateFIRE() {
    const currentSavings = parseFloat(inputs.fireSavings.val.value) || 0;
    const targetCorpus = parseFloat(inputs.fireTarget.val.value) || 0;
    const yearsToFIRE = parseInt(inputs.fireYears.val.value) || 15;
    const expectedCAGR = parseFloat(inputs.fireCAGR.val.value) || 12;
    const monthlySIP = parseFloat(inputs.fireSIP.val.value) || 0;
    const volatility = parseFloat(inputs.fireVolatility.val.value) || 0;

    // 1. Solve CAGR and Required SIP
    const requiredCAGR = solveRequiredCAGR(currentSavings, monthlySIP, yearsToFIRE, targetCorpus);
    const requiredSIP = calculateRequiredSIP(currentSavings, yearsToFIRE, expectedCAGR, targetCorpus);

    // 2. Monte Carlo Simulation (500 Runs)
    const numRuns = 500;
    const months = yearsToFIRE * 12;
    const volatilityMonthly = (volatility / 100) / Math.sqrt(12);
    
    // Convert expected CAGR to equivalent monthly return
    const rmExpected = Math.pow(1 + (expectedCAGR / 100), 1/12) - 1;

    // Structure to store ending balances for each month across all runs
    // runsBalances[runIndex][monthIndex]
    const runsBalances = [];

    let successes = 0;

    for (let r = 0; r < numRuns; r++) {
      let balance = currentSavings;
      const runHistory = [balance]; // Month 0

      for (let m = 1; m <= months; m++) {
        // Add SIP at the start of the month
        balance += monthlySIP;
        
        // Random return draw
        let r_rand = rmExpected;
        if (volatilityMonthly > 0) {
          r_rand = randomNormal(rmExpected, volatilityMonthly);
        }
        
        const growth = balance * r_rand;
        balance += growth;
        if (balance < 0) balance = 0;
        
        runHistory.push(balance);
      }

      if (balance >= targetCorpus) {
        successes++;
      }
      runsBalances.push(runHistory);
    }

    const probability = (successes / numRuns) * 100;

    // 3. Extract Percentiles for each year
    const yearlyPercentiles = [];
    
    // Year 0
    yearlyPercentiles.push({
      year: 0,
      p10: currentSavings,
      p50: currentSavings,
      p90: currentSavings
    });

    for (let y = 1; y <= yearsToFIRE; y++) {
      const monthIndex = y * 12;
      const balancesAtYear = runsBalances.map(run => run[monthIndex]);
      balancesAtYear.sort((a, b) => a - b);

      // Extract 10th, 50th, 90th percentiles
      const p10 = balancesAtYear[Math.floor(numRuns * 0.1)];
      const p50 = balancesAtYear[Math.floor(numRuns * 0.5)];
      const p90 = balancesAtYear[Math.floor(numRuns * 0.9)];

      yearlyPercentiles.push({
        year: y,
        p10,
        p50,
        p90
      });
    }

    return {
      requiredCAGR,
      requiredSIP,
      probability,
      yearlyPercentiles,
      targetCorpus,
      yearsToFIRE
    };
  }

  // --- Master Calculation Router ---
  function updateCalculationsAndUI() {
    if (activeMode === 'swp') {
      swpResults = calculateSWP();
      updateSWPKPIs();
      updateInfoBanner();
      renderSWPChart();
      renderSWPTable();
    } else {
      fireResults = calculateFIRE();
      updateFIREKPIs();
      renderFIREChart();
      renderFIRETable();
    }
  }

  // --- SWP View Renderers ---
  function updateSWPKPIs() {
    const res = swpResults;
    if (!res) return;
    
    document.getElementById('kpi-total-invested').textContent = formatCurrency(res.totalInvested);
    document.getElementById('kpi-total-invested-sub').textContent = res.holdTotalSipAdded > 0 
      ? `₹${res.initialInvestment.toLocaleString('en-IN')} + ₹${res.holdTotalSipAdded.toLocaleString('en-IN')} sip` 
      : 'Initial principal';

    document.getElementById('kpi-start-swp').textContent = formatCurrency(res.valueAtStartOfSWP);
    document.getElementById('kpi-start-swp-sub').textContent = res.holdMonths > 0 
      ? `After ${inputs.holdDuration.val.value} ${inputs.holdDuration.unit.value} hold` 
      : 'No hold period';

    document.getElementById('kpi-total-withdrawn').textContent = formatCurrency(res.totalWithdrawn);
    document.getElementById('kpi-total-withdrawn-sub').textContent = 'Total of all SWPs';

    document.getElementById('kpi-final-balance').textContent = formatCurrency(res.finalBalance);
    const balSub = document.getElementById('kpi-final-balance-sub');
    balSub.className = res.finalBalance <= 0 ? 'kpi-subtitle text-danger' : 'kpi-subtitle text-success';
    balSub.textContent = res.finalBalance <= 0 ? 'Corpus fully depleted' : 'Ending corpus growth';

    document.getElementById('kpi-total-tax').textContent = formatCurrency(res.totalTax);
    document.getElementById('kpi-total-tax-sub').textContent = res.isTaxDeducted ? 'Deducted from corpus' : 'Estimate (not deducted)';
  }

  function updateInfoBanner() {
    const holdEnabled = inputs.enableHold.checked;
    const sipEnabled = holdEnabled && inputs.enableHoldSip.checked;
    
    if (holdEnabled) {
      panels.infoBanner.style.display = 'flex';
      let text = `Your investment will grow for <strong>${inputs.holdDuration.val.value} ${inputs.holdDuration.unit.value}</strong> before withdrawals begin. `;
      if (sipEnabled) {
        text += `During this time, you will add <strong>${formatCurrency(parseFloat(inputs.holdSip.val.value))} ${inputs.holdSip.frequency.value}</strong>.`;
      } else {
        text += `No additional additions will be made.`;
      }
      panels.infoBannerText.innerHTML = `<strong>Hold Phase Active</strong>${text}`;
    } else {
      panels.infoBanner.style.display = 'none';
    }
  }

  function renderSWPChart() {
    const ctx = document.getElementById('wealthChart').getContext('2d');
    const res = swpResults;
    if (!res || !res.timeline.length) return;

    if (swpChartInstance) {
      swpChartInstance.destroy();
    }

    const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';
    const textColor = isLightTheme ? '#475569' : '#94a3b8';
    const gridColor = isLightTheme ? '#e2e8f0' : '#334155';

    // Group timeline data by years
    const yearlyData = [];
    let currentYearObj = null;

    res.timeline.forEach((item) => {
      const year = item.yearNumber;
      if (!currentYearObj || currentYearObj.year !== year) {
        if (currentYearObj) {
          yearlyData.push(currentYearObj);
        }
        currentYearObj = {
          year,
          balance: item.closingBalance,
          cumulativeWithdrawals: item.withdrawal,
          cumulativeTax: item.tax,
          addition: item.addition
        };
      } else {
        currentYearObj.balance = item.closingBalance;
        currentYearObj.cumulativeWithdrawals += item.withdrawal;
        currentYearObj.cumulativeTax += item.tax;
        currentYearObj.addition += item.addition;
      }
    });
    if (currentYearObj) {
      yearlyData.push(currentYearObj);
    }

    let runningWithdrawals = 0;
    let runningTax = 0;
    yearlyData.forEach(yd => {
      runningWithdrawals += yd.cumulativeWithdrawals;
      runningTax += yd.cumulativeTax;
      yd.runningWithdrawals = runningWithdrawals;
      yd.runningTax = runningTax;
    });

    const labels = yearlyData.map(yd => `Yr ${yd.year}`);
    let datasets = [];

    // CRITICAL: We pass the top-level chart type (e.g. 'line' or 'bar') to avoid ChartJS v3 constructor crash.
    let chartType = 'line';

    if (activeChartTab === 'balance') {
      chartType = 'line';
      datasets = [
        {
          label: 'Corpus Balance',
          data: yearlyData.map(yd => yd.balance),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.3
        }
      ];
    } else {
      chartType = 'bar';
      datasets = [
        {
          label: 'Remaining Balance',
          data: yearlyData.map(yd => yd.balance),
          backgroundColor: 'rgba(99, 102, 241, 0.7)',
          stack: 'combined'
        },
        {
          label: 'Cumulative Withdrawals',
          data: yearlyData.map(yd => yd.runningWithdrawals),
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          stack: 'combined'
        }
      ];

      if (inputs.enableTax.checked) {
        datasets.push({
          label: 'Cumulative Taxes Paid',
          data: yearlyData.map(yd => yd.runningTax),
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
          stack: 'combined'
        });
      }
    }

    swpChartInstance = new Chart(ctx, {
      type: chartType,
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: textColor,
              font: { family: 'Outfit', weight: '600' }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                if (context.parsed.y !== null) {
                  label += formatCurrency(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: textColor, font: { family: 'Inter' } }
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { family: 'Inter' },
              callback: (value) => {
                if (value >= 10000000) return '₹' + (value / 10000000).toFixed(1) + 'Cr';
                if (value >= 100000) return '₹' + (value / 100000).toFixed(0) + 'L';
                if (value >= 1000) return '₹' + (value / 1000).toFixed(0) + 'k';
                return '₹' + value;
              }
            }
          }
        }
      }
    });
  }

  function renderSWPTable() {
    const res = swpResults;
    if (!res) return;

    tableHeaders.innerHTML = '';
    tableBody.innerHTML = '';

    const columns = [
      { id: 'period', label: 'Period' },
      { id: 'opening', label: 'Opening Balance' },
      { id: 'growth', label: 'Interest Earned' },
      { id: 'additions', label: 'Additions (Hold)' },
      { id: 'withdrawal', label: 'Withdrawal' },
      { id: 'tax', label: 'Est. Tax' },
      { id: 'closing', label: 'Closing Balance' }
    ];

    columns.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.label;
      if (col.id !== 'period') th.className = 'text-right';
      tableHeaders.appendChild(th);
    });

    if (activeTableTab === 'yearly') {
      tablePagination.style.display = 'none';
      
      const years = {};
      res.timeline.forEach(item => {
        const yr = item.yearNumber;
        if (!years[yr]) {
          years[yr] = {
            year: yr,
            openingBalance: item.openingBalance,
            growth: 0,
            addition: 0,
            withdrawal: 0,
            tax: 0,
            closingBalance: item.closingBalance,
            months: []
          };
        }
        years[yr].growth += item.growth;
        years[yr].addition += item.addition;
        years[yr].withdrawal += item.withdrawal;
        years[yr].tax += item.tax;
        years[yr].closingBalance = item.closingBalance;
        years[yr].months.push(item);
      });

      Object.keys(years).forEach(yrKey => {
        const yearData = years[yrKey];
        const hasHold = yearData.months.some(m => m.phase === 'hold');
        const hasSwp = yearData.months.some(m => m.phase === 'swp');

        let phaseBadge = '';
        if (hasHold && !hasSwp) phaseBadge = ' (Hold)';
        if (!hasHold && hasSwp) phaseBadge = ' (SWP)';
        if (hasHold && hasSwp) phaseBadge = ' (Hold/SWP)';

        const trYear = document.createElement('tr');
        trYear.className = 'year-row';
        trYear.dataset.year = yrKey;
        trYear.innerHTML = `
          <td><span class="expand-icon"><i class="fa-solid fa-chevron-right"></i></span> Year ${yrKey}${phaseBadge}</td>
          <td class="text-right">${formatCurrency(yearData.openingBalance)}</td>
          <td class="text-right text-success">+${formatCurrency(yearData.growth)}</td>
          <td class="text-right text-success">${yearData.addition > 0 ? '+' + formatCurrency(yearData.addition) : '—'}</td>
          <td class="text-right text-danger">${yearData.withdrawal > 0 ? '-' + formatCurrency(yearData.withdrawal) : '—'}</td>
          <td class="text-right text-danger">${yearData.tax > 0 ? '-' + formatCurrency(yearData.tax) : '—'}</td>
          <td class="text-right">${formatCurrency(yearData.closingBalance)}</td>
        `;
        tableBody.appendChild(trYear);

        yearData.months.forEach(month => {
          const trMonth = document.createElement('tr');
          trMonth.className = `month-row yrow-${yrKey}`;
          
          let monthName = new Date(2026, month.monthInYear - 1).toLocaleString('default', { month: 'short' });
          let rowLabel = `${monthName} (M${month.month})`;
          if (month.phase === 'hold') rowLabel += ' [Hold]';
          
          trMonth.innerHTML = `
            <td>${rowLabel}</td>
            <td class="text-right">${formatCurrency(month.openingBalance)}</td>
            <td class="text-right text-success">+${formatCurrency(month.growth)}</td>
            <td class="text-right text-success">${month.addition > 0 ? '+' + formatCurrency(month.addition) : '—'}</td>
            <td class="text-right text-danger">${month.withdrawal > 0 ? '-' + formatCurrency(month.withdrawal) : '—'}</td>
            <td class="text-right text-danger">${month.tax > 0 ? '-' + formatCurrency(month.tax) : '—'}</td>
            <td class="text-right">${formatCurrency(month.closingBalance)}</td>
          `;
          tableBody.appendChild(trMonth);
        });
      });

      document.querySelectorAll('.year-row').forEach(row => {
        row.addEventListener('click', () => {
          const yr = row.dataset.year;
          row.classList.toggle('expanded');
          document.querySelectorAll(`.yrow-${yr}`).forEach(mRow => {
            mRow.classList.toggle('show');
          });
        });
      });

    } else {
      tablePagination.style.display = 'flex';
      const totalRows = res.timeline.length;
      const totalPages = Math.ceil(totalRows / rowsPerPage);
      
      if (currentSwpPage > totalPages) currentSwpPage = totalPages;
      if (currentSwpPage < 1) currentSwpPage = 1;

      paginationInfo.textContent = `Showing page ${currentSwpPage} of ${totalPages} (Months ${((currentSwpPage - 1) * rowsPerPage) + 1} to ${Math.min(currentSwpPage * rowsPerPage, totalRows)} of ${totalRows})`;
      btnPaginationPrev.disabled = currentSwpPage === 1;
      btnPaginationNext.disabled = currentSwpPage === totalPages;

      const startIndex = (currentSwpPage - 1) * rowsPerPage;
      const endIndex = Math.min(startIndex + rowsPerPage, totalRows);

      for (let i = startIndex; i < endIndex; i++) {
        const month = res.timeline[i];
        const tr = document.createElement('tr');
        
        let label = `Month ${month.month}`;
        if (month.phase === 'hold') label += ' [Hold]';

        tr.innerHTML = `
          <td>${label}</td>
          <td class="text-right">${formatCurrency(month.openingBalance)}</td>
          <td class="text-right text-success">+${formatCurrency(month.growth)}</td>
          <td class="text-right text-success">${month.addition > 0 ? '+' + formatCurrency(month.addition) : '—'}</td>
          <td class="text-right text-danger">${month.withdrawal > 0 ? '-' + formatCurrency(month.withdrawal) : '—'}</td>
          <td class="text-right text-danger">${month.tax > 0 ? '-' + formatCurrency(month.tax) : '—'}</td>
          <td class="text-right">${formatCurrency(month.closingBalance)}</td>
        `;
        tableBody.appendChild(tr);
      }
    }
  }

  // --- FIRE View Renderers ---
  function updateFIREKPIs() {
    const res = fireResults;
    if (!res) return;

    document.getElementById('kpi-fire-probability').textContent = res.probability.toFixed(1) + '%';
    const probSub = document.getElementById('kpi-fire-probability-sub');
    probSub.textContent = `Target: ${formatCurrency(res.targetCorpus)} in ${res.yearsToFIRE} yrs`;
    if (res.probability >= 80) {
      probSub.className = 'kpi-subtitle text-success';
    } else if (res.probability >= 40) {
      probSub.className = 'kpi-subtitle text-warning';
    } else {
      probSub.className = 'kpi-subtitle text-danger';
    }

    document.getElementById('kpi-fire-req-sip').textContent = formatCurrency(res.requiredSIP);
    document.getElementById('kpi-fire-req-cagr').textContent = res.requiredCAGR.toFixed(2) + '%';
  }

  function renderFIREChart() {
    const ctx = document.getElementById('fireChart').getContext('2d');
    const res = fireResults;
    if (!res) return;

    if (fireChartInstance) {
      fireChartInstance.destroy();
    }

    const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';
    const textColor = isLightTheme ? '#475569' : '#94a3b8';
    const gridColor = isLightTheme ? '#e2e8f0' : '#334155';

    const labels = res.yearlyPercentiles.map(pt => `Yr ${pt.year}`);

    // Configured with type: 'line' at top level to avoid crash
    fireChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Optimistic (90th Percentile)',
            data: res.yearlyPercentiles.map(pt => pt.p90),
            borderColor: '#10b981',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.2
          },
          {
            label: 'Median (50th Percentile)',
            data: res.yearlyPercentiles.map(pt => pt.p50),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.2
          },
          {
            label: 'Conservative (10th Percentile)',
            data: res.yearlyPercentiles.map(pt => pt.p10),
            borderColor: '#ef4444',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.2
          },
          {
            label: 'Target Corpus',
            data: Array(res.yearlyPercentiles.length).fill(res.targetCorpus),
            borderColor: '#f59e0b',
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            borderDash: [2, 2]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: textColor,
              font: { family: 'Outfit', weight: '600' }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                if (context.parsed.y !== null) {
                  label += formatCurrency(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: textColor, font: { family: 'Inter' } }
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { family: 'Inter' },
              callback: (value) => {
                if (value >= 10000000) return '₹' + (value / 10000000).toFixed(1) + 'Cr';
                if (value >= 100000) return '₹' + (value / 100000).toFixed(0) + 'L';
                if (value >= 1000) return '₹' + (value / 1000).toFixed(0) + 'k';
                return '₹' + value;
              }
            }
          }
        }
      }
    });
  }

  function renderFIRETable() {
    const res = fireResults;
    if (!res) return;

    const tbody = document.getElementById('fire-table-body');
    tbody.innerHTML = '';

    res.yearlyPercentiles.forEach(pt => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>Year ${pt.year}</td>
        <td class="text-right text-danger">${formatCurrency(pt.p10)}</td>
        <td class="text-right">${formatCurrency(pt.p50)}</td>
        <td class="text-right text-success">${formatCurrency(pt.p90)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // --- Pagination Actions ---
  btnPaginationPrev.addEventListener('click', () => {
    if (currentSwpPage > 1) {
      currentSwpPage--;
      renderSWPTable();
    }
  });

  btnPaginationNext.addEventListener('click', () => {
    const totalRows = swpResults ? swpResults.timeline.length : 0;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    if (currentSwpPage < totalPages) {
      currentSwpPage++;
      renderSWPTable();
    }
  });

  // --- Tab Switchers ---
  btnChartBalance.addEventListener('click', () => {
    btnChartBalance.classList.add('active');
    btnChartVs.classList.remove('active');
    activeChartTab = 'balance';
    renderSWPChart();
  });

  btnChartVs.addEventListener('click', () => {
    btnChartVs.classList.add('active');
    btnChartBalance.classList.remove('active');
    activeChartTab = 'comparison';
    renderSWPChart();
  });

  btnViewYearly.addEventListener('click', () => {
    btnViewYearly.classList.add('active');
    btnViewMonthly.classList.remove('active');
    activeTableTab = 'yearly';
    renderSWPTable();
  });

  btnViewMonthly.addEventListener('click', () => {
    btnViewMonthly.classList.add('active');
    btnViewYearly.classList.remove('active');
    activeTableTab = 'monthly';
    renderSWPTable();
  });

  // --- CSV Exporters ---
  btnExportCsv.addEventListener('click', () => {
    const res = swpResults;
    if (!res) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Month,Phase,Opening Balance,Addition,Growth/Interest,Withdrawal,Tax,ClosingBalance\n";

    res.timeline.forEach(item => {
      const row = [
        item.month,
        item.phase,
        item.openingBalance.toFixed(2),
        item.addition.toFixed(2),
        item.growth.toFixed(2),
        item.withdrawal.toFixed(2),
        item.tax.toFixed(2),
        item.closingBalance.toFixed(2)
      ];
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `swp_amortization_schedule.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  btnExportFireCsv.addEventListener('click', () => {
    const res = fireResults;
    if (!res) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Year,10th Percentile (Conservative),50th Percentile (Median),90th Percentile (Optimistic)\n";

    res.yearlyPercentiles.forEach(pt => {
      const row = [
        pt.year,
        pt.p10.toFixed(2),
        pt.p50.toFixed(2),
        pt.p90.toFixed(2)
      ];
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fire_percentiles_projection.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  btnCalculate.addEventListener('click', updateCalculationsAndUI);

  // Initialize page load details
  updateCalculationsAndUI();
});
