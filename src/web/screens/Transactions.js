import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  IonLoading,
} from "@ionic/react";
import {
  chevronBackOutline,
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
import TypesFilter from "../Filters/TypesFilter";
import DateFilter from "../Filters/DateFilter";
import AccountsFilter from "../Filters/AccountsFilter";
import CategoriesFilter from "../Filters/CategoriesFilter";

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

function unique(arr) {
  return Array.from(new Set(arr));
}

export default function Transactions({ onError }) {
  const [types, setTypes] = useState(["INCOME", "EXPENSE", "TRANSFER"]);
  const [fromDate, setFromDate] = useState(dateToDayStr(monthStart()));
  const [toDate, setToDate] = useState(dateToDayStr(monthEnd()));
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [accountsStatus, setAccountsStatus] = useState({});
  const [categoriesStatus, setCategoriesStatus] = useState({});
  const [searchText, setSearchText] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  function setStatusForType(type, isActive) {
    setTypes((prevTypes) =>
      isActive
        ? unique([...prevTypes, type])
        : prevTypes.filter((t) => t !== type)
    );
  }

  function setStatusForAccount(id, isActive) {
    setAccountsStatus((prevStatus) => ({ ...prevStatus, [id]: isActive }));
  }

  function setStatusForCategory(id, isActive) {
    setCategoriesStatus((prevStatus) => ({ ...prevStatus, [id]: isActive }));
  }

  function handleOpenFiltersModal(evt) {
    evt.preventDefault();
    setIsFiltersModalOpen(true);
  }

  function handleCloseFiltersModal(evt) {
    evt.preventDefault();
    setIsFiltersModalOpen(false);
  }

  function handleToggleSearch(evt) {
    evt.preventDefault();
    setIsSearchOpen((val) => !val);
  }

  useEffect(() => {
    async function fetchAccounts() {
      try {
        setIsLoading(true);
        setAccounts(await getAccounts());
        setIsLoading(false);
      } catch(err){
        setIsLoading(false);
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
        setIsLoading(true);
        setCategories(await getCategories());
        setIsLoading(false);
      } catch(err){
        setIsLoading(false);
        onError(err);
      }
    }
    fetchCategories();
    const subscription = onCategoriesChange(() => fetchCategories());
    return () => { subscription.unsubscribe() }
  }, [onError]);

  useEffect(() => {
    const query = {
      fromDate: dateToDayStr(new Date(fromDate)),
      toDate: dateToDayStr(new Date(toDate)),
      accountIDs: (accounts || []).filter(
        ({ id }) => (accountsStatus || {})[id] !== false
      ).map((acc) => acc.id),
      categoryIDs: (categories || []).filter(
        ({ id }) => (categoriesStatus || {})[id] !== false
      ).map((cat) => cat.id)
    };

    async function fetchTransactions() {
      try {
        setIsLoading(true);
        const [
          transfers,
          incomes,
          expenses
        ] = await Promise.all([
          types.includes("TRANSFER") ? queryTransfers(query) : [],
          types.includes("INCOME") ? queryIncomes(query) : [],
          types.includes("EXPENSE") ? queryExpenses(query) : [],
        ]);
        setTransactions([
          ...transfers.map(t => ({ ...t, type: "TRANSFER" })),
          ...incomes.map(i => ({ ...i, type: "INCOME" })),
          ...expenses.map(e => ({ ...e, type: "EXPENSE" })),
        ].sort(sortByLastChangedAt));
        setIsLoading(false);
      } catch(err){
        setIsLoading(false);
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
    types,
    fromDate,
    toDate,
    accounts,
    accountsStatus,
    categories,
    categoriesStatus,
    onError,
  ]);

  return (
    <>
      <IonModal
        isOpen={isFiltersModalOpen}
        onDidDismiss={() => setIsFiltersModalOpen(false)}
      >
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonButton onClick={handleCloseFiltersModal}>
              <IonIcon icon={chevronBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>Filters</IonTitle>
        </IonToolbar>
        <IonContent>
          <IonLoading isOpen={isLoading} />
          <IonList>
            <TypesFilter types={types} setStatusForType={setStatusForType} />
            <DateFilter
              fromDate={fromDate}
              setFromDate={setFromDate}
              toDate={toDate}
              setToDate={setToDate}
            />
            <AccountsFilter
              accounts={accounts}
              accountsStatus={accountsStatus}
              setStatusForAccount={setStatusForAccount}
            />
            <CategoriesFilter
              categories={categories}
              categoriesStatus={categoriesStatus}
              setStatusForCategory={setStatusForCategory}
            />
          </IonList>
        </IonContent>
      </IonModal>
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
