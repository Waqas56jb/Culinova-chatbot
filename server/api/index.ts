/** Vercel serverless entry: exports the Express app as the handler. */
import { createApp } from '../src/app.js'

const app = createApp()

export default app
