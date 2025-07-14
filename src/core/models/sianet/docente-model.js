import { DataTypes } from 'sequelize'
import { getSafeSianetSequelize } from '../../../config/db/instances.js'

export const DocenteModel = async () => {
	try {
		const sequelize = await getSafeSianetSequelize()

		return sequelize.define(
			'docente',
			{
				ci_doc: {
					type: DataTypes.TEXT,
					primaryKey: true,
					allowNull: false,
				},
				dedicacion_codigo: {
					type: DataTypes.INTEGER,
				},
				ruc: {
					type: DataTypes.TEXT,
				},
				nombres_doc: {
					type: DataTypes.TEXT,
					allowNull: false,
				},
				apellidos_doc: {
					type: DataTypes.TEXT,
					allowNull: false,
				},
				genero: {
					type: DataTypes.CHAR(1),
				},
				nacionalidad: {
					type: DataTypes.TEXT,
				},
				estado_civil: {
					type: DataTypes.TEXT,
				},
				fecha_nac: {
					type: DataTypes.DATE,
				},
				pais: {
					type: DataTypes.TEXT,
				},
				provincia: {
					type: DataTypes.TEXT,
				},
				ciudad: {
					type: DataTypes.TEXT,
				},
				parroquia: {
					type: DataTypes.TEXT,
				},
				direccion: {
					type: DataTypes.TEXT,
				},
				telefono: {
					type: DataTypes.TEXT,
				},
				celular: {
					type: DataTypes.TEXT,
				},
				mail: {
					type: DataTypes.TEXT,
				},
				web: {
					type: DataTypes.TEXT,
				},
				foto: {
					type: DataTypes.TEXT,
				},
				otra_institucion: {
					type: DataTypes.TEXT,
				},
				primaria: {
					type: DataTypes.TEXT,
				},
				secundaria: {
					type: DataTypes.TEXT,
				},
				especialidad: {
					type: DataTypes.TEXT,
				},
				numero_cargas: {
					type: DataTypes.SMALLINT,
					defaultValue: 0,
				},
				estado: {
					type: DataTypes.CHAR(1),
					defaultValue: 'A',
				},
				secundaria_dos: {
					type: DataTypes.TEXT,
				},
				especialidad_dos: {
					type: DataTypes.TEXT,
				},
				ded_ant_codigo: {
					type: DataTypes.SMALLINT,
				},
				denominacion: {
					type: DataTypes.STRING(10),
					allowNull: false,
				},
				tipo_sangre: {
					type: DataTypes.STRING(4),
				},
				agremiado: {
					type: DataTypes.STRING(3),
				},
				tipo_documento: {
					type: DataTypes.STRING(16),
				},
				nick: {
					type: DataTypes.STRING(50),
					defaultValue: '0',
				},
				creado: {
					type: DataTypes.BIGINT,
					defaultValue: 0,
				},
				clave: {
					type: DataTypes.STRING(42),
				},
			},
			{
				tableName: 'docente',
				timestamps: false,
				indexes: [
					{
						name: 'docente_fkindex1',
						fields: ['dedicacion_codigo'],
						using: 'BTREE',
					},
					{
						name: 'ifk_rel_81',
						fields: ['dedicacion_codigo'],
						using: 'BTREE',
					},
				],
			}
		)
	} catch (error) {
		throw new Error(`Error en correo_UebModel: ${error.message}`)
	}
}
