import qr from 'qr-image'
import crypto from 'crypto'
import { Op } from 'sequelize'
import { QrModel } from '../models/carnet/qr-model.js'
import { getSafeCarnetSequelize } from '../../config/db/instances.js'
import { TYPE_USER } from '../../common/constants/typeUser-const.js'
import { smeNuevosEstuService } from './smeNuevosEstu-service.js'
import { thPersonalService } from './thPersonal-service.js'
import { docenteService } from './docente-service.js'
import { usuariosSistemasService } from './usuariosSistemas-service.js'
import { env } from '../../config/env-config.js'

class QrService {
	constructor() {
		this.sequelize = null
		this.model = null
		this.initialized = false
	}

	async initialize() {
		if (this.initialized) return
		try {
			this.sequelize = await getSafeCarnetSequelize()
			this.model = await QrModel(this.sequelize)
			this.initialized = true
		} catch (error) {
			console.error('❌ Error initializing QrService:', error)
			throw new Error(`Service initialization failed: ${error.message}`)
		}
	}

	async generateQRCode(userData) {
		try {
			await this.initialize()

			// Verificar QR activo para esta cédula Y tipo específico
			const existingQr = await this.model.findOne({
				where: {
					cl_fk: userData.cedula,
					user_type: userData.tipo,
					user_system: userData.perfil,
					[Op.and]: [{ is_expired: false }, { expiration_date: { [Op.gt]: new Date() } }],
				},
			})

			if (existingQr) {
				const error = new Error(`Ya tiene un QR activo como ${existingQr.user_type}:${existingQr.user_system}`)
				error.statusCode = 409
				error.existingQr = {
					id: existingQr.id,
					qr_image: existingQr.qr_image,
					cl_fk: userData.cedula,
					user_type: existingQr.user_type,
					user_system: existingQr.user_system,
					expiration_date: existingQr.expiration_date,
					is_expired: existingQr.is_expired,
				}
				throw error
			}

			// Generar nuevo QR
			const qrId = crypto.randomUUID()
			const frontendUrl = env.URL_FRONTED
			const qrUrl = `${frontendUrl}/verify/${qrId}`

			const qrImage = qr.imageSync(qrUrl, { type: 'png' })
			const qrImageBase64 = qrImage.toString('base64')

			// Calcular fecha de expiración (24 horas desde ahora)
			const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas en milisegundos

			const qrRecord = await this.model.create({
				id: qrId,
				qr_image: qrImageBase64,
				cl_fk: userData.cedula,
				user_type: userData.tipo,
				user_system: userData.perfil,
				expiration_date: expirationDate,
				is_expired: false,
			})

			return {
				id: qrRecord.id,
				qr_image: qrImageBase64,
				cl_fk: userData.cedula,
				user_type: userData.tipo,
				user_system: userData.perfil,
				expiration_date: qrRecord.expiration_date,
				is_expired: qrRecord.is_expired,
			}
		} catch (error) {
			console.error('Error en created qr:', error)
			throw error
		}
	}

	async getAllQrCodes({ page = 1, limit = 10, search = '' }) {
		await this.initialize()

		try {
			const where = {}

			if (search) where[Op.or] = [{ cl_fk: { [Op.like]: `%${search}%` } }]

			const result = await this.model.findAndCountAll({
				where,
				limit: parseInt(limit),
				offset: (parseInt(page) - 1) * parseInt(limit),
				order: [['createdAt', 'DESC']],
				paranoid: true,
			})

			return {
				data: result.rows,
				pagination: {
					currentPage: parseInt(page),
					perPage: parseInt(limit),
					totalItems: result.count,
					totalPages: Math.ceil(result.count / limit),
					hasNextPage: page * limit < result.count,
					hasPreviousPage: page > 1,
				},
			}
		} catch (error) {
			console.error('Error en getAllQrCodes:', error)
			throw {
				statusCode: 500,
				message: 'Error al obtener los códigos QR',
			}
		}
	}

	async findById(id, options = {}) {
		await this.initialize()

		try {
			const qrRecord = await this.model.findByPk(id, {
				paranoid: true,
			})

			if (!qrRecord) {
				throw {
					statusCode: 404,
					message: 'Código QR no encontrado',
				}
			}

			// Si se solicita incluir datos del usuario
			if (options.includeUserData) {
				try {
					switch (qrRecord.user_type) {
						case TYPE_USER.ESTUDIANTE:
							userInfo = await smeNuevosEstuService.getById(qrRecord.cl_fk)
							break
						case TYPE_USER.USUARIO:
							userInfo = await usuariosSistemasService.findByFields({ ci_user: qrRecord.cl_fk })
							break
						default:
							userInfo = null
					}
				} catch (userError) {
					console.error('Error obteniendo datos del usuario:', userError)
				}

				// Convertir a objeto plano para incluir datos adicionales
				const result = qrRecord.get({ plain: true })

				return result
			}

			return qrRecord
		} catch (error) {
			console.error('Error en findById:', error)
			throw {
				statusCode: error.statusCode || 500,
				message: error.message || 'Error al buscar el código QR',
			}
		}
	}
}

export const qrService = new QrService()
