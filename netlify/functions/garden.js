const { ethers } = require('ethers');

exports.handler = async (event) => {
  // Extract address from path: /0x123... or /.netlify/functions/garden/0x123...
  let address = event.path.replace('/.netlify/functions/garden/', '').replace('/', '');

  // Handle trailing slashes
  address = address.replace(/\/$/, '');

  if (!address || !address.startsWith('0x')) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'text/html' },
      body: `
        <!DOCTYPE html>
        <html>
        <head><title>Garden Not Found</title></head>
        <body style="font-family: monospace; padding: 2em;">
          <h1>Garden Not Found</h1>
          <p>Please provide a valid garden address.</p>
          <p>Example: factory.garden/0xYourGardenAddress</p>
          <p><a href="/">← Back to Garden Factory</a></p>
        </body>
        </html>
      `
    };
  }

  try {
    // Validate address format
    const checksumAddress = ethers.getAddress(address);

    const provider = new ethers.JsonRpcProvider(
      process.env.RPC_URL || 'https://ethereum-sepolia.publicnode.com'
    );

    const garden = new ethers.Contract(
      checksumAddress,
      ['function html() external view returns (string)'],
      provider
    );

    const html = await garden.html();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=60'
      },
      body: html
    };
  } catch (error) {
    console.error('Error fetching garden:', error);

    // Check if it's an array error (garden with data issue)
    const isArrayError = error.message && error.message.includes('ARRAY_RANGE_ERROR');

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: `
        <!DOCTYPE html>
        <html>
        <head><title>Error Loading Garden</title></head>
        <body style="font-family: monospace; padding: 2em;">
          <h1>Error Loading Garden</h1>
          <p>Could not load garden at ${address}</p>
          ${isArrayError ? `
            <p style="opacity: 0.8">This garden has a data configuration issue.</p>
            <p style="opacity: 0.8">The garden owner can fix this by calling setThankYous() with matching arrays.</p>
          ` : `
            <p style="opacity: 0.6">${error.message}</p>
          `}
          <p><a href="/">← Back to Garden Factory</a></p>
        </body>
        </html>
      `
    };
  }
};
