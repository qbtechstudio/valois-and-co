// Valois & Co. Luxury Mortgage & Wealth Financing Calculator
class LuxuryMortgageCalculator {
  constructor() {
    this.homePrice = 28500000;
    this.downPaymentPercent = 20;
    this.interestRate = 5.85;
    this.loanTermYears = 30;
    this.hoaMonthly = 3200;
    this.displayRate = 1;
    this.displaySymbol = '$';
    this.annualTaxRate = 1.15; // 1.15%
    this.annualInsuranceRate = 0.35; // 0.35%
    let preload = null;
    try { preload = window.sessionStorage.getItem('valois_calc_preload_price'); } catch (_) { /* Storage is optional on local previews. */ }
    if (preload) {
      try { window.sessionStorage.removeItem('valois_calc_preload_price'); } catch (_) { /* Continue with the saved value. */ }
      this.homePrice = parseFloat(preload);
    }

    this.initElements();
    this.bindEvents();
    this.updateDownAmount();
    this.calculate();
  }

  initElements() {
    this.priceSlider = document.getElementById('calc-price-slider');
    this.priceInput = document.getElementById('calc-price-input');
    if (this.priceSlider) this.priceSlider.value = this.homePrice;
    if (this.priceInput) this.priceInput.value = this.formatInputMoney(this.homePrice);
    
    this.downPercentSlider = document.getElementById('calc-down-slider');
    this.downPercentInput = document.getElementById('calc-down-percent');
    this.downAmountInput = document.getElementById('calc-down-amount');
    
    this.interestSlider = document.getElementById('calc-interest-slider');
    this.interestInput = document.getElementById('calc-interest-input');
    
    this.termSelect = document.getElementById('calc-term-select');
    this.hoaInput = document.getElementById('calc-hoa-input');

    // Display targets
    this.displayPriceNumeric = document.getElementById('display-price-numeric');
    this.totalMonthlyDisplay = document.getElementById('calc-monthly-total');
    this.principalDisplay = document.getElementById('calc-principal-interest');
    this.taxDisplay = document.getElementById('calc-property-tax');
    this.insuranceDisplay = document.getElementById('calc-insurance');
    this.hoaDisplay = document.getElementById('calc-hoa-display');
    this.loanAmountDisplay = document.getElementById('calc-loan-amount');
    this.totalInterestDisplay = document.getElementById('calc-total-interest');

    // SVG Donut Bars
    this.donutSegmentPrincipal = document.getElementById('donut-principal');
    this.donutSegmentTax = document.getElementById('donut-tax');
    this.donutSegmentInsurance = document.getElementById('donut-insurance');
    this.donutSegmentHoa = document.getElementById('donut-hoa');
  }

  bindEvents() {
    if (!this.priceSlider) return;

    document.addEventListener('valoisCurrencyChange', (event) => {
      const { rate, symbol, currency } = event.detail || {};
      this.displayRate = Number(rate) || 1;
      this.displaySymbol = symbol || '$';
      document.querySelectorAll('.calc-currency-symbol').forEach(el => {
        el.textContent = this.displaySymbol.trim() + (currency === 'AED' ? ' ' : '');
      });
      if (this.priceInput) this.priceInput.value = this.formatInputMoney(this.homePrice);
      if (this.hoaInput) this.hoaInput.value = this.formatInputMoney(this.hoaMonthly);
      this.updateDownAmount();
      this.calculate();
    });

    // Home Price
    this.priceSlider.addEventListener('input', (e) => {
      this.homePrice = parseFloat(e.target.value);
      this.priceInput.value = this.formatInputMoney(this.homePrice);
      this.updateDownAmount();
      this.calculate();
    });

    this.priceInput.addEventListener('change', (e) => {
      let val = (parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 1000000) / this.displayRate;
      val = Math.max(1000000, Math.min(100000000, val));
      this.homePrice = val;
      this.priceSlider.value = val;
      this.priceInput.value = this.formatInputMoney(val);
      this.updateDownAmount();
      this.calculate();
    });

    // Down payment percent
    this.downPercentSlider.addEventListener('input', (e) => {
      this.downPaymentPercent = parseFloat(e.target.value);
      this.downPercentInput.value = this.downPaymentPercent;
      this.updateDownAmount();
      this.calculate();
    });

    this.downPercentInput.addEventListener('change', (e) => {
      let val = parseFloat(e.target.value) || 10;
      val = Math.max(5, Math.min(80, val));
      this.downPaymentPercent = val;
      this.downPercentSlider.value = val;
      this.downPercentInput.value = val;
      this.updateDownAmount();
      this.calculate();
    });

    // Down amount input
    this.downAmountInput.addEventListener('change', (e) => {
      let amount = (parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || (this.homePrice * this.displayRate * 0.2)) / this.displayRate;
      amount = Math.max(this.homePrice * 0.05, Math.min(this.homePrice * 0.9, amount));
      this.downPaymentPercent = Math.round((amount / this.homePrice) * 100);
      this.downPercentSlider.value = this.downPaymentPercent;
      this.downPercentInput.value = this.downPaymentPercent;
      this.downAmountInput.value = this.formatInputMoney(amount);
      this.calculate();
    });

    // Interest Rate
    this.interestSlider.addEventListener('input', (e) => {
      this.interestRate = parseFloat(e.target.value);
      this.interestInput.value = this.interestRate.toFixed(2);
      this.calculate();
    });

    this.interestInput.addEventListener('change', (e) => {
      let val = parseFloat(e.target.value) || 5.0;
      val = Math.max(2.0, Math.min(15.0, val));
      this.interestRate = val;
      this.interestSlider.value = val;
      this.interestInput.value = val.toFixed(2);
      this.calculate();
    });

    // Loan Term
    this.termSelect.addEventListener('change', (e) => {
      this.loanTermYears = parseInt(e.target.value, 10);
      this.calculate();
    });

    // HOA
    if (this.hoaInput) {
      this.hoaInput.addEventListener('change', (e) => {
        let val = (parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0) / this.displayRate;
        this.hoaMonthly = Math.max(0, val);
        this.hoaInput.value = this.formatInputMoney(this.hoaMonthly);
        this.calculate();
      });
    }

    // Quick property load button trigger
    document.addEventListener('loadPropertyToCalculator', (e) => {
      if (e.detail && e.detail.price) {
        this.setPropertyPrice(e.detail.price);
      }
    });
  }

  setPropertyPrice(price) {
    this.homePrice = price;
    if (this.priceSlider) this.priceSlider.value = price;
    if (this.priceInput) this.priceInput.value = this.formatInputMoney(price);
    this.updateDownAmount();
    this.calculate();
  }

  updateDownAmount() {
    const downAmount = (this.homePrice * (this.downPaymentPercent / 100));
    if (this.downAmountInput) {
      this.downAmountInput.value = this.formatInputMoney(downAmount);
    }
  }

  formatInputMoney(amountUsd) {
    return Math.round(amountUsd * this.displayRate).toLocaleString();
  }

  formatMoney(amountUsd) {
    return `${this.displaySymbol}${Math.round(amountUsd * this.displayRate).toLocaleString()}`;
  }

  calculate() {
    const downAmount = this.homePrice * (this.downPaymentPercent / 100);
    const loanAmount = this.homePrice - downAmount;
    
    // Monthly interest calculation
    const monthlyRate = (this.interestRate / 100) / 12;
    const totalPayments = this.loanTermYears * 12;

    let monthlyPrincipalInterest = 0;
    if (monthlyRate > 0) {
      monthlyPrincipalInterest = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
    } else {
      monthlyPrincipalInterest = loanAmount / totalPayments;
    }

    const monthlyTax = (this.homePrice * (this.annualTaxRate / 100)) / 12;
    const monthlyInsurance = (this.homePrice * (this.annualInsuranceRate / 100)) / 12;
    const totalMonthly = monthlyPrincipalInterest + monthlyTax + monthlyInsurance + this.hoaMonthly;
    const totalLoanCost = (monthlyPrincipalInterest * totalPayments);
    const totalInterest = Math.max(0, totalLoanCost - loanAmount);

    // Format results
    const fmt = (num) => this.formatMoney(num);

    if (this.displayPriceNumeric) this.displayPriceNumeric.textContent = this.formatInputMoney(this.homePrice);
    if (this.totalMonthlyDisplay) this.totalMonthlyDisplay.textContent = fmt(totalMonthly);
    if (this.principalDisplay) this.principalDisplay.textContent = fmt(monthlyPrincipalInterest);
    if (this.taxDisplay) this.taxDisplay.textContent = fmt(monthlyTax);
    if (this.insuranceDisplay) this.insuranceDisplay.textContent = fmt(monthlyInsurance);
    if (this.hoaDisplay) this.hoaDisplay.textContent = fmt(this.hoaMonthly);
    if (this.loanAmountDisplay) this.loanAmountDisplay.textContent = fmt(loanAmount);
    if (this.totalInterestDisplay) this.totalInterestDisplay.textContent = fmt(totalInterest);

    this.updateChart(monthlyPrincipalInterest, monthlyTax, monthlyInsurance, this.hoaMonthly, totalMonthly);
  }

  updateChart(p, t, i, h, total) {
    const circumference = 2 * Math.PI * 70; // r=70 -> 439.82
    const pPct = (p / total);
    const tPct = (t / total);
    const iPct = (i / total);
    const hPct = (h / total);

    const pLen = pPct * circumference;
    const tLen = tPct * circumference;
    const iLen = iPct * circumference;
    const hLen = hPct * circumference;

    let offset = 0;
    if (this.donutSegmentPrincipal) {
      this.donutSegmentPrincipal.style.strokeDasharray = `${pLen} ${circumference - pLen}`;
      this.donutSegmentPrincipal.style.strokeDashoffset = `-${offset}`;
      offset += pLen;
    }

    if (this.donutSegmentTax) {
      this.donutSegmentTax.style.strokeDasharray = `${tLen} ${circumference - tLen}`;
      this.donutSegmentTax.style.strokeDashoffset = `-${offset}`;
      offset += tLen;
    }

    if (this.donutSegmentInsurance) {
      this.donutSegmentInsurance.style.strokeDasharray = `${iLen} ${circumference - iLen}`;
      this.donutSegmentInsurance.style.strokeDashoffset = `-${offset}`;
      offset += iLen;
    }

    if (this.donutSegmentHoa) {
      this.donutSegmentHoa.style.strokeDasharray = `${hLen} ${circumference - hLen}`;
      this.donutSegmentHoa.style.strokeDashoffset = `-${offset}`;
    }
  }
}

// Global initializer
document.addEventListener('DOMContentLoaded', () => {
  window.mortgageCalc = new LuxuryMortgageCalculator();
});
