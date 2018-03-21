# meteor-react-typescript-kickstart-2018

[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> A starter platform for Meteor projects. 

This project is intended to be starting point for meteor web app projects. It uses a collection of packages which I found helpful and innovative. 

All code is in Typescript. The front-end is React.

The project contains a complete user registration process using custom templates including email verification and (optionally) 2 factor authentication.

The project uses both Bootstrap 4 and Material UI design elements.

There are 3 pages in the default site, with a built-in rich text editor (Quill):

* Home
* About
* Profile

The Home page contains an implementation of the simple todos example from the Meteor Guide.

The About page features the Quill rich text editor.

The Profile page features a form for uploading personal data as well as an image.

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

- [Coding Style](#style)
- [File Structure](#structure)
- [2FA Security](#2FA)
- [Session Timeout](#timeout)
- [Install](#install)
- [Deploy](#deploy)
- [Settings](#settings)
- [NPM Function Calls](#npm)
- [Maintainers](#maintainers)
- [License](#license)

## <a name="style"></a>Coding Style

The approach I've followed is that which is recommended by the ReactJS guidelines. Composition is preferred over inheritance and dynamic features are controlled using props, state and lifecycle methods.

## <a name="style"></a>File Structure

The project code all resides inside the imports directory. I have divided components into different groups in a way that seems intuitive to me:

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

## <a name="2FA"></a>2FA Security

2 Factor authentication is becoming increasingly necessary in apps and websites these days. This project uses the Speakeasy package and is configured to work with Google 2FA.

More info: https://github.com/speakeasyjs/speakeasy

## <a name="timeout"></a>Session Timeout

The project has a session timeout feature, with some settings which are configurable in the settings file. There is also a session cookie used to automatically log out users when the browser session is closed.

## <a name="install"></a>Install

Installation is done in the standard way - refer to Meteor docs for examples.

## <a name="deploy"></a>Deploy

A sample configuration for the Meteor Up package is provided. The config files are stored in .deploy in the project root.

More info: http://meteor-up.com/

## <a name="settings"></a>Settings

Meteor settings files are stored in the .deploy folder. There is a production and a development version.

## <a name="npm"></a>NPM Function Calls

In the package.json file you will find 3 NPM function names:

* start - this launches meteor with the development settings file.
* deploy - this will deploy the app (you need to configure mup deploy first)
* deploy-cache - this will deploy a cached version of the app (useful when changing config settings only)

## <a name="maintainers"></a>Maintainers

Hereward: https://github.com/hereward

## License

MIT © 2018 Hereward Fenton
