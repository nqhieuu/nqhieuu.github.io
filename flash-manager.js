// Flash management module
const FlashManager = {
    isFlashing: false,

    async startFlash() {
        const drive = FileHandler.getSelectedDrive();
        const file = FileHandler.getSelectedFile();

        if (!drive) {
            App.addLog('❌ Chưa kết nối Pi Pico', 'error');
            return;
        }

        if (!file) {
            App.addLog('❌ Chưa chọn firmware', 'error');
            return;
        }

        if (this.isFlashing) {
            App.addLog('⏳ Đang flash, vui lòng đợi...', 'warning');
            return;
        }

        this.isFlashing = true;
        UI.setFlashingState(true);
        UI.showProgress();

        try {
            App.addLog(`🚀 Bắt đầu flash: ${file.name}`, 'info');
            
            // Read file
            UI.updateProgress(10, 0, file.size);
            const fileData = await file.arrayBuffer();
            App.addLog(`✅ Đã đọc ${Utils.formatBytes(fileData.byteLength)}`, 'success');
            
            // Create file on Pico
            UI.updateProgress(20, 0, file.size);
            const picoFile = await drive.getFileHandle('firmware.uf2', { create: true });
            
            // Write data
            UI.updateProgress(30, 0, file.size);
            const writable = await picoFile.createWritable();
            
            const chunkSize = 16384;
            let offset = 0;
            
            while (offset < fileData.byteLength) {
                const chunk = fileData.slice(offset, Math.min(offset + chunkSize, fileData.byteLength));
                await writable.write(chunk);
                offset += chunk.byteLength;
                
                const percent = 30 + (offset / fileData.byteLength * 70);
                UI.updateProgress(
                    Math.floor(percent), 
                    offset,
                    fileData.byteLength
                );
                
                await Utils.delay(10);
            }
            
            await writable.close();
            
            UI.updateProgress(100, fileData.byteLength, fileData.byteLength);
            App.addLog(`✅ FLASH THÀNH CÔNG!`, 'success');
            App.addLog(`🎉 Pi Pico sẽ tự động reset`, 'success');
            
            await Utils.delay(2000);
            
            UI.hideProgress();
            UI.setFlashingState(false);
            UI.updateFlashButton(true);
            
        } catch (error) {
            App.addLog(`❌ Lỗi flash: ${error.message}`, 'error');
            UI.hideProgress();
            UI.setFlashingState(false);
            UI.updateFlashButton(true);
        } finally {
            this.isFlashing = false;
        }
    }
};