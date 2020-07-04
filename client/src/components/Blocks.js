import React, { Component } from 'react';
import Block from './Block';
import { Link } from 'react-router-dom';

class Blocks extends Component {
  state = { blocks: [] };

  componentDidMount() {
    fetch('http://localhost:3001/api/blocks').then(
      response => response.json()).then(
        json => {
          this.setState({blocks: json});
        }
      );
  }

  render() {
    const blocksComponents = this.state.blocks.map(block => {
      return (<Block key={block.hash} block={block} />)
      });
    return (
      <div className='App'>
        <div className='BlocksContainer'>
          <div><Link to='/'>Home</Link></div>
          <div><h3>Blocks</h3></div>
          {blocksComponents}
        </div>
      </div>
    );
  }
}

export default Blocks;
