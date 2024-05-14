
// import express from 'express';
// import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
// import db from './database';

// const app = express();
// const port = 3000;

// const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// // Replace with the wallet address and SPL token mint address you want to monitor
// const walletAddress = new PublicKey('7GVhtvwWeVZxKgXwTexDGtzxXGFcxLzkeXzRS5cRfwmD');
// const tokenMintAddress = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');

// interface PunchSlot {
//   id: number;
//   walletAddress: string;
//   punches: number;
//   used: boolean;
//   transactionSignature: string;
// }

// // Function to generate random punches
// const generatePunches = (): number => {
//   const random = Math.random();
//   return random < 0.5 ? Math.floor(Math.random() * 5 + 1) : Math.floor(Math.random() * 11 + 10);
// };

// // Function to handle account change
// const handleAccountChange = async (accountInfo: any, context: any) => {
//   try {
//     const signatures = await connection.getConfirmedSignaturesForAddress2(walletAddress);

//     for (const signatureInfo of signatures) {
//       const { signature } = signatureInfo;

//       // Check if this transaction is already processed
//       db.get('SELECT * FROM punch_slots WHERE transactionSignature = ?', [signature], (err, row) => {
//         if (err) {
//           console.error(err.message);
//           return;
//         }
//         if (row) {
//           return; // Transaction already processed
//         }

//         // Fetch the transaction details
//         connection.getTransaction(signature).then(transaction => {
//           if (transaction && transaction.meta) {
//             // Check for SPL token deposits
//             const postTokenBalances = transaction.meta.postTokenBalances || [];
//             const deposit = postTokenBalances.find(
//               balance => balance.mint === tokenMintAddress.toString() && balance.owner === walletAddress.toString()
//             );

//             if (deposit) {
//               const punches = generatePunches();
//               const walletAddressString = walletAddress.toString();

//               db.run(`INSERT INTO punch_slots (walletAddress, punches, transactionSignature) VALUES (?, ?, ?)`,
//                 [walletAddressString, punches, signature], function(err) {
//                   if (err) {
//                     console.error(err.message);
//                     return;
//                   }
//                   console.log(`Generated ${punches} punches for wallet ${walletAddressString}`);
//                 });
//             }
//           }
//         }).catch(err => {
//           console.error('Error fetching transaction:', err);
//         });
//       });
//     }
//   } catch (error) {
//     console.error('Error processing account change:', error);
//   }
// };

// // Monitor transactions using WebSocket
// const monitorTransactions = () => {
//   connection.onAccountChange(walletAddress, handleAccountChange);

//   console.log('Monitoring wallet for SPL token deposits using WebSocket...');
// };

// monitorTransactions();

// app.use(express.json());

// app.post('/redeem', (req, res) => {
//   const { walletAddress, slotId } = req.body;

//   db.get('SELECT * FROM punch_slots WHERE id = ? AND walletAddress = ? AND used = FALSE', [slotId, walletAddress], (err, row: PunchSlot) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }
//     if (!row) {
//       return res.status(404).json({ message: 'No unused punches found for this slot or wallet.' });
//     }

//     db.run('UPDATE punch_slots SET used = TRUE WHERE id = ?', [slotId], function(err) {
//       if (err) {
//         return res.status(500).json({ error: err.message });
//       }
//       res.status(200).json({ message: 'Punches redeemed successfully.', punches: row.punches });
//     });
//   });
// });

// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });

// app.get('/', (req, res) => {
//     res.send('Hello, World!');
//   });

import express from 'express';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import db from './database';

const app = express();
const port = 3000;

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// Replace with the wallet address and SPL token mint address you want to monitor
const walletAddress = new PublicKey('7GVhtvwWeVZxKgXwTexDGtzxXGFcxLzkeXzRS5cRfwmD');
const tokenMintAddress = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');

interface PunchSlot {
  id: number;
  walletAddress: string;
  punches: number;
  used: boolean;
  transactionSignature: string;
}

// Function to generate random punches
const generatePunches = (): number => {
  const random = Math.random();
  return random < 0.5 ? Math.floor(Math.random() * 5 + 1) : Math.floor(Math.random() * 11 + 10);
};

// Function to handle account change
const handleAccountChange = async (accountInfo: any, context: any) => {
  try {
    const signatures = await connection.getConfirmedSignaturesForAddress2(walletAddress);

    for (const signatureInfo of signatures) {
      const { signature } = signatureInfo;

      // Check if this transaction is already processed
      db.get('SELECT * FROM punch_slots WHERE transactionSignature = ?', [signature], (err, row) => {
        if (err) {
          console.error(err.message);
          return;
        }
        if (row) {
          return; // Transaction already processed
        }

        // Fetch the transaction details
        connection.getTransaction(signature).then(transaction => {
          if (transaction && transaction.meta) {
            // Check for SPL token deposits
            const postTokenBalances = transaction.meta.postTokenBalances || [];
            const deposit = postTokenBalances.find(
              balance => balance.mint === tokenMintAddress.toString() && balance.owner === walletAddress.toString()
            );

            if (deposit) {
              const punches = generatePunches();
              const walletAddressString = walletAddress.toString();

              db.run(`INSERT INTO punch_slots (walletAddress, punches, transactionSignature) VALUES (?, ?, ?)`,
                [walletAddressString, punches, signature], function(err) {
                  if (err) {
                    console.error(err.message);
                    return;
                  }
                  console.log(`Generated ${punches} punches for wallet ${walletAddressString}`);
                });
            }
          }
        }).catch(err => {
          console.error('Error fetching transaction:', err);
        });
      });
    }
  } catch (error) {
    console.error('Error processing account change:', error);
  }
};

// Monitor transactions using WebSocket
const monitorTransactions = () => {
  connection.onAccountChange(walletAddress, handleAccountChange);

  console.log('Monitoring wallet for SPL token deposits using WebSocket...');
};

monitorTransactions();

app.use(express.json());

app.post('/redeem', (req, res) => {
  const { walletAddress, slotId } = req.body;

  db.get('SELECT * FROM punch_slots WHERE id = ? AND walletAddress = ? AND used = FALSE', [slotId, walletAddress], (err, row: PunchSlot) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: 'No unused punches found for this slot or wallet.' });
    }

    db.run('UPDATE punch_slots SET used = TRUE WHERE id = ?', [slotId], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json({ message: 'Punches redeemed successfully.', punches: row.punches });
    });
  });
});

// Endpoint to get all punch slots
app.get('/punches', (req, res) => {
  db.all('SELECT * FROM punch_slots', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(rows);
  });
});

// Endpoint to get punch slots by wallet address
app.get('/punches/:walletAddress', (req, res) => {
  const { walletAddress } = req.params;

  db.all('SELECT * FROM punch_slots WHERE walletAddress = ?', [walletAddress], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(rows);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Endpoint to test server is running
app.get('/', (req, res) => {
  res.send('Hello, World!');
});
  