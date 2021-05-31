import React, { useState } from "react";
import PropTypes from "prop-types";
import { IonItem, IonLabel, IonToggle } from "@ionic/react";

function sortByName({ name: a }, { name: b }) {
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  return 0;
}

export default function AccountsFilter({
  accounts,
  accountsStatus,
  setStatusForAccount,
}) {
  const [isAllToggled, setIsAllToggled] = useState(true);

  function toggleAll(evt) {
    evt && evt.preventDefault();
    const newVal = !isAllToggled;
    setIsAllToggled(newVal);
    accounts.forEach(({ id }) => {
      setStatusForAccount(id, newVal);
    });
  }

  return (
    <>
      <IonItem className="ion-padding-top">
        <IonLabel color="primary">Accounts</IonLabel>
        <IonToggle checked={isAllToggled} onIonChange={toggleAll} />
      </IonItem>
      {(accounts || []).sort(sortByName).map(({ id, name }) => {
        const isActive = Object.hasOwnProperty.call(accountsStatus, id)
          ? accountsStatus[id]
          : true;
        return (
          <IonItem key={id}>
            <IonLabel>{name}</IonLabel>
            <IonToggle
              checked={isActive}
              onIonChange={() => {
                setStatusForAccount(id, !isActive);
              }}
            />
          </IonItem>
        );
      })}
    </>
  );
}

AccountsFilter.defaultProps = {
  accounts: [],
  accountsStatus: {},
};

AccountsFilter.propTypes = {
  accounts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })),
  accountsStatus: PropTypes.shape({}),
  setStatusForAccount: PropTypes.func.isRequired,
};
