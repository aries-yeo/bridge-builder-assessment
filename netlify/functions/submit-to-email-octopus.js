// Netlify Function: submit-to-email-octopus.js
// This securely handles Email Octopus API calls using environment variables

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse the request body
    const { email_address, score, category, assessment_date } = JSON.parse(event.body);

    // Validate required fields
    if (!email_address || !score || !category) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Get API credentials from environment variables (secure!)
    const API_KEY = process.env.EMAIL_OCTOPUS_API_KEY;
    const LIST_ID = process.env.EMAIL_OCTOPUS_LIST_ID;

    if (!API_KEY || !LIST_ID) {
      console.error('Missing environment variables');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    // Prepare data for Email Octopus
    const emailOctopusData = {
      api_key: API_KEY,
      email_address: email_address,
      fields: {
        Score: score,
        Category: category,
        AssessmentDate: assessment_date
      },
      tags: {
        "BridgeBuilderSurvey": true
      }
    };

    // Call Email Octopus API
    const response = await fetch(`https://emailoctopus.com/api/1.6/lists/${LIST_ID}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailOctopusData)
    });

    const result = await response.json();

    if (response.ok) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ 
          success: true, 
          message: 'Successfully added to Email Octopus',
          data: result 
        })
      };
    } else {
      console.error('Email Octopus API error:', result);
      return {
        statusCode: 400,
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
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};
