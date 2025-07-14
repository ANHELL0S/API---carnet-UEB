import { Op } from 'sequelize'
import { getSafeSianetSequelize } from '../../config/db/instances.js'
import { UsuariosSistemasModel } from '../models/sianet/usuarios_sistemas-model.js'

class UsuariosSistemasService {
	constructor() {
		this.sequelize = null
		this.model = null
		this.initialized = false
	}

	async initialize() {
		if (this.initialized) return

		try {
			this.sequelize = await getSafeSianetSequelize()
			this.model = await UsuariosSistemasModel(this.sequelize)
			this.initialized = true
		} catch (error) {
			console.error('❌ Error initializing UsuariosSistemasService:', error)
			throw new Error(`Service initialization failed: ${error.message}`)
		}
	}

	async findByFields(fields = {}, options = {}) {
		try {
			await this.initialize()

			let where = {}
			const searchValue = options.search?.trim()

			// Búsqueda general (search)
			if (searchValue) {
				const conditions = []

				// Campos de texto
				conditions.push(
					{ ci_user: { [Op.iLike]: `%${searchValue}%` } },
					{ perfil: { [Op.iLike]: `%${searchValue}%` } },
					{ estado: { [Op.iLike]: `%${searchValue}%` } },
					{ cod_carr: { [Op.iLike]: `%${searchValue}%` } }
				)

				// Campos numéricos (solo si el search es numérico)
				if (/^\d+$/.test(searchValue)) {
					const numericValue = parseInt(searchValue)
					conditions.push({ cod_sis: numericValue }, { cod_fac: numericValue }, { cod_esc: numericValue })
				}

				where = { [Op.or]: conditions }
			}

			// Añadir filtros específicos si existen
			for (const [field, value] of Object.entries(fields)) {
				if (value !== undefined && value !== null && value !== '') {
					if (['cod_sis', 'cod_fac', 'cod_esc'].includes(field)) {
						const numValue = parseInt(value)
						where[field] = options.exactMatch
							? numValue
							: {
									[Op.between]: [numValue, numValue + 999],
							  }
					} else {
						where[field] = options.exactMatch
							? value
							: {
									[Op.iLike]: `%${value}%`,
							  }
					}
				}
			}

			// Si no hay condiciones de búsqueda, devolver todos los resultados (paginados)
			if (Object.keys(where).length === 0) {
				where = {} // Condición vacía para obtener todos los registros
			}

			// Ejecutar consulta
			if (options.findAll) {
				return await this.model.findAndCountAll({
					where,
					limit: options.limit,
					offset: options.offset,
					order: [
						['ci_user', 'ASC'],
						['cod_sis', 'ASC'],
					],
				})
			}

			return await this.model.findOne({
				where,
				order: [
					['ci_user', 'ASC'],
					['cod_sis', 'ASC'],
				],
			})
		} catch (error) {
			console.error('❌ Error in findByFields:', error)
			throw new Error(`Error al buscar registros: ${error.message}`)
		}
	}
}

export const usuariosSistemasService = new UsuariosSistemasService()
