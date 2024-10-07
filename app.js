new Vue({
    el: '#app',
    data: {
        produtos: [],
        produtoSelecionado: false,
        itemsCarrinho: [],
        mensagemAlerta: 'Item Adicionado',
        mostrarAlerta: false,
        carrinhoAtivo: false,
    },
    filters: {
        preco(valor) {
            return valor.toLocaleString('pt-Br', { style: 'currency', currency: 'BRL' })
        }
    },
    computed: {
        precoTotalCarrinho() {
            let total = 0
            if (this.itemsCarrinho.length) {
                this.itemsCarrinho.forEach(item => {
                    total += item.preco
                })
            }

            return total
        }
    },
    methods: {
        getProdutos() {
            fetch('./api/produtos.json')
            .then(r => r.json())
            .then(r => {
                this.produtos = r
            })
        },
        getProduto(id) {
            fetch(`./api/produtos/${id}/dados.json`)
            .then(r => r.json())
            .then(r => {
                this.produtoSelecionado = r
            })
        },
        abrirModal(id) {
            this.getProduto(id)
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            })
        },
        fecharModal({ currentTarget, target }) {
            if (currentTarget === target) this.produtoSelecionado = false
        },
        fecharCarrinho({ currentTarget, target }) {
            if (currentTarget === target) this.carrinhoAtivo = false
        },
        adicionarItemAoCarrinho() {
            this.produtoSelecionado.estoque--
            const { nome, id, preco } = this.produtoSelecionado
            this.itemsCarrinho.push({ id, nome, preco })
            this.alerta(`${nome} foi adicionado ao carrinho!`)
        },
        removerItemDoCarrinho(index) {
            this.itemsCarrinho.splice(index, 1)
        },
        checarLocalStorage() {
            const itemsCarrinhoDoLocal = localStorage.getItem('itemsCarrinho')
            if (itemsCarrinhoDoLocal) this.itemsCarrinho = JSON.parse(itemsCarrinhoDoLocal)
        },
        comprarEstoque() {
            const items = this.itemsCarrinho.filter(({ id }) => id === this.produtoSelecionado.id)
            this.produtoSelecionado.estoque -= items.length
        },
        alerta(mensagem) {
            this.mensagemAlerta = mensagem
            this.mostrarAlerta = true
            setTimeout(() => {
                this.mostrarAlerta = false;
            }, 1500);
        },
        router() {
            const hash = document.location.hash
            if (hash) {
                this.getProduto(hash.replace('#', ''))
            }
        }
    },
    watch: {
        produtoSelecionado(){
            document.title = this.produtoSelecionado.nome || 'Techno'
            const hash = this.produtoSelecionado.id || ''
            history.pushState(null, null, `#${hash}`);
            if (this.produtoSelecionado) this.comprarEstoque()
        },
        itemsCarrinho() {
            const itemsCarrinho = JSON.stringify(this.itemsCarrinho)
            localStorage.setItem('itemsCarrinho', itemsCarrinho)
        },
    },
    created() {
        this.getProdutos();
        this.checarLocalStorage();
        this.router();
    }
})