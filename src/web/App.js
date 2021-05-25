import React, { useState, useEffect } from 'react';
import { AmplifyAuthenticator, AmplifySignIn, AmplifySignOut } from '@aws-amplify/ui-react';
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';
import { IonApp, IonContent } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Switch } from "react-router";
import { Route } from "react-router-dom";

import Errors from "./Errors";
import Categories from "./screens/Categories";
import NewCategory from "./screens/NewCategory";
import EditCategory from "./screens/EditCategory";
import NotFound from "./screens/NotFound";

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
  const [authState, setAuthState] = useState();
  const [user, setUser] = useState();
  const [errors, setErrors] = useState([]);

  function addError(err) {
    setErrors([...errors, err]);
  }

  useEffect(() => {
    return onAuthUIStateChange((nextAuthState, authData) => {
      setAuthState(nextAuthState);
      setUser(authData)
    });
  }, []);

  if (authState === AuthState.SignedIn && user) {
    return (
      <IonApp>
        <Errors errors={errors} onDismiss={() => setErrors([]) } />
        <IonContent>
          <IonReactRouter>
            <MainMenu />
            <Switch>
              <Route
                path="/categories"
                component={() => (
                  <Screen>
                    <Categories onError={addError} />
                  </Screen>
                )}
              />
              <Route
                path="/newCategory"
                component={({ history }) => (
                  <NewCategory onError={addError} onClose={history.goBack} />
                )}
              />
              <Route
                path="/editCategory/:id"
                component={({ history, match }) => (
                  <EditCategory
                    id={match.params.id}
                    onError={addError}
                    onClose={history.goBack}
                  />
                )}
              />
              <Route
                path="/"
                exact
                component={() => (
                  <Screen>
                    <div>Hello, {user.username}</div>
                    <AmplifySignOut />
                  </Screen>
                )}
              />
              <Route
                component={({ history }) => (
                  <NotFound onClose={() => history.push("/")} />
                )}
              />
            </Switch>
          </IonReactRouter>
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
