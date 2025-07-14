import jwt from 'jsonwebtoken'
import { env } from '../config/env-config.js'
import { TokenModel } from '../core/models/carnet/token-model.js'
import { getSafeCarnetSequelize } from '../config/db/instances.js'
import { sendResponse } from '../common/helpers/responseHandler-helper.js'

export const Auth = async (req, res, next) => {
	const sequelize = await getSafeCarnetSequelize()
	const tokenModel = await TokenModel(sequelize)

	try {
		const accessToken = req.cookies.accessToken

		if (!accessToken) {
			return sendResponse(res, {
				statusCode: 401,
				message: 'Acceso no autorizado',
			})
		}

		const tokenRecord = await tokenModel.findOne({
			where: {
				token: accessToken,
				used: false,
				token_type: 'access',
			},
		})

		if (!tokenRecord) {
			return sendResponse(res, {
				statusCode: 401,
				message: 'Acceso no autorizado',
			})
		}

		if (new Date() > tokenRecord.expires_at) {
			return sendResponse(res, {
				statusCode: 401,
				message: 'Acceso no autorizado',
			})
		}

		const decoded = jwt.verify(accessToken, env.JWT.SECRET)

		if (!decoded.session.user.cedula || !decoded.session.user.tipo || !decoded.session.user.perfil) {
			return sendResponse(res, {
				statusCode: 401,
				message: 'Acceso no autorizado',
			})
		}

		// Añadir la información del usuario al request
		req.user = {
			type: decoded.type, // Tipo de token
			cedula: decoded.session.user.cedula,
			tipo: decoded.session.user.tipo,
			perfil: decoded.session.user.perfil,
		}

		next()
	} catch (error) {
		console.error('Error en middleware de autenticación:', error)

		let statusCode = 500
		let message = 'Error en el servidor'

		if (error.name === 'JsonWebTokenError') {
			statusCode = 401
			message = 'Acceso no autorizado'
		} else if (error.name === 'TokenExpiredError') {
			statusCode = 401
			message = 'Acceso no autorizado'
		}

		return sendResponse(res, {
			statusCode,
			message,
		})
	}
}
