// Полифилл для crypto.randomUUID если он не доступен
if (typeof crypto !== 'undefined' && typeof crypto.randomUUID !== 'function') {
    crypto.randomUUID = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const toggleSwitch = document.getElementById('notificationToggle');
    const notificationsContainer = document.getElementById('notificationsContainer');
    const container = document.querySelector('.container');
    let notifications = [];
    let notificationInterval;
    let isActive = true;
    let nextZIndex = 100; // Start z-index for notifications higher than CSS default
    let angleHistory = []; // Для отслеживания углов уведомлений по областям

    // Function to get visual viewport height (dvh equivalent)
    function getViewportHeight() {
        return window.innerHeight;
    }

    // App data for random notifications
    const apps = [
        {
            name: 'Instagram',
            icon: 'instagram-icon',
            messages: [
                'liked your photo.',
                'started following you.',
                'commented on your post: "Amazing! 🔥"',
                'mentioned you in their story.',
                'sent you a message.',
                'sent you a reel.',
                'is now following you and 3 others.',
                'commented: "Love this! 💕"',
                'wants to tag you in a post.',
                'is going live now!',
                'shared a post: "Check this out"',
                'replied to your comment: "Thanks!"'
            ]
        },
        {
            name: 'TikTok',
            icon: 'tiktok-icon',
            messages: [
                'Your video is trending!',
                'liked your comment.',
                'replied to your comment.',
                'mentioned you in a video.',
                'New follower alert!',
                'started a LIVE video.',
                'shared your video.',
                'added your sound to their video.',
                'duetted with you!',
                'Your video went viral! 10K views',
                'posted a new video.',
                'commented: "This is everything 😂"'
            ]
        },
        {
            name: 'Facebook',
            icon: 'facebook-icon',
            messages: [
                'tagged you in a post.',
                'commented on your status.',
                'sent you a friend request.',
                'invited you to an event.',
                'went live: "Check out my stream!"',
                'shared a memory with you.',
                'reacted to your photo.',
                'sent you a message.',
                'commented on a post you\'re tagged in.',
                'added a new photo.',
                'wants you to like their page.',
                'is nearby.'
            ]
        }
    ];

    // Names for random notification generation
    const names = [
        'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 
        'Jackson', 'Sophia', 'Lucas', 'Isabella', 'Aiden',
        'Mia', 'Elijah', 'Harper', 'Ethan', 'Amelia',
        'Alex', 'Sofia', 'David', 'Zoe', 'James',
        'Lily', 'Benjamin', 'Charlotte', 'Daniel', 'Grace',
        'Matthew', 'Emily', 'Michael', 'Abigail', 'Jacob'
    ];

    // Random time strings
    const times = [
        'now', '1m ago', '2m ago', '5m ago', 'just now', 
        '3m ago', '1m', '30s ago', 'just now', '4m ago'
    ];

    // Create and add a notification
    function createNotification() {
        if (!isActive) return;
        
        // Create shine animation on random notifications already in view
        if (notifications.length > 0 && Math.random() > 0.7) {
            animateRandomShine();
        }
        
        const app = apps[Math.floor(Math.random() * apps.length)];
        const name = names[Math.floor(Math.random() * names.length)];
        const message = app.messages[Math.floor(Math.random() * app.messages.length)];
        const time = times[Math.floor(Math.random() * times.length)];
        
        // Улучшенное позиционирование для более равномерного распределения
        const viewportWidth = window.innerWidth;
        const viewportHeight = getViewportHeight();
        const safeZoneHeight = viewportHeight - 20; // Account for 20px bottom margin
        
        // Разрешаем уведомлениям частично выходить за пределы экрана
        const extraSpace = 100; // Пикселей дополнительного пространства за пределами экрана
        
        // Увеличиваем размер сетки для более точного размещения
        const gridCols = 5;
        const gridRows = 5; 
        // Используем реальную ширину экрана для размера ячеек, просто добавляем дополнительные ячейки по краям
        const cellWidth = (viewportWidth - 340) / gridCols;
        const cellHeight = (safeZoneHeight * 0.9) / gridRows;
        
        // Создаем матрицу плотности для всего экрана
        let densityMap = Array(gridRows).fill().map(() => Array(gridCols).fill(0));
        
        // Подсчитываем плотность уведомлений в каждой ячейке с учетом соседних ячеек
        notifications.forEach(notif => {
            const rect = notif.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const col = Math.min(Math.floor(centerX / cellWidth), gridCols - 1);
            const row = Math.min(Math.floor(centerY / cellHeight), gridRows - 1);
            
            // Увеличиваем плотность не только для этой ячейки, но и для соседних
            for (let r = Math.max(0, row - 1); r <= Math.min(gridRows - 1, row + 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(gridCols - 1, col + 1); c++) {
                    // Ближайшие ячейки получают больший вес
                    const distance = Math.sqrt(Math.pow(r - row, 2) + Math.pow(c - col, 2));
                    const weight = 1 / (distance + 0.5); // Формула для расчета веса на основе расстояния
                    densityMap[r][c] += weight;
                }
            }
        });
        
        // Находим ячейки с наименьшей плотностью уведомлений
        let minDensity = Infinity;
        let candidateCells = [];
        
        for (let row = 0; row < gridRows; row++) {
            for (let col = 0; col < gridCols; col++) {
                const density = densityMap[row][col];
                
                if (density < minDensity) {
                    minDensity = density;
                    candidateCells = [{row, col}];
                } else if (density === minDensity) {
                    candidateCells.push({row, col});
                }
            }
        }
        
        // Если экран пустой, предпочитаем ячейки, которые находятся ближе к центру или верхним углам
        if (minDensity === 0 && candidateCells.length > 5) {
            // Вычисляем расстояние до важных точек (центр и углы)
            candidateCells = candidateCells.map(cell => {
                // Расстояние до центра
                const centerDistance = Math.sqrt(
                    Math.pow(cell.row - gridRows/2, 2) + 
                    Math.pow(cell.col - gridCols/2, 2)
                );
                
                // Расстояние до верхних углов
                const topLeftDistance = Math.sqrt(
                    Math.pow(cell.row, 2) + 
                    Math.pow(cell.col, 2)
                );
                const topRightDistance = Math.sqrt(
                    Math.pow(cell.row, 2) + 
                    Math.pow(cell.col - (gridCols-1), 2)
                );
                
                // Комбинированный показатель привлекательности ячейки
                // Меньше значение = лучше позиция
                const score = Math.min(
                    centerDistance * 0.8,  // Центр с большим весом
                    topLeftDistance * 1.2,  
                    topRightDistance * 1.2
                );
                
                return {...cell, score};
            });
            
            // Сортируем по оценке и берем только лучшие
            candidateCells.sort((a, b) => a.score - b.score);
            candidateCells = candidateCells.slice(0, 5);
        }
        
        // Случайно выбираем одну из наименее плотных ячеек
        const selectedCell = candidateCells[Math.floor(Math.random() * candidateCells.length)];
        const selectedRow = selectedCell.row;
        const selectedCol = selectedCell.col;
        
        // Корректируем расчет координат, чтобы уведомления не выходили слишком сильно за экран
        // Базовые координаты ячейки
        const baseX = selectedCol * cellWidth;
        const baseY = selectedRow * cellHeight;
        
        // Вычисляем границы для размещения с учетом extraSpace
        // Минимальные координаты не должны быть меньше -extraSpace/3 (чтобы не слишком далеко выходить за экран)
        // Максимальные не должны превышать размер экрана + extraSpace/3
        const minX = Math.max(-extraSpace/3, baseX);
        const minY = Math.max(-extraSpace/3, baseY);
        const maxX = Math.min(viewportWidth - 340 + extraSpace/3, baseX + cellWidth);
        const maxY = Math.min(safeZoneHeight + extraSpace/3, baseY + cellHeight);
        
        // Рассчитываем случайную позицию в пределах безопасных границ
        const randomX = minX + Math.random() * (maxX - minX);
        const randomY = minY + Math.random() * (maxY - minY);
        
        // Определяем уникальные углы для каждой области, избегая повторений
        // Смотрим, какие углы уже используются в этой ячейке
        const usedAngles = angleHistory
            .filter(item => item.cell === selectedCell.row * gridCols + selectedCell.col)
            .map(item => item.angle);
        
        // Генерируем начальный угол, избегая близких к уже использованным
        // Уменьшаем максимальный угол поворота до ±20 градусов (было ±35)
        let initialRotation;
        let attempts = 0;
        do {
            initialRotation = Math.random() * 40 - 20; // Уменьшенный диапазон от -20 до 20 градусов
            attempts++;
            
            // Если слишком много попыток, просто используем случайный угол
            if (attempts > 10) break;
            
            // Проверяем, не слишком ли близко к уже использованным углам
        } while (usedAngles.some(angle => Math.abs(angle - initialRotation) < 15));
        
        // Сохраняем новый угол в истории
        angleHistory.push({
            cell: selectedCell.row * gridCols + selectedCell.col,
            angle: initialRotation
        });
        
        // Ограничиваем размер истории
        if (angleHistory.length > 50) {
            angleHistory.shift();
        }
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.zIndex = nextZIndex++; // Assign and increment z-index
        
        notification.innerHTML = `
            <div class="notification-icon ${app.icon}"></div>
            <div class="notification-content">
                <div class="notification-header">
                    <div class="notification-app">${app.name}</div>
                    <div class="notification-time">${time}</div>
                </div>
                <div class="notification-message"><strong>${name}</strong> ${message}</div>
            </div>
        `;
        
        // Set initial position with absolute positioning
        notification.style.left = randomX + 'px';
        notification.style.top = randomY + 'px';
        notification.style.transform = `rotate(${initialRotation}deg)`;
        notification.style.opacity = '0';
        notification.style.scale = '0.5';
        
        notificationsContainer.appendChild(notification);
        
        // Get actual dimensions after rendering
        const notificationHeight = notification.offsetHeight;
        
        // Remove if it won't fit in the safe zone
        const maxSafeHeight = safeZoneHeight * 0.8;
        if (notificationHeight > maxSafeHeight) {
            notification.remove();
            return;
        }
        
        notifications.push(notification);
        
        // Create appearance effect with tiny particles
        createAppearanceParticles(randomX + notification.offsetWidth/2, randomY + notification.offsetHeight/2);
        
        // Animate the notification with spring physics
        animateNotification(notification, randomX, randomY, initialRotation, notificationHeight, safeZoneHeight);
    }

    // Create particles around a point for appearance effect
    function createAppearanceParticles(x, y) {
        const particleCount = 6 + Math.floor(Math.random() * 6); // 6-12 particles
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random size and opacity
            const size = Math.random() * 4 + 2; // 2-6px
            const opacity = Math.random() * 0.6 + 0.4; // 0.4-1
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.opacity = opacity;
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            
            container.appendChild(particle);
            
            // Animate particles outward in a star pattern
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = 30 + Math.random() * 30;
            const duration = 0.6 + Math.random() * 0.4;
            
            gsap.to(particle, {
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                opacity: 0,
                duration: duration,
                ease: 'power1.out',
                onComplete: () => {
                    particle.remove();
                }
            });
        }
    }

    // Animate a random shine effect on a notification
    function animateRandomShine() {
        if (notifications.length === 0) return;
        
        const randomIndex = Math.floor(Math.random() * notifications.length);
        const notification = notifications[randomIndex];
        
        // Create the animation using GSAP
        gsap.fromTo(notification, 
            { '--shine-position': '-100%' },
            { 
                '--shine-position': '200%',
                duration: 1.5,
                ease: 'power2.inOut',
                onStart: () => {
                    notification.classList.add('shine-active');
                },
                onComplete: () => {
                    notification.classList.remove('shine-active');
                }
            }
        );
    }

    // Animate notification with improved spring physics - make notifications stay on screen
    function animateNotification(notification, x, y, rotation, notificationHeight, safeZoneHeight) {
        // Calculate better random position with more spread across the screen
        const viewportWidth = window.innerWidth;
        const maxBottomY = safeZoneHeight - notificationHeight;
        
        // Calculate final position with more distribution to avoid too much overlap
        const notificationCount = notifications.length;
        const spreadFactor = Math.min(notificationCount * 0.05, 0.7); // Max 0.7
        
        // Simple animation to make notifications appear
        gsap.fromTo(notification, 
            { opacity: 0, scale: 0.5 },
            {
                opacity: 1,
                scale: 1,
                duration: 0.4,
                ease: 'back.out(1.7)',
                onComplete: () => {
                    // Применяем более разнообразные углы поворота
                    // 70% шанс на обычный поворот, 30% шанс на больший поворот
                    let finalRotation;
                    if (Math.random() > 0.7) {
                        // Уменьшаем больший поворот: от -15 до 15 градусов от текущего (было ±25)
                        finalRotation = rotation + (Math.random() * 30 - 15);
                    } else {
                        // Обычный поворот: от -5 до 5 градусов от текущего (было ±6)
                        finalRotation = rotation + (Math.random() * 10 - 5);
                    }
                    
                    // Добавляем только поворот, без смещения
                    gsap.to(notification, {
                        rotation: finalRotation,
                        duration: 0.8,
                        ease: 'power1.inOut'
                    });
                }
            }
        );
    }

    // Handle toggle switch with enhanced effects
    toggleSwitch.addEventListener('change', () => {
        if (toggleSwitch.checked) {
            // Toggle is ON - clear notifications with enhanced "burst" effect
            isActive = false;
            clearInterval(notificationInterval);
            
            // Create explosion particles in the center of the screen
            createExplosionEffect();
            
            // Make all notifications burst simultaneously
            notifications.forEach((notification) => {
                const notificationRect = notification.getBoundingClientRect();
                const centerX = notificationRect.left + notificationRect.width / 2;
                const centerY = notificationRect.top + notificationRect.height / 2;
                
                // Create a burst of particles at the notification's position
                createBurstParticles(centerX, centerY, 15 + Math.floor(Math.random() * 10));
            });
            
            // Animate all notifications bursting simultaneously
            gsap.to(notifications, {
                scale: 0,
                opacity: 0,
                duration: 0.3,
                ease: "back.in(2)",
                stagger: 0, // Одновременное исчезновение
                onComplete: () => {
                    // Удаляем все уведомления
                    notifications.forEach(notification => notification.remove());
                    notifications = [];
                }
            });
        } else {
            // Toggle is OFF - start generating notifications
            isActive = true;
            
            // Reset z-index counter
            nextZIndex = 100;
            
            // Start generating new notifications
            startNotifications();
        }
    });
    
    // Create an explosion effect in the center
    function createExplosionEffect() {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const particleCount = 40 + Math.floor(Math.random() * 20);
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random size and opacity
            const size = Math.random() * 6 + 2; // 2-8px
            const opacity = Math.random() * 0.8 + 0.2; // 0.2-1
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.opacity = opacity;
            particle.style.left = `${centerX}px`;
            particle.style.top = `${centerY}px`;
            
            container.appendChild(particle);
            
            // Animate particles outward in all directions
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = 50 + Math.random() * 350;
            const duration = 1 + Math.random() * 1.5;
            
            gsap.to(particle, {
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                opacity: 0,
                duration: duration,
                ease: 'power2.out',
                onComplete: () => {
                    particle.remove();
                }
            });
        }
    }
    
    // Create particles for a burst effect when a notification disappears
    function createBurstParticles(x, y, count) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random size and opacity
            const size = Math.random() * 6 + 2; // 2-8px
            const opacity = Math.random() * 0.8 + 0.2; // 0.2-1
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.opacity = opacity;
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            
            container.appendChild(particle);
            
            // Animate particles outward in a star pattern
            const angle = (i / count) * Math.PI * 2;
            const distance = 30 + Math.random() * 70;
            const duration = 0.5 + Math.random() * 0.7;
            
            gsap.to(particle, {
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                opacity: 0,
                duration: duration,
                ease: 'power2.out',
                onComplete: () => {
                    particle.remove();
                }
            });
        }
    }

    // Start generating notifications
    function startNotifications() {
        // Generate first few notifications immediately
        for (let i = 0; i < 5; i++) {
            setTimeout(() => createNotification(), i * 300);
        }
        
        // Generate notifications periodically with a reasonable limit
        notificationInterval = setInterval(() => {
            // Allow more notifications to build up, only limit at a high number for performance safety
            if (notifications.length < 100) {
                createNotification();
            }
        }, 1000); // Slightly slower interval to allow more build-up
    }

    // Update on resize
    window.addEventListener('resize', () => {
        const viewportHeight = getViewportHeight();
        const safeZoneHeight = viewportHeight - 20; // Account for 20px bottom margin
        
        // Update existing notifications to respect new viewport height
        notifications.forEach(notification => {
            const notificationHeight = notification.offsetHeight;
            const topPos = parseFloat(notification.style.top) || 0;
            const transformY = gsap.getProperty(notification, "y") || 0;
            const bottomEdge = topPos + transformY + notificationHeight;
            
            // If exceeding the safe zone, adjust to safe position
            if (bottomEdge > safeZoneHeight) {
                const safeBottomPosition = safeZoneHeight - notificationHeight;
                const newY = safeBottomPosition - topPos;
                
                gsap.to(notification, {
                    y: newY,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        });
    });
    
    // Start generating notifications when page loads
    startNotifications();
}); 