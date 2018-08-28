import * as React from "react";

const LayoutWrapper = props => {
  const { path, children } = props;
  let type: string = "multi";
  let contained = true;
  if (path.match(/admin/)) {
    type = "single";
    contained = false;
  } else if (path.match(/profile/)) {
    type = "single";
    contained = false;
  } else if (path.match(/members/)) {
    type = "single";
  } else if (path.match(/terms-of-service/)) {
    type = "single";
  } else if (path.match(/^\/$/)) {
    type = "single";
  }

  if (type === "multi") {
    return (
      <div className="container">
        <div className="row">
          <div className="col-lg-10">
            <main>{children}</main>
          </div>
          <div className="col-lg-2 right-col">RIGHT COL</div>
        </div>
      </div>
    );
  } else {
    if (contained) {
      return (
        <div className="container">
          <main>{children}</main>
        </div>
      );
    } else {
      return <main>{children}</main>;
    }
  }
};

export default LayoutWrapper;
