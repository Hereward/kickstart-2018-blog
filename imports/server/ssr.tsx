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
//import MetaWrapper from "../components/partials/MetaWrapper";
import rootReducer from "../redux/reducers";
import Splash from "../components/partials/Splash";
import { Pages } from "../api/pages/publish";
import { Posts } from "../api/posts/publish";
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

const extractData = (match, DataSrc, defaultImageLink) => {
  let data: any;
  const slug = match[1];
  const post = DataSrc.findOne({ slug: slug });
  log.info(`getCustomMetaData - extractData`, slug);
  if (post) {
    const imageId = post.image_id;
    if (imageId) {
      post.imageLink = getImageLink(imageId);
    } else if (defaultImageLink) {
      post.imageLink = defaultImageLink;
    }
    data = post;
  }
  return data;
};

const getCustomMetaData = (url, defaultImageLink, systemSettings) => {
  let slug = "";
  let objectType:string = "website";
  const path = url.pathname;
  const pagePattern = /([a-z0-9]+(?:-[a-z0-9]+)*$)/i;
  const blogPattern = /blog\/([a-z0-9]+(?:-[a-z0-9]+)*$)/i;
  let data: any;
  let clone = false;
  let customTitle: any;
  const pageMatch = pagePattern.exec(path);
  const blogMatch = blogPattern.exec(path);
  if (path === "/blog") {
    clone = true;
    customTitle = "Blog Page";
  } else if (path === "/profile") {
    clone = true;
    customTitle = "Profile Page";
  } else if (path === "/admin") {
    clone = true;
    customTitle = "Admin Page";
  } else if (blogMatch) {
    data = extractData(blogMatch, Posts, defaultImageLink);
    objectType = "article";
  } else if (pageMatch) {
    data = extractData(pageMatch, Pages, defaultImageLink);
    objectType = "article";
  }

  if (clone) {
    data = Object.assign({}, systemSettings);
    data.title = customTitle;
  }

  if (data) {
    data.title += ` - ${systemSettings.shortTitle}`;
    data.objectType = objectType;
  }
  return data;
};

onPageLoad(sink => {
  const sheet = new ServerStyleSheet();
  let url: any;
  let defaultImageLink: string;
  url = sink.request.url;
  const pathname = url.pathname;
  const meteorHost = Meteor.absoluteUrl();
  const fullUrl = meteorHost + pathname.replace(/^\/+/g, '');
  //log.info(`onPageLoad url =`, url);
  //let path = url.path;
  const systemSettingsObj = systemSettings.findOne();

  if (systemSettingsObj) {
    defaultImageLink = getImageLink(systemSettingsObj.image_id);
    systemSettingsObj.imageLink = defaultImageLink;
  }
 

  const customSettings = getCustomMetaData(url, defaultImageLink, systemSettingsObj);
  const resolvedSettings = customSettings || systemSettingsObj;

  sink.renderIntoElementById("react-root", renderToStaticMarkup(<Meta settings={resolvedSettings} url={fullUrl} />));
  const helmet = Helmet.renderStatic();
  sink.appendToHead(helmet.meta.toString());
  sink.appendToHead(helmet.title.toString());
  const html = renderToString(sheet.collectStyles(<Splash location={sink.request.url} />));
  sink.renderIntoElementById("react-root", html);
  sink.appendToHead(sheet.getStyleTags());
});
