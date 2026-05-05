// Utility functions
const Utils = {
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
    },

    formatDuration(seconds) {
        if (!isFinite(seconds) || seconds < 0) return '--';
        if (seconds < 60) return `${Math.ceil(seconds)}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.ceil(seconds % 60)}s`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    },

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    isUf2File(filename) {
        return filename.toLowerCase().endsWith('.uf2');
    },

    validateFileSize(file, maxSizeMB = 10) {
        return file.size <= maxSizeMB * 1024 * 1024;
    }
};