import React from "react";
import PropTypes from "prop-types";
import { IonItem, IonLabel, IonNote } from "@ionic/react";
import { centsToDollar as toDollar } from "../helpers/currency";

function getAccountName(accounts, id) {
  const account = accounts.find((acc) => acc.id === id);
  return account && account.name ? account.name : "";
}

export default function Transfer({ transfer, accounts, style }) {
  const { id, amount, transactionDate, fromID, toID } = transfer;
  const fromLabel = getAccountName(accounts, fromID);
  const toLabel = getAccountName(accounts, toID);

  return (
    <IonItem
      className="TransactionsListItem"
      style={style}
      button
      routerLink={`/editTransfer/${id}`}
    >
      <IonLabel>
        <p>
          <IonNote color="tertiary">${toDollar(amount)}</IonNote>
          <br />
          {fromLabel} =&gt; {toLabel}
          <br />
          <span className="TransactionsListItemDate">{transactionDate}</span>
        </p>
      </IonLabel>
    </IonItem>
  );
}

Transfer.propTypes = {
  transfer: PropTypes.shape({
    amount: PropTypes.number.isRequired,
    fromID: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    toID: PropTypes.string.isRequired,
    transactionDate: PropTypes.string.isRequired,
  }).isRequired,
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
};
