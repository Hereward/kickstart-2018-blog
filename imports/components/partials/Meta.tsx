import * as React from "react";
import { Meteor } from "meteor/meteor";
import { Helmet } from "react-helmet";
const Meta = (props: { settings: any; url?: string }) => {
  const titleString = `${props.settings.title}`;
  let imageLink = props.settings.imageLink || "";
  return (
    <Helmet>
      <meta property="fb:app_id" content={Meteor.settings.public.fb_app_id} /> 
      <meta name="description" content={props.settings.summary} />
      <meta property="og:title" content={props.settings.title} />
      <meta property="og:description" content={props.settings.summary} />
      <meta property="og:image" content={imageLink} />
      <meta property="og:type" content={props.settings.objectType} />
      <meta property="article:author" content="https://www.facebook.com/hereward.fenton" />
      {props.url && <meta property="og:url" content={props.url} />}
      

      <title>{titleString}</title>
    </Helmet>
  );
};

export default Meta;
