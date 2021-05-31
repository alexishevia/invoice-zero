import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonList,
  IonModal,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  chevronBackOutline,
} from "ionicons/icons";
import TypesFilter from "./TypesFilter";
import DateFilter from "./DateFilter";
import AccountsFilter from "./AccountsFilter";
import CategoriesFilter from "./CategoriesFilter";

function unique(arr) {
  return Array.from(new Set(arr));
}

export default function FiltersModal({ isOpen, accounts, categories, initialFilters, onClose }) {
  const [transactionTypes, setTransactionTypes] = useState(initialFilters.transactionTypes);
  const [fromDate, setFromDate] = useState(initialFilters.fromDate);
  const [toDate, setToDate] = useState(initialFilters.toDate);
  const [accountIds, setAccountIds] = useState(initialFilters.accountIds);
  const [categoryIds, setCategoryIds] = useState(initialFilters.categoryIds);

  function handleOnClose(evt) {
    evt && evt.preventDefault();
    onClose({
      transactionTypes,
      fromDate,
      toDate,
      accountIds,
      categoryIds,
    });
  }

  function setStatusForType(type, isActive) {
    setTransactionTypes((prevTypes) =>
      isActive
        ? unique([...prevTypes, type])
        : prevTypes.filter((t) => t !== type)
    );
  }

  function setStatusForAccount(id, isActive) {
    setAccountIds((prevStatus) => ({ ...prevStatus, [id]: isActive }));
  }

  function setStatusForCategory(id, isActive) {
    setCategoryIds((prevStatus) => ({ ...prevStatus, [id]: isActive }));
  }

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={handleOnClose}
    >
      <IonToolbar color="primary">
        <IonButtons slot="start">
          <IonButton onClick={handleOnClose}>
            <IonIcon icon={chevronBackOutline} />
          </IonButton>
        </IonButtons>
        <IonTitle>Filters</IonTitle>
      </IonToolbar>
      <IonContent>
        <IonList>
          <TypesFilter types={transactionTypes} setStatusForType={setStatusForType} />
          <DateFilter
            fromDate={fromDate}
            setFromDate={setFromDate}
            toDate={toDate}
            setToDate={setToDate}
          />
          <AccountsFilter
            accounts={accounts}
            accountsStatus={accountIds}
            setStatusForAccount={setStatusForAccount}
          />
          <CategoriesFilter
            categories={categories}
            categoriesStatus={categoryIds}
            setStatusForCategory={setStatusForCategory}
          />
        </IonList>
      </IonContent>
    </IonModal>
  )
}

FiltersModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  accounts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })),
  categories: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })),
  initialFilters: PropTypes.shape({
    transactionTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
    fromDate: PropTypes.string.isRequired,
    toDate: PropTypes.string.isRequired,
    accountIds: PropTypes.object.isRequired,
    categoryIds: PropTypes.object.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
