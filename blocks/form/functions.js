/**
 * Get Full Name
 * @name getFullName Concats first name and last name
 * @param {string} firstname in Stringformat
 * @param {string} lastname in Stringformat
 * @return {string}
 */
function getFullName(firstname, lastname) {
  return `${firstname} ${lastname}`.trim();
}

/**
 * Custom submit function
 * @param {scope} globals
 */
function submitFormArrayToString(globals) {
  const data = globals.functions.exportData();
  Object.keys(data).forEach((key) => {
    if (Array.isArray(data[key])) {
      data[key] = data[key].join(',');
    }
  });
  globals.functions.submitForm(data, true, 'application/json');
}

/**
 * Calculate the number of days between two dates.
 * @param {*} endDate
 * @param {*} startDate
 * @returns {number} returns the number of days between two dates
 */
function days(endDate, startDate) {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  // return zero if dates are valid
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  const diffInMs = Math.abs(end.getTime() - start.getTime());
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}

/**
* Masks the first 5 digits of the mobile number with *
* @param {*} mobileNumber
* @returns {string} returns the mobile number with first 5 digits masked
*/
function maskMobileNumber(mobileNumber) {
  if (!mobileNumber) {
    return '';
  }
  const value = mobileNumber.toString();
  // Mask first 5 digits and keep the rest
  return ` ${'*'.repeat(5)}${value.substring(5)}`;
}

/**
 * EMI Calculation
 * @param {scope} globals
 */
function getNumber(value) {
  return Number(String(value || "").replace(/[₹,\sA-Za-z]/g, ""));
}

function getLoanAmount(globals) {
  const data = globals.functions.exportData();
  const raw = getNumber(data.loan_amount);

  /* slider raw value → actual loan amount */
  if (raw <= 0.25) return 50000;
  if (raw <= 1) return Math.round(raw * 200000);

  if (raw <= 5) return Math.round(raw * 200000);      // up to 10L
  if (raw <= 6) return Math.round(1000000 + (raw - 5) * 500000); // 10L to 15L

  return Math.round(raw);
}

function updateLoanDisplay(globals) {
  const loanAmount = getLoanAmount(globals);

  return loanAmount > 0
    ? "₹" + loanAmount.toLocaleString("en-IN")
    : "";
}

function updateLoanDetails(globals) {
  const data = globals.functions.exportData();

  const loanAmount = getLoanAmount(globals);

  const rawTenure = getNumber(data["Loan Tenure"]);
  const tenure = rawTenure <= 7 ? rawTenure * 12 : rawTenure;

  const rate = 10.97;
  const monthlyRate = rate / (12 * 100);

  let emi = 0;

  if (loanAmount > 0 && tenure > 0) {
    emi =
      (loanAmount *
        monthlyRate *
        Math.pow(1 + monthlyRate, tenure)) /
      (Math.pow(1 + monthlyRate, tenure) - 1);

    emi = Math.round(emi);
  }

  return emi > 0
    ? "₹" + emi.toLocaleString("en-IN")
    : "";
}

function getRate() {
  return "10.97%";
}

function getTax() {
  return "₹4,000";
}

function initBankDropdownSelection() {
  const banks = [
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
    "Kotak",
    "SBI",
    "Bank of Baroda",
    "IDFC First"
  ];

  function setupDropdown() {
    const dropdown = document.querySelector(".field-other-bank-name select");
    const bankWrappers = document.querySelectorAll(".field-salary-bank .radio-wrapper");

    if (!dropdown || !bankWrappers.length) return;

    if (dropdown.options.length <= 1) {
      dropdown.innerHTML = "";

      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.text = "Other Bank";
      dropdown.appendChild(defaultOption);

      banks.forEach(function (bank) {
        const option = document.createElement("option");
        option.value = bank;
        option.text = bank;
        dropdown.appendChild(option);
      });
    }

    if (dropdown.dataset.bankListener !== "true") {
      dropdown.dataset.bankListener = "true";

      dropdown.addEventListener("change", function () {
        const selectedBank = this.value;

        bankWrappers.forEach(function (wrapper, index) {
          const input = wrapper.querySelector('input[type="radio"]');

          if (input && banks[index] === selectedBank) {
            input.checked = true;
            input.click();
            input.dispatchEvent(new Event("change", { bubbles: true }));
          }
        });
      });
    }
  }

  setupDropdown();
  setTimeout(setupDropdown, 500);
  setTimeout(setupDropdown, 1000);
  setTimeout(setupDropdown, 2000);
}

if (typeof window !== "undefined") {
  window.addEventListener("load", initBankDropdownSelection);
}
// eslint-disable-next-line import/prefer-default-export
export {
  getFullName, days, submitFormArrayToString, maskMobileNumber,  updateLoanDetails,
  updateLoanDisplay, getRate, getTax, initBankDropdownSelection,
};


