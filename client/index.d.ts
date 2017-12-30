
declare module 'meteor/react-meteor-data' {
    import * as React from 'react';
    var withTracker: any;
}


/*

declare module "meteor/react-meteor-data" {

    interface tracker {
   
    }

    export function withTracker<tracker>();
    
}



declare module "meteor/react-meteor-data" {
    module Meteor {
   
        interface Connection {
            id: string;
            close: Function;
            onClose: Function;
            clientAddress: string;
            httpHeaders: Object;
        }

        function onConnection(callback: Function): void;

        function publish(name: string, func: Function): void;

        function _debug(...args: any[]): void;
    }

    interface Subscription {
        added(collection: string, id: string, fields: Object): void;
        changed(collection: string, id: string, fields: Object): void;
        connection: Meteor.Connection;
        error(error: Error): void;
        onStop(func: Function): void;
        ready(): void;
        removed(collection: string, id: string): void;
        stop(): void;
        userId: string;
    }
}



// Type definitions for meteor package react-meteor-data.
// Project: https://atmospherejs.com/meteor/react-meteor-data
// Definitions by:
// <https://github.com/fullflavedave> and <https://github.com/kurnos>
///<reference path="typings/globals/react/index.d.ts"/>
declare module 'meteor/react-meteor-data' {
    import * as React from 'react';

    type ComponentConstructor<P> = React.ComponentClass<P> | React.StatelessComponent<P>

    export function createContainer<InP, D, OutP extends (InP & D)>(
        options: (props: InP) => D | { getMeteorData: (props: InP) => D, pure?: boolean },
        reactComponent: ComponentConstructor<OutP>)
        : ComponentConstructor<InP>;
}

*/