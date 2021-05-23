import PropTypes from "prop-types";
import { IonToast } from "@ionic/react";

function getErrorMsg(err) {
  if (typeof err === typeof "string") {
    return err;
  }
  if (err && err.message) {
    return err.message;
  }
  return "Unknown error";
}

function Errors({ errors, onDismiss }) {
  function handleDismiss(evt) {
    if (evt) {
      evt.preventDefault();
    }
    onDismiss();
  }

  const msg = errors.length ? getErrorMsg(errors[errors.length - 1]) : "";

  return (
    <IonToast
      key={msg}
      isOpen={!!msg}
      message={msg}
      position="bottom"
      buttons={[{ text: "X", role: "cancel", handler: handleDismiss }]}
    />
  );
}

Errors.propTypes = {
  errors: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Error),
  ])).isRequired,
};

export default Errors;
