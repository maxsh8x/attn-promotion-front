import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { Form, Icon, Input, Button, Card } from 'antd';
import { withRouter } from 'react-router';

@inject('authStore') @observer
class Login extends Component {
  static propTypes = {
    authStore: PropTypes.shape({
      updateInput: PropTypes.func.isRequired,
      login: PropTypes.func.isRequired,
      username: PropTypes.string.isRequired,
      password: PropTypes.string.isRequired,
      state: PropTypes.string.isRequired,
    }).isRequired,
  }

  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(e) {
    this.props.authStore.updateInput(
      e.target.name,
      e.target.value,
    );
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.authStore.login();
  }

  render() {
    const { username, password, state } = this.props.authStore;
    return (
      <Card style={{ width: 300 }}>
        <Form onSubmit={this.handleSubmit}>
          {state === 'failed' ? <p className="error-message">failed_</p> : null}
          <Form.Item>
            <Input
              name="username"
              prefix={<Icon type="user" style={{ fontSize: 13 }} />}
              placeholder="Username"
              onChange={this.handleInputChange}
              value={username}
            />
          </Form.Item>
          <Form.Item>
            <Input
              type="password"
              name="password"
              prefix={<Icon type="lock" style={{ fontSize: 13 }} />}
              placeholder="Password"
              onChange={this.handleInputChange}
              value={password}
            />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit">Log in</Button>
          </Form.Item>
        </Form>
      </Card>
    );
  }
}

export default withRouter(Login);
