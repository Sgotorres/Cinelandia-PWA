let tiendaAbierta = false;

module.exports = {
    estaAbierta: () => tiendaAbierta,
    setEstado: (estado) => { tiendaAbierta = estado; }
};