export const handleZodValidation = (schema, data) => {
	const result = schema.safeParse(data)

	if (!result.success) {
		return {
			isValid: false,
			errors: result.error.issues.map(err => ({
				field: err.path.join('.'),
				message: err.message,
			})),
		}
	}

	return {
		isValid: true,
		data: result.data,
	}
}
