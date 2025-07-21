import { env } from '../../config/env-config.js'
import { authService } from '../services/auth-service.js'
import { loginSchema } from '../validators/auth-validator.js'
import { sendResponse } from '../../common/helpers/responseHandler-helper.js'
import { handleZodValidation } from '../../common/utils/validationZod-util.js'

export class AuthController {
	static async login(req, res) {
		try {
			const validation = handleZodValidation(loginSchema, req.body)
			if (!validation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					error: {
						details: validation.errors,
					},
				})
			}

			const { cedula, clave, tipo } = validation.data
			const session = await authService.login(cedula, clave, tipo)

			AuthController._setAuthCookies(res, session)

			return sendResponse(res, {
				statusCode: 200,
				message: 'Login exitoso',
				data: { tipo },
			})
		} catch (error) {
			console.log(error)
			return sendResponse(res, {
				statusCode: error.statusCode || 500,
				message: error.message,
			})
		}
	}

	static async logout(req, res) {
		try {
			const { refreshToken, accessToken } = req.cookies

			if (!refreshToken || !accessToken) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'No hay sesión activa',
				})
			}

			await authService.logout(refreshToken, accessToken)

			// Limpiar cookies
			res.clearCookie('accessToken')
			res.clearCookie('refreshToken')

			return sendResponse(res, {
				statusCode: 200,
				message: 'Logout exitoso',
			})
		} catch (error) {
			console.error('Error en logout:', error)
			return sendResponse(res, {
				statusCode: error.code || 500,
				message: error.message || 'Error en el logout',
			})
		}
	}

	static async refreshToken(req, res) {
		try {
			const { refreshToken } = req.cookies

			if (!refreshToken) {
				return sendResponse(res, {
					statusCode: 401,
					message: 'No autorizado',
				})
			}

			const { accessToken, user, tipo } = await authService.refreshAccessToken(refreshToken)

			// Configurar nueva cookie de acceso
			res.cookie('accessToken', accessToken, {
				httpOnly: true,
				secure: env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge: 15 * 60 * 1000, // 15 minutos
			})

			return sendResponse(res, {
				statusCode: 200,
				data: { user, tipo },
				message: 'Token actualizado',
			})
		} catch (error) {
			console.error('Error al refrescar token:', error)
			return sendResponse(res, {
				statusCode: error.code || 500,
				message: error.message || 'Error al refrescar token',
				error: env.NODE_ENV === 'development' ? error.stack : undefined,
			})
		}
	}

	/**
	 * Métodos privados
	 */
	static _setAuthCookies(res, { accessToken, refreshToken }) {
		// Cookie para access token (15 minutos)
		res.cookie('accessToken', accessToken, {
			httpOnly: true,
			secure: env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 15 * 60 * 1000,
		})

		// Cookie para refresh token (7 días)
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000,
		})
	}
}

export const authController = new AuthController()
