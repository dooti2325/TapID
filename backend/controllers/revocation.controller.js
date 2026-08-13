const db = require('../config/database');

exports.revokeCard = async (req, res) => {
    const { uid } = req.body;
    try {
        if (!uid) return res.status(400).json({ message: 'Card UID is required' });

        const [result] = await db.execute('UPDATE rfid_cards SET status = ? WHERE uid = ?', ['revoked', uid]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Card not found' });

        await db.execute('INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, 'REVOKE_CARD', 'rfid_cards', null, `Revoked card UID: ${uid}`]);
        res.json({ message: 'Card revoked successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.revokeDevice = async (req, res) => {
    const { mac_address } = req.body;
    try {
        if (!mac_address) return res.status(400).json({ message: 'Device MAC address is required' });

        const [result] = await db.execute('UPDATE devices SET status = ? WHERE mac_address = ?', ['revoked', mac_address]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Device not found' });

        await db.execute('INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, 'REVOKE_DEVICE', 'devices', null, `Revoked device MAC: ${mac_address}`]);
        res.json({ message: 'Device revoked successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
