import { Op } from 'sequelize'
import { getSafeSianetSequelize } from '../../config/db/instances.js'
import { SmeNuevosEstuModel } from '../models/sianet/sme_nuevos_estu-model.js'
import { SmeNuevosEstu25Model } from '../models/sianet/sme_nuevos_estu25-model.js'

class SmeNuevosEstuService {
	constructor() {
		this.sequelize = null
		this.model = null
		this.model25 = null
		this.initialized = false
	}

	async initialize() {
		if (this.initialized) return

		try {
			this.sequelize = await getSafeSianetSequelize()
			this.model = await SmeNuevosEstuModel(this.sequelize)
			this.model25 = await SmeNuevosEstu25Model(this.sequelize)
			this.initialized = true
		} catch (error) {
			console.error('❌ Error initializing SmeNuevosEstuService:', error)
			throw new Error(`Service initialization failed: ${error.message}`)
		}
	}

	async getAll({ page = 1, limit = 10, search = '' }) {
		try {
			await this.initialize()

			const where = search
				? {
						[Op.or]: [
							{ cedula: { [Op.like]: `%${search}%` } },
							{ nombres: { [Op.like]: `%${search}%` } },
							{ apellidos: { [Op.like]: `%${search}%` } },
							{ email: { [Op.like]: `%${search}%` } },
						],
				  }
				: {}

			// Realizar búsquedas en paralelo
			const [result1, result2] = await Promise.all([
				this.model.findAndCountAll({
					where,
					limit: parseInt(limit),
					offset: (parseInt(page) - 1) * parseInt(limit),
					order: [['cedula', 'ASC']],
				}),
				this.model25.findAndCountAll({
					where,
					limit: parseInt(limit),
					offset: (parseInt(page) - 1) * parseInt(limit),
					order: [['cedula', 'ASC']],
				}),
			])

			// Combinar resultados
			return {
				count: result1.count + result2.count,
				rows: [...result1.rows, ...result2.rows],
			}
		} catch (error) {
			console.error('❌ Error in searchInBothModels:', error)
			throw error
		}
	}

	async getById(cedula) {
		await this.initialize()
		try {
			const [record, record25] = await Promise.all([
				this.model.findOne({ where: { cedula } }),
				this.model25.findOne({ where: { cedula } }),
			])

			if (!record && !record25) {
				throw {
					statusCode: 404,
					message: 'Estudiante no encontrado en ninguna tabla',
				}
			}

			return record || record25
		} catch (error) {
			console.error('Error getting student by cedula:', error)
			throw {
				statusCode: error.statusCode || 500,
				message: error.message || 'Error al buscar estudiante',
			}
		}
	}

	async findByFields(fields = {}, options = {}) {
		try {
			await this.initialize()

			const defaultOptions = {
				exactMatch: false,
				...options,
			}

			const where = {}

			for (const [field, value] of Object.entries(fields)) {
				if (value !== undefined && value !== null && value !== '') {
					if (defaultOptions.exactMatch) {
						where[field] = value
					} else {
						where[field] = {
							[Op.like]: `%${value}%`,
						}
					}
				}
			}

			const [result1, result2] = await Promise.all([this.model.findOne({ where }), this.model25.findOne({ where })])

			return result1 || result2
		} catch (error) {
			console.error('❌ Error in findOneByAnyFieldInBoth:', error)
			throw error
		}
	}
}

export const smeNuevosEstuService = new SmeNuevosEstuService()
