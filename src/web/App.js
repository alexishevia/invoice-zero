import React from 'react';
import { AmplifyAuthenticator, AmplifySignIn, AmplifySignOut } from '@aws-amplify/ui-react';
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';
import { IonApp, IonContent } from "@ionic/react";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Overrides to ionic styles */
import "./App.css";

import MainMenu from './MainMenu';
import Screen from './Screen';

function App() {
  const [authState, setAuthState] = React.useState();
  const [user, setUser] = React.useState();

  React.useEffect(() => {
    return onAuthUIStateChange((nextAuthState, authData) => {
      setAuthState(nextAuthState);
      setUser(authData)
    });
  }, []);

  if (authState === AuthState.SignedIn && user) {
    return (
      <IonApp>
        <IonContent>
          <MainMenu />
          <Screen>
            <div>Hello, {user.username}</div>
            <AmplifySignOut />
          </Screen>
        </IonContent>
      </IonApp>
    )
  }

  return (
    <AmplifyAuthenticator>
      <AmplifySignIn slot="sign-in" hideSignUp></AmplifySignIn>
    </AmplifyAuthenticator>
  );
}

export default App;
