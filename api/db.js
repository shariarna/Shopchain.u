const REMOTE_DB_URL = 'https://extendsclass.com/api/json-storage/bin/febfbaa';

// Helper to verify BSC transactions
async function verifyBscTx(txHash, adminAddress, targetCrypto) {
  const rpcUrl = 'https://bsc-dataseed.binance.org/';
  txHash = txHash.trim();
  if (!txHash.startsWith('0x')) txHash = '0x' + txHash;
  
  const resTx = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getTransactionByHash',
      params: [txHash]
    })
  });
  const dataTx = await resTx.json();
  if (dataTx.error) throw new Error(dataTx.error.message || 'Error fetching transaction.');
  const tx = dataTx.result;
  if (!tx) throw new Error('Transaction hash not found on BSC.');

  const resRec = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'eth_getTransactionReceipt',
      params: [txHash]
    })
  });
  const dataRec = await resRec.json();
  const receipt = dataRec.result;
  if (!receipt) throw new Error('Transaction is still pending.');
  if (receipt.status !== '0x1') throw new Error('Transaction failed.');

  let amount = 0;
  let parsedTo = '';
  const usdtContract = '0x55d398326f99059ff775485246999027b3197955';
  const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

  let foundLog = null;
  if (receipt.logs) {
    foundLog = receipt.logs.find(log => 
      log.address.toLowerCase() === usdtContract.toLowerCase() &&
      log.topics && log.topics[0] === transferTopic &&
      log.topics[2] && ('0x' + log.topics[2].substring(26).toLowerCase() === adminAddress.toLowerCase())
    );
  }

  if (foundLog) {
    parsedTo = adminAddress;
    amount = Number(BigInt(foundLog.data)) / 1e18;
  } else if (targetCrypto === 'USDT_BEP20') {
    if (!tx.to || tx.to.toLowerCase() !== usdtContract.toLowerCase()) throw new Error('Not a BEP-20 USDT transfer.');
    const input = tx.input;
    if (!input || !input.startsWith('0xa9059cbb')) throw new Error('Not a valid transfer input.');
    parsedTo = '0x' + input.substring(34, 74).toLowerCase();
    amount = Number(BigInt('0x' + input.substring(74))) / 1e18;
  } else {
    throw new Error('Unsupported cryptocurrency.');
  }

  if (parsedTo.toLowerCase() !== adminAddress.toLowerCase()) throw new Error('Recipient mismatch.');
  if (amount <= 0) throw new Error('Amount must be > 0.');
  return amount;
}

// Helper to verify TRON transactions
async function verifyTronTx(txHash, adminAddress) {
  txHash = txHash.trim();
  adminAddress = adminAddress.trim();
  const url = `https://api.trongrid.io/v1/accounts/${adminAddress}/transactions/trc20?contract_address=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t&limit=25`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data || !data.success || !data.data) throw new Error('Could not query TRON network.');

  const tx = data.data.find(t => t.transaction_id.toLowerCase() === txHash.toLowerCase());
  if (!tx) throw new Error('Transaction hash not found.');
  if (tx.to.toLowerCase() !== adminAddress.toLowerCase()) throw new Error('Recipient mismatch.');
  if (tx.token_info.symbol !== 'USDT' || tx.token_info.address !== 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t') throw new Error('Not USDT TRC20.');

  const decimals = tx.token_info.decimals || 6;
  const amount = parseFloat(tx.value) / Math.pow(10, decimals);
  if (amount <= 0) throw new Error('Amount must be > 0.');
  return amount;
}

// Main verification and validation logic
async function validateDatabaseChanges(oldDB, newDB, reqHeaders) {
  const sessionToken = reqHeaders.authorization || '';
  const sessionUserId = oldDB.sessions && oldDB.sessions[sessionToken];
  const sessionUser = sessionUserId ? oldDB.users.find(u => u.id === sessionUserId) : null;
  const isAdmin = sessionUser && sessionUser.role === 'admin';

  if (isAdmin) return true; // Admin has full access

  // 1. Critical config arrays must not be changed by non-admins
  if (JSON.stringify(oldDB.products) !== JSON.stringify(newDB.products)) {
    throw new Error('Only admins can modify products.');
  }
  if (JSON.stringify(oldDB.siteSettings) !== JSON.stringify(newDB.siteSettings)) {
    throw new Error('Only admins can modify site settings.');
  }
  if (JSON.stringify(oldDB.referralCodes) !== JSON.stringify(newDB.referralCodes)) {
    throw new Error('Only admins can modify referral codes.');
  }

  // 2. Compare users list
  const oldUsersMap = new Map(oldDB.users.map(u => [u.id, u]));
  const newUsersMap = new Map(newDB.users.map(u => [u.id, u]));

  for (const [id, oldU] of oldUsersMap.entries()) {
    const newU = newUsersMap.get(id);
    if (!newU) {
      throw new Error('Users cannot be deleted.');
    }
    if (oldU.role !== newU.role) {
      throw new Error('User roles cannot be modified.');
    }
    if (oldU.email !== newU.email || oldU.password !== newU.password) {
      throw new Error('User login credentials cannot be modified.');
    }
    
    // Balance check
    if (newU.balance > oldU.balance) {
      const diff = newU.balance - oldU.balance;
      
      // Can only increase balance of the logged-in user
      if (id !== sessionUserId) {
        throw new Error('Cannot increase balance of other users.');
      }
      
      // Determine allowed increase categories
      const newDeps = newDB.deposits.filter(d => d.userId === id && d.status === 'approved');
      const oldDeps = oldDB.deposits.filter(d => d.userId === id && d.status === 'approved');
      const addedDepAmount = newDeps
        .filter(nd => !oldDeps.some(od => od.id === nd.id))
        .reduce((sum, d) => sum + d.amount, 0);

      const newSolds = newDB.purchases.filter(p => p.userId === id && p.status === 'sold');
      const oldSolds = oldDB.purchases.filter(p => p.userId === id && p.status === 'sold');
      const addedSoldAmount = newSolds
        .filter(ns => !oldSolds.some(os => os.id === ns.id))
        .reduce((sum, p) => sum + p.sellPrice, 0);
        
      const newRejectedWtds = newDB.withdrawals.filter(w => w.userId === id && w.status === 'rejected');
      const oldRejectedWtds = oldDB.withdrawals.filter(w => w.userId === id && w.status === 'rejected');
      const addedRefundAmount = newRejectedWtds
        .filter(nw => !oldRejectedWtds.some(ow => ow.id === nw.id))
        .reduce((sum, w) => sum + w.amount, 0);

      const totalAllowedIncrease = addedDepAmount + addedSoldAmount + addedRefundAmount;
      if (diff > totalAllowedIncrease + 0.01) {
        throw new Error(`Unauthorized balance increase of $${diff.toFixed(2)}.`);
      }
    }
  }

  // 3. Verify newly added deposits on the blockchain (Double-Check)
  const addedDeps = newDB.deposits.filter(nd => !oldDB.deposits.some(od => od.id === nd.id));
  const oldDepTxids = new Set(oldDB.deposits.map(d => d.txid.toLowerCase()));

  for (const dep of addedDeps) {
    if (dep.userId !== sessionUserId) {
      throw new Error('Cannot add deposit for another user.');
    }
    if (oldDepTxids.has(dep.txid.toLowerCase())) {
      throw new Error('Duplicate TxID submitted.');
    }
    
    // Perform server-side validation against the real blockchain
    const cryptoWallets = oldDB.siteSettings.wallets || {};
    const walletConfig = cryptoWallets[dep.crypto];
    if (!walletConfig || !walletConfig.address) {
      throw new Error('Deposit wallet is not configured by admin.');
    }

    let verifiedAmount = 0;
    if (dep.crypto === 'USDT_BEP20') {
      verifiedAmount = await verifyBscTx(dep.txid, walletConfig.address, dep.crypto);
    } else if (dep.crypto === 'USDT_TRC20') {
      verifiedAmount = await verifyTronTx(dep.txid, walletConfig.address);
    } else {
      throw new Error('Unsupported deposit cryptocurrency.');
    }

    if (Math.abs(verifiedAmount - dep.amount) > 0.01) {
      throw new Error(`Deposit amount mismatch. Blockchain: $${verifiedAmount}, Submitted: $${dep.amount}`);
    }
  }

  // 4. Verify purchases
  const addedPurchases = newDB.purchases.filter(np => !oldDB.purchases.some(op => op.id === np.id));
  for (const pur of addedPurchases) {
    if (pur.userId !== sessionUserId) {
      throw new Error('Cannot make purchase for another user.');
    }
    const origProd = oldDB.products.find(p => p.id === pur.productId);
    if (!origProd) {
      throw new Error('Purchased product does not exist.');
    }
    if (pur.buyPrice !== origProd.price) {
      throw new Error('Invalid purchase buy price.');
    }
  }

  // 5. Verify withdrawals
  const addedWtds = newDB.withdrawals.filter(nw => !oldDB.withdrawals.some(ow => ow.id === nw.id));
  for (const wtd of addedWtds) {
    if (wtd.userId !== sessionUserId) {
      throw new Error('Cannot request withdrawal for another user.');
    }
    if (wtd.status !== 'pending') {
      throw new Error('New withdrawals must be in pending status.');
    }
  }

  // 6. Verify Session Creation (Login protection)
  const oldSessions = oldDB.sessions || {};
  const newSessions = newDB.sessions || {};
  for (const [token, userId] of Object.entries(newSessions)) {
    if (!oldSessions[token]) {
      // New session created. Must match password!
      const user = oldDB.users.find(u => u.id === userId);
      if (!user) throw new Error('User does not exist for session.');
      
      const providedPassword = reqHeaders['x-auth-password'] || '';
      if (user.password !== providedPassword) {
        throw new Error('Authentication failed for session creation.');
      }
    }
  }

  return true;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Auth-Password');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const dbRes = await fetch(REMOTE_DB_URL + '?nocache=' + Date.now());
      const dbData = await dbRes.json();
      return res.status(200).json(dbData);
    } 
    
    if (req.method === 'POST') {
      const newDB = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      
      // Fetch current database state for verification
      const dbRes = await fetch(REMOTE_DB_URL + '?nocache=' + Date.now());
      const oldDB = await dbRes.json();

      // Run security checks
      try {
        await validateDatabaseChanges(oldDB, newDB, req.headers);
      } catch (err) {
        console.warn("Security rejection:", err.message);
        return res.status(403).json({ error: `Security Rejection: ${err.message}` });
      }

      // If validation succeeds, save the database
      const putRes = await fetch(REMOTE_DB_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDB)
      });
      const putData = await putRes.json();
      return res.status(200).json(putData);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error("Backend DB Error:", error);
    return res.status(500).json({ error: error.message });
  }
};
