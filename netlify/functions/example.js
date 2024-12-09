exports.handler = async (event, context) => {
  try {
    // Your API logic here
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Success" }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // For CORS
      },
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    }
  }
} 