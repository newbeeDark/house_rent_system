import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import apiRoutes from './routes/api'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './docs'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json({ limit: '2mb' }))

app.get('/health', (_, res) => res.json({ ok: true }))

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use('/api', apiRoutes)

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'internal_server_error' })
})

const port = Number(process.env.PORT || 3001)
app.listen(port, () => {
  console.log(`🚀 Supabase backend running on port ${port}`)
})

export default app