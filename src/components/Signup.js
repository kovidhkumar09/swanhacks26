import React, { Component } from "react";
import { Link } from "react-router-dom";
import { registerUser, saveAuthSession } from "../services/api";

export default class SignUp extends Component {
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
      const response = await registerUser(
        this.state.username,
        this.state.password
      );

      const token =
        response?.token ||
        response?.jwt ||
        response?.accessToken ||
        response?.bearerToken;

      if (token) {
        saveAuthSession(response, {
          username: this.state.username,
        });

        this.props.history.push("/welcome");
      } else {
        alert("Account created successfully. Please log in.");
        this.props.history.push("/signin");
      }
    } catch (error) {
      this.setState({
        loading: false,
        error: error.message || "Registration failed. Please try again.",
      });
    }
  };

  render() {
    return (
      <div className="d-flex align-items-center loginBox">
        <form onSubmit={this.handleSubmit} className="form-signin bg-white">
          <h3>Sign Up</h3>

          {this.state.error && (
            <p className="forgot-password" style={{ color: "#e53e3e" }}>
              {this.state.error}
            </p>
          )}

          <input
            type="text"
            id="inputName"
            className="form-control mt-4"
            value={this.state.username}
            onChange={(e) => this.setState({ username: e.target.value })}
            placeholder="Username"
            required
          />

          <input
            type="password"
            id="inputPassword"
            value={this.state.password}
            onChange={(e) => this.setState({ password: e.target.value })}
            className="form-control mb-2"
            placeholder="Password"
            required
          />

          <div className="d-grid my-2">
            <button
              type="submit"
              className="btn btn-primary btn-block mb-3"
              disabled={this.state.loading}
            >
              {this.state.loading ? "Creating Account..." : "Sign Up"}
            </button>
          </div>

          <div className="forgot-password">
            Already have an account? <Link to="/signin">Login</Link>
          </div>
        </form>
      </div>
    );
  }
}