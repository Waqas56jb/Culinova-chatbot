import { createApp } from './app.js'
import { env } from './config/env.js'

const app = createApp()

app.listen(env.PORT, () => {
  console.log(`Culinova server running on http://localhost:${env.PORT}`)
  console.log(`Health: http://localhost:${env.PORT}/api/health`)
  console.log(`Chat:   POST http://localhost:${env.PORT}/api/chat`)
  console.log(`Model:  ${env.OPENAI_MODEL}`)
})
