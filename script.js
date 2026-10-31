document.addEventListener('DOMContentLoaded', () => {
    // اطلاعات اولیه محصولات پیش‌فرض
    const defaultProducts = [
        { id: 1, name: 'گوشی هوشمند', price: 12000000, stock: 5, category: 'الکترونیک', image: 'https://via.placeholder.com/250' },
        { id: 2, name: 'تیشرت مردانه', price: 350000, stock: 10, category: 'پوشاک', image: 'https://via.placeholder.com/250' },
        { id: 3, name: 'کرم مرطوب‌کننده', price: 150000, stock: 8, category: 'لوازم آرایشی', image: 'https://via.placeholder.com/250' }
    ];

    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify(defaultProducts));
    }

    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }

    let currentLoggedInUser = JSON.parse(localStorage.getItem('currentLoggedInUser')) || null;
    let selectedCategory = 'همه';
    let generatedCaptcha = '';

    // المنت‌های احراز هویت
    const authContainer = document.getElementById('auth-container');
    const mainSite = document.getElementById('main-site');
    const stepPhone = document.getElementById('step-phone');
    const stepPassword = document.getElementById('step-password');
    const stepVerify = document.getElementById('step-verify');
    const phoneInput = document.getElementById('phone-input');
    const phoneNextBtn = document.getElementById('phone-next-btn');
    const passwordInput = document.getElementById('password-input');
    const passwordNextBtn = document.getElementById('password-next-btn');
    const passwordPromptText = document.getElementById('password-prompt-text');
    const captchaCodeEl = document.getElementById('captcha-code');
    const captchaInput = document.getElementById('captcha-input');
    const nameInput = document.getElementById('name-input');
    const registerBtn = document.getElementById('register-btn');

    // اگر کاربر قبلاً لاگین کرده باشد
    if (currentLoggedInUser) {
        authContainer.classList.add('hidden');
        mainSite.classList.remove('hidden');
        initMainApp();
    }

    let tempPhone = '';
    let isExistingUser = false;

    // مرحله ۱: بررسی شماره موبایل
    phoneNextBtn.addEventListener('click', () => {
        const phone = phoneInput.value.trim();
        if (!phone || phone.length < 10) {
            alert('لطفاً یک شماره موبایل معتبر وارد کنید.');
            return;
        }
        tempPhone = phone;
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const foundUser = users.find(u => u.phone === phone);

        stepPhone.classList.add('hidden');
        if (foundUser || phone === '09056274127') {
            isExistingUser = true;
            passwordPromptText.textContent = 'رمز عبور خود را وارد کنید:';
            stepPassword.classList.remove('hidden');
        } else {
            isExistingUser = false;
            passwordPromptText.textContent = 'شماره جدید است؛ رمز عبور جدید خود را بسازید:';
            stepPassword.classList.remove('hidden');
        }
    });

    // مرحله ۲: بررسی رمز عبور
    passwordNextBtn.addEventListener('click', () => {
        const password = passwordInput.value.trim();
        if (!password) {
            alert('لطفاً رمز عبور را وارد کنید.');
            return;
        }

        if (isExistingUser) {
            // چک کردن ادمین یا کاربران ثبت‌نام شده قبلی
            if (tempPhone === '09056274127') {
                if (password !== '9056274127') {
                    alert('رمز عبور ادمین اشتباه است!');
                    return;
                }
            } else {
                let users = JSON.parse(localStorage.getItem('users')) || [];
                const foundUser = users.find(u => u.phone === tempPhone);
                if (foundUser && foundUser.password !== password) {
                    alert('رمز عبور اشتباه است!');
                    return;
                }
            }
            // ورود موفق کاربر موجود
            let users = JSON.parse(localStorage.getItem('users')) || [];
            let user = users.find(u => u.phone === tempPhone) || { phone: tempPhone, name: 'کاربر', password: password };
            localStorage.setItem('currentLoggedInUser', JSON.stringify(user));
            authContainer.classList.add('hidden');
            mainSite.classList.remove('hidden');
            initMainApp();
        } else {
            // کاربر جدید: رفتن به مرحله کپچا و نام
            generatedCaptcha = Math.floor(1000 + Math.random() * 9000).toString();
            captchaCodeEl.textContent = generatedCaptcha;
            stepPassword.classList.add('hidden');
            stepVerify.classList.remove('hidden');
            // ذخیره موقت رمز عبور جدید
            window.tempNewPassword = password;
        }
    });

    // مرحله ۳: ثبت‌نام نهایی کاربر جدید
    registerBtn.addEventListener('click', () => {
        const captchaVal = captchaInput.value.trim();
        const nameVal = nameInput.value.trim();

        if (captchaVal !== generatedCaptcha) {
            alert('کد تایید نادرست است.');
            return;
        }
        if (!nameVal) {
            alert('لطفاً نام خود را وارد کنید.');
            return;
        }

        let users = JSON.parse(localStorage.getItem('users')) || [];
        const newUser = {
            phone: tempPhone,
            password: window.tempNewPassword,
            name: nameVal,
            email: '',
            address: ''
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentLoggedInUser', JSON.stringify(newUser));

        authContainer.classList.add('hidden');
        mainSite.classList.remove('hidden');
        initMainApp();
    });

    // راه‌اندازی بخش‌های اصلی سایت پس از ورود
    function initMainApp() {
        const currentUser = JSON.parse(localStorage.getItem('currentLoggedInUser'));
        const isAdmin = (currentUser.phone === '09056274127');

        // مدیریت پنل ادمین و دسترسی‌ها
        const adminPanel = document.getElementById('admin-panel');
        if (isAdmin) {
            adminPanel.classList.remove('hidden');
        } else {
            adminPanel.classList.add('hidden');
        }

        renderProducts();

        // منوی همبرگری
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const hamburgerDropdown = document.getElementById('hamburger-dropdown');
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            hamburgerDropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', () => {
            hamburgerDropdown.classList.add('hidden');
        });

        // ناوبری بین صفحات
        const homePage = document.getElementById('home-page');
        const profilePage = document.getElementById('profile-page');
        const cartPage = document.getElementById('cart-page');

        document.getElementById('menu-home').addEventListener('click', (e) => {
            e.preventDefault();
            homePage.classList.remove('hidden');
            profilePage.classList.add('hidden');
            cartPage.classList.add('hidden');
        });

        document.getElementById('menu-profile').addEventListener('click', (e) => {
            e.preventDefault();
            homePage.classList.add('hidden');
            profilePage.classList.remove('hidden');
            cartPage.classList.add('hidden');
            loadProfileData();
        });

        document.getElementById('menu-cart').addEventListener('click', (e) => {
            e.preventDefault();
            homePage.classList.add('hidden');
            profilePage.classList.add('hidden');
            cartPage.classList.remove('hidden');
            renderCart();
        });

        // فیلتر دسته‌بندی بالای صفحه
        const catButtons = document.querySelectorAll('.cat-btn');
        catButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                catButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedCategory = btn.getAttribute('data-category');
                renderProducts();
            });
        });

        // جستجو
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', () => {
            renderProducts(searchInput.value.trim());
        });

        // افزودن محصول توسط ادمین
        const addProductBtn = document.getElementById('add-product-btn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => {
                if (!isAdmin) return;
                const name = document.getElementById('new-product-name').value.trim();
                const price = Number(document.getElementById('new-product-price').value);
                const stock = Number(document.getElementById('new-product-stock').value);
                const category = document.getElementById('new-product-category').value;
                const image = document.getElementById('new-product-image').value.trim() || 'https://via.placeholder.com/250';

                if (!name || !price || !stock) {
                    alert('لطفاً اطلاعات محصول را کامل وارد کنید.');
                    return;
                }

                let products = JSON.parse(localStorage.getItem('products')) || [];
                const newProd = {
                    id: Date.now(),
                    name,
                    price,
                    stock,
                    category,
                    image
                };
                products.unshift(newProd);
                localStorage.setItem('products', JSON.stringify(products));
                renderProducts();

                document.getElementById('new-product-name').value = '';
                document.getElementById('new-product-price').value = '';
                document.getElementById('new-product-stock').value = '';
                document.getElementById('new-product-image').value = '';
                alert('محصول با موفقیت افزوده شد.');
            });
        }

        // پروفایل کاربری
        function loadProfileData() {
            document.getElementById('profile-phone').value = currentUser.phone;
            document.getElementById('profile-name').value = currentUser.name || '';
            document.getElementById('profile-email').value = currentUser.email || '';
            document.getElementById('profile-address').value = currentUser.address || '';
        }

        document.getElementById('save-profile-btn').addEventListener('click', () => {
            currentUser.name = document.getElementById('profile-name').value.trim();
            currentUser.email = document.getElementById('profile-email').value.trim();
            currentUser.address = document.getElementById('profile-address').value.trim();
            const newPass = document.getElementById('profile-password').value.trim();
            if (newPass) {
                currentUser.password = newPass;
            }

            localStorage.setItem('currentLoggedInUser', JSON.stringify(currentUser));

            // آپدیت در لیست کلی کاربران
            let users = JSON.parse(localStorage.getItem('users')) || [];
            users = users.map(u => u.phone === currentUser.phone ? currentUser : u);
            localStorage.setItem('users', JSON.stringify(users));

            alert('تغییرات پروفایل با موفقیت ذخیره شد.');
        });
    }

    // رندر محصولات در صفحه
    function renderProducts(searchQuery = '') {
        const grid = document.getElementById('products-grid');
        grid.innerHTML = '';
        let products = JSON.parse(localStorage.getItem('products')) || [];
        const currentUser = JSON.parse(localStorage.getItem('currentLoggedInUser'));
        const isAdmin = (currentUser && currentUser.phone === '09056274127');

        const filtered = products.filter(p => {
            const matchesCat = (selectedCategory === 'همه' || p.category === selectedCategory);
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCat && matchesSearch;
        });

        if (filtered.length === 0) {
            grid.innerHTML = '<p>محصولی یافت نشد.</p>';
            return;
        }

        filtered.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';

            let deleteBtnHTML = '';
            if (isAdmin) {
                deleteBtnHTML = `<button class="delete-product-btn" onclick="window.deleteProduct(${product.id})">❌</button>`;
            }

            card.innerHTML = `
                ${deleteBtnHTML}
                <img src="${product.image}" alt="${product.name}">
                <span class="badge">${product.category}</span>
                <h3>${product.name}</h3>
                <p>قیمت: ${product.price.toLocaleString()} تومان</p>
                <p>موجودی: <span id="stock-${product.id}">${product.stock}</span></p>
                <button class="btn" onclick="window.addToCart(${product.id})">افزودن به سبد خرید</button>
            `;
            grid.appendChild(card);
        });
    }

    // حذف دستی محصول توسط ادمین
    window.deleteProduct = function(productId) {
        const currentUser = JSON.parse(localStorage.getItem('currentLoggedInUser'));
        if (!currentUser || currentUser.phone !== '09056274127') return;

        if (confirm('آیا از حذف این محصول اطمینان دارید؟')) {
            let products = JSON.parse(localStorage.getItem('products')) || [];
            products = products.filter(p => p.id !== productId);
            localStorage.setItem('products', JSON.stringify(products));
            renderProducts();
        }
    };

    // افزودن به سبد خرید و کسر موجودی انبار
    window.addToCart = function(productId) {
        let products = JSON.parse(localStorage.getItem('products')) || [];
        let product = products.find(p => p.id === productId);

        if (!product || product.stock <= 0) {
            alert('محصول ناموجود است.');
            return;
        }

        product.stock -= 1;

        // اگر موجودی صفر شد، محصول خودکار حذف شود
        if (product.stock === 0) {
            products = products.filter(p => p.id !== productId);
        }

        localStorage.setItem('products', JSON.stringify(products));

        // افزودن به سبد خرید کاربر
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        let cartItem = cart.find(item => item.id === productId);
        if (cartItem) {
            cartItem.quantity += 1;
        } else {
            cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));

        renderProducts();
        alert('محصول به سبد خرید اضافه شد.');
    };

    // نمایش سبد خرید
    function renderCart() {
        const container = document.getElementById('cart-items-container');
        const totalPriceEl = document.getElementById('cart-total-price');
        container.innerHTML = '';

        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            container.innerHTML = '<p>سبد خرید شما خالی است.</p>';
            totalPriceEl.textContent = '0';
            return;
        }

        let total = 0;
        cart.forEach(item => {
            let itemTotal = item.price * item.quantity;
            total += itemTotal;

            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div>
                    <h4>${item.name}</h4>
                    <p>قیمت واحد: ${item.price.toLocaleString()} تومان | تعداد: ${item.quantity}</p>
                </div>
                <div>
                    <strong>${itemTotal.toLocaleString()} تومان</strong>
                    <button class="btn" style="background:#e74c3c; margin-right:10px;" onclick="window.removeFromCart(${item.id})">حذف</button>
                </div>
            `;
            container.appendChild(div);
        });

        totalPriceEl.textContent = total.toLocaleString();
    }

    // حذف از سبد خرید
    window.removeFromCart = function(productId) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
    };

    // تکمیل خرید
    document.getElementById('checkout-btn').addEventListener('click', () => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            alert('سبد خرید شما خالی است.');
            return;
        }
        alert('خرید شما با موفقیت ثبت شد!');
        localStorage.removeItem('cart');
        renderCart();
    });
});
