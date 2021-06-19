import React from "react";
import PropTypes from "prop-types";
import { List, AutoSizer } from "react-virtualized";
import Expense from "../Expense";
import Income from "../Income";
import Transfer from "../Transfer";

import "./TransactionsList.css";

function TransactionsList({ transactions, accounts, categories }) {
  if (!transactions.length) {
    return null;
  }

  return (
    <div className="TransactionsList">
    <AutoSizer>
    { ({ width, height}) => (
      <List
        width={width}
        height={height}
        rowHeight={95}
        rowCount={transactions.length}
        rowRenderer={({ index, style }) => {
          const transaction = transactions[index];
          switch (transaction.type) {
            case "INCOME":
              return (
                <Income
                  key={transaction.id}
                  style={style}
                  income={transaction}
                  accounts={accounts}
                  categories={categories}
                />
              );
            case "EXPENSE":
              return (
                <Expense
                  key={transaction.id}
                  style={style}
                  expense={transaction}
                  accounts={accounts}
                  categories={categories}
                />
              );
            case "TRANSFER":
              return (
                <Transfer
                  key={transaction.id}
                  style={style}
                  transfer={transaction}
                  accounts={accounts}
                  categories={categories}
                />
              );
            default:
              console.warn(`Transaction with unknown type: ${transaction.type}`);
              return null;
          }}
        }
      ></List>
    )}
    </AutoSizer>
    </div>
  );
}

TransactionsList.propTypes = {
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    })
  ).isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default TransactionsList;
