// Mouse position tracking for effects
let mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Custom cursor - DISABLED
// const cursor = document.querySelector('.custom-cursor');

// document.addEventListener('mousedown', () => {
//     cursor.classList.add('clicking');
// });

// document.addEventListener('mouseup', () => {
//     cursor.classList.remove('clicking');
// });

// Boot sequence
let hasVisited = false;

window.addEventListener('load', () => {
    if (!hasVisited) {
        setTimeout(() => {
            document.getElementById('bootScreen').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('bootScreen').style.display = 'none';
                document.getElementById('startScreen').classList.add('show');
                hasVisited = true;
            }, 1000);
        }, 3500);
    } else {
        startComputer();
    }
});

function startComputer() {
    document.getElementById('startScreen').classList.remove('show');
    document.getElementById('desktop').classList.add('show');
    createParticles();
    updateTime();
    setInterval(updateTime, 1000);
}

// Window management
let windowZIndex = 1001;

function openWindow(windowType) {
    const window = document.getElementById(windowType + 'Window');

    // Check if window is minimized and restore it
    if (minimizedWindows.has(windowType)) {
        // Remove minimized state
        minimizedWindows.delete(windowType);

        // Remove dock indicator
        const dockItem = document.querySelector(`[onclick="openWindow('${windowType}')"]`);
        const indicator = dockItem?.querySelector('.minimized-indicator');
        if (indicator) {
            indicator.remove();
        }

        // Restore from original position if available
        if (window.dataset.originalLeft) {
            window.style.left = window.dataset.originalLeft;
            window.style.top = window.dataset.originalTop;
            delete window.dataset.originalLeft;
            delete window.dataset.originalTop;
        }
    } else {
        // Center the window on screen
        const windowWidth = 500; // Default window width
        const windowHeight = 400; // Default window height

        const centerX = (window.innerWidth - windowWidth) / 2;
        const centerY = (window.innerHeight - windowHeight) / 2;

        // Ensure window is not above menu bar
        const finalY = Math.max(40, centerY);

        window.style.left = centerX + 'px';
        window.style.top = finalY + 'px';
        window.style.width = windowWidth + 'px';
        window.style.height = windowHeight + 'px';
    }

    window.classList.add('show');
    window.style.zIndex = windowZIndex++;
}

function closeWindow(windowType) {
    document.getElementById(windowType + 'Window').classList.remove('show');
}

let minimizedWindows = new Set();
let maximizedWindows = new Map();

function minimizeWindow(windowType) {
    const window = document.getElementById(windowType + 'Window');

    // Store current position and size
    const rect = window.getBoundingClientRect();
    window.dataset.originalLeft = rect.left + 'px';
    window.dataset.originalTop = rect.top + 'px';
    window.dataset.originalWidth = rect.width + 'px';
    window.dataset.originalHeight = rect.height + 'px';

    // Animate to dock
    window.style.transition = 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
    window.style.transform = 'scale(0.1) translateY(200px)';
    window.style.opacity = '0';

    setTimeout(() => {
        window.classList.remove('show');
        window.style.transition = '';
        window.style.transform = '';
        window.style.opacity = '';
        minimizedWindows.add(windowType);

        // Add visual indicator to dock
        const dockItem = document.querySelector(`[onclick="openWindow('${windowType}')"]`);
        if (dockItem) {
            dockItem.style.position = 'relative';
            const indicator = document.createElement('div');
            indicator.className = 'minimized-indicator';
            indicator.style.position = 'absolute';
            indicator.style.bottom = '-5px';
            indicator.style.left = '50%';
            indicator.style.transform = 'translateX(-50%)';
            indicator.style.width = '4px';
            indicator.style.height = '4px';
            indicator.style.borderRadius = '50%';
            indicator.style.background = '#FFD60A';
            indicator.style.boxShadow = '0 0 8px rgba(255, 214, 10, 0.6)';
            dockItem.appendChild(indicator);
        }
    }, 500);
}

function maximizeWindow(windowType) {
    const window = document.getElementById(windowType + 'Window');

    if (maximizedWindows.has(windowType)) {
        // Restore to original size and position
        const original = maximizedWindows.get(windowType);
        window.style.width = original.width;
        window.style.height = original.height;
        window.style.left = original.left;
        window.style.top = original.top;
        window.style.transform = original.transform;
        maximizedWindows.delete(windowType);
    } else {
        // Store current state before maximizing
        const rect = window.getBoundingClientRect();
        maximizedWindows.set(windowType, {
            width: window.style.width || 'auto',
            height: window.style.height || 'auto',
            left: window.style.left || rect.left + 'px',
            top: window.style.top || rect.top + 'px',
            transform: window.style.transform || 'none'
        });

        // Maximize
        window.style.width = 'calc(100vw - 20px)';
        window.style.height = 'calc(100vh - 50px)';
        window.style.left = '10px';
        window.style.top = '40px';
        window.style.transform = 'none';
    }
}

// Update time
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    document.getElementById('currentTime').textContent = timeString;
}

// Create floating particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');

    setInterval(() => {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = '0s';
        particle.style.animationDuration = (Math.random() * 3 + 4) + 's';
        particlesContainer.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 7000);
    }, 300);
}

// Make windows draggable
document.querySelectorAll('.window').forEach(window => {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    const header = window.querySelector('.window-header');

    header.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        if (e.target.classList.contains('window-control')) return;

        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (e.target === header || header.contains(e.target)) {
            isDragging = true;
            window.style.zIndex = windowZIndex++;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            // Keep window within bounds
            const maxX = window.innerWidth - window.offsetWidth;
            const maxY = window.innerHeight - window.offsetHeight;

            xOffset = Math.max(0, Math.min(maxX, xOffset));
            yOffset = Math.max(30, Math.min(maxY, yOffset));

            window.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
        }
    }

    function dragEnd() {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }
});

// Add smooth hover effects to dock items
document.querySelectorAll('.dock-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
        item.style.transform = 'translateY(-10px) scale(1.1)';
    });

    item.addEventListener('mouseleave', () => {
        item.style.transform = 'translateY(0) scale(1)';
    });
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Cmd/Ctrl + W to close active window
    if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
        e.preventDefault();
        const activeWindow = document.querySelector('.window.show');
        if (activeWindow) {
            const windowId = activeWindow.id.replace('Window', '');
            closeWindow(windowId);
        }
    }

    // Cmd/Ctrl + M to minimize active window
    if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
        e.preventDefault();
        const activeWindow = [...document.querySelectorAll('.window.show')]
            .sort((a, b) => parseInt(b.style.zIndex || 0) - parseInt(a.style.zIndex || 0))[0];
        if (activeWindow) {
            const windowId = activeWindow.id.replace('Window', '');
            minimizeWindow(windowId);
        }
    }

    // Escape to close all windows
    if (e.key === 'Escape') {
        document.querySelectorAll('.window.show').forEach(window => {
            const windowId = window.id.replace('Window', '');
            closeWindow(windowId);
        });
    }
});

// Add click sound effect simulation
function playClickSound() {
    // Create a subtle visual feedback instead of audio
    const ripple = document.createElement('div');
    ripple.style.position = 'fixed';
    ripple.style.left = mouseX + 'px';
    ripple.style.top = mouseY + 'px';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.5)';
    ripple.style.transform = 'translate(-50%, -50%) scale(0)';
    ripple.style.animation = 'ripple 0.6s ease-out forwards';
    ripple.style.pointerEvents = 'none';
    ripple.style.zIndex = '10001';

    document.body.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add ripple animation
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
            @keyframes ripple {
                0% {
                    transform: translate(-50%, -50%) scale(0);
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -50%) scale(4);
                    opacity: 0;
                }
            }
        `;
document.head.appendChild(rippleStyle);

// Add click effects to interactive elements
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('dock-item') ||
        e.target.classList.contains('window-control') ||
        e.target.classList.contains('profile-pic') ||
        e.target.classList.contains('power-button')) {
        playClickSound();
    }
});

// Add window focus management
document.querySelectorAll('.window').forEach(window => {
    window.addEventListener('mousedown', () => {
        // Remove focus from all windows
        document.querySelectorAll('.window').forEach(w => {
            w.style.filter = 'none';
        });
        // Focus current window
        window.style.zIndex = windowZIndex++;
        window.style.filter = 'brightness(1.05)';
    });
});

// Add resize functionality to windows
document.querySelectorAll('.window').forEach(window => {
    const resizer = document.createElement('div');
    resizer.style.position = 'absolute';
    resizer.style.bottom = '0';
    resizer.style.right = '0';
    resizer.style.width = '20px';
    resizer.style.height = '20px';
    resizer.style.cursor = 'se-resize';
    resizer.style.background = 'linear-gradient(-45deg, transparent 0%, transparent 40%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.2) 100%)';

    window.appendChild(resizer);

    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        e.stopPropagation();
    });

    document.addEventListener('mousemove', (e) => {
        if (isResizing) {
            const rect = window.getBoundingClientRect();
            const newWidth = e.clientX - rect.left;
            const newHeight = e.clientY - rect.top;

            window.style.width = Math.max(400, newWidth) + 'px';
            window.style.height = Math.max(300, newHeight) + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
    });
});

// Add battery and wifi status updates
function updateSystemStatus() {
    const batteryLevel = Math.floor(Math.random() * 30) + 70; // 70-100%
    const wifiStrength = Math.floor(Math.random() * 3) + 1; // 1-3 bars

    const batteryIcon = document.querySelector('.fa-battery-full');
    const wifiIcon = document.querySelector('.fa-wifi');

    // Update battery icon based on level
    if (batteryLevel > 75) {
        batteryIcon.className = 'fas fa-battery-full';
    } else if (batteryLevel > 50) {
        batteryIcon.className = 'fas fa-battery-three-quarters';
    } else if (batteryLevel > 25) {
        batteryIcon.className = 'fas fa-battery-half';
    } else {
        batteryIcon.className = 'fas fa-battery-quarter';
    }

    batteryIcon.title = `Battery: ${batteryLevel}%`;
    wifiIcon.title = `WiFi: Connected`;
}

// Update system status every 30 seconds
setInterval(updateSystemStatus, 30000);
updateSystemStatus();

// Add double-click to maximize windows
document.querySelectorAll('.window-header').forEach(header => {
    let clickCount = 0;
    header.addEventListener('click', (e) => {
        if (e.target.classList.contains('window-control')) return;

        clickCount++;
        if (clickCount === 1) {
            setTimeout(() => {
                if (clickCount === 2) {
                    const windowId = header.parentElement.id.replace('Window', '');
                    maximizeWindow(windowId);
                }
                clickCount = 0;
            }, 300);
        }
    });
});

// Add smooth transitions for all elements
const smoothTransitionStyle = document.createElement('style');
smoothTransitionStyle.textContent = `
            * {
                transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            }
            
            .window {
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            
            .dock-item {
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
        `;
document.head.appendChild(smoothTransitionStyle);

// Prevent context menu for better app-like feel
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Add loading states for windows
function showLoadingWindow(windowType) {
    const window = document.getElementById(windowType + 'Window');
    const content = window.querySelector('.window-content');

    content.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; height: 200px;">
                    <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #007AFF; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                </div>
            `;

    setTimeout(() => {
        // Restore original content (this would normally load from API)
        location.reload(); // Simple refresh to restore content
    }, 1000);
}

// Add spin animation for loading
const spinStyle = document.createElement('style');
spinStyle.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
document.head.appendChild(spinStyle);

console.log('🖥️ Pasan\'s Portfolio System Loaded Successfully!');
console.log('💻 Built with love using pure HTML, CSS & JavaScript');
console.log('🚀 Features: Draggable windows, smooth animations, responsive design');