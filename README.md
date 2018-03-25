# Meteor/React Kickstart 2018

[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> **A starter platform for Meteor projects.**

This project is intended to be starting point for Meteor web app projects. It uses a collection of packages which I found helpful. 

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

The project has a session timeout feature, with some settings which are configurable in the settings file. There is also a session cookie used to automatically log out users when the browser session is closed.

## Included Packages

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

## Table of Contents

- [Key Features](#features)
- [Coding Style](#style)
- [File Structure](#structure)
- [Meteor Settings](#settings)
- [2FA Security](#2FA)
- [Install](#install)
- [Run](#run)
- [Deploy](#deploy)
- [NPM Function Calls](#npm)
- [Maintainers](#maintainers)
- [VS Code Extensions](#VSextensions)
- [Roadmap](#roadmap)
- [Troubleshooting](#troubleshooting)
- [License](#license)

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

All project code resides in the imports folders which contains separate folders as follows:

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

## <a name="settings"></a>Meteor Settngs

Meteor settings files should be stored in the .deploy folder. A template file is provided. You should have as a minimum a production and a staging version. These files should be excluded from git.

The following file names have been added to the included .gitignore file:

* settings-production.json
* settings-development.json

#### configurable settings:

* **enhancedAuth** - use these settings to enable/disable 2 factor authentication. Note: changing this setting after initial build may cause problems.
* **session** - use these settings to control the session timeout features.
* **smtp** - populate these settings with your SMTP server configuration


## <a name="2FA"></a>2FA Security

2 Factor authentication is becoming increasingly necessary in apps and websites these days. This project uses the Speakeasy package and is configured to work with Google 2FA.

More info: https://github.com/speakeasyjs/speakeasy

## <a name="install"></a>Install

Installation is done in the standard way - refer to Meteor docs for examples.

## <a name="run"></a>Run

You need to specify a settings file when you run Meteor otherwise there will be runtime errors. See [NPM Function Calls](#npm) section below.

## <a name="deploy"></a>Deploy

A sample configuration for the Meteor Up package is provided. The config files are stored in .deploy in the project root.

More info: http://meteor-up.com/

## <a name="npm"></a>NPM Function Calls

In the package.json file you will find 3 NPM function names:

* **start** - this launches meteor with the development settings file.
* **deploy** - this will deploy the app (you need to configure mup deploy first)
* **deploy-cache** - this will deploy a cached version of the app (useful when changing config settings only)

## <a name="maintainers"></a>Maintainers

Hereward: https://github.com/hereward

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

If the client is offline and the server is remote the automatic session timeout may fail. I have attempted to fix this problem by adding this extra line to the logout function:
```javascript
Meteor["connection"].setUserId(null);
```
This is an undocumented property. If it causes problems feel free to remove that line.

The Speakeasy functions will fail if your system clock is not accurate to within a few seconds. Use an internet time checker (eg. https://time.is/) to calibrate your system clock.

Developing in Typescript can be tricky due to missing type definitions and also bugs in the IDE. 

In addition to the npm types packages, the project includes a custom type definition file (index.d.ts) where I have added random type declaratios in order to silence the Typescript compiler. If you find you are missing type declarations you can add them here.

## <a name="license"></a>License

MIT © 2018 Hereward Fenton
