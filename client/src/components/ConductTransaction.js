import React, { Component } from 'react';
import {FormGroup, FormControl, Button} from 'react-bootstrap';
import { Link } from 'react-router-dom';

class ConductTransaction extends Component {
  state = { recipient: '', amount: 0};

  updateRecipient = event => {
    this.setState({recipient: event.target.value});
  }

  updateAmount = event => {
    this.setState({amount: Number(event.target.value)});
  }

  conductTransaction = () => {
    const { recipient, amount } = this.state;
    fetch('http://localhost:3001/transact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({recipient, amount})
    }).then(response => response.json())
      .then(json => {
        alert(json.message || json.type);
        this.setState({recipient: '', amount: 0});
      });
  }

  render() {
    return (
      <div>
        <Link to='/'>Home</Link>
        <div className='ConductTransaction'>
          <FormGroup className='TransactionInput'>
            <FormControl
              input='text'
              placeholder='recipient'
              value={this.state.recipient}
              onChange={this.updateRecipient}
            />
          </FormGroup>
          <FormGroup className='TransactionInput'>
            <FormControl
              input='number'
              placeholder='amount'
              value={this.state.amount}
              onChange={this.updateAmount}
            />
          </FormGroup>
          <div>
            <Button
              className='TransactionButton'
              onClick={this.conductTransaction}>
              Submit
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default ConductTransaction;
