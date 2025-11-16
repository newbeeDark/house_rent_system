import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import auth, { authMiddleware } from './routes/auth'
import properties from './routes/properties'
import upload from './routes/upload'
import path from 'path'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.get('/health', (_, res) => res.json({ ok: true }))
app.use('/auth', auth)
app.use('/api/properties', properties)
app.use('/api/upload', upload)

app.get('/api/profile', authMiddleware, (req, res) => {
  res.json({ message: 'This is a protected route', user: (req as any).user })
})

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

const port = Number(process.env.PORT || 4000)
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`)
})