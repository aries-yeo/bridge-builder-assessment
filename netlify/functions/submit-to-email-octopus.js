// Netlify Function: submit-to-email-octopus.js
// Simplified version - just adds email, then we'll add custom fields

exports.handler = async (event, context) => {
  console.log('Function called with method:', event.httpMethod);

  // Set CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse the request body
    const { email_address, score, category, assessment_date } = JSON.parse(event.body);

    // Validate required fields
    if (!email_address) {
      return {
        statusCode: 400,
        headers: headers,
        body: JSON.stringify({ error: 'Email address is required' })
      };
    }

    // Get API credentials from environment variables
    const API_KEY = process.env.EMAIL_OCTOPUS_API_KEY;
    const LIST_ID = process.env.EMAIL_OCTOPUS_LIST_ID;

    if (!API_KEY || !LIST_ID) {
      return {
        statusCode: 500,
        headers: headers,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    // Start with basic email subscription only
    const emailOctopusData = {
      api_key: API_KEY,
      email_address: email_address
    };

    console.log('Sending basic subscription to Email Octopus');

    // Call Email Octopus API
    const response = await fetch(`https://emailoctopus.com/api/1.6/lists/${LIST_ID}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailOctopusData)
    });

    const result = await response.json();
    console.log('Email Octopus response:', response.status, result);

    if (response.ok) {
      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Successfully added to Email Octopus',
          email: email_address,
          score: score,
          category: category
        })
      };
    } else {
      console.error('Email Octopus API error:', result);
      return {
        statusCode: 400,
        headers: headers,
        body: JSON.stringify({ 
          error: 'Failed to add to Email Octopus', 
          details: result 
        })
      };
    }

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};
