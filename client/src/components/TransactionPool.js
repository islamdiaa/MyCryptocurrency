import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import Transaction from './Transaction';
import { Link } from 'react-router-dom';
import history from '../history';

const POLL_INTERVAL_MS = 1000;

class TransactionPool extends Component {
  state = {transactionPool: []};

  fetchTransactionPool = () => {
    fetch(`${document.location.origin}/api/transactions`)
      .then(response => response.json())
      .then(json => this.setState({transactionPool: json}));
  }

  fetchMineTransactions = () => {
    fetch(`${document.location.origin}/api/mine-transactions`)
      .then(response => {
        if (response.status === 200) {
          history.push('/blocks');
        } else {
          alert('The mine-transactions block request failed!');
        }
      });
  }

  componentDidMount() {
    this.fetchTransactionPool();

    this.fetchPoolMapInterval =
      setInterval(
        () => this.fetchTransactionPool(), POLL_INTERVAL_MS
      );
  }

  componentWillUnmount() {
    clearInterval(this.fetchPoolMapInterval);
  }

  render() {
    return (
      <div className='TransactionPool'>
        <div><Link to='/'>Home</Link></div>
        <h3>Trsansction Pool</h3>
        {
          this.state.transactionPool.map(transaction => {
            return (
              <div key={transaction.id}>
                <hr />
                <Transaction transaction={transaction} />
              </div>
            );
          })
        }
        <hr />
        <Button
          bsStyle="danger"
          bsSize="small"
          onClick={this.fetchMineTransactions}>
          Mine the Transactions
        </Button>
      </div>
    );
  }
}

export default TransactionPool;
