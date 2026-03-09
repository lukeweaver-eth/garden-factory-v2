const { ethers } = require('ethers');

exports.handler = async (event) => {
  // Extract address and resource from query params or path
  // Query params used for essay.garden rewrites: ?address=0x...&resource=essay
  // Path used for factory.garden: /0x123... or /0x123.../essay
  let address, resource;

  // Check query parameters first (for rewrites)
  if (event.queryStringParameters?.address) {
    address = event.queryStringParameters.address;
    resource = event.queryStringParameters.resource; // 'essay' or undefined
  } else {
    // Fall back to path parsing
    let fullPath = event.path.replace('/.netlify/functions/garden/', '').replace(/^\//, '');
    fullPath = fullPath.replace(/\/$/, '');
    const parts = fullPath.split('/');
    address = parts[0];
    resource = parts[1]; // 'essay' or undefined
  }

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
      process.env.RPC_URL || 'https://ethereum.publicnode.com'
    );

    const garden = new ethers.Contract(
      checksumAddress,
      [
        'function html() external view returns (string)',
        'function request(string[] memory resource, tuple(string,string)[] memory params) external view returns (uint256, string, tuple(string,string)[] memory)'
      ],
      provider
    );

    let html;

    if (resource === 'essay') {
      // Call request for essay route
      const result = await garden.request([resource], []);
      const statusCode = Number(result[0]);
      const body = result[1];
      if (statusCode !== 200) {
        throw new Error('Essay not found');
      }
      html = body;
    } else {
      // Default: render the garden index
      html = await garden.html();
    }

    // Inject CSS fix for inline-block link alignment issue
    // Use multiple selectors to ensure it catches all link styles
    const cssFix = '<style>a,a:link,a:visited,a:hover,a:active,p a,div a,.essay a{vertical-align:baseline!important;display:inline!important;}</style>';
    if (html.includes('</head>')) {
      html = html.replace('</head>', cssFix + '</head>');
    } else if (html.includes('<body')) {
      html = html.replace('<body', cssFix + '<body');
    } else {
      html = cssFix + html;
    }

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
