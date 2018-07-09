import * as React from "react";
import { StaticRouter } from "react-router";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";
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
import Splash from "../components/partials/Splash";

const context = {};

const store = createStore(rootReducer);

onPageLoad(sink => {
  const sheet = new ServerStyleSheet();
  let url: any;
  url = sink.request.url;
  let path = url.path;
  const settings = systemSettings.findOne();
  sink.renderIntoElementById("react-root", renderToStaticMarkup(<Meta settings={settings} location={path} />));
  const helmet = Helmet.renderStatic();
  sink.appendToHead(helmet.meta.toString());
  sink.appendToHead(helmet.title.toString());
  const html = renderToString(sheet.collectStyles(<Splash location={sink.request.url} />));
  sink.renderIntoElementById("react-root", html);
  sink.appendToHead(sheet.getStyleTags());
});
