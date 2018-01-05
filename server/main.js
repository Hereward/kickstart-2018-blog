import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email'
import '../imports/api/tasks.js';
import '../imports/api/users.js';
import '../imports/api/authenticator.js';


Meteor.startup(() => {
  // code to run on server at startup
  
  let env = `smtp://${encodeURIComponent(smtp.username)}:${encodeURIComponent(smtp.password)}@${encodeURIComponent(smtp.server)}:${smtp.port}`;

  console.log(env);

  process.env.MAIL_URL = env;

  Email.send({
    to: "editor@truthnews.com.au",
    from: "postmaster@mg.truthnews.com.au",
    subject: "Example Email",
    text: "The contents of our email in plain text.",
  });

});

// ?tls.rejectUnauthorized=false
