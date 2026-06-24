const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function generateImage() {
  const apiKey = process.env.GEMINI_API_KEY;
  // Use model name from list models output
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
  
  const payload = {
    instances: [
      {
        prompt: "A premium minimalist studio photograph of a sleek Nike Air Jordan sneaker, clean white background, Apple style lighting"
      }
    ],
    parameters: {
      sampleCount: 1,
      aspectRatio: "1:1",
      outputMimeType: "image/jpeg"
    }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Keys in response:', Object.keys(data));
    if (data.predictions && data.predictions[0]) {
      console.log('Prediction keys:', Object.keys(data.predictions[0]));
      console.log('Has bytesBase64Encoded:', !!data.predictions[0].bytesBase64Encoded);
      if (data.predictions[0].bytesBase64Encoded) {
        console.log('Length of base64:', data.predictions[0].bytesBase64Encoded.length);
      }
    } else {
      console.log('Error/Response body:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Fetch failed:', err);
  }
}

generateImage();
