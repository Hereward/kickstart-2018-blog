let myMeteor = require("meteor/meteor");
let settings = myMeteor.Meteor.settings;

const _FB_initFB = () => {
  window.fbAsyncInit = function() {
    FB.init({
      appId: settings.public.fb_app_id,
      xfbml: true,
      version: "v3.1"
    });
    FB.AppEvents.logPageView();
  };

  (function(d, s, id) {
    var js,
      fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
      return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  })(document, "script", "facebook-jssdk");
};

function _FB_login() {
  FB.login(function(response) {
    // Handle the response object, like in statusChangeCallback() in our demo
    // code.
  });
}

function _FB_feedDialog() {
  FB.ui(
    {
      method: "feed",
      link: "https://kickstart2018.eyeofthetiger.asia/blog/pellentesque-tempor-massa-a-pretium-rhoncus-20180904f",
      caption: "An example caption"
    },
    function(response) {}
  );
}

function _FB_share() {
  FB.ui(
    {
      method: "share",
      href: "https://kickstart2018.eyeofthetiger.asia/blog/pellentesque-tempor-massa-a-pretium-rhoncus-20180904f"
    },
    function(response) {
      console.log("_FB_share", response);
    }
  );
}

function _FB_ogShare() {
  FB.ui(
    {
      method: "share_open_graph",
      action_type: "news.publishes",
      action_properties: JSON.stringify({
        article: "https://kickstart2018.eyeofthetiger.asia/blog/pellentesque-tempor-massa-a-pretium-rhoncus-20180904f"
      })
    },
    function(response) {
      // Debug response (optional)
      console.log("_FB_ogShare", response);
    }
  );
}

function _FB_testAPI() {
  FB.api("/me", function(response) {
    console.log("_FB_testAPI: Successful login", response);
  });

  FB.api(`/me/picture?redirect=0&width=200&height=200`, "GET", {}, function(response) {
    console.log(`_FB_testAPI: Sucessful call to picture API`, response);
  });
}

function statusChangeCallback(response) {
  console.log("FB: statusChangeCallback", response);

  if (response.status === "connected") {
    // Logged into your app and Facebook.
    _FB_testAPI();
  } else {
    console.log("FB: NOT LOGGED IN!!!");
  }
}

const _FB_checkLoginState = () => {
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });
};

_FB_initFB();
