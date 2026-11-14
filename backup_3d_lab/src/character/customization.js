import * as THREE from 'three';

/**
 * Character Customization System & UI Controller:
 * Live customization of skin tone, hair style & color, outfit colors,
 * accessories (hoodie, glasses, cap, headphones, lanyard), height, build, head size, and name tag.
 * Full support for Randomize, Reset, and localStorage persistence.
 */
export class CustomizationManager {
  constructor(character) {
    this.character = character;

    this.defaults = {
      name: 'Alex',
      skinColor: '#f5d0b5',
      hairStyle: 'short',
      hairColor: '#2b1d0c',
      shirtColor: '#0284c7',
      pantsColor: '#1e293b',
      shoesColor: '#f1f5f9',
      hasHoodie: false,
      hasGlasses: false,
      hasCap: false,
      hasHeadphones: false,
      hasLanyard: false,
      height: 1.0,
      build: 'average', // 'slim', 'average', 'broad'
      headSize: 1.0,
    };

    this.current = { ...this.defaults };

    this.skinPresets = [
      '#fdf2e9', '#f5d0b5', '#e8b598', '#d49b77', '#9e623c', '#5c3317'
    ];
    this.hairColorPresets = [
      '#1e293b', '#2b1d0c', '#854d0e', '#ca8a04', '#e2e8f0', '#ec4899', '#0284c7'
    ];

    this.init();
  }

  init() {
    this.loadFromLocalStorage();
    this.applyCustomization();
    this.buildCustomizationPanel();
    this.initEvents();
  }

  applyCustomization() {
    const c = this.current;
    const char = this.character;

    // 1. Skin Color
    char.materials.skin.color.set(c.skinColor);

    // 2. Hair Style & Color
    char.setHairStyle(c.hairStyle);
    char.materials.hair.color.set(c.hairColor);

    // 3. Clothing Colors
    char.materials.shirt.color.set(c.shirtColor);
    char.materials.pants.color.set(c.pantsColor);
    char.materials.shoes.color.set(c.shoesColor);

    // 4. Accessories
    char.accessories.hoodie.visible = !!c.hasHoodie;
    char.accessories.glasses.visible = !!c.hasGlasses;
    char.accessories.cap.visible = !!c.hasCap;
    char.accessories.headphones.visible = !!c.hasHeadphones;
    char.accessories.lanyard.visible = !!c.hasLanyard;

    // 5. Body Proportions & Scale
    let widthScale = 1.0;
    if (c.build === 'slim') widthScale = 0.88;
    else if (c.build === 'broad') widthScale = 1.15;

    char.root.scale.set(widthScale, c.height, widthScale);
    char.head.scale.set(c.headSize, c.headSize, c.headSize);

    // 6. Name Tag Text
    char.updateNameTag(c.name);
  }

  randomize() {
    const hairStyles = ['short', 'long', 'bun', 'spiky', 'bald'];
    const builds = ['slim', 'average', 'broad'];
    const randomHex = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

    this.current.skinColor = this.skinPresets[Math.floor(Math.random() * this.skinPresets.length)];
    this.current.hairStyle = hairStyles[Math.floor(Math.random() * hairStyles.length)];
    this.current.hairColor = this.hairColorPresets[Math.floor(Math.random() * this.hairColorPresets.length)];
    this.current.shirtColor = randomHex();
    this.current.pantsColor = randomHex();
    this.current.shoesColor = randomHex();
    this.current.hasHoodie = Math.random() > 0.5;
    this.current.hasGlasses = Math.random() > 0.5;
    this.current.hasCap = Math.random() > 0.6;
    this.current.hasHeadphones = Math.random() > 0.6;
    this.current.hasLanyard = Math.random() > 0.5;
    this.current.height = 0.9 + Math.random() * 0.2;
    this.current.build = builds[Math.floor(Math.random() * builds.length)];
    this.current.headSize = 0.92 + Math.random() * 0.16;

    this.applyCustomization();
    this.syncPanelInputs();
    this.saveToLocalStorage();
  }

  reset() {
    this.current = { ...this.defaults };
    this.applyCustomization();
    this.syncPanelInputs();
    this.saveToLocalStorage();
  }

  saveToLocalStorage() {
    try {
      localStorage.setItem('lab_character_customization', JSON.stringify(this.current));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }

  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem('lab_character_customization');
      if (data) {
        this.current = { ...this.defaults, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Storage load error:', e);
    }
  }

  buildCustomizationPanel() {
    // Inject Customization Panel HTML into body
    let modal = document.getElementById('customization-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'customization-modal';
      modal.className = 'custom-modal hidden';
      modal.innerHTML = `
        <div class="custom-panel">
          <div class="custom-header">
            <h2>AVATAR CUSTOMIZATION</h2>
            <button id="close-custom-btn" class="close-btn">&times;</button>
          </div>
          
          <div class="custom-body">
            <!-- Name Tag -->
            <div class="custom-group">
              <label>Name Tag</label>
              <input type="text" id="cust-name" value="${this.current.name}" maxlength="16" />
            </div>

            <!-- Skin Tone Presets -->
            <div class="custom-group">
              <label>Skin Tone</label>
              <div class="preset-row" id="skin-presets"></div>
              <input type="color" id="cust-skin" value="${this.current.skinColor}" />
            </div>

            <!-- Hair Style & Color -->
            <div class="custom-group">
              <label>Hair Style</label>
              <select id="cust-hair-style">
                <option value="short">Short</option>
                <option value="long">Long</option>
                <option value="bun">Top Bun</option>
                <option value="spiky">Spiky</option>
                <option value="bald">Bald</option>
              </select>
            </div>

            <div class="custom-group">
              <label>Hair Color</label>
              <div class="preset-row" id="hair-presets"></div>
              <input type="color" id="cust-hair-color" value="${this.current.hairColor}" />
            </div>

            <!-- Outfits -->
            <div class="custom-group">
              <label>Outfit Colors</label>
              <div class="color-row">
                <div><span>Shirt:</span> <input type="color" id="cust-shirt" value="${this.current.shirtColor}" /></div>
                <div><span>Pants:</span> <input type="color" id="cust-pants" value="${this.current.pantsColor}" /></div>
                <div><span>Shoes:</span> <input type="color" id="cust-shoes" value="${this.current.shoesColor}" /></div>
              </div>
            </div>

            <!-- Accessories -->
            <div class="custom-group">
              <label>Accessories</label>
              <div class="checkbox-grid">
                <label><input type="checkbox" id="cust-hoodie" ${this.current.hasHoodie ? 'checked' : ''} /> Hoodie Collar</label>
                <label><input type="checkbox" id="cust-glasses" ${this.current.hasGlasses ? 'checked' : ''} /> Glasses</label>
                <label><input type="checkbox" id="cust-cap" ${this.current.hasCap ? 'checked' : ''} /> Baseball Cap</label>
                <label><input type="checkbox" id="cust-headphones" ${this.current.hasHeadphones ? 'checked' : ''} /> Headphones</label>
                <label><input type="checkbox" id="cust-lanyard" ${this.current.hasLanyard ? 'checked' : ''} /> ID Lanyard</label>
              </div>
            </div>

            <!-- Body Proportions -->
            <div class="custom-group">
              <label>Height: <span id="val-height">${this.current.height}</span>x</label>
              <input type="range" id="cust-height" min="0.85" max="1.15" step="0.05" value="${this.current.height}" />
            </div>

            <div class="custom-group">
              <label>Build</label>
              <select id="cust-build">
                <option value="slim" ${this.current.build === 'slim' ? 'selected' : ''}>Slim</option>
                <option value="average" ${this.current.build === 'average' ? 'selected' : ''}>Average</option>
                <option value="broad" ${this.current.build === 'broad' ? 'selected' : ''}>Broad</option>
              </select>
            </div>

            <div class="custom-group">
              <label>Head Size: <span id="val-head">${this.current.headSize}</span>x</label>
              <input type="range" id="cust-head" min="0.85" max="1.15" step="0.05" value="${this.current.headSize}" />
            </div>
          </div>

          <div class="custom-footer">
            <button id="cust-rand-btn" class="btn-secondary">🎲 Randomize</button>
            <button id="cust-reset-btn" class="btn-secondary">↺ Reset</button>
            <button id="cust-save-btn" class="btn-primary">✓ Done</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    this.populatePresets();
    this.syncPanelInputs();
  }

  populatePresets() {
    const skinBox = document.getElementById('skin-presets');
    if (skinBox) {
      skinBox.innerHTML = '';
      this.skinPresets.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'preset-swatch';
        swatch.style.backgroundColor = color;
        swatch.onclick = () => {
          this.current.skinColor = color;
          document.getElementById('cust-skin').value = color;
          this.applyCustomization();
          this.saveToLocalStorage();
        };
        skinBox.appendChild(swatch);
      });
    }

    const hairBox = document.getElementById('hair-presets');
    if (hairBox) {
      hairBox.innerHTML = '';
      this.hairColorPresets.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'preset-swatch';
        swatch.style.backgroundColor = color;
        swatch.onclick = () => {
          this.current.hairColor = color;
          document.getElementById('cust-hair-color').value = color;
          this.applyCustomization();
          this.saveToLocalStorage();
        };
        hairBox.appendChild(swatch);
      });
    }
  }

  syncPanelInputs() {
    const c = this.current;
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };
    const setCheck = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.checked = !!val;
    };

    setVal('cust-name', c.name);
    setVal('cust-skin', c.skinColor);
    setVal('cust-hair-style', c.hairStyle);
    setVal('cust-hair-color', c.hairColor);
    setVal('cust-shirt', c.shirtColor);
    setVal('cust-pants', c.pantsColor);
    setVal('cust-shoes', c.shoesColor);
    setCheck('cust-hoodie', c.hasHoodie);
    setCheck('cust-glasses', c.hasGlasses);
    setCheck('cust-cap', c.hasCap);
    setCheck('cust-headphones', c.hasHeadphones);
    setCheck('cust-lanyard', c.hasLanyard);
    setVal('cust-height', c.height);
    setVal('cust-build', c.build);
    setVal('cust-head', c.headSize);

    const valH = document.getElementById('val-height');
    if (valH) valH.textContent = c.height;
    const valHead = document.getElementById('val-head');
    if (valHead) valHead.textContent = c.headSize;
  }

  initEvents() {
    const modal = document.getElementById('customization-modal');
    const closeBtn = document.getElementById('close-custom-btn');
    const saveBtn = document.getElementById('cust-save-btn');
    const randBtn = document.getElementById('cust-rand-btn');
    const resetBtn = document.getElementById('cust-reset-btn');

    const toggle = (force) => {
      if (!modal) return;
      const isHidden = modal.classList.contains('hidden');
      const show = force !== undefined ? force : isHidden;
      if (show) {
        modal.classList.remove('hidden');
        if (document.exitPointerLock) document.exitPointerLock();
      } else {
        modal.classList.add('hidden');
      }
    };

    this.togglePanel = toggle;

    if (closeBtn) closeBtn.onclick = () => toggle(false);
    if (saveBtn) saveBtn.onclick = () => {
      this.saveToLocalStorage();
      toggle(false);
    };
    if (randBtn) randBtn.onclick = () => this.randomize();
    if (resetBtn) resetBtn.onclick = () => this.reset();

    // Input change listeners
    const addListener = (id, event, callback) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener(event, callback);
    };

    addListener('cust-name', 'input', (e) => {
      this.current.name = e.target.value;
      this.applyCustomization();
    });
    addListener('cust-skin', 'input', (e) => {
      this.current.skinColor = e.target.value;
      this.applyCustomization();
    });
    addListener('cust-hair-style', 'change', (e) => {
      this.current.hairStyle = e.target.value;
      this.applyCustomization();
    });
    addListener('cust-hair-color', 'input', (e) => {
      this.current.hairColor = e.target.value;
      this.applyCustomization();
    });
    addListener('cust-shirt', 'input', (e) => {
      this.current.shirtColor = e.target.value;
      this.applyCustomization();
    });
    addListener('cust-pants', 'input', (e) => {
      this.current.pantsColor = e.target.value;
      this.applyCustomization();
    });
    addListener('cust-shoes', 'input', (e) => {
      this.current.shoesColor = e.target.value;
      this.applyCustomization();
    });
    addListener('cust-hoodie', 'change', (e) => {
      this.current.hasHoodie = e.target.checked;
      this.applyCustomization();
    });
    addListener('cust-glasses', 'change', (e) => {
      this.current.hasGlasses = e.target.checked;
      this.applyCustomization();
    });
    addListener('cust-cap', 'change', (e) => {
      this.current.hasCap = e.target.checked;
      this.applyCustomization();
    });
    addListener('cust-headphones', 'change', (e) => {
      this.current.hasHeadphones = e.target.checked;
      this.applyCustomization();
    });
    addListener('cust-lanyard', 'change', (e) => {
      this.current.hasLanyard = e.target.checked;
      this.applyCustomization();
    });
    addListener('cust-height', 'input', (e) => {
      this.current.height = parseFloat(e.target.value);
      document.getElementById('val-height').textContent = this.current.height;
      this.applyCustomization();
    });
    addListener('cust-build', 'change', (e) => {
      this.current.build = e.target.value;
      this.applyCustomization();
    });
    addListener('cust-head', 'input', (e) => {
      this.current.headSize = parseFloat(e.target.value);
      document.getElementById('val-head').textContent = this.current.headSize;
      this.applyCustomization();
    });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyC') {
        toggle();
      }
    });
  }
}
