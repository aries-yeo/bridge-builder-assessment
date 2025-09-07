// Netlify Function: submit-to-email-octopus.js
// Enhanced version with names, custom fields, and tags

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { email_address, first_name, last_name, score, category, assessment_date } = JSON.parse(event.body);

    if (!email_address || !first_name || !last_name) {
      return {
        statusCode: 400,
        headers: headers,
        body: JSON.stringify({ error: 'Email, first name, and last name are required' })
      };
    }

    const API_KEY = process.env.EMAIL_OCTOPUS_API_KEY;
    const LIST_ID = process.env.EMAIL_OCTOPUS_LIST_ID;

    if (!API_KEY || !LIST_ID) {
      return {
        statusCode: 500,
        headers: headers,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    // Enhanced data with names, custom fields, and tags
    const emailOctopusData = {
      api_key: API_KEY,
      email_address: email_address,
      first_name: first_name,
      last_name: last_name,
      fields: {
        Score: score.toString(),
        Category: category,
        AssessmentDate: assessment_date
      },
      tags: {
        BridgeBuilderSurvey: true
      }
    };

    console.log('Sending complete data to Email Octopus:', JSON.stringify(emailOctopusData, null, 2));

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
          message: 'Successfully added to Email Octopus with all data',
          email: email_address,
          name: `${first_name} ${last_name}`,
          score: score,
          category: category,
          tag: 'BridgeBuilderSurvey applied'
        })
      };
    } else {
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
