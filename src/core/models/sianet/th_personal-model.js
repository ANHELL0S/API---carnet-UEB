import { DataTypes } from 'sequelize'
import { getSafeSianetSequelize } from '../../../config/db/instances.js'

export const ThPersonalModel = async () => {
	try {
		const sequelize = await getSafeSianetSequelize()

		return sequelize.define(
			'thPersonal',
			{
				tipo_documento: {
					type: DataTypes.STRING(25),
					allowNull: false,
				},
				cedula: {
					type: DataTypes.STRING(11),
					primaryKey: true,
					allowNull: false,
				},
				nombres: {
					type: DataTypes.STRING(42),
				},
				apellidos: {
					type: DataTypes.STRING(42),
				},
				fecha_nac: {
					type: DataTypes.DATEONLY,
				},
				pais_na: {
					type: DataTypes.STRING(42),
				},
				provi_na: {
					type: DataTypes.STRING(42),
				},
				ciudad_na: {
					type: DataTypes.STRING(42),
				},
				parro_na: {
					type: DataTypes.STRING(72),
				},
				genero: {
					type: DataTypes.STRING(10),
				},
				estado_civil: {
					type: DataTypes.STRING(42),
				},
				etnia: {
					type: DataTypes.STRING(40),
				},
				naci_etnia: {
					type: DataTypes.STRING(42),
					defaultValue: 'NO APLICA',
				},
				tipo_sangre: {
					type: DataTypes.STRING(4),
				},
				pais_dire: {
					type: DataTypes.STRING(42),
				},
				provi_dire: {
					type: DataTypes.STRING(42),
				},
				ciudad_dire: {
					type: DataTypes.STRING(42),
				},
				parro_dire: {
					type: DataTypes.STRING(72),
				},
				calle_p: {
					type: DataTypes.STRING(72),
				},
				calle_s: {
					type: DataTypes.STRING(72),
				},
				telefono: {
					type: DataTypes.STRING(11),
				},
				celular: {
					type: DataTypes.STRING(11),
				},
				mail_p: {
					type: DataTypes.STRING(76),
				},
				nick: {
					type: DataTypes.STRING(76),
				},
				carnet: {
					type: DataTypes.STRING(5),
				},
				discapacidad: {
					type: DataTypes.STRING(25),
				},
				porcentaje: {
					type: DataTypes.DOUBLE,
				},
				grado_dis: {
					type: DataTypes.STRING(25),
				},
				fotografia: {
					type: DataTypes.STRING(76),
				},
				clave: {
					type: DataTypes.STRING(255),
				},
				estado: {
					type: DataTypes.STRING(2),
					defaultValue: 'A',
				},
				creado: {
					type: DataTypes.BIGINT,
					defaultValue: 0,
				},
			},
			{
				tableName: 'th_personal',
				timestamps: false,
				indexes: [
					{
						name: 'idx_th_personal_nombres',
						fields: ['nombres'],
						using: 'BTREE',
					},
					{
						name: 'idx_th_personal_apellidos',
						fields: ['apellidos'],
						using: 'BTREE',
					},
					{
						name: 'idx_th_personal_email',
						fields: ['mail_p'],
						using: 'BTREE',
					},
					{
						name: 'idx_th_personal_estado',
						fields: ['estado'],
						using: 'BTREE',
					},
				],
			}
		)
	} catch (error) {
		console.error('❌ Error al crear modelo th_personal:', error)
		throw new Error(`Error en ThPersonalModel: ${error.message}`)
	}
}
