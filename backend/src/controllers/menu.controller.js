const pool = require('../../db');

const obtenerMenu = async (req, res) => {
    const isAdmin = req.query.admin === 'true';
    try {
        let query = 'SELECT * FROM productos';
        if (!isAdmin) query += ' WHERE disponible = true';
        query += ' ORDER BY categoria ASC, nombre ASC';
        
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Error al cargar el menú" });
    }
};

const actualizarProducto = async (req, res) => {
    const { id } = req.params;
    const { es_recomendado, disponible } = req.body;
    try {
        if (es_recomendado !== undefined) {
            await pool.query('UPDATE productos SET es_recomendado = $1 WHERE id = $2', [es_recomendado, id]);
        }
        if (disponible !== undefined) {
            await pool.query('UPDATE productos SET disponible = $1 WHERE id = $2', [disponible, id]);
        }
        res.json({ mensaje: 'Producto actualizado con éxito' });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
};

module.exports = { obtenerMenu, actualizarProducto };