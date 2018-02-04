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

declare var process: any;

declare function swal(options: object);
//declare function ValidatedMethod(options:object);
declare var console: Console;
//declare var Accounts: any;

declare namespace Meteor.User {
  let verificationEmailSent: boolean;
}

//        profile?: Object;


declare module "meteor/accounts-base" {
  namespace Accounts {
    
    function createUser(
      options: {
        username?: string;
        email?: string;
        password?: string;
      },
      callback?: Function
    ): string;
    

    function verifyEmail(token: string, func: any): any;
    function sendVerificationEmail(id: string): any;
  }
}

declare module "meteor/meteor" {
  var process: any;
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

declare module "meteor/accounts-base" {
  namespace Accounts {
    var urls: URLS;
    var emailTemplates: EmailTemplates;
    
    function forgotPassword(
      options: {
        email?: string;
      },
      callback?: Function
    ): void;

    function resetPassword(token: string, newPassword: string, callback?: Function): void;
  }
}

declare var require: any


// IntrinsicAttributes
//IntrinsicElements

/*
declare module JSX {
  interface IntrinsicAttributes {
    "fresh": any;
  }
}
*/

interface JQuery {
  /**
   * Remove the specified attributes from the first matched element and return them.
   *
   * @param attributes A space-separated list of attribute names to remove.
   */
  removeAttrs(attributes: string): any;
  /**
   * Adds the specified rules and returns all rules for the first matched element. Requires that the parent form is validated, that is, $( "form" ).validate() is called first.
   *
   * @param command "remove" or "add"
   * @param rules The rules to add. Accepts the same format as the rules-option of the validate-method.
   */
  rules(command: "add", rules?: JQueryValidation.RulesDictionary): any; // tslint:disable-line unified-signatures
  /**
   * Removes the specified rules and returns all rules for the first matched element.
   * @param command "remove"
   * @param rules The space-seperated names of rules to remove and return. If left unspecified, removes and returns all rules. Manipulates only rules specified via rules-option or via rules("add").
   */
  rules(command: "remove", rules?: string): any; // tslint:disable-line unified-signatures
  /**
   * Returns the validation rules for teh first selected element.
   */
  rules(): any;
  /**
   * Checks whether the selected form is valid or whether all selected elements are valid.
   */
  valid(): boolean;

  /**
   * Validates the selected form.
   *
   * @param options options for validation
   */
  validate(options?: JQueryValidation.ValidationOptions): JQueryValidation.Validator;
}