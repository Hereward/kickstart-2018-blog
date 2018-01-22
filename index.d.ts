declare module 'meteor/react-meteor-data' {
    import * as React from 'react';

    var withTracker: any; 
  
    type ComponentConstructor<P> = React.ComponentClass<P> | React.StatelessComponent<P>
  
    export function createContainer<InP, D, OutP extends (InP & D)>(
      options: (props: InP) => D | {getMeteorData: (props: InP) => D, pure?: boolean},
      reactComponent: ComponentConstructor<OutP>)
      : ComponentConstructor<InP>;
  }


declare var Bert: any;

declare function swal(options:object);
declare var console: Console;
//declare var Accounts: any;

declare namespace Meteor.User {
  let verificationEmailSent: boolean;
}

declare module "meteor/meteor" {
  module Meteor {
     
      interface User {
          _id?: string;
          username?: string;
          emails?: UserEmail[];
          createdAt?: number;
          profile?: any;
          services?: any;
          verificationEmailSent?: boolean;
      }

  }
}
