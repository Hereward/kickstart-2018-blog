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
import { Pages } from "../api/pages/publish";
import { EditorialImages } from "../api/images/methods";

const context = {};

const store = createStore(rootReducer);

const getImageLink = (imageId = "") => {
  let link = "";
  if (imageId) {
    let image: any;
    image = EditorialImages.findOne(imageId);
    link = EditorialImages.link(image._fileRef);
  }
  return link;
};

const getCustomMetaData = (url, defaultImageLink) => {
  let slug = "";
  const path = url.pathname;
  const pagePattern = /[a-z0-9]+(?:-[a-z0-9]+)*$/i;
  let data = "";
  let pageMatch = pagePattern.exec(path);
  if (pageMatch) {
    slug = pageMatch[0];
    const page = Pages.findOne({ slug: slug });
    if (page) {
      let image: any;
      const imageId = page.image_id;
      if (imageId) {
        page.imageLink = getImageLink(imageId);
      } else if (defaultImageLink) {
        page.imageLink = defaultImageLink;
      }
      data = page;
    }
  }
  return data;
};

onPageLoad(sink => {
  const sheet = new ServerStyleSheet();
  let url: any;
  url = sink.request.url;
  let path = url.path;
  const settings = systemSettings.findOne();
  const defaultImageLink = getImageLink(settings.image_id);
  settings.imageLink = defaultImageLink;
  const customSettings = getCustomMetaData(url, defaultImageLink);
  const resolvedSettings = customSettings || settings;
  sink.renderIntoElementById("react-root", renderToStaticMarkup(<Meta settings={resolvedSettings} location={path} />));
  const helmet = Helmet.renderStatic();
  sink.appendToHead(helmet.meta.toString());
  sink.appendToHead(helmet.title.toString());
  const html = renderToString(sheet.collectStyles(<Splash location={sink.request.url} />));
  sink.renderIntoElementById("react-root", html);
  sink.appendToHead(sheet.getStyleTags());
});
