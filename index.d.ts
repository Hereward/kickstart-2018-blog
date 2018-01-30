declare module "meteor/react-meteor-data" {
  import * as React from "react";

  var withTracker: any;

  type ComponentConstructor<P> =
    | React.ComponentClass<P>
    | React.StatelessComponent<P>;

  export function createContainer<InP, D, OutP extends InP & D>(
    options: (
      props: InP
    ) => D | { getMeteorData: (props: InP) => D; pure?: boolean },
    reactComponent: ComponentConstructor<OutP>
  ): ComponentConstructor<InP>;
}

declare var Bert: any;

declare function swal(options: object);
//declare function ValidatedMethod(options:object);
declare var console: Console;
//declare var Accounts: any;

declare namespace Meteor.User {
  let verificationEmailSent: boolean;
}

declare module "meteor/accounts-base" {
  namespace Accounts {
    function createUser(
      options: {
        enhancedAuth?: object;
        verificationEmailSent: number;
        username?: string;
        email?: string;
        password?: string;
        profile?: Object;
      },
      callback?: Function
    ): string;

    function verifyEmail(token: string, func: any): any;
  }
}

declare module "meteor/meteor" {
  namespace Meteor {
    interface User {
      _id?: string;
      username?: string;
      emails?: UserEmail[];
      createdAt?: number;
      profile?: any;
      services?: any;
      verificationEmailSent?: number;
      enhancedAuth: any;
    }
  }
}

declare module "meteor/mdg:validated-method" {
  class ValidatedMethod {
    constructor(properties: object);
    call(params: any, response: any): any;
  }
}

declare module "meteor/aldeed:simple-schema" {
  class SimpleSchema {
    constructor(properties: object);
    validator(): any;
  }
}


declare class ValidatedMethod {
  constructor(properties: object);
  call(params: any, response: any): any;
}


declare class SimpleSchema {
  constructor(properties: object);
  validator(): any;
}


