const internal_keys = ["carsaimz"]

function validateSession(token) {
return internal_keys.includes(token);
}

module.exports = { validateSession };
