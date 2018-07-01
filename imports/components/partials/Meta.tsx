import * as React from "react";
import { Helmet } from "react-helmet";
import { systemSettings } from "../../api/admin/publish";

//const settings = systemSettings.findOne();

const Meta = props => {
  const titleString = `${props.settings.mainTitle} [${props.location}]`;
  return (
    <Helmet>
      <meta name="description" content={props.settings.description} />
      <meta property="og:title" content="OG title" />
      <meta property="og:description" content="OG description" />
      <title>{titleString}</title>
    </Helmet>
  );
};

export default Meta;

// {titleString}