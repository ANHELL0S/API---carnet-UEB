import { DataTypes, Op } from 'sequelize'
import { getSafeSianetSequelize } from '../../../config/db/instances.js'

export const SmeEstuClaveModel = async () => {
	try {
		const sequelize = await getSafeSianetSequelize()

		return sequelize.define(
			'smeEstuClave',
			{
				cedula: {
					type: DataTypes.STRING(12),
					primaryKey: true,
					allowNull: false,
				},
				nick: {
					type: DataTypes.STRING(64),
					allowNull: true,
					index: true,
				},
				clave: {
					type: DataTypes.STRING(64),
					allowNull: true,
				},
				fecha: {
					type: DataTypes.DATEONLY,
					allowNull: true,
					index: true,
				},
				hora: {
					type: DataTypes.STRING(25),
					allowNull: true,
				},
				estado: {
					type: DataTypes.STRING(5),
					allowNull: false,
					defaultValue: 'A',
					index: true,
				},
				origen: {
					type: DataTypes.STRING(64),
					allowNull: true,
					index: true,
				},
			},
			{
				tableName: 'sme_estu_clave',
				timestamps: false,
				indexes: [
					// Índice compuesto para consultas frecuentes
					{
						name: 'idx_estado_fecha',
						fields: ['estado', 'fecha'],
					},
					// Índice condicional para nick único (solo cuando no es nulo)
					{
						name: 'idx_unique_nick_partial',
						fields: ['nick'],
						where: {
							nick: {
								[Op.ne]: null,
							},
						},
					},
					// Índice para búsqueda por múltiples campos
					{
						name: 'idx_search_fields',
						fields: ['cedula', 'nick', 'origen'],
					},
				],
			}
		)
	} catch (error) {
		throw new Error(`Error en SmeEstuClaveModel: ${error.message}`)
	}
}
