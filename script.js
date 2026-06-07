const form = document.getElementById("expense-form");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");

const transactionList = document.getElementById("transaction-list");

const searchInput = document.getElementById("search");
const filterCategory = document.getElementById("filter-category");

let transactions =
  JSON.parse(localStorage.getItem("transactions")) || [];

// ---------------- ADD TRANSACTION ----------------
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const type = typeInput.value;
  const category = categoryInput.value;
  const date = dateInput.value;

  if (!title || !amount || !type || !category || !date) {
    alert("Please fill all fields");
    return;
  }

  const transaction = {
    id: Date.now(),
    title,
    amount,
    type,
    category,
    date,
  };

  transactions.push(transaction);

  saveTransactions();
  updateAll();
  form.reset();
});

// ---------------- SAVE ----------------
function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// ---------------- DELETE ----------------
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveTransactions();
  updateAll();
}

// ---------------- SUMMARY ----------------
function updateSummary() {
  const income = transactions
    .filter(t => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = income - expense;

  balanceEl.textContent = `₹${balance.toFixed(2)}`;
  incomeEl.textContent = `₹${income.toFixed(2)}`;
  expenseEl.textContent = `₹${expense.toFixed(2)}`;
}

// ---------------- RENDER ----------------
function renderTransactions() {
  const searchValue = searchInput.value.toLowerCase();
  const selectedCategory = filterCategory.value;

  let filtered = transactions.filter(item => {
    return (
      item.title.toLowerCase().includes(searchValue) &&
      (selectedCategory === "all" || item.category === selectedCategory)
    );
  });

  transactionList.innerHTML = "";

  if (filtered.length === 0) {
    transactionList.innerHTML = `<div class="empty">No Transactions Found</div>`;
    return;
  }

  filtered.slice().reverse().forEach(item => {
    const li = document.createElement("li");

    li.className = `transaction ${item.type}`;

    li.innerHTML = `
      <div class="transaction-info">
        <div class="transaction-title">${item.title}</div>
        <div class="transaction-category">${item.category}</div>
        <div class="transaction-date">${formatDate(item.date)}</div>
      </div>

      <div class="transaction-amount ${
        item.type === "income" ? "amount-income" : "amount-expense"
      }">
        ${item.type === "income" ? "+" : "-"}₹${item.amount}
      </div>

      <button class="delete-btn" onclick="deleteTransaction(${item.id})">✕</button>
    `;

    transactionList.appendChild(li);
  });
}

// ---------------- DATE FORMAT ----------------
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ---------------- SEARCH / FILTER ----------------
searchInput.addEventListener("input", updateAll);
filterCategory.addEventListener("change", updateAll);

// ---------------- CHARTS ----------------
let expenseChart = null;
let monthlyChart = null;

// ---------------- PIE CHART ----------------
function updateChart() {
  const expenses = transactions.filter(t => t.type === "expense");

  const categoryTotals = {};

  expenses.forEach(t => {
    categoryTotals[t.category] =
      (categoryTotals[t.category] || 0) + t.amount;
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  const canvas = document.getElementById("expenseChart");
  if (!canvas) return;

  if (expenseChart) expenseChart.destroy();

  if (labels.length === 0) return;

  expenseChart = new Chart(canvas, {
    type: "pie",
    data: {
      labels,
      datasets: [{ data }],
    },
  });
}

// ---------------- MONTHLY CHART ----------------
function updateMonthlyChart() {
  const monthlyTotals = {};

  transactions.forEach(t => {
    if (t.type !== "expense") return;
    if (!t.date) return;

    const month = new Date(t.date).toLocaleString("en-IN", {
      month: "short",
      year: "numeric",
    });

    monthlyTotals[month] =
      (monthlyTotals[month] || 0) + t.amount;
  });

  const labels = Object.keys(monthlyTotals);
  const data = Object.values(monthlyTotals);

  const canvas = document.getElementById("monthlyChart");
  if (!canvas) return;

  if (monthlyChart) monthlyChart.destroy();

  monthlyChart = new Chart(canvas, {
    type: "line",
    data: {
      labels: labels.length ? labels : ["No Data"],
      datasets: [
        {
          label: "Monthly Expenses",
          data: data.length ? data : [0],
          borderColor: "#ef4444",
          backgroundColor: "rgba(239,68,68,0.2)",
          tension: 0.3,
          fill: true,
        },
      ],
    },
  });
}

// ---------------- THEME ----------------
const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {
  function updateThemeButton() {
    themeToggle.textContent =
      document.body.classList.contains("light-theme")
        ? "☀️ Light Mode"
        : "🌙 Dark Mode";
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");

    localStorage.setItem(
      "theme",
      document.body.classList.contains("light-theme")
    );

    updateThemeButton();
  });

  if (localStorage.getItem("theme") === "true") {
    document.body.classList.add("light-theme");
  }

  updateThemeButton();
}

// ---------------- MAIN UPDATE ----------------
function updateAll() {
  updateSummary();
  renderTransactions();
  updateChart();
  updateMonthlyChart();
}

// ---------------- INITIAL LOAD ----------------
updateAll();