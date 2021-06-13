import React, { useRef } from 'react';
import { EventEmitter } from 'events';
import { IonApp, IonContent } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Switch } from "react-router";
import { Route } from "react-router-dom";

import Accounts from "./screens/Accounts";
import Categories from "./screens/Categories";
import EditAccount from "./screens/EditAccount";
import EditCategory from "./screens/EditCategory";
// import EditExpense from "./screens/EditExpense";
// import EditIncome from "./screens/EditIncome";
// import EditTransfer from "./screens/EditTransfer";
import Errors from "./Errors";
import NewAccount from "./screens/NewAccount";
import NewCategory from "./screens/NewCategory";
// import NewExpense from "./screens/NewExpense";
// import NewIncome from "./screens/NewIncome";
// import NewTransfer from "./screens/NewTransfer";
import NotFound from "./screens/NotFound";
// import Settings from "./screens/Settings";
// import Transactions from "./screens/Transactions";
// import Trends from "./screens/Trends";

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
  const errorEmitter = useRef(new EventEmitter());

  function onError(err) {
    errorEmitter.current.emit('NEW_ERROR', err);
  }

  return (
    <IonApp>
      <Errors errorEmitter={errorEmitter.current} />
      <IonContent>
        <IonReactRouter>
          <MainMenu />
          <Switch>
            { /*
            <Route
              path="/newTransfer"
              component={({ history }) => (
                <NewTransfer
                  onError={onError}
                  onClose={history.goBack}
                />
              )}
            />
            <Route
              path="/newIncome"
              component={({ history }) => (
                <NewIncome
                  onError={onError}
                  onClose={history.goBack}
                />
              )}
            />
            <Route
              path="/newExpense"
              component={({ history }) => (
                <NewExpense
                  onError={onError}
                  onClose={history.goBack}
                />
              )}
            />
            <Route
              path="/editExpense/:id"
              component={({ history, match }) => (
                <EditExpense
                  id={match.params.id}
                  onError={onError}
                  onClose={history.goBack}
                />
              )}
            />
            <Route
              path="/editIncome/:id"
              component={({ history, match }) => (
                <EditIncome
                  id={match.params.id}
                  onError={onError}
                  onClose={history.goBack}
                />
              )}
            />
            <Route
              path="/editTransfer/:id"
              component={({ history, match }) => (
                <EditTransfer
                  id={match.params.id}
                  onError={onError}
                  onClose={history.goBack}
                />
              )}
            />
            <Route
              path="/settings"
              exact
              component={() => (
                <Screen>
                  <Settings />
                </Screen>
              )}
            />
            <Route
              path="/trends"
              exact
              component={() => {
                return (
                  <Screen>
                    <Trends onError={onError} />
                  </Screen>
                );
              }}
            />
            */ }
            <Route
              path="/accounts"
              component={() => (
                <Screen>
                  <Accounts onError={onError} />
                </Screen>
              )}
            />
            <Route
              path="/newAccount"
              component={({ history }) => (
                <NewAccount onError={onError} onClose={history.goBack} />
              )}
            />
            <Route
              path="/editAccount/:id"
              component={({ history, match }) => (
                <EditAccount
                  id={match.params.id}
                  onError={onError}
                  onClose={history.goBack}
                />
              )}
            />
            <Route
              path="/categories"
              component={() => (
                <Screen>
                  <Categories onError={onError} />
                </Screen>
              )}
            />
            <Route
              path="/newCategory"
              component={({ history }) => (
                <NewCategory onError={onError} onClose={history.goBack} />
              )}
            />
            <Route
              path="/editCategory/:id"
              component={({ history, match }) => (
                <EditCategory
                  id={match.params.id}
                  onError={onError}
                  onClose={history.goBack}
                />
              )}
            />
            <Route
              path="/"
              exact
              component={() => {
                return (
                  <Screen>
                    <div>hello world</div>
                    { /* <Transactions onError={onError} /> */ }
                  </Screen>
                );
              }}
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

export default App;
