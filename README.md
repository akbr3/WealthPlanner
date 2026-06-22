# SWP Calculator & Wealth Planner

A premium, interactive Systematic Withdrawal Plan (SWP) Calculator designed to model wealth decumulation with professional features like holding periods, additional savings, compounding selections, inflation adjustments, and capital gains tax estimations.

## Features

1. **Flexible Compounding**: Select expected rates of return with compounding options:
   - **Yearly**: $r = (1 + R/100)^{1/12} - 1$ (Compounded Annual Growth Rate equivalent)
   - **Half-Yearly**: $r = (1 + R/200)^{2/12} - 1$
   - **Quarterly**: $r = (1 + R/400)^{4/12} - 1$
   - **Monthly**: $r = R / 1200$ (Simple monthly compound)
2. **Deferment/Hold Period**: Postpone withdrawals for a specified period to let your initial investment compound. Option to add monthly/yearly SIPs during this period to boost the initial SWP corpus.
3. **Inflation Adjustment**: Scale monthly withdrawals by a yearly inflation percentage to preserve your real purchasing power over long durations.
4. **Capital Gains Tax Estimation**: Estimate the capital gains tax (LTCG) incurred on the growth portion of each withdrawal. Includes an option to deduct estimated tax directly from the remaining balance to model true net-of-tax retirement income.
5. **Detailed Reports & Visuals**:
   - **Dashboard Charts**: Multi-axis progression of corpus balance, cumulative withdrawals, and taxes (built via Chart.js).
   - **Amortization Schedule Table**: Group by year and expand to view individual months, or toggle to a paginated monthly scroll view.
   - **Data Export**: Click "CSV" to download the full monthly breakdown sheet for spreadsheet analysis.

## Setup & Run Instructions

Since this is a client-side vanilla web application:
1. Simply locate the `index.html` file in your filesystem.
2. Double-click to open it in any modern browser (Chrome, Edge, Firefox, Safari, etc.).
3. No build tools, CLI tools, or server configurations are required.

## Key Formulas

### Proportional Cost-Basis Tracking for Tax
When a redemption $W$ is made from a portfolio of value $V$ with cost-basis $C$:
- **Gain Ratio**: $g = \max(0, \frac{V - C}{V})$
- **Taxable Gains**: $G = W \times g$
- **Est. Capital Gains Tax**: $T = G \times (\text{Tax Rate} / 100)$
- **Adjusted Cost Basis**: $C_{\text{new}} = C_{\text{old}} \times (1 - \frac{W}{V})$

This matches standard mutual fund redemptions, ensuring tax calculations are accurate and cost-basis decays proportionally with principal redemptions.
