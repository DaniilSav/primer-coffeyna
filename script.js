const MENU = {
  coffee: [
    { id: "c1", name: "Эспрессо", price: 150, img: "1510591509098-f4fdc6d0ff04" },
    { id: "c2", name: "Американо", price: 180, img: "1509785307050-d4066910ec1e" },
    { id: "c3", name: "Капучино", price: 220, img: "1572442388796-11668a67e53d" },
    { id: "c4", name: "Латте", price: 240, img: "1541167760496-1628856ab772" },
    { id: "c5", name: "Флэт уайт", price: 250, img: "1512568400610-62da28bc8a13" },
    { id: "c6", name: "Раф", price: 260, img: "1495474472287-4d71bcdd2085" },
  ],
  desserts: [
    { id: "d1", name: "Круассан", price: 180, img: "1555507036-ab1f4038808a" },
    { id: "d2", name: "Маффин", price: 150, img: "1607958996333-41aef7caefaa" },
    { id: "d3", name: "Чизкейк", price: 320, img: "1533134242443-d4fd215305ad" },
    { id: "d4", name: "Тирамису", price: 350, img: "1571877227200-a0d98ea607e9" },
    { id: "d5", name: "Эклер", price: 200, img: "1626803775151-61d756612f97" },
    { id: "d6", name: "Медовик", price: 280, img: "1535141192574-5d4897c12636" },
  ],
  breakfast: [
    { id: "b1", name: "Сырники", price: 260, img: "1528207776546-365bb710ee93" },
    { id: "b2", name: "Омлет", price: 280, img: "1533089860892-a7c6f0a88666" },
    { id: "b3", name: "Гренки с сыром", price: 220, img: "1528735602780-2552fd46c7af" },
    { id: "b4", name: "Тост с авокадо", price: 320, img: "1541519227354-08fa5d50c44d" },
    { id: "b5", name: "Овсянка с ягодами", price: 190, img: "1571748982800-fa51082c2224" },
    { id: "b6", name: "Панкейки", price: 270, img: "1567620905732-2d1ec7ab7445" },
  ],
};

function photoUrl(id) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=400&h=300&q=70`;
}

const cart = {}; // id -> { name, price, qty }

function formatPrice(n) {
  return n.toLocaleString("ru-RU") + " ₽";
}

function renderMenu() {
  Object.entries(MENU).forEach(([category, items]) => {
    const track = document.querySelector(`.track[data-track="${category}"]`);
    track.innerHTML = items
      .map(
        (item) => `
      <article class="item-card" data-id="${item.id}">
        <div class="item-photo">
          <img src="${photoUrl(item.img)}" alt="${item.name}" loading="lazy">
        </div>
        <div class="item-body">
          <div class="item-name">${item.name}</div>
          <div class="item-row">
            <span class="item-price">${formatPrice(item.price)}</span>
            <button class="add-btn" type="button" data-id="${item.id}" aria-label="Добавить ${item.name} в предзаказ">+</button>
          </div>
        </div>
      </article>`
      )
      .join("");
  });
}

function findItem(id) {
  for (const items of Object.values(MENU)) {
    const found = items.find((i) => i.id === id);
    if (found) return found;
  }
  return null;
}

function addToCart(id) {
  const item = findItem(id);
  if (!item) return;
  if (cart[id]) {
    cart[id].qty += 1;
  } else {
    cart[id] = { name: item.name, price: item.price, qty: 1 };
  }
  renderCart();
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) delete cart[id];
  renderCart();
}

function removeFromCart(id) {
  delete cart[id];
  renderCart();
}

function getCartTotal() {
  return Object.values(cart).reduce((sum, i) => sum + i.price * i.qty, 0);
}

function renderCart() {
  const list = document.getElementById("cartList");
  const empty = document.getElementById("cartEmpty");
  const totalEl = document.getElementById("cartTotal");
  const entries = Object.entries(cart);

  if (entries.length === 0) {
    list.innerHTML = "";
    empty.style.display = "block";
  } else {
    empty.style.display = "none";
    list.innerHTML = entries
      .map(
        ([id, i]) => `
      <li class="cart-row">
        <div>
          <div class="cart-row-name">${i.name}</div>
          <div class="cart-row-sub">${formatPrice(i.price)} × ${i.qty} = ${formatPrice(i.price * i.qty)}</div>
        </div>
        <div class="qty-control">
          <button type="button" data-action="minus" data-id="${id}" aria-label="Убрать одну штуку">−</button>
          <span>${i.qty}</span>
          <button type="button" data-action="plus" data-id="${id}" aria-label="Добавить ещё одну штуку">+</button>
        </div>
        <button class="remove-btn" type="button" data-action="remove" data-id="${id}" aria-label="Удалить ${i.name}">✕</button>
      </li>`
      )
      .join("");
  }

  const total = getCartTotal();
  totalEl.textContent = formatPrice(total);

  renderOrderPreview(entries, total);
  updateCartToggleCount();
}

function updateCartToggleCount() {
  const countEl = document.getElementById("cartToggleCount");
  const totalQty = Object.values(cart).reduce((sum, i) => sum + i.qty, 0);
  countEl.textContent = totalQty;
  countEl.hidden = totalQty === 0;
}

function renderOrderPreview(entries, total) {
  const box = document.getElementById("orderPreview");
  if (entries.length === 0) {
    box.innerHTML = `<h4>К заказу пока ничего не добавлено</h4>`;
    return;
  }
  box.innerHTML = `
    <h4>Выбрано к заказу</h4>
    <ul>
      ${entries.map(([id, i]) => `<li><span>${i.name} × ${i.qty}</span><span>${formatPrice(i.price * i.qty)}</span></li>`).join("")}
    </ul>
    <div class="preview-total"><span>Итого</span><span>${formatPrice(total)}</span></div>
  `;
}

/* ---------- carousel ---------- */
function initCarousel() {
  const tabs = document.querySelectorAll(".tab");
  const tracksWrap = document.querySelector(".tracks");
  const prevBtn = document.querySelector(".car-btn.prev");
  const nextBtn = document.querySelector(".car-btn.next");

  function activeTrack() {
    return document.querySelector(".track:not([hidden])");
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const category = tab.dataset.category;
      document.querySelectorAll(".track").forEach((track) => {
        track.hidden = track.dataset.track !== category;
      });
    });
  });

  function scrollByCard(dir) {
    const track = activeTrack();
    if (!track) return;
    const card = track.querySelector(".item-card");
    const step = card ? card.getBoundingClientRect().width + 22 : 260;
    track.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  prevBtn.addEventListener("click", () => scrollByCard(-1));
  nextBtn.addEventListener("click", () => scrollByCard(1));
  tracksWrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-btn");
    if (btn) addToCart(btn.dataset.id);
  });
}

/* ---------- dot nav (scroll spy) ---------- */
function initDotNav() {
  const dots = document.querySelectorAll(".dotnav .dot");
  const sections = Array.from(dots).map((dot) => document.querySelector(dot.getAttribute("href")));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const idx = sections.indexOf(entry.target);
        dots.forEach((d) => d.classList.remove("active"));
        if (idx !== -1) dots[idx].classList.add("active");
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((sec) => sec && observer.observe(sec));
}

/* ---------- booking form ---------- */
function initBookingForm() {
  const form = document.getElementById("bookingForm");
  const successBox = document.getElementById("bookingSuccess");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const entries = Object.entries(cart);
    const total = getCartTotal();
    const orderSummary = entries.map(([id, i]) => `${i.name} × ${i.qty}`).join(", ");

    document.getElementById("orderSummaryField").value = orderSummary;
    document.getElementById("orderTotalField").value = total;

    const name = data.get("name");
    const phone = data.get("phone");
    const date = data.get("date");
    const time = data.get("time");
    const guests = data.get("guests");

    successBox.hidden = false;
    successBox.innerHTML = `
      <h4>Бронь почти готова, ${name}!</h4>
      <div><strong>Дата:</strong> ${date} в ${time}, гостей: ${guests}</div>
      <div><strong>Телефон для связи:</strong> ${phone}</div>
      <div><strong>Предзаказ:</strong> ${orderSummary || "не выбран"}</div>
      <div><strong>Итого к оплате:</strong> ${formatPrice(total)}</div>
      <div style="margin-top:8px;color:rgba(246,239,227,.6)">Мы свяжемся с вами для подтверждения.</div>
    `;
    successBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}

function initScrollButton() {
  document.getElementById("scrollToMenu").addEventListener("click", () => {
    document.getElementById("menu").scrollIntoView({ behavior: "smooth" });
  });
}

function initCartToggle() {
  const menuLayout = document.getElementById("menuLayout");
  const toggleBtn = document.getElementById("cartToggle");
  const closeBtn = document.getElementById("cartClose");

  function setCartVisible(visible) {
    menuLayout.classList.toggle("cart-hidden", !visible);
    toggleBtn.classList.toggle("active", visible);
  }

  toggleBtn.addEventListener("click", () => {
    setCartVisible(menuLayout.classList.contains("cart-hidden"));
  });
  closeBtn.addEventListener("click", () => setCartVisible(false));
}

document.addEventListener("DOMContentLoaded", () => {
  renderMenu();
  renderCart();
  initCarousel();
  initDotNav();
  initBookingForm();
  initScrollButton();
  initCartToggle();

  document.getElementById("cartList").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (action === "plus") changeQty(id, 1);
    if (action === "minus") changeQty(id, -1);
    if (action === "remove") removeFromCart(id);
  });
});
