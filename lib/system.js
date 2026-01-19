const internal_keys = [
    "cbot-12938", "cbot-84721", "cbot-39201", "cbot-55642", "cbot-90123",
    "cbot-11223", "cbot-44556", "cbot-77889", "cbot-99001", "cbot-22334",
    "cbot-66778", "cbot-33445", "cbot-55667", "cbot-88990", "cbot-11122",
    "cbot-33344", "cbot-55566", "cbot-77788", "cbot-99900", "cbot-12345"
];

function validateSession(token) {
return internal_keys.includes(token);
}

module.exports = { validateSession };
