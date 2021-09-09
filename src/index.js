import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Switch } from "react-router-dom";
import { DrizzleProvider } from "@drizzle/react-plugin";
import "./App.css";
import App from "./App";
import { LoadingContainer } from "@drizzle/react-components";
import CustomLoader from "./CustomLoadingContainer";
import store from "./state/store";
import drizzleOptions from "./drizzleOptions";
import { Provider } from "react-redux";
import Splash from "./components/pages/Splash";
import FAQ from "./components/pages/FAQ";
import BetHistory from "./components/pages/EventBetRecord";
import GameOutcomeHistory from "./components/pages/EventGameResults";
import OddsHistory from "./components/pages/EventOdds";
import SchedHistory from "./components/pages/EventSchedule";
import StartHistory from "./components/pages/EventStartTime";
import BetPage from "./components/pages/BetPage";
import BigBetPage from "./components/pages/BigBetPage";
import BigBetHistory from "./components/pages/EventBigBetRecord";
import BookiePage from "./components/pages/BookiePage";


// const history = syncHistoryWithStore(browserHistory, store)

let app = (
  <DrizzleProvider options={drizzleOptions} store={store}>
    <LoadingContainer>
      <CustomLoader>
        <Provider store={store}>
          <App>
            <HashRouter >
              <Switch>
                <Route exact path="/" component={Splash} />
                <Route path="/faqs" component={FAQ} />
                <Route path="/bethistory" component={BetHistory} />
                <Route path="/bigbethistory" component={BigBetHistory} />
                <Route path="/oddshistory" component={OddsHistory} />
                <Route path="/schedhistory" component={SchedHistory} />
                <Route path="/starthistory" component={StartHistory} />
                <Route path="/resultshistory" component={GameOutcomeHistory} />
                <Route path="/betpage" component={BetPage} />
                <Route path="/bigbetpage" component={BigBetPage} />
                <Route path="/bookiepage" component={BookiePage} />
              </Switch>
            </HashRouter>
          </App>
        </Provider>
      </CustomLoader>
    </LoadingContainer>
  </DrizzleProvider>
);

ReactDOM.render(app, document.getElementById("root"));
