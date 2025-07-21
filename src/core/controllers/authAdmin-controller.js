import { env } from '../../config/env-config.js'
import { authAdminService } from '../services/authAdmin-service.js'
import { loginAdminSchema } from '../validators/authAdmin-validator.js'
import { sendResponse } from '../../common/helpers/responseHandler-helper.js'
import { handleZodValidation } from '../../common/utils/validationZod-util.js'

export class AuthAdminController {
	static async login(req, res) {
		try {
			const validation = handleZodValidation(loginAdminSchema, req.body)
			if (!validation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					error: validation.errors,
				})
			}

			const { identification_card, password } = validation.data

			const session = await authAdminService.login(identification_card, password)

			// Configurar cookies seguras
			AuthAdminController._setAuthCookies(res, session)

			return sendResponse(res, {
				statusCode: 200,
				message: 'Login de administrador exitoso',
			})
		} catch (error) {
			console.log(error)
			return sendResponse(res, {
				statusCode: error.statusCode || 500,
				message: error.message || 'Error en el login de administrador',
			})
		}
	}

	static async logout(req, res) {
		try {
			const { adminRefreshToken, adminAccessToken } = req.cookies

			if (!adminRefreshToken || !adminAccessToken) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'No hay sesión activa',
				})
			}

			await authAdminService.logout(adminRefreshToken, adminAccessToken)

			// Limpiar cookies específicas de administrador
			res.clearCookie('adminAccessToken')
			res.clearCookie('adminRefreshToken')

			return sendResponse(res, {
				statusCode: 200,
				message: 'Logout de administrador exitoso',
			})
		} catch (error) {
			console.error('Error en logout de administrador:', error)
			return sendResponse(res, {
				statusCode: error.code || 500,
				message: error.message || 'Error en el logout de administrador',
			})
		}
	}

	static async refreshToken(req, res) {
		try {
			const { adminRefreshToken } = req.cookies

			if (!adminRefreshToken) {
				return sendResponse(res, {
					statusCode: 401,
					message: 'No autorizado - Token de administrador faltante',
				})
			}

			const { accessToken } = await authAdminService.refreshAccessToken(adminRefreshToken)

			// Configurar nueva cookie de acceso para administrador
			res.cookie('adminAccessToken', accessToken, {
				httpOnly: true,
				secure: env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge: 15 * 60 * 1000, // 15 minutos
			})

			return sendResponse(res, {
				statusCode: 200,
				message: 'Token de administrador actualizado',
			})
		} catch (error) {
			console.error('Error al refrescar token de administrador:', error)
			return sendResponse(res, {
				statusCode: error.code || 500,
				message: error.message || 'Error al refrescar token de administrador',
			})
		}
	}

	/**
	 * Métodos privados para administradores
	 */
	static _setAuthCookies(res, session) {
		// Cookie para access token de administrador (15 minutos)
		res.cookie('adminAccessToken', session.adminAccessToken, {
			httpOnly: true,
			secure: env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 15 * 60 * 1000,
			path: '/', // Ruta específica para administradores
		})

		// Cookie para refresh token de administrador (7 días)
		res.cookie('adminRefreshToken', session.adminRefreshToken, {
			httpOnly: true,
			secure: env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000,
			path: '/', // Ruta específica para administradores
		})
	}
}

export const authAdminController = new AuthAdminController()
