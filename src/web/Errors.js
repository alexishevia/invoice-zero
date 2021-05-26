import React, { useState, useEffect } from 'react';
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

function Errors({ errorEmitter }) {
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    function addError(err) {
      setErrors([...errors, err]);
    }
    errorEmitter.on('NEW_ERROR', addError);
    return () => errorEmitter.off('NEW_ERROR', addError);
  });


  function handleDismiss(evt) {
    if (evt) {
      evt.preventDefault();
    }
    setErrors([]);
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
  errorEmitter: PropTypes.shape({
    on: PropTypes.func.isRequired,
    off: PropTypes.func.isRequired,
  }).isRequired,
};

export default Errors;
