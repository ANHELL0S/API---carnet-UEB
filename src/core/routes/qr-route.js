import { Router } from 'express'
import { Auth } from '../../middleware/auth-middleware.js'
import { AuthAdmin } from '../../middleware/authAdmin-middleware.js'

import { QrController } from '../controllers/qr-controller.js'
import { limiterRequest } from '../../middleware/rateLimit-middleware.js'

const router = Router()

// RUTAS GENERAL
// Generar nuevo QR
router.post('/', limiterRequest({ maxRequests: 45, time: '1m' }), Auth, QrController.createQrCode)

// Verificar QR y obtener datos
router.get('/verify/:id', limiterRequest({ maxRequests: 45, time: '1m' }), QrController.verifyQR)

// RUTAS ADMINISTRADOR
// Obtener todos los QRs
router.get('/', limiterRequest({ maxRequests: 45, time: '1m' }), AuthAdmin, QrController.getAllQrCodes)

// Obtener QR por ID
router.get('/:id', limiterRequest({ maxRequests: 45, time: '1m' }), AuthAdmin, QrController.getQrById)
export default router
