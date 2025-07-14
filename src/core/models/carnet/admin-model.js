import { DataTypes } from 'sequelize'
import { getSafeCarnetSequelize } from '../../../config/db/instances.js'

export const AdminModel = async () => {
	try {
		const sequelize = await getSafeCarnetSequelize()

		return sequelize.define(
			'Admin',
			{
				id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				identification_card: {
					type: DataTypes.STRING(15),
					allowNull: false,
				},
				password: {
					type: DataTypes.STRING(255),
					allowNull: false,
				},
				active: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: true,
				},
			},
			{
				tableName: 'admin',
				timestamps: true,
				paranoid: true,
			}
		)
	} catch (error) {
		console.error('❌ Error creating God model:', error)
		throw new Error(`God Model Error: ${error.message}`)
	}
}
