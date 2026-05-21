(() => {
  const STORAGE_KEY = "financial-tracker-demo-v1";
  const CURRENCY = "USD";
  const DEFAULT_CATEGORIES = {
    income: ["Salary", "Freelance", "Investments", "Other Income"],
    expense: ["Housing", "Food", "Transport", "Utilities", "Leisure", "Health", "Other Expense"]
  };

  const state = {
    transactions: [],
    budgets: {},
    editingId: null
  };

  const elements = {};

  function formatMoney(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: CURRENCY
    }).format(value || 0);
  }

  function monthKeyFromDate(dateString) {
    return (dateString || "").slice(0, 7);
  }

  function parseAmount(value) {
    const amount = Number(value);
    return Number.isFinite(amount) ? Math.abs(amount) : 0;
  }

  function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return `txn-${Date.now()}-${Math.floor(Math.random() * 1e5)}`;
  }

  function getCurrentMonthKey() {
    return new Date().toISOString().slice(0, 7);
  }

  function loadState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw);
      state.transactions = Array.isArray(parsed.transactions) ? parsed.transactions : [];
      state.budgets = parsed && typeof parsed.budgets === "object" && parsed.budgets ? parsed.budgets : {};
    } catch (error) {
      console.error("Unable to load demo state:", error);
      setStatus("Could not load saved data. Starting fresh.");
    }
  }

  function saveState() {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        transactions: state.transactions,
        budgets: state.budgets
      })
    );
  }

  function setStatus(message) {
    elements.status.textContent = message || "";
  }

  function getAllCategories() {
    const txnCategories = state.transactions.map((item) => item.category).filter(Boolean);
    return Array.from(
      new Set([...DEFAULT_CATEGORIES.income, ...DEFAULT_CATEGORIES.expense, ...txnCategories])
    ).sort((a, b) => a.localeCompare(b));
  }

  function fillCategorySelect(selectElement, type, includeAll = false) {
    const categories =
      type === "income"
        ? DEFAULT_CATEGORIES.income
        : type === "expense"
          ? DEFAULT_CATEGORIES.expense
          : getAllCategories();
    selectElement.innerHTML = "";

    if (includeAll) {
      const allOpt = document.createElement("option");
      allOpt.value = "all";
      allOpt.textContent = "All categories";
      selectElement.append(allOpt);
    }

    for (const category of categories) {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      selectElement.append(option);
    }
  }

  function syncFormCategoryOptions() {
    const type = elements.type.value;
    const previous = elements.category.value;
    fillCategorySelect(elements.category, type, false);
    if (previous && Array.from(elements.category.options).some((opt) => opt.value === previous)) {
      elements.category.value = previous;
    }
  }

  function getFilteredTransactions() {
    const search = elements.filterSearch.value.trim().toLowerCase();
    const type = elements.filterType.value;
    const category = elements.filterCategory.value;
    const month = elements.filterMonth.value;

    return state.transactions.filter((item) => {
      if (type !== "all" && item.type !== type) {
        return false;
      }
      if (category !== "all" && item.category !== category) {
        return false;
      }
      if (month !== "all" && monthKeyFromDate(item.date) !== month) {
        return false;
      }
      if (!search) {
        return true;
      }
      const fullText = `${item.description} ${item.category} ${item.note || ""}`.toLowerCase();
      return fullText.includes(search);
    });
  }

  function buildMonthOptions() {
    const currentValue = elements.filterMonth.value || "all";
    const months = new Set([getCurrentMonthKey()]);
    for (const item of state.transactions) {
      if (item.date) {
        months.add(monthKeyFromDate(item.date));
      }
    }

    const monthValues = Array.from(months).sort((a, b) => b.localeCompare(a));
    elements.filterMonth.innerHTML = '<option value="all">All months</option>';

    monthValues.forEach((monthValue) => {
      const option = document.createElement("option");
      option.value = monthValue;
      const [year, month] = monthValue.split("-");
      const date = new Date(Number(year), Number(month) - 1, 1);
      option.textContent = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      elements.filterMonth.append(option);
    });

    if (Array.from(elements.filterMonth.options).some((opt) => opt.value === currentValue)) {
      elements.filterMonth.value = currentValue;
    }
  }

  function renderSummary(filtered) {
    const income = filtered
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);
    const expense = filtered
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);
    const balance = income - expense;
    const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : "0.0";

    elements.summaryIncome.textContent = formatMoney(income);
    elements.summaryExpense.textContent = formatMoney(expense);
    elements.summaryBalance.textContent = formatMoney(balance);
    elements.summaryBalance.classList.toggle("ft-positive", balance >= 0);
    elements.summaryBalance.classList.toggle("ft-negative", balance < 0);
    elements.summarySavingsRate.textContent = `${savingsRate}%`;
    elements.summaryCount.textContent = String(filtered.length);
  }

  function renderTransactions(filtered) {
    elements.transactionBody.innerHTML = "";

    if (filtered.length === 0) {
      elements.emptyState.hidden = false;
      return;
    }
    elements.emptyState.hidden = true;

    filtered
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${item.date}</td>
          <td>${item.description}</td>
          <td>${item.category}</td>
          <td>${item.type}</td>
          <td class="${item.type === "expense" ? "ft-negative" : "ft-positive"}">
            ${item.type === "expense" ? "-" : "+"}${formatMoney(item.amount)}
          </td>
          <td>${item.note || "-"}</td>
          <td>
            <button class="ft-btn small ft-btn-secondary" data-action="edit" data-id="${item.id}" type="button">Edit</button>
            <button class="ft-btn small ft-btn-danger" data-action="delete" data-id="${item.id}" type="button">Delete</button>
          </td>
        `;
        elements.transactionBody.append(row);
      });
  }

  function renderBudgets() {
    elements.budgetList.innerHTML = "";
    const selectedMonth = elements.filterMonth.value === "all" ? getCurrentMonthKey() : elements.filterMonth.value;
    const budgetEntries = Object.entries(state.budgets).sort((a, b) => a[0].localeCompare(b[0]));

    if (budgetEntries.length === 0) {
      elements.budgetList.innerHTML = "<p>No budgets yet. Add one for an expense category below.</p>";
      return;
    }

    const expensesByCategory = {};
    for (const txn of state.transactions) {
      if (txn.type === "expense" && monthKeyFromDate(txn.date) === selectedMonth) {
        expensesByCategory[txn.category] = (expensesByCategory[txn.category] || 0) + txn.amount;
      }
    }

    for (const [category, monthlyBudget] of budgetEntries) {
      const spent = expensesByCategory[category] || 0;
      const usedRatio = monthlyBudget > 0 ? spent / monthlyBudget : 0;
      const percentage = Math.max(0, Math.min(100, usedRatio * 100));
      const item = document.createElement("div");
      item.className = "ft-budget-item";
      item.innerHTML = `
        <div class="ft-budget-header">
          <strong>${category}</strong>
          <div>
            ${formatMoney(spent)} / ${formatMoney(monthlyBudget)}
            <button class="ft-btn small ft-btn-danger" data-action="remove-budget" data-category="${category}" type="button">Remove</button>
          </div>
        </div>
        <div class="ft-budget-bar">
          <div class="ft-budget-fill ${usedRatio > 1 ? "over" : ""}" style="width:${percentage}%;"></div>
        </div>
      `;
      elements.budgetList.append(item);
    }
  }

  function renderTrendChart() {
    const canvas = elements.trendChart;
    const ctx = canvas.getContext("2d");
    const width = canvas.clientWidth;
    const height = 240;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    const months = [];
    const baseDate = new Date();
    baseDate.setDate(1);

    for (let i = 5; i >= 0; i--) {
      const date = new Date(baseDate);
      date.setMonth(baseDate.getMonth() - i);
      const key = date.toISOString().slice(0, 7);
      months.push({
        key,
        label: date.toLocaleDateString("en-US", { month: "short" }),
        income: 0,
        expense: 0
      });
    }

    for (const item of state.transactions) {
      const month = months.find((entry) => entry.key === monthKeyFromDate(item.date));
      if (!month) {
        continue;
      }
      if (item.type === "income") {
        month.income += item.amount;
      } else {
        month.expense += item.amount;
      }
    }

    const maxValue = Math.max(
      1,
      ...months.flatMap((entry) => [entry.income, entry.expense])
    );
    const margin = { top: 16, right: 18, bottom: 34, left: 34 };
    const chartHeight = height - margin.top - margin.bottom;
    const chartWidth = width - margin.left - margin.right;
    const groupWidth = chartWidth / months.length;
    const barWidth = Math.max(10, groupWidth * 0.33);

    ctx.strokeStyle = "rgba(127,127,127,0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top + chartHeight);
    ctx.lineTo(width - margin.right, margin.top + chartHeight);
    ctx.stroke();

    months.forEach((entry, index) => {
      const xCenter = margin.left + groupWidth * index + groupWidth / 2;
      const incomeHeight = (entry.income / maxValue) * chartHeight;
      const expenseHeight = (entry.expense / maxValue) * chartHeight;
      const incomeX = xCenter - barWidth - 2;
      const expenseX = xCenter + 2;
      const yBase = margin.top + chartHeight;

      ctx.fillStyle = "rgba(53, 196, 106, 0.85)";
      ctx.fillRect(incomeX, yBase - incomeHeight, barWidth, incomeHeight);

      ctx.fillStyle = "rgba(255, 102, 117, 0.85)";
      ctx.fillRect(expenseX, yBase - expenseHeight, barWidth, expenseHeight);

      ctx.fillStyle = "rgba(170,170,170,0.95)";
      ctx.textAlign = "center";
      ctx.font = "12px sans-serif";
      ctx.fillText(entry.label, xCenter, height - 12);
    });
  }

  function renderAll() {
    fillCategorySelect(elements.filterCategory, "all", true);
    buildMonthOptions();
    const filtered = getFilteredTransactions();
    renderSummary(filtered);
    renderTransactions(filtered);
    renderBudgets();
    renderTrendChart();
  }

  function clearForm() {
    state.editingId = null;
    elements.transactionId.value = "";
    elements.form.reset();
    elements.date.value = new Date().toISOString().slice(0, 10);
    elements.type.value = "expense";
    syncFormCategoryOptions();
    elements.submitButton.textContent = "Add Transaction";
    elements.cancelEdit.hidden = true;
  }

  function upsertTransaction(event) {
    event.preventDefault();

    const payload = {
      id: state.editingId || createId(),
      date: elements.date.value,
      description: elements.description.value.trim(),
      amount: parseAmount(elements.amount.value),
      type: elements.type.value,
      category: elements.category.value,
      note: elements.note.value.trim()
    };

    if (!payload.date || !payload.description || payload.amount <= 0 || !payload.category) {
      setStatus("Please provide date, description, category, and a valid amount.");
      return;
    }

    if (state.editingId) {
      state.transactions = state.transactions.map((txn) =>
        txn.id === state.editingId ? payload : txn
      );
      setStatus("Transaction updated.");
    } else {
      state.transactions.push(payload);
      setStatus("Transaction added.");
    }

    saveState();
    clearForm();
    renderAll();
  }

  function startEdit(id) {
    const txn = state.transactions.find((item) => item.id === id);
    if (!txn) {
      return;
    }
    state.editingId = id;
    elements.transactionId.value = id;
    elements.date.value = txn.date;
    elements.description.value = txn.description;
    elements.amount.value = String(txn.amount);
    elements.type.value = txn.type;
    syncFormCategoryOptions();
    elements.category.value = txn.category;
    elements.note.value = txn.note || "";
    elements.submitButton.textContent = "Save Changes";
    elements.cancelEdit.hidden = false;
    setStatus("Editing transaction. Save changes or cancel.");
  }

  function deleteTransaction(id) {
    state.transactions = state.transactions.filter((item) => item.id !== id);
    saveState();
    renderAll();
    setStatus("Transaction removed.");
  }

  function seedDemoData() {
    const now = new Date();
    const makeDate = (monthOffset, day) => {
      const date = new Date(now.getFullYear(), now.getMonth() + monthOffset, day);
      return date.toISOString().slice(0, 10);
    };

    state.transactions = [
      {
        id: createId(),
        date: makeDate(0, 3),
        description: "Monthly Salary",
        amount: 4300,
        type: "income",
        category: "Salary",
        note: "Main job"
      },
      {
        id: createId(),
        date: makeDate(0, 5),
        description: "Groceries",
        amount: 320,
        type: "expense",
        category: "Food",
        note: "Weekly market"
      },
      {
        id: createId(),
        date: makeDate(0, 8),
        description: "Rent",
        amount: 1450,
        type: "expense",
        category: "Housing",
        note: "Apartment rent"
      },
      {
        id: createId(),
        date: makeDate(0, 11),
        description: "Freelance Design Work",
        amount: 780,
        type: "income",
        category: "Freelance",
        note: "One client project"
      },
      {
        id: createId(),
        date: makeDate(0, 14),
        description: "Electricity Bill",
        amount: 120,
        type: "expense",
        category: "Utilities",
        note: "May invoice"
      },
      {
        id: createId(),
        date: makeDate(-1, 17),
        description: "Cinema + dinner",
        amount: 110,
        type: "expense",
        category: "Leisure",
        note: ""
      },
      {
        id: createId(),
        date: makeDate(-1, 28),
        description: "ETF dividend",
        amount: 95,
        type: "income",
        category: "Investments",
        note: ""
      }
    ];

    state.budgets = {
      Housing: 1500,
      Food: 600,
      Utilities: 250,
      Leisure: 300
    };

    saveState();
    clearForm();
    renderAll();
    setStatus("Demo data loaded.");
  }

  function clearAllData() {
    state.transactions = [];
    state.budgets = {};
    saveState();
    clearForm();
    renderAll();
    setStatus("All tracker data cleared.");
  }

  function setBudget(event) {
    event.preventDefault();
    const category = elements.budgetCategory.value;
    const amount = parseAmount(elements.budgetAmount.value);
    if (!category || amount <= 0) {
      setStatus("Add a valid budget amount and category.");
      return;
    }
    state.budgets[category] = amount;
    elements.budgetAmount.value = "";
    saveState();
    renderBudgets();
    setStatus(`Budget saved for ${category}.`);
  }

  function removeBudget(category) {
    delete state.budgets[category];
    saveState();
    renderBudgets();
    setStatus(`Budget removed for ${category}.`);
  }

  function bindEvents() {
    elements.form.addEventListener("submit", upsertTransaction);
    elements.type.addEventListener("change", syncFormCategoryOptions);
    elements.cancelEdit.addEventListener("click", clearForm);
    elements.seedBtn.addEventListener("click", seedDemoData);
    elements.clearBtn.addEventListener("click", clearAllData);
    elements.budgetForm.addEventListener("submit", setBudget);

    [elements.filterSearch, elements.filterType, elements.filterCategory, elements.filterMonth].forEach(
      (control) => control.addEventListener("input", renderAll)
    );

    elements.transactionBody.addEventListener("click", (event) => {
      const actionElement = event.target.closest("button[data-action]");
      if (!actionElement) {
        return;
      }
      const action = actionElement.dataset.action;
      const id = actionElement.dataset.id;
      if (action === "edit" && id) {
        startEdit(id);
      }
      if (action === "delete" && id) {
        deleteTransaction(id);
      }
    });

    elements.budgetList.addEventListener("click", (event) => {
      const actionElement = event.target.closest("button[data-action='remove-budget']");
      if (!actionElement) {
        return;
      }
      removeBudget(actionElement.dataset.category);
    });

    window.addEventListener("resize", renderTrendChart);
  }

  function init() {
    elements.root = document.getElementById("ft-demo");
    if (!elements.root) {
      return;
    }

    elements.form = document.getElementById("transaction-form");
    elements.transactionId = document.getElementById("transaction-id");
    elements.date = document.getElementById("transaction-date");
    elements.description = document.getElementById("transaction-description");
    elements.amount = document.getElementById("transaction-amount");
    elements.type = document.getElementById("transaction-type");
    elements.category = document.getElementById("transaction-category");
    elements.note = document.getElementById("transaction-note");
    elements.submitButton = document.getElementById("transaction-submit");
    elements.cancelEdit = document.getElementById("transaction-cancel");
    elements.seedBtn = document.getElementById("seed-demo-data");
    elements.clearBtn = document.getElementById("clear-demo-data");

    elements.filterSearch = document.getElementById("filter-search");
    elements.filterType = document.getElementById("filter-type");
    elements.filterCategory = document.getElementById("filter-category");
    elements.filterMonth = document.getElementById("filter-month");

    elements.summaryBalance = document.getElementById("summary-balance");
    elements.summaryIncome = document.getElementById("summary-income");
    elements.summaryExpense = document.getElementById("summary-expense");
    elements.summarySavingsRate = document.getElementById("summary-savings-rate");
    elements.summaryCount = document.getElementById("summary-count");

    elements.transactionBody = document.getElementById("transaction-body");
    elements.emptyState = document.getElementById("transaction-empty");
    elements.status = document.getElementById("demo-status");

    elements.budgetForm = document.getElementById("budget-form");
    elements.budgetCategory = document.getElementById("budget-category");
    elements.budgetAmount = document.getElementById("budget-amount");
    elements.budgetList = document.getElementById("budget-list");
    elements.trendChart = document.getElementById("trend-chart");

    elements.date.value = new Date().toISOString().slice(0, 10);
    elements.filterType.value = "all";
    elements.filterCategory.value = "all";
    elements.filterMonth.value = getCurrentMonthKey();

    loadState();
    fillCategorySelect(elements.budgetCategory, "expense", false);
    syncFormCategoryOptions();
    bindEvents();
    renderAll();
    setStatus("Interactive demo ready.");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
