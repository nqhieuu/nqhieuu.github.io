// File handling module
const FileHandler = {
    selectedFile: null,
    selectedDrive: null,
    selectedPreset: null,
    
    // TẤT CẢ THÔNG TIN FIRMWARE QUẢN LÝ TẬP TRUNG TẠI ĐÂY
    firmwareCatalog: [
        {
            id: 'demonic_svj',
            name: 'Demonic SVJ',
            icon: 'fa-brands fa-battle-net',
            description: 'Phần mềm học tập và nghiên cứu tín hiệu không dây',
            version: 'v1.0.0',
            tags: ['3x E01 2G4M27D', '3x NRF24L01+PA+LNA'],
            size: '205.00KB',
            url: '\\firmware\\demonic_svj.uf2',
            featured: true
        },
        {
            id: 'demonic_svx',
            name: 'Demonic SVX',
            icon: 'fa-brands fa-battle-net',
            description: 'Phần mềm học tập và nghiên cứu tín hiệu không dây',
            version: 'v1.0.0',
            tags: ['2x E01 2G4M27D', '2x NRF24L01+PA+LNA'],
            size: '201.00KB',
            url: '\\firmware\\demonic_svx.uf2',
            featured: true
        },
        {
            id: 'demonic',
            name: 'Demonic',
            icon: 'fa-brands fa-battle-net',
            description: 'Phần mềm học tập và nghiên cứu tín hiệu không dây',
            version: 'v1.22.2',
            tags: ['2x E01 2G4M27D', '2x NRF24L01+PA+LNA'],
            size: '166.50KB',
            url: '\\firmware\\demonic.uf2',
            featured: true
        },
        {
            id: 'original',
            name: 'Original',
            icon: 'fa-solid fa-rotate-right',
            description: 'Phần mềm nguyên bản',
            version: 'v1.0.0',
            tags: [],
            size: '144.50KB',
            url: '\\firmware\\original.uf2',
            featured: true
        }
    ],
    
    // Lấy danh sách firmware (có thể lọc theo featured)
    getFirmwareList(featuredOnly = false) {
        if (featuredOnly) {
            return this.firmwareCatalog.filter(fw => fw.featured);
        }
        return this.firmwareCatalog;
    },
    
    // Tìm firmware theo ID
    getFirmwareById(id) {
        return this.firmwareCatalog.find(fw => fw.id === id);
    },

    async selectPreset(presetId) {
        const preset = this.getFirmwareById(presetId);
        if (!preset) return false;

        try {
            App.addLog(`📦 Đang tải: ${preset.name} ${preset.version}`, 'info');
            UI.showPresetLoading(presetId);
            
            const response = await fetch(preset.url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const blob = await response.blob();
            const file = new File([blob], `${presetId}.uf2`, { type: 'application/octet-stream' });
            
            if (!Utils.validateFileSize(file)) {
                throw new Error('File quá lớn (>10MB)');
            }
            
            this.selectedFile = file;
            this.selectedPreset = presetId;
            
            UI.selectPresetItem(presetId);
            UI.updateFlashButton(this.selectedDrive !== null);
            
            App.addLog(`✅ ${preset.name} ${preset.version} (${Utils.formatBytes(file.size)})`, 'success');
            return true;
        } catch (error) {
            App.addLog(`❌ Lỗi tải ${preset.name}: ${error.message}`, 'error');
            UI.showPresetError(presetId);
            return false;
        } finally {
            UI.hidePresetLoading(presetId);
        }
    },

    clearPreset() {
        this.selectedFile = null;
        this.selectedPreset = null;
        UI.clearPresetSelection();
        UI.updateFlashButton(false);
        App.addLog('🗑️ Đã bỏ chọn firmware', 'warning');
    },

    async selectDrive() {
        if (!window.showDirectoryPicker) {
            App.addLog('❌ Trình duyệt không hỗ trợ File System API', 'error');
            return false;
        }

        try {
            const dirHandle = await window.showDirectoryPicker();
            
            let isPico = false;
            try {
                await dirHandle.getFileHandle('INFO_UF2.TXT');
                isPico = true;
            } catch (e) {}

            if (isPico) {
                this.selectedDrive = dirHandle;
                UI.updateDeviceStatus(true, dirHandle.name);
                UI.updateFlashButton(this.selectedFile !== null);
                App.addLog(`✅ Đã kết nối Pi Pico (${dirHandle.name})`, 'success');
                return true;
            } else {
                App.addLog(`⚠️ Ổ ${dirHandle.name} không phải Pi Pico bootloader`, 'warning');
                return false;
            }
        } catch (e) {
            if (e.name !== 'AbortError') {
                App.addLog(`❌ Lỗi: ${e.message}`, 'error');
            }
            return false;
        }
    },

    clearDrive() {
        this.selectedDrive = null;
        UI.updateDeviceStatus(false);
        UI.updateFlashButton(false);
        App.addLog('🔌 Đã ngắt kết nối', 'warning');
    },

    async selectFile(file) {
        if (!Utils.isUf2File(file.name)) {
            App.addLog(`❌ File "${file.name}" không phải .uf2`, 'error');
            return false;
        }

        if (!Utils.validateFileSize(file)) {
            App.addLog(`❌ File "${file.name}" quá lớn (>10MB)`, 'error');
            return false;
        }

        if (this.selectedPreset) {
            UI.clearPresetSelection();
            this.selectedPreset = null;
        }

        this.selectedFile = file;
        UI.updateFileInfo(file.name, Utils.formatBytes(file.size));
        UI.updateFlashButton(this.selectedDrive !== null);
        
        App.addLog(`📂 Đã chọn: ${file.name} (${Utils.formatBytes(file.size)})`, 'success');
        return true;
    },

    clearFile() {
        this.selectedFile = null;
        UI.hideFileInfo();
        UI.updateFlashButton(false);
        App.addLog('🗑️ Đã bỏ chọn file', 'warning');
    },

    getSelectedDrive() {
        return this.selectedDrive;
    },

    getSelectedFile() {
        return this.selectedFile;
    },
    
    getSelectedFirmwareInfo() {
        if (this.selectedPreset) {
            return this.getFirmwareById(this.selectedPreset);
        }
        return null;
    }
};