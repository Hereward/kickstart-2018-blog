//import React from 'react';
import * as React from 'react';
import * as CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
//import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

const Transition = props => (
    <CSSTransitionGroup
        component="div"
        transitionName="route"
        transitionEnterTimeout={600}
        transitionAppearTimeout={600}
        transitionLeaveTimeout={400}
        transitionAppear={true}>
        <div>{props.children}</div>
    </CSSTransitionGroup>
)

export default Transition;

