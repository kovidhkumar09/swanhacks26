import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
      error: "",
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();

    const username = this.state.username.trim();
    const password = this.state.password.trim();

    if (!username || !password) {
      this.setState({
        error: "Please enter both username and password.",
      });
      return;
    }

    const userDetails = {
      id: 2,
      username: username,
    };

    sessionStorage.setItem("userDetails", JSON.stringify(userDetails));

    this.props.history.push("/welcome");
  };

  render() {
    return (
      <div className="d-flex align-items-center loginBox">
        <form onSubmit={this.handleSubmit} className="form-signin bg-white">
          <h3>Login</h3>

          {this.state.error && (
            <p className="forgot-password" style={{ color: "#e53e3e" }}>
              {this.state.error}
            </p>
          )}

          <input
            type="text"
            id="inputUsername"
            className="form-control mt-3"
            placeholder="Username"
            value={this.state.username}
            onChange={(e) => this.setState({ username: e.target.value })}
            required
          />

          <input
            type="password"
            id="inputPassword"
            className="form-control"
            value={this.state.password}
            onChange={(e) => this.setState({ password: e.target.value })}
            placeholder="Password"
            required
          />

          <div className="form-group">
            <div className="custom-control custom-checkbox">
              <input
                type="checkbox"
                className="custom-control-input"
                id="customCheck1"
              />

              <label className="custom-control-label" htmlFor="customCheck1">
                Remember me
              </label>
            </div>
          </div>

          <div className="d-grid my-2">
            <button type="submit" className="btn btn-primary btn-block mb-3">
              Login
            </button>
          </div>

          <div className="forgot-password form-inline">
            <span className="me-2 pe-4">
              Forgot <Link to="/forgotpassword">password?</Link>
            </span>
            New user? <Link to="/signup">Signup</Link>
          </div>
        </form>
      </div>
    );
  }
}