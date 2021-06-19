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
  getMonthsInRange,
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
  const [stats, setStats] = useState(null);

  const currentMonth = getMonthStrFromDate(new Date());
  const months = getMonthsInRange(
    new Date(activeFilters.fromDate),
    new Date(activeFilters.toDate)
  ).map(month => month.name);
  const monthsObj = Object.fromEntries(months.map(m => [m, 0]));

  // accountBalances is an object with format:
  // { [accountID]: value }
  // eg:
  // { "accA": 583.25, "accB": 1023.50, ... }
  const accountBalances = stats ?
    Object.fromEntries(accounts.map((account) => {
      const vals = stats.perAccount[account.id];
      if (!vals) { return null; }
      return [account.id, (vals.currentBalance || 0) / 100.0];
    }).filter(Boolean))
    : {};

  // accountMonthlyExpenses is an object with format:
  // { [accountID]: value }
  // eg:
  // { "accA": 583.25, "accB": 1023.50, ... }
  const accountMonthlyExpenses = stats ?
    Object.fromEntries(accounts.map((account) => {
      const vals = stats.perAccount[account.id];
      if (!vals) { return null; }
      return [account.id, (vals.expenses.byMonth[currentMonth] || 0) / 100.0];
    }).filter(Boolean))
    : {};

  // incomeByMonth is an object with format:
  // { [monthName]: value }
  // eg:
  // { "2020-01": 1250.34, "2020-02": 1832.01, ... }
  const incomeByMonth = stats ?
    Object.fromEntries(months.map((month) => [
      month, (stats.global.income.byMonth[month] || 0) / 100.0
    ]))
    : monthsObj;

  // expensesByMonth is an object with format:
  // { [monthName]: value }
  // eg:
  // { "2020-01": 1250.34, "2020-02": 1832.01, ... }
  const expensesByMonth = stats ?
    Object.fromEntries(months.map((month) => [
      month, (stats.global.expenses.byMonth[month] || 0) / 100.0
    ]))
    : monthsObj;

  // expensesByCategory is an object with format:
  // { [categoryName]: { [monthName]: expenses } }
  // eg:
  // {
  //   "Restaurantes": { "2019-09": 4892.01, "2019-10": 3501.85, ... },
  //     ...
  // }
  const expensesByCategory = stats ?
    Object.fromEntries(
      categories.map((category) => {
        if (!category) { return null }
        const expensesByMonth = Object.fromEntries(months.map((month) => {
          const vals = stats.perCategory[category.id];
          if (!vals) { return [month, 0] };
          return [month, (vals.expenses.byMonth[month] || 0) / 100.0];
        }));
        return [category.name, expensesByMonth];
      }).filter(Boolean)
    )
    : {};

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
    const controller = new AbortController();
    async function fetchStats() {
      try {
        const stats = await getStats({ signal: controller.signal });
        if (controller.signal.aborted) { return; }
        setStats(stats);
      } catch(err){
        if (controller.signal.aborted) { return; }
        onError(err);
      }
    }
    fetchStats();
    return () => { controller.abort() };
  }, [accounts, categories, onError]);

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
        <IonButton fill="clear" slot="end" onClick={handleOpenFiltersModal}>
          <IonIcon icon={filterOutline} />
        </IonButton>
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

