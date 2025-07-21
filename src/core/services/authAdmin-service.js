import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Op } from 'sequelize'

import { env } from '../../config/env-config.js'
import { TokenModel } from '../models/carnet/token-model.js'
import { AdminModel } from '../models/carnet/admin-model.js'
import { getSafeCarnetSequelize } from '../../config/db/instances.js'

class AuthAdminService {
	constructor() {
		this.sequelizeCarnet = null
		this.tokenModel = null
		this.adAdminModel = null
		this.initialized = false
	}

	async initialize() {
		if (this.initialized) return

		try {
			this.sequelizeCarnet = await getSafeCarnetSequelize()
			this.tokenModel = await TokenModel(this.sequelizeCarnet)
			this.adAdminModel = await AdminModel(this.sequelizeCarnet)
			this.initialized = true
		} catch (error) {
			throw new Error(`AuthAdminService initialization failed: ${error.message}`)
		}
	}

	async login(identification_card, password) {
		await this.initialize()

		const admin = await this.adAdminModel.findOne({
			where: {
				identification_card,
				active: true,
			},
		})

		if (!admin) {
			throw {
				statusCode: 401,
				message: 'Credenciales inválidas o cuenta inactiva',
			}
		}

		const isValid = await bcrypt.compare(password, admin.password)
		if (!isValid) {
			throw {
				statusCode: 401,
				message: 'Credenciales inválidas',
			}
		}

		return this._generateAuthTokens(admin)
	}

	async logout(adminRefreshToken, adminAccessToken) {
		await this.initialize()

		await this.tokenModel.update(
			{ used: true },
			{
				where: {
					[Op.or]: [
						// Tokens específicos de esta sesión
						{ token: { [Op.in]: [adminRefreshToken, adminAccessToken] } },
						// Todos los tokens activos del usuario
						{
							cl_fk: 'ADMIN',
							used: false,
							token_type: { [Op.in]: ['access', 'refresh'] },
						},
					],
				},
			}
		)
	}

	async refreshAccessToken(refreshToken) {
		await this.initialize()

		const decoded = jwt.verify(refreshToken, env.JWT.SECRET)

		if (decoded.type !== 'refresh') {
			throw {
				statusCode: 401,
				message: 'Token inválido',
			}
		}

		const tokenRecord = await this.tokenModel.findOne({
			where: {
				token: refreshToken,
				used: false,
				expires_at: { [Op.gt]: new Date() },
			},
		})

		if (!tokenRecord) {
			throw {
				statusCode: 401,
				message: 'Token inválido o expirado',
			}
		}

		const admin = await this.adAdminModel.findByPk(decoded.user.id)
		if (!admin) {
			throw {
				statusCode: 404,
				message: 'Administrador no encontrado',
			}
		}

		return this._generateAccessToken(admin)
	}

	/**
	 * Métodos privados
	 */
	async _generateAuthTokens(admin) {
		const accessToken = this._generateToken(admin, '15m', 'access')
		const refreshToken = this._generateToken(admin, '7d', 'refresh')

		await Promise.all([
			this._saveToken(accessToken, admin.identification_card, 'access'),
			this._saveToken(refreshToken, admin.identification_card, 'refresh'),
		])

		return {
			adminAccessToken: accessToken,
			adminRefreshToken: refreshToken,
			user: {
				id: admin.id,
			},
		}
	}

	async _generateAccessToken(admin) {
		const accessToken = this._generateToken(admin, '15m', 'access')
		await this._saveToken(accessToken, admin.identification_card, 'access')

		return {
			accessToken,
			user: {
				id: admin.id,
			},
		}
	}

	_generateToken(admin, expiresIn, type) {
		return jwt.sign(
			{
				user: {
					id: admin.id,
				},
				type,
			},
			env.JWT.SECRET,
			{ expiresIn }
		)
	}

	async _saveToken(token, identification_card, token_type) {
		const expires_at = new Date(
			Date.now() +
				(token_type === 'access'
					? 15 * 60 * 1000 // 15 minutos
					: 7 * 24 * 60 * 60 * 1000) // 7 días
		)

		await this.tokenModel.create({
			token,
			cl_fk: 'ADMIN',
			token_type,
			expires_at,
			used: false,
		})
	}
}

export const authAdminService = new AuthAdminService()
