---
title: Financial Tracker Demo
icon: fas fa-chart-line
order: 5
---

This page is a **fully interactive frontend demo** for a financial tracker app.

- Add/edit/delete transactions
- Filter by text, type, category, and month
- Track monthly budgets per category
- See live summary totals and a 6-month income vs expense chart
- Save all changes in your browser (`localStorage`)

<link rel="stylesheet" href="{{ '/assets/css/financial-tracker-demo.css' | relative_url }}">

<div id="ft-demo" class="ft-demo">
  <section class="ft-grid">
    <article class="ft-card ft-summary-item">
      <span class="ft-summary-label">Balance (current view)</span>
      <span id="summary-balance" class="ft-summary-value">$0.00</span>
    </article>
    <article class="ft-card ft-summary-item">
      <span class="ft-summary-label">Income</span>
      <span id="summary-income" class="ft-summary-value">$0.00</span>
    </article>
    <article class="ft-card ft-summary-item">
      <span class="ft-summary-label">Expenses</span>
      <span id="summary-expense" class="ft-summary-value">$0.00</span>
    </article>
    <article class="ft-card ft-summary-item">
      <span class="ft-summary-label">Savings Rate</span>
      <span id="summary-savings-rate" class="ft-summary-value">0%</span>
    </article>
    <article class="ft-card ft-summary-item">
      <span class="ft-summary-label">Transactions (visible)</span>
      <span id="summary-count" class="ft-summary-value">0</span>
    </article>
  </section>

  <section class="ft-card">
    <h3>Add or Edit Transaction</h3>
    <form id="transaction-form">
      <input id="transaction-id" type="hidden">
      <div class="ft-form-grid">
        <div class="ft-field">
          <label for="transaction-date">Date</label>
          <input id="transaction-date" type="date" required>
        </div>
        <div class="ft-field">
          <label for="transaction-description">Description</label>
          <input id="transaction-description" type="text" placeholder="e.g. Weekly groceries" required>
        </div>
        <div class="ft-field">
          <label for="transaction-amount">Amount</label>
          <input id="transaction-amount" type="number" min="0.01" step="0.01" placeholder="0.00" required>
        </div>
        <div class="ft-field">
          <label for="transaction-type">Type</label>
          <select id="transaction-type" required>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div class="ft-field">
          <label for="transaction-category">Category</label>
          <select id="transaction-category" required></select>
        </div>
        <div class="ft-field">
          <label for="transaction-note">Notes</label>
          <textarea id="transaction-note" placeholder="Optional notes..."></textarea>
        </div>
      </div>
      <div class="ft-actions">
        <button id="transaction-submit" class="ft-btn" type="submit">Add Transaction</button>
        <button id="transaction-cancel" class="ft-btn ft-btn-secondary" type="button" hidden>Cancel Edit</button>
        <button id="seed-demo-data" class="ft-btn ft-btn-secondary" type="button">Load Demo Data</button>
        <button id="clear-demo-data" class="ft-btn ft-btn-danger" type="button">Clear All Data</button>
      </div>
    </form>
    <p id="demo-status" class="ft-status" aria-live="polite"></p>
  </section>

  <section class="ft-card">
    <h3>Filters</h3>
    <div class="ft-form-grid">
      <div class="ft-field">
        <label for="filter-search">Search</label>
        <input id="filter-search" type="text" placeholder="description, note, category...">
      </div>
      <div class="ft-field">
        <label for="filter-type">Type</label>
        <select id="filter-type">
          <option value="all">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>
      <div class="ft-field">
        <label for="filter-category">Category</label>
        <select id="filter-category">
          <option value="all">All categories</option>
        </select>
      </div>
      <div class="ft-field">
        <label for="filter-month">Month</label>
        <select id="filter-month">
          <option value="all">All months</option>
        </select>
      </div>
    </div>
  </section>

  <section class="ft-grid">
    <article class="ft-card">
      <h3>Monthly Budgets</h3>
      <form id="budget-form">
        <div class="ft-form-grid">
          <div class="ft-field">
            <label for="budget-category">Category</label>
            <select id="budget-category"></select>
          </div>
          <div class="ft-field">
            <label for="budget-amount">Budget Amount</label>
            <input id="budget-amount" type="number" min="1" step="0.01" placeholder="e.g. 500.00" required>
          </div>
        </div>
        <div class="ft-actions">
          <button class="ft-btn" type="submit">Save Budget</button>
        </div>
      </form>
      <div id="budget-list"></div>
    </article>
    <article class="ft-card">
      <h3>Income vs Expenses (Last 6 Months)</h3>
      <div class="ft-canvas-wrap">
        <canvas id="trend-chart" aria-label="Income and expense trend chart"></canvas>
      </div>
    </article>
  </section>

  <section class="ft-card">
    <h3>Transactions</h3>
    <div class="ft-table-wrapper">
      <table class="ft-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Note</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="transaction-body"></tbody>
      </table>
    </div>
    <p id="transaction-empty" class="ft-empty">No transactions match the current filters.</p>
  </section>
</div>

<script src="{{ '/assets/js/financial-tracker-demo.js' | relative_url }}"></script>
