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
/*GENERATE OTP*/
/**
 * @param {scope} globals
 */
/* GENERATE OTP */
const OTP_BASE_URL = "https://writing-dimly-spout.ngrok-free.dev";

function getValue(globals, name) {
  try {
    if (globals && globals.functions && globals.functions.exportData) {
      const data = globals.functions.exportData();
      if (data && data[name]) return data[name];
    }

    if (
      globals &&
      globals.form &&
      globals.form.personal_loan_offer &&
      globals.form.personal_loan_offer[name]
    ) {
      return globals.form.personal_loan_offer[name].value || "";
    }

    const el = document.querySelector(`[name="${name}"]`);
    return el ? el.value : "";
  } catch (e) {
    return "";
  }
}

function setOtpValue(globals, value) {
  try {
    if (
      globals &&
      globals.functions &&
      globals.functions.setProperty &&
      globals.form &&
      globals.form.otp_page &&
      globals.form.otp_page.otp_code
    ) {
      globals.functions.setProperty(globals.form.otp_page.otp_code, {
        value: value,
      });
      return;
    }

    const el = document.querySelector(`[name="otp_code"]`);
    if (el) {
      el.value = value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
  } catch (e) {
    console.error("setOtpValue Error:", e);
  }
}

function setTextValue(globals, fieldName, value) {
  try {
    if (
      globals &&
      globals.functions &&
      globals.functions.setProperty &&
      globals.form &&
      globals.form.otp_page &&
      globals.form.otp_page[fieldName]
    ) {
      globals.functions.setProperty(globals.form.otp_page[fieldName], {
        value: value,
        text: value,
      });
      return;
    }

    const el = document.querySelector(`[name="${fieldName}"]`);
    if (el) {
      el.value = value;
      el.textContent = value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
  } catch (e) {
    console.error("setTextValue Error:", e);
  }
}

function runOtpCountdown(globals) {
  try {
    console.log("Timer started");

    let seconds = 21;

    if (window.otpTimerInterval) {
      clearInterval(window.otpTimerInterval);
      window.otpTimerInterval = null;
    }

    setButtonState(globals, "otp_resend_icon", false);

    function updateTimerText(text) {
      setTextValue(globals, "otp_resend_timer", text);

      const timerWrapper =
        document.querySelector('[name="otp_resend_timer"]') ||
        document.querySelector(".field-otp_resend_timer") ||
        document.querySelector(".field-otp-resend-timer");

      if (timerWrapper) {
        timerWrapper.value = text;
        timerWrapper.textContent = text;

        const innerNodes = timerWrapper.querySelectorAll("p, span, div, label");
        innerNodes.forEach(function (node) {
          node.textContent = text;
        });
      }
    }

    updateTimerText("Resend OTP in: 21 secs");

    window.otpTimerInterval = setInterval(function () {
      updateTimerText("Resend OTP in: " + seconds + " secs");
      seconds--;

      if (seconds < 0) {
        clearInterval(window.otpTimerInterval);
        window.otpTimerInterval = null;

        updateTimerText("Resend OTP");
        setButtonState(globals, "otp_resend_icon", true);
      }
    }, 1000);

    return "";
  } catch (e) {
    console.error("runOtpCountdown Error:", e);
    return "";
  }
}
function generateOTP(globals) {
  try {
    const payload = {
      mobile: getValue(globals, "aadhaar_linked_mobile_number"),
      pan: getValue(globals, "pan_card_number") || null,
      dob: getValue(globals, "date_of_birth") || null,
    };

    console.log("OTP PAYLOAD:", payload);

    if (!payload.mobile || (!payload.pan && !payload.dob)) {
      console.error("Missing mobile or PAN/DOB", payload);
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
      .then(function (res) {
        return res.json();
      })
      .then(function (result) {
        console.log("OTP RESULT:", result);

        if (result.status === "success" && result.otp) {
          window.otpTryCount = 0;

          setOtpValue(globals, String(result.otp));
          setTextValue(globals, "otp_attempts_left", "3/3 attempt(s) left");

          setTimeout(function () {
  runOtpCountdown(globals);
}, 500);
        }
      })
      .catch(function (err) {
        console.error("Generate OTP API Error:", err);
      });

    return "";
  } catch (e) {
    console.error("generateOTP Error:", e);
    return "";
  }
}
/* DISABLE */
function setButtonState(globals, fieldName, enabled) {
  try {
    if (
      globals &&
      globals.functions &&
      globals.functions.setProperty &&
      globals.form &&
      globals.form.otp_page &&
      globals.form.otp_page[fieldName]
    ) {
      globals.functions.setProperty(globals.form.otp_page[fieldName], {
        enabled: enabled,
        disabled: !enabled,
        readOnly: !enabled,
      });
    }

    const btn =
      document.querySelector(`[name="${fieldName}"]`) ||
      document.querySelector(`.field-${fieldName} button`) ||
      document.querySelector(`.field-${fieldName}`);

    if (btn) {
      btn.disabled = !enabled;
      btn.style.pointerEvents = enabled ? "auto" : "none";
      btn.style.opacity = enabled ? "1" : "0.5";
    }
  } catch (e) {
    console.error("setButtonState Error:", e);
  }
}
// 
function validateOTP(globals) {
  try {
    const form = globals.form;
    const otpPanel = form.otp_page;

    const otp = String(
      otpPanel.otp_code?.value ||
      otpPanel.otp_code?.$value ||
      ""
    ).trim();

    console.log("OTP ENTERED:", otp);

    if (!/^\d{6}$/.test(otp)) {
      globals.functions.setProperty(
        otpPanel["success failure msg"],
        {
          value: "Enter valid 6-digit OTP",
          visible: true
        }
      );
      return;
    }

    if (window.otpTryCount === undefined) {
      window.otpTryCount = 0;
    }

    if (window.otpTryCount >= 3) {
      globals.functions.setProperty(
        otpPanel["success failure msg"],
        {
          value: "No attempts left. Please resend OTP.",
          visible: true
        }
      );
      return;
    }

    const payload = {
      mobile: form.personal_loan_offer.aadhaar_linked_mobile_number?.value ||
              form.personal_loan_offer.aadhaar_linked_mobile_number?.$value ||
              "",
      pan: form.personal_loan_offer.pan_card_number?.value ||
           form.personal_loan_offer.pan_card_number?.$value ||
           null,
      dob: form.personal_loan_offer.date_of_birth?.value ||
           form.personal_loan_offer.date_of_birth?.$value ||
           null,
      otp: otp
    };

    console.log("VERIFY PAYLOAD:", payload);

    fetch(OTP_BASE_URL + "/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true"
      },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (result) {
        console.log("VERIFY RESULT:", result);

        if (result.status === "success") {
          globals.functions.setProperty(
            otpPanel["success failure msg"],
            {
              value: "OTP validated successfully",
              visible: true
            }
          );

          globals.functions.setProperty(
            otpPanel.otp_attempts_left,
            {
              value: "Verified",
              visible: true
            }
          );

          globals.functions.setProperty(form.otp_page, {
            visible: false
          });

          globals.functions.setProperty(form.customerdetails, {
            visible: true,
            enabled: true
          });

          return;
        }

        window.otpTryCount++;

        const remaining = 3 - window.otpTryCount;

        globals.functions.setProperty(
          otpPanel.otp_attempts_left,
          {
            value:
              remaining > 0
                ? remaining + "/3 attempt(s) left"
                : "No attempts left",
            visible: true
          }
        );

        globals.functions.setProperty(
          otpPanel["success failure msg"],
          {
            value:
              remaining > 0
                ? "Invalid OTP"
                : "No attempts left. Please resend OTP.",
            visible: true
          }
        );
      })
      .catch(function (err) {
        console.error("VERIFY ERROR:", err);

        globals.functions.setProperty(
          otpPanel["success failure msg"],
          {
            value: "Verify OTP API Error",
            visible: true
          }
        );
      });

  } catch (e) {
    console.error("validateOTP Error:", e);
  }
}
// 
function resendOTP(globals) {
  try {
    window.otpTryCount = 0;

    setOtpValue(globals, "");
    setTextValue(globals, "otp_attempts_left", "3/3 attempt(s) left");
    setTextValue(globals, "success failure msg", "");

    generateOTP(globals);

    return "";
  } catch (e) {
    console.error("resendOTP Error:", e);
    return "";
  }
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
  generateOTP,
  runOtpCountdown,
  validateOTP,
  resendOTP,
};