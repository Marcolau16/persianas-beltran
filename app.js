/**
 * app.js - Sistema de cotizaciones con captura manual
 */

// ============================================================================
// DATOS POR DEFECTO Y ESTADO DE LA APLICACIÓN
// ============================================================================

const DEFAULT_RESPONSIBLES = [
  {
    id: 'resp-1',
    name: 'David Alejandro Machado Vega',
    phone: '6622999872'
  },
  {
    id: 'resp-2',
    name: 'Malio Beltran',
    phone: '6621234567'
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
  phone: '6622999872',
  email: 'contacto@persianasbeltranhmo.com',
  website: 'www.persianasbeltranhmo.com',
  address: 'Avenida 6 de Abril #356 entre Monteverde y 12 de Octubre, Col. Ley 57. Hermosillo, Sonora, C.P. 83100.'
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
  document.getElementById('quoteFolio').value = getNextQuoteFolio();
  
  const quoteDateInput = document.getElementById('quoteDate');
  if (quoteDateInput && !quoteDateInput.value) {
    quoteDateInput.value = new Date().toISOString().slice(0, 10);
  }

  const quoteRespInput = document.getElementById('quoteResponsible');
  if (quoteRespInput && !quoteRespInput.value && state.responsibles.length > 0) {
    quoteRespInput.value = state.responsibles[0].name;
  }

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
  // Helper to parse JSON safely; returns fallback on error.
  const safeParse = (value, fallback) => {
    try { return JSON.parse(value); } catch (_) { return fallback; }
  };

  const savedResp = localStorage.getItem('cotizador_responsibles');
  if (!savedResp) {
    state.responsibles = DEFAULT_RESPONSIBLES;
    localStorage.setItem('cotizador_responsibles', JSON.stringify(DEFAULT_RESPONSIBLES));
  } else {
    state.responsibles = safeParse(savedResp, DEFAULT_RESPONSIBLES);
  }

  const savedProd = localStorage.getItem('cotizador_products');
  if (!savedProd) {
    state.products = DEFAULT_PRODUCTS;
    localStorage.setItem('cotizador_products', JSON.stringify(DEFAULT_PRODUCTS));
  } else {
    state.products = safeParse(savedProd, DEFAULT_PRODUCTS);
  }

  const savedQuotes = localStorage.getItem('cotizador_quotes');
  state.quotes = safeParse(savedQuotes, []);

  const savedComp = localStorage.getItem('cotizador_company');
  if (!savedComp) {
    state.company = DEFAULT_COMPANY;
    localStorage.setItem('cotizador_company', JSON.stringify(DEFAULT_COMPANY));
  } else {
    state.company = safeParse(savedComp, DEFAULT_COMPANY);
  }

}

function saveStorage() {
  localStorage.setItem('cotizador_responsibles', JSON.stringify(state.responsibles));
  localStorage.setItem('cotizador_products', JSON.stringify(state.products));
  localStorage.setItem('cotizador_quotes', JSON.stringify(state.quotes));
  localStorage.setItem('cotizador_company', JSON.stringify(state.company));
  updateBadges();
}

function updateBadges() {
  document.getElementById('badge-history-count').textContent = state.quotes.length;
}

function getNextQuoteFolio() {
  const highestNumber = state.quotes.reduce((max, quote) => {
    const match = /^COT-(\d+)$/i.exec(quote.folio || '');
    return match ? Math.max(max, Number(match[1])) : max;
  }, 1000);
  return `COT-${highestNumber + 1}`;
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

// ============================================================================
// CAPTURA MANUAL DE PARTIDAS
// ============================================================================

function calculateItemTotal() {
  const widthRaw = (document.getElementById('itemWidth').value || '').trim();
  const heightRaw = (document.getElementById('itemHeight').value || '').trim();
  const quantityInput = document.getElementById('itemQuantity');
  
  // Cantidad de piezas que el usuario desea comprar (por defecto 1 si está vacío o <= 0)
  let pieces = parseFloat(quantityInput.value);
  if (isNaN(pieces) || pieces <= 0) {
    pieces = 1;
  }

  // Extraer números limpios de ancho y alto
  let w = parseFloat(widthRaw.replace(/[^0-9.]/g, '')) || 0;
  let h = parseFloat(heightRaw.replace(/[^0-9.]/g, '')) || 0;

  // Si están expresados en centímetros (mayores a 10), convertir a metros para el cálculo de área
  if (w > 10) w = w / 100;
  if (h > 10) h = h / 100;

  const areaM2 = (w > 0 && h > 0) ? (w * h) : 0;

  const listPrice = parseFloat(document.getElementById('itemListPrice').value) || 0;
  const discountPercent = parseFloat(document.getElementById('itemDiscountPercent').value) || 0;
  const unitPrice = listPrice * (1 - discountPercent / 100);

  // Si hay medidas (persianas), el precio de lista es por m²:
  // Importe = piezas × área m² × precio unitario
  // Si no hay medidas (ej. servicios, piezas fijas):
  // Importe = piezas × precio unitario
  let subtotal = 0;
  if (areaM2 > 0) {
    subtotal = pieces * areaM2 * unitPrice;
  } else {
    subtotal = pieces * unitPrice;
  }

  document.getElementById('liveUnitPrice').textContent = formatCurrency(unitPrice);
  document.getElementById('livePartidaSubtotal').textContent = formatCurrency(subtotal);

  return { pieces, areaM2, listPrice, discountPercent, unitPrice, subtotal, hasDimensions: (w > 0 && h > 0) };
}

function addItemToQuote() {
  const characteristicInput = document.getElementById('itemCharacteristic');
  const characteristic = characteristicInput ? characteristicInput.value.trim() : '';
  const widthRaw = document.getElementById('itemWidth').value.trim();
  const heightRaw = document.getElementById('itemHeight').value.trim();
  const { pieces, areaM2, listPrice, discountPercent, unitPrice, subtotal, hasDimensions } = calculateItemTotal();

  if (!characteristic) {
    alert('Escribe la característica o nombre del producto.');
    if (characteristicInput) characteristicInput.focus();
    return;
  }
  if (pieces <= 0 || listPrice < 0 || discountPercent < 0 || discountPercent > 100) {
    alert('Revisa la cantidad, el precio de lista y el descuento de la partida.');
    return;
  }

  // Dar formato amigable a las medidas como en la foto de referencia (ej: "129 cm" o "1.29 m")
  let widthFormatted = widthRaw;
  let heightFormatted = heightRaw;
  if (widthRaw && !isNaN(widthRaw)) {
    widthFormatted = parseFloat(widthRaw) > 10 ? `${parseFloat(widthRaw)} cm` : `${parseFloat(widthRaw)} m`;
  }
  if (heightRaw && !isNaN(heightRaw)) {
    heightFormatted = parseFloat(heightRaw) > 10 ? `${parseFloat(heightRaw)} cm` : `${parseFloat(heightRaw)} m`;
  }

  // Formato para la columna Unidad de la cotización
  let unitFormatted = `${pieces}`;
  if (hasDimensions && areaM2 > 0) {
    const areaRounded = (Math.round(areaM2 * 100) / 100).toFixed(2);
    unitFormatted = pieces > 1 ? `${pieces} (${areaRounded} m²)` : `${areaRounded} m²`;
  }

  state.currentQuoteItems.push({
    id: `item-${Date.now()}`,
    concept: '',
    characteristic: characteristic,
    width: widthFormatted,
    height: heightFormatted,
    quantity: pieces,
    unit: unitFormatted,
    listPrice,
    discountPercent,
    unitPrice,
    subtotal,
    comments: document.getElementById('itemComments').value.trim()
  });

  const idsToClear = ['itemCharacteristic', 'itemWidth', 'itemHeight', 'itemListPrice', 'itemDiscountPercent', 'itemComments'];
  idsToClear.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const qtyInput = document.getElementById('itemQuantity');
  if (qtyInput) qtyInput.value = '1';

  calculateItemTotal();
  renderQuoteItemsTable();
  calculateQuoteTotals();
}

function removeQuoteItem(index) {
  state.currentQuoteItems.splice(index, 1);
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
        <td colspan="11" class="py-8 text-center text-slate-400">
          <i data-lucide="shopping-cart" class="w-8 h-8 mx-auto mb-2 text-slate-300"></i>
          <p class="font-medium">No has agregado ningún producto a la cotización</p>
          <p class="text-[11px] text-slate-400">Escribe los datos y haz clic en "Agregar producto"</p>
        </td>
      </tr>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  tbody.innerHTML = '';
  state.currentQuoteItems.forEach((item, index) => {
    const values = getQuoteItemValues(item);
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition border-b border-slate-100 text-xs';
    tr.innerHTML = `
      <td class="py-3 px-3 text-center font-bold text-slate-500">${index + 1}</td>
      <td class="py-3 px-4 font-bold text-slate-800">${escapeHtml(values.characteristic)}</td>
      <td class="py-3 px-3 text-center">${escapeHtml(values.width)}</td>
      <td class="py-3 px-3 text-center">${escapeHtml(values.height)}</td>
      <td class="py-3 px-3 text-center font-medium">${escapeHtml(values.unit)}</td>
      <td class="py-3 px-3 text-right">${formatCurrency(values.listPrice)}</td>
      <td class="py-3 px-3 text-right">${values.discountPercent}%</td>
      <td class="py-3 px-3 text-right">${formatCurrency(values.unitPrice)}</td>
      <td class="py-3 px-3 text-right font-black text-slate-900">${formatCurrency(values.subtotal)}</td>
      <td class="py-3 px-3 text-center font-semibold text-slate-700">${escapeHtml(values.comments)}</td>
      <td class="py-3 px-2 text-center">
        <button type="button" onclick="removeQuoteItem(${index})" class="p-1 text-slate-400 hover:text-rose-600 rounded transition" title="Eliminar partida">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (window.lucide) window.lucide.createIcons();
}

/**
 * Cálculo de Subtotal y Total
 */
function calculateQuoteTotals() {
  const subtotal = state.currentQuoteItems.reduce((acc, item) => acc + (Number(item.subtotal) || 0), 0);
  const total = subtotal;

  const depositInput = document.getElementById('depositAmount');
  let depositAmount;
  if (depositInput.value === '' && total > 0) {
    // Sugerir 50% de anticipo por defecto como en el formato de referencia
    depositAmount = Math.round((total / 2) * 100) / 100;
    depositInput.value = depositAmount.toFixed(2);
  } else {
    depositAmount = parseFloat(depositInput.value) || 0;
  }
  const balanceAmount = Math.max(0, total - depositAmount);

  document.getElementById('summarySubtotal').textContent = formatCurrency(subtotal);
  document.getElementById('summaryTotal').textContent = formatCurrency(total);
  document.getElementById('totalInWords').textContent = numberToWordsSpanish(total);
  document.getElementById('summaryBalance').textContent = formatCurrency(balanceAmount);

  return {
    subtotal,
    total,
    depositAmount,
    balanceAmount
  };
}

function resetQuoteForm() {
  if (state.currentQuoteItems.length > 0 && !confirm('¿Deseas vaciar los datos de la cotización actual?')) {
    return;
  }
  state.currentQuoteItems = [];
  renderQuoteItemsTable();
  const idsToClear = ['itemCharacteristic', 'itemWidth', 'itemHeight', 'itemQuantity', 'itemListPrice', 'itemDiscountPercent', 'itemComments'];
  idsToClear.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  // Resetear campos de cliente
  document.getElementById('clientName').value = '';
  document.getElementById('clientPhone').value = '';
  document.getElementById('clientEmail').value = '';
  document.getElementById('clientAddress').value = '';
  const colonyInput = document.getElementById('clientColony');
  if (colonyInput) colonyInput.value = '';
  document.getElementById('quoteResponsible').value = state.responsibles.length > 0 ? state.responsibles[0].name : '';
  document.getElementById('quoteDate').value = new Date().toISOString().slice(0, 10);
  document.getElementById('quoteFolio').value = getNextQuoteFolio();
  document.getElementById('quoteComments').value = '';
  document.getElementById('depositAmount').value = '';

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

  const depositAmount = Number(document.getElementById('depositAmount').value);
  if (!Number.isFinite(depositAmount) || depositAmount < 0) {
    alert('El anticipo debe ser un monto igual o mayor a $0.');
    document.getElementById('depositAmount').focus();
    return;
  }

  if (state.currentQuoteItems.length === 0) {
    alert('Debes agregar al menos un producto antes de guardar la cotización.');
    return;
  }

  const totals = calculateQuoteTotals();
  const colonyInput = document.getElementById('clientColony');

  const quote = {
    id: `quote-${Date.now()}`,
    folio: document.getElementById('quoteFolio').value.trim(),
    date: document.getElementById('quoteDate').value,
    responsible: { 
      name: document.getElementById('quoteResponsible').value.trim() || 'David Alejandro Machado Vega',
      phone: state.company.phone || '6622999872'
    },
    client: {
      name: clientName,
      phone: document.getElementById('clientPhone').value.trim(),
      email: document.getElementById('clientEmail').value.trim(),
      address: document.getElementById('clientAddress').value.trim(),
      colony: colonyInput ? (colonyInput.value.trim() || 'N/A') : 'N/A'
    },
    items: [...state.currentQuoteItems],
    comments: document.getElementById('quoteComments').value.trim(),
    totals,
    status: 'Pendiente',
    createdAt: new Date().toISOString()
  };

  state.quotes.unshift(quote);
  saveStorage();
  renderHistoryTable();

  alert(`¡Cotización ${quote.folio || 'sin folio'} guardada exitosamente en el historial!`);
  document.getElementById('quoteFolio').value = getNextQuoteFolio();
}

// ============================================================================
// HISTORIAL DE COTIZACIONES
// ============================================================================

function renderHistoryTable() {
  const tbody = document.getElementById('historyTableBody');
  const search = (document.getElementById('searchHistoryInput').value || '').toLowerCase();

  const filtered = state.quotes.filter(q => 
    (q.folio || '').toLowerCase().includes(search) || 
    (q.client && q.client.name ? q.client.name : '').toLowerCase().includes(search) ||
    (q.responsible && q.responsible.name ? q.responsible.name : '').toLowerCase().includes(search)
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr class="history-empty-row">
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
      <td data-label="Folio" class="py-3 px-4 font-bold text-blue-600">${escapeHtml(q.folio || '')}</td>
      <td data-label="Fecha" class="py-3 px-4 text-slate-600">${escapeHtml(q.date || '')}</td>
      <td data-label="Cliente" class="py-3 px-4 font-semibold text-slate-900">
        ${escapeHtml(q.client && q.client.name ? q.client.name : '')}
        ${q.client && q.client.phone ? `<span class="block text-[11px] text-slate-400 font-normal">${escapeHtml(q.client.phone)}</span>` : ''}
      </td>
      <td data-label="Vendedor" class="py-3 px-4 text-slate-600">${escapeHtml(q.responsible ? q.responsible.name : '-')}</td>
      <td data-label="Partidas" class="py-3 px-4 text-center text-slate-600">${q.items.length}</td>
      <td data-label="Total" class="py-3 px-4 text-right font-black text-slate-900">${formatCurrency(q.totals.total)}</td>
      <td data-label="Estado" class="py-3 px-4 text-center">
        <select onchange="updateQuoteStatus('${q.id}', this.value)" class="text-[11px] font-semibold rounded px-2 py-0.5 border border-slate-200 ${statusClass}">
          <option value="Pendiente" ${q.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
          <option value="Aprobada" ${q.status === 'Aprobada' ? 'selected' : ''}>Aprobada</option>
          <option value="Facturada" ${q.status === 'Facturada' ? 'selected' : ''}>Facturada</option>
          <option value="Rechazada" ${q.status === 'Rechazada' ? 'selected' : ''}>Rechazada</option>
        </select>
      </td>
      <td data-label="Acciones" class="py-3 px-3 text-center">
        <div class="history-actions flex items-center justify-center space-x-1 sm:space-x-1.5">
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
  document.getElementById('quoteResponsible').value = original.responsible ? original.responsible.name || '' : '';
  document.getElementById('quoteDate').value = '';
  document.getElementById('quoteFolio').value = getNextQuoteFolio();
  document.getElementById('quoteComments').value = original.comments || '';
  const legacyDepositAmount = Number(original.totals.total) * ((Number(original.totals.depositPercent) || 0) / 100);
  document.getElementById('depositAmount').value = original.totals.depositAmount !== undefined
    ? original.totals.depositAmount
    : legacyDepositAmount || '';

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
  const comp = state.company || {};
  const sellerName = (quoteData.responsible && quoteData.responsible.name) ? quoteData.responsible.name : (DEFAULT_RESPONSIBLES[0].name || '');
  const sellerPhone = (quoteData.responsible && quoteData.responsible.phone) ? quoteData.responsible.phone : (comp.phone || '6622999872');
  const logoSrc = (typeof LOGO_BELTRAN_BASE64 !== 'undefined' && LOGO_BELTRAN_BASE64) ? LOGO_BELTRAN_BASE64 : 'logo-beltran.png';

  const itemsRows = quoteData.items.map((item) => {
    const values = getQuoteItemValues(item);
    return `
      <tr style="background-color: #ffffff; color: #000000;">
        <td style="border: 1px solid #7f7f7f; padding: 5px 6px; text-align: center; font-weight: 500;">${escapeHtml(values.characteristic || values.concept)}</td>
        <td style="border: 1px solid #7f7f7f; padding: 5px 2px; text-align: center;">${escapeHtml(values.width)}</td>
        <td style="border: 1px solid #7f7f7f; padding: 5px 2px; text-align: center;">${escapeHtml(values.height)}</td>
        <td style="border: 1px solid #7f7f7f; padding: 5px 2px; text-align: center;">${escapeHtml(values.unit)}</td>
        <td style="border: 1px solid #7f7f7f; padding: 5px 4px; text-align: center;">${formatCurrency(values.listPrice)}</td>
        <td style="border: 1px solid #7f7f7f; padding: 5px 2px; text-align: center;">${values.discountPercent}</td>
        <td style="border: 1px solid #7f7f7f; padding: 5px 4px; text-align: center;">${formatCurrency(values.unitPrice)}</td>
        <td style="border: 1px solid #7f7f7f; padding: 5px 4px; text-align: center; font-weight: 500;">${formatCurrency(values.subtotal)}</td>
        <td style="border: 1px solid #7f7f7f; padding: 5px 4px; text-align: center; font-weight: bold;">${escapeHtml(values.comments)}</td>
      </tr>
    `;
  }).join('');

  const totals = quoteData.totals || {};
  const depositAmount = totals.depositAmount !== undefined ? Number(totals.depositAmount) : (Number(totals.total || 0) / 2);
  const balanceAmount = totals.balanceAmount !== undefined ? Number(totals.balanceAmount) : Math.max(0, Number(totals.total || 0) - depositAmount);

  return `
    <div class="invoice-page" style="width: 720px; max-width: 720px; min-width: 720px; margin: 0 auto; background: #ffffff; color: #111111; font-family: Arial, Helvetica, sans-serif; font-size: 10px; line-height: 1.3; padding: 12px; box-sizing: border-box;">
      
      <!-- TÍTULO -->
      <div style="font-size: 17px; font-weight: 600; letter-spacing: 2.5px; color: #7f7f7f; margin-bottom: 8px; text-align: left; padding-left: 2px;">
        COTIZACIÓN
      </div>

      <!-- ENCABEZADO CON TABLA DE CLIENTE Y LOGO -->
      <div style="display: flex; gap: 8px; align-items: stretch; margin-bottom: 8px;">
        
        <!-- Tabla de Datos -->
        <table style="flex: 1; border-collapse: collapse; border: 1.5px solid #7f7f7f; font-size: 10px; width: 100%; table-layout: fixed;">
          <tr>
            <td style="background-color: #888888; color: #ffffff; font-weight: 500; text-align: center; padding: 5px 3px; border: 1px solid #7f7f7f; width: 12%;">Cliente</td>
            <td style="background-color: #ffffff; color: #000000; text-align: center; padding: 5px 4px; border: 1px solid #7f7f7f; width: 26%; font-weight: 500;">${escapeHtml(quoteData.client.name || '')}</td>
            <td style="background-color: #888888; color: #ffffff; font-weight: 500; text-align: center; padding: 5px 3px; border: 1px solid #7f7f7f; width: 12%;">Teléfono</td>
            <td style="background-color: #ffffff; color: #000000; text-align: center; padding: 5px 4px; border: 1px solid #7f7f7f; width: 16%;">${escapeHtml(quoteData.client.phone || '')}</td>
            <td style="background-color: #888888; color: #ffffff; font-weight: 500; text-align: center; padding: 5px 3px; border: 1px solid #7f7f7f; width: 15%; white-space: nowrap;">Cotización</td>
            <td style="background-color: #ffffff; color: #000000; text-align: center; padding: 5px 4px; border: 1px solid #7f7f7f; width: 19%; font-weight: bold; white-space: nowrap;">${escapeHtml(quoteData.folio || '')}</td>
          </tr>
          <tr>
            <td style="background-color: #888888; color: #ffffff; font-weight: 500; text-align: center; padding: 5px 3px; border: 1px solid #7f7f7f;">Dirección</td>
            <td style="background-color: #ffffff; color: #000000; text-align: center; padding: 5px 4px; border: 1px solid #7f7f7f;">${escapeHtml(quoteData.client.address || '')}</td>
            <td style="background-color: #888888; color: #ffffff; font-weight: 500; text-align: center; padding: 5px 3px; border: 1px solid #7f7f7f;">Colonia</td>
            <td style="background-color: #ffffff; color: #000000; text-align: center; padding: 5px 4px; border: 1px solid #7f7f7f;">${escapeHtml(quoteData.client.colony || 'N/A')}</td>
            <td style="background-color: #888888; color: #ffffff; font-weight: 500; text-align: center; padding: 5px 3px; border: 1px solid #7f7f7f; white-space: nowrap;">Fecha</td>
            <td style="background-color: #ffffff; color: #000000; text-align: center; padding: 5px 4px; border: 1px solid #7f7f7f; white-space: nowrap;">${escapeHtml(formatQuoteDate(quoteData.date))}</td>
          </tr>
        </table>

        <!-- Logo Persianas Beltrán -->
        <div style="width: 140px; min-width: 140px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border: 1.5px solid #888888; border-radius: 8px; padding: 3px 6px; background: #ffffff;">
          <img src="${logoSrc}" alt="Persianas Beltrán HMO" style="max-height: 52px; max-width: 100%; object-fit: contain;">
        </div>
      </div>

      <!-- TEXTO INTRODUCTORIO -->
      <p style="text-align: center; font-size: 9.5px; color: #333333; margin: 6px 0 10px 0; line-height: 1.35;">
        Presentamos para ser considerada nuestra cotización, en la que ofrecemos el producto ideal con mayor calidad para su necesidad decorativa. Para nosotros también es importante su patrimonio.
      </p>

      <!-- TABLA DE PARTIDAS -->
      <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #7f7f7f; font-size: 10px; margin-bottom: 10px;">
        <thead>
          <tr style="background-color: #888888; color: #ffffff;">
            <th style="border: 1px solid #7f7f7f; padding: 5px 6px; font-weight: 600; text-align: center; width: 26%;">Característica / Producto</th>
            <th style="border: 1px solid #7f7f7f; padding: 5px 2px; font-weight: 600; text-align: center; width: 9%;">Ancho</th>
            <th style="border: 1px solid #7f7f7f; padding: 5px 2px; font-weight: 600; text-align: center; width: 9%;">Alto</th>
            <th style="border: 1px solid #7f7f7f; padding: 5px 2px; font-weight: 600; text-align: center; width: 9%;">Unidad</th>
            <th style="border: 1px solid #7f7f7f; padding: 5px 4px; font-weight: 600; text-align: center; width: 10%;">Lista</th>
            <th style="border: 1px solid #7f7f7f; padding: 5px 2px; font-weight: 600; text-align: center; width: 8%;">Desc. (%)</th>
            <th style="border: 1px solid #7f7f7f; padding: 5px 4px; font-weight: 600; text-align: center; width: 11%;">Precio</th>
            <th style="border: 1px solid #7f7f7f; padding: 5px 4px; font-weight: 600; text-align: center; width: 12%;">Importe</th>
            <th style="border: 1px solid #7f7f7f; padding: 5px 4px; font-weight: 600; text-align: center; width: 11%;">Comentarios</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <!-- TOTALES Y ANTICIPO -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
        
        <!-- Anticipo y Liquidación -->
        <table style="width: 28%; border-collapse: collapse; border: 1px solid #7f7f7f; font-size: 10px;">
          <tr>
            <td style="background-color: #888888; color: #ffffff; font-weight: 500; text-align: center; padding: 4px 6px; border: 1px solid #7f7f7f; width: 45%;">Anticipo</td>
            <td style="background-color: #ffffff; color: #000000; text-align: center; padding: 4px 6px; border: 1px solid #7f7f7f; width: 55%;">${formatCurrency(depositAmount)}</td>
          </tr>
          <tr>
            <td style="background-color: #888888; color: #ffffff; font-weight: 500; text-align: center; padding: 4px 6px; border: 1px solid #7f7f7f;">Liquidación</td>
            <td style="background-color: #ffffff; color: #000000; text-align: center; padding: 4px 6px; border: 1px solid #7f7f7f;">${formatCurrency(balanceAmount)}</td>
          </tr>
        </table>

        <!-- Subtotal, IVA, Total -->
        <table style="width: 28%; border-collapse: collapse; border: 1px solid #7f7f7f; font-size: 10px;">
          <tr>
            <td style="background-color: #888888; color: #ffffff; font-weight: 500; text-align: center; padding: 4px 6px; border: 1px solid #7f7f7f; width: 45%;">Sub-total</td>
            <td style="background-color: #ffffff; color: #000000; text-align: center; padding: 4px 6px; border: 1px solid #7f7f7f; width: 55%; font-weight: 500;">${formatCurrency(totals.subtotal || 0)}</td>
          </tr>
          <tr>
            <td style="background-color: #888888; color: #ffffff; font-weight: 500; text-align: center; padding: 4px 6px; border: 1px solid #7f7f7f;">I.V.A.</td>
            <td style="background-color: #ffffff; color: #000000; text-align: center; padding: 4px 6px; border: 1px solid #7f7f7f;">$0.00</td>
          </tr>
          <tr>
            <td style="background-color: #888888; color: #ffffff; font-weight: bold; text-align: center; padding: 4px 6px; border: 1px solid #7f7f7f;">Total</td>
            <td style="background-color: #ffffff; color: #000000; text-align: center; padding: 4px 6px; border: 1px solid #7f7f7f; font-weight: bold;">${formatCurrency(totals.total || 0)}</td>
          </tr>
        </table>

      </div>

      <!-- COMENTARIOS ADICIONALES -->
      <div style="border: 1.5px solid #444444; padding: 6px 10px; margin-bottom: 8px; text-align: center; font-size: 9.5px; background: #ffffff;">
        <div style="font-weight: bold; margin-bottom: 3px; letter-spacing: 0.5px; color: #000000;">COMENTARIOS ADICIONALES:</div>
        <div style="color: #333333; line-height: 1.35;">
          Las unidades representan el área mínima recomendada (m²). Le sugerimos agendar cita para confirmar las medidas y presentar nuestro catálogo de telas.${quoteData.comments ? `<br><span style="font-weight: 600; color: #000000; display: inline-block; margin-top: 3px;">${escapeHtml(quoteData.comments)}</span>` : ''}
        </div>
      </div>

      <!-- CONDICIONES COMERCIALES -->
      <div style="border: 1px solid #888888; background-color: #efefef; padding: 6px 10px; margin-bottom: 12px; text-align: center; font-size: 9.5px;">
        <div style="font-weight: bold; margin-bottom: 3px; letter-spacing: 0.5px; color: #000000;">CONDICIONES COMERCIALES</div>
        <div style="color: #333333; line-height: 1.35;">
          1.- Precios en Pesos Mexicanos, 2.- Entregas en Hermosillo en 10 días hábiles, 3.- Vigencia de cotización de 15 días o agotar existencia.
        </div>
      </div>

      <!-- PIE DE PÁGINA -->
      <div style="text-align: center; font-size: 9.5px; color: #222222; line-height: 1.45;">
        <div><b>Vendedor:</b> ${escapeHtml(sellerName)} &nbsp;&nbsp; <b>Celular:</b> ${escapeHtml(sellerPhone)}</div>
        <div>${escapeHtml(comp.address || 'Avenida 6 de Abril #356 entre Monteverde y 12 de Octubre, Col. Ley 57.')}</div>
        <div>Hermosillo, Sonora, C.P. 83100.</div>
      </div>

    </div>
  `;
}

function getCurrentQuoteData() {
  const colonyInput = document.getElementById('clientColony');
  return {
    folio: document.getElementById('quoteFolio').value.trim(),
    date: document.getElementById('quoteDate').value,
    responsible: { 
      name: document.getElementById('quoteResponsible').value.trim() || 'David Alejandro Machado Vega',
      phone: state.company.phone || '6622999872'
    },
    client: {
      name: document.getElementById('clientName').value.trim(),
      phone: document.getElementById('clientPhone').value.trim(),
      email: document.getElementById('clientEmail').value.trim(),
      address: document.getElementById('clientAddress').value.trim(),
      colony: colonyInput ? (colonyInput.value.trim() || 'N/A') : 'N/A'
    },
    items: [...state.currentQuoteItems],
    comments: document.getElementById('quoteComments').value.trim(),
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

  const invoiceHtml = buildInvoiceHtml(quoteData);

  // Actualizar también la vista previa en el modal si está abierto
  const invoiceContainer = document.getElementById('printableInvoice');
  if (invoiceContainer) {
    invoiceContainer.innerHTML = invoiceHtml;
  }

  const btnModal = document.getElementById('btnDownloadPdfModal');
  if (btnModal) {
    btnModal.innerHTML = '<span class="inline-block animate-pulse">Generando PDF...</span>';
  }

  const cleanFolio = (quoteData.folio || 'COT-1001').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanClient = (quoteData.client && quoteData.client.name ? quoteData.client.name : 'Cliente').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 15);
  const filename = `Cotizacion_${cleanFolio}_${cleanClient}_Persianas_Beltran.pdf`;

  // Contenedor temporal aislado sin interferencia de scroll ni márgenes de ventana
  const exportWrapper = document.createElement('div');
  exportWrapper.id = 'pdf-export-wrapper';
  exportWrapper.style.position = 'absolute';
  exportWrapper.style.left = '0px';
  exportWrapper.style.top = '0px';
  exportWrapper.style.width = '720px';
  exportWrapper.style.minWidth = '720px';
  exportWrapper.style.maxWidth = '720px';
  exportWrapper.style.background = '#ffffff';
  exportWrapper.style.margin = '0';
  exportWrapper.style.padding = '0';
  exportWrapper.style.boxSizing = 'border-box';
  exportWrapper.style.zIndex = '999999';
  exportWrapper.innerHTML = invoiceHtml;
  document.body.appendChild(exportWrapper);

  const targetElement = exportWrapper.firstElementChild || exportWrapper;
  targetElement.style.margin = '0';
  targetElement.style.width = '720px';
  targetElement.style.maxWidth = '720px';

  // Esperar un instante para garantizar que el renderizado de DOM y estilos esté finalizado
  await new Promise(resolve => setTimeout(resolve, 150));

  const opt = {
    margin: [8, 8, 8, 8],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      width: 720,
      windowWidth: 720
    },
    jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' }
  };

  try {
    if (window.html2pdf) {
      await html2pdf().set(opt).from(targetElement).save();
    } else {
      openPreviewModal();
      window.print();
    }
  } catch (err) {
    console.error('Error generando PDF con html2pdf:', err);
    openPreviewModal();
    window.print();
  } finally {
    if (exportWrapper && exportWrapper.parentNode) {
      exportWrapper.parentNode.removeChild(exportWrapper);
    }
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

  void downloadQuotePdf(quote);

  let text = `*COTIZACIÓN - PERSIANAS BELTRAN HMO*\n`;
  text += `📄 *Folio:* ${quote.folio || ''}\n`;
  text += `📅 *Fecha:* ${formatQuoteDate(quote.date)}\n`;
  text += `👤 *Cliente:* ${quote.client.name}\n`;
  text += `👔 *Atendido por:* ${quote.responsible ? quote.responsible.name : ''}\n`;
  text += `------------------------------------\n`;
  text += `*DETALLE DE PARTIDAS:*\n`;

  quote.items.forEach((item, i) => {
    const values = getQuoteItemValues(item);
    text += `\n*${i + 1}. ${values.concept}*`;
    if (values.characteristic) text += ` - ${values.characteristic}`;
    text += `\n`;
    if (values.width && values.height) text += `   📐 Medidas: ${values.width} × ${values.height}\n`;
    text += `   📊 Unidades: ${values.unit || values.quantity}\n`;
    text += `   💰 Lista: ${formatCurrency(values.listPrice)} | Descuento: ${values.discountPercent}%\n`;
    text += `   💵 Precio: ${formatCurrency(values.unitPrice)} | Importe: ${formatCurrency(values.subtotal)}\n`;
    if (values.comments) text += `   💬 ${values.comments}\n`;
  });

  text += `\n------------------------------------\n`;
  text += `*Subtotal:* ${formatCurrency(quote.totals.subtotal)}\n`;
  if (quote.totals.discountAmount > 0 && !quote.items.some(item => item.listPrice !== undefined)) {
    text += `*Descuento (${quote.totals.discountPercent}%):* -${formatCurrency(quote.totals.discountAmount)}\n`;
  }
  text += `*TOTAL FINAL:* ${formatCurrency(quote.totals.total)}\n`;
  if (quote.totals.depositAmount !== undefined) {
    text += `*Anticipo:* ${formatCurrency(quote.totals.depositAmount)}\n`;
    text += `*Liquidación:* ${formatCurrency(quote.totals.balanceAmount)}\n`;
  }
  text += `------------------------------------\n`;
  if (quote.comments) {
    text += `💬 *Comentarios adicionales:* ${quote.comments.replace(/\n/g, ' ')}\n`;
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
      title: `Cotización ${quote.folio || ''} - Persianas Beltran HMO`,
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
}

function deleteProduct(id) {
  if (confirm('¿Deseas eliminar este producto del catálogo?')) {
    state.products = state.products.filter(p => p.id !== id);
    saveStorage();
    renderProductsTable();
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
}

function saveCompanyConfig(event) {
  event.preventDefault();
  state.company = {
    name: document.getElementById('cfgCompanyName').value.trim() || 'Mi Empresa',
    taxId: document.getElementById('cfgCompanyTaxId').value.trim(),
    phone: document.getElementById('cfgCompanyPhone').value.trim(),
    email: document.getElementById('cfgCompanyEmail').value.trim(),
    website: document.getElementById('cfgCompanyWebsite').value.trim(),
    address: document.getElementById('cfgCompanyAddress').value.trim()
  };

  saveStorage();
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

// ============================================================================
// UTILIDADES (MONEDA Y NÚMERO A LETRAS)
// ============================================================================

function getQuoteItemValues(item) {
  const listPrice = Number(item.listPrice !== undefined ? item.listPrice : item.price) || 0;
  const discountPercent = Number(item.discountPercent) || 0;
  const rawUnitPrice = item.unitPrice !== undefined ? item.unitPrice :
    item.price !== undefined ? item.price : listPrice * (1 - discountPercent / 100);
  const unitPrice = Number(rawUnitPrice) || 0;
  const quantity = Number(item.quantity !== undefined ? item.quantity : item.totalMeasured) || 0;

  let unit = item.unit || item.unitLabel || '';
  if (!unit) {
    unit = (item.width && item.height) ? `${quantity} m²` : `${quantity}`;
  }

  return {
    concept: item.concept || item.productName || '',
    characteristic: item.characteristic || item.dimensionDetails || '',
    width: item.width || '',
    height: item.height || '',
    quantity,
    unit: unit,
    listPrice,
    discountPercent,
    unitPrice,
    subtotal: Number(item.subtotal !== undefined ? item.subtotal : quantity * unitPrice) || 0,
    comments: item.comments || item.notes || ''
  };
}

function formatQuoteDate(date) {
  const parts = (date || '').split('-');
  return parts.length === 3 && parts[0].length === 4 ? `${parts[2]}-${parts[1]}-${parts[0]}` : date || '';
}

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));
}

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
