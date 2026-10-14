// Self-contained portfolio map. The SVG base map and property pins work without
// Leaflet, a tile server, API key, or an internet connection.
class LuxuryMapController {
  constructor(mapContainerId = 'properties-map') {
    this.container = document.getElementById(mapContainerId);
    this.markerLayer = document.getElementById('map-marker-layer');
    this.popupHost = document.getElementById('map-popup-host');
    this.activeFilter = 'all';
    this.properties = typeof LUXURY_PROPERTIES !== 'undefined' ? LUXURY_PROPERTIES : [];
    if (!this.container || !this.markerLayer) return;

    document.addEventListener('valoisCurrencyChange', event => {
      this.currencyRate = Number(event.detail?.rate) || 1;
      this.currencySymbol = event.detail?.symbol || '$';
      const visible = this.activeFilter === 'all'
        ? this.properties
        : this.properties.filter(property => property.city === this.activeFilter);
      this.renderMarkers(visible);
    });

    this.renderMarkers();
    this.bindLocationButtons();
    this.container.addEventListener('click', event => {
      if (event.target === this.container || event.target.closest('.map-world-art')) this.closePopup();
    });

    let focusId = null;
    try { focusId = window.sessionStorage.getItem('valois_map_focus_prop'); } catch (_) { /* Map still works without saved focus. */ }
    if (focusId) {
      try { window.sessionStorage.removeItem('valois_map_focus_prop'); } catch (_) { /* The current map can still focus. */ }
      requestAnimationFrame(() => this.focusProperty(focusId));
    }
  }

  renderMarkers(properties = this.properties) {
    if (!this.markerLayer) return;
    this.markerLayer.replaceChildren();
    this.closePopup();
    const visible = properties.filter(property => Array.isArray(property.coordinates) && property.coordinates.length >= 2);

    visible.forEach((property, index) => {
      const [lat, lon] = property.coordinates;
      const x = ((lon + 180) / 360) * 100;
      const y = ((90 - lat) / 180) * 100;
      const marker = document.createElement('button');
      marker.type = 'button';
      marker.className = 'atlas-property-marker';
      marker.style.left = `${x}%`;
      marker.style.top = `${y}%`;
      marker.style.setProperty('--marker-offset', `${(index % 3) * 5}px`);
      marker.setAttribute('aria-label', `${property.title}, ${property.location}, ${property.priceFormatted}`);
      marker.title = `${property.title} - ${property.priceFormatted}`;
      const convertedPrice = property.price * (this.currencyRate || 1);
      const shortPrice = convertedPrice >= 1000000
        ? `${this.currencySymbol || '$'}${(convertedPrice / 1000000).toFixed(1)}M`
        : `${this.currencySymbol || '$'}${Math.round(convertedPrice / 1000)}K`;
      marker.innerHTML = `<span class="atlas-marker-pulse"></span><span class="atlas-marker-core"><i class="fa-solid fa-location-dot"></i></span><span class="atlas-marker-label">${shortPrice}</span>`;
      marker.addEventListener('click', event => {
        event.stopPropagation();
        this.showProperty(property, x, y);
        this.markerLayer.querySelectorAll('.atlas-property-marker').forEach(item => item.classList.remove('selected'));
        marker.classList.add('selected');
      });
      this.markerLayer.append(marker);
    });

    const countLabel = document.getElementById('map-count-label');
    if (countLabel) countLabel.textContent = `${visible.length} ${visible.length === 1 ? 'residence' : 'residences'}`;
  }

  showProperty(property, x, y) {
    if (!this.popupHost) return;
    const popup = document.createElement('article');
    popup.className = 'map-property-card';
    popup.style.left = `${Math.min(Math.max(x, 18), 78)}%`;
    popup.style.top = `${Math.min(Math.max(y, 24), 76)}%`;
    popup.innerHTML = `
      <button class="map-popup-close" type="button" aria-label="Close property details"><i class="fa-solid fa-xmark"></i></button>
      <div class="map-popup-image" style="background-image:url('${property.heroImage}')"><span>${property.type}</span></div>
      <div class="map-popup-content">
        <p class="map-popup-location"><i class="fa-solid fa-location-dot"></i> ${property.location}</p>
        <h3>${property.title}</h3>
        <strong class="map-popup-price">${this.formatFullPrice(property.price)}</strong>
        <button class="map-popup-inspect" type="button">View residence <i class="fa-solid fa-arrow-right"></i></button>
      </div>`;
    popup.querySelector('.map-popup-close').addEventListener('click', () => this.closePopup());
    popup.querySelector('.map-popup-inspect').addEventListener('click', () => {
      if (window.app) window.app.openPropertyModal(property.id);
    });
    this.popupHost.replaceChildren(popup);
  }

  closePopup() {
    if (this.popupHost) this.popupHost.replaceChildren();
    if (this.markerLayer) this.markerLayer.querySelectorAll('.atlas-property-marker').forEach(marker => marker.classList.remove('selected'));
  }

  formatFullPrice(priceUsd) {
    return `${this.currencySymbol || '$'}${Math.round(priceUsd * (this.currencyRate || 1)).toLocaleString()}`;
  }

  focusProperty(propertyId) {
    const property = this.properties.find(item => item.id === propertyId);
    if (!property || !this.container) return;
    const [lat, lon] = property.coordinates;
    this.showProperty(property, ((lon + 180) / 360) * 100, ((90 - lat) / 180) * 100);
    const marker = [...this.markerLayer.querySelectorAll('.atlas-property-marker')].find(item => item.getAttribute('aria-label').startsWith(property.title));
    if (marker) marker.classList.add('selected');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.container.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  }

  bindLocationButtons() {
    document.querySelectorAll('.map-city-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.map-city-pill').forEach(button => {
          button.classList.remove('active');
          button.setAttribute('aria-pressed', 'false');
        });
        pill.classList.add('active');
        pill.setAttribute('aria-pressed', 'true');
        this.activeFilter = pill.dataset.city || 'all';
        const filtered = this.activeFilter === 'all'
          ? this.properties
          : this.properties.filter(property => property.city === this.activeFilter);
        this.renderMarkers(filtered);
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.luxuryMap = new LuxuryMapController();
});
