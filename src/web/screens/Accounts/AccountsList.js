import React from "react";
import PropTypes from "prop-types";
import { IonList, IonItem, IonLabel, IonNote } from "@ionic/react";
import { centsToDollar as toDollar } from "../../../helpers/currency";

function Account({ account }) {
  const { id, name, initialBalance, balance } = account;
  return (
    <IonItem button routerLink={`/editAccount/${id}`}>
      <IonLabel>
        <p>
          <IonNote color="primary">{name}</IonNote>
          <br />
          Initial Balance: ${toDollar(initialBalance)}
          {typeof balance === "number" && !Number.isNaN(balance) ? (
            <>
              <br />
              Current Balance: ${toDollar(balance)}
            </>
          ) : null}
        </p>
      </IonLabel>
    </IonItem>
  );
}

Account.propTypes = {
  account: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    initialBalance: PropTypes.number.isRequired,
    balance: PropTypes.number,
  }).isRequired,
};

function AccountsList({ accounts }) {
  if (!accounts.length) {
    return null;
  }

  return (
    <IonList className="TransactionsList">
      {accounts.map((account) => (
        <Account key={account.id} account={account} />
      ))}
    </IonList>
  );
}

AccountsList.propTypes = {
  accounts: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export default AccountsList;
