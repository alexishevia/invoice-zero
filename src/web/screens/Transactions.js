import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonSearchbar,
} from "@ionic/react";
import {
  filterOutline,
  searchOutline,
} from "ionicons/icons";
import { getAccounts, onAccountsChange } from "../../models/accounts";
import { getCategories, onCategoriesChange } from "../../models/categories";
import { queryTransfers, onTransfersChange } from "../../models/transfers";
import { queryIncomes, onIncomesChange } from "../../models/incomes";
import { queryExpenses, onExpensesChange } from "../../models/expenses";
import TransactionsList from "../TransactionsList";
import { dateToDayStr, monthStart, monthEnd } from "../../helpers/date";
import FiltersModal from "../FiltersModal";

function sortByLastChangedAt(a, b) {
  if (a._lastChangedAt > b._lastChangedAt) {
    return -1;
  }
  if (b._lastChangedAt > a._lastChangedAt) {
    return 1;
  }
  return 0;
}

function filterBySearchText(searchText) {
  return function filter({ amount, description }) {
    if (!searchText) {
      return true;
    }
    if (`${amount}`.includes(searchText)) {
      return true;
    }
    if (description && description.toLowerCase().includes(searchText.toLowerCase())) {
      return true;
    }
    return false;
  };
}

export default function Transactions({ onError }) {
  const [activeFilters, setActiveFilters] = useState({
    transactionTypes: ["INCOME", "EXPENSE", "TRANSFER"],
    fromDate: dateToDayStr(monthStart()),
    toDate: dateToDayStr(monthEnd()),
    accountIds: {},
    categoryIds: {},
  });
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);

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

  function handleToggleSearch(evt) {
    evt.preventDefault();
    setIsSearchOpen((val) => !val);
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
    async function fetchTransactions() {
      const query = {
        transactionTypes: activeFilters.transactionTypes,
        fromDate: activeFilters.fromDate,
        toDate: activeFilters.toDate,
        accountIDs: (accounts || []).filter(
          ({ id }) => (activeFilters.accountIds || {})[id] !== false
        ).map((acc) => acc.id),
        categoryIDs: (categories || []).filter(
          ({ id }) => (activeFilters.categoryIds || {})[id] !== false
        ).map((cat) => cat.id)
      };

      try {
        const [
          transfers,
          incomes,
          expenses
        ] = await Promise.all([
          query.transactionTypes.includes("TRANSFER") ? queryTransfers(query) : [],
          query.transactionTypes.includes("INCOME") ? queryIncomes(query) : [],
          query.transactionTypes.includes("EXPENSE") ? queryExpenses(query) : [],
        ]);
        setTransactions([
          ...transfers.map(t => ({ ...t, type: "TRANSFER" })),
          ...incomes.map(i => ({ ...i, type: "INCOME" })),
          ...expenses.map(e => ({ ...e, type: "EXPENSE" })),
        ].sort(sortByLastChangedAt));
      } catch(err){
        onError(err);
      }
    }
    fetchTransactions();
    const transfersSubscription = onTransfersChange(() => fetchTransactions())
    const incomesSubscription = onIncomesChange(() => fetchTransactions())
    const expensesSubscription = onExpensesChange(() => fetchTransactions())
    return () => {
      transfersSubscription.unsubscribe()
      incomesSubscription.unsubscribe()
      expensesSubscription.unsubscribe()
    }
  }, [
    activeFilters,
    accounts,
    categories,
    onError,
  ]);

  return (
    <>
      <FiltersModal
        isOpen={isFiltersModalOpen}
        accounts={accounts}
        categories={categories}
        initialFilters ={activeFilters}
        onUpdate={handleFiltersUpdate}
        onClose={handleCloseFiltersModal}
      />
      <IonItem>
        <IonLabel>
          <h3>Transactions</h3>
        </IonLabel>
        <IonButton fill="clear" slot="end" onClick={handleToggleSearch}>
          <IonIcon icon={searchOutline} />
        </IonButton>
        <IonButton fill="clear" slot="end" onClick={handleOpenFiltersModal}>
          <IonIcon icon={filterOutline} />
        </IonButton>
      </IonItem>
      {isSearchOpen ? (
        <IonSearchbar
          value={searchText}
          onIonChange={(e) => setSearchText(e.detail.value)}
        />
      ) : null}
      <TransactionsList
        transactions={transactions.filter(filterBySearchText(searchText))}
        accounts={accounts}
        categories={categories}
      />
    </>
  );
}

Transactions.propTypes = {
    onError: PropTypes.func.isRequired,
};
