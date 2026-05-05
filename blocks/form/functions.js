function getFullName(firstname, lastname) {
  return `${firstname} ${lastname}`.trim();
}

function submitFormArrayToString(globals) {
  const data = globals.functions.exportData();

  Object.keys(data).forEach((key) => {
    if (Array.isArray(data[key])) {
      data[key] = data[key].join(",");
    }
  });

  globals.functions.submitForm(data, true, "application/json");
}

function days(endDate, startDate) {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  const diffInMs = Math.abs(end.getTime() - start.getTime());
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}

function maskMobileNumber(mobileNumber) {
  if (!mobileNumber) {
    return "";
  }

  const value = mobileNumber.toString();
  return ` ${"*".repeat(5)}${value.substring(5)}`;
}

function getNumber(value) {
  return Number(String(value || "").replace(/[₹,\sA-Za-z]/g, ""));
}

function getLoanAmount(globals) {
  const data = globals.functions.exportData();
  const raw = getNumber(data.loan_amount);

  if (raw <= 0.25) return 50000;
  if (raw <= 1) return Math.round(raw * 200000);
  if (raw <= 5) return Math.round(raw * 200000);
  if (raw <= 6) return Math.round(1000000 + (raw - 5) * 500000);

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
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
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

function initSalaryBankUI() {
  const panel = document.querySelector(".field-salary-bank-selection");
  const dropdownWrapper = document.querySelector(".drop-down-wrapper.field-salary-bank");
  const select = document.querySelector("select[name='salary_bank']");

  if (!panel || !dropdownWrapper || !select || panel.dataset.salaryBankReady === "true") return;

  panel.dataset.salaryBankReady = "true";

  const bankLogos = {
    hdfc_bank: "/content/dam/s_hdfc_capstone/hdfc.png",
    icici_bank: "/content/dam/s_hdfc_capstone/icici.png",
    axis_bank: "/content/dam/s_hdfc_capstone/axis.png",
    kotak: "/content/dam/s_hdfc_capstone/kotak.png",
    sbi: "/content/dam/s_hdfc_capstone/sbi.png",
    bank_of_baroda: "/content/dam/s_hdfc_capstone/bob.jpeg",
    idfc_first: "/content/dam/s_hdfc_capstone/idfc.png",
  };

  const banks = [
    { value: "hdfc_bank", text: "HDFC Bank" },
    { value: "icici_bank", text: "ICICI Bank" },
    { value: "axis_bank", text: "Axis Bank" },
    { value: "kotak", text: "Kotak" },
    { value: "sbi", text: "SBI" },
    { value: "bank_of_baroda", text: "Bank of Baroda" },
    { value: "idfc_first", text: "IDFC First" },
  ];

  const row = document.createElement("div");
  row.className = "salary-bank-content-row";

  const cardContainer = document.createElement("div");
  cardContainer.className = "bank-card-container";

  row.appendChild(cardContainer);
  row.appendChild(dropdownWrapper);

  const legend = panel.querySelector("legend.field-label");

  if (legend && legend.nextSibling) {
    panel.insertBefore(row, legend.nextSibling);
  } else {
    panel.prepend(row);
  }

  select.innerHTML = `
    <option value="hdfc_bank">HDFC Bank</option>
    <option value="other_bank">Other Bank</option>
  `;

  function renderCards(type) {
    cardContainer.innerHTML = "";

    const list =
      type === "hdfc_bank"
        ? banks.filter((bank) => bank.value === "hdfc_bank")
        : banks;

    list.forEach((bank) => {
      const card = document.createElement("div");
      card.className = "bank-card";
      card.dataset.value = bank.value;

      card.innerHTML = `
        <img src="${bankLogos[bank.value]}" alt="${bank.text}">
        <span>${bank.text}</span>
      `;

      if (bank.value === "hdfc_bank") {
        card.classList.add("active");
      }

      card.addEventListener("click", function () {
        document.querySelectorAll(".bank-card").forEach((item) => {
          item.classList.remove("active");
        });

        card.classList.add("active");
      });

      cardContainer.appendChild(card);
    });
  }

  select.value = "hdfc_bank";
  renderCards("hdfc_bank");

  select.addEventListener("change", function () {
    renderCards(select.value);
  });
}

if (typeof window !== "undefined") {
  window.initSalaryBankUI = initSalaryBankUI;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSalaryBankUI);
  } else {
    initSalaryBankUI();
  }

  window.addEventListener("load", initSalaryBankUI);

  setTimeout(initSalaryBankUI, 500);
  setTimeout(initSalaryBankUI, 1500);
  setTimeout(initSalaryBankUI, 3000);
}

export {
  getFullName,
  days,
  submitFormArrayToString,
  maskMobileNumber,
  updateLoanDetails,
  updateLoanDisplay,
  getRate,
  getTax,
  initSalaryBankUI,
};