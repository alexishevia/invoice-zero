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
  getMonthStrFromDate,
  // getMonthsInRange,
} from "../../../helpers/date";
import { getAccounts } from "../../../models/accounts";
import { getCategories } from "../../../models/categories";
import { getStats } from "../../../models/stats.mjs";
import FiltersModal from "../../FiltersModal";
import AccountBalances from "./AccountBalances";
import IncomeVsExpenses from "./IncomeVsExpenses";
import ExpensesByMonth from "./ExpensesByMonth";

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
  }, [onError]);

  useEffect(() => {
    // wait until accounts and categories have loaded
    if (!accounts.length || !categories.length) {
      return;
    }

    let cancelled = false;
    async function fetchStats() {
      const stats = await getStats();
      if (cancelled) { return; }
      setIncomeByMonth(
        Object.entries(stats.global.income.byMonth).reduce(
          (memo, [month, val]) => ({
            ...memo,
            [month]: val / 100.0,
          }),
          {}
        )
      );
      setExpensesByMonth(
        Object.entries(stats.global.expenses.byMonth).reduce(
          (memo, [month, val]) => ({
            ...memo,
            [month]: val / 100.0,
          }),
          {}
        )
      );
      setAccountBalances(
        Object.entries(stats.perAccount).reduce((memo, [id, vals]) => {
          memo[id] = vals.currentBalance / 100.0;
          return memo;
        }, {})
      );
      const currentMonth = getMonthStrFromDate(new Date());
      setAccountMonthlyExpenses(
        Object.entries(stats.perAccount).reduce((memo, [id, vals]) => {
          memo[id] = vals.expenses.byMonth[currentMonth] / 100.0;
          return memo;
        }, {})
      );
      setExpensesByCategory(
        Object.entries(stats.perCategory).reduce((memo, [id, vals]) => {
          const category = categories.find(c => c.id === id);
          memo[category.name] = Object.entries(vals.expenses.byMonth).reduce((mem, [month, cents]) => {
            mem[month] = cents / 100.0;
            return mem;
          }, {});
          return memo;
        }, {})
      );
    }
    fetchStats();
    return () => { cancelled = true; };
  }, [ accounts, categories, onError ]);

  /*
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

    async function fetchGraphData() {
      await
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
  */

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

