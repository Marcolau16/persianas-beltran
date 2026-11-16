/**
 * app.js - Sistema de Cotizaciones Profesionales con Cálculo por Metros
 */

// ============================================================================
// DATOS POR DEFECTO Y ESTADO DE LA APLICACIÓN
// ============================================================================

const DEFAULT_RESPONSIBLES = [
  {
    id: 'resp-1',
    name: 'Malio Beltran'
  },
  {
    id: 'resp-2',
    name: 'Alma Carrazco'
  }
];

const DEFAULT_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Persiana Sheer Elegance / Dúo',
    category: 'Persianas',
    unitType: 'm2', // m2: Metro cuadrado
    basePrice: 680.00,
    description: 'Doble tela con franjas traslúcidas y opacas para control de luz y máxima elegancia.'
  },
  {
    id: 'prod-2',
    name: 'Persiana Enrollable Blackout',
    category: 'Persianas',
    unitType: 'm2',
    basePrice: 490.00,
    description: 'Bloqueo 100% de luz solar, reducción térmica y privacidad completa.'
  },
  {
    id: 'prod-3',
    name: 'Persiana Enrollable Screen 5%',
    category: 'Persianas',
    unitType: 'm2',
    basePrice: 450.00,
    description: 'Malla solar con 5% de apertura, filtro UV y visibilidad hacia el exterior.'
  },
  {
    id: 'prod-4',
    name: 'Persiana Neolux Traslúcida',
    category: 'Persianas',
    unitType: 'm2',
    basePrice: 620.00,
    description: 'Filtración suave de luz natural con textura fina y moderna.'
  },
  {
    id: 'prod-5',
    name: 'Galería / Fascia de Aluminio Forrada',
    category: 'Galerías y Perfiles',
    unitType: 'lineal', // lineal: Metro lineal
    basePrice: 290.00,
    description: 'Cubre rollo estético forrado en la misma tela de la persiana.'
  },
  {
    id: 'prod-6',
    name: 'Riel / Perfil para Onda Perfecta',
    category: 'Galerías y Perfiles',
    unitType: 'lineal',
    basePrice: 180.00,
    description: 'Perfil de aluminio anodizado de suave deslizamiento silencioso.'
  },
  {
    id: 'prod-7',
    name: 'Motor Tubular con Control Remoto',
    category: 'Motorización',
    unitType: 'pieza',
    basePrice: 1850.00,
    description: 'Motorización silenciosa para persianas enrollables con control remoto incluido.'
  }
];

const DEFAULT_COMPANY = {
  name: 'Persianas Beltran HMO',
  taxId: 'PBH-240101-HMO',
  phone: '(662) 123 4567',
  email: 'contacto@persianasbeltranhmo.com',
  website: 'www.persianasbeltranhmo.com',
  address: 'Hermosillo, Sonora, México',
  defaultTerms: '1. Medidas sujetas a rectificación en sitio antes de confección.\n2. Tiempo de entrega e instalación: 5 a 7 días hábiles a partir del anticipo.\n3. Forma de pago: 50% de anticipo y 50% al finalizar la instalación.\n4. Incluye instalación profesional y 1 año de garantía en mecanismos y telas.'
};

// Estado global en memoria
let state = {
  responsibles: [],
  products: [],
  quotes: [],
  company: {},
  currentQuoteItems: []
};

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  loadStorageData();
  setupInitialDates();
  renderResponsiblesDropdown();
  renderProductsDropdown();
  renderProductsTable();
  renderResponsiblesGrid();
  renderHistoryTable();
  loadCompanyConfigForm();
  updateBadges();
  calculateQuoteTotals();
  
  // Inicializar iconos de Lucide
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

function loadStorageData() {
  const savedResp = localStorage.getItem('cotizador_responsibles');
  if (!savedResp || !savedResp.includes('Malio Beltran')) {
    state.responsibles = DEFAULT_RESPONSIBLES;
    localStorage.setItem('cotizador_responsibles', JSON.stringify(DEFAULT_RESPONSIBLES));
  } else {
    try {
      state.responsibles = JSON.parse(savedResp);
    } catch (e) {
      state.responsibles = DEFAULT_RESPONSIBLES;
    }
  }

  const savedProd = localStorage.getItem('cotizador_products');
  if (!savedProd || (savedProd && savedProd.includes('Vidrio Templado'))) {
    state.products = DEFAULT_PRODUCTS;
    localStorage.setItem('cotizador_products', JSON.stringify(DEFAULT_PRODUCTS));
  } else {
    state.products = JSON.parse(savedProd);
  }

  const savedQuotes = localStorage.getItem('cotizador_quotes');
  state.quotes = savedQuotes ? JSON.parse(savedQuotes) : [];

  const savedComp = localStorage.getItem('cotizador_company');
  if (!savedComp || (savedComp && savedComp.includes('Soluciones & Cotizaciones'))) {
    state.company = DEFAULT_COMPANY;
    localStorage.setItem('cotizador_company', JSON.stringify(DEFAULT_COMPANY));
  } else {
    state.company = JSON.parse(savedComp);
  }

  // Actualizar nombre de empresa en header
  document.getElementById('headerCompanyName').textContent = state.company.name || 'Persianas Beltran HMO';
}

function saveStorage() {
  localStorage.setItem('cotizador_responsibles', JSON.stringify(state.responsibles));
  localStorage.setItem('cotizador_products', JSON.stringify(state.products));
  localStorage.setItem('cotizador_quotes', JSON.stringify(state.quotes));
  localStorage.setItem('cotizador_company', JSON.stringify(state.company));
  updateBadges();
}

function setupInitialDates() {
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('quoteDate');
  if (dateInput && !dateInput.value) {
    dateInput.value = today;
  }

  // Generar folio sugerido si no existe
  if (document.getElementById('quoteFolio').value === 'COT-1001' && state.quotes.length > 0) {
    const nextNumber = 1000 + state.quotes.length + 1;
    document.getElementById('quoteFolio').value = `COT-${nextNumber}`;
  }

  // Cargar condiciones por defecto
  const notesField = document.getElementById('quoteNotes');
  if (notesField && !notesField.value) {
    notesField.value = state.company.defaultTerms || '';
  }
}

function updateBadges() {
  document.getElementById('badge-products-count').textContent = state.products.length;
  document.getElementById('badge-responsibles-count').textContent = state.responsibles.length;
  document.getElementById('badge-history-count').textContent = state.quotes.length;
}

// ============================================================================
// NAVEGACIÓN ENTRE PESTAÑAS
// ============================================================================

function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

  const activeTab = document.getElementById(tabId);
  if (activeTab) {
    activeTab.classList.remove('hidden');
  }

  const activeBtn = document.getElementById(`btn-${tabId}`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// ============================================================================
// GESTIÓN DE RESPONSABLES DE COTIZACIÓN
// ============================================================================

function renderResponsiblesDropdown(selectedId = null) {
  const select = document.getElementById('quoteResponsibleSelect');
  select.innerHTML = '<option value="">-- Selecciona un responsable --</option>';

  state.responsibles.forEach(resp => {
    const opt = document.createElement('option');
    opt.value = resp.id;
    opt.textContent = resp.name;
    if (selectedId && resp.id === selectedId) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });

  onResponsibleSelected();
}

function onResponsibleSelected() {
  const select = document.getElementById('quoteResponsibleSelect');
  const card = document.getElementById('selectedResponsibleCard');
  const respId = select.value;

  if (!respId) {
    card.classList.add('hidden');
    return;
  }

  const resp = state.responsibles.find(r => r.id === respId);
  if (resp) {
    document.getElementById('respCardName').textContent = resp.name;
    card.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }
}

function openAddResponsibleModal(respId = null) {
  const modal = document.getElementById('modalResponsible');
  const form = document.getElementById('responsibleForm');
  form.reset();

  if (respId) {
    const resp = state.responsibles.find(r => r.id === respId);
    if (resp) {
      document.getElementById('modalResponsibleTitle').textContent = 'Editar Responsable';
      document.getElementById('respEditId').value = resp.id;
      document.getElementById('respName').value = resp.name;
    }
  } else {
    document.getElementById('modalResponsibleTitle').textContent = 'Agregar Responsable';
    document.getElementById('respEditId').value = '';
  }

  modal.classList.remove('hidden');
  setTimeout(() => {
    const input = document.getElementById('respName');
    if (input) input.focus();
  }, 100);
  if (window.lucide) window.lucide.createIcons();
}

function closeResponsibleModal() {
  document.getElementById('modalResponsible').classList.add('hidden');
}

function saveResponsible(event) {
  event.preventDefault();
  const id = document.getElementById('respEditId').value || `resp-${Date.now()}`;
  const name = document.getElementById('respName').value.trim();

  if (!name) {
    alert('Por favor introduce el nombre del responsable.');
    return;
  }

  const existingIndex = state.responsibles.findIndex(r => r.id === id);
  const respData = { id, name };

  if (existingIndex >= 0) {
    state.responsibles[existingIndex] = respData;
  } else {
    state.responsibles.push(respData);
  }

  saveStorage();
  closeResponsibleModal();
  renderResponsiblesDropdown(id);
  renderResponsiblesGrid();
}

function deleteResponsible(id) {
  if (state.responsibles.length <= 1) {
    alert('Debe haber al menos un responsable registrado.');
    return;
  }
  if (confirm('¿Estás seguro de eliminar este responsable?')) {
    state.responsibles = state.responsibles.filter(r => r.id !== id);
    saveStorage();
    renderResponsiblesDropdown();
    renderResponsiblesGrid();
  }
}

function renderResponsiblesGrid() {
  const grid = document.getElementById('responsiblesGrid');
  grid.innerHTML = '';

  state.responsibles.forEach(resp => {
    const card = document.createElement('div');
    card.className = 'bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition';
    card.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
          ${resp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
        </div>
        <div>
          <h3 class="font-bold text-sm text-slate-900">${resp.name}</h3>
          <span class="text-[11px] text-slate-400">Responsable de cotizaciones</span>
        </div>
      </div>

      <div class="flex items-center space-x-1.5">
        <button type="button" onclick="selectResponsibleForQuote('${resp.id}')" class="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg flex items-center transition" title="Usar en cotización">
          <i data-lucide="check" class="w-3.5 h-3.5 mr-1"></i> Usar
        </button>
        <button type="button" onclick="openAddResponsibleModal('${resp.id}')" class="p-1.5 text-slate-400 hover:text-slate-600 rounded" title="Editar">
          <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
        </button>
        <button type="button" onclick="deleteResponsible('${resp.id}')" class="p-1.5 text-slate-400 hover:text-rose-600 rounded" title="Eliminar">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `;
    grid.appendChild(card);
  });

  if (window.lucide) window.lucide.createIcons();
}

function selectResponsibleForQuote(id) {
  renderResponsiblesDropdown(id);
  switchTab('tab-cotizador');
}

// ============================================================================
// GESTIÓN DE CATÁLOGO DE PRODUCTOS Y MEDIDAS
// ============================================================================

function renderProductsDropdown() {
  const select = document.getElementById('itemProductSelect');
  select.innerHTML = `
    <option value="">-- Seleccionar producto del catálogo --</option>
    <option value="custom">✍️ Producto personalizado / manual</option>
  `;

  state.products.forEach(prod => {
    const opt = document.createElement('option');
    opt.value = prod.id;
    const unitLabel = prod.unitType === 'm2' ? 'm²' : (prod.unitType === 'lineal' ? 'm lineal' : 'pza');
    opt.textContent = `${prod.name} - $${prod.basePrice.toFixed(2)} / ${unitLabel}`;
    select.appendChild(opt);
  });
}

function onItemProductChange() {
  const select = document.getElementById('itemProductSelect');
  const customFields = document.getElementById('customProductFields');
  const priceInput = document.getElementById('itemPrice');
  const badge = document.getElementById('productUnitBadge');

  if (select.value === 'custom') {
    customFields.classList.remove('hidden');
    priceInput.value = '';
    updateDimensionInputs();
    return;
  }

  customFields.classList.add('hidden');

  const prod = state.products.find(p => p.id === select.value);
  if (prod) {
    priceInput.value = prod.basePrice;
    if (prod.unitType === 'm2') {
      badge.innerHTML = '<span>Metro Cuadrado (m²)</span>';
    } else if (prod.unitType === 'lineal') {
      badge.innerHTML = '<span>Metro Lineal (m)</span>';
    } else {
      badge.innerHTML = '<span>Por Pieza</span>';
    }
  } else {
    priceInput.value = '';
  }

  updateDimensionInputs();
  calculateItemTotal();
}

function updateDimensionInputs() {
  const select = document.getElementById('itemProductSelect');
  let unitType = 'm2';

  if (select.value === 'custom') {
    unitType = document.getElementById('customProductType').value;
  } else {
    const prod = state.products.find(p => p.id === select.value);
    if (prod) {
      unitType = prod.unitType;
    }
  }

  const m2Box = document.getElementById('m2InputsContainer');
  const linealBox = document.getElementById('linealInputsContainer');
  const piezaBox = document.getElementById('piezaInputsContainer');

  m2Box.classList.add('hidden');
  linealBox.classList.add('hidden');
  piezaBox.classList.add('hidden');

  if (unitType === 'm2') {
    m2Box.classList.remove('hidden');
  } else if (unitType === 'lineal') {
    linealBox.classList.remove('hidden');
  } else {
    piezaBox.classList.remove('hidden');
  }

  calculateItemTotal();
}

/**
 * Cálculo dinámico del total de la partida según las medidas ingresadas
 */
function calculateItemTotal() {
  const select = document.getElementById('itemProductSelect');
  const isCm = document.getElementById('inputUnit').value === 'cm';
  const unitDivider = isCm ? 100 : 1;
  const unitSuffix = isCm ? 'cm' : 'M';

  // Actualizar labels según si es cm o M
  const widthLabel = document.getElementById('labelWidth');
  const lengthLabel = document.getElementById('labelLength');
  const linealLabel = document.getElementById('labelLinealLength');

  if (widthLabel) widthLabel.textContent = `Ancho (${unitSuffix}):`;
  if (lengthLabel) lengthLabel.textContent = `Largo (${unitSuffix}):`;
  if (linealLabel) linealLabel.textContent = `Largo (${unitSuffix}):`;

  let unitType = 'm2';
  let price = parseFloat(document.getElementById('itemPrice').value) || 0;

  if (select.value === 'custom') {
    unitType = document.getElementById('customProductType').value;
    const customPrice = parseFloat(document.getElementById('customProductPrice').value);
    if (!isNaN(customPrice)) {
      price = customPrice;
      document.getElementById('itemPrice').value = price;
    }
  } else {
    const prod = state.products.find(p => p.id === select.value);
    if (prod) {
      unitType = prod.unitType;
    }
  }

  let totalMeasured = 0;
  let breakdownText = '';
  let unitLabel = '';

  if (unitType === 'm2') {
    const rawWidth = parseFloat(document.getElementById('dimWidth').value) || 0;
    const rawLength = parseFloat(document.getElementById('dimLength').value) || 0;
    const qty = parseInt(document.getElementById('dimQuantity').value) || 1;

    const widthM = rawWidth / unitDivider;
    const lengthM = rawLength / unitDivider;
    const areaPerPiece = widthM * lengthM;
    totalMeasured = areaPerPiece * qty;
    unitLabel = 'm²';

    if (rawWidth > 0 && rawLength > 0) {
      const widthStr = Number.isInteger(widthM) ? widthM.toString() : widthM.toFixed(2);
      const lengthStr = Number.isInteger(lengthM) ? lengthM.toString() : lengthM.toFixed(2);
      if (qty > 1) {
        breakdownText = `${qty} pzas de ${widthStr} M de ancho × ${lengthStr} M de largo (${totalMeasured.toFixed(2)} m²)`;
      } else {
        breakdownText = `${widthStr} M de ancho × ${lengthStr} M de largo (${totalMeasured.toFixed(2)} m²)`;
      }
    } else {
      breakdownText = '0 M de ancho × 0 M de largo (0.00 m²)';
    }
  } else if (unitType === 'lineal') {
    const rawLength = parseFloat(document.getElementById('dimLinealLength').value) || 0;
    const qty = parseInt(document.getElementById('dimLinealQuantity').value) || 1;

    const lengthM = rawLength / unitDivider;
    totalMeasured = lengthM * qty;
    unitLabel = 'm lineales';

    if (rawLength > 0) {
      const lengthStr = Number.isInteger(lengthM) ? lengthM.toString() : lengthM.toFixed(2);
      if (qty > 1) {
        breakdownText = `${qty} tramos de ${lengthStr} M de largo (${totalMeasured.toFixed(2)} m lineales)`;
      } else {
        breakdownText = `${lengthStr} M de largo (${totalMeasured.toFixed(2)} m lineales)`;
      }
    } else {
      breakdownText = '0 M de largo (0.00 m lineales)';
    }
  } else {
    const qty = parseInt(document.getElementById('dimPiezaQuantity').value) || 1;
    totalMeasured = qty;
    unitLabel = 'piezas';
    breakdownText = `${qty} pieza(s)`;
  }

  const subtotal = totalMeasured * price;

  document.getElementById('liveMeasuredTotal').textContent = breakdownText;
  document.getElementById('livePartidaSubtotal').textContent = formatCurrency(subtotal);

  return {
    unitType,
    price,
    totalMeasured,
    unitLabel,
    subtotal
  };
}

/**
 * Agregar la partida a la cotización activa
 */
function addItemToQuote() {
  const select = document.getElementById('itemProductSelect');
  if (!select.value) {
    alert('Por favor selecciona un producto o elige personalizado.');
    return;
  }

  const isCm = document.getElementById('inputUnit').value === 'cm';
  const unitDivider = isCm ? 100 : 1;

  let productName = '';
  let unitType = 'm2';
  let price = parseFloat(document.getElementById('itemPrice').value) || 0;

  if (select.value === 'custom') {
    productName = document.getElementById('customProductName').value.trim() || 'Producto Personalizado';
    unitType = document.getElementById('customProductType').value;
  } else {
    const prod = state.products.find(p => p.id === select.value);
    if (!prod) return;
    productName = prod.name;
    unitType = prod.unitType;
  }

  if (price <= 0) {
    alert('Ingresa un precio válido para el producto.');
    return;
  }

  let dimensionDetails = '';
  let totalMeasured = 0;
  let pieces = 1;

  if (unitType === 'm2') {
    const rawWidth = parseFloat(document.getElementById('dimWidth').value);
    const rawLength = parseFloat(document.getElementById('dimLength').value);
    pieces = parseInt(document.getElementById('dimQuantity').value) || 1;

    if (isNaN(rawWidth) || rawWidth <= 0 || isNaN(rawLength) || rawLength <= 0) {
      alert('Debes ingresar el ancho y el largo (ejemplo: 2 M de ancho y 2 M de largo).');
      return;
    }

    const widthM = rawWidth / unitDivider;
    const lengthM = rawLength / unitDivider;
    const areaPerPiece = widthM * lengthM;
    totalMeasured = areaPerPiece * pieces;

    const widthStr = Number.isInteger(widthM) ? widthM.toString() : widthM.toFixed(2);
    const lengthStr = Number.isInteger(lengthM) ? lengthM.toString() : lengthM.toFixed(2);

    if (pieces === 1) {
      dimensionDetails = `${widthStr} M de ancho × ${lengthStr} M de largo (${areaPerPiece.toFixed(2)} m²)`;
    } else {
      dimensionDetails = `${pieces} pza(s) de ${widthStr} M de ancho × ${lengthStr} M de largo (${areaPerPiece.toFixed(2)} m²/pza)`;
    }
  } else if (unitType === 'lineal') {
    const rawLength = parseFloat(document.getElementById('dimLinealLength').value);
    pieces = parseInt(document.getElementById('dimLinealQuantity').value) || 1;

    if (isNaN(rawLength) || rawLength <= 0) {
      alert('Debes ingresar la longitud en metros (ejemplo: 2 M de largo).');
      return;
    }

    const lengthM = rawLength / unitDivider;
    totalMeasured = lengthM * pieces;

    const lengthStr = Number.isInteger(lengthM) ? lengthM.toString() : lengthM.toFixed(2);

    if (pieces === 1) {
      dimensionDetails = `${lengthStr} M de largo`;
    } else {
      dimensionDetails = `${pieces} tramo(s) de ${lengthStr} M de largo`;
    }
  } else {
    pieces = parseInt(document.getElementById('dimPiezaQuantity').value) || 1;
    totalMeasured = pieces;
    dimensionDetails = `${pieces} pieza(s) fijas`;
  }

  const notes = document.getElementById('itemNotes').value.trim();
  const subtotal = totalMeasured * price;

  const item = {
    id: `item-${Date.now()}`,
    productName,
    unitType,
    pieces,
    dimensionDetails,
    totalMeasured,
    unitLabel: unitType === 'm2' ? 'm²' : (unitType === 'lineal' ? 'm' : 'pza'),
    price,
    notes,
    subtotal
  };

  state.currentQuoteItems.push(item);
  renderQuoteItemsTable();
  calculateQuoteTotals();

  // Limpiar campos de medida
  document.getElementById('dimLength').value = '';
  document.getElementById('dimWidth').value = '';
  document.getElementById('dimLinealLength').value = '';
  document.getElementById('itemNotes').value = '';
  calculateItemTotal();
}

function removeQuoteItem(itemId) {
  state.currentQuoteItems = state.currentQuoteItems.filter(i => i.id !== itemId);
  renderQuoteItemsTable();
  calculateQuoteTotals();
}

function renderQuoteItemsTable() {
  const tbody = document.getElementById('quoteItemsTableBody');
  const countBadge = document.getElementById('quoteItemsCount');
  countBadge.textContent = `${state.currentQuoteItems.length} partida(s)`;

  if (state.currentQuoteItems.length === 0) {
    tbody.innerHTML = `
      <tr id="emptyItemsRow">
        <td colspan="7" class="py-8 text-center text-slate-400">
          <i data-lucide="shopping-cart" class="w-8 h-8 mx-auto mb-2 text-slate-300"></i>
          <p class="font-medium">No has agregado ninguna partida a la cotización</p>
          <p class="text-[11px] text-slate-400">Selecciona un producto arriba, ingresa las medidas y haz clic en "Agregar"</p>
        </td>
      </tr>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  tbody.innerHTML = '';
  state.currentQuoteItems.forEach((item, index) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition border-b border-slate-100 text-xs';
    tr.innerHTML = `
      <td class="py-3 px-3 text-center font-bold text-slate-500">${index + 1}</td>
      <td class="py-3 px-3">
        <p class="font-bold text-slate-800">${item.productName}</p>
        ${item.notes ? `<p class="text-[11px] text-slate-500 italic mt-0.5">${item.notes}</p>` : ''}
      </td>
      <td class="py-3 px-3 text-center text-slate-600 bg-slate-50/50 rounded font-medium">
        ${item.dimensionDetails}
      </td>
      <td class="py-3 px-3 text-center font-bold text-slate-700">
        ${item.totalMeasured.toFixed(2)} ${item.unitLabel}
      </td>
      <td class="py-3 px-3 text-right text-slate-600 font-medium">
        $${item.price.toFixed(2)} / ${item.unitLabel}
      </td>
      <td class="py-3 px-3 text-right font-black text-slate-900">
        ${formatCurrency(item.subtotal)}
      </td>
      <td class="py-3 px-2 text-center">
        <button type="button" onclick="removeQuoteItem('${item.id}')" class="p-1 text-slate-400 hover:text-rose-600 rounded transition" title="Eliminar partida">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (window.lucide) window.lucide.createIcons();
}

/**
 * Cálculo de Subtotal, Descuentos, IVA y Total
 */
function calculateQuoteTotals() {
  const subtotal = state.currentQuoteItems.reduce((acc, curr) => acc + curr.subtotal, 0);

  const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
  const discountAmount = subtotal * (discountPercent / 100);

  const taxableBase = Math.max(0, subtotal - discountAmount);
  const includeTax = document.getElementById('includeTax').checked;
  const taxRate = includeTax ? (parseFloat(document.getElementById('taxPercent').value) || 0) : 0;
  const taxAmount = taxableBase * (taxRate / 100);

  const total = taxableBase + taxAmount;

  document.getElementById('summarySubtotal').textContent = formatCurrency(subtotal);
  document.getElementById('summaryDiscount').textContent = `-${formatCurrency(discountAmount)}`;
  document.getElementById('summaryTax').textContent = formatCurrency(taxAmount);
  document.getElementById('summaryTotal').textContent = formatCurrency(total);
  document.getElementById('totalInWords').textContent = numberToWordsSpanish(total);

  return {
    subtotal,
    discountPercent,
    discountAmount,
    includeTax,
    taxRate,
    taxAmount,
    total
  };
}

function insertNote(text) {
  const textarea = document.getElementById('quoteNotes');
  if (textarea.value.trim().length > 0) {
    textarea.value += `\n• ${text}`;
  } else {
    textarea.value = `• ${text}`;
  }
}

function resetQuoteForm() {
  if (state.currentQuoteItems.length > 0 && !confirm('¿Deseas vaciar los datos de la cotización actual?')) {
    return;
  }
  state.currentQuoteItems = [];
  renderQuoteItemsTable();

  // Resetear campos de cliente
  document.getElementById('clientName').value = '';
  document.getElementById('clientPhone').value = '';
  document.getElementById('clientEmail').value = '';
  document.getElementById('clientAddress').value = '';
  document.getElementById('discountPercent').value = '0';
  document.getElementById('quoteNotes').value = state.company.defaultTerms || '';

  // Actualizar siguiente folio
  const nextNumber = 1000 + state.quotes.length + 1;
  document.getElementById('quoteFolio').value = `COT-${nextNumber}`;

  calculateQuoteTotals();
}

// ============================================================================
// GUARDAR COTIZACIÓN EN HISTORIAL
// ============================================================================

function saveQuoteToHistory() {
  const clientName = document.getElementById('clientName').value.trim();
  if (!clientName) {
    alert('Por favor ingresa el nombre de quien solicitó la cotización.');
    document.getElementById('clientName').focus();
    return;
  }

  const responsibleId = document.getElementById('quoteResponsibleSelect').value;
  if (!responsibleId) {
    alert('Por favor selecciona al responsable de la cotización desde el menú desplegable.');
    document.getElementById('quoteResponsibleSelect').focus();
    return;
  }

  if (state.currentQuoteItems.length === 0) {
    alert('Debes agregar al menos una partida de producto antes de guardar la cotización.');
    return;
  }

  const responsible = state.responsibles.find(r => r.id === responsibleId) || { name: 'No especificado' };
  const totals = calculateQuoteTotals();

  const quote = {
    id: `quote-${Date.now()}`,
    folio: document.getElementById('quoteFolio').value.trim() || `COT-${Date.now()}`,
    date: document.getElementById('quoteDate').value,
    validity: document.getElementById('quoteValidity').value,
    responsible,
    client: {
      name: clientName,
      phone: document.getElementById('clientPhone').value.trim(),
      email: document.getElementById('clientEmail').value.trim(),
      address: document.getElementById('clientAddress').value.trim()
    },
    items: [...state.currentQuoteItems],
    notes: document.getElementById('quoteNotes').value.trim(),
    totals,
    status: 'Pendiente',
    createdAt: new Date().toISOString()
  };

  state.quotes.unshift(quote);
  saveStorage();
  renderHistoryTable();

  alert(`¡Cotización ${quote.folio} guardada exitosamente en el historial!`);

  // Incrementar folio para la siguiente
  const nextNumber = 1000 + state.quotes.length + 1;
  document.getElementById('quoteFolio').value = `COT-${nextNumber}`;
}

// ============================================================================
// HISTORIAL DE COTIZACIONES
// ============================================================================

function renderHistoryTable() {
  const tbody = document.getElementById('historyTableBody');
  const search = (document.getElementById('searchHistoryInput').value || '').toLowerCase();

  const filtered = state.quotes.filter(q => 
    q.folio.toLowerCase().includes(search) || 
    q.client.name.toLowerCase().includes(search) ||
    (q.responsible && q.responsible.name.toLowerCase().includes(search))
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="py-8 text-center text-slate-400">
          <i data-lucide="inbox" class="w-8 h-8 mx-auto mb-2 text-slate-300"></i>
          <p class="font-medium">No hay cotizaciones registradas</p>
        </td>
      </tr>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  tbody.innerHTML = '';
  filtered.forEach(q => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition border-b border-slate-100 text-xs';
    
    let statusClass = 'bg-amber-100 text-amber-800';
    if (q.status === 'Aprobada') statusClass = 'bg-emerald-100 text-emerald-800';
    if (q.status === 'Rechazada') statusClass = 'bg-rose-100 text-rose-800';
    if (q.status === 'Facturada') statusClass = 'bg-blue-100 text-blue-800';

    tr.innerHTML = `
      <td class="py-3 px-4 font-bold text-blue-600">${q.folio}</td>
      <td class="py-3 px-4 text-slate-600">${q.date}</td>
      <td class="py-3 px-4 font-semibold text-slate-900">
        ${q.client.name}
        ${q.client.phone ? `<span class="block text-[11px] text-slate-400 font-normal">${q.client.phone}</span>` : ''}
      </td>
      <td class="py-3 px-4 text-slate-600">${q.responsible ? q.responsible.name : '-'}</td>
      <td class="py-3 px-4 text-center text-slate-600">${q.items.length}</td>
      <td class="py-3 px-4 text-right font-black text-slate-900">${formatCurrency(q.totals.total)}</td>
      <td class="py-3 px-4 text-center">
        <select onchange="updateQuoteStatus('${q.id}', this.value)" class="text-[11px] font-semibold rounded px-2 py-0.5 border border-slate-200 ${statusClass}">
          <option value="Pendiente" ${q.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
          <option value="Aprobada" ${q.status === 'Aprobada' ? 'selected' : ''}>Aprobada</option>
          <option value="Facturada" ${q.status === 'Facturada' ? 'selected' : ''}>Facturada</option>
          <option value="Rechazada" ${q.status === 'Rechazada' ? 'selected' : ''}>Rechazada</option>
        </select>
      </td>
      <td class="py-3 px-3 text-center">
        <div class="flex items-center justify-center space-x-1 sm:space-x-1.5">
          <button type="button" onclick="downloadSavedQuotePdf('${q.id}')" class="p-1 text-slate-500 hover:text-blue-600 rounded transition" title="Descargar PDF">
            <i data-lucide="download" class="w-3.5 h-3.5"></i>
          </button>
          <button type="button" onclick="shareSavedQuoteViaWhatsApp('${q.id}')" class="p-1 text-slate-500 hover:text-emerald-600 rounded transition" title="Enviar por WhatsApp">
            <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
          </button>
          <button type="button" onclick="previewSavedQuote('${q.id}')" class="p-1 text-slate-500 hover:text-slate-800 rounded transition" title="Ver Vista Previa">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
          </button>
          <button type="button" onclick="duplicateQuote('${q.id}')" class="p-1 text-slate-500 hover:text-indigo-600 rounded transition" title="Duplicar">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
          </button>
          <button type="button" onclick="deleteQuote('${q.id}')" class="p-1 text-slate-400 hover:text-rose-600 rounded transition" title="Eliminar">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (window.lucide) window.lucide.createIcons();
}

function updateQuoteStatus(id, newStatus) {
  const quote = state.quotes.find(q => q.id === id);
  if (quote) {
    quote.status = newStatus;
    saveStorage();
    renderHistoryTable();
  }
}

function duplicateQuote(id) {
  const original = state.quotes.find(q => q.id === id);
  if (!original) return;

  state.currentQuoteItems = JSON.parse(JSON.stringify(original.items));
  document.getElementById('clientName').value = original.client.name;
  document.getElementById('clientPhone').value = original.client.phone || '';
  document.getElementById('clientEmail').value = original.client.email || '';
  document.getElementById('clientAddress').value = original.client.address || '';
  document.getElementById('quoteNotes').value = original.notes || '';
  document.getElementById('discountPercent').value = original.totals.discountPercent || 0;

  if (original.responsible && original.responsible.id) {
    renderResponsiblesDropdown(original.responsible.id);
  }

  const nextNumber = 1000 + state.quotes.length + 1;
  document.getElementById('quoteFolio').value = `COT-${nextNumber}`;

  renderQuoteItemsTable();
  calculateQuoteTotals();
  switchTab('tab-cotizador');
}

function deleteQuote(id) {
  if (confirm('¿Estás seguro de eliminar esta cotización del historial?')) {
    state.quotes = state.quotes.filter(q => q.id !== id);
    saveStorage();
    renderHistoryTable();
  }
}

// ============================================================================
// HOJA MEMBRETADA, VISTA PREVIA E IMPRESIÓN (PDF)
// ============================================================================

function buildInvoiceHtml(quoteData) {
  const comp = state.company;
  const itemsRows = quoteData.items.map((item, idx) => `
    <tr class="border-b border-slate-200">
      <td class="py-2.5 px-3 text-center text-slate-500 font-bold">${idx + 1}</td>
      <td class="py-2.5 px-3">
        <p class="font-bold text-slate-900">${item.productName}</p>
        ${item.notes ? `<p class="text-[11px] text-slate-500">${item.notes}</p>` : ''}
      </td>
      <td class="py-2.5 px-3 text-center text-slate-700 bg-slate-50/70 font-medium">
        ${item.dimensionDetails}
      </td>
      <td class="py-2.5 px-3 text-center font-bold text-slate-800">
        ${item.totalMeasured.toFixed(2)} ${item.unitLabel}
      </td>
      <td class="py-2.5 px-3 text-right text-slate-700 font-medium">
        $${item.price.toFixed(2)}
      </td>
      <td class="py-2.5 px-3 text-right font-black text-slate-900">
        ${formatCurrency(item.subtotal)}
      </td>
    </tr>
  `).join('');

  return `
    <div class="max-w-3xl mx-auto bg-white p-2 sm:p-6 text-slate-800 text-xs">
      
      <!-- ENCABEZADO PERSIANAS BELTRAN HMO (AZUL, BLANCO Y NEGRO) -->
      <div class="flex items-start justify-between border-b-2 border-slate-950 pb-5 mb-5">
        <div class="space-y-1">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-lg bg-slate-950 border border-blue-600 text-white flex items-center justify-center font-black text-sm tracking-wider shadow-sm">
              PB
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <h1 class="text-xl font-black text-slate-950 tracking-tight">${comp.name}</h1>
                <span class="px-1.5 py-0.5 text-[9px] bg-blue-600 text-white font-bold rounded uppercase">HMO</span>
              </div>
              <p class="text-[11px] font-semibold text-blue-700">Persianas a la Medida • Fabricación e Instalación</p>
            </div>
          </div>
          ${comp.taxId ? `<p class="text-slate-500 font-medium pt-1">RFC / ID Fiscal: <span class="text-slate-800 font-semibold">${comp.taxId}</span></p>` : ''}
          ${comp.address ? `<p class="text-slate-600">${comp.address}</p>` : ''}
          <p class="text-slate-600">${comp.phone || ''} ${comp.email ? `• ${comp.email}` : ''}</p>
        </div>

        <div class="text-right">
          <span class="inline-block px-3 py-1 bg-slate-950 text-white font-black text-xs uppercase tracking-wider rounded mb-1 border-b-2 border-blue-600">
            COTIZACIÓN
          </span>
          <p class="text-lg font-black text-blue-700">${quoteData.folio}</p>
          <p class="text-slate-500 text-[11px] mt-1">Fecha: <span class="font-bold text-slate-900">${quoteData.date}</span></p>
          <p class="text-slate-500 text-[11px]">Vigencia: <span class="font-bold text-slate-900">${quoteData.validity}</span></p>
        </div>
      </div>

      <!-- DATOS DE CLIENTE Y RESPONSABLE -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        
        <!-- Cliente -->
        <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Cotizado para (Cliente):</span>
          <p class="font-extrabold text-sm text-slate-900">${quoteData.client.name}</p>
          ${quoteData.client.phone ? `<p class="text-slate-600 mt-0.5">Tel: ${quoteData.client.phone}</p>` : ''}
          ${quoteData.client.email ? `<p class="text-slate-600">Email: ${quoteData.client.email}</p>` : ''}
          ${quoteData.client.address ? `<p class="text-slate-600 mt-1">Lugar de entrega: ${quoteData.client.address}</p>` : ''}
        </div>

        <!-- Responsable -->
        <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Elaborado y atendido por:</span>
          <p class="font-extrabold text-sm text-blue-700">${quoteData.responsible.name}</p>
          <p class="text-slate-500 text-[11px] mt-0.5">Responsable de Cotización</p>
        </div>

      </div>

      <!-- TABLA DE PARTIDAS CON MEDIDAS -->
      <div class="border border-slate-300 rounded-lg overflow-hidden mb-5">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-900 text-white font-bold uppercase text-[10px] tracking-wider">
              <th class="py-2.5 px-3 text-center w-8">#</th>
              <th class="py-2.5 px-3">Descripción</th>
              <th class="py-2.5 px-3 text-center">Medidas requeridas</th>
              <th class="py-2.5 px-3 text-center">Total Medido</th>
              <th class="py-2.5 px-3 text-right">Precio/U</th>
              <th class="py-2.5 px-3 text-right">Importe</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>
      </div>

      <!-- DESGLOSE DE TOTALES Y CONDICIONES -->
      <div class="grid grid-cols-12 gap-4 items-start mb-8">
        
        <!-- Términos y Notas -->
        <div class="col-span-7 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span class="font-bold text-[10px] uppercase text-slate-500 tracking-wider block mb-1">Términos y Condiciones:</span>
          <p class="text-[11px] text-slate-600 whitespace-pre-line leading-relaxed">${quoteData.notes || 'Precios sujetos a confirmación de medidas en sitio.'}</p>
        </div>

        <!-- Resumen Financiero -->
        <div class="col-span-5 bg-slate-100 p-3.5 rounded-lg border border-slate-200 space-y-1.5 text-xs">
          <div class="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span class="font-bold text-slate-800">${formatCurrency(quoteData.totals.subtotal)}</span>
          </div>

          ${quoteData.totals.discountAmount > 0 ? `
            <div class="flex justify-between text-slate-600">
              <span>Descuento (${quoteData.totals.discountPercent}%):</span>
              <span class="font-bold text-slate-800">-${formatCurrency(quoteData.totals.discountAmount)}</span>
            </div>
          ` : ''}

          ${quoteData.totals.taxAmount > 0 ? `
            <div class="flex justify-between text-slate-600">
              <span>IVA (${quoteData.totals.taxRate}%):</span>
              <span class="font-bold text-slate-800">${formatCurrency(quoteData.totals.taxAmount)}</span>
            </div>
          ` : ''}

          <div class="pt-2 border-t border-slate-300 flex justify-between items-baseline">
            <span class="font-black text-slate-900 text-sm">TOTAL:</span>
            <span class="font-black text-blue-700 text-base">${formatCurrency(quoteData.totals.total)}</span>
          </div>

          <p class="text-[10px] text-slate-500 text-right pt-1">${numberToWordsSpanish(quoteData.totals.total)}</p>
        </div>

      </div>

      <!-- FIRMAS -->
      <div class="grid grid-cols-2 gap-12 pt-8 mt-6 border-t border-slate-200 text-center">
        <div>
          <div class="border-b border-slate-400 w-48 mx-auto mb-1"></div>
          <p class="font-bold text-slate-800">${quoteData.responsible.name}</p>
          <p class="text-[10px] text-slate-500">Firma del Responsable</p>
        </div>
        <div>
          <div class="border-b border-slate-400 w-48 mx-auto mb-1"></div>
          <p class="font-bold text-slate-800">${quoteData.client.name}</p>
          <p class="text-[10px] text-slate-500">Aceptación del Cliente</p>
        </div>
      </div>

    </div>
  `;
}

function getCurrentQuoteData() {
  const clientName = document.getElementById('clientName').value.trim() || 'Cliente Mostrador';
  const responsibleId = document.getElementById('quoteResponsibleSelect').value;
  const responsible = state.responsibles.find(r => r.id === responsibleId) || {
    name: 'Asesor de Ventas',
    position: 'Área de Presupuestos',
    phone: '',
    email: ''
  };

  return {
    folio: document.getElementById('quoteFolio').value.trim() || 'COT-1001',
    date: document.getElementById('quoteDate').value,
    validity: document.getElementById('quoteValidity').value,
    responsible,
    client: {
      name: clientName,
      phone: document.getElementById('clientPhone').value.trim(),
      email: document.getElementById('clientEmail').value.trim(),
      address: document.getElementById('clientAddress').value.trim()
    },
    items: [...state.currentQuoteItems],
    notes: document.getElementById('quoteNotes').value.trim(),
    totals: calculateQuoteTotals()
  };
}

function openPreviewModal() {
  if (state.currentQuoteItems.length === 0) {
    alert('Agrega al menos una partida a la cotización para ver la vista previa.');
    return;
  }
  const quoteData = getCurrentQuoteData();
  document.getElementById('printableInvoice').innerHTML = buildInvoiceHtml(quoteData);
  document.getElementById('modalPreview').classList.remove('hidden');
}

function closePreviewModal() {
  document.getElementById('modalPreview').classList.add('hidden');
}

/**
 * Descarga directa del archivo PDF en celular o computadora usando html2pdf.js
 */
async function downloadQuotePdf(customQuoteData = null) {
  const quoteData = customQuoteData || getCurrentQuoteData();
  if (!quoteData || (quoteData.items && quoteData.items.length === 0)) {
    alert('Agrega al menos una partida antes de descargar el PDF.');
    return;
  }

  const invoiceContainer = document.getElementById('printableInvoice');
  invoiceContainer.innerHTML = buildInvoiceHtml(quoteData);

  const btnModal = document.getElementById('btnDownloadPdfModal');
  if (btnModal) {
    btnModal.innerHTML = '<span class="inline-block animate-pulse">Generando PDF...</span>';
  }

  const cleanFolio = (quoteData.folio || 'COT-1001').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanClient = (quoteData.client && quoteData.client.name ? quoteData.client.name : 'Cliente').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 15);
  const filename = `Cotizacion_${cleanFolio}_${cleanClient}_Persianas_Beltran.pdf`;

  const opt = {
    margin: [6, 6, 6, 6],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' }
  };

  try {
    if (window.html2pdf) {
      await html2pdf().set(opt).from(invoiceContainer).save();
    } else {
      openPreviewModal();
      window.print();
    }
  } catch (err) {
    console.error('Error generando PDF con html2pdf:', err);
    openPreviewModal();
    window.print();
  } finally {
    if (btnModal) {
      btnModal.innerHTML = '<i data-lucide="download" class="w-3.5 h-3.5 mr-1"></i> Descargar PDF';
      if (window.lucide) window.lucide.createIcons();
    }
  }
}

/**
 * Envío directo y formateado de la cotización por WhatsApp (o Web Share)
 */
function shareViaWhatsApp(customQuoteData = null) {
  const quote = customQuoteData || getCurrentQuoteData();
  if (!quote || (quote.items && quote.items.length === 0)) {
    alert('Agrega al menos una partida antes de enviar la cotización.');
    return;
  }

  let text = `*COTIZACIÓN - PERSIANAS BELTRAN HMO*\n`;
  text += `📄 *Folio:* ${quote.folio}\n`;
  text += `📅 *Fecha:* ${quote.date} | Vigencia: ${quote.validity}\n`;
  text += `👤 *Cliente:* ${quote.client.name}\n`;
  text += `👔 *Atendido por:* ${quote.responsible.name}\n`;
  text += `------------------------------------\n`;
  text += `*DETALLE DE PARTIDAS:*\n`;

  quote.items.forEach((item, i) => {
    text += `\n*${i + 1}. ${item.productName}*\n`;
    text += `   📐 Medida: ${item.dimensionDetails}\n`;
    text += `   📊 Total: ${item.totalMeasured.toFixed(2)} ${item.unitLabel}\n`;
    text += `   💰 Precio: $${item.price.toFixed(2)} / ${item.unitLabel}\n`;
    text += `   💵 Importe: ${formatCurrency(item.subtotal)}\n`;
  });

  text += `\n------------------------------------\n`;
  text += `*Subtotal:* ${formatCurrency(quote.totals.subtotal)}\n`;
  if (quote.totals.discountAmount > 0) {
    text += `*Descuento (${quote.totals.discountPercent}%):* -${formatCurrency(quote.totals.discountAmount)}\n`;
  }
  if (quote.totals.taxAmount > 0) {
    text += `*IVA (${quote.totals.taxRate}%):* ${formatCurrency(quote.totals.taxAmount)}\n`;
  }
  text += `*TOTAL FINAL:* ${formatCurrency(quote.totals.total)}\n`;
  text += `------------------------------------\n`;
  if (quote.notes) {
    text += `📝 *Términos:* ${quote.notes.replace(/\n/g, ' ')}\n`;
    text += `------------------------------------\n`;
  }
  text += `_Persianas Beltran HMO • Fabricación e Instalación a la Medida_\n`;
  text += `_Hermosillo, Sonora • Tel: (662) 123 4567_`;

  let phone = (quote.client.phone || '').replace(/\D/g, '');
  if (phone.length === 10) {
    phone = '52' + phone;
  }

  const encodedText = encodeURIComponent(text);
  const waUrl = phone ? `https://wa.me/${phone}?text=${encodedText}` : `https://wa.me/?text=${encodedText}`;

  if (navigator.share) {
    navigator.share({
      title: `Cotización ${quote.folio} - Persianas Beltran HMO`,
      text: text
    }).catch(() => {
      window.open(waUrl, '_blank');
    });
  } else {
    window.open(waUrl, '_blank');
  }
}

function printQuote() {
  if (state.currentQuoteItems.length === 0) {
    alert('Agrega al menos una partida antes de imprimir.');
    return;
  }
  downloadQuotePdf();
}

function previewSavedQuote(id) {
  const quote = state.quotes.find(q => q.id === id);
  if (!quote) return;
  document.getElementById('printableInvoice').innerHTML = buildInvoiceHtml(quote);
  document.getElementById('modalPreview').classList.remove('hidden');
}

function downloadSavedQuotePdf(id) {
  const quote = state.quotes.find(q => q.id === id);
  if (!quote) return;
  downloadQuotePdf(quote);
}

function shareSavedQuoteViaWhatsApp(id) {
  const quote = state.quotes.find(q => q.id === id);
  if (!quote) return;
  shareViaWhatsApp(quote);
}

// ============================================================================
// ADMINISTRACIÓN DEL CATÁLOGO DE PRODUCTOS
// ============================================================================

function openProductModal(prodId = null) {
  const form = document.getElementById('productForm');
  form.reset();

  if (prodId) {
    const prod = state.products.find(p => p.id === prodId);
    if (prod) {
      document.getElementById('modalProductTitle').textContent = 'Editar Producto';
      document.getElementById('prodEditId').value = prod.id;
      document.getElementById('prodName').value = prod.name;
      document.getElementById('prodCategory').value = prod.category || '';
      document.getElementById('prodUnitType').value = prod.unitType;
      document.getElementById('prodPrice').value = prod.basePrice;
      document.getElementById('prodDescription').value = prod.description || '';
    }
  } else {
    document.getElementById('modalProductTitle').textContent = 'Nuevo Producto al Catálogo';
    document.getElementById('prodEditId').value = '';
  }

  document.getElementById('modalProduct').classList.remove('hidden');
}

function closeProductModal() {
  document.getElementById('modalProduct').classList.add('hidden');
}

function saveProduct(event) {
  event.preventDefault();
  const id = document.getElementById('prodEditId').value || `prod-${Date.now()}`;
  const name = document.getElementById('prodName').value.trim();
  const category = document.getElementById('prodCategory').value.trim() || 'General';
  const unitType = document.getElementById('prodUnitType').value;
  const basePrice = parseFloat(document.getElementById('prodPrice').value) || 0;
  const description = document.getElementById('prodDescription').value.trim();

  if (!name || basePrice <= 0) {
    alert('Por favor introduce un nombre válido y un precio mayor a 0.');
    return;
  }

  const existingIndex = state.products.findIndex(p => p.id === id);
  const prodData = { id, name, category, unitType, basePrice, description };

  if (existingIndex >= 0) {
    state.products[existingIndex] = prodData;
  } else {
    state.products.push(prodData);
  }

  saveStorage();
  closeProductModal();
  renderProductsTable();
  renderProductsDropdown();
}

function deleteProduct(id) {
  if (confirm('¿Deseas eliminar este producto del catálogo?')) {
    state.products = state.products.filter(p => p.id !== id);
    saveStorage();
    renderProductsTable();
    renderProductsDropdown();
  }
}

function renderProductsTable() {
  const tbody = document.getElementById('productsTableBody');
  const search = (document.getElementById('searchProductInput').value || '').toLowerCase();

  const filtered = state.products.filter(p =>
    p.name.toLowerCase().includes(search) ||
    (p.category && p.category.toLowerCase().includes(search))
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="py-8 text-center text-slate-400">
          <i data-lucide="package" class="w-8 h-8 mx-auto mb-2 text-slate-300"></i>
          <p class="font-medium">No hay productos que coincidan</p>
        </td>
      </tr>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  tbody.innerHTML = '';
  filtered.forEach(p => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition border-b border-slate-100 text-xs';

    let badgeType = '<span class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">Metro Cuadrado (m²)</span>';
    if (p.unitType === 'lineal') {
      badgeType = '<span class="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-semibold">Metro Lineal (m)</span>';
    } else if (p.unitType === 'pieza') {
      badgeType = '<span class="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-semibold">Pieza</span>';
    }

    const unitLabel = p.unitType === 'm2' ? 'm²' : (p.unitType === 'lineal' ? 'm' : 'pza');

    tr.innerHTML = `
      <td class="py-3 px-4 font-bold text-slate-900">${p.name}</td>
      <td class="py-3 px-4 text-slate-600 font-medium">${p.category || '-'}</td>
      <td class="py-3 px-4 text-center">${badgeType}</td>
      <td class="py-3 px-4 text-right font-black text-slate-900">$${p.basePrice.toFixed(2)} / ${unitLabel}</td>
      <td class="py-3 px-4 text-slate-500">${p.description || '-'}</td>
      <td class="py-3 px-4 text-center">
        <div class="flex items-center justify-center space-x-1.5">
          <button type="button" onclick="openProductModal('${p.id}')" class="p-1 text-slate-400 hover:text-blue-600 rounded transition" title="Editar">
            <i data-lucide="edit-2" class="w-4 h-4"></i>
          </button>
          <button type="button" onclick="deleteProduct('${p.id}')" class="p-1 text-slate-400 hover:text-rose-600 rounded transition" title="Eliminar">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (window.lucide) window.lucide.createIcons();
}

// ============================================================================
// CONFIGURACIÓN DE EMPRESA Y RESPALDO
// ============================================================================

function loadCompanyConfigForm() {
  const c = state.company;
  document.getElementById('cfgCompanyName').value = c.name || '';
  document.getElementById('cfgCompanyTaxId').value = c.taxId || '';
  document.getElementById('cfgCompanyPhone').value = c.phone || '';
  document.getElementById('cfgCompanyEmail').value = c.email || '';
  document.getElementById('cfgCompanyWebsite').value = c.website || '';
  document.getElementById('cfgCompanyAddress').value = c.address || '';
  document.getElementById('cfgCompanyTerms').value = c.defaultTerms || '';
}

function saveCompanyConfig(event) {
  event.preventDefault();
  state.company = {
    name: document.getElementById('cfgCompanyName').value.trim() || 'Mi Empresa',
    taxId: document.getElementById('cfgCompanyTaxId').value.trim(),
    phone: document.getElementById('cfgCompanyPhone').value.trim(),
    email: document.getElementById('cfgCompanyEmail').value.trim(),
    website: document.getElementById('cfgCompanyWebsite').value.trim(),
    address: document.getElementById('cfgCompanyAddress').value.trim(),
    defaultTerms: document.getElementById('cfgCompanyTerms').value.trim()
  };

  saveStorage();
  document.getElementById('headerCompanyName').textContent = state.company.name;
  alert('¡Configuración de la empresa guardada correctamente!');
}

function exportDataBackup() {
  const data = {
    company: state.company,
    responsibles: state.responsibles,
    products: state.products,
    quotes: state.quotes,
    exportedAt: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `respaldo_cotizaciones_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importDataBackup(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.responsibles && data.products) {
        state.responsibles = data.responsibles;
        state.products = data.products;
        state.quotes = data.quotes || [];
        state.company = data.company || DEFAULT_COMPANY;
        saveStorage();
        loadCompanyConfigForm();
        renderResponsiblesDropdown();
        renderProductsDropdown();
        renderProductsTable();
        renderResponsiblesGrid();
        renderHistoryTable();
        alert('¡Respaldo restaurado con éxito!');
      } else {
        alert('El archivo no contiene un formato de respaldo válido.');
      }
    } catch (err) {
      alert('Error al leer el archivo JSON.');
    }
  };
  reader.readAsText(file);
}

function resetToDemoData() {
  if (confirm('¿Restablecer el catálogo y responsables a los datos de ejemplo predeterminados?')) {
    state.responsibles = [...DEFAULT_RESPONSIBLES];
    state.products = [...DEFAULT_PRODUCTS];
    state.company = { ...DEFAULT_COMPANY };
    saveStorage();
    loadCompanyConfigForm();
    renderResponsiblesDropdown();
    renderProductsDropdown();
    renderProductsTable();
    renderResponsiblesGrid();
    alert('Datos restablecidos.');
  }
}

// ============================================================================
// UTILIDADES (MONEDA Y NÚMERO A LETRAS)
// ============================================================================

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  }).format(amount || 0);
}

function numberToWordsSpanish(amount) {
  if (isNaN(amount) || amount === 0) return 'Cero pesos 00/100 M.N.';

  const units = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  const teens = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
  const tens = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  const hundreds = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

  function convertGroup(n) {
    let output = '';
    if (n === 100) return 'cien';
    if (n > 99) {
      output += hundreds[Math.floor(n / 100)] + ' ';
      n %= 100;
    }
    if (n >= 10 && n <= 19) {
      output += teens[n - 10] + ' ';
    } else if (n >= 20) {
      if (n === 20) {
        output += 'veinte ';
      } else if (n > 20 && n < 30) {
        output += 'veinti' + units[n - 20] + ' ';
      } else {
        output += tens[Math.floor(n / 10)];
        if (n % 10 > 0) output += ' y ' + units[n % 10];
        output += ' ';
      }
    } else if (n > 0) {
      output += units[n] + ' ';
    }
    return output.trim();
  }

  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);
  const cents = decimalPart < 10 ? `0${decimalPart}` : `${decimalPart}`;

  if (integerPart === 0) return `Cero pesos ${cents}/100 M.N.`;

  let words = '';
  const millions = Math.floor(integerPart / 1000000);
  const thousands = Math.floor((integerPart % 1000000) / 1000);
  const remainder = integerPart % 1000;

  if (millions > 0) {
    words += (millions === 1 ? 'un millón ' : convertGroup(millions) + ' millones ');
  }
  if (thousands > 0) {
    words += (thousands === 1 ? 'mil ' : convertGroup(thousands) + ' mil ');
  }
  if (remainder > 0) {
    words += convertGroup(remainder) + ' ';
  }

  words = words.trim();
  words = words.charAt(0).toUpperCase() + words.slice(1);
  return `${words} pesos ${cents}/100 M.N.`;
}
