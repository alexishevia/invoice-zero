import React, { useState } from "react";
import {AmplifyAuthenticator, AmplifySignOut} from "@aws-amplify/ui-react";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonItem,
  IonModal,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { chevronBackOutline, } from "ionicons/icons";

export default function Settings() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  function Modal() {
    return (
      <IonModal
        isOpen={isModalOpen}
        onDidDismiss={() => { setIsModalOpen(false) }}
      >
        <IonToolbar color="dark">
          <IonButtons slot="start">
            <IonButton onClick={() => setIsModalOpen(false)}>
              <IonIcon icon={chevronBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>Sign Out?</IonTitle>
        </IonToolbar>
        <IonContent>
          <div style={{ padding: '0 0.5em' }}>
            <IonText>
              <p>When you sign out, all local data is deleted (if the data is not synced, it will be lost).</p>
              <p>Are you sure you want to sign out?</p>
            </IonText>
            <AmplifySignOut />
          </div>
        </IonContent>
      </IonModal>
    )
  }

  return (
    <AmplifyAuthenticator>
      <Modal />
      <IonContent>
        <IonItem>
          <p style={{paddingRight: '0.5em' }}>You are signed in.</p>
          <IonButton
            color="dark"
            onClick={() => { setIsModalOpen(true) }}
          >Sign Out</IonButton>
        </IonItem>
      </IonContent>
    </AmplifyAuthenticator>
  )
}
