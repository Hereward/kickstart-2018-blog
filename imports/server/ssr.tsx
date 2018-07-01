import * as React from "react";
import { StaticRouter } from "react-router";
import { createStore } from "redux";
import { Helmet } from "react-helmet";
import { renderToString, renderToStaticMarkup } from "react-dom/server";
import { Provider } from "react-redux";
import { onPageLoad } from "meteor/server-render";
import MainRouter from "../components/routes/Main";
import MainApp from "../components/layouts/App/App";
import { systemSettings } from "../api/admin/publish";
import Meta from "../components/partials/Meta";
import rootReducer from "../redux/reducers";

const context = {};

const store = createStore(rootReducer);

/*
const Launch = props => {
  return (
    <StaticRouter>
      <Provider store={store}>
        <MainApp />
      </Provider>
    </StaticRouter>
  );
};
*/

onPageLoad(sink => {
  let url: any;
  url = sink.request.url;
  let path = url.path;
  const settings = systemSettings.findOne();
  log.info(`ssr`, settings);
  sink.renderIntoElementById("react-root", renderToStaticMarkup(<Meta settings={settings} location={path} />));

  //sink.renderIntoElementById("react-root", renderToString(<Launch location={sink.request.url} />));

  const helmet = Helmet.renderStatic();
  sink.appendToHead(helmet.meta.toString());
  sink.appendToHead(helmet.title.toString());
});
