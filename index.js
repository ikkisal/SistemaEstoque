const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

// Dados de estoque em memória
let estoque = [];
let idAtual = 1;

// Função para verificar duplicidade de nome
function verificarDuplicidade(nome) {
    return estoque.some(produto => produto.nome.toLowerCase() === nome.toLowerCase());
}


app.post('/produtos', (req, res) => {
    const { nome, quantidade, preco } = req.body;
    if (verificarDuplicidade(nome)) {
        return res.status(400).json({ error: 'Produto com este nome já existe.' });
    }
    if (quantidade < 0 || preco <= 0) {
        return res.status(400).json({ error: 'Quantidade deve ser >= 0 e preço deve ser > 0.' });
    }

    const novoProduto = { id: idAtual++, nome, quantidade, preco };
    estoque.push(novoProduto);
    res.status(201).json(novoProduto);
});


app.get('/produtos', (req, res) => {
    res.json(estoque);
});


app.put('/produtos/:id', (req, res) => {
    const { id } = req.params;
    const { nome, quantidade, preco } = req.body;

    const produto = estoque.find(prod => prod.id === parseInt(id));
    if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
    }
    if (verificarDuplicidade(nome) && produto.nome !== nome) {
        return res.status(400).json({ error: 'Produto com este nome já existe.' });
    }
    if (quantidade < 0 || preco <= 0) {
        return res.status(400).json({ error: 'Quantidade deve ser >= 0 e preço deve ser > 0.' });
    }

    produto.nome = nome;
    produto.quantidade = quantidade;
    produto.preco = preco;

    res.json(produto);
});


app.delete('/produtos/:id', (req, res) => {
    const { id } = req.params;
    const index = estoque.findIndex(prod => prod.id === parseInt(id));
    if (index === -1) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    const produtoRemovido = estoque.splice(index, 1);
    res.json(produtoRemovido[0]);
});



app.get('/relatorio', (req, res) => {
    const totalProdutos = estoque.length;
    const valorTotal = estoque.reduce((acc, produto) => acc + produto.quantidade * produto.preco, 0);
    res.json({ totalProdutos, valorTotal });
});



app.get('/produtos/buscar', (req, res) => {
    const { nome } = req.query;
    const resultado = estoque.filter(produto => produto.nome.toLowerCase().includes(nome.toLowerCase()));
    if (resultado.length === 0) {
        return res.status(404).json({ error: 'Nenhum produto encontrado.' });
    }
    res.json(resultado);
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});