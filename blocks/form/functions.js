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

/* ============================= */
/* BANK SELECTION JS */
/* ============================= */

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
    idfc_first: "/content/dam/s_hdfc_capstone/idfc.png"
  };

  const banks = [
    { value: "hdfc_bank", text: "HDFC Bank" },
    { value: "icici_bank", text: "ICICI Bank" },
    { value: "axis_bank", text: "Axis Bank" },
    { value: "kotak", text: "Kotak" },
    { value: "sbi", text: "SBI" },
    { value: "bank_of_baroda", text: "Bank of Baroda" },
    { value: "idfc_first", text: "IDFC First" }
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


const OTP_BASE_URL = "https://writing-dimly-spout.ngrok-free.dev";

function getGlobals() {
  if (window.globals && window.globals.functions) {
    return window.globals;
  }

  if (window.guideBridge && typeof window.guideBridge.resolveNode === "function") {
    const scope = window.guideBridge.resolveNode("guide[0]");
    if (scope && scope.functions) {
      return scope;
    }
  }

  throw new Error("globals not available");
}

function setText(globals, field, text) {
  globals.functions.setProperty(field, {
    value: text,
    text: text,
  });
}

function setButtonState(globals, button, enabled) {
  globals.functions.setProperty(button, {
    enabled: enabled,
    disabled: !enabled,
    readOnly: !enabled,
  });
}

function setOtpMessage(globals, message, type) {
  const field = globals.form.otp_page["success failure msg"];

  globals.functions.setProperty(field, {
    value: message,
    text: message,
    style: {
      color: type === "success" ? "green" : "red",
      fontWeight: "600",
    },
  });
}

function runOtpCountdown() {
  const globals = getGlobals();

  let seconds = 21;

  const timerField = globals.form.otp_page.otp_resend_timer;
  const resendBtn = globals.form.otp_page.otp_resend_icon;

  if (window.otpTimerInterval) {
    clearInterval(window.otpTimerInterval);
  }

  setButtonState(globals, resendBtn, false);

  window.otpTimerInterval = setInterval(() => {
    setText(globals, timerField, "Resend OTP in: " + seconds + " secs");

    seconds--;

    if (seconds < 0) {
      clearInterval(window.otpTimerInterval);
      window.otpTimerInterval = null;

      setText(globals, timerField, "Resend OTP");
      setButtonState(globals, resendBtn, true);
    }
  }, 1000);

  return "";
}

function generateOTP() {
  try {
    const globals = getGlobals();
    const data = globals.functions.exportData();

    const payload = {
      mobile: data.aadhaar_linked_mobile_number || "",
      pan: data.pan_card_number || null,
      dob: data.date_of_birth || null,
    };

    if (!payload.mobile || (!payload.pan && !payload.dob)) {
      setOtpMessage(globals, "Enter Mobile and PAN or DOB", "error");
      return "";
    }

    fetch(OTP_BASE_URL + "/generate-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.status === "success" && result.otp) {
          window.otpTryCount = 0;

          globals.functions.setProperty(globals.form.otp_page.otp_code, {
            value: String(result.otp),
          });

          setText(globals, globals.form.otp_page.otp_attempts_left, "3/3 attempt(s) left");
          setOtpMessage(globals, "", "error");

          runOtpCountdown();
          return "";
        }

        setOtpMessage(globals, result.message || "OTP generation failed", "error");
        return "";
      })
      .catch((err) => {
        console.error("Generate OTP Error:", err);
        setOtpMessage(globals, "Generate OTP API Error", "error");
      });

    return "";
  } catch (e) {
    console.error("generateOTP Error:", e);
    return "";
  }
}

function handleOtpChange() {
  const globals = getGlobals();
  const data = globals.functions.exportData();
  const otp = String(data.otp_code || "").replace(/\s/g, "");

  setButtonState(globals, globals.form.otp_page.otp_submit, otp.length === 6);

  return "";
}

function validateOTP() {
  try {
    const globals = getGlobals();
    const data = globals.functions.exportData();

    const otp = String(data.otp_code || "").replace(/\s/g, "");

    const payload = {
      mobile: data.aadhaar_linked_mobile_number || "",
      pan: data.pan_card_number || null,
      dob: data.date_of_birth || null,
      otp: otp,
    };

    if (!otp || otp.length !== 6) {
      setOtpMessage(globals, "Enter valid 6-digit OTP", "error");
      return "";
    }

    if (window.otpTryCount === undefined) {
      window.otpTryCount = 0;
    }

    if (window.otpTryCount >= 3) {
      setOtpMessage(globals, "No attempts left. Please resend OTP.", "error");
      setButtonState(globals, globals.form.otp_page.otp_submit, false);
      return "";
    }

    fetch(OTP_BASE_URL + "/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.status === "success") {
          if (window.otpTimerInterval) {
            clearInterval(window.otpTimerInterval);
            window.otpTimerInterval = null;
          }

          setOtpMessage(globals, "OTP validated successfully", "success");
          setText(globals, globals.form.otp_page.otp_attempts_left, "Verified");

          setButtonState(globals, globals.form.otp_page.otp_submit, false);
          setButtonState(globals, globals.form.otp_page.otp_resend_icon, false);

          return "";
        }

        window.otpTryCount++;

        const remaining = 3 - window.otpTryCount;

        if (remaining > 0) {
          setText(globals, globals.form.otp_page.otp_attempts_left, remaining + "/3 attempt(s) left");
          setOtpMessage(globals, "Invalid OTP", "error");
        } else {
          setText(globals, globals.form.otp_page.otp_attempts_left, "No attempts left");
          setOtpMessage(globals, "No attempts left. Please resend OTP.", "error");
          setButtonState(globals, globals.form.otp_page.otp_submit, false);
        }

        return "";
      })
      .catch((err) => {
        console.error("Verify OTP Error:", err);
        setOtpMessage(globals, "Verify OTP API Error", "error");
      });

    return "";
  } catch (e) {
    console.error("validateOTP Error:", e);
    return "";
  }
}

function resendOTP() {
  try {
    const globals = getGlobals();

    window.otpTryCount = 0;

    globals.functions.setProperty(globals.form.otp_page.otp_code, {
      value: "",
    });

    setText(globals, globals.form.otp_page.otp_attempts_left, "3/3 attempt(s) left");
    setOtpMessage(globals, "", "error");
    setButtonState(globals, globals.form.otp_page.otp_submit, false);

    generateOTP();

    return "";
  } catch (e) {
    console.error("resendOTP Error:", e);
    return "";
  }
}// eslint-disable-next-line import/prefer-default-export
export {
  getFullName, days, submitFormArrayToString, maskMobileNumber,  updateLoanDetails,
  updateLoanDisplay, getRate, getTax,  initSalaryBankUI, generateOTP,validateOTP,
  resendOTP, runOtpCountdown, handleOtpChange,
};


