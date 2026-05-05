// UI Controller module
const UI = {
    elements: {},
    startTime: null,
    lastBytes: 0,
    
    init() {
        this.elements = {
            statusDot: document.querySelector('.status-dot'),
            connectionStatus: document.getElementById('connectionStatus'),
            driveCard: document.getElementById('driveCard'),
            driveName: document.getElementById('driveName'),
            driveStatus: document.getElementById('driveStatus'),
            disconnectBtn: document.getElementById('disconnectDriveBtn'),
            selectDriveBtn: document.getElementById('selectDriveBtn'),
            dropzone: document.getElementById('dropzone'),
            fileInput: document.getElementById('fileInput'),
            fileCard: document.getElementById('fileCard'),
            fileName: document.getElementById('fileName'),
            fileSize: document.getElementById('fileSize'),
            clearFileBtn: document.getElementById('clearFileBtn'),
            flashBtn: document.getElementById('flashBtn'),
            progressContainer: document.getElementById('progressContainer'),
            progressFill: document.getElementById('progressFill'),
            progressPercent: document.getElementById('progressPercent'),
            progressStats: document.getElementById('progressStats'),
            clearLogBtn: document.getElementById('clearLogBtn'),
            copyLogBtn: document.getElementById('copyLogBtn'),
            downloadLogBtn: document.getElementById('downloadLogBtn'),
            guideBtn: document.getElementById('guideBtn'),
            guideModal: document.getElementById('guideModal'),
            closeModalBtn: document.getElementById('closeModalBtn'),
            presetList: document.getElementById('presetList'),
            clearPresetBtn: document.getElementById('clearPresetBtn')
        };
        
        // Render danh sách firmware từ config
        this.renderFirmwareList();
    },
    
    // Tự động render danh sách firmware từ FileHandler
    renderFirmwareList() {
        const presetList = this.elements.presetList;
        if (!presetList) return;
        
        const firmwares = FileHandler.getFirmwareList(true); // true = chỉ lấy featured
        
        presetList.innerHTML = '';
        
        firmwares.forEach(fw => {
            const tagsHtml = fw.tags.map(tag => 
                `<span class="badge">${tag}</span>`
            ).join('');
            
            const item = document.createElement('div');
            item.className = 'preset-item';
            item.dataset.firmware = fw.id;
            item.innerHTML = `
                <div class="preset-icon">
                    <i class="${fw.icon}"></i>
                </div>
                <div class="preset-info">
                    <div class="preset-name">${fw.name}</div>
                    <div class="preset-desc">${fw.description}</div>
                    <div class="preset-meta">
                        <span class="badge badge-version">${fw.version}</span>
                        ${tagsHtml}
                        <span class="badge badge-size">${fw.size}</span>
                    </div>
                </div>
                <div class="preset-action">
                    <i class="fas fa-chevron-right"></i>
                </div>
                <div class="preset-check" style="display: none;">
                    <i class="fas fa-check-circle"></i>
                </div>
            `;
            
            presetList.appendChild(item);
        });
    },

    updateDeviceStatus(connected, driveName = '') {
        const { statusDot, connectionStatus, driveCard, driveName: nameEl, driveStatus, disconnectBtn } = this.elements;
        
        if (connected) {
            statusDot.classList.add('connected');
            connectionStatus.textContent = 'Đã kết nối';
            driveCard.classList.add('connected');
            nameEl.textContent = driveName;
            driveStatus.textContent = 'Sẵn sàng flash';
            disconnectBtn.style.display = 'flex';
        } else {
            statusDot.classList.remove('connected');
            connectionStatus.textContent = 'Chưa kết nối';
            driveCard.classList.remove('connected');
            nameEl.textContent = 'Chưa chọn ổ đĩa';
            driveStatus.textContent = 'Vui lòng kết nối Pi Pico';
            disconnectBtn.style.display = 'none';
        }
    },

    updateFileInfo(name, size) {
        this.elements.fileName.textContent = name;
        this.elements.fileSize.textContent = size;
        this.elements.fileCard.style.display = 'flex';
        this.elements.dropzone.style.display = 'none';
        this.clearPresetSelection();
        this.hideClearPresetButton();
    },

    hideFileInfo() {
        this.elements.fileCard.style.display = 'none';
        this.elements.dropzone.style.display = 'block';
        this.elements.fileInput.value = '';
    },

    selectPresetItem(presetId) {
        this.clearPresetSelection();
        
        const selectedItem = document.querySelector(`[data-firmware="${presetId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }
        
        this.hideFileInfo();
        this.showClearPresetButton();
    },

    clearPresetSelection() {
        document.querySelectorAll('.preset-item').forEach(item => {
            item.classList.remove('selected');
        });
        this.hideClearPresetButton();
    },
    
    showClearPresetButton() {
        if (this.elements.clearPresetBtn) {
            this.elements.clearPresetBtn.style.display = 'flex';
        }
    },
    
    hideClearPresetButton() {
        if (this.elements.clearPresetBtn) {
            this.elements.clearPresetBtn.style.display = 'none';
        }
    },

    showPresetLoading(presetId) {
        const item = document.querySelector(`[data-firmware="${presetId}"]`);
        if (item) {
            item.classList.add('loading');
            const actionIcon = item.querySelector('.preset-action i');
            if (actionIcon) {
                actionIcon.className = 'fas fa-spinner';
            }
        }
    },

    hidePresetLoading(presetId) {
        const item = document.querySelector(`[data-firmware="${presetId}"]`);
        if (item) {
            item.classList.remove('loading');
            const actionIcon = item.querySelector('.preset-action i');
            if (actionIcon) {
                actionIcon.className = 'fas fa-chevron-right';
            }
        }
    },

    showPresetError(presetId) {
        const item = document.querySelector(`[data-firmware="${presetId}"]`);
        if (item) {
            item.classList.remove('selected', 'loading');
            const actionIcon = item.querySelector('.preset-action i');
            if (actionIcon) {
                actionIcon.className = 'fas fa-chevron-right';
            }
        }
        this.hideClearPresetButton();
    },

    updateFlashButton(enabled) {
        this.elements.flashBtn.disabled = !enabled;
    },

    setFlashingState(isFlashing) {
        const { flashBtn, selectDriveBtn, disconnectBtn, clearPresetBtn } = this.elements;
        flashBtn.disabled = isFlashing;
        selectDriveBtn.disabled = isFlashing;
        disconnectBtn.disabled = isFlashing;
        if (clearPresetBtn) clearPresetBtn.disabled = isFlashing;
        
        if (isFlashing) {
            this.showProgress();
            this.startTime = Date.now();
            this.lastBytes = 0;
        } else {
            this.startTime = null;
            this.lastBytes = 0;
        }
    },

    showProgress() {
        this.elements.progressContainer.style.display = 'block';
        this.updateProgress(0, 0, 0);
    },

    updateProgress(percent, loaded, total) {
        this.elements.progressFill.style.width = `${percent}%`;
        this.elements.progressPercent.textContent = `${Math.round(percent)}%`;
        
        if (loaded && total) {
            const speed = this.calculateSpeed(loaded);
            const eta = this.calculateETA(loaded, total);
            this.elements.progressStats.textContent = 
                `${Utils.formatBytes(loaded)} / ${Utils.formatBytes(total)} • ${speed} • Còn ${eta}`;
        } else {
            this.elements.progressStats.textContent = 'Đang chuẩn bị...';
        }
    },

    hideProgress() {
        this.elements.progressContainer.style.display = 'none';
    },

    calculateSpeed(bytes) {
        if (!this.startTime) {
            this.startTime = Date.now();
            this.lastBytes = 0;
        }
        const elapsed = (Date.now() - this.startTime) / 1000;
        if (elapsed === 0) return '0 B/s';
        const speed = bytes / elapsed;
        return `${Utils.formatBytes(speed)}/s`;
    },

    calculateETA(loaded, total) {
        if (!this.startTime || loaded === 0) return '--';
        const elapsed = (Date.now() - this.startTime) / 1000;
        if (elapsed === 0) return '--';
        const speed = loaded / elapsed;
        if (speed === 0) return '--';
        const remaining = (total - loaded) / speed;
        return Utils.formatDuration(remaining);
    },

    setupFirmwareTabs() {
        const tabs = document.querySelectorAll('.firmware-tab');
        const contents = document.querySelectorAll('.firmware-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;
                
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                contents.forEach(c => c.classList.remove('active'));
                document.getElementById(`${tabId}-tab`).classList.add('active');
            });
        });
    },

    setupPresetSelection() {
        const presetList = this.elements.presetList;
        if (!presetList) return;
        
        // Event delegation cho các preset item (vì được render động)
        presetList.addEventListener('click', (e) => {
            const item = e.target.closest('.preset-item');
            if (!item) return;
            
            const firmwareId = item.dataset.firmware;
            
            if (item.classList.contains('selected')) {
                FileHandler.clearPreset();
            } else {
                FileHandler.selectPreset(firmwareId);
            }
        });
        
        // Nút hủy chọn preset
        if (this.elements.clearPresetBtn) {
            this.elements.clearPresetBtn.addEventListener('click', () => {
                FileHandler.clearPreset();
            });
        }
    },

    setupEventListeners() {
        const { selectDriveBtn, disconnectBtn, dropzone, fileInput, clearFileBtn, flashBtn, 
                clearLogBtn, copyLogBtn, downloadLogBtn, guideBtn, guideModal, closeModalBtn } = this.elements;
        
        selectDriveBtn.onclick = () => FileHandler.selectDrive();
        disconnectBtn.onclick = () => FileHandler.clearDrive();
        flashBtn.onclick = () => FlashManager.startFlash();
        clearFileBtn.onclick = () => FileHandler.clearFile();
        
        dropzone.onclick = () => fileInput.click();
        fileInput.onchange = (e) => e.target.files.length && FileHandler.selectFile(e.target.files[0]);
        
        // Drag & Drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
            dropzone.addEventListener(event, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
        
        ['dragenter', 'dragover'].forEach(event => {
            dropzone.addEventListener(event, () => dropzone.classList.add('drag-over'));
        });
        
        ['dragleave', 'drop'].forEach(event => {
            dropzone.addEventListener(event, () => dropzone.classList.remove('drag-over'));
        });
        
        dropzone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                FileHandler.selectFile(files[0]);
            }
        });
        
        clearLogBtn.onclick = () => App.clearLog();
        copyLogBtn.onclick = () => App.copyLog();
        downloadLogBtn.onclick = () => App.downloadLog();
        
        guideBtn.onclick = () => guideModal.classList.add('active');
        closeModalBtn.onclick = () => guideModal.classList.remove('active');
        guideModal.onclick = (e) => {
            if (e.target === guideModal) guideModal.classList.remove('active');
        };
        
        this.setupFirmwareTabs();
        this.setupPresetSelection();
        
        // Ẩn nút hủy chọn ban đầu
        this.hideClearPresetButton();
    }
};