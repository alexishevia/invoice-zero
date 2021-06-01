import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
} from "@ionic/react";
import {
  filterOutline,
} from "ionicons/icons";
import {
  dateToDayStr,
  monthEnd,
  monthStart,
  substractMonths,
  getMonthsInRange,
} from "../../../helpers/date";
import { getAccounts, onAccountsChange } from "../../../models/accounts";
import { getCategories, onCategoriesChange } from "../../../models/categories";
import { iterateIncomes } from "../../../models/incomes";
import { iterateExpenses } from "../../../models/expenses";
import { iterateTransfers } from "../../../models/transfers";
import FiltersModal from "../../FiltersModal";
import AccountBalances from "./AccountBalances";
import IncomeVsExpenses from "./IncomeVsExpenses";
import ExpensesByMonth from "./ExpensesByMonth";

// asMoneyFloat truncates a float to 2 decimal points
function asMoneyFloat(num) {
  return Number.parseFloat(num.toFixed(2), 10);
}

export default function Trends({ onError }) {
  const today = new Date();
  const [activeFilters, setActiveFilters] = useState({
    fromDate: dateToDayStr(substractMonths(monthStart(today), 12)),
    toDate: dateToDayStr(monthEnd(today)),
    accountIds: {},
    categoryIds: {},
  });
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accountBalances, setAccountBalances] = useState({});
  const [accountMonthlyExpenses, setAccountMonthlyExpenses] = useState({});

  // incomeByMonth is an object with format:
  // { [monthName]: value }
  // eg:
  // { "2020-01": 1250.34, "2020-02": 1832.01, ... }
  const [incomeByMonth, setIncomeByMonth] = useState({});

  // expensesByMonth is an object with format:
  // { [monthName]: value }
  // eg:
  // { "2020-01": 1250.34, "2020-02": 1832.01, ... }
  const [expensesByMonth, setExpensesByMonth] = useState({});

  // expensesByCategory is an object with format:
  // { [categoryName]: { [monthName]: expenses } }
  // eg:
  // {
  //   "Restaurantes": { "2019-09": 4892.01, "2019-10": 3501.85, ... },
  //     ...
  // }
  const [expensesByCategory, setExpensesByCategory] = useState({});

  function handleOpenFiltersModal(evt) {
    evt.preventDefault();
    setIsFiltersModalOpen(true);
  }

  function handleFiltersUpdate(newFilters) {
    setActiveFilters(newFilters);
  }

  function handleCloseFiltersModal() {
    setIsFiltersModalOpen(false);
  }

  useEffect(() => {
    async function fetchAccounts() {
      try {
        setAccounts(await getAccounts());
      } catch(err){
        onError(err);
      }
    }
    fetchAccounts();
    const subscription = onAccountsChange(() => fetchAccounts());
    return () => { subscription.unsubscribe() }
  }, [onError]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setCategories(await getCategories());
      } catch(err){
        onError(err);
      }
    }
    fetchCategories();
    const subscription = onCategoriesChange(() => fetchCategories());
    return () => { subscription.unsubscribe() }
  }, [onError]);

  useEffect(() => {
    // wait until accounts and categories have loaded
    if (!accounts.length || !categories.length) {
      return;
    }

    const months = getMonthsInRange(
      new Date(activeFilters.fromDate),
      new Date(activeFilters.toDate)
    );
    const monthsObj = months.reduce(
      (memo, { name }) => ({
        ...memo,
        [name]: 0,
      }),
      {}
    );
    const incomeByMonthResult = { ...monthsObj };
    const expensesByMonthResult = { ...monthsObj };
    const expensesByCategoryResult = {};

    setIncomeByMonth(incomeByMonthResult);
    setExpensesByMonth(expensesByMonthResult);

    const mStart = dateToDayStr(monthStart(new Date()));
    const mEnd = dateToDayStr(monthEnd(new Date()));
    const balances = accounts.reduce((memo, acc) => ({
      ...memo,
      [acc.id]: acc.initialBalance || 0,
    }), {});
    const monthlyExpenses = accounts.reduce((memo, acc) => ({
      ...memo,
      [acc.id]: 0,
    }), {});

    let cancelled = false;

    function matchesFilters({ transactionDate, accountID, categoryID }) {
      return (
        activeFilters.fromDate <= transactionDate &&
        transactionDate <= activeFilters.toDate &&
        activeFilters.accountIds[accountID] !== false &&
        activeFilters.categoryIds[categoryID] !== false
      )
    }

    async function iterateThroughIncomes() {
      for await (const income of iterateIncomes()) {
        if (cancelled) { return; }

        const { transactionDate, accountID, amount } = income;

        balances[accountID] = (balances[accountID] || 0) + amount

        if (!matchesFilters(income)) {
          continue;
        }

        const month = transactionDate.substr(0, 7);
        incomeByMonthResult[month] += amount;
      }
    }

    async function iterateThroughExpenses() {
      for await (const expense of iterateExpenses()) {
        if (cancelled) { return; }

        const { transactionDate, amount, accountID, categoryID } = expense;

        balances[accountID] = (balances[accountID] || 0) - amount

        if(transactionDate >= mStart && transactionDate <= mEnd) {
          monthlyExpenses[accountID] = (monthlyExpenses[accountID] || 0) + amount
        }

        if (!matchesFilters(expense)) {
          continue;
        }

        const month = transactionDate.substr(0, 7);
        expensesByMonthResult[month] += amount;
        const category = categories.find((cat) => cat.id === categoryID);
        const categoryName = (category && category.name) ? category.name : "No Category";
        if (!expensesByCategoryResult[categoryName]) {
          expensesByCategoryResult[categoryName] = { ...monthsObj };
        }
        expensesByCategoryResult[categoryName][month] += amount;
      }
    }

    async function iterateThroughTransfers() {
      for await (const transfer of iterateTransfers()) {
        if (cancelled) { return; }
        const { fromID, toID, amount } = transfer;
        balances[fromID] = (balances[fromID] || 0) - amount;
        balances[toID] = (balances[toID] || 0) + amount;
      }
    }

    async function fetchGraphData() {
      await Promise.all([
        iterateThroughIncomes(),
        iterateThroughExpenses(),
        iterateThroughTransfers(),
      ]);
      if (cancelled) { return; }
      setAccountBalances(balances);
      setAccountMonthlyExpenses(monthlyExpenses);
      setIncomeByMonth(
        Object.entries(incomeByMonthResult).reduce(
          (memo, [month, val]) => ({
            ...memo,
            [month]: asMoneyFloat(val),
          }),
          {}
        )
      );
      setExpensesByMonth(
        Object.entries(expensesByMonthResult).reduce(
          (memo, [month, val]) => ({
            ...memo,
            [month]: asMoneyFloat(val),
          }),
          {}
        )
      );
      setExpensesByCategory(
        Object.entries(expensesByCategoryResult).reduce(
          (memo, [categoryName, values]) => ({
            ...memo,
            [categoryName]: Object.entries(values).reduce(
              (agg, [month, val]) => ({
                ...agg,
                [month]: asMoneyFloat(val),
              }),
              {}
            ),
          }),
          {}
        )
      );
    }
    fetchGraphData();
    return () => { cancelled = true; };
  }, [
    activeFilters,
    accounts,
    categories,
    onError,
  ]);

  return (
    <div style={{marginBottom: '5em' }}>
      <FiltersModal
        isOpen={isFiltersModalOpen}
        accounts={accounts}
        categories={categories}
        initialFilters ={activeFilters}
        onUpdate={handleFiltersUpdate}
        onClose={handleCloseFiltersModal}
      />
      <IonItem style={{ marginBottom: "1rem" }}>
        <IonLabel>
          <h2>Account Balances</h2>
        </IonLabel>
      </IonItem>
      <AccountBalances
        accounts={accounts.map(({ id, name}) => ({
          name,
          balance: (accountBalances[id] || 0),
          monthlyExpenses: (accountMonthlyExpenses[id] || 0),
        }))}
      />
      <IonItem style={{ marginBottom: "1rem" }}>
        <IonLabel>
          <h2>Income Vs Expenses</h2>
        </IonLabel>
        <IonButton fill="clear" slot="end" onClick={handleOpenFiltersModal}>
          <IonIcon icon={filterOutline} />
        </IonButton>
      </IonItem>
      <IncomeVsExpenses
        incomeByMonth={incomeByMonth}
        expensesByMonth={expensesByMonth}
      />
      <IonItem style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <IonLabel>
          <h2>Expenses By Month</h2>
        </IonLabel>
        <IonButton fill="clear" slot="end" onClick={handleOpenFiltersModal}>
          <IonIcon icon={filterOutline} />
        </IonButton>
      </IonItem>
      <ExpensesByMonth expensesByCategory={expensesByCategory} />
    </div>
  );
}

Trends.propTypes = {
    onError: PropTypes.func.isRequired,
};
