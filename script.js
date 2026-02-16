// --- Core Conversion Functions ---
function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) return null;
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return { r, g, b };
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

// Tiny HSL → HEX helper
function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

/**
 * Main update function
 */
function updateConversion(value, source) {
    const hexInput = document.getElementById('hexInput');
    const colorPicker = document.getElementById('colorPicker');
    const colorSwatch = document.getElementById('colorSwatch');
    const hslOutput = document.getElementById('hslOutput');
    const rgbOutput = document.getElementById('rgbOutput');

    let hex = '';

    if (source === 'picker') {
        hex = value.toUpperCase();
        hexInput.value = hex;
    } else {
        hex = hexInput.value.toUpperCase().trim();
        let tempHex = hex.replace(/^#/, '');
        if (tempHex.length === 3 || tempHex.length === 6) {
            colorPicker.value = '#' + tempHex.padEnd(6, '0');
        }
    }

    const fullHex = hex.startsWith('#') ? hex : '#' + hex;
    const rgb = hexToRgb(fullHex);

    if (rgb) {
        const hslObj = rgbToHsl(rgb.r, rgb.g, rgb.b);
        const hsl = `hsl(${hslObj.h}, ${hslObj.s}%, ${hslObj.l}%)`;
        const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

        // Update UI
        colorSwatch.style.backgroundColor = fullHex;
        hslOutput.value = hsl;
        rgbOutput.value = rgbString;
        colorPicker.value = fullHex;

        // Update big overlay text
        document.getElementById('bigHex').textContent = fullHex;
        document.getElementById('bigHsl').textContent = hsl;

        // === PALETTE GENERATION ===
        document.querySelectorAll('.palette-swatch').forEach(swatch => {
            const step = parseInt(swatch.dataset.step);
            const newL = Math.max(0, Math.min(100, hslObj.l + step));
            const paletteHsl = `hsl(${hslObj.h}, ${hslObj.s}%, ${newL}%)`;
            const paletteHex = hslToHex(hslObj.h, hslObj.s, newL);

            swatch.style.backgroundColor = paletteHsl;
            swatch.title = `${paletteHex} • ${newL}% lightness`;

            // Highlight active (base) color
            if (step === 0) swatch.classList.add('active');
            else swatch.classList.remove('active');

            // Click to select this shade
            swatch.onclick = () => {
                hexInput.value = paletteHex;
                updateConversion();
            };
        });

    } else {
        colorSwatch.style.backgroundColor = '#d1d5db';
        hslOutput.value = 'Invalid HEX code...';
        rgbOutput.value = 'Invalid HEX code...';
    }
}

// Copy to clipboard (unchanged)
function copyToClipboard(targetId, button) {
    const text = document.getElementById(targetId).value;
    navigator.clipboard.writeText(text).then(() => {
        const orig = button.textContent;
        button.textContent = 'Copied!';
        button.style.background = '#10b981';
        setTimeout(() => {
            button.textContent = orig;
            button.style.background = '';
        }, 1500);
    });
}

// Init
window.onload = () => updateConversion();