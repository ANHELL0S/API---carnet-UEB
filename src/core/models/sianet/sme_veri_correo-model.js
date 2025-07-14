import { DataTypes, Op } from 'sequelize'
import { getSafeSianetSequelize } from '../../../config/db/instances.js'

export const SmeVeriCorreoModel = async () => {
	try {
		const sequelize = await getSafeSianetSequelize()

		return sequelize.define(
			'smeVeriCorreo',
			{
				ced_est: {
					type: DataTypes.STRING(11),
					primaryKey: true,
					allowNull: false,
					validate: {
						len: [10, 11], // Validación para cédulas
						isNumeric: true,
					},
				},
				periodo: {
					type: DataTypes.STRING(25),
					primaryKey: true,
					allowNull: false,
					validate: {
						is: /^[0-9]{4}-[0-9]{4}[A-Z]?$/, // Ejemplo: 2023-2024A
					},
				},
				cod_carr: {
					type: DataTypes.BIGINT,
					allowNull: false,
					index: true, // Índice para joins con catálogos de carreras
				},
				codigo: {
					type: DataTypes.BIGINT,
					allowNull: false,
					validate: {
						min: 100000, // Códigos de 6+ dígitos
						max: 999999,
					},
				},
			},
			{
				tableName: 'sme_veri_correo',
				timestamps: false,
				indexes: [
					// Índice para búsqueda por carrera + periodo
					{
						name: 'idx_carrera_periodo',
						fields: ['cod_carr', 'periodo'],
					},
					// Índice para búsqueda rápida de códigos
					{
						name: 'idx_codigo_verificacion',
						fields: ['codigo'],
						where: {
							codigo: { [Op.not]: null },
						},
					},
					// Índice para consultas históricas
					{
						name: 'idx_estudiante_periodos',
						fields: ['ced_est', 'periodo'],
					},
				],
			}
		)
	} catch (error) {
		console.error('❌ Error al crear modelo SmeVeriCorreo:', error)
		throw new Error(`Error en SmeVeriCorreoModel: ${error.message}`)
	}
}
