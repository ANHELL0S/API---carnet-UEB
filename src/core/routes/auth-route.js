import { Router } from 'express'

import { Auth } from '../../middleware/auth-middleware.js'
import { AuthController } from '../controllers/auth-controller.js'
import { AuthAdmin } from '../../middleware/authAdmin-middleware.js'
import { AuthAdminController } from '../controllers/authAdmin-controller.js'

import { limiterRequest } from '../../middleware/rateLimit-middleware.js'

const router = Router()

// RUTAS GENERAL
// Rutas públicas (no requieren autenticación)
router.post('/login', limiterRequest({ maxRequests: 7, time: '1m' }), AuthController.login)
router.post('/refresh-token', limiterRequest({ maxRequests: 3, time: '1m' }), AuthController.refreshToken)
// Rutas protegidas (requieren autenticación)
router.post('/logout', limiterRequest({ maxRequests: 3, time: '1m' }), Auth, AuthController.logout)

// RUTAS ADMINISTRADOR
// Rutas públicas (no requieren autenticación)
router.post('/admin/login', limiterRequest({ maxRequests: 7, time: '1m' }), AuthAdminController.login)
router.post(
	'/admin/refresh-token',
	limiterRequest({ maxRequests: 3, time: '1m' }),
	AuthAdmin,
	AuthAdminController.refreshToken
)
// Rutas protegidas (requieren autenticación)
router.post('/admin/logout', limiterRequest({ maxRequests: 3, time: '1m' }), AuthAdmin, AuthAdminController.logout)

export default router
