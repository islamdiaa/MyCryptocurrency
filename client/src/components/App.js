import React, { Component } from 'react';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';

class App extends Component {
  state = { walletInfo: {} };

  componentDidMount() {
    fetch(`${document.location.origin}/api/wallet-info`).then(
      response => response.json()).then(
        json => {
          this.setState({walletInfo: json});
        }
      );
  }

  render() {
    const { address, balance } = this.state.walletInfo;
    return (
      <div className='App'>
        <img className='logo' src={logo}></img>
        <div>Welcome to the Blockchain...</div>
        <br />
        <div><Link to='/block'>Blocks</Link></div>
        <div><Link to='/conduct'>Conduct a Transaction</Link></div>
        <div><Link to='/transactions'>Transaction Pool</Link></div>
        <br />
        <div className='WalletInfo'>
          <div>Address: {address}</div>
          <div>Balance: {balance}</div>
        </div>
        <br />
      </div>
    );
  }
}

export default App;
