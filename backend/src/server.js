import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: 'http://localhost:5173',
}))

app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    mensaje: 'Backend funcionando correctamente',
  })
})

app.get('/api/productos', (req, res) => {
  res.json([
    {
      id: 1,
      nombre: 'Notebook Lenovo IdeaPad',
      categoria: 'Notebook',
      precio: 599990,
      stock: 10,
    },
    {
      id: 2,
      nombre: 'Mouse Logitech Inalámbrico',
      categoria: 'Accesorios',
      precio: 29990,
      stock: 25,
    },
    {
      id: 3,
      nombre: 'Monitor Samsung 27 pulgadas',
      categoria: 'Monitor',
      precio: 189990,
      stock: 8,
    },
  ])
})

app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`)
})