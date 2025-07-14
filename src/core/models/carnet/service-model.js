import { DataTypes } from 'sequelize'
import { getSafeCarnetSequelize } from '../../../config/db/instances.js'

export const ServiceModel = async () => {
	try {
		const sequelize = await getSafeCarnetSequelize()

		return sequelize.define(
			'Services',
			{
				id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				name: {
					type: DataTypes.STRING(100),
					allowNull: false,
					validate: {
						notEmpty: true,
						len: [3, 100],
					},
				},
				description: {
					type: DataTypes.TEXT,
					allowNull: true,
				},
				is_active: {
					type: DataTypes.BOOLEAN,
					defaultValue: true,
					allowNull: false,
				},
				current_usage: {
					type: DataTypes.INTEGER,
					defaultValue: 0,
					allowNull: false,
				},
			},
			{
				tableName: 'services',
				timestamps: true,
				paranoid: true,
				indexes: [
					{
						name: 'idx_service_active',
						fields: ['is_active'],
					},
					{
						name: 'idx_service_name',
						fields: ['name'],
					},
				],
			}
		)
	} catch (error) {
		console.error('❌ Error creating Service model:', error)
		throw new Error(`Service Model Error: ${error.message}`)
	}
}

// Modelo de relación entre QR y Servicios (para relación muchos a muchos)
export const QrServiceModel = async () => {
	try {
		const sequelize = await getSafeCarnetSequelize()

		return sequelize.define(
			'QrServices',
			{
				id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				qr_fk: {
					type: DataTypes.UUID,
					allowNull: false,
					references: {
						model: 'qr_codes',
						key: 'id',
					},
				},
				service_fk: {
					type: DataTypes.UUID,
					allowNull: false,
					references: {
						model: 'services',
						key: 'id',
					},
				},
				current_usage: {
					type: DataTypes.INTEGER,
					defaultValue: 0,
					allowNull: false,
				},
			},
			{
				tableName: 'qr_services',
				timestamps: true,
				indexes: [
					{
						name: 'idx_qr_service_unique',
						fields: ['qr_fk', 'service_fk'],
						unique: true,
					},
					{
						name: 'idx_qr_service_qr',
						fields: ['qr_fk'],
					},
					{
						name: 'idx_qr_service_service',
						fields: ['service_fk'],
					},
				],
			}
		)
	} catch (error) {
		console.error('❌ Error creating QrService model:', error)
		throw new Error(`QrService Model Error: ${error.message}`)
	}
}
