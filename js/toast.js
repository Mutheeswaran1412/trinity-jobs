// Toast notification system
function showToast(message, type = 'success') {
    const existingToast = document.getElementById('toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
    
    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-blue-500 text-white'
    };
    
    toast.className += ` ${colors[type] || colors.success}`;
    toast.innerHTML = `
        <div class="flex items-center">
            <span>${message}</span>
            <button onclick="closeToast()" class="ml-4 text-white hover:text-gray-200">×</button>
        </div>
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.remove('translate-x-full'), 100);
    setTimeout(() => closeToast(), 4000);
}

function closeToast() {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.classList.add('translate-x-full');
        setTimeout(() => toast.remove(), 300);
    }
}