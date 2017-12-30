//import * as React from 'react'
import React from 'react';
import { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';



export default class Registration extends Component {

    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        this.props.handleSubmit(e);
    }

    handleChange(e) {
        this.props.handleChange(e);
    }

    render() {
        return (
            <div>
                <h2>Register</h2>
                <form onSubmit={this.handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email address</label>
                        <input onChange={this.handleChange} type="email" className="form-control" ref={(input) => this.email = input} id="email" placeholder="Email" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password1">Password</label>
                        <input onChange={this.handleChange} type="password" className="form-control" ref={(input) => this.password1 = input} id="password1" placeholder="Password" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password2">Confirm Password</label>
                        <input onChange={this.handleChange} type="password" className="form-control" ref={(input) => this.password2 = input} id="password2" placeholder="Confirm Password" />
                    </div>

                    <button type="submit" className="btn btn-default">Submit</button>
                </form>
            </div>
        );
    }

}





