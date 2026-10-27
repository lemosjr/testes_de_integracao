const { Router } = require('express');
const pessoaController = require('../controllers/pessoaController');

const router = Router();

router.get('/', pessoaController.listar);
router.get('/:id', pessoaController.buscarPorId);
router.post('/', pessoaController.criar);
router.put('/:id', pessoaController.atualizar);
router.delete('/:id', pessoaController.remover);

module.exports = router;
