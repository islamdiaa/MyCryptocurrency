import React, { Component } from 'react';

class Blocks extends Component {
  state = { blocks: [] };

  componentDidMount() {
    fetch('http://localhost:3001/blocks').then(
      response => response.json()).then(
        json => {
          this.setState({blocks: json});
        }
      );
  }

  render() {
    const blocksComponents = this.state.blocks.map(block => {return (
          <div key={block.hash}>
            <div>Data: {JSON.stringify(block.data)}</div>
            <div>Hash: {block.hash}</div>
            <div>Last Hash: {block.lastHash}</div>
            <div>Nonce: {block.nonce}</div>
            <div>Timestamp: {block.timestamp}</div>
            <div>Difficulty: {block.difficulty}</div>
          </div>
        )
      });
    return (
      <div>
        <h3>Blocks</h3>
        {blocksComponents}
      </div>
    );
  }
}

export default Blocks;
