import React, { Component } from 'react';
import Block from './Block';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';

class Blocks extends Component {
  state = { blocks: [], paginatedId: 1, blocksLength: 0 };

  componentDidMount() {
    fetch(`${document.location.origin}/api/blocks/length`)
      .then(response => response.json())
      .then(json => this.setState({ blocksLength: json }));

    this.fetchPaginatedBlocks(this.state.paginatedId)();
  }

  fetchPaginatedBlocks = paginatedId => () => {
    fetch(`${document.location.origin}/api/blocks/${paginatedId}`)
      .then(response => response.json())
      .then(json => this.setState({ blocks: json }));
  }

  getPaginationComponent() {
    return (
      <div>
        {
          [...Array(Math.ceil(this.state.blocksLength/5)).keys()].map(key => {
            const paginatedId = key+1;

            return (
              <span
                key={key}
                onClick={() => this.fetchPaginatedBlocks(paginatedId)}>
                <Button bsSize="small" bsStyle="danger">
                  {paginatedId}
                </Button>{' '}
              </span>
            )
          })
        }
      </div>
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
          {this.getPaginationComponent()}
          {blocksComponents}
        </div>
      </div>
    );
  }
}

export default Blocks;
