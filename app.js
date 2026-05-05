// Main App Module
const App = {
    init() {
        UI.init();
        UI.setupEventListeners();
        this.checkBrowserSupport();
        this.addLog('🚀 Pico Flasher sẵn sàng', 'success');
        this.addLog('💡 Chọn firmware có sẵn hoặc upload file .uf2', 'info');
    },

    checkBrowserSupport() {
        if (!window.showDirectoryPicker) {
            this.addLog('❌ Trình duyệt không hỗ trợ', 'error');
            this.addLog('💡 Vui lòng dùng Chrome/Edge/Brave', 'error');
            document.getElementById('selectDriveBtn').disabled = true;
        }
    },

    addLog(message, type = 'info') {
        const logDiv = document.getElementById('consoleLog');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        
        const time = new Date().toLocaleTimeString('vi-VN', { hour12: false });
        const icons = { success: '✅', error: '❌', warning: '⚠️', info: '📌' };
        
        entry.innerHTML = `
            <span class="log-time">${time}</span>
            <span class="log-icon">${icons[type] || '📌'}</span>
            <span class="log-message">${message}</span>
        `;
        
        logDiv.appendChild(entry);
        entry.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        if (logDiv.children.length > 50) {
            logDiv.removeChild(logDiv.firstChild);
        }
    },

    clearLog() {
        document.getElementById('consoleLog').innerHTML = '';
        this.addLog('🧹 Đã xóa log', 'info');
    },

    async copyLog() {
        const logs = Array.from(document.querySelectorAll('.log-entry'))
            .map(e => `[${e.querySelector('.log-time').textContent}] ${e.querySelector('.log-message').textContent}`)
            .join('\n');
        
        try {
            await navigator.clipboard.writeText(logs);
            this.addLog('📋 Đã copy log', 'success');
        } catch {
            this.addLog('❌ Không thể copy', 'error');
        }
    },

    downloadLog() {
        const logs = Array.from(document.querySelectorAll('.log-entry'))
            .map(e => `[${e.querySelector('.log-time').textContent}] ${e.querySelector('.log-message').textContent}`)
            .join('\n');
        
        const blob = new Blob([logs], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement('a'), { href: url });
        a.download = `pico-flash-${Date.now()}.log`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.addLog('📥 Đã tải log', 'success');
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});