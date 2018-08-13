import * as React from "react";
import Meta from "./Meta";

const MetaWrapper = (props: { customSettings?: any; path: any; settings: any; title?: string }) => {
  const { settings, customSettings, title } = props;
  let resolvedSettings: any;
  if (customSettings) {
    resolvedSettings = Object.assign({}, customSettings);
    resolvedSettings.title = `${customSettings.title} - ${settings.shortTitle}`;
  } else {
    //resolvedSettings = Object.assign({}, settings);
    resolvedSettings = Object.assign({}, settings);
    if (title) {
      resolvedSettings.title = ` ${title} - ${settings.shortTitle}`;
    }
  }

  return <Meta location={props.path} settings={resolvedSettings} />;
};

export default MetaWrapper;
