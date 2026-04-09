document.addEventListener("DOMContentLoaded", function () {
    const itemsPerPage = 10;
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const loadMoreBtn = document.getElementById('loadMore');
    let currentCount = 0;

    function showItems() {
        for (let i = currentCount; i < currentCount + itemsPerPage && i < portfolioItems.length; i++) {
            const item = portfolioItems[i];
            item.style.display = 'block';
            setTimeout(() => item.classList.add('fade-in'), 10);
        }
        currentCount += itemsPerPage;

        if (currentCount >= portfolioItems.length) {
            loadMoreBtn.style.display = 'none';
        }
    }

    // Inicializa
    portfolioItems.forEach(item => item.style.display = 'none');
    showItems();

    loadMoreBtn.addEventListener('click', showItems);
});

const botonesFiltro = document.querySelectorAll('.filter-btn');
const productos = document.querySelectorAll('.producto');

botonesFiltro.forEach(boton => {
    boton.addEventListener('click', () => {
        const filtro = boton.dataset.filter;

        botonesFiltro.forEach(b => b.classList.remove('active'));
        boton.classList.add('active');

        productos.forEach(producto => {
            const categoria = producto.dataset.categoria;

            if (filtro === 'todos' || filtro === categoria) {
                producto.style.display = 'block';
            } else {
                producto.style.display = 'none';
            }
        });
    });
});
