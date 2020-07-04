import React from 'react';

const Transaction = ({ transaction }) => {
  const { input, outputs } = transaction;
  const recipients = Object.keys(outputs);

  return (
    <div className='Transaction'>
      <div>From: {`${input.address.substring(0, 20)}...`} | Balance: {input.amount}</div>
      {
        outputs.map(output => (
          <div key={output.address}>
            To: {`${output.address.substring(0, 20)}...`} | Sent: {output.amount}
          </div>
        ))
      }
    </div>
  );
}

export default Transaction;
