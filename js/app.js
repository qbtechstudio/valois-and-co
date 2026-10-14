/**
 * Valois & Co. - Ultra-Luxury Real Estate Core Application Engine
 * Pure Vanilla JavaScript & jQuery Implementation
 */

class ValoisRealEstateApp {
  constructor() {
    this.properties = LUXURY_PROPERTIES;
    this.agents = LUXURY_AGENTS;
    this.filteredProperties = [...this.properties];
    try {
      const saved = JSON.parse(localStorage.getItem('valois_saved_properties') || '[]');
      this.savedPropertyIds = Array.isArray(saved) ? saved.filter(id => this.properties.some(property => property.id === id)) : [];
    } catch (_) {
      this.savedPropertyIds = [];
    }
    this.currentCurrency = 'USD';
    this.currentRates = { USD: 1.0, EUR: 0.92, GBP: 0.79, AED: 3.67 };
    this.currencySymbols = { USD: '$', EUR: '€', GBP: '£', AED: 'AED ' };
    try {
      const savedCurrency = localStorage.getItem('valois_currency');
      if (Object.prototype.hasOwnProperty.call(this.currentRates, savedCurrency)) this.currentCurrency = savedCurrency;
    } catch (_) { /* Keep USD when browser storage is disabled. */ }
    this.activeView = 'grid'; // 'grid' | 'list'
    this.currentModalProperty = null;

    this.init();
  }

  init() {
    this.renderFeaturedProperties();
    this.renderProperties();
    this.renderAgents();
    this.updateSavedBadge();
    this.bindEvents();
    this.initScrollEffects();
    this.initThemeToggle();
    this.initCurrencySelector();
    this.checkPreloadedAdvisor();
    this.checkUrlHash();
    this.initScrollReveal();
    this.initStatCounters();
    this.initInteractiveTilt();
    this.applyInitialUrlFilters();
  }

  applyInitialUrlFilters() {
    if (!$('#filter-category').length) return;
    const params = new URLSearchParams(window.location.search);
    const category = params.get('type');
    const location = params.get('location');
    const status = params.get('status');
    const maxPrice = Number(params.get('maxPrice'));
    const exclusive = params.get('exclusive') === '1';
    if (category) $('#filter-category').val(category);
    if (location) $('#filter-location').val(location);
    if (status) $('#filter-status').val(status);
    if (Number.isFinite(maxPrice) && maxPrice >= 15000000 && maxPrice <= 60000000) {
      $('#filter-price-range').val(maxPrice);
      $('#filter-price-display').text(this.formatPrice(maxPrice));
    }
    this.exclusiveOnly = exclusive;
    if (category || location || status || maxPrice || exclusive) this.applyFilters();
  }

  checkPreloadedAdvisor() {
    const preAdvisor = this.readSessionValue('valois_contact_advisor');
    if (preAdvisor && $('#contact-preferred-advisor').length) {
      this.removeSessionValue('valois_contact_advisor');
      $('#contact-preferred-advisor').val(preAdvisor);
    }
  }

  // Currency Converter Formatter
  formatPrice(amountUsd, isMonthly = false) {
    if (!amountUsd) return 'Price Upon Request';
    const rate = this.currentRates[this.currentCurrency] || 1;
    const symbol = this.currencySymbols[this.currentCurrency] || '$';
    const converted = amountUsd * rate;

    let formatted = '';
    if (converted >= 1000000) {
      formatted = `${symbol}${(converted / 1000000).toFixed(2)}M`;
    } else {
      formatted = `${symbol}${Math.round(converted).toLocaleString()}`;
    }

    if (isMonthly) {
      formatted += ' / mo';
    }
    return formatted;
  }

  // --- RENDER FEATURED PROPERTIES CAROUSEL / SHOWCASE ---
  renderFeaturedProperties() {
    const container = $('#featured-properties-container');
    if (!container.length) return;

    const featured = this.properties.filter(p => p.isFeatured);
    let html = '';

    featured.forEach(prop => {
      const isSaved = this.savedPropertyIds.includes(prop.id);
      html += `
        <div class="featured-card" data-aos="fade-up">
          <div class="card-media">
            <img src="${prop.heroImage}" alt="${prop.title}" loading="lazy">
            <div class="media-overlay"></div>
            <div class="card-badges">
              <span class="badge badge-gold">${prop.badge}</span>
              <span class="badge badge-dark">${prop.type}</span>
            </div>
            <button class="btn-save-favorite ${isSaved ? 'active' : ''}" 
                    data-id="${prop.id}" 
                    title="${isSaved ? 'Remove from Private Collection' : 'Save to Private Collection'}"
                    onclick="event.stopPropagation(); window.app.toggleSaveProperty('${prop.id}')">
              <i class="fa-${isSaved ? 'solid' : 'regular'} fa-bookmark"></i>
            </button>
            <div class="quick-meta-bar">
              <span><i class="fa-solid fa-bed"></i> ${prop.bedrooms} Beds</span>
              <span><i class="fa-solid fa-bath"></i> ${prop.bathrooms} Baths</span>
              <span><i class="fa-solid fa-ruler-combined"></i> ${prop.sqft.toLocaleString()} Sq.Ft</span>
            </div>
          </div>
          <div class="card-content">
            <div class="card-header-row">
              <span class="prop-location"><i class="fa-solid fa-location-dot"></i> ${prop.location}</span>
              <div class="prop-price">${this.formatPrice(prop.price)}</div>
            </div>
            <h3 class="prop-title" onclick="window.app.openPropertyModal('${prop.id}')">${prop.title}</h3>
            <p class="prop-tagline">${prop.tagline}</p>
            <div class="card-actions">
              <button class="btn-luxury-outline" onclick="window.app.openPropertyModal('${prop.id}')">
                Inspect Residence <i class="fa-solid fa-arrow-right"></i>
              </button>
              <button class="btn-icon-map" title="View on Map" onclick="window.app.locateOnMap('${prop.id}')">
                <i class="fa-solid fa-compass"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    });

    container.html(html);
    this.refreshScrollReveal();
  }

  // --- RENDER MAIN PROPERTY LISTINGS ---
  renderProperties() {
    const grid = $('#properties-grid');
    const countDisplay = $('#results-count');
    if (!grid.length) return;

    if (countDisplay.length) {
      countDisplay.text(`Presenting ${this.filteredProperties.length} of ${this.properties.length} Sanctuaries`);
    }

    if (this.filteredProperties.length === 0) {
      grid.html(`
        <div class="no-results" data-aos="fade-in">
          <div class="no-results-icon"><i class="fa-solid fa-compass"></i></div>
          <h3>No Residences Match Your Precise Specifications</h3>
          <p>Consider expanding your price threshold, choosing another architectural classification, or resetting your filter criteria.</p>
          <button class="btn-luxury-gold" onclick="window.app.resetFilters()">
            Reset All Filters
          </button>
        </div>
      `);
      return;
    }

    let html = '';
    this.filteredProperties.forEach((prop, idx) => {
      const isSaved = this.savedPropertyIds.includes(prop.id);
      const isList = this.activeView === 'list';

      html += `
        <div class="property-card ${isList ? 'card-list-view' : ''}" data-aos="fade-up" data-aos-delay="${(idx % 3) * 100}">
          <div class="card-media">
            <img src="${prop.heroImage}" alt="${prop.title}" loading="lazy">
            <div class="card-badges">
              <span class="badge badge-gold">${prop.badge}</span>
              <span class="badge badge-dark">${prop.status}</span>
            </div>
            <button class="btn-save-favorite ${isSaved ? 'active' : ''}" 
                    data-id="${prop.id}" 
                    title="${isSaved ? 'Remove from Private Collection' : 'Save to Private Collection'}"
                    onclick="event.stopPropagation(); window.app.toggleSaveProperty('${prop.id}')">
              <i class="fa-${isSaved ? 'solid' : 'regular'} fa-bookmark"></i>
            </button>
            <div class="media-hover-overlay">
              <button class="btn-quick-preview" onclick="window.app.openPropertyModal('${prop.id}')">
                <i class="fa-solid fa-eye"></i> Quick View
              </button>
            </div>
          </div>
          <div class="card-content">
            <div class="card-header-row">
              <span class="prop-location"><i class="fa-solid fa-location-dot"></i> ${prop.location}</span>
              <div class="prop-price">${this.formatPrice(prop.price)}</div>
            </div>
            <h3 class="prop-title" onclick="window.app.openPropertyModal('${prop.id}')">${prop.title}</h3>
            <p class="prop-tagline">${prop.tagline}</p>
            
            <div class="prop-specs-row">
              <div class="spec-item"><i class="fa-solid fa-bed"></i> <strong>${prop.bedrooms}</strong> Beds</div>
              <div class="spec-item"><i class="fa-solid fa-bath"></i> <strong>${prop.bathrooms}</strong> Baths</div>
              <div class="spec-item"><i class="fa-solid fa-ruler-combined"></i> <strong>${prop.sqft.toLocaleString()}</strong> Sq.Ft</div>
              <div class="spec-item"><i class="fa-solid fa-warehouse"></i> <strong>${prop.garage}</strong> Garage</div>
            </div>

            <div class="card-footer-row">
              <div class="prop-advisor">
                <span>Represented by <strong>${this.getAgentName(prop.agentId)}</strong></span>
              </div>
              <div class="footer-actions">
                <button class="btn-calc-link" title="Calculate Mortgage" onclick="window.app.openCalculatorWithProperty('${prop.id}')">
                  <i class="fa-solid fa-calculator"></i>
                </button>
                <button class="btn-inspect-link" onclick="window.app.openPropertyModal('${prop.id}')">
                  Explore <i class="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    grid.html(html);
    this.refreshScrollReveal();

    // Synchronize with interactive map
    if (window.luxuryMap) {
      window.luxuryMap.renderMarkers(this.filteredProperties);
    }
  }

  // --- RENDER AGENTS DIRECTORY ---
  renderAgents() {
    const container = $('#agents-container');
    if (!container.length) return;

    let html = '';
    this.agents.forEach((agent, idx) => {
      html += `
        <div class="agent-card" data-aos="fade-up" data-aos-delay="${idx * 120}">
          <div class="agent-media">
            <img src="${agent.photo}" alt="${agent.name}">
            <div class="agent-overlay"></div>
            <span class="agent-badge">${agent.office}</span>
          </div>
          <div class="agent-details">
            <h3 class="agent-name">${agent.name}</h3>
            <div class="agent-title">${agent.title}</div>
            <p class="agent-role">${agent.role}</p>
            
            <div class="agent-metrics">
              <div class="metric-box">
                <span class="metric-val">${agent.volume}</span>
                <span class="metric-lbl">Total Career</span>
              </div>
              <div class="metric-box">
                <span class="metric-val">${agent.listingsCount} Mansions</span>
                <span class="metric-lbl">Active Portfolio</span>
              </div>
            </div>

            <p class="agent-bio">${agent.bio}</p>

            <div class="agent-tags">
              ${agent.specialties.map(s => `<span class="agent-tag">${s}</span>`).join('')}
            </div>

            <div class="agent-contact-actions">
              <a href="tel:${agent.phone}" class="btn-agent-action" title="Call Advisor">
                <i class="fa-solid fa-phone"></i>
              </a>
              <a href="mailto:${agent.email}" class="btn-agent-action" title="Send Email">
                <i class="fa-solid fa-envelope"></i>
              </a>
              <button class="btn-agent-inquire" onclick="window.app.openDirectAgentInquiry('${agent.id}')">
                Request Private Consultation
              </button>
            </div>
          </div>
        </div>
      `;
    });

    container.html(html);
  }

  // --- SEARCH & FILTER ENGINE ---
  applyFilters() {
    const keyword = $('#filter-keyword').val()?.toLowerCase().trim() || '';
    const category = $('#filter-category').val() || 'all';
    const location = $('#filter-location').val() || 'all';
    const status = $('#filter-status').val() || 'all';
    const exclusiveOnly = this.exclusiveOnly === true;
    const minBeds = parseInt($('#filter-beds').val(), 10) || 0;
    const minBaths = parseInt($('#filter-baths').val(), 10) || 0;
    const maxPrice = parseFloat($('#filter-price-range').val()) || 100000000;
    const sortBy = $('#filter-sort').val() || 'featured';

    // Selected amenities
    const selectedAmenities = [];
    $('.filter-amenity-checkbox:checked').each(function() {
      selectedAmenities.push($(this).val());
    });

    this.filteredProperties = this.properties.filter(prop => {
      if (exclusiveOnly && !prop.isExclusive) return false;
      // Keyword match
      if (keyword) {
        const matchTitle = prop.title.toLowerCase().includes(keyword);
        const matchLoc = prop.location.toLowerCase().includes(keyword);
        const matchDesc = prop.description.toLowerCase().includes(keyword);
        if (!matchTitle && !matchLoc && !matchDesc) return false;
      }

      // Category / Type match
      if (category !== 'all' && prop.category !== category) return false;

      // Location / City match
      if (location !== 'all' && prop.city !== location) return false;

      // Status match (For Sale / For Rent)
      if (status !== 'all' && prop.status !== status) return false;

      // Bedrooms & Bathrooms
      if (prop.bedrooms < minBeds) return false;
      if (prop.bathrooms < minBaths) return false;

      // Max Price
      if (prop.price > maxPrice) return false;

      // Amenities filter
      if (selectedAmenities.length > 0) {
        const hasAll = selectedAmenities.every(amenity => 
          prop.amenities.some(a => a.toLowerCase().includes(amenity.toLowerCase()))
        );
        if (!hasAll) return false;
      }

      return true;
    });

    // Sorting
    this.sortFilteredProperties(sortBy);
    this.renderProperties();
  }

  sortFilteredProperties(sortBy) {
    switch (sortBy) {
      case 'price-asc':
        this.filteredProperties.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        this.filteredProperties.sort((a, b) => b.price - a.price);
        break;
      case 'sqft-desc':
        this.filteredProperties.sort((a, b) => b.sqft - a.sqft);
        break;
      case 'beds-desc':
        this.filteredProperties.sort((a, b) => b.bedrooms - a.bedrooms);
        break;
      case 'featured':
      default:
        this.filteredProperties.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }
  }

  resetFilters() {
    $('#filter-keyword').val('');
    $('#filter-category').val('all');
    $('#filter-location').val('all');
    $('#filter-status').val('all');
    $('#filter-beds').val('0');
    $('#filter-baths').val('0');
    $('#filter-price-range').val('60000000');
    $('#filter-price-display').text(this.formatPrice(60000000));
    $('.filter-amenity-checkbox').prop('checked', false);
    $('#filter-sort').val('featured');
    this.exclusiveOnly = false;
    if (window.history && window.history.replaceState) {
      try { window.history.replaceState(null, '', window.location.pathname); } catch (_) { /* Filters still reset for file:// previews. */ }
    }

    this.filteredProperties = [...this.properties];
    this.renderProperties();
    this.showToast('Filters Reset', 'All luxury criteria returned to full global portfolio.');
  }

  // --- SAVE / FAVORITES / PRIVATE COLLECTION ---
  toggleSaveProperty(propId) {
    const index = this.savedPropertyIds.indexOf(propId);
    let message = '';

    if (index > -1) {
      this.savedPropertyIds.splice(index, 1);
      message = 'Residence removed from your Private Collection.';
    } else {
      this.savedPropertyIds.push(propId);
      message = 'Residence preserved in your Private Collection.';
    }

    try {
      localStorage.setItem('valois_saved_properties', JSON.stringify(this.savedPropertyIds));
    } catch (_) {
      this.showToast('Collection Updated', 'This browser session cannot save changes after you close the page.');
    }
    this.updateSavedBadge();
    this.renderProperties();
    this.renderFeaturedProperties();
    this.renderSavedDrawer();
    this.showToast('Private Collection', message);
  }

  updateSavedBadge() {
    const badge = $('.saved-count-badge');
    const count = this.savedPropertyIds.length;
    badge.text(count);
    if (count > 0) {
      badge.addClass('pulse');
    } else {
      badge.removeClass('pulse');
    }
  }

  renderSavedDrawer() {
    const container = $('#saved-drawer-items');
    if (!container.length) return;

    if (this.savedPropertyIds.length === 0) {
      container.html(`
        <div class="empty-drawer">
          <i class="fa-regular fa-bookmark"></i>
          <p>Your Private Collection is presently unoccupied.</p>
          <span>Tap the bookmark icon on any residence to curate your private portfolio.</span>
        </div>
      `);
      return;
    }

    let html = '';
    this.savedPropertyIds.forEach(id => {
      const prop = this.properties.find(p => p.id === id);
      if (!prop) return;

      html += `
        <div class="saved-item-row">
          <img src="${prop.heroImage}" alt="${prop.title}">
          <div class="saved-item-info">
            <h4>${prop.title}</h4>
            <div class="saved-item-price">${this.formatPrice(prop.price)}</div>
            <div class="saved-item-specs">${prop.bedrooms} Bed | ${prop.bathrooms} Bath | ${prop.sqft.toLocaleString()} sf</div>
          </div>
          <div class="saved-item-actions">
            <button class="btn-saved-view" onclick="window.app.openPropertyModal('${prop.id}')" title="Inspect">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </button>
            <button class="btn-saved-delete" onclick="window.app.toggleSaveProperty('${prop.id}')" title="Remove">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
    });

    container.html(html);
  }

  openSavedDrawer() {
    this.renderSavedDrawer();
    $('#saved-collection-drawer').addClass('active');
    $('body').addClass('modal-open');
  }

  closeSavedDrawer() {
    $('#saved-collection-drawer').removeClass('active');
    $('body').removeClass('modal-open');
  }

  // --- PROPERTY DETAIL MODAL & LIGHTBOX ---
  openPropertyModal(propertyId) {
    const prop = this.properties.find(p => p.id === propertyId);
    if (!prop) return;

    this.currentModalProperty = prop;
    window.location.hash = `#residence-${prop.id}`;

    const modal = $('#property-detail-modal');
    const content = $('#property-modal-body');
    const agent = this.agents.find(a => a.id === prop.agentId) || this.agents[0];
    const isSaved = this.savedPropertyIds.includes(prop.id);

    // Gallery Thumbnails
    const thumbsHtml = prop.gallery.map((img, i) => `
      <div class="gallery-thumb ${i === 0 ? 'active' : ''}" onclick="window.app.switchModalImage('${img}', this)">
        <img src="${img}" alt="${prop.title} View ${i + 1}">
      </div>
    `).join('');

    // Amenities List
    const amenitiesHtml = prop.amenities.map(a => `
      <div class="modal-amenity-item">
        <i class="fa-solid fa-check"></i>
        <span>${a}</span>
      </div>
    `).join('');

    // Floor Plans
    const floorPlansHtml = prop.floorPlans.map((fp, i) => `
      <div class="floorplan-tab ${i === 0 ? 'active' : ''}" onclick="window.app.switchFloorPlan('${fp.image}', '${fp.name} - ${fp.area}', this)">
        ${fp.name} <span>(${fp.area})</span>
      </div>
    `).join('');

    const modalBodyHtml = `
      <div class="modal-luxury-header">
        <div class="modal-header-left">
          <div class="modal-badge-group">
            <span class="badge badge-gold">${prop.badge}</span>
            <span class="badge badge-dark">${prop.type}</span>
            <span class="badge badge-dark">${prop.status}</span>
          </div>
          <h2 class="modal-prop-title">${prop.title}</h2>
          <p class="modal-prop-address"><i class="fa-solid fa-location-dot"></i> ${prop.address}</p>
        </div>
        <div class="modal-header-right">
          <div class="modal-prop-price">${this.formatPrice(prop.price)}</div>
          <div class="modal-header-buttons">
            <button class="btn-save-favorite ${isSaved ? 'active' : ''}" onclick="window.app.toggleSaveProperty('${prop.id}')">
              <i class="fa-${isSaved ? 'solid' : 'regular'} fa-bookmark"></i> 
              <span>${isSaved ? 'Saved to Collection' : 'Save Sanctuary'}</span>
            </button>
            <button class="btn-share-residence" onclick="window.app.shareResidence('${prop.title}')">
              <i class="fa-solid fa-share-nodes"></i> Share
            </button>
          </div>
        </div>
      </div>

      <!-- Main Photo Showcase -->
      <div class="modal-gallery-showcase">
        <div class="gallery-main-view">
          <img id="modal-main-gallery-img" src="${prop.gallery[0]}" alt="${prop.title}">
          <button class="btn-fullscreen-lightbox" onclick="window.app.openFullscreenGallery('${prop.id}')" title="High-Res Lightbox">
            <i class="fa-solid fa-expand"></i> View All Photos
          </button>
        </div>
        <div class="gallery-thumbnails-strip">
          ${thumbsHtml}
        </div>
      </div>

      <!-- Quick Metrics Ribbon -->
      <div class="modal-metrics-strip">
        <div class="metric-col">
          <span class="metric-num">${prop.bedrooms}</span>
          <span class="metric-name">Bedrooms</span>
        </div>
        <div class="metric-col">
          <span class="metric-num">${prop.bathrooms}</span>
          <span class="metric-name">Bathrooms</span>
        </div>
        <div class="metric-col">
          <span class="metric-num">${prop.sqft.toLocaleString()}</span>
          <span class="metric-name">Living Sq.Ft</span>
        </div>
        <div class="metric-col">
          <span class="metric-num">${prop.lotSize}</span>
          <span class="metric-name">Lot Scale</span>
        </div>
        <div class="metric-col">
          <span class="metric-num">${prop.yearBuilt}</span>
          <span class="metric-name">Year Completed</span>
        </div>
        <div class="metric-col">
          <span class="metric-num">${prop.garage} Cars</span>
          <span class="metric-name">Gallery Garage</span>
        </div>
      </div>

      <!-- Two-Column Layout -->
      <div class="modal-grid-body">
        <div class="modal-main-content">
          <!-- Architectural Narrative -->
          <div class="modal-section">
            <h3 class="modal-section-title">Architectural Narrative</h3>
            <p class="modal-narrative-text">${prop.description}</p>
          </div>

          <!-- Bespoke Amenities -->
          <div class="modal-section">
            <h3 class="modal-section-title">Bespoke Specifications & Amenities</h3>
            <div class="modal-amenities-grid">
              ${amenitiesHtml}
            </div>
          </div>

          <!-- Architectural Floor Plans -->
          <div class="modal-section">
            <h3 class="modal-section-title">Architectural Floor Plans</h3>
            <div class="floorplan-tabs-row">
              ${floorPlansHtml}
            </div>
            <div class="floorplan-viewer">
              <img id="modal-floorplan-img" src="${prop.floorPlans[0].image}" alt="Floor Plan">
              <div id="floorplan-caption" class="floorplan-caption">${prop.floorPlans[0].name} - ${prop.floorPlans[0].area}</div>
            </div>
          </div>

          <!-- 3D Virtual Tour & Neighborhood -->
          <div class="modal-section">
            <h3 class="modal-section-title">Interactive Virtual 3D Walkthrough</h3>
            <div class="virtual-tour-container">
              <div class="virtual-tour-placeholder" style="background-image: url('${prop.gallery[1] || prop.heroImage}')">
                <div class="tour-glass-overlay">
                  <div class="tour-icon"><i class="fa-solid fa-cube"></i></div>
                  <h4>Explore 360° Digital Twin</h4>
                  <p>Step through this architectural sanctuary with 4K spatial resolution and photorealistic photogrammetry.</p>
                  <button class="btn-start-tour" onclick="window.app.startVirtualTourSimulation()">
                    <i class="fa-solid fa-play"></i> Launch Virtual Walkthrough
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Location & Private Proximity -->
          <div class="modal-section">
            <h3 class="modal-section-title">Neighborhood & Sovereign Proximity</h3>
            <div class="proximity-cards-grid">
              <div class="prox-card">
                <i class="fa-solid fa-utensils"></i>
                <div class="prox-info">
                  <span class="prox-lbl">Michelin Dining</span>
                  <strong>${prop.walkscore.dining}</strong>
                </div>
              </div>
              <div class="prox-card">
                <i class="fa-solid fa-plane-departure"></i>
                <div class="prox-info">
                  <span class="prox-lbl">Private Aviation & Transit</span>
                  <strong>${prop.walkscore.transit}</strong>
                </div>
              </div>
              <div class="prox-card">
                <i class="fa-solid fa-water"></i>
                <div class="prox-info">
                  <span class="prox-lbl">Coastal & Yacht Anchorage</span>
                  <strong>${prop.walkscore.beach}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar: Advisor & VIP Viewing Scheduler -->
        <div class="modal-sidebar">
          <div class="advisor-card-sticky">
            <div class="advisor-card-top">
              <img src="${agent.photo}" alt="${agent.name}">
              <div>
                <span class="advisor-label">Primary Listing Director</span>
                <h4 class="advisor-name">${agent.name}</h4>
                <p class="advisor-role">${agent.title}</p>
              </div>
            </div>

            <div class="advisor-contact-bar">
              <a href="tel:${agent.phone}" class="advisor-btn-call"><i class="fa-solid fa-phone"></i> Call Direct</a>
              <a href="mailto:${agent.email}?subject=Inquiry: ${encodeURIComponent(prop.title)}" class="advisor-btn-mail"><i class="fa-solid fa-envelope"></i> Email</a>
            </div>

            <div class="modal-booking-form">
              <h4>Schedule VIP Private Viewing</h4>
              <p>Confidential in-person tours or encrypted 4K live video walk-throughs.</p>

              <form id="modal-vip-tour-form" onsubmit="window.app.handleTourSubmit(event, '${prop.id}')">
                <div class="form-group">
                  <label for="tour-name">Full Legal Name</label>
                  <input type="text" id="tour-name" required placeholder="Lord, Lady, Dr., Mr., Ms.">
                </div>
                <div class="form-group">
                  <label for="tour-email">Confidential Email</label>
                  <input type="email" id="tour-email" required placeholder="client@familyoffice.com">
                </div>
                <div class="form-group">
                  <label for="tour-phone">Direct Telephone</label>
                  <input type="tel" id="tour-phone" required placeholder="+1 (555) 000-0000">
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label for="tour-date">Preferred Date</label>
                    <input type="date" id="tour-date" required>
                  </div>
                  <div class="form-group">
                    <label for="tour-type">Tour Modality</label>
                    <select id="tour-type">
                      <option value="in-person">Private In-Person</option>
                      <option value="video">Encrypted Live Video</option>
                      <option value="rep">Representative / Office</option>
                    </select>
                  </div>
                </div>
                <button type="submit" class="btn-submit-booking">
                  Reserve Private Viewing
                </button>
              </form>
            </div>

            <div class="calculator-jump-box">
              <i class="fa-solid fa-coins"></i>
              <div>
                <span>Financing Consultation</span>
                <button onclick="window.app.openCalculatorWithProperty('${prop.id}')">
                  Calculate Monthly Investment <i class="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    content.html(modalBodyHtml);
    modal.addClass('active');
    $('body').addClass('modal-open');

    // Default tomorrow's date for tour
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateInput = document.getElementById('tour-date');
    if (dateInput) {
      dateInput.value = tomorrow.toISOString().split('T')[0];
    }
  }

  closePropertyModal() {
    $('#property-detail-modal').removeClass('active');
    $('body').removeClass('modal-open');
    if (window.location.hash.startsWith('#residence-')) {
      history.pushState("", document.title, window.location.pathname + window.location.search);
    }
    this.currentModalProperty = null;
  }

  switchModalImage(src, element) {
    $('#modal-main-gallery-img').attr('src', src);
    $('.gallery-thumb').removeClass('active');
    $(element).addClass('active');
  }

  switchFloorPlan(src, caption, element) {
    $('#modal-floorplan-img').attr('src', src);
    $('#floorplan-caption').text(caption);
    $('.floorplan-tab').removeClass('active');
    $(element).addClass('active');
  }

  startVirtualTourSimulation() {
    this.showToast('Virtual Tour Initialized', 'Launching encrypted 4K 360° digital twin spatial stream...');
  }

  async shareResidence(title) {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} | Valois & Co. Luxury Real Estate`,
          url: window.location.href
        });
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        this.showToast('Link Copied', 'Residence link copied to clipboard.');
        return;
      } catch (_) { /* Continue to the manual copy fallback. */ }
    }
    window.prompt('Copy this residence link:', window.location.href);
  }

  // --- FULLSCREEN HIGH-RES LIGHTBOX ---
  openFullscreenGallery(propertyId) {
    const prop = this.properties.find(p => p.id === propertyId) || this.currentModalProperty;
    if (!prop || !prop.gallery || prop.gallery.length === 0) return;

    let currentIndex = 0;

    let lightbox = $('#luxury-lightbox-modal');
    if (!lightbox.length) {
      $('body').append(`
        <div id="luxury-lightbox-modal" class="luxury-lightbox-overlay">
          <button class="lightbox-close-btn" aria-label="Close Lightbox"><i class="fa-solid fa-xmark"></i></button>
          <button class="lightbox-nav-btn prev" aria-label="Previous Photo"><i class="fa-solid fa-chevron-left"></i></button>
          <div class="lightbox-img-wrapper">
            <img id="lightbox-active-img" src="" alt="Gallery Image">
            <div id="lightbox-caption" class="lightbox-caption"></div>
          </div>
          <button class="lightbox-nav-btn next" aria-label="Next Photo"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
      `);
      lightbox = $('#luxury-lightbox-modal');

      lightbox.find('.lightbox-close-btn').on('click', () => lightbox.removeClass('active'));
      lightbox.on('click', (e) => {
        if ($(e.target).hasClass('luxury-lightbox-overlay')) {
          lightbox.removeClass('active');
        }
      });
    }

    const updateLightbox = (idx) => {
      currentIndex = (idx + prop.gallery.length) % prop.gallery.length;
      $('#lightbox-active-img').attr('src', prop.gallery[currentIndex]);
      $('#lightbox-caption').html(`
        <strong>${prop.title}</strong> — Photograph ${currentIndex + 1} of ${prop.gallery.length}
      `);
    };

    lightbox.find('.lightbox-nav-btn.prev').off('click').on('click', () => updateLightbox(currentIndex - 1));
    lightbox.find('.lightbox-nav-btn.next').off('click').on('click', () => updateLightbox(currentIndex + 1));

    updateLightbox(0);
    lightbox.addClass('active');
  }

  // --- MORTGAGE CALCULATOR BRIDGE ---
  openCalculatorWithProperty(propertyId) {
    const prop = this.properties.find(p => p.id === propertyId);
    if (!prop) return;

    if (this.currentModalProperty) {
      this.closePropertyModal();
    }

    const calcSection = document.getElementById('mortgage-calculator-section');
    if (calcSection) {
      calcSection.scrollIntoView({ behavior: 'smooth' });
      document.dispatchEvent(new CustomEvent('loadPropertyToCalculator', {
        detail: { price: prop.price, title: prop.title }
      }));
      this.showToast('Calculator Configured', `Loaded ${prop.title} (${this.formatPrice(prop.price)}) into financing engine.`);
    } else {
      this.writeSessionValue('valois_calc_preload_price', prop.price);
      this.writeSessionValue('valois_calc_preload_title', prop.title);
      window.location.href = 'calculator.html';
    }
  }

  // --- MAP LOCATOR BRIDGE ---
  locateOnMap(propertyId) {
    const mapSection = document.getElementById('map-discovery-section');
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: 'smooth' });
      if (window.luxuryMap) {
        window.luxuryMap.focusProperty(propertyId);
      }
    } else {
      this.writeSessionValue('valois_map_focus_prop', propertyId);
      window.location.href = 'contact.html';
    }
  }

  // --- DIRECT AGENT INQUIRY MODAL ---
  openDirectAgentInquiry(agentId) {
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) return;

    const advisorSelect = document.getElementById('contact-preferred-advisor');
    const contactSection = document.getElementById('contact-vip-section');
    if (advisorSelect && contactSection) {
      $('#contact-preferred-advisor').val(agent.id);
      contactSection.scrollIntoView({ behavior: 'smooth' });
      this.showToast('Advisor Selected', `Direct channel opened with ${agent.name}.`);
    } else {
      this.writeSessionValue('valois_contact_advisor', agent.id);
      window.location.href = 'contact.html';
    }
  }

  // --- FORM HANDLERS ---
  handleTourSubmit(e, propertyId) {
    e.preventDefault();
    const prop = this.properties.find(p => p.id === propertyId);
    if (!prop) return;
    const advisor = this.agents.find(agent => agent.id === prop.agentId) || this.agents[0];
    const subject = `Private viewing request: ${prop.title}`;
    const body = [
      `Name: ${$('#tour-name').val()}`,
      `Email: ${$('#tour-email').val()}`,
      `Phone: ${$('#tour-phone').val()}`,
      `Preferred date: ${$('#tour-date').val()}`,
      `Tour type: ${$('#tour-type').val()}`,
      `Residence: ${prop.title}`
    ].join('\n');
    this.showToast('Email Draft Ready', 'Your email application will open with the viewing request addressed to the listing advisor.');
    window.location.href = `mailto:${advisor.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  handleMainContactSubmit(e) {
    e.preventDefault();
    const advisorId = $('#contact-preferred-advisor').val();
    const advisor = this.agents.find(agent => agent.id === advisorId) || this.agents[0];
    const fields = [
      ['Name', $('#contact-name').val()],
      ['Email', $('#contact-email').val()],
      ['Phone', $('#contact-phone').val()],
      ['Preferred advisor', advisor.name],
      ['Capital allocation', $('#contact-budget').val()],
      ['Communication channel', $('#contact-modality').val()],
      ['Preferences', $('#contact-message').val() || 'Not provided']
    ];
    const subject = `Private real estate inquiry from ${$('#contact-name').val()}`;
    const body = fields.map(([label, value]) => `${label}: ${value}`).join('\n');
    this.showToast('Email Draft Ready', 'Your email application will open with the inquiry addressed to the selected advisor.');
    window.location.href = `mailto:${advisor.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  handleNewsletterSubmit(e) {
    e.preventDefault();
    const input = e.currentTarget.querySelector('input[type="email"]');
    if (!input || !input.value) return;
    const email = this.agents[0]?.email;
    if (!email) return;
    const subject = 'Valois Quarterly Intelligence Briefing';
    const body = `Please add ${input.value} to the Valois Quarterly Intelligence Briefing.`;
    this.showToast('Email Draft Ready', 'Your email application will open with the briefing request. Send the draft to complete your request.');
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  // --- TOAST NOTIFICATIONS ---
  showToast(title, message) {
    const toast = $('#luxury-toast');
    if (!toast.length) return;

    toast.find('.toast-title').text(title);
    toast.find('.toast-message').text(message);
    let progress = toast.find('.toast-progress-line');
    if (!progress.length) {
      progress = $('<span class="toast-progress-line" aria-hidden="true"></span>').appendTo(toast);
    }
    progress.css('animation', 'none');
    if (progress[0]) void progress[0].offsetWidth;
    progress.css('animation', '');
    toast.addClass('show');

    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.removeClass('show');
    }, 4500);
  }

  // --- CURRENCY SELECTOR ---
  initCurrencySelector() {
    const selector = $('#currency-selector');
    if (!selector.length) return;
    selector.val(this.currentCurrency);

    selector.on('change', (e) => {
      this.currentCurrency = e.target.value;
      try { localStorage.setItem('valois_currency', this.currentCurrency); } catch (_) { /* Conversion still works for this page. */ }
      document.dispatchEvent(new CustomEvent('valoisCurrencyChange', {
        detail: {
          currency: this.currentCurrency,
          rate: this.currentRates[this.currentCurrency] || 1,
          symbol: this.currencySymbols[this.currentCurrency] || '$'
        }
      }));
      this.renderProperties();
      this.renderFeaturedProperties();
      this.renderSavedDrawer();
      $('#filter-price-display').text(this.formatPrice(parseFloat($('#filter-price-range').val()) || 60000000));
      if (this.currentModalProperty) {
        this.openPropertyModal(this.currentModalProperty.id);
      }
      this.showToast('Currency Recomputed', `All real estate values converted to ${this.currentCurrency}.`);
    });

    if (this.currentCurrency !== 'USD') {
      document.dispatchEvent(new CustomEvent('valoisCurrencyChange', {
        detail: {
          currency: this.currentCurrency,
          rate: this.currentRates[this.currentCurrency],
          symbol: this.currencySymbols[this.currentCurrency]
        }
      }));
      this.renderProperties();
      this.renderFeaturedProperties();
      $('#filter-price-display').text(this.formatPrice(parseFloat($('#filter-price-range').val()) || 60000000));
    }
  }

  // --- UTILS & EVENT BINDINGS ---
  getAgentName(agentId) {
    const a = this.agents.find(item => item.id === agentId);
    return a ? a.name : 'Valois Executive Partner';
  }

  readSessionValue(key) {
    try { return window.sessionStorage.getItem(key); } catch (_) { return null; }
  }

  writeSessionValue(key, value) {
    try { window.sessionStorage.setItem(key, value); } catch (_) { /* Continue without cross-page prefill. */ }
  }

  removeSessionValue(key) {
    try { window.sessionStorage.removeItem(key); } catch (_) { /* Storage is optional. */ }
  }

  checkUrlHash() {
    const hash = window.location.hash;
    if (hash.startsWith('#residence-')) {
      const id = hash.replace('#residence-', '');
      this.openPropertyModal(id);
    }
  }

  bindEvents() {
    const self = this;

    // Search input live typing with debounce
    let searchDebounce;
    $('#filter-keyword').on('input', function() {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => self.applyFilters(), 250);
    });

    // Dropdowns & Sliders
    $('#filter-category, #filter-location, #filter-status, #filter-beds, #filter-baths, #filter-sort')
      .on('change', () => this.applyFilters());

    // Price range slider
    $('#filter-price-range').on('input', function() {
      const val = parseFloat($(this).val());
      $('#filter-price-display').text(self.formatPrice(val));
      self.applyFilters();
    });

    // Amenities Checkboxes
    $('.filter-amenity-checkbox').on('change', () => this.applyFilters());

    // Grid vs List view toggle
    $('#btn-view-grid').on('click', function() {
      $('.view-toggle-btn').removeClass('active');
      $(this).addClass('active');
      self.activeView = 'grid';
      self.renderProperties();
    });

    $('#btn-view-list').on('click', function() {
      $('.view-toggle-btn').removeClass('active');
      $(this).addClass('active');
      self.activeView = 'list';
      self.renderProperties();
    });

    // Modal Close
    $('.modal-close-btn, .modal-backdrop-overlay').on('click', () => this.closePropertyModal());
    $(document).on('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closePropertyModal();
        this.closeSavedDrawer();
        $('#main-nav-links').removeClass('mobile-open');
        $('#mobile-nav-toggle').removeClass('open').attr('aria-expanded', 'false').attr('aria-label', 'Open Navigation Menu');
        $('#mobile-nav-toggle i').removeClass('fa-xmark').addClass('fa-bars');
        $('body').removeClass('mobile-nav-open');
      }
    });

    // Saved Drawer toggle
    $('#nav-saved-btn').on('click', () => this.openSavedDrawer());
    $('.drawer-close-btn, .drawer-overlay').on('click', () => this.closeSavedDrawer());

    // Main Contact Form
    $('#vip-contact-form').on('submit', (e) => this.handleMainContactSubmit(e));
    $('.newsletter-form').on('submit', (e) => this.handleNewsletterSubmit(e));

    // Mobile Hamburger Menu
    $('#mobile-nav-toggle').on('click', function() {
      const isOpen = !$(this).hasClass('open');
      $(this).toggleClass('open', isOpen);
      $(this).find('i').toggleClass('fa-bars', !isOpen).toggleClass('fa-xmark', isOpen);
      $(this).attr('aria-expanded', String(isOpen));
      $(this).attr('aria-label', isOpen ? 'Close Navigation Menu' : 'Open Navigation Menu');
      $('#main-nav-links').toggleClass('mobile-open', isOpen);
      $('body').toggleClass('mobile-nav-open', isOpen);
    });

    // Close the compact navigation after choosing a page or returning to desktop width.
    $('#main-nav-links').on('click', 'a', () => {
      $('#main-nav-links').removeClass('mobile-open');
      $('#mobile-nav-toggle').removeClass('open').attr('aria-expanded', 'false').attr('aria-label', 'Open Navigation Menu');
      $('#mobile-nav-toggle i').removeClass('fa-xmark').addClass('fa-bars');
      $('body').removeClass('mobile-nav-open');
    });

    $(window).on('resize', () => {
      if (window.innerWidth > 1200) {
        $('#main-nav-links').removeClass('mobile-open');
        $('#mobile-nav-toggle').removeClass('open').attr('aria-expanded', 'false').attr('aria-label', 'Open Navigation Menu');
        $('#mobile-nav-toggle i').removeClass('fa-xmark').addClass('fa-bars');
        $('body').removeClass('mobile-nav-open');
      }
    });

    // Smooth navigation click
    $('a[href^="#"]').on('click', function(e) {
      const target = $(this.getAttribute('href'));
      if (target.length) {
        e.preventDefault();
        $('#main-nav-links').removeClass('mobile-open');
        $('#mobile-nav-toggle').removeClass('open');
        $('#mobile-nav-toggle i').removeClass('fa-xmark').addClass('fa-bars');
        $('#mobile-nav-toggle').attr('aria-expanded', 'false').attr('aria-label', 'Open Navigation Menu');
        $('body').removeClass('mobile-nav-open');
        $('html, body').animate({
          scrollTop: target.offset().top - 80
        }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 600);
      }
    });

    // Quick Hero Search Bar tabs
    $('.hero-tab-btn').on('click', function() {
      $('.hero-tab-btn').removeClass('active');
      $(this).addClass('active');
      const action = $(this).data('action');
      if (action === 'rent') {
        $('#filter-status').val('For Rent');
      } else if (action === 'buy') {
        $('#filter-status').val('For Sale');
      }
    });

    $('#hero-search-btn').on('click', function(e) {
      e.preventDefault();
      const loc = $('#hero-location-select').val();
      const type = $('#hero-type-select').val();
      const params = new URLSearchParams();
      if (loc && loc !== 'all') params.set('location', loc);
      if (type && type !== 'all') params.set('type', type);
      const action = $('.hero-tab-btn.active').data('action');
      if (action === 'buy') params.set('status', 'For Sale');
      if (action === 'rent') params.set('status', 'For Rent');
      if (action === 'collection') params.set('exclusive', '1');
      const tier = $('#hero-price-tier').val();
      if (tier === 'tier-1') params.set('maxPrice', '30000000');
      if (tier === 'tier-2') params.set('maxPrice', '50000000');
      if (tier === 'tier-3') params.set('maxPrice', '60000000');
      const query = params.toString();
      window.location.href = 'properties.html' + (query ? '?' + query : '');
    });
  }

  initThemeToggle() {
    let savedTheme = 'dark';
    try { savedTheme = localStorage.getItem('valois_theme') || 'dark'; } catch (_) {}

    const applyTheme = (theme, notify = false) => {
      const isLight = theme === 'light';
      $('body').toggleClass('light-theme', isLight);
      document.documentElement.classList.toggle('theme-light', isLight);
      document.documentElement.classList.toggle('theme-dark', !isLight);
      document.documentElement.classList.remove('theme-light-pending');

      try { localStorage.setItem('valois_theme', isLight ? 'light' : 'dark'); } catch (_) {}

      const toggleBtn = $('#theme-toggle-btn');
      if (toggleBtn.length) {
        toggleBtn.html(isLight ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>');
        toggleBtn.attr('title', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode');
        toggleBtn.attr('aria-label', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode');
      }

      if (notify) {
        this.showToast(
          isLight ? 'Pearl Theme' : 'Obsidian Theme',
          isLight ? 'Light mode activated.' : 'Dark mode activated.'
        );
      }
    };

    applyTheme(savedTheme);

    $('#theme-toggle-btn').off('click.valoisTheme').on('click.valoisTheme', () => {
      const isLight = $('body').hasClass('light-theme') || document.documentElement.classList.contains('theme-light');
      applyTheme(isLight ? 'dark' : 'light', true);
    });
  }

  initScrollEffects() {
    const navbar = $('#main-header');
    const backToTop = $('#back-to-top');
    const progressBar = $('#scroll-progress-bar');

    $(window).on('scroll', function() {
      const st = $(this).scrollTop();
      const docHeight = $(document).height() - $(window).height();
      
      // Update top reading progress bar ("star bar")
      if (progressBar.length && docHeight > 0) {
        const progress = (st / docHeight) * 100;
        progressBar.css('width', `${Math.min(100, Math.max(0, progress))}%`);
      }

      if (st > 60) {
        navbar.addClass('scrolled');
      } else {
        navbar.removeClass('scrolled');
      }

      if (st > 400) {
        backToTop.addClass('visible');
      } else {
        backToTop.removeClass('visible');
      }
    });

    backToTop.on('click', function() {
      $('html, body').animate({ scrollTop: 0 }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 600);
    });
  }

  // --- SCROLL REVEAL OBSERVER ---
  initScrollReveal() {
    $('.section-head, .featured-card, .property-card, .agent-card, .testimonial-card, .value-card, .prox-card, .about-story-grid, .calc-dashboard-grid, .contact-card-wrapper, .no-results')
      .addClass('reveal-init');

    if ('IntersectionObserver' in window) {
      this.scrollObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            obs.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
      });

      document.querySelectorAll('.reveal-init, [data-aos]').forEach(el => {
        el.classList.add('reveal-init');
        const delay = Number.parseInt(el.getAttribute('data-aos-delay'), 10);
        if (Number.isFinite(delay) && delay > 0) {
          el.style.transitionDelay = `${Math.min(delay, 1000)}ms`;
        }
        this.scrollObserver.observe(el);
      });
    } else {
      $('.reveal-init').addClass('revealed');
    }
  }

  refreshScrollReveal() {
    if (!this.scrollObserver) return;
      document.querySelectorAll('.property-card, .featured-card, .no-results').forEach((el, idx) => {
      if (!el.classList.contains('revealed')) {
        el.classList.add('reveal-init');
        el.style.transitionDelay = `${(idx % 3) * 0.12}s`;
        this.scrollObserver.observe(el);
      }
    });
  }

  // --- STAT COUNTER ANIMATION ---
  initStatCounters() {
    const stats = document.querySelectorAll('.stat-number');
    if (!stats.length || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const text = el.textContent.trim();

          if (text.includes('4.8B')) {
            this.animateNumber(el, 0, 4.8, 1600, (n) => `$${n.toFixed(1)}B+`);
          } else if (text.includes('100%')) {
            this.animateNumber(el, 0, 100, 1400, (n) => `${Math.round(n)}%`);
          } else if (text.includes('24 Yrs') || text.includes('24')) {
            this.animateNumber(el, 0, 24, 1200, (n) => `${Math.round(n)} Yrs`);
          } else if (text.includes('8') && !text.includes('4.8')) {
            this.animateNumber(el, 0, 8, 1000, (n) => `${Math.round(n)}`);
          }

          obs.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    stats.forEach(stat => observer.observe(stat));
  }

  animateNumber(element, start, end, duration, formatter) {
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * ease;
      element.textContent = formatter(current);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.classList.add('counter-pulse');
      }
    };
    window.requestAnimationFrame(step);
  }

  // --- INTERACTIVE 3D PERSPECTIVE TILT ---
  initInteractiveTilt() {
    if (window.innerWidth < 992 || window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.matchMedia('(pointer: coarse)').matches) return;

    $(document).on('mousemove', '.property-card, .featured-card', function(e) {
      const card = $(this);
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;
      
      card.css('transform', `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-8px) scale(1.015)`);
    });

    $(document).on('mouseleave', '.property-card, .featured-card', function() {
      $(this).css('transform', '');
    });
  }
}

// Global initialization
$(document).ready(function() {
  window.app = new ValoisRealEstateApp();
});
