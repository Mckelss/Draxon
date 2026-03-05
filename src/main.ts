import './style.css';
import { removeBackground, type Config } from '@imgly/background-removal';

// ============================================
// Resolution Presets
// ============================================
interface ResolutionPreset {
  label: string;
  tag: string;
  width: number;
  height: number;
  description: string;
}

const RESOLUTION_PRESETS: Record<string, ResolutionPreset> = {
  original: { label: 'Original', tag: 'SRC', width: 0, height: 0, description: 'Keep original size' },
  hd: { label: 'HD', tag: '720p', width: 1280, height: 720, description: '1280 × 720' },
  fullhd: { label: 'Full HD', tag: '1080p', width: 1920, height: 1080, description: '1920 × 1080' },
  '2k': { label: '2K', tag: '1440p', width: 2560, height: 1440, description: '2560 × 1440' },
  '4k': { label: '4K', tag: '2160p', width: 3840, height: 2160, description: '3840 × 2160' },
  '8k': { label: '8K', tag: '4320p', width: 7680, height: 4320, description: '7680 × 4320' },
};

// ============================================
// State
// ============================================
interface AppState {
  originalFile: File | null;
  originalUrl: string;
  processedUrl: string;
  processedBlob: Blob | null;
  isProcessing: boolean;
  refineEdges: boolean;
  selectedResolution: string;
  selectedFormat: 'png' | 'jpeg' | 'webp';
  originalWidth: number;
  originalHeight: number;
}

const state: AppState = {
  originalFile: null,
  originalUrl: '',
  processedUrl: '',
  processedBlob: null,
  isProcessing: false,
  refineEdges: true,
  selectedResolution: 'original',
  selectedFormat: 'png',
  originalWidth: 0,
  originalHeight: 0,
};

// ============================================
// SVG Icons
// ============================================
const icons = {
  upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn__icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  reset: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn__icon"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>`,
  image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn__icon"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
};

// ============================================
// Render App
// ============================================
function renderApp(): void {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <!-- Navbar -->
    <nav class="navbar" id="navbar">
      <a class="navbar__brand" href="/">
        <div class="navbar__logo">
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 4h8l4 3-2 2 3 2-2 3-1 2-2 5H9l2-5-4 0 3-3-4-2 3-3-4-3z" fill="white"/>
            <circle cx="13" cy="8" r="1.5" fill="rgba(10, 10, 15, 0.9)"/>
          </svg>
        </div>
        <div>
          <div class="navbar__title">Draxon</div>
          <div class="navbar__subtitle">AI Background Remover</div>
        </div>
      </a>
      <div class="navbar__actions">
        <div class="badge">
          <span class="badge__dot"></span>
          AI Powered • Client-Side
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero" id="hero-section">
      <div class="hero__tag">
        ⚡ Powered by U²Net AI Model
      </div>
      <h1 class="hero__title">
        Remove Any<br /><span class="hero__title-gradient">Background Instantly</span>
      </h1>
      <p class="hero__description">
        Upload your image and let our AI remove the background in seconds. 
        Full resolution preserved — no compression, no quality loss.
      </p>
    </section>

    <!-- Upload Zone -->
    <section class="upload-section" id="upload-section">
      <div class="upload-zone" id="upload-zone">
        <div class="upload-zone__content">
          <div class="upload-zone__icon">
            ${icons.upload}
          </div>
          <div class="upload-zone__title">Drop your image here</div>
          <div class="upload-zone__subtitle">or click to browse files</div>
          <div class="upload-zone__formats">
            <span class="upload-zone__format-tag">JPG</span>
            <span class="upload-zone__format-tag">PNG</span>
            <span class="upload-zone__format-tag">WEBP</span>
          </div>
        </div>
        <input type="file" class="upload-zone__input" id="file-input" accept="image/jpeg,image/png,image/webp" />
      </div>
    </section>

    <!-- Features -->
    <section class="features" id="features-section">
      <div class="feature-card">
        <div class="feature-card__icon">🎯</div>
        <div class="feature-card__title">Full Resolution</div>
        <div class="feature-card__desc">Original dimensions & DPI preserved. No resizing.</div>
      </div>
      <div class="feature-card">
        <div class="feature-card__icon">🧠</div>
        <div class="feature-card__title">AI Precision</div>
        <div class="feature-card__desc">U²Net model handles hair, soft edges & fine details.</div>
      </div>
      <div class="feature-card">
        <div class="feature-card__icon">🔒</div>
        <div class="feature-card__title">100% Private</div>
        <div class="feature-card__desc">All processing happens in your browser. Nothing uploaded.</div>
      </div>
    </section>

    <!-- Processing Section -->
    <section class="processing-section" id="processing-section">
      <!-- Controls Bar -->
      <div class="controls-bar" id="controls-bar">
        <div class="controls-bar__left">
          <div class="file-info" id="file-info">
            <span class="file-info__icon">📄</span>
            <span class="file-info__name" id="file-name">—</span>
            <span class="file-info__meta" id="file-meta">—</span>
          </div>
        </div>
        <div class="controls-bar__right">
          <div class="toggle-group">
            <label class="toggle-label" for="refine-toggle">Refine Edges</label>
            <label class="toggle-switch">
              <input type="checkbox" id="refine-toggle" checked />
              <span class="toggle-switch__track"></span>
              <span class="toggle-switch__thumb"></span>
            </label>
          </div>
          <button class="btn btn--secondary" id="btn-new">
            ${icons.reset} New Image
          </button>
        </div>
      </div>

      <!-- Resolution Selector -->
      <div class="resolution-selector" id="resolution-selector">
        <div class="resolution-selector__label">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="resolution-selector__icon"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          Output Resolution
        </div>
        <div class="resolution-options" id="resolution-options">
          ${Object.entries(RESOLUTION_PRESETS).map(([key, preset]) => `
            <button class="resolution-option ${key === 'original' ? 'resolution-option--active' : ''}" data-resolution="${key}" id="res-${key}">
              <span class="resolution-option__tag">${preset.tag}</span>
              <span class="resolution-option__label">${preset.label}</span>
              <span class="resolution-option__desc">${preset.description}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Preview Grid -->
      <div class="preview-grid">
        <!-- Original -->
        <div class="preview-card">
          <div class="preview-card__header">
            <div class="preview-card__title">
              ${icons.image} Original
              <span class="preview-card__badge preview-card__badge--original">Source</span>
            </div>
            <div class="preview-card__dimensions" id="original-dimensions">—</div>
          </div>
          <div class="preview-card__body">
            <img class="preview-card__image" id="original-preview" src="" alt="Original image" />
          </div>
        </div>

        <!-- Processed -->
        <div class="preview-card">
          <div class="preview-card__header">
            <div class="preview-card__title">
              ${icons.image} Processed
              <span class="preview-card__badge preview-card__badge--processed">Transparent</span>
            </div>
            <div class="preview-card__dimensions" id="processed-dimensions">—</div>
          </div>
          <div class="preview-card__body preview-card__body--checkerboard" id="processed-body">
            <img class="preview-card__image" id="processed-preview" src="" alt="Processed image" style="display:none;" />
            <!-- Loading Overlay -->
            <div class="loading-overlay" id="loading-overlay">
              <div class="spinner">
                <div class="spinner__ring"></div>
                <div class="spinner__ring"></div>
                <div class="spinner__ring"></div>
              </div>
              <div class="loading-text">
                <span class="loading-text__status" id="loading-status">Initializing AI model...</span>
              </div>
              <div class="progress-bar">
                <div class="progress-bar__fill" id="progress-fill"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Result Actions -->
      <div class="result-actions" id="result-actions" style="display:none;">
        <div class="format-selector" id="format-selector">
          <button class="format-option format-option--active" data-format="png">PNG (Lossless)</button>
          <button class="format-option" data-format="jpeg">JPG (White BG)</button>
          <button class="format-option" data-format="webp">WEBP (Modern)</button>
        </div>
        <div class="action-buttons">
          <button class="btn btn--primary btn--lg" id="btn-download">
            ${icons.download} Download <span id="download-format-label">PNG</span>
          </button>
          <button class="btn btn--secondary btn--lg" id="btn-reprocess">
            ${icons.reset} Reprocess
          </button>
        </div>
      </div>
    </section>

    <!-- Toast Container -->
    <div class="toast-container" id="toast-container"></div>

    <!-- Footer -->
    <footer class="footer">
      <p>Draxon — AI Background Remover • All processing happens locally in your browser • No data is sent to any server</p>
    </footer>
  `;

  bindEvents();
}

// ============================================
// Event Binding
// ============================================
function bindEvents(): void {
  const uploadZone = document.getElementById('upload-zone')!;
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const btnNew = document.getElementById('btn-new');
  const btnDownload = document.getElementById('btn-download');
  const btnReprocess = document.getElementById('btn-reprocess');
  const refineToggle = document.getElementById('refine-toggle') as HTMLInputElement;

  // Click to upload
  uploadZone.addEventListener('click', () => fileInput.click());

  // File input change
  fileInput.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      handleFile(target.files[0]);
    }
  });

  // Drag and drop
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadZone.classList.add('dragover');
  });

  uploadZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadZone.classList.remove('dragover');
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadZone.classList.remove('dragover');
    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  // New image button
  btnNew?.addEventListener('click', resetApp);

  // Download button
  btnDownload?.addEventListener('click', downloadResult);

  // Reprocess button
  btnReprocess?.addEventListener('click', () => {
    if (state.originalFile) {
      processImage(state.originalFile);
    }
  });

  // Refine edges toggle
  refineToggle?.addEventListener('change', () => {
    state.refineEdges = refineToggle.checked;
  });

  // Resolution selector buttons
  const resolutionOptions = document.getElementById('resolution-options')!;
  resolutionOptions.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('.resolution-option') as HTMLElement | null;
    if (!target) return;

    const resKey = target.dataset.resolution;
    if (!resKey || resKey === state.selectedResolution) return;

    // Update active state
    document.querySelectorAll('.resolution-option').forEach(el => el.classList.remove('resolution-option--active'));
    target.classList.add('resolution-option--active');

    state.selectedResolution = resKey;

    // If we already have a processed blob, re-export at the new resolution
    if (state.processedBlob && !state.isProcessing) {
      reExportAtResolution(state.processedBlob);
    }
  });

  // Format selector buttons
  const formatSelector = document.getElementById('format-selector');
  formatSelector?.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('.format-option') as HTMLElement | null;
    if (!target) return;

    const formatKey = target.dataset.format as 'png' | 'jpeg' | 'webp';
    if (!formatKey || formatKey === state.selectedFormat) return;

    // Update active state
    document.querySelectorAll('.format-option').forEach(el => el.classList.remove('format-option--active'));
    target.classList.add('format-option--active');

    state.selectedFormat = formatKey;

    // Update download button label
    const formatLabel = document.getElementById('download-format-label');
    if (formatLabel) {
      formatLabel.textContent = formatKey.toUpperCase();
    }
  });
}

// ============================================
// File Handling
// ============================================
function handleFile(file: File): void {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    showToast('Please upload a JPG, PNG, or WEBP image.', 'error');
    return;
  }

  // Max 50MB
  if (file.size > 50 * 1024 * 1024) {
    showToast('File too large. Maximum 50MB allowed.', 'error');
    return;
  }

  state.originalFile = file;

  // Revoke previous object URL
  if (state.originalUrl) {
    URL.revokeObjectURL(state.originalUrl);
  }
  state.originalUrl = URL.createObjectURL(file);

  // Show processing section
  const heroSection = document.getElementById('hero-section')!;
  const uploadSection = document.getElementById('upload-section')!;
  const featuresSection = document.getElementById('features-section')!;
  const processingSection = document.getElementById('processing-section')!;

  heroSection.style.display = 'none';
  uploadSection.style.display = 'none';
  featuresSection.style.display = 'none';
  processingSection.classList.add('active');

  // Set file info
  const fileName = document.getElementById('file-name')!;
  const fileMeta = document.getElementById('file-meta')!;
  fileName.textContent = file.name;
  fileMeta.textContent = formatFileSize(file.size);

  // Load original image to get dimensions
  const img = new Image();
  img.onload = () => {
    state.originalWidth = img.naturalWidth;
    state.originalHeight = img.naturalHeight;

    const originalDim = document.getElementById('original-dimensions')!;
    originalDim.textContent = `${img.naturalWidth} × ${img.naturalHeight}`;

    const originalPreview = document.getElementById('original-preview') as HTMLImageElement;
    originalPreview.src = state.originalUrl;

    processImage(file);
  };
  img.src = state.originalUrl;
}

// ============================================
// Background Removal
// ============================================
async function processImage(file: File): Promise<void> {
  if (state.isProcessing) return;
  state.isProcessing = true;

  const loadingOverlay = document.getElementById('loading-overlay')!;
  const loadingStatus = document.getElementById('loading-status')!;
  const progressFill = document.getElementById('progress-fill')!;
  const processedPreview = document.getElementById('processed-preview') as HTMLImageElement;
  const resultActions = document.getElementById('result-actions')!;

  // Show loading
  loadingOverlay.classList.remove('hidden');
  processedPreview.style.display = 'none';
  resultActions.style.display = 'none';

  // Reset progress
  progressFill.style.width = '0%';
  loadingStatus.textContent = 'Initializing AI model...';

  try {
    const config: Config = {
      output: {
        format: 'image/png',
        quality: 1,
      },
      progress: (key: string, current: number, total: number) => {
        const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
        progressFill.style.width = `${percentage}%`;

        if (key.includes('fetch')) {
          loadingStatus.textContent = `Downloading model... ${percentage}%`;
        } else if (key.includes('compute')) {
          loadingStatus.textContent = `Processing image... ${percentage}%`;
        } else {
          loadingStatus.textContent = `${key}... ${percentage}%`;
        }
      },
    };

    const blob = await removeBackground(file, config);

    // Store the raw processed blob at original resolution first
    const rawUrl = URL.createObjectURL(blob);
    const rawImg = new Image();

    rawImg.onload = () => {
      // First ensure we have the result at original dimensions
      if (rawImg.naturalWidth === state.originalWidth && rawImg.naturalHeight === state.originalHeight) {
        // Already at original size — store and export
        state.processedBlob = blob;
        reExportAtResolution(blob);
      } else {
        // Re-render at original resolution first, then export at chosen resolution
        renderToBlob(rawImg, state.originalWidth, state.originalHeight, (originalBlob) => {
          URL.revokeObjectURL(rawUrl);
          if (originalBlob) {
            state.processedBlob = originalBlob;
            reExportAtResolution(originalBlob);
          }
        });
      }
    };
    rawImg.onerror = () => {
      showToast('Failed to process image result.', 'error');
      state.isProcessing = false;
      loadingOverlay.classList.add('hidden');
    };
    rawImg.src = rawUrl;

  } catch (error) {
    console.error('Background removal error:', error);
    showToast('Background removal failed. Please try again.', 'error');
    state.isProcessing = false;
    loadingOverlay.classList.add('hidden');
  }
}

// Render an image to a new Blob at specified dimensions
function renderToBlob(img: HTMLImageElement, targetW: number, targetH: number, callback: (blob: Blob | null) => void): void {
  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetW, targetH);
  canvas.toBlob(callback, 'image/png');
}

// Re-export the processed image at the currently selected resolution
function reExportAtResolution(sourceBlob: Blob): void {
  const preset = RESOLUTION_PRESETS[state.selectedResolution];
  const loadingOverlay = document.getElementById('loading-overlay')!;
  const loadingStatus = document.getElementById('loading-status')!;
  const progressFill = document.getElementById('progress-fill')!;

  // If "original" — just use the blob directly
  if (state.selectedResolution === 'original' || !preset) {
    const url = URL.createObjectURL(sourceBlob);
    finishProcessing(url, state.originalWidth, state.originalHeight);
    return;
  }

  // Show brief loading for rescale
  loadingOverlay.classList.remove('hidden');
  loadingStatus.textContent = `Scaling to ${preset.label}...`;
  progressFill.style.width = '50%';

  // Calculate target dimensions preserving aspect ratio
  const { width: targetW, height: targetH } = computeFitDimensions(
    state.originalWidth,
    state.originalHeight,
    preset.width,
    preset.height
  );

  const img = new Image();
  img.onload = () => {
    renderToBlob(img, targetW, targetH, (scaledBlob) => {
      if (scaledBlob) {
        progressFill.style.width = '100%';
        const url = URL.createObjectURL(scaledBlob);
        finishProcessing(url, targetW, targetH);
      }
    });
  };
  img.src = URL.createObjectURL(sourceBlob);
}

// Compute dimensions that fit within maxW×maxH while preserving aspect ratio
function computeFitDimensions(srcW: number, srcH: number, maxW: number, maxH: number): { width: number; height: number } {
  const aspectRatio = srcW / srcH;

  let width = maxW;
  let height = Math.round(maxW / aspectRatio);

  if (height > maxH) {
    height = maxH;
    width = Math.round(maxH * aspectRatio);
  }

  // Don't upscale beyond original if the original is smaller than target
  // Actually, user wants to choose resolution, so we allow upscale
  return { width, height };
}

function finishProcessing(url: string, width: number, height: number): void {
  const loadingOverlay = document.getElementById('loading-overlay')!;
  const processedPreview = document.getElementById('processed-preview') as HTMLImageElement;
  const processedDimensions = document.getElementById('processed-dimensions')!;
  const resultActions = document.getElementById('result-actions')!;

  // Revoke old URL
  if (state.processedUrl) {
    URL.revokeObjectURL(state.processedUrl);
  }
  state.processedUrl = url;

  processedPreview.src = url;
  processedPreview.style.display = 'block';
  processedDimensions.textContent = `${width} × ${height}`;

  loadingOverlay.classList.add('hidden');
  resultActions.style.display = 'flex';

  state.isProcessing = false;

  showToast('Background removed successfully!', 'success');
}

// ============================================
// Download & Conversion
// ============================================
async function downloadResult(): Promise<void> {
  if (!state.processedUrl || !state.processedBlob) return;

  const originalName = state.originalFile?.name || 'image';
  const baseName = originalName.replace(/\.[^/.]+$/, '');

  if (state.selectedFormat === 'png') {
    // PNG is the native format returned by the AI currently
    triggerDownload(state.processedUrl, `${baseName}_no_bg.png`);
    return;
  }

  // Handle JPG and WEBP conversions using Canvas
  const preset = RESOLUTION_PRESETS[state.selectedResolution];
  const targetW = state.selectedResolution === 'original' || !preset ? state.originalWidth : computeFitDimensions(state.originalWidth, state.originalHeight, preset.width, preset.height).width;
  const targetH = state.selectedResolution === 'original' || !preset ? state.originalHeight : computeFitDimensions(state.originalWidth, state.originalHeight, preset.width, preset.height).height;

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d')!;

  // If exporting as JPG, draw a white background first since JPG doesn't support transparency
  if (state.selectedFormat === 'jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);
  }

  // Draw the processed image
  const img = new Image();
  img.onload = () => {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, targetW, targetH);

    // Convert canvas to requested format
    const quality = state.selectedFormat === 'jpeg' ? 0.92 : 0.95;
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const ext = state.selectedFormat === 'jpeg' ? 'jpg' : 'webp';
        triggerDownload(url, `${baseName}_no_bg.${ext}`);

        // Revoke the temporary conversion URL shortly after
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        showToast('Failed to convert image format.', 'error');
      }
    }, `image/${state.selectedFormat}`, quality);
  };
  img.src = state.processedUrl;
}

function triggerDownload(url: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast(`Downloading ${filename.split('.').pop()?.toUpperCase()}...`, 'success');
}

// ============================================
// Reset
// ============================================
function resetApp(): void {
  if (state.originalUrl) URL.revokeObjectURL(state.originalUrl);
  if (state.processedUrl) URL.revokeObjectURL(state.processedUrl);

  state.originalFile = null;
  state.originalUrl = '';
  state.processedUrl = '';
  state.processedBlob = null;
  state.isProcessing = false;
  state.selectedResolution = 'original';
  state.originalWidth = 0;
  state.originalHeight = 0;

  const heroSection = document.getElementById('hero-section')!;
  const uploadSection = document.getElementById('upload-section')!;
  const featuresSection = document.getElementById('features-section')!;
  const processingSection = document.getElementById('processing-section')!;

  heroSection.style.display = '';
  uploadSection.style.display = '';
  featuresSection.style.display = '';
  processingSection.classList.remove('active');

  // Reset file input
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  if (fileInput) fileInput.value = '';
}

// ============================================
// Toast Notifications
// ============================================
function showToast(message: string, type: 'success' | 'error' = 'success'): void {
  const container = document.getElementById('toast-container')!;
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : '❌'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ============================================
// Utilities
// ============================================
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ============================================
// Initialize
// ============================================
renderApp();
