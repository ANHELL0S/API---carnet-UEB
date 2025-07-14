import jwt from 'jsonwebtoken'
import { Op } from 'sequelize'
import { TokenModel } from '../core/models/carnet/token-model.js'
import { getSafeCarnetSequelize } from '../config/db/instances.js'
import { sendResponse } from '../common/helpers/responseHandler-helper.js'
import { env } from '../config/env-config.js'

export const AuthAdmin = async (req, res, next) => {
	const sequelize = await getSafeCarnetSequelize()
	const tokenModel = await TokenModel(sequelize)

	try {
		const adminAccessToken = req.cookies.adminAccessToken

		if (!adminAccessToken) {
			return sendResponse(res, {
				statusCode: 401,
				message: 'Acceso no autorizado',
			})
		}

		const tokenRecord = await tokenModel.findOne({
			where: {
				token: adminAccessToken,
				used: false,
				token_type: 'access',
				expires_at: { [Op.gt]: new Date() },
			},
		})

		if (!tokenRecord) {
			return sendResponse(res, {
				statusCode: 401,
				message: 'Acceso no autorizado',
			})
		}

		const decoded = jwt.verify(adminAccessToken, env.JWT.SECRET)

		req.admin = {
			id: decoded.user.id,
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
