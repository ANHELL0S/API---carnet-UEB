import { API_VS } from './common/constants/prefixAPi-const.js'

import qrRouter from './core/routes/qr-route.js'
import authRouter from './core/routes/auth-route.js'

export const setupRoutes = app => {
	app.use(API_VS + '/auth', authRouter)
	app.use(API_VS + '/qr', qrRouter)
}
