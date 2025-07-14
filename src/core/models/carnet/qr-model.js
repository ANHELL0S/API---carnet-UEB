import { DataTypes } from 'sequelize'
import { TYPE_USER } from '../../../common/constants/typeUser-const.js'
import { getSafeCarnetSequelize } from '../../../config/db/instances.js'

export const QrModel = async () => {
	try {
		const sequelize = await getSafeCarnetSequelize()

		return sequelize.define(
			'QrCodes',
			{
				id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				qr_image: {
					type: DataTypes.TEXT,
					allowNull: false,
				},
				cl_fk: {
					type: DataTypes.STRING(11),
					allowNull: false,
				},
				user_type: {
					type: DataTypes.ENUM(TYPE_USER.ESTUDIANTE, TYPE_USER.USUARIO),
					allowNull: false,
				},
				user_system: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				expiration_date: {
					type: DataTypes.DATE,
					allowNull: false,
					validate: {
						isDate: true,
						isAfter: new Date().toISOString(),
					},
				},
				is_expired: {
					type: DataTypes.BOOLEAN,
					defaultValue: false,
				},
			},
			{
				tableName: 'qr_codes',
				timestamps: true,
				paranoid: true,
				indexes: [
					{
						name: 'idx_student_active_qr',
						fields: ['cl_fk'],
						where: {
							is_expired: false,
						},
					},
					{
						name: 'idx_unexpired_qr',
						fields: ['expiration_date'],
					},
					{
						name: 'idx_user_type',
						fields: ['user_type'],
					},
					{
						name: 'idx_user_system',
						fields: ['user_system'],
					},
				],
				hooks: {
					beforeCreate: qr => {
						if (!qr.expiration_date) {
							const oneDayLater = new Date()
							oneDayLater.setDate(oneDayLater.getDate() + 1) // Agrega 1 día
							qr.expiration_date = oneDayLater
						}
					},
					beforeUpdate: qr => {
						// Marcar como expirado si la fecha de expiración pasó
						if (new Date(qr.expiration_date) < new Date() && !qr.is_expired) {
							qr.is_expired = true
						}
					},
				},
			}
		)
	} catch (error) {
		console.error('❌ Error creating QR model:', error)
		throw new Error(`QR Model Error: ${error.message}`)
	}
}
