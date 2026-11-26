(() => {
  const form = document.getElementById('opsEstimator');
  if (!form) return;

  const hoursInput = document.getElementById('repeatHours');
  const costInput = document.getElementById('hourlyCost');
  const currencyInput = document.getElementById('costCurrency');
  const result = document.getElementById('annualCost');
  const label = document.getElementById('annualCostLabel');

  const update = () => {
    const hours = Number(hoursInput.value);
    const rate = Number(costInput.value);
    const currency = currencyInput.value;
    if (hoursInput.value === '' || costInput.value === '' || !Number.isFinite(hours) || !Number.isFinite(rate) || hours < 0 || rate < 0) {
      result.textContent = 'Add two estimates';
      label.textContent = 'A rough annual labour cost tied to these repeat hours.';
      return;
    }

    const annual = hours * rate * 52;
    const formatted = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(annual);
    result.textContent = `${currency} ${formatted}`;
    label.textContent = `Illustrative annual cost at ${hours} repeat-work hours per week.`;
  };

  [hoursInput, costInput, currencyInput].forEach((field) => field.addEventListener('input', update));
  [hoursInput, costInput, currencyInput].forEach((field) => field.addEventListener('change', update));
})();
