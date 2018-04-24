# Meteor/React Kickstart 2018

[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> **A starter platform for Meteor projects.**

**DEMO WEBSITE: https://kickstart2018.eyeofthetiger.asia/**

This project is intended to be a starting point for Meteor web app projects. It uses a collection of packages which I found helpful.

All code is in Typescript. The front-end is React.

The project contains a complete user registration process using custom templates including email verification and (optionally) 2 factor authentication.

The project uses both Bootstrap 4 and Material UI design elements.

There are 3 pages in the default site, with a built-in rich text editor (Quill):

* **Home**
* **About**
* **Profile**

The Home page contains an implementation of the simple todos example from the Meteor Guide.<br/>More info: https://www.meteor.com/tutorials/react/creating-an-app

The About page features the Quill rich text editor.

The Profile page features a form for uploading personal data as well as an image.

The project has session timeout features, with some settings which are configurable in the settings file.

## Table of Contents

* [Included Packages](#packages)
* [Key Features](#features)
* [Coding Style](#style)
* [File Structure](#structure)
* [Admin Functions](#admin)
* [Meteor Settings](#settings)
* [2FA Security](#2FA)
* [Session Timeout](#timeout)
* [Install](#install)
* [Run](#run)
* [Deploy](#deploy)
* [NPM Function Calls](#npm)
* [Maintainers](#maintainers)
* [VS Code Extensions](#VSextensions)
* [Roadmap](#roadmap)
* [Troubleshooting](#troubleshooting)
* [License](#license)

## <a name="packages"></a>Included Packages

This is not a complete list - it includes only the major packages used.

* React
* React Router 4
* Typescript
* Bootstrap 4
* Material UI
* Speakeasy 2FA
* Quill RTE
* VeliovGroup/Meteor-Files
* Bootstrap 4
* Tooltipster
* Simple Schema
* Styled Components
* Meteor Up

## <a name="features"></a>Key Features

* Customisable user registration forms & processes
* Email verification
* 2 factor authentication
* Forgot password
* Change password
* User profile with image upload
* Rich text editor
* Configurable session timeout
* Deployment template

## <a name="style"></a>Coding Style

The approach I've followed is that which is recommended by the ReactJS guidelines. Composition is preferred over inheritance and dynamic features are controlled using props, state and lifecycle methods.

Official React docs: https://reactjs.org/docs/hello-world.html

I have converted all code to Typescript. This is made possible using the barbatus/typescript package.

Github: https://github.com/barbatus/typescript

The project uses Meteor's "validated methods" package for managing data - providing a robust and flexible framework for building database apis. More info: https://guide.meteor.com/methods.html#validated-method

I personally use Microsoft VS Code with a number of extensions as noted below.

## <a name="structure"></a>File Structure

All project code resides in the imports folder, which contains separate folders as follows:

* **api** (Meteor publications & validated methods)
* **components** (React components)
* **modules** (code libraries)
* **scss** (custom scss declarations)
* **startup** (startup for client & server)

I have divided components into different groups in a way that seems intuitive to me:

* forms
* layouts
* pages
* partials
* routes

There is a separate 'modules' folder which contains a number of function libraries. These are imported into the project components as needed:

* icons.tsx
* library.ts
* timeout.ts
* tooltips.ts
* validation.ts

## <a name="admin"></a>Admin Functions
Currently there is only one admin function provided. If logged in as an "admin" user (see [settings](#settings)), you will see an option to delete all non-admin users on the Profile page.

## <a name="settings"></a>Meteor Settngs

Meteor settings files should be stored in the .deploy folder. A template file is provided. You should have as a minimum a production and a staging version. These files should be excluded from git.

The following file names have been added to the included .gitignore file:

* settings-production.json
* settings-development.json

#### configurable settings:
`private/adminEmail` - use this setting to specify the email address of 1 administrator
`public/enhancedAuth` - use these settings to enable/disable 2 factor authentication & change settings
* `active` - Determines whether the app runs with 2FA
* `maxAttempts` - Maximum number of failed attempts allowed
* `displayCode` - For development, display the auth code on screen

`private/enhancedAuth` - These settings are used to store users' 2FA private keys securely. More info: https://nodejs.org/api/crypto.html
* `iv` - Initialisation vector (16 character random string in UTF-8 encoding)
* `algorithm` - Algorithm used to encrypt the private key

`public/session` - use these settings to control the session timeout features
* `heartbeatInterval (integer)` - interval between activity detection messages sent to server (ms - default: 300000)
* `inactivityTimeout (integer)` - length of time before inactive users are logged out (ms - default: 3600000)
* `timeOutOn (boolean)` - turn on or off the timeout feature (default: true)
* `allowMultiSession` - allow multiple client sessions for the same user. **Note:** using this setting in conjunction with `enhancedAuth: {active: true}` presents a security risk as the auth token is not client specific

`private/smtp` - populate these settings with your SMTP server configuration


## <a name="2FA"></a>2FA Security

2 Factor authentication is becoming increasingly necessary in apps and websites these days. This project uses the Speakeasy package and is configured to work with Google 2FA.

Github: https://github.com/speakeasyjs/speakeasy

## <a name="timeout"></a>Session Timeout

By default Meteor sessions stay active indefinitely, as the user session data is stored in server side login tokens. There is an Accounts.config setting (loginExpirationInDays), however this creates bad UX since users could be logged out while interacting with the app. This project uses a combination of client side activity monitoring and server method calls to ensure that users are logged out after being inactive for a configurable period of time.

Settings for these features can be set in [Meteor Settings](#settings).

## <a name="install"></a>Install

1. Install Meteor runtime & dependencies (https://www.meteor.com/install)
1. Clone the github repository
1. Configure the [Meteor settings file](#settings)
1. In your shell, navigate to the project folder & run: **meteor npm install**

## <a name="run"></a>Run

You need to specify a settings file when you run Meteor otherwise there will be runtime errors. 
Using NPM preconfigured script: `npm start` (See [NPM Function Calls](#npm) section)


## <a name="deploy"></a>Deploy

A sample configuration for the Meteor Up package is provided. The config files are stored in .deploy in the project root.

Using NPM preconfigured script: `npm run deploy` (See [NPM Function Calls](#npm) section)

More info on MUP: http://meteor-up.com/

## <a name="npm"></a>NPM Function Calls

In the package.json file you will find 3 NPM function names:

* **start** - this launches meteor with the development settings file (.deploy/settings-development.json)
* **deploy** - this will deploy the app (you need to configure mup deploy first)
* **deploy-cache** - this will deploy a cached version of the app (useful when changing config settings only)

## <a name="VSextensions"></a>VS Code Extensions

I have been using both the ESLint and TSLint packages. The project contains a .eslintrc file which contains config settings that I found useful.

I'm also using the Prettier code formatter.

I have also experimented with the Flow package.

## <a name="roadmap"></a>Roadmap

Planned additions to this project include:

* Server side rendering
* User groups & permissions
* Admin panel
* Blog

## <a name="troubleshooting"></a>Troubleshooting

The Speakeasy functions will fail if your system clock is not accurate to within a few seconds. Use an internet time checker (eg. https://time.is/) to calibrate your system clock.

Developing in Typescript can be tricky due to missing type definitions and also bugs in the IDE.

In addition to the npm types packages, the project includes a custom type definition file (index.d.ts) where I have added random type declaratios in order to silence the Typescript compiler. If you find you are missing type declarations you can add them here.

## <a name="maintainers"></a>Maintainers

Hereward: https://github.com/hereward

## <a name="license"></a>License

MIT © 2018 Hereward Fenton
