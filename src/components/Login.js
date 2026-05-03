import React, { Component } from "react";
import { Link } from "react-router-dom";
import { loginUser, saveAuthSession } from "../services/api";

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
      loading: false,
      error: "",
    };
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    this.setState({
      loading: true,
      error: "",
    });

    try {
      const response = await loginUser(
        this.state.username,
        this.state.password
      );

      saveAuthSession(response, {
        username: this.state.username,
      });

      this.props.history.push("/welcome");
    } catch (error) {
      this.setState({
        loading: false,
        error:
          error.message ||
          "Login failed. Please check your username and password.",
      });
    }
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
            <button
              type="submit"
              className="btn btn-primary btn-block mb-3"
              disabled={this.state.loading}
            >
              {this.state.loading ? "Logging in..." : "Login"}
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