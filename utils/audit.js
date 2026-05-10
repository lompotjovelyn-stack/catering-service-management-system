const { AuditLog } = require('../models');

async function logAction(userId, action, entity, entityId, details = {}) {
    try {
        await AuditLog.create({ userId, action, entity, entityId, details });
    } catch (error) {
        console.error('Audit log failed:', error.message);
    }
}

module.exports = logAction;
