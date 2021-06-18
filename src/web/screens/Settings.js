import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import * as credentials from "../../credentials.mjs";
import {
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
} from "@ionic/react";

function writeCredentials({ url, username, password }) {
  credentials.set({ url, username, password });
}

export default function Settings({ onError }) {
  const [url, setURL] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const creds = credentials.get();
    setURL(creds.url);
    setUsername(creds.username);
    setPassword(creds.password);
  }, []);

  function handleSubmit(evt) {
    evt.preventDefault();
    try {
      writeCredentials({ url, username, password });
    } catch (err) {
      onError(err);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <IonItem><IonLabel><h2>API Settings</h2></IonLabel></IonItem>
      <IonItem>
        <IonLabel position="stacked">URL:</IonLabel>
        <IonInput
          type="text"
          value={url}
          onIonChange={(evt) => { setURL(evt.detail.value); }}
          required
        />
      </IonItem>
      <IonItem>
        <IonLabel position="stacked">Username:</IonLabel>
        <IonInput
          type="text"
          value={username}
          onIonChange={(evt) => { setUsername(evt.detail.value); }}
          required
        />
      </IonItem>
      <IonItem>
        <IonLabel position="stacked">Password:</IonLabel>
        <IonInput
          type="password"
          value={password}
          onIonChange={(evt) => { setPassword(evt.detail.value); }}
          required
        />
      </IonItem>
      <IonButton type="submit">
        Update
      </IonButton>
    </form>
  )
}

Settings.propTypes = {
  onError: PropTypes.func.isRequired,
};
