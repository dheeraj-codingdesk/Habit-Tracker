// Habit Tracker App - Vanilla JavaScript
class HabitTracker {
    constructor() {
        this.habits = this.loadHabits();
        this.stripe = Stripe('pk_test_your_stripe_publishable_key'); // Replace with your Stripe key
        this.isLoading = false;
        this.init();
        this.addSampleHabits(); // Add sample data for demo
    }

    init() {
        this.setupEventListeners();
        this.renderHabits();
        this.loadTheme();
    }

    setupEventListeners() {
        // Habit form submission
        document.getElementById('habit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addHabit();
        });

        // Generate report button
        document.getElementById('generate-report').addEventListener('click', () => {
            this.generateWeeklyReport();
        });

        // Theme purchase buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.target.closest('.theme-card').dataset.theme;
                const price = e.target.dataset.price;
                this.purchaseTheme(theme, price);
            });
        });
    }

    loadHabits() {
        const stored = localStorage.getItem('habits');
        return stored ? JSON.parse(stored) : [];
    }

    saveHabits() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
    }

    addHabit() {
        const nameInput = document.getElementById('habit-name');
        const descInput = document.getElementById('habit-description');
        
        const name = nameInput.value.trim();
        const description = descInput.value.trim();

        if (!name) return;

        const habit = {
            id: Date.now(),
            name,
            description,
            streak: 0,
            lastCompleted: null,
            createdAt: new Date().toISOString(),
            completedDates: []
        };

        this.habits.push(habit);
        this.saveHabits();
        this.renderHabits();

        // Clear form
        nameInput.value = '';
        descInput.value = '';
    }

    renderHabits() {
        const container = document.getElementById('habits-container');
        container.innerHTML = '';

        if (this.habits.length === 0) {
            container.innerHTML = '<p class="no-habits">No habits yet. Create your first habit above!</p>';
            return;
        }

        this.habits.forEach(habit => {
            const habitElement = this.createHabitElement(habit);
            container.appendChild(habitElement);
        });
    }

    createHabitElement(habit) {
        const div = document.createElement('div');
        div.className = 'habit-item';
        if (habit.streak >= 7) {
            div.classList.add('streak-milestone');
        }
        
        div.innerHTML = `
            <div class="habit-info">
                <h3>${this.escapeHtml(habit.name)}</h3>
                ${habit.description ? `<p>${this.escapeHtml(habit.description)}</p>` : ''}
                <div class="habit-actions">
                    <button class="complete-btn" onclick="habitTracker.completeHabit(${habit.id})" ${this.isCompletedToday(habit) ? 'disabled' : ''}>
                        ${this.isCompletedToday(habit) ? '✓ Completed Today' : 'Mark Complete'}
                    </button>
                    <button class="delete-btn" onclick="habitTracker.deleteHabit(${habit.id})">
                        Delete
                    </button>
                </div>
            </div>
            <div class="habit-stats">
                <div class="streak-count">${habit.streak}</div>
                <div class="streak-label">day streak</div>
                ${habit.streak > 0 ? `<div class="streak-fire">${this.getStreakEmoji(habit.streak)}</div>` : ''}
            </div>
        `;
        return div;
    }

    isCompletedToday(habit) {
        const today = new Date().toDateString();
        return habit.completedDates.includes(today);
    }

    getStreakEmoji(streak) {
        if (streak >= 30) return '🔥🔥🔥';
        if (streak >= 14) return '🔥🔥';
        if (streak >= 7) return '🔥';
        if (streak >= 3) return '✨';
        return '👍';
    }

    showNotification(message, type = 'success') {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }

    completeHabit(id) {
        const habit = this.habits.find(h => h.id === id);
        if (!habit) return;

        const today = new Date().toDateString();
        const lastCompleted = habit.lastCompleted ? new Date(habit.lastCompleted).toDateString() : null;

        // Check if already completed today
        if (lastCompleted === today) {
            this.showNotification('Habit already completed today!', 'info');
            return;
        }

        // Check if this continues a streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        let message = '';
        if (lastCompleted === yesterday.toDateString()) {
            habit.streak++;
            if (habit.streak > 1) {
                message = `Great job! ${habit.streak}-day streak! 🔥`;
            }
        } else {
            habit.streak = 1; // Reset streak
            message = 'Fresh start! 1-day streak begun!';
        }

        habit.lastCompleted = new Date().toISOString();
        habit.completedDates.push(today);

        this.saveHabits();
        this.renderHabits();

        // Show celebration for milestones
        if (habit.streak >= 7) {
            message = `🎉 Amazing! ${habit.streak}-day streak! Keep it up!`;
        } else if (habit.streak >= 3) {
            message = `Awesome! ${habit.streak}-day streak! You're on fire!`;
        }

        if (message) {
            this.showNotification(message, 'success');
        }
    }

    deleteHabit(id) {
        if (confirm('Are you sure you want to delete this habit?')) {
            this.habits = this.habits.filter(h => h.id !== id);
            this.saveHabits();
            this.renderHabits();
        }
    }

    generateWeeklyReport() {
        const reportOutput = document.getElementById('report-output');
        
        if (this.habits.length === 0) {
            reportOutput.innerHTML = '<p>No habits to generate report for.</p>';
            return;
        }

        this.showLoading('report-output', 'Generating your weekly report...');

        setTimeout(() => {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            let totalCompletions = 0;
            let bestStreak = 0;
            let bestHabit = '';

            let reportHtml = '<div class="report-content">';
            reportHtml += '<h3>📊 Weekly Habit Report</h3>';
            reportHtml += '<div class="report-stats">';
            
            this.habits.forEach(habit => {
                const weeklyCompletions = habit.completedDates.filter(date => {
                    const completedDate = new Date(date);
                    return completedDate >= oneWeekAgo;
                }).length;

                totalCompletions += weeklyCompletions;
                if (habit.streak > bestStreak) {
                    bestStreak = habit.streak;
                    bestHabit = habit.name;
                }
            });

            reportHtml += `<div class="stat-card">
                <div class="stat-number">${totalCompletions}</div>
                <div class="stat-label">Total Completions</div>
            </div>`;
            
            reportHtml += `<div class="stat-card">
                <div class="stat-number">${bestStreak}</div>
                <div class="stat-label">Best Streak (${this.escapeHtml(bestHabit)})</div>
            </div>`;
            
            reportHtml += `<div class="stat-card">
                <div class="stat-number">${this.habits.length}</div>
                <div class="stat-label">Active Habits</div>
            </div>`;
            
            reportHtml += '</div>';
            
            reportHtml += '<div class="habit-breakdown">';
            reportHtml += '<h4>🏆 Habit Breakdown</h4>';
            reportHtml += '<ul>';

            this.habits.forEach(habit => {
                const weeklyCompletions = habit.completedDates.filter(date => {
                    const completedDate = new Date(date);
                    return completedDate >= oneWeekAgo;
                }).length;

                const completionRate = Math.round((weeklyCompletions / 7) * 100);
                const status = weeklyCompletions === 7 ? '🟢 Perfect!' : 
                              weeklyCompletions >= 4 ? '🟡 Good' : 
                              weeklyCompletions > 0 ? '🟠 Fair' : '🔴 Needs work';

                reportHtml += `<li>
                    <div class="habit-report-item">
                        <div class="habit-name">${this.escapeHtml(habit.name)}</div>
                        <div class="habit-stats">
                            <span class="completions">${weeklyCompletions}/7 days</span>
                            <span class="rate">${completionRate}%</span>
                            <span class="status">${status}</span>
                            <span class="current-streak">${habit.streak} day streak</span>
                        </div>
                    </div>
                </li>`;
            });

            reportHtml += '</ul>';
            reportHtml += '</div>';
            
            reportHtml += '<div class="report-footer">';
            reportHtml += '<p>Keep up the great work! Every small step counts toward building lasting habits.</p>';
            reportHtml += '</div>';
            
            reportHtml += '</div>';

            reportOutput.innerHTML = reportHtml;

            // Simulate email generation
            this.simulateEmailGeneration(reportHtml);
            this.showNotification('Weekly report generated successfully!', 'success');
        }, 1000); // Simulate loading time
    }

    simulateEmailGeneration(reportHtml) {
        // In a real app, this would send an email via your backend
        console.log('Email report generated:', reportHtml);
        alert('Weekly report generated! (In production, this would be emailed to you)');
    }

    async purchaseTheme(theme, price) {
        try {
            // Create a Stripe checkout session (in production, this would be done via your backend)
            const response = await fetch('/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    theme,
                    price,
                }),
            });

            const { sessionId } = await response.json();
            
            // Redirect to Stripe Checkout
            const { error } = await this.stripe.redirectToCheckout({
                sessionId,
            });

            if (error) {
                console.error('Stripe error:', error);
                alert('Payment failed. Please try again.');
            }
        } catch (err) {
            console.error('Purchase error:', err);
            
            // For demo purposes, simulate successful purchase
            if (confirm(`Purchase ${theme} theme for $${price/100}? (Demo mode)`)) {
                this.activateTheme(theme);
                alert(`${theme} theme activated!`);
            }
        }
    }

    activateTheme(theme) {
        // Remove existing theme classes
        document.body.classList.remove('dark-theme', 'colorful-theme');
        
        // Add new theme class
        if (theme !== 'default') {
            document.body.classList.add(`${theme}-theme`);
        }
        
        // Save theme preference
        localStorage.setItem('theme', theme);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && savedTheme !== 'default') {
            this.activateTheme(savedTheme);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Add sample habits for demonstration
    addSampleHabits() {
        if (this.habits.length === 0) {
            const sampleHabits = [
                {
                    id: 1,
                    name: "Drink 8 glasses of water",
                    description: "Stay hydrated throughout the day",
                    streak: 3,
                    lastCompleted: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                    createdAt: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
                    completedDates: [
                        new Date(Date.now() - 86400000).toDateString(),
                        new Date(Date.now() - 172800000).toDateString(),
                        new Date(Date.now() - 259200000).toDateString()
                    ]
                },
                {
                    id: 2,
                    name: "10 minutes of meditation",
                    description: "Daily mindfulness practice",
                    streak: 1,
                    lastCompleted: new Date(Date.now() - 86400000).toISOString(),
                    createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
                    completedDates: [
                        new Date(Date.now() - 86400000).toDateString()
                    ]
                },
                {
                    id: 3,
                    name: "Read for 20 minutes",
                    description: "Daily reading habit",
                    streak: 0,
                    lastCompleted: null,
                    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
                    completedDates: []
                }
            ];

            this.habits = sampleHabits;
            this.saveHabits();
            this.renderHabits();
        }
    }

    // Show loading state
    showLoading(elementId, message = 'Loading...') {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `<div class="loading">${message}</div>`;
        }
    }

    // Add smooth animations
    animateElement(element, animationClass) {
        element.classList.add(animationClass);
        setTimeout(() => {
            element.classList.remove(animationClass);
        }, 500);
    }
}

// Initialize the app
const habitTracker = new HabitTracker();