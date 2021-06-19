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

function sortByName(a, b) {
  if (a.name > b.name) { return 1; }
  if (b.name > a.name) { return -1; }
  return 0;
}

export default function Trends({ onError }) {
  const today = new Date();
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    fromDate: dateToDayStr(substractMonths(monthStart(today), 12)),
    toDate: dateToDayStr(monthEnd(today)),
    accountIds: {},
    categoryIds: {},
  });
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [filtersToDisplay, setFiltersToDisplay] = useState();

  // get filtered values
  const currentMonth = getMonthStrFromDate(new Date());
  const months = getMonthsInRange(
    new Date(activeFilters.fromDate),
    new Date(activeFilters.toDate)
  ).map(month => month.name);
  const monthsObj = Object.fromEntries(months.map(m => [m, 0]));
  const activeAccountIds = Object.keys(activeFilters.accountIds).length > 1
    ? Object.keys(activeFilters.accountIds).filter(id => activeFilters.accountIds[id])
    : accounts.map(acc => acc.id)
  const activeCategoryIds = Object.keys(activeFilters.categoryIds).length > 1
    ? Object.keys(activeFilters.categoryIds).filter(id => activeFilters.categoryIds[id])
    : categories.map(cat => cat.id)


  // accountBalances is an object with format:
  // { [accountID]: value }
  // eg:
  // { "accA": 583.25, "accB": 1023.50, ... }
  const accountBalances = stats ?
    Object.fromEntries(activeAccountIds.map((accountID) => {
      const vals = stats.perAccount[accountID];
      if (!vals) { return null; }
      return [accountID, (vals.currentBalance || 0) / 100.0];
    }).filter(Boolean))
    : {};

  // accountMonthlyExpenses is an object with format:
  // { [accountID]: value }
  // eg:
  // { "accA": 583.25, "accB": 1023.50, ... }
  const accountMonthlyExpenses = stats ?
    Object.fromEntries(activeAccountIds.map((accountID) => {
      const vals = stats.perAccount[accountID];
      if (!vals) { return null; }
      return [accountID, (vals.expenses.byMonth[currentMonth] || 0) / 100.0];
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
      activeCategoryIds.map((categoryID) => {
        const category = categories.find(c => c.id === categoryID);
        const vals = stats.perCategory[categoryID];
        if (!category || !vals) { return null; }
        const expensesByMonth = Object.fromEntries(months.map((month) => {
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
        filtersToDisplay={filtersToDisplay}
        onUpdate={handleFiltersUpdate}
        onClose={handleCloseFiltersModal}
      />
      <IonItem style={{ marginBottom: "1rem" }}>
        <IonLabel>
          <h2>Account Balances</h2>
        </IonLabel>
        <IonButton
            fill="clear"
            slot="end"
            onClick={(evt) => {
              setFiltersToDisplay(new Set(['accounts']));
              handleOpenFiltersModal(evt);
            }}
        >
          <IonIcon icon={filterOutline} />
        </IonButton>
      </IonItem>
      <AccountBalances
        accounts={
          accounts
          .filter(({ id }) => activeAccountIds.includes(id))
          .sort(sortByName)
          .map(({ id, name}) => ({
            name,
            balance: (accountBalances[id] || 0),
            monthlyExpenses: (accountMonthlyExpenses[id] || 0)
          }))
        }
      />
      <IonItem style={{ marginBottom: "1rem" }}>
        <IonLabel>
          <h2>Income Vs Expenses</h2>
        </IonLabel>
        <IonButton
            fill="clear"
            slot="end"
            onClick={(evt) => {
              setFiltersToDisplay(new Set(['date']));
              handleOpenFiltersModal(evt);
            }}
        >
          <IonIcon icon={filterOutline} />
        </IonButton>
      </IonItem>
      <IncomeVsExpenses
        incomeByMonth={incomeByMonth}
        expensesByMonth={expensesByMonth}
      />
      <IonItem style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <IonLabel>
          <h2>Expenses By Category</h2>
        </IonLabel>
        <IonButton
            fill="clear"
            slot="end"
            onClick={(evt) => {
              setFiltersToDisplay(new Set(['date', 'categories']));
              handleOpenFiltersModal(evt);
            }}
        >
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

