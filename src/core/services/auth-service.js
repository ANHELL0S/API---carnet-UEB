import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { Op } from 'sequelize'

import { env } from '../../config/env-config.js'
import { TYPE_USER } from '../../common/constants/typeUser-const.js'
import { getSafeCarnetSequelize, getSafeSianetSequelize } from '../../config/db/instances.js'

import { TokenModel } from '../models/carnet/token-model.js'
import { UsuariosModel } from '../models/sianet/usuarios-model.js'
import { ThPersonalModel } from '../models/sianet/th_personal-model.js'
import { SmeEstuClaveModel } from '../models/sianet/sme_estu_clave-model.js'
import { UsuariosSistemasModel } from '../models/sianet/usuarios_sistemas-model.js'

class AuthService {
	constructor() {
		this.sequelizeCarnet = null
		this.sequelizeSianet = null
		this.tokenModel = null
		this.thPersonalModel = null
		this.usuariosModel = null
		this.UsuariosSistemasModel = null
		this.estuClaveModel = null
		this.initialized = false
	}

	async initialize() {
		if (this.initialized) return

		try {
			this.sequelizeCarnet = await getSafeCarnetSequelize()
			this.sequelizeSianet = await getSafeSianetSequelize()
			this.tokenModel = await TokenModel(this.sequelizeCarnet)
			this.thPersonalModel = await ThPersonalModel(this.sequelizeSianet)
			this.usuariosModel = await UsuariosModel(this.sequelizeSianet)
			this.usuariosSistemasModel = await UsuariosSistemasModel(this.sequelizeSianet)
			this.estuClaveModel = await SmeEstuClaveModel(this.sequelizeSianet)
			this.initialized = true
		} catch (error) {
			throw new Error(`Service initialization failed: ${error.message}`)
		}
	}

	async login(cedula, clave, tipo) {
		try {
			await this.initialize()

			let session
			switch (tipo) {
				case TYPE_USER.USUARIO:
					session = await this._loginUsuario(cedula, clave)
					break
				case TYPE_USER.ESTUDIANTE:
					session = await this._loginEstudiante(cedula, clave)
					break
				default:
					throw { statusCode: 400, message: 'Tipo de usuario no válido' }
			}

			return this._generateAuthTokens(session, tipo)
		} catch (error) {
			console.error('❌ Error in login:', error)
			throw error
		}
	}

	async logout(refreshToken, accessToken) {
		await this.initialize()

		const decodedAccess = jwt.verify(accessToken, env.JWT.SECRET)

		const cedula = decodedAccess.user.session.user.cedula

		await this.tokenModel.update(
			{ used: true },
			{
				where: {
					[Op.or]: [
						// Tokens específicos de esta sesión
						{ token: { [Op.in]: [refreshToken, accessToken] } },
						// Todos los tokens activos del usuario
						{
							cl_fk: cedula,
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

		const decoded = jwt.verify(refreshToken, env.JWT_SECRET)
		if (decoded.type !== 'refresh') throw { statusCode: 401, message: 'Token inválido' }

		const tokenRecord = await this.tokenModel.findOne({
			where: {
				token: refreshToken,
				used: false,
				expires_at: { [Op.gt]: new Date() },
			},
		})

		if (!tokenRecord) {
			throw { statusCode: 401, message: 'Token inválido o expirado' }
		}

		const accessToken = jwt.sign(
			{
				cedula: decoded.cedula,
				tipo: decoded.tipo,
				type: 'access',
			},
			env.JWT.SECRET,
			{ expiresIn: env.JWT.EXPIRED }
		)

		await this.tokenModel.create({
			token: accessToken,
			cl_fk: decoded.cedula,
			token_type: 'access',
			expires_at: new Date(Date.now() + 15 * 60 * 1000),
			used: false,
		})

		return {
			accessToken,
			user: {
				cedula: decoded.cedula,
				nombres: decoded.nombres,
				apellidos: decoded.apellidos,
				email: decoded.email,
			},
			tipo: decoded.tipo,
		}
	}

	/**
	 * Métodos privados
	 */
	async _generateAuthTokens(session, tipo) {
		const accessToken = jwt.sign(
			{
				session,
				type: 'access',
			},
			env.JWT.SECRET,
			{ expiresIn: env.JWT.EXPIRED }
		)

		const refreshToken = jwt.sign(
			{
				user: {
					session,
					tipo: tipo,
				},
				type: 'access',
			},
			env.JWT.SECRET,
			{ expiresIn: env.JWT.REFRESH }
		)

		await this.tokenModel.create({
			token: accessToken,
			cl_fk: session.user.cedula,
			token_type: 'access',
			expires_at: new Date(Date.now() + 15 * 60 * 1000),
			used: false,
		})

		await this.tokenModel.create({
			token: refreshToken,
			cl_fk: session.user.cedula,
			token_type: 'refresh',
			expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			used: false,
		})

		return {
			accessToken,
			refreshToken,
		}
	}

	async _loginUsuario(cedula, clave) {
		try {
			const [usuario, usuarioSistema] = await Promise.all([
				this.usuariosModel.findByPk(cedula),
				this.usuariosSistemasModel.findByPk(cedula),
			])

			if (!usuario || !usuarioSistema || usuarioSistema.estado !== 'ACTIVO')
				throw { statusCode: 401, message: 'Credenciales inválidas' }

			const hashedClave = crypto.createHash('md5').update(clave).digest('hex')
			if (usuario.clave !== hashedClave) throw { statusCode: 401, message: 'Credenciales inválidas' }

			return {
				user: {
					cedula: usuario.ci_user,
					tipo: TYPE_USER.USUARIO,
					perfil: usuarioSistema.perfil,
				},
			}
		} catch (error) {
			console.error('❌ Error in _loginUsuario:', error)
			throw error
		}
	}

	async _loginEstudiante(cedula, clave) {
		const estudiante = await this.estuClaveModel.findOne({
			where: { cedula, estado: 'A' },
			order: [
				['fecha', 'DESC'],
				['hora', 'DESC'],
			],
		})

		if (!estudiante) throw { statusCode: 401, message: 'Credenciales inválidas' }

		const hashedClave = crypto.createHash('md5').update(clave).digest('hex')
		if (estudiante.clave !== hashedClave) throw { statusCode: 401, message: 'Credenciales inválidas' }

		return {
			user: {
				cedula: estudiante.cedula,
				tipo: TYPE_USER.ESTUDIANTE,
				perfil: TYPE_USER.ESTUDIANTE.toUpperCase(),
			},
		}
	}
}

export const authService = new AuthService()
