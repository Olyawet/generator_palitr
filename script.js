// Генерация случайного цвета в hex
function getRandomColor() {
    const hex = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
    return `#${hex}`;
}

// Определение контрастного цвета текста (чёрный или белый)
function getContrastYIQ(hexcolor) {
    hexcolor = hexcolor.replace('#', '');
    const r = parseInt(hexcolor.substr(0,2),16);
    const g = parseInt(hexcolor.substr(2,2),16);
    const b = parseInt(hexcolor.substr(4,2),16);
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? '#222' : '#fff';
}

// Генерация палитры из 3-5 цветов
function generatePalette() {
    const count = Math.floor(Math.random() * 3) + 3; // 3-5
    const colors = [];
    for (let i = 0; i < count; i++) {
        colors.push(getRandomColor());
    }
    return colors;
}

// Отрисовка палитры
function renderPalette(colors) {
    const palette = document.getElementById('palette');
    palette.innerHTML = '';
    colors.forEach(color => {
        const block = document.createElement('div');
        block.className = 'color-block';
        block.style.background = color;
        const code = document.createElement('div');
        code.className = 'color-code';
        code.textContent = color;
        code.style.color = getContrastYIQ(color);
        block.appendChild(code);
        block.addEventListener('click', () => {
            copyToClipboard(color);
            block.classList.add('copied');
            setTimeout(() => block.classList.remove('copied'), 700);
        });
        palette.appendChild(block);
    });
}

// Копирование текста в буфер
function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
}

// Копирование всей палитры
function copyPalette(colors) {
    copyToClipboard(colors.join(', '));
}

// Сохранение палитры в localStorage
function savePalette(colors) {
    let saved = JSON.parse(localStorage.getItem('palettes') || '[]');
    saved.unshift(colors);
    if (saved.length > 10) saved = saved.slice(0, 10); // максимум 10 палитр
    localStorage.setItem('palettes', JSON.stringify(saved));
    renderSavedPalettes();
}

// Отрисовка сохранённых палитр
function renderSavedPalettes() {
    const container = document.getElementById('saved-palettes');
    container.innerHTML = '';
    const saved = JSON.parse(localStorage.getItem('palettes') || '[]');
    if (saved.length === 0) return;
    const title = document.createElement('h2');
    title.textContent = 'Сохранённые палитры';
    container.appendChild(title);
    saved.forEach(colors => {
        const row = document.createElement('div');
        row.className = 'saved-palette';
        colors.forEach(color => {
            const block = document.createElement('div');
            block.className = 'color-block';
            block.style.background = color;
            block.title = color;
            block.addEventListener('click', () => copyToClipboard(color));
            row.appendChild(block);
        });
        container.appendChild(row);
    });
}

// Экспорт палитры в PNG
function exportPaletteToPNG(colors) {
    const width = 90 * colors.length;
    const height = 120;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    colors.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.fillRect(i * 90, 0, 90, height);
        // Код цвета
        ctx.font = '16px Segoe UI, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = getContrastYIQ(color);
        ctx.fillText(color, i * 90 + 45, height - 10);
    });
    const link = document.createElement('a');
    link.download = 'palette.png';
    link.href = canvas.toDataURL();
    link.click();
}

// Запрет контекстного меню
document.addEventListener('contextmenu', e => e.preventDefault());

// Запрет выделения текста (кроме цветовых кодов)
document.addEventListener('selectstart', e => {
    if (!e.target.classList.contains('color-code')) {
        e.preventDefault();
    }
});

// Запрет перетаскивания элементов
document.addEventListener('dragstart', e => e.preventDefault());

// --- Основная логика ---
let currentColors = [];

// Показываем только сохранённые палитры при загрузке
renderSavedPalettes();

document.getElementById('generate').onclick = () => {
    currentColors = generatePalette();
    renderPalette(currentColors);
};
document.getElementById('save').onclick = () => {
    if (currentColors.length > 0) {
        savePalette(currentColors);
    }
};
document.getElementById('export').onclick = () => {
    if (currentColors.length > 0) {
        exportPaletteToPNG(currentColors);
    }
};
document.getElementById('copy-palette').onclick = () => {
    if (currentColors.length > 0) {
        copyPalette(currentColors);
    }
};

document.getElementById('reset-palettes').onclick = () => {
    if (confirm('Вы уверены, что хотите сбросить все сохранённые палитры? Это действие нельзя отменить.')) {
        localStorage.removeItem('palettes');
        renderSavedPalettes();
    }
};
