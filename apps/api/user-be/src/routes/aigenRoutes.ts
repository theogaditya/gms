import express from 'express';
const { VertexAI } = require('@google-cloud/vertexai');
import { Router, Request, Response } from 'express';
const router = Router();
router.use(express.json()); //
import { PrismaClient } from "@prisma/client";

const PROJECT_ID = process.env.GCP_PROJECT_ID;
const LOCATION = process.env.GCP_LOCATION; 
const ENDPOINT_ID = process.env.ENDPOINT_ID;

// if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
//   console.error('ERROR: The GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.');
//   console.error('Please set it to the path of your service account key file.');
//   process.exit(1);
// }

if (!PROJECT_ID || !LOCATION || !ENDPOINT_ID) {
    console.error("ERROR: Missing required environment variables (GCP_PROJECT_ID, GCP_LOCATION, ENDPOINT_ID).");
    console.error("Please ensure your .env file is set up correctly.");
    process.exit(1);
}

const vertex_ai = new VertexAI({ project: PROJECT_ID, location: LOCATION });

const modelEndpointPath = `projects/${PROJECT_ID}/locations/${LOCATION}/endpoints/${ENDPOINT_ID}`;

const generativeModel = vertex_ai.getGenerativeModel({
  model: modelEndpointPath,
});


router.get('/', (req: Request, res: Response): void => {
  res.json({ message: 'Welcome to the AI Generation API!' });
})

router.post('/prompt', async (req: Request, res: Response): Promise<void> => {
  const { prompts } = req.body;

  if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
    res.status(400).send({ error: 'A "prompts" property (a non-empty array of strings) is required in the request body.' });
    return;
  }

  console.log(`Received ${prompts.length} prompts.`);
  console.log(`Sending requests to endpoint: ${ENDPOINT_ID}`);

  try {
    const requests = prompts.map(prompt => {
      const request = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      };
      return generativeModel.generateContent(request);
    });

    const responses = await Promise.all(requests);

    const modelResponses = responses.map(resp => {
      return resp.response?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    });
    
    // Check if any of the responses came back empty.
    if (modelResponses.includes(null)) {
        console.error('Warning: At least one model response was empty or in an unexpected format.', JSON.stringify(responses, null, 2));
    }

    console.log('Successfully received all responses from model endpoint.');
    // Send back an array of responses.
    res.status(200).send({ responses: modelResponses });

  } catch (error) {
    console.error('Error calling Vertex AI API:', error);
    res.status(500).send({ error: 'An internal server error occurred while contacting the Vertex AI model.' });
  }
});



export default router;


