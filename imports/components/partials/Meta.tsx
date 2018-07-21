import * as React from "react";
import { Helmet } from "react-helmet";
//import { EditorialImages } from "../../api/images/methods";
//import { systemSettings } from "../../api/admin/publish";

const Meta = (props: {settings: any; location: string;}) => {
  const titleString = `${props.settings.title} [${props.location}]`;
  let imagePath = props.settings.imageLink || ""; 
  return (
    <Helmet>
      <meta name="description" content={props.settings.summary} />
      <meta property="og:title" content={props.settings.title} />
      <meta property="og:description" content={props.settings.summary} />
      <meta property="og:image" content={imagePath} />

      <title>{titleString}</title>
    </Helmet>
  );
};

export default Meta;
