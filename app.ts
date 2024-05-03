import express from 'express'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import OpenAI from "openai"
import dotenv from "dotenv"

dotenv.config()
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY});

const app = express()
const port = 3000

app.use(express.json())

// Swagger options
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Swagger Example',
      version: '1.0.0',
      description: 'An example Express.js app with Swagger',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
  },
  apis: ['app.js'], // Path to the API file(s)
})

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

/**
 * @swagger
 * /api/descriptions:
 *   post:
 *     summary: Create a new data object
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               idProduct:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Data created successfully
 *       '400':
 *         description: Invalid request body
 */
app.post('/api/descriptions', async (req, res) => {
    const { description, idProduct } = req.body
  if (!description || !idProduct) {
    return res.status(400).json({ error: 'Invalid request body' })
  }
  const prompt = `voila une description:"${description}"\n` +
      `Est-ce que cette description est éthique ?\n` +
      `Est-ce que cette description est sexiste ?\n` +
      `Répond selon ce format JSON :\n` +
      `{ "isNotEthical":true/false\n` +
      ` "isSexist":true/false\n` +
      `   "reasons" : [\n` +
      `      "raison 1",\n` +
      `      "raison 2"]\n` +
      `}`
  const response = await openai.chat.completions.create({
    messages: [{"role": "user", "content": prompt}],
    model: "gpt-3.5-turbo",
    temperature: 0.5
  })

  let result = "ok"

  if (response.choices[0].message.content) {
    const jsonResponse = JSON.parse(response.choices[0].message.content as string)
    const data = { idProduct, ...jsonResponse, description }
    database.push(data)
    result = data
  }

  res.status(200).json(result)
})

/**
 * @swagger
 * /api/descriptions:
 *   get:
 *     summary: Get a new data object
 *     responses:
 *       '200':
 *         description: Get data successfully
 *       '400':
 *         description: Invalid request body
 */
app.get('/api/descriptions', (req, res) => {
  console.log('Received Get')
  res.status(200).json(database)
})

const database: object[] = []

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})