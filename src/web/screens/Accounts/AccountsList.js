import React from "react";
import PropTypes from "prop-types";
import { IonList, IonItem, IonLabel, IonNote } from "@ionic/react";
import { centsToDollar as toDollar } from "../../../helpers/currency";

function getBalance(account, stats) {
  if (stats && stats.perAccount && stats.perAccount[account.id]) {
    return stats.perAccount[account.id].currentBalance;
  }
  return NaN;
}

function Account({ account, stats }) {
  const { id, name, initialBalance } = account;
  const balance = getBalance(account, stats);
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

function AccountsList({ accounts, stats }) {
  if (!accounts.length) {
    return null;
  }

  return (
    <IonList>
      {accounts.map((account) => (
        <Account key={account.id} account={account} stats={stats} />
      ))}
    </IonList>
  );
}

AccountsList.propTypes = {
  accounts: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  stats: PropTypes.shape({
    perAccount: PropTypes.shape(),
  }),
};

export default AccountsList;
