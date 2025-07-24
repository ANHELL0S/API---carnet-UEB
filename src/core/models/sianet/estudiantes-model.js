import { DataTypes } from 'sequelize'
import { getSafeSianetSequelize } from '../../../config/db/instances.js'

export const EstudiantesModel = async () => {
	try {
		const sequelize = await getSafeSianetSequelize()

		return sequelize.define(
			'estudiantes',
			{
				ced_est: {
					type: DataTypes.STRING(11),
					primaryKey: true,
					allowNull: false,
					field: 'ced_est',
				},
				nom_est: {
					type: DataTypes.STRING(42),
					allowNull: false,
					field: 'nom_est',
				},
				apell_est: {
					type: DataTypes.STRING(42),
					allowNull: false,
					field: 'apell_est',
				},
				genero: {
					type: DataTypes.STRING(25),
					allowNull: false,
					field: 'genero',
				},
				fono_est: {
					type: DataTypes.STRING(10),
					allowNull: true,
					field: 'fono_est',
				},
				fotografia: {
					type: DataTypes.STRING(76),
					allowNull: true,
					field: 'fotografia',
				},
				pais: {
					type: DataTypes.STRING(42),
					allowNull: true,
					field: 'pais',
				},
				provincia: {
					type: DataTypes.STRING(76),
					allowNull: true,
					field: 'provincia',
				},
				canton: {
					type: DataTypes.STRING(76),
					allowNull: true,
					field: 'canton',
				},
				sector: {
					type: DataTypes.STRING(76),
					allowNull: true,
					field: 'sector',
				},
				fech_nacim: {
					type: DataTypes.DATEONLY,
					allowNull: true,
					field: 'fech_nacim',
				},
				domicilio_est: {
					type: DataTypes.STRING(100),
					allowNull: true,
					field: 'domicilio_est',
				},
				nom_pad: {
					type: DataTypes.STRING(84),
					allowNull: true,
					field: 'nom_pad',
				},
				nom_mad: {
					type: DataTypes.STRING(84),
					allowNull: true,
					field: 'nom_mad',
				},
				lug_trab: {
					type: DataTypes.STRING(100),
					allowNull: true,
					field: 'lug_trab',
				},
				fono_trab: {
					type: DataTypes.STRING(10),
					allowNull: true,
					field: 'fono_trab',
				},
				email: {
					type: DataTypes.STRING(76),
					allowNull: true,
					field: 'email',
				},
				fech_grad_col: {
					type: DataTypes.DATEONLY,
					allowNull: true,
					field: 'fech_grad_col',
				},
				calificacion: {
					type: DataTypes.STRING(8),
					allowNull: true,
					field: 'calificacion',
				},
				cod_coleg: {
					type: DataTypes.INTEGER,
					allowNull: true,
					field: 'cod_coleg',
					references: {
						model: 'colegio',
						key: 'cod_coleg',
					},
				},
				cod_especialidad: {
					type: DataTypes.INTEGER,
					allowNull: true,
					field: 'cod_especialidad',
					references: {
						model: 'especialidades',
						key: 'cod_especialidad',
					},
				},
				etnia: {
					type: DataTypes.STRING(40),
					allowNull: true,
					field: 'etnia',
				},
				clave: {
					type: DataTypes.STRING(42),
					allowNull: true,
					field: 'clave',
				},
				clave_es: {
					type: DataTypes.INTEGER,
					allowNull: true,
					field: 'clave_es',
				},
				nick: {
					type: DataTypes.STRING(50),
					allowNull: true,
					defaultValue: '0',
					field: 'nick',
				},
				creado: {
					type: DataTypes.INTEGER,
					allowNull: true,
					defaultValue: 0,
					field: 'creado',
				},
				tele_conve: {
					type: DataTypes.STRING(10),
					allowNull: true,
					field: 'tele_conve',
				},
			},
			{
				tableName: 'estudiantes',
				timestamps: false,
				indexes: [
					{
						fields: ['cod_coleg'],
					},
					{
						fields: ['cod_especialidad'],
					},
				],
			}
		)
	} catch (error) {
		console.error('❌ Error al crear modelo estudiantes:', error.message)
		throw new Error(`Error en EstudiantesModel: ${error.message}`)
	}
}
