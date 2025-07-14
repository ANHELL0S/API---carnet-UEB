import { DataTypes } from 'sequelize'
import { getSafeSianetSequelize } from '../../../config/db/instances.js'

export const SmeNuevosEstu25Model = async () => {
	try {
		const sequelize = await getSafeSianetSequelize()

		return sequelize.define(
			'smeNuevosEstu25',
			{
				cedula: {
					type: DataTypes.STRING(11),
					primaryKey: true,
					allowNull: false,
				},
				nombres: {
					type: DataTypes.STRING(255),
					allowNull: false,
					index: true,
				},
				apellidos: {
					type: DataTypes.STRING(255),
					allowNull: false,
					index: true,
				},
				genero: {
					type: DataTypes.STRING(50),
					allowNull: false,
				},
				etnia: {
					type: DataTypes.STRING(255),
					allowNull: false,
				},
				celular: {
					type: DataTypes.STRING(11),
					allowNull: false,
				},
				email: {
					type: DataTypes.STRING(50),
					allowNull: false,
				},
				n_carr: {
					type: DataTypes.STRING(255),
					allowNull: false,
					index: true,
				},
				modalidad: {
					type: DataTypes.STRING(255),
					allowNull: false,
					index: true,
				},
				paralelo: {
					type: DataTypes.STRING(5),
					allowNull: false,
				},
				perdida: {
					type: DataTypes.BIGINT,
					allowNull: false,
				},
				profecional: {
					type: DataTypes.BIGINT,
					allowNull: false,
				},
				cod_carr: {
					type: DataTypes.BIGINT,
					allowNull: true,
					index: true,
				},
				periodo: {
					type: DataTypes.STRING(255),
					allowNull: true,
					index: true,
				},
				malla: {
					type: DataTypes.BIGINT,
					allowNull: true,
				},
			},
			{
				tableName: 'sme_nuevos_estu25',
				timestamps: false,
				indexes: [
					// Índices compuestos para consultas frecuentes
					{
						name: 'idx_estudiante_nombre_completo25',
						fields: ['nombres', 'apellidos'],
					},
					{
						name: 'idx_estudiante_carrera_periodo25',
						fields: ['cod_carr', 'periodo'],
					},
					// Índice para búsqueda full-text (depende del motor de BD)
					{
						name: 'idx_estudiante_fulltext25',
						type: 'FULLTEXT',
						fields: ['nombres', 'apellidos', 'email'],
					},
				],
			}
		)
	} catch (error) {
		throw new Error(`Error en SmeNuevosEstu25Model: ${error.message}`)
	}
}
