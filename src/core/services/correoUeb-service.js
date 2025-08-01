import { Op } from 'sequelize'
import { getSafeSianetSequelize } from '../../config/db/instances.js'
import { CorreoUebModel } from '../models/sianet/correo_ueb-model.js'

class CorreoUebService {
	constructor() {
		this.sequelize = null
		this.model = null
		this.initialized = false
	}

	async initialize() {
		if (this.initialized) return

		try {
			this.sequelize = await getSafeSianetSequelize()
			this.model = await CorreoUebModel(this.sequelize)
			this.initialized = true
		} catch (error) {
			console.error('❌ Error initializing CorreoUebService:', error)
			throw new Error(`Service initialization failed: ${error.message}`)
		}
	}

	async getAll({ page = 1, limit = 10, search = '' }) {
		try {
			await this.initialize()

			const where = search
				? {
						[Op.or]: [
							{ email: { [Op.like]: `%${search}%` } },
							{ first: { [Op.like]: `%${search}%` } },
							{ last: { [Op.like]: `%${search}%` } },
						],
				  }
				: {}

			return await this.model.findAndCountAll({
				where,
				limit: parseInt(limit),
				offset: (parseInt(page) - 1) * parseInt(limit),
				order: [['email', 'ASC']],
			})
		} catch (error) {
			console.error('❌ Error in getAll:', error)
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

			return await this.model.findOne({ where })
		} catch (error) {
			console.error('❌ Error in findByFields:', error)
			throw error
		}
	}
}

export const correoUebService = new CorreoUebService()
