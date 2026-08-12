/* ============================================================================
   GLANZO — script.js
   Boutique de lunettes — commande MULTI-ARTICLES via WhatsApp
   ============================================================================ */

/* ============================================================================
   1. CONFIGURATION & BASE DE PRODUITS (JSON Structure)
   ============================================================================ */

const CONFIG = {
  whatsappNumber: "212772595453",
  storeName: "Glanzo",
  currency: "DH",
};

const PRODUCTS = [
  { 
    id: 1, 
    name: "Cartier Abla", 
    price: 149, 
    oldPrice: 239, 
    image: "images/moscotBleue.png", 
    images: ["images/moscotBleue.png"],
    description: "Modèle : Lunettes de Soleil Percées 'ABLA' <br>Verres : Noir 🖤 — Protection UV maximale ☀️<br>Monture : Carrée Percée — Métal Gold Brillant ✨", 
    tags: ["femme", "promo", "nouveaute"] 
  },
  { 
    id: 2, 
    name: "Cartier Abla 3", 
    price: 149, 
    oldPrice: 239, 
    image: "images/ndaderMtracyin.png", 
    images: [
      "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=400&q=80",
      "images/DarkGlasses.jpeg"
    ],
    description: "Modèle : Lunettes de Soleil Percées 'ABLA 3'<br>Verres : Noir 🖤 — Protection UV maximale ☀️<br>Monture : Carrée Percée — Métal Gold Brillant ✨<br>Style : Vintage • Classique • Tendance 😻", 
    tags: ["femme", "promo", "nouveaute"] 
  },
  { 
    id: 3, 
    name: "Cartier Abla 5", 
    price: 149, 
    oldPrice: 239,
    image: "images/moscotImageProfile.png", 
    images: ["images/moscotImageProfile.png"],
    description: "Style iconique et finitions parfaites.", 
    tags: ["homme", "promo", "nouveaute", "moscot"] 
  },
  { 
    id: 4, 
    name: "Cartier Art", 
    price: 149, 
    oldPrice: 239, 
    image: "images/Fakeglasses.png", 
    images: [
      "images/Fakeglasses.png",
      "https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=400&q=80"
    ],
    description: "Monture transparente élégante.", 
    tags: ["optique", "promo", "nouveaute"] 
  },
  { 
    id: 5, 
    name: "Cartier Art 2", 
    price: 149, 
    oldPrice: 239, 
    image: "images/moscotBleue.png", 
    images: [
      "https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=400&q=80",
      "images/moscotBleue.png"
    ],
    description: "Verre bleu glacé, forme hexagonale.", 
    tags: ["homme", "promo", "nouveaute"] 
  },
  { 
    id: 6, 
    name: "MOSCOT BEIGE", 
    price: 149, 
    oldPrice: 239, 
    image: "images/orangeGlasses.png", 
    images: ["https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=400&q=80"],
    description: "Design exclusif et allure royale.", // Updated duplicate description
    tags: ["homme", "promo", "nouveaute"] 
  }
];

const REVIEWS = [
  {
    name: "Mohamed", role: "Client fidèle", stars: 5, avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    text: "Franchement qualité incroyable 😍 les lunettes sont encore plus belles en vrai. La finition gold est premium. Livraison rapide à Casablanca"
  },
  {
    name: "Said", role: "Teacher", stars: 5, avatar: "https://randomuser.me/api/portraits/men/44.jpg",
    text: "Je recommande fortement packaging propre, finition premium et les lunettes attirent vraiment l'attention plusieurs personnes m'ont demandé où je les ai achetées."
  },
  {
    name: "Sara", role: "Étudiante", stars: 5, avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    text: "Très satisfait de ma commande monture solide, légère et confortable. Le style vintage est vraiment tendance et la protection UV400 est parfaite pour le soleil."
  }
];

/* ============================================================================
   2. GESTION DU PANIER & UTILITAIRES
   ============================================================================ */

const state = { 
  cart: JSON.parse(localStorage.getItem("glanzo_cart") || "[]"),
  currentPage: 1,
  lastShopTag: undefined
};

function saveCart() {
  try {
    localStorage.setItem("glanzo_cart", JSON.stringify(state.cart));
  } catch (e) {
    console.error("Impossible de sauvegarder le panier :", e);
  }
}

/* ============================================================================
   RELATED CAROUSEL — État global
   ============================================================================ */
let relatedPage    = 0;
let relatedMaxPage = 0;

function getRelatedPerPage() {
  return window.innerWidth < 768 ? 2 : 3;
}

window.relatedNav = function(dir) {
  const track = document.getElementById('related-track');
  const pag   = document.getElementById('related-pagination');
  if (!track || !track.children.length) return;

  const perPage = getRelatedPerPage();
  const total   = track.children.length;
  relatedMaxPage = Math.max(0, Math.ceil(total / perPage) - 1);

  relatedPage = Math.max(0, Math.min(relatedPage + dir, relatedMaxPage));

  const itemWidth = track.children[0].getBoundingClientRect().width + 18;
  track.style.transform = `translateX(-${relatedPage * perPage * itemWidth}px)`;

  if (pag) pag.textContent = `${relatedPage + 1} / ${relatedMaxPage + 1}`;
};

/* ============================================================================
   REVIEW COVERFLOW — Fonctions globales
   ============================================================================ */
let reviewCenter = 2;

window.reviewNav = function(dir) {
  const track = document.getElementById('review-track');
  if (!track) return;
  const total = track.querySelectorAll('[data-review-index]').length;
  reviewCenter = (reviewCenter + dir + total) % total;
  window.reviewGoTo(reviewCenter);
};

window.reviewGoTo = function(idx) {
  reviewCenter = idx;
  const cards = document.querySelectorAll('[data-review-index]');
  const dots  = document.querySelectorAll('.review-dot');

  cards.forEach(card => {
    const i        = parseInt(card.dataset.reviewIndex);
    const delta    = i - reviewCenter;
    const absDelta = Math.abs(delta);

    const scale   = absDelta === 0 ? 1 : absDelta === 1 ? 0.82 : 0.68;
    const zIndex  = absDelta === 0 ? 5 : absDelta === 1 ? 3 : 1;
    const opacity = absDelta === 0 ? 1 : absDelta === 1 ? 0.85 : 0.6;
    const tx      = delta * 155;
    const rx      = delta < 0 ? 18 : delta > 0 ? -18 : 0;
    const blur    = absDelta >= 2 ? 'blur(1px)' : 'none';
    const w       = absDelta === 0 ? 200 : absDelta === 1 ? 150 : 120;
    const h       = absDelta === 0 ? 380 : absDelta === 1 ? 320 : 260;
    const shadow  = absDelta === 0
      ? '0 20px 60px rgba(0,0,0,0.28)'
      : absDelta === 1
      ? '0 10px 30px rgba(0,0,0,0.18)'
      : '0 4px 15px rgba(0,0,0,0.12)';

    card.style.transform  = `translateX(${tx}px) scale(${scale}) perspective(800px) rotateY(${rx}deg)`;
    card.style.zIndex     = zIndex;
    card.style.opacity    = opacity;
    card.style.filter     = blur;
    card.style.width      = w + 'px';
    card.style.boxShadow  = shadow;
    const img = card.querySelector('img');
    if (img) img.style.height = h + 'px';
  });

  dots.forEach((dot, i) => {
    dot.style.width      = i === reviewCenter ? '22px' : '8px';
    dot.style.background = i === reviewCenter ? '#111' : '#ccc';
  });
};

/* ============================================================================
   UTILITAIRES
   ============================================================================ */

function formatPrice(amount) { return `${amount.toFixed(2)} ${CONFIG.currency}`; }
function getProductById(id) { return PRODUCTS.find((p) => p.id === Number(id)); }

function buildWhatsAppLink(message) {
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function buildCartWhatsAppMessage() {
  let msg = `Bonjour ${CONFIG.storeName}, je souhaite valider ma commande :\n\n`;
  let totalGénéral = 0;

  state.cart.forEach((item, index) => {
    const prod = getProductById(item.id);
    if (prod) {
      const sousTotal = prod.price * item.qty;
      totalGénéral += sousTotal;
      msg += `${index + 1}) ${prod.name}\n    Qté : ${item.qty} |  Prix : ${formatPrice(prod.price)}\n    Sous-total : ${formatPrice(sousTotal)}\n\n`;
    }
  });

  msg += `---------------------------\n`;
  msg += `Total de la commande : ${formatPrice(totalGénéral)}\n`;
  msg += `Mode de règlement : Paiement à la livraison (COD)\n\nMerci de me confirmer la prise en compte de ma commande.`;
  return msg;
}

function productOrderMessage(product, qty = 1) {
  return `Bonjour ${CONFIG.storeName}, je souhaite commander en direct :\n\n Produit : ${product.name}\n Prix unitaire : ${formatPrice(product.price)}\n Quantité : ${qty}\n Total : ${formatPrice(product.price * qty)}\n\nMerci de me confirmer la disponibilité.`;
}

function toggleDrawer(isOpen) {
  const drawer = document.getElementById("cart-drawer");
  if (drawer) {
    drawer.classList.toggle("is-open", isOpen);
  }
}

window.changeDrawerQuantity = function(productId, direction) {
  productId = Number(productId);
  const item = state.cart.find((it) => it.id === productId);
  if (item) {
    item.qty += direction;
    if (item.qty <= 0) {
      state.cart = state.cart.filter((it) => it.id !== productId);
      saveCart();
      updateCartBadge();
      toggleDrawer(false);
      return;
    }
    saveCart();
    updateCartBadge();
    const product = getProductById(productId);
    if (product) {
      renderDrawerContent(product);
    }
  }
};

function renderDrawerContent(product) {
  const drawerContent = document.getElementById("cart-drawer-content");
  if (!drawerContent) return;

  const cartItem = state.cart.find((it) => it.id === product.id);
  const currentQty = cartItem ? cartItem.qty : 1;
  const currentCartCount = getCartCount();

  drawerContent.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px;">
      <div style="display: flex; align-items: center; gap: 10px; font-size: 16px; color: #333; font-weight: 500;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Article ajouté au panier
      </div>
      <button data-action="close-drawer" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #999; padding: 5px;">&times;</button>
    </div>

    <div style="display: flex; align-items: flex-start; gap: 15px; margin-bottom: 40px;">
      <img src="${product.image}" alt="${product.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 12px; background: #f5f5f5;">
      <div>
        <h3 style="font-size: 18px; font-weight: 600; color: #1e1a29; margin: 0 0 5px 0;">${product.name}</h3>
        <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">Quantité désirée :</p>
        <div class="drawer-qty-counter">
          <button type="button" class="drawer-qty-btn" onclick="changeDrawerQuantity(${product.id}, -1)">-</button>
          <span class="drawer-qty-value">${currentQty}</span>
          <button type="button" class="drawer-qty-btn" onclick="changeDrawerQuantity(${product.id}, 1)">+</button>
        </div>
      </div>
    </div>

    <div style="margin-top: auto; display: flex; flex-direction: column; align-items: center; width: 100%;">
      <button class="drawer-btn drawer-btn-gray" data-action="navigate-hide-drawer" data-route="#/cart">
        Voir le panier (${currentCartCount})
      </button>
      <button class="drawer-btn drawer-btn-green" data-action="checkout-cart">
        Finaliser Commande avec Whatsapp
      </button>
      <button class="drawer-link-underline" data-action="close-drawer">
        Continuer les achats
      </button>
    </div>
  `;
}

function addToCart(id) {
  id = Number(id);
  const product = getProductById(id);
  if (!product) return;

  const existing = state.cart.find((it) => it.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ id, qty: 1 });
  }
  
  saveCart();
  updateCartBadge();
  renderDrawerContent(product);
  toggleDrawer(true);
}

window.addToCartFromModal = function(id) {
  id = Number(id);
  const product = getProductById(id);
  if (!product) return;

  const existing = state.cart.find((it) => it.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ id, qty: 1 });
  }

  saveCart();
  updateCartBadge();
  showAddToCartToast(product.name);
};

function showAddToCartToast(productName) {
  let toast = document.getElementById('add-to-cart-toast');
  if (toast) toast.remove();

  const isMobile = window.innerWidth < 640;

  toast = document.createElement('div');
  toast.id = 'add-to-cart-toast';
  toast.style.cssText = `
    position:fixed;top:${isMobile ? '14px' : '24px'};left:50%;transform:translateX(-50%) translateY(-20px);
    background:#1e7e34;color:#fff;border-radius:${isMobile ? '10px' : '12px'};
    display:flex;align-items:center;gap:${isMobile ? '7px' : '10px'};font-family:inherit;
    font-size:${isMobile ? '12px' : '14px'};font-weight:600;
    padding:${isMobile ? '10px 14px' : '14px 22px'};
    box-shadow:0 8px 24px rgba(0,0,0,0.25);z-index:99999;
    opacity:0;transition:opacity 0.3s ease, transform 0.3s ease;
    max-width:92vw;white-space:nowrap;overflow:hidden;
  `;
  toast.innerHTML = `
    <svg width="${isMobile ? '16' : '20'}" height="${isMobile ? '16' : '20'}" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" style="flex-shrink:0;">
      <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.18)"></circle>
      <polyline points="7 12.5 10.5 16 17 8"></polyline>
    </svg>
    <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${productName} ajouté au panier avec succès</span>
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-20px)';
    setTimeout(() => toast.remove(), 320);
  }, 2200);
}

function updateQuantity(id, qty) {
  id = Number(id);
  const item = state.cart.find((it) => it.id === id);
  if (item) {
    item.qty = Number(qty);
    if (item.qty <= 0) {
      removeFromCart(id);
      return;
    }
  }
  saveCart();
  updateCartBadge();
  render();
}

function removeFromCart(id) {
  id = Number(id);
  state.cart = state.cart.filter((it) => it.id !== id);
  saveCart();
  updateCartBadge();
  render();
}

function getCartCount() { return state.cart.reduce((sum, it) => sum + it.qty, 0); }

function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;
  const count = getCartCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? "flex" : "none";
}

window.changeMainImage = function(imageUrl, el) {
  const mainImg = document.getElementById("product-main-img");
  if (mainImg) mainImg.src = imageUrl;
  if (el) {
    const container = el.parentElement;
    container.querySelectorAll("img").forEach(img => {
      img.style.border = "1.5px solid #e0e0e0";
    });
    el.style.border = "2px solid #111";
  }
};

/* ============================================================================
   3. RENDU DES VUES (Composants HTML)
   ============================================================================ */

function productCardHTML(product) {
  return `
    <article class="product-card" data-action="navigate" data-route="#/product/${product.id}" style="cursor: pointer;">
      <div class="product-image-container">
        <img src="${product.image}" alt="${product.name}" class="product-img">
        ${product.oldPrice ? `<span class="badge-promotion">Promotion</span>` : ""}
      </div>
      <div class="product-info">
        <h3 class="product-title">${product.name}</h3>
        <div class="product-price-wrapper">
          ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>` : ""}
          <span class="current-price">${formatPrice(product.price)}</span>
        </div>
      </div>
    </article>
  `;
}

function reviewCardHTML(review) {
  return `
    <div class="review-card">
      <div class="stars">★★★★★</div>
      <p class="review-text">"${review.text}"</p>
      <div class="review-author">
        <img src="${review.avatar}" alt="${review.name}">
        <div>
          <strong>${review.name}</strong>
          <small>${review.role}</small>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================================
   4. ROUTEUR ET PAGES
   ============================================================================ */

function renderHomePage() {
  const newArrivals = PRODUCTS.filter((p) => p.tags.includes("nouveaute")).slice(0, 8);
  
  const instagramImages = [
    "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=600&q=80",
    "images/omarzaml.png",
    "images/lunetteFemmes.jpg",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80",
    "images/DarkGlasses.jpeg",
    "https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80"
  ];

  return `
    <section class="hero-section">
      <div class="hero-wrapper">
        <div class="hero-box">
          <h2>50% OFF FOR ALL</h2>
          <button class="btn-white" data-action="navigate" data-route="#/shop">Shop now</button>
        </div>
        <div class="hero-image">
          <img src="images/omarzaml.png" alt="Lunettes Homme">
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Nouvel Arrivage</h2>
      <div class="product-grid">
        ${newArrivals.map(productCardHTML).join("")}
      </div>
    </section>

    <section class="premium-showroom">
      <div class="showroom-header fade-in-scroll">
        <h1 class="showroom-title">Collection</h1>
        <p class="showroom-subtitle">Discover <strong>timeless vintage elegance</strong> and <strong>modern style</strong> in every frame.</p>
      </div>

      <div class="categories-container fade-in-scroll">
        <div class="category-item" data-action="navigate" data-route="#/shop/femme">
          <div class="category-avatar">
            <img src="images/lunetteFemmes.jpg" alt="Women Collection">
            <span class="avatar-brand-overlay">GLANZO</span>
          </div>
          <h3 class="category-label">Women</h3>
        </div>

        <div class="category-item" data-action="navigate" data-route="#/shop/homme">
          <div class="category-avatar">
            <img src="images/omarzaml.png" alt="Men Collection">
            <span class="avatar-brand-overlay">GLANZO</span>
          </div>
          <h3 class="category-label">Men</h3>
        </div>

        <div class="category-item" data-action="navigate" data-route="#/shop/optique">
          <div class="category-avatar">
            <img src="https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=400&q=80" alt="Optical Collection">
            <span class="avatar-brand-overlay">GLANZO</span>
          </div>
          <h3 class="category-label">Optical</h3>
        </div>
      </div>

      <div class="instagram-cta fade-in-scroll">
        <div class="cta-text-side">
          <span class="cta-heading">JOIN US ON INSTAGRAM</span>
          <h2 class="cta-hashtag">#GLANZO</h2>
        </div>
        <a href="https://www.instagram.com/abj__0mar/" target="_blank" rel="noopener" class="instagram-badge-btn">
          <i class="fa-brands fa-instagram"></i>
          <span class="badge-username">@GLANZO </span>
        </a>
      </div>

      <div class="instagram-gallery-grid">
        ${instagramImages.map(img => `
          <div class="gallery-tile fade-in-scroll">
            <img src="${img}" alt="Style Look">
            <div class="tile-overlay"><a href="https://www.instagram.com/abj__0mar/"></a></div>
          </div>
        `).join("")}
      </div>
    </section>

    <section class="section" style="background: #fdfdfd; padding: 60px 20px; border-radius: 20px;">
      <h2 class="section-title">What People Are Saying</h2>
      <div class="testimonials-grid">
        ${REVIEWS.map(reviewCardHTML).join("")}
      </div>
    </section>
  `;
}

function renderShopPage(tag) {
  const ITEMS_PER_PAGE = 20;
  const activeTag = (tag || "").toLowerCase().trim();
  const filteredProducts = activeTag
    ? PRODUCTS.filter(p => p.tags && p.tags.includes(activeTag))
    : PRODUCTS;

  const totalProducts = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / ITEMS_PER_PAGE));

  if (state.currentPage > totalPages) state.currentPage = 1;

  const startIndex = (state.currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const productsToDisplay = filteredProducts.slice(startIndex, endIndex);

  const TAG_LABELS = {
    femme: "Lunette Femme",
    homme: "Lunette Homme",
    optique: "Optique",
    moscot: "Moscot Series",
    promo: "Promotions",
    nouveaute: "Nouveautés"
  };

  const filterBarHtml = activeTag ? `
    <div style="width:100%;display:flex;align-items:center;justify-content:center;gap:10px;
                flex-wrap:wrap;margin-bottom:30px;">
      <span style="font-size:13px;font-weight:600;color:#666;">
        Filtré par : <strong style="color:#111;">${TAG_LABELS[activeTag] || activeTag}</strong>
      </span>
      <span data-action="navigate" data-route="#/shop"
            style="font-size:13px;font-weight:600;color:#111;text-decoration:underline;
                   cursor:pointer;">
        Effacer le filtre ✕
      </span>
    </div>
  ` : "";

  let productsHtml = productsToDisplay.map(product => `
    <div class="product-card" data-action="navigate" data-route="#/product/${product.id}">
      <div class="product-image-container">
        ${product.oldPrice ? '<span class="badge-promotion">Promotion</span>' : ''}
        <img src="${product.image}" alt="${product.name}" class="product-img">
      </div>
      <div class="product-info">
        <h3 class="product-title">${product.name}</h3>
        <div class="product-price-wrapper">
          ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>` : ''}
          <span class="current-price">${formatPrice(product.price)}</span>
        </div>
      </div>
    </div>
  `).join("");

  let paginationHtml = '';
  if (totalPages > 1) {
    paginationHtml = '<div class="pagination-container">';

    if (state.currentPage > 1) {
      paginationHtml += `
        <span class="pagination-item pagination-prev"
              data-action="change-page"
              data-page="${state.currentPage - 1}"
              data-tag="${activeTag}">
          &lt;
        </span>
      `;
    }

    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (state.currentPage > 3) pages.push('...');
      const start = Math.max(2, state.currentPage - 1);
      const end   = Math.min(totalPages - 1, state.currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (state.currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    pages.forEach(p => {
      if (p === '...') {
        paginationHtml += `<span class="pagination-item pagination-ellipsis">…</span>`;
      } else {
        const isActive = p === state.currentPage;
        paginationHtml += `
          <span class="pagination-item ${isActive ? 'is-active' : ''}"
                data-action="change-page"
                data-page="${p}"
                data-tag="${activeTag}">
            ${p}
          </span>
        `;
      }
    });

    if (state.currentPage < totalPages) {
      paginationHtml += `
        <span class="pagination-item pagination-next"
              data-action="change-page"
              data-page="${state.currentPage + 1}"
              data-tag="${activeTag}">
          &gt;
        </span>
      `;
    }

    paginationHtml += '</div>';
  }

  return `
    <div class="shop-page-container">
      ${filterBarHtml}
      <div class="products-grid">
        ${productsHtml || '<p style="padding:60px 0;color:#888;">Aucun produit disponible pour ce filtre.</p>'}
      </div>
      ${paginationHtml}
    </div>
  `;
}

function renderCollectionPage() {
  const collections = [
    { label: "ALL COLLECTIONS", img: "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=400&q=80", tag: "" },
    { label: "MOSCOT SERIES", img: "images/Collection MOSCOT.jpeg", tag: "moscot" },
    { label: "LUNETTE FEMME", img: "images/lunetteFemmes.jpg", tag: "femme" },
    { label: "LUNETTE HOMME", img: "images/omarzaml.png", tag: "homme" },
  ];

  return `
    <section class="section">
      <h1 class="section-title">Collections</h1>
      <div class="collection-grid">
        ${collections.map(c => `
          <div class="collection-card" data-action="navigate" data-route="#/shop/${c.tag}">
            <img class="collection-img" src="${c.img}" alt="${c.label}">
            <div class="collection-label">
              <span>${c.label}</span>
              <span>→</span>
            </div>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function render404Page() {
  return `
    <section class="section" style="text-align:center;padding:100px 20px;">
      <h1 class="section-title">404</h1>
      <p style="color:#666;margin-bottom:30px;">Cette page n'existe pas.</p>
      <button class="btn-primary" data-action="navigate" data-route="#/home" style="max-width:250px;margin:0 auto;">Retour à l'accueil</button>
    </section>
  `;
}

function renderContactPage() {
  return `
    <section class="section">
      <h1 class="section-title">CONTACT US</h1>
      <p style="text-align:center; margin-bottom: 40px; color: #666;">Have a question or feedback? We're here to help. Send us a message.</p>
      
      <div class="contact-container">
        <div class="contact-info-box">
          <h3>Contact Information</h3>
          <p style="color: #aaa; font-size: 14px;">Email</p>
          <p>glanvoshop@gmail.com</p>
          <p style="color: #aaa; font-size: 14px; margin-top: 15px;">Numéro de téléphone</p>
          <p>+212 6 17 69 96 82</p>
          <p style="color: #aaa; font-size: 14px; margin-top: 15px;">Adresse</p>
          <p>SIDI MAAROUF CASABLANCA</p>
        </div>
        <div class="contact-form">
          <input type="text" id="contact-name" placeholder="Nom *" required>
          <input type="email" id="contact-email" placeholder="E-mail *" required>
          <input type="tel" id="contact-phone" placeholder="Numéro de téléphone *" required>
          <textarea id="contact-message" placeholder="Laissez un commentaire... *" required></textarea>
          <div id="contact-status" style="margin-bottom: 15px; font-weight: 500; font-size: 14px; display: none;"></div>
          <button class="btn-outline" data-action="submit-contact">Envoyer</button>
        </div>
      </div>
    </section>
  `;
}

function renderProductPage(id) {
  const product = getProductById(id);
  if (!product) return `<section class="section"><p class="empty-text">Produit introuvable.</p></section>`;

  const related = PRODUCTS.filter(p => p.id !== product.id).slice(0, 8);
  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const relatedPerPageInit = getRelatedPerPage();
  const relatedCardBasis = (100 / relatedPerPageInit).toFixed(4);

  const thumbnailsHTML = images.map((imgUrl, i) => `
    <img src="${imgUrl}" alt="${product.name}"
      onclick="changeMainImage('${imgUrl}', this)"
      style="width:80px;height:80px;border-radius:10px;cursor:pointer;object-fit:cover;flex-shrink:0;
             border:${i === 0 ? '2px solid #111' : '1.5px solid #e0e0e0'};transition:border 0.2s;">
  `).join("");

  const reviewVideos = [
    { thumb: "videos/Plage.mp4", type: "video", overlay: { product: { name: "Moscot Halo 4", price: "179.00 dh", soldOut: false, productId: 2, productThumb: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=60&q=80" } } },
    { thumb: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80", type: "image", overlay: { product: { name: "Moscot Halo 4", price: "179.00 dh", soldOut: false, productId: 2, productThumb: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=60&q=80" } } },
    { thumb: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80", type: "image", overlay: { product: { name: "Moscot Halo 4", price: "179.00 dh", soldOut: false, productId: 2, productThumb: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=60&q=80" } } },
    { thumb: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80", type: "image", overlay: { product: { name: "Moscot Halo 4", price: "179.00 dh", soldOut: false, productId: 2, productThumb: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=60&q=80" } } },
    { thumb: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=300&q=80", type: "image", overlay: { product: { name: "Moscot Halo 4", price: "179.00 dh", soldOut: false, productId: 2, productThumb: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=60&q=80" } } },
  ];

  // Expose review data for modal
  window._reviewVideosData = reviewVideos;

  // Reset carousel state when product page renders
  reviewCenter = 2;
  relatedPage  = 0;

  return `
    <section style="max-width:1200px;margin:40px auto;padding:0 20px;">

      <!-- ═══ GALERIE + INFOS ═══ -->
      <div style="display:flex;flex-wrap:wrap;gap:48px;margin-bottom:70px;align-items:flex-start;">

        <!-- Galerie gauche -->
        <div style="flex:1;min-width:300px;max-width:500px;">
          <div style="position:relative;border-radius:20px;overflow:hidden;background:#f5f5f7;
                      box-shadow:0 8px 40px rgba(0,0,0,0.10);margin-bottom:14px;">
            <img id="product-main-img" src="${images[0]}" alt="${product.name}"
                 style="width:100%;aspect-ratio:1/1;object-fit:cover;display:block;">
            <button onclick="(function(){const img=document.getElementById('product-main-img');if(img){const overlay=document.createElement('div');overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;';overlay.onclick=()=>overlay.remove();const i=document.createElement('img');i.src=img.src;i.style.cssText='max-width:90vw;max-height:90vh;border-radius:12px;object-fit:contain;';overlay.appendChild(i);document.body.appendChild(overlay);}})();"
                  style="position:absolute;top:14px;left:14px;background:rgba(255,255,255,0.88);
                        border:none;border-radius:10px;padding:8px;cursor:pointer;
                        box-shadow:0 2px 8px rgba(0,0,0,0.12);">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
              </svg>
            </button>
          </div>
          <div style="display:flex;gap:10px;overflow-x:auto;padding-bottom:4px;">
            ${thumbnailsHTML}
          </div>
        </div>

        <!-- Infos droite -->
        <div style="flex:1;min-width:300px;">
          <h1 style="font-size:34px;font-weight:700;color:#111;margin:0 0 12px;letter-spacing:-0.5px;">${product.name}</h1>

          <div style="display:flex;align-items:center;gap:7px;margin-bottom:18px;">
            <span style="width:9px;height:9px;background:#4caf50;border-radius:50%;display:inline-block;
                         box-shadow:0 0 0 3px rgba(76,175,80,0.2);"></span>
            <span style="font-size:13px;color:#4caf50;font-weight:600;">11 en stock</span>
          </div>

          <div style="display:flex;align-items:center;gap:12px;margin-bottom:4px;flex-wrap:wrap;">
            ${product.oldPrice ? `<span style="font-size:16px;color:#bbb;text-decoration:line-through;">${formatPrice(product.oldPrice)}</span>` : ""}
            <span style="font-size:19px;font-weight:700;color:#111;">${formatPrice(product.price)}</span>
            ${product.oldPrice ? `<span style="background:#111;color:#fff;font-size:12px;padding:4px 14px;border-radius:20px;font-weight:600;letter-spacing:0.3px;">Promotion</span>` : ""}
          </div>
          <p style="font-size:12px;color:#bbb;margin-bottom:28px;">Taxes incluses.</p>

          <!-- Bouton Panier -->
          <button data-action="add-to-cart" data-id="${product.id}"
                  style="width:100%;padding:15px;background:#c8c8c8;border:none;border-radius:12px;
                         color:#fff;font-size:15px;font-weight:700;margin-bottom:12px;cursor:pointer;
                         font-family:inherit;letter-spacing:0.2px;
                         box-shadow:0 2px 10px rgba(0,0,0,0.08);transition:background 0.2s;">
            Ajouter au panier
          </button>

          <!-- Bouton WhatsApp -->
          <button data-action="buy-now" data-id="${product.id}"
                  style="width:100%;padding:16px;background:linear-gradient(135deg,#2b91d7,#1a7bbf);
                         border:none;border-radius:12px;color:#fff;font-size:15px;font-weight:700;
                         cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;
                         box-shadow:0 6px 20px rgba(43,145,215,0.35);font-family:inherit;
                         transition:transform 0.2s,box-shadow 0.2s;">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.2 9.3M17 13v7m-10 0a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z"/>
            </svg>
            Achetez avec paiement à la livraison
          </button>

          <!-- Description -->
          <div style="margin-top:30px;font-size:14px;line-height:1.9;color:#555;
                      border-top:1px solid #eee;padding-top:24px;">
            ${product.description}
          </div>

          <!-- ── Accordéons ── -->
          <div style="margin-top:8px;">

            <!-- Packaging -->
            <details style="border-top:1px solid #eee;border-bottom:1px solid #eee;" open>
              <summary style="display:flex;justify-content:space-between;align-items:center;
                              padding:18px 0;cursor:pointer;font-size:14px;font-weight:700;
                              list-style:none;user-select:none;">
                <span style="display:flex;align-items:center;gap:10px;color:#111;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M21 16V8l-9-4-9 4v8l9 4 9-4z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/>
                  </svg>
                  Packaging original
                </span>
                <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2">
                  <polyline points="18 15 12 9 6 15"/>
                </svg>
              </summary>
              <div style="padding:0 0 22px;">
                <div style="background:#f9f9fb;border-radius:16px;display:flex;align-items:center;
                            justify-content:center;padding:40px 20px;
                            box-shadow:inset 0 2px 8px rgba(0,0,0,0.04);">
                  <img src="images/DarkGlasses.jpeg"
                       alt="Packaging"
                       onerror="this.src='https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80'"
                       style="max-width:260px;border-radius:12px;
                              box-shadow:0 8px 30px rgba(0,0,0,0.12);">
                </div>
              </div>
            </details>

            <!-- Delivery -->
            <details style="border-bottom:1px solid #eee;">
              <summary style="display:flex;justify-content:space-between;align-items:center;
                              padding:18px 0;cursor:pointer;font-size:14px;font-weight:700;
                              list-style:none;user-select:none;">
                <span style="display:flex;align-items:center;gap:10px;color:#111;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect x="1" y="3" width="15" height="13"/>
                    <path d="M16 8h4l3 3v5h-7V8z"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                  Delivery time
                </span>
                <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2">
                  <polyline points="18 15 12 9 6 15"/>
                </svg>
              </summary>
              <div style="padding:0 0 22px;font-size:13px;line-height:2;color:#555;">
                Livraison rapide partout au Maroc :<br>
                <strong style="color:#222;">–24H pour les villes proches</strong> et les grandes villes
                comme Casablanca, Marrakech, Rabat, Tanger… etc<br>
                <strong style="color:#222;">–48H pour les villages et les villes éloignées</strong> comme Dakhla.
              </div>
            </details>

          </div>
        </div>
      </div>

      <!-- ═══ REAL CUSTOMERS REVIEWS — Coverflow 3D ═══ -->
      <div style="margin-bottom:70px;">
        <h2 style="font-size:24px;font-weight:700;color:#111;margin-bottom:32px;">Real customers reviews</h2>

        <div style="position:relative;padding:20px 0 50px;">

          <!-- Carousel wrapper -->
          <div style="position:relative;overflow:hidden;">
            <div id="review-track"
                 style="display:flex;align-items:center;justify-content:center;
                        position:relative;height:440px;perspective:1000px;">
              ${reviewVideos.map((v, i) => {
                const isCenter = i === reviewCenter;
                const delta    = i - reviewCenter;
                const absDelta = Math.abs(delta);
                const scale    = absDelta === 0 ? 1 : absDelta === 1 ? 0.82 : 0.68;
                const zIdx     = absDelta === 0 ? 5 : absDelta === 1 ? 3 : 1;
                const opacity  = absDelta === 0 ? 1 : absDelta === 1 ? 0.85 : 0.6;
                const tx       = delta * 155;
                const rx       = delta < 0 ? 18 : delta > 0 ? -18 : 0;
                const blur     = absDelta >= 2 ? 'blur(1px)' : 'none';
                const width    = absDelta === 0 ? 200 : absDelta === 1 ? 150 : 120;
                const height   = absDelta === 0 ? 400 : absDelta === 1 ? 330 : 260;
                const shadow   = absDelta === 0
                  ? '0 20px 60px rgba(0,0,0,0.28)'
                  : absDelta === 1
                  ? '0 10px 30px rgba(0,0,0,0.18)'
                  : '0 4px 15px rgba(0,0,0,0.12)';

                /* Mini overlay shown on the card itself (text label or small product badge) */
                let cardOverlayHTML = '';
                if (v.overlay) {
                  if (v.overlay.text) {
                    cardOverlayHTML = `
                      <div style="position:absolute;bottom:0;left:0;right:0;
                        background:linear-gradient(transparent,rgba(0,0,0,0.65));
                        color:#fff;font-size:16px;font-weight:800;
                        padding:20px 14px 16px;border-radius:0 0 16px 16px;letter-spacing:1px;">
                        ${v.overlay.text}
                      </div>`;
                  } else if (v.overlay.product) {
                    const p = v.overlay.product;
                    cardOverlayHTML = `
                      <div style="position:absolute;bottom:0;left:0;right:0;
                        background:rgba(255,255,255,0.96);border-radius:0 0 16px 16px;
                        padding:10px 12px;backdrop-filter:blur(6px);">
                        <p style="font-size:11px;font-weight:700;color:#111;margin:0 0 3px;
                                  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</p>
                        <p style="font-size:12px;font-weight:700;color:#111;margin:0 0 7px;">${p.price}</p>
                        <div style="width:100%;padding:6px;border-radius:7px;text-align:center;
                                    background:${p.soldOut ? '#ddd' : '#111'};
                                    color:${p.soldOut ? '#888' : '#fff'};
                                    font-size:11px;font-weight:700;">
                          ${p.soldOut ? 'Sold out' : 'Shop now'}
                        </div>
                      </div>`;
                  }
                }

                const mediaHTML = v.type === 'video'
                  ? `<video src="${v.thumb}" style="width:100%;height:${height}px;object-fit:cover;display:block;" playsinline muted></video>`
                  : `<img src="${v.thumb}" alt="review" style="width:100%;height:${height}px;object-fit:cover;display:block;">`;

                return `
                  <div onclick="openReviewModal(${i})"
                       style="position:absolute;width:${width}px;
                              transform:translateX(${tx}px) scale(${scale}) perspective(800px) rotateY(${rx}deg);
                              z-index:${zIdx};opacity:${opacity};filter:${blur};
                              transition:all 0.4s cubic-bezier(0.25,1,0.5,1);
                              border-radius:16px;overflow:hidden;cursor:pointer;box-shadow:${shadow};"
                       data-review-index="${i}">
                    ${mediaHTML}
                    <!-- Play button for video -->
                    ${v.type === 'video' ? `
                    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
                                width:44px;height:44px;background:rgba(255,255,255,0.92);
                                border-radius:50%;display:flex;align-items:center;justify-content:center;
                                box-shadow:0 2px 12px rgba(0,0,0,0.2);pointer-events:none;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#111"><polygon points="5,3 19,12 5,21"/></svg>
                    </div>` : ''}
                    ${cardOverlayHTML}
                  </div>
                `;
              }).join("")}
            </div>
          </div>

          <!-- Dots -->
          <div style="display:flex;justify-content:center;gap:8px;margin-top:20px;">
            ${reviewVideos.map((_, i) => `
              <div onclick="reviewGoTo(${i})"
                   style="width:${i===reviewCenter?'22px':'8px'};height:8px;border-radius:20px;cursor:pointer;
                          background:${i===reviewCenter?'#111':'#ccc'};transition:all 0.3s;"
                   class="review-dot" data-dot="${i}"></div>
            `).join("")}
          </div>

          <!-- Arrows -->
          <div style="display:flex;justify-content:space-between;align-items:center;
                      margin-top:16px;padding:0 10px;">
            <button onclick="reviewNav(-1)"
                    style="background:none;border:none;font-size:28px;color:#555;cursor:pointer;
                           padding:8px 16px;border-radius:50%;transition:background 0.2s;"
                    onmouseover="this.style.background='#f0f0f0'"
                    onmouseout="this.style.background='none'">‹</button>
            <button onclick="reviewNav(1)"
                    style="background:none;border:none;font-size:28px;color:#555;cursor:pointer;
                           padding:8px 16px;border-radius:50%;transition:background 0.2s;"
                    onmouseover="this.style.background='#f0f0f0'"
                    onmouseout="this.style.background='none'">›</button>
          </div>
        </div>
      </div>

      <!-- ═══ MODAL REVIEW ═══ -->
      <div id="review-modal"
           style="display:none;position:fixed;inset:0;z-index:9000;
                  background:rgba(0,0,0,0.75);align-items:center;justify-content:center;padding:16px;">
        <div id="review-modal-inner"
             style="background:#fff;border-radius:20px;overflow:hidden;
                    display:flex;flex-direction:row;width:100%;max-width:860px;
                    max-height:90vh;position:relative;box-shadow:0 30px 80px rgba(0,0,0,0.4);
                    margin:auto;">

          <!-- Close btn -->
          <button onclick="closeReviewModal()"
                  style="position:absolute;top:14px;right:14px;z-index:10;
                         width:34px;height:34px;border-radius:50%;border:none;
                         background:#222;color:#fff;font-size:18px;cursor:pointer;
                         display:flex;align-items:center;justify-content:center;
                         box-shadow:0 2px 8px rgba(0,0,0,0.3);">✕</button>

          <!-- Arrow prev -->
          <button onclick="reviewModalNav(-1)"
                  style="position:absolute;left:10px;top:50%;transform:translateY(-50%);z-index:10;
                         width:36px;height:36px;border-radius:50%;border:none;
                         background:rgba(255,255,255,0.9);color:#222;font-size:22px;cursor:pointer;
                         display:flex;align-items:center;justify-content:center;
                         box-shadow:0 2px 8px rgba(0,0,0,0.2);">‹</button>

          <!-- Arrow next -->
          <button onclick="reviewModalNav(1)"
                  style="position:absolute;right:10px;top:50%;transform:translateY(-50%);z-index:10;
                         width:36px;height:36px;border-radius:50%;border:none;
                         background:rgba(255,255,255,0.9);color:#222;font-size:22px;cursor:pointer;
                         display:flex;align-items:center;justify-content:center;
                         box-shadow:0 2px 8px rgba(0,0,0,0.2);">›</button>

          <!-- Media side -->
          <div id="modal-media-side"
               style="flex:0 0 auto;width:300px;background:#000;
                      display:flex;align-items:center;justify-content:center;min-height:500px;">
          </div>

          <!-- Info side -->
          <div id="modal-info-side"
               style="flex:1;padding:36px 28px;display:flex;flex-direction:column;
                      justify-content:center;overflow-y:auto;">
          </div>
        </div>
      </div>

      <!-- ═══ YOU MAY ALSO LIKE — Horizontal Carousel ═══ -->
      <div style="margin-bottom:60px;" id="related-section">
        <h2 style="font-size:24px;font-weight:700;color:#111;margin-bottom:28px;">You may also like</h2>

        <div style="position:relative;overflow:hidden;">
          <div id="related-track" style="display:flex;gap:18px;transition:transform 0.4s cubic-bezier(0.25,1,0.5,1);will-change:transform;">
            ${related.map(p => `
              <div data-action="navigate" data-route="#/product/${p.id}"
                   style="flex:0 0 calc(${relatedCardBasis}% - 12px);min-width:220px;background:#fff;border-radius:18px;
                          overflow:hidden;cursor:pointer;
                          box-shadow:0 4px 20px rgba(0,0,0,0.07);
                          transition:transform 0.2s,box-shadow 0.2s;"
                   onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 10px 30px rgba(0,0,0,0.12)'"
                   onmouseout="this.style.transform='none';this.style.boxShadow='0 4px 20px rgba(0,0,0,0.07)'">
                <div style="position:relative;background:#fff;">
                  <img src="${p.image}" alt="${p.name}"
                       style="width:100%;height:220px;object-fit:cover;display:block;">
                  <span style="position:absolute;bottom:12px;left:12px;background:#111;color:#fff;
                               font-size:11px;font-weight:700;padding:5px 14px;
                               border-radius:20px;letter-spacing:0.3px;">Promotion</span>
                </div>
                <div style="padding:16px;background:#fafafa;text-align:center;">
                  <p style="font-size:14px;font-weight:600;color:#222;margin:0 0 8px;">${p.name}</p>
                  <div style="display:flex;justify-content:center;align-items:center;gap:10px;flex-wrap:wrap;">
                    ${p.oldPrice ? `<span style="font-size:12px;color:#bbb;text-decoration:line-through;">${formatPrice(p.oldPrice)}</span>` : ""}
                    <span style="font-size:13px;font-weight:700;color:#111;">${formatPrice(p.price)}</span>
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Pagination nav -->
        <div style="display:flex;align-items:center;justify-content:center;gap:16px;margin-top:28px;">
          <button onclick="relatedNav(-1)"
                  style="background:none;border:none;font-size:22px;color:#555;cursor:pointer;
                         padding:8px 16px;border-radius:50%;transition:background 0.2s;"
                  onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='none'">‹</button>
          <span id="related-pagination" style="font-size:13px;color:#888;font-weight:500;">1 / …</span>
          <button onclick="relatedNav(1)"
                  style="background:none;border:none;font-size:22px;color:#555;cursor:pointer;
                         padding:8px 16px;border-radius:50%;transition:background 0.2s;"
                  onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='none'">›</button>
        </div>
      </div>

    </section>
  `;
}

// NOUVELLE VUE : Rendu dynamique de la page du panier global
function renderCartPage() {
  if (state.cart.length === 0) {
    return `
      <section class="section" style="text-align: center; padding: 80px 20px;">
        <h1 class="section-title">Votre Panier</h1>
        <p style="color: #666; margin-bottom: 30px;">Votre panier est actuellement vide.</p>
        <button class="btn-primary" data-action="navigate" data-route="#/shop" style="max-width: 250px; margin: 0 auto;">Découvrir nos produits</button>
      </section>
    `;
  }

  let totalCart = 0;
  const itemsHTML = state.cart.map(item => {
    const prod = getProductById(item.id);
    if (!prod) return '';
    const itemTotal = prod.price * item.qty;
    totalCart += itemTotal;

    return `
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #eee; padding: 20px 0; flex-wrap: wrap; gap: 15px;">
        <div style="display: flex; align-items: center; gap: 20px; flex: 1; min-width: 250px;">
          <img src="${prod.image}" alt="${prod.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 10px;">
          <div>
            <h3 style="font-size: 18px; margin: 0 0 5px 0; color: #1e1a29;">${prod.name}</h3>
            <span style="font-weight: 600; color: #666;">${formatPrice(prod.price)}</span>
          </div>
        </div>
        
        <div style="display: flex; align-items: center; gap: 25px;">
          <div style="display: flex; align-items: center; border: 1px solid #ccc; border-radius: 6px; overflow: hidden;">
            <button onclick="updateQuantity(${item.id}, ${item.qty - 1})" style="padding: 5px 12px; background: #f9f9f9; border: none; cursor: pointer; font-weight: bold;">-</button>
            <span style="padding: 5px 15px; min-width: 30px; text-align: center; font-weight: 600;">${item.qty}</span>
            <button onclick="updateQuantity(${item.id}, ${item.qty + 1})" style="padding: 5px 12px; background: #f9f9f9; border: none; cursor: pointer; font-weight: bold;">+</button>
          </div>
          <span style="font-size: 18px; font-weight: 700; min-width: 100px; text-align: right; color: #1e1a29;">${formatPrice(itemTotal)}</span>
          <button onclick="removeFromCart(${item.id})" style="background: none; border: none; color: #e53e3e; cursor: pointer; font-size: 14px; font-weight: 500;">Supprimer</button>
        </div>
      </div>
    `;
  }).join("");

  return `
    <section class="section" style="max-width: 900px; margin: 40px auto; padding: 0 20px;">
      <h1 class="section-title" style="text-align: left; margin-bottom: 30px;">Votre Panier</h1>
      
      <div>
        ${itemsHTML}
      </div>

      <div style="margin-top: 40px; background-color: #f9f9f9; padding: 30px; border-radius: 12px; display: flex; flex-direction: column; align-items: flex-end;">
        <div style="display: flex; justify-content: space-between; width: 100%; max-width: 350px; margin-bottom: 20px; font-size: 20px; font-weight: 700; color: #1e1a29;">
          <span>Total général :</span>
          <span>${formatPrice(totalCart)}</span>
        </div>
        <p style="color: #666; font-size: 14px; margin-bottom: 20px; text-align: right;">La livraison s'effectue partout au Maroc. Le règlement se fait en espèces à la livraison.</p>
        
        <button data-action="checkout-cart" style="width: 100%; max-width: 350px; padding: 15px; background-color: #2b91d7; border: none; border-radius: 10px; color: #ffffff; font-size: 16px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px; box-shadow: 0 4px 12px rgba(43, 145, 215, 0.3); font-family: inherit;">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.2 9.3M17 13v7m-10 0a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z"></path>
          </svg>
          Envoyer la commande via WhatsApp
        </button>
      </div>
    </section>
  `;
}

function renderAnnouncement() {
  const root = document.getElementById("site-announcement");
  if (!root) return;

  const message = "LIVRAISON GRATUITE PARTOUT AU MAROC &nbsp;&nbsp; ACHETEZ 1 PAIRE, OBTENEZ LA 2ÈME À 100 DH";
  const items = Array.from({ length: 10 }, () => (
    `<span class="ann-item"><span class="ann-diamond"></span>${message}</span>`
  )).join("");

  root.innerHTML = `<div class="ann-track">${items}</div>`;
}

/* ============================================================================
   5. ÉVÉNEMENTS & INITIALISATION
   ============================================================================ */

function navigate(route) {
  location.hash = route;
}

function parseRoute() {
  const hash = location.hash.replace(/^#\/?/, "") || "home";
  const segments = hash.split("/");
  return { page: segments[0], id: segments[1] };
}

function render() {
  const { page, id } = parseRoute();
  const app = document.getElementById("app");

  const PAGE_TITLES = {
    home: "GLANZO - Boutique de Lunettes",
    shop: "Shop - GLANZO",
    collection: "Collection - GLANZO",
    contact: "Contact - GLANZO",
    cart: "Votre Panier - GLANZO",
  };
  if (page === "product") {
    const prod = getProductById(id);
    document.title = prod ? `${prod.name} - GLANZO` : "Produit introuvable - GLANZO";
  } else {
    document.title = PAGE_TITLES[page] || PAGE_TITLES.home;
  }

  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.toggle("is-active", link.getAttribute("data-route") === page);
  });

  document.querySelectorAll(".footer-link").forEach(link => {
    const href = link.getAttribute("href") || "";
    const linkPage = href.replace("#/", "");
    const isActive = linkPage === page;
    link.classList.toggle("active-link", isActive);
  });

  if (page === "shop" && state.lastShopTag !== id) {
    state.currentPage = 1;
  }
  state.lastShopTag = id;

  switch (page) {
    case "shop":       app.innerHTML = renderShopPage(id);      break;
    case "collection": app.innerHTML = renderCollectionPage();  break;
    case "contact":    app.innerHTML = renderContactPage();     break;
    case "product":    app.innerHTML = renderProductPage(id);   break;
    case "cart":       app.innerHTML = renderCartPage();        break;
    case "home":       app.innerHTML = renderHomePage();        break;
    default:           app.innerHTML = render404Page();         break;
  }

  // Init related carousel pagination after DOM is ready
  if (page === "product") {
    requestAnimationFrame(() => {
      const track = document.getElementById('related-track');
      const pag   = document.getElementById('related-pagination');
      if (track && track.children.length > 0) {
        const perPage = getRelatedPerPage();
        relatedMaxPage = Math.max(0, Math.ceil(track.children.length / perPage) - 1);
        if (pag) pag.textContent = `1 / ${relatedMaxPage + 1}`;
      }
    });
  }

  window.scrollTo({ top: 0, behavior: "instant" });
  initScrollAnimations();
}

function initScrollAnimations() {
  const scrollElements = document.querySelectorAll(".fade-in-scroll");
  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  scrollElements.forEach((el) => scrollObserver.observe(el));
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.getAttribute("data-action");

  switch (action) {
    case "navigate":
      event.preventDefault();
      navigate(target.getAttribute("data-route"));
      break;
    case "navigate-hide-drawer":
      event.preventDefault();
      toggleDrawer(false);
      navigate(target.getAttribute("data-route"));
      break;
    case "close-drawer":
      event.preventDefault();
      toggleDrawer(false);
      break;
    case "change-page":
      event.preventDefault();
      const targetPage = parseInt(target.getAttribute("data-page"), 10);
      const pageTag = target.getAttribute("data-tag") || "";
      if (!isNaN(targetPage)) {
        state.currentPage = targetPage;
        location.hash = pageTag ? `#/shop/${pageTag}` : `#/shop`;
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      break;
    case "add-to-cart":
      addToCart(target.getAttribute("data-id"));
      break;
    case "buy-now":
      const product = getProductById(target.getAttribute("data-id"));
      if (product) window.open(buildWhatsAppLink(productOrderMessage(product)), "_blank");
      break;
    case "checkout-cart":
      toggleDrawer(false);
      window.open(buildWhatsAppLink(buildCartWhatsAppMessage()), "_blank");
      break;
    case "submit-contact":
      event.preventDefault();

      const statusDiv    = document.getElementById("contact-status");
      const nameField    = document.getElementById("contact-name");
      const emailField   = document.getElementById("contact-email");
      const phoneField   = document.getElementById("contact-phone");
      const messageField = document.getElementById("contact-message");
      const submitBtn    = document.querySelector("[data-action='submit-contact']");

      if (!statusDiv) break;

      const name    = nameField    ? nameField.value.trim()    : "";
      const email   = emailField   ? emailField.value.trim()   : "";
      const phone   = phoneField   ? phoneField.value.trim()   : "";
      const message = messageField ? messageField.value.trim() : "";

      if (!name || !email || !phone || !message) {
        statusDiv.style.cssText = "display:block;padding:10px 15px;border-radius:6px;font-weight:500;font-size:14px;color:#9b2c2c;background:#fff5f5;border:1px solid #fed7d7;margin-bottom:15px;";
        statusDiv.textContent = "⚠ Veuillez remplir tous les champs requis.";
        break;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Envoi en cours...";
      }
      statusDiv.style.cssText = "display:block;padding:10px 15px;border-radius:6px;font-weight:500;font-size:14px;color:#555;background:#f5f5f5;border:1px solid #ddd;margin-bottom:15px;";
      statusDiv.textContent = "⏳ Envoi en cours...";

      emailjs.send(
        "service_dwiedih",
        "template_udpqez8",
        {
          from_name:  name,
          from_email: email,
          from_phone: phone,
          message:    message,
        }
      ).then(() => {
        statusDiv.style.cssText = "display:block;padding:10px 15px;border-radius:6px;font-weight:500;font-size:14px;color:#276749;background:#c6f6d5;border:1px solid #9ae6b4;margin-bottom:15px;";
        statusDiv.textContent = "✓ Votre message a bien été envoyé. Merci !";
        if (nameField)    nameField.value    = "";
        if (emailField)   emailField.value   = "";
        if (phoneField)   phoneField.value   = "";
        if (messageField) messageField.value = "";
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Envoyer"; }
      }).catch((error) => {
        statusDiv.style.cssText = "display:block;padding:10px 15px;border-radius:6px;font-weight:500;font-size:14px;color:#9b2c2c;background:#fff5f5;border:1px solid #fed7d7;margin-bottom:15px;";
        statusDiv.textContent = "✗ Erreur lors de l'envoi. Veuillez réessayer.";
        console.error("EmailJS error:", error);
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Envoyer"; }
      });

      break;
    case "toggle-search":
      const overlayEl = document.getElementById("search-overlay");
      if (overlayEl) {
        overlayEl.classList.toggle("is-open");
        if (overlayEl.classList.contains("is-open")) {
          setTimeout(() => document.getElementById("search-input")?.focus(), 100);
        }
      }
      break;
    case "close-search":
      const overlayClose = document.getElementById("search-overlay");
      if (overlayClose) {
        overlayClose.classList.remove("is-open");
        const inp = document.getElementById("search-input");
        if (inp) inp.value = "";
        const panel = document.getElementById("search-results-panel");
        if (panel) { panel.innerHTML = ""; panel.classList.remove("is-visible"); }
        const clr = document.getElementById("search-clear-btn");
        if (clr) clr.style.display = "none";
      }
      break;
  }
});

/* ============================================================================
   RECHERCHE LIVE
   ============================================================================ */
function initSearch() {
  const input    = document.getElementById("search-input");
  const panel    = document.getElementById("search-results-panel");
  const clearBtn = document.getElementById("search-clear-btn");
  if (!input || !panel) return;

  const PAGES = [
    { label: "Home",           route: "#/home" },
    { label: "Shop",           route: "#/shop" },
    { label: "Collection",     route: "#/collection" },
    { label: "Contact",        route: "#/contact" },
    { label: "MOSCOT",         route: "#/collection" },
    { label: "Lunette Femme",  route: "#/shop" },
    { label: "Lunette Homme",  route: "#/shop" },
    { label: "Optique",        route: "#/shop" },
  ];

  function renderResults(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      panel.innerHTML = "";
      panel.classList.remove("is-visible");
      return;
    }

    const matchedProducts = PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
    ).slice(0, 10);

    const matchedPages = PAGES.filter(p => p.label.toLowerCase().includes(q));

    let pagesHTML = "";
    if (matchedPages.length > 0) {
      pagesHTML = `
        <div class="search-col-pages">
          <div class="search-col-label">Pages</div>
          ${matchedPages.map(p => `
            <span class="search-page-item" data-action="navigate" data-route="${p.route}"
                  onclick="document.getElementById('search-overlay').classList.remove('is-open')">
              ${p.label}
            </span>
          `).join("")}
        </div>
      `;
    }

    let productsHTML = "";
    if (matchedProducts.length > 0) {
      productsHTML = `
        <div class="search-col-products">
          <div class="search-col-label" style="padding: 0 18px 10px 18px;">Produits</div>
          ${matchedProducts.map(p => `
            <div class="search-product-item" data-action="navigate" data-route="#/product/${p.id}"
                 onclick="document.getElementById('search-overlay').classList.remove('is-open')">
              <img class="search-product-img" src="${p.image}" alt="${p.name}">
              <div class="search-product-info">
                <p class="search-product-name">${p.name}</p>
                <div class="search-product-prices">
                  ${p.oldPrice ? `<span class="search-old-price">${formatPrice(p.oldPrice)}</span>` : ""}
                  <span class="search-current-price">${formatPrice(p.price)}</span>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      `;
    }

    const noResults = matchedProducts.length === 0 && matchedPages.length === 0;

    panel.innerHTML = `
      <div class="search-results-inner">
        ${pagesHTML || ""}
        ${productsHTML || (noResults ? `<div class="search-empty">Aucun résultat pour « ${query} »</div>` : "")}
      </div>
      <div class="search-footer-link" data-action="navigate" data-route="#/shop"
           onclick="document.getElementById('search-overlay').classList.remove('is-open')">
        <span>Rechercher « ${query} »</span>
        <span>→</span>
      </div>
    `;
    panel.classList.add("is-visible");
  }

  input.addEventListener("input", () => {
    const val = input.value;
    clearBtn.style.display = val.length > 0 ? "flex" : "none";
    renderResults(val);
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    clearBtn.style.display = "none";
    panel.innerHTML = "";
    panel.classList.remove("is-visible");
    input.focus();
  });

  panel.addEventListener("click", (e) => {
    const item = e.target.closest("[data-action='navigate']");
    if (item) {
      navigate(item.getAttribute("data-route"));
      document.getElementById("search-overlay").classList.remove("is-open");
      input.value = "";
      panel.innerHTML = "";
      panel.classList.remove("is-visible");
      clearBtn.style.display = "none";
    }
  });
}

/* ============================================================================
   REVIEW MODAL
   ============================================================================ */
let modalCurrentIndex = 0;

window.openReviewModal = function(idx) {
  modalCurrentIndex = idx;
  const modal = document.getElementById('review-modal');
  if (!modal) return;

  // sync carousel center too
  reviewCenter = idx;
  window.reviewGoTo(idx);

  renderModalContent(idx);
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

window.closeReviewModal = function() {
  const modal = document.getElementById('review-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
  // pause any playing video
  document.querySelectorAll('#modal-media-side video').forEach(v => v.pause());
};

window.reviewModalNav = function(dir) {
  // get reviewVideos length — we need to access it; we store it on window
  const total = (window._reviewVideosData || []).length;
  if (!total) return;
  modalCurrentIndex = (modalCurrentIndex + dir + total) % total;
  renderModalContent(modalCurrentIndex);
  reviewCenter = modalCurrentIndex;
  window.reviewGoTo(modalCurrentIndex);
};

function renderModalContent(idx) {
  const videos = window._reviewVideosData || [];
  const v      = videos[idx];
  if (!v) return;

  const mediaSide = document.getElementById('modal-media-side');
  const infoSide  = document.getElementById('modal-info-side');
  if (!mediaSide || !infoSide) return;

  // Media
  if (v.type === 'video') {
    mediaSide.innerHTML = `
      <video src="${v.thumb}" autoplay playsinline muted loop disablepictureinpicture controlslist="nodownload noplaybackrate nofullscreen"
             style="width:100%;height:100%;object-fit:cover;display:block;border-radius:0;pointer-events:none;">
      </video>`;
  } else {
    mediaSide.innerHTML = `
      <img src="${v.thumb}" alt="review"
           style="width:100%;height:100%;object-fit:cover;display:block;">`;
  }

  // Info side
  const labelText = v.type === 'video' ? 'PRODUCTS SEEN IN THE VIDEO' : 'PRODUCTS SEEN IN THE IMAGE';
  let infoHTML = `<p style="display:block;width:100%;font-size:13px;font-weight:700;letter-spacing:1px;color:#111 !important;
                              text-align:center;margin:0 0 18px 0;line-height:1.4;flex-shrink:0;">${labelText}</p>`;

  if (v.overlay && v.overlay.product) {
    const p = v.overlay.product;
    infoHTML += `
      <div style="border:1px solid #eee;border-radius:14px;overflow:hidden;margin-bottom:20px;width:100%;max-width:320px;text-align:left;">
        ${p.productThumb ? `<img src="${p.productThumb}" alt="${p.name}"
             ${p.productId ? `onclick="closeReviewModal();navigate('#/product/${p.productId}')"` : ''}
             style="width:100%;height:200px;object-fit:cover;display:block;${p.productId ? 'cursor:pointer;' : ''}">` : ''}
        <div style="padding:16px;">
          <p style="font-size:16px;font-weight:700;color:#111;margin:0 0 8px;">${p.name}</p>
          <p style="font-size:15px;font-weight:700;color:#111;margin:0 0 14px;">${p.price}</p>
          <button
            ${!p.soldOut && p.productId ? `onclick="addToCartFromModal(${p.productId})"` : ''}
            style="width:100%;padding:12px;border:none;border-radius:10px;
                   background:${p.soldOut ? '#e0e0e0' : '#111'};
                   color:${p.soldOut ? '#999' : '#fff'};
                   font-size:14px;font-weight:700;cursor:${p.soldOut ? 'default' : 'pointer'};
                   font-family:inherit;">
            ${p.soldOut ? 'Sold out' : 'Shop now'}
          </button>
        </div>
      </div>`;
  } else if (v.overlay && v.overlay.text) {
    infoHTML += `<p style="font-size:22px;font-weight:800;color:#111;">${v.overlay.text}</p>`;
  } else {
    infoHTML += `<p style="color:#aaa;font-size:14px;">No product tagged in this video.</p>`;
  }

  infoSide.innerHTML = infoHTML;

  // Mobile vs desktop layout
  const inner = document.getElementById('review-modal-inner');
  if (inner) {
    if (window.innerWidth < 640) {
      inner.style.flexDirection = 'column';
      inner.style.maxHeight = '92vh';
      inner.style.borderRadius = '20px';
      mediaSide.style.width = '100%';
      mediaSide.style.minHeight = '0';
      mediaSide.style.height = '340px';
      mediaSide.style.maxHeight = '45vh';
      mediaSide.style.flexShrink = '0';
      infoSide.style.padding = '22px 20px 26px';
      infoSide.style.alignItems = 'center';
      infoSide.style.justifyContent = 'flex-start';
      infoSide.style.textAlign = 'center';
      infoSide.style.flex = '1';
      infoSide.style.minHeight = '0';
      infoSide.style.overflowY = 'auto';
    } else {
      inner.style.flexDirection = 'row';
      inner.style.maxHeight = '90vh';
      inner.style.borderRadius = '20px';
      mediaSide.style.width = '320px';
      mediaSide.style.height = 'auto';
      mediaSide.style.minHeight = '500px';
      mediaSide.style.maxHeight = '90vh';
      mediaSide.style.flexShrink = '0';
      infoSide.style.padding = '36px 32px';
      infoSide.style.alignItems = 'center';
      infoSide.style.justifyContent = 'center';
      infoSide.style.textAlign = 'center';
      infoSide.style.flex = '1';
      infoSide.style.overflowY = 'auto';
    }
  }
}

// Close modal on backdrop click
document.addEventListener('click', function(e) {
  const modal = document.getElementById('review-modal');
  if (modal && e.target === modal) closeReviewModal();
});

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", () => {
  if (!location.hash) location.hash = "#/home";
  updateCartBadge();
  renderAnnouncement();
  render();
  initSearch();
});