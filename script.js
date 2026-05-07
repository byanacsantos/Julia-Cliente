document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const header = document.querySelector('#main-header');
    const themeToggle = document.querySelector('#theme-toggle');
    const hamburger = document.querySelector('#hamburger-menu');
    const closeMenu = document.querySelector('#close-menu');
    const overlay = document.querySelector('#fullscreen-overlay');
    const overlayLinks = document.querySelectorAll('.overlay-links a');
    const reveals = document.querySelectorAll('[data-reveal]');

    // 1. Alternar Tema (Escuro/Claro)
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('light-mode');
        // Opcional: Salvar no localStorage
        const isLight = body.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });

    // Restaurar tema salvo
    if (localStorage.getItem('theme') === 'light') {
        body.classList.add('light-mode');
    }

    // 2. Menu Fullscreen
    const toggleMenu = (show) => {
        if (show) {
            overlay.classList.add('active');
            hamburger.classList.add('active');
            body.style.overflow = 'hidden'; // Travar scroll
        } else {
            overlay.classList.remove('active');
            hamburger.classList.remove('active');
            body.style.overflow = '';
        }
    };


    hamburger.addEventListener('click', () => toggleMenu(true));
    closeMenu.addEventListener('click', () => toggleMenu(false));
    
    // Fechar menu ao clicar em links
    overlayLinks.forEach(link => {
        link.addEventListener('click', () => toggleMenu(false));
    });

    // 3. Header Background on Scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 4. Scroll Reveal Intersection Observer
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    reveals.forEach(reveal => {
        revealObserver.observe(reveal);
    });

    // 5. Hero content animation
    const heroContent = document.querySelectorAll('.fade-in');
    heroContent.forEach((el, index) => {
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 300 * index);
    });

    // 6. Funcionalidade do Carrinho
    const getCartKey = () => {
        const user = JSON.parse(localStorage.getItem('ew-logged-in'));
        return user ? `ew-cart-${user.email}` : 'ew-cart-guest';
    };

    let cart = JSON.parse(localStorage.getItem(getCartKey())) || [];
    const cartBtn = document.querySelector('#cart-toggle');
    const cartDrawer = document.querySelector('#cart-drawer');
    const cartClose = document.querySelector('#close-cart');
    const cartOverlay = document.querySelector('#cart-overlay');
    const cartCount = document.querySelector('#cart-count');
    const cartItemsList = document.querySelector('#cart-items');
    const cartTotalDisplay = document.querySelector('#cart-total');
    const addBtns = document.querySelectorAll('.btn-add');

    const updateCartUI = () => {
        const currentKey = getCartKey();
        // Atualizar contador
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;

        // Limpar lista
        cartItemsList.innerHTML = '';

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p class="empty-msg">Seu carrinho está vazio.</p>';
            cartTotalDisplay.textContent = 'R$ 0,00';
        } else {
            let total = 0;
            cart.forEach((item, index) => {
                total += item.price * item.quantity;
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>${item.quantity}x R$ ${item.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div class="cart-item-actions">
                        <button class="remove-item" data-index="${index}">Remover</button>
                    </div>
                `;
                cartItemsList.appendChild(itemEl);
            });
            cartTotalDisplay.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        }

        // Salvar no local storage específico do usuário
        localStorage.setItem(currentKey, JSON.stringify(cart));
        
        // Re-vincular eventos de remoção
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-index');
                cart.splice(idx, 1);
                updateCartUI();
            });
        });
    };

    const toggleCart = (show) => {
        if (show) {
            cartDrawer.classList.add('active');
            cartOverlay.classList.add('active');
            body.style.overflow = 'hidden';
        } else {
            cartDrawer.classList.remove('active');
            cartOverlay.classList.remove('active');
            body.style.overflow = '';
        }
    };

    cartBtn.addEventListener('click', () => toggleCart(true));
    cartClose.addEventListener('click', () => toggleCart(false));
    cartOverlay.addEventListener('click', () => toggleCart(false));

    addBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.getAttribute('data-name');
            const price = parseFloat(btn.getAttribute('data-price'));

            const existingItem = cart.find(item => item.name === name);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ name, price, quantity: 1 });
            }

            updateCartUI();
            toggleCart(true); // Abre o carrinho ao adicionar
        });
    });

    // Inicializar UI do carrinho
    updateCartUI();

    // 7. Envio do Formulário de Contato
    const contactForm = document.querySelector('#form-contato');
    const formStatus = document.querySelector('#form-status');
    const btnEnviar = document.querySelector('#btn-enviar');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const originalBtnText = btnEnviar.textContent;
            btnEnviar.disabled = true;
            btnEnviar.textContent = 'Enviando...';
            formStatus.textContent = '';
            formStatus.className = 'form-status';

            const formData = new FormData(contactForm);
            
            try {
                const response = await fetch('https://formspree.io/f/xpqbrape', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    formStatus.textContent = 'Mensagem enviada com sucesso! Entraremos em contato em breve.';
                    formStatus.classList.add('success');
                    contactForm.reset();
                } else {
                    const data = await response.json();
                    if (Object.hasOwn(data, 'errors')) {
                        formStatus.textContent = data["errors"].map(error => error["message"]).join(", ");
                    } else {
                        formStatus.textContent = 'Ops! Ocorreu um erro ao enviar sua mensagem.';
                    }
                    formStatus.classList.add('error');
                }
            } catch (error) {
                formStatus.textContent = 'Erro de conexão. Verifique sua internet.';
                formStatus.classList.add('error');
            } finally {
                btnEnviar.disabled = false;
                btnEnviar.textContent = originalBtnText;
            }
        });
    }

    // 8. Gestão de Autenticação na UI
    const userNameDisplay = document.querySelector('#user-name-display');
    const loginNavBtn = document.querySelector('#login-nav-btn');
    const userInfoOverlay = document.querySelector('#user-info-overlay');
    const loggedInUser = JSON.parse(localStorage.getItem('ew-logged-in'));

    if (loggedInUser) {
        const firstName = loggedInUser.name.split(' ')[0];
        
        // Atualizar Header principal
        if (userNameDisplay) userNameDisplay.textContent = `Olá, ${firstName}`;
        
        // Atualizar Menu Overlay
        if (userInfoOverlay) {
            userInfoOverlay.innerHTML = `
                <div class="user-profile-box">
                    <p class="welcome-text">Bem-vindo,</p>
                    <p class="user-name">${loggedInUser.name}</p>
                    <button id="logout-btn" class="logout-link">Sair da conta</button>
                </div>
            `;
            
            const logoutBtn = document.querySelector('#logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    if (confirm('Deseja sair da sua conta?')) {
                        localStorage.removeItem('ew-logged-in');
                        window.location.reload();
                    }
                });
            }
        }

        // Pré-preencher formulário de contato
        const inputNome = document.querySelector('#name');
        const inputEmail = document.querySelector('#email');
        if (inputNome) inputNome.value = loggedInUser.name;
        if (inputEmail) inputEmail.value = loggedInUser.email;
        
        // Listener de logout no Header
        if (loginNavBtn) {
            loginNavBtn.addEventListener('click', (e) => {
                if (confirm('Deseja sair da sua conta?')) {
                    e.preventDefault();
                    localStorage.removeItem('ew-logged-in');
                    window.location.reload();
                }
            });
        }
    }

    // 9. Lógica de Checkout
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (!loggedInUser) {
                alert('Por favor, faça login ou crie uma conta para finalizar sua compra.');
                window.location.href = 'auth.html';
                return;
            }

            // Verificar se o carrinho está vazio
            if (cart.length === 0) {
                alert('Seu carrinho está vazio!');
                return;
            }

            // Verificar forma de pagamento
            const selectedPayment = document.querySelector('input[name="payment"]:checked');
            if (!selectedPayment) {
                alert('Por favor, selecione uma forma de pagamento para continuar.');
                return;
            }

            const paymentMethod = selectedPayment.value;
            alert(`Obrigado, ${loggedInUser.name}! \n\nPedido realizado com sucesso.\nForma de Pagamento: ${paymentMethod}\n\nEstamos preparando sua entrega!`);
            
            // Limpar carrinho após compra
            localStorage.removeItem(getCartKey());
            cart = [];
            updateCartUI();
            toggleCart(false);
            
            // Resetar rádio buttons
            document.querySelectorAll('input[name="payment"]').forEach(opt => opt.checked = false);
        });
    }
});

