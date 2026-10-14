const loadBtn = document.querySelector("#load-transactions");
const transactionsContent = document.querySelector("#transactions-content");
const search = document.querySelector("#search-input");
const transactionsList = document.querySelector("#transactions-list");
const transactionsCount = document.querySelector("#transactions-count");
const sortButtons = document.querySelectorAll("[data-sort]");
const loading = document.querySelector("#loading");
const errorMessage = document.querySelector("#error-message");

let searchInput = "";
let sortBy = "date";
let sortDirection = "asc";

const fetchTransactions = async (url) => {
  loading.removeAttribute("hidden");
  errorMessage.setAttribute("hidden", "");

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);

    errorMessage.removeAttribute("hidden");
    return null;
  } finally {
    loading.setAttribute("hidden", "");
  }
};

loadBtn.addEventListener("click", async () => {
  const url = buildUrl();

  const transactions = await fetchTransactions(url);
  if (!transactions) return;

  renderTransactions(transactions);
});

search.addEventListener("input", async (event) => {
  searchInput = event.target.value.trim();
  const url = buildUrl();
  const transactions = await fetchTransactions(url);
  if (!transactions) return;

  renderTransactions(transactions);
});

const renderTransactions = (transactions) => {
  transactionsContent.removeAttribute("hidden");
  transactionsList.innerHTML = "";

  transactions.forEach((transaction, index) => {
    let transactionClass;
    let amountClass;
    let icon;

    if (transaction.type === "افزایش اعتبار") {
      transactionClass = "transaction-icon--income";
      amountClass = "amount--income";
      icon = "↓";
    } else {
      transactionClass = "transaction-icon--expense";
      amountClass = "amount--expense";
      icon = "↑";
    }

    const row = `<tr>
                  <td>${(index+1).toLocaleString(`fa-IR`)}</td>

                  <td>
                    <div class="transaction-name">
                      <span class="transaction-icon ${transactionClass}">
                        ${icon}
                      </span>

                      <div>
                        <strong>${transaction.type}</strong>
                      </div>
                    </div>
                  </td>

                  <td class="amount ${amountClass}"> ${transaction.price.toLocaleString(
                    `fa-IR`,
                  )}</td>

                  <td class="tracking-number">${transaction.refId.toLocaleString(`fa-IR`)}</td>

                  <td class="date">${new Date(transaction.date).toLocaleString(`fa-IR`)}</td>
                </tr>`;

    transactionsList.innerHTML += row;
  });
  transactionsCount.textContent = `${transactions.length.toLocaleString(`fa-IR`)} تراکنش`;
};

sortButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    if (sortBy === button.dataset.sort) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortDirection = "asc";
    }
    sortBy = button.dataset.sort;

    sortButtons.forEach((btn) => {
      const sortIcon = btn.querySelector(".sort-icon");
      sortIcon.style.transform = "rotate(0deg)";
    });

    const sortIcon = button.querySelector(".sort-icon");
    sortIcon.style.transform =
      sortDirection === "desc" ? "rotate(180deg)" : "rotate(0deg)";

    const url = buildUrl();

    const transactions = await fetchTransactions(url);
    if (!transactions) return;

    renderTransactions(transactions);
  });
});

const buildUrl = () => {
  if (searchInput) {
    return `http://localhost:3000/transactions?refId_like=${searchInput}&_sort=${sortBy}&_order=${sortDirection}`;
  } else {
    return `http://localhost:3000/transactions?_sort=${sortBy}&_order=${sortDirection}`;
  }
};
