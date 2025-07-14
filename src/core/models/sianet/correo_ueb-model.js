import { DataTypes } from 'sequelize'
import { getSafeSianetSequelize } from '../../../config/db/instances.js'

export const CorreoUebModel = async () => {
	try {
		const sequelize = await getSafeSianetSequelize()

		return sequelize.define(
			'correoUeb',
			{
				email: {
					type: DataTypes.STRING(12),
					primaryKey: true,
					allowNull: false,
				},
				first: {
					type: DataTypes.STRING(255),
					allowNull: false,
				},
				last: {
					type: DataTypes.STRING(255),
					allowNull: false,
				},
				estado: {
					type: DataTypes.STRING(50),
					defaultValue: 'Active',
					allowNull: false,
				},
				zoom: {
					type: DataTypes.SMALLINT,
					allowNull: true,
					defaultValue: 0,
				},
			},
			{
				tableName: 'correo_ueb',
				timestamps: false,
				indexes: [
					// Índice para búsqueda por nombre (first)
					{
						name: 'idx_correo_ueb_first',
						fields: ['first'],
						using: 'BTREE',
					},
					// Índice para búsqueda por apellido (last)
					{
						name: 'idx_correo_ueb_last',
						fields: ['last'],
						using: 'BTREE',
					},
					// Índice compuesto para búsquedas por nombre y apellido
					{
						name: 'idx_correo_ueb_first_last',
						fields: ['first', 'last'],
						using: 'BTREE',
					},
					// Índice para el campo estado (útil para filtros)
					{
						name: 'idx_correo_ueb_estado',
						fields: ['estado'],
						using: 'BTREE',
					},
					// Índice para el campo zoom si se usará en filtros
					{
						name: 'idx_correo_ueb_zoom',
						fields: ['zoom'],
						using: 'BTREE',
					},
					// Índice único para la combinación first+last (opcional)
					{
						name: 'idx_correo_ueb_unique_name',
						fields: ['first', 'last'],
						using: 'BTREE',
					},
				],
			}
		)
	} catch (error) {
		throw new Error(`Error en correo_UebModel: ${error.message}`)
	}
}
