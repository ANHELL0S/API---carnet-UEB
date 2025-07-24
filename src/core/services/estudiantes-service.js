import { Op } from 'sequelize'
import { getSafeSianetSequelize } from '../../config/db/instances.js'
import { EstudiantesModel } from '../models/sianet/estudiantes-model.js'

class EstudiantesService {
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
			this.model = await EstudiantesModel(this.sequelize)
			this.initialized = true
		} catch (error) {
			console.error('❌ Error initializing EstudiantesService:', error)
			throw new Error(`Service initialization failed: ${error.message}`)
		}
	}

	async getAll({ page = 1, limit = 10, search = '' }) {
		try {
			await this.initialize()

			const where = search
				? {
						[Op.or]: [
							{ ced_est: { [Op.like]: `%${search}%` } },
							{ nom_est: { [Op.like]: `%${search}%` } },
							{ apell_est: { [Op.like]: `%${search}%` } },
							{ email: { [Op.like]: `%${search}%` } },
						],
				  }
				: {}

			// Realizar búsquedas
			const result = await this.model.findAndCountAll({
				where,
				limit: parseInt(limit),
				offset: (parseInt(page) - 1) * parseInt(limit),
				order: [['cedula', 'ASC']],
			})

			return {
				count: result.count,
				rows: result.rows,
			}
		} catch (error) {
			console.error('❌ Error in searchInBothModels:', error)
			throw error
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

			const result = await this.model.findOne({ where })

			return result
		} catch (error) {
			console.error('❌ Error in findOneByAnyFieldInBoth:', error)
			throw error
		}
	}
}

export const estudiantesService = new EstudiantesService()
