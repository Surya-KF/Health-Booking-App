export default {
    template: `
    <div class="container py-4">
        <div class="row mb-4">
            <div class="col-md-6">
                <h2>Welcome, Dr. {{ user.name }}!</h2>
                <p class="text-muted">Here's an overview of your appointments and patient activities.</p>
            </div>
            <div class="col-md-6 text-md-end">
                <button class="btn btn-outline-primary me-2" @click="toggleAvailability">
                    {{ user.is_available ? 'Set as Unavailable' : 'Set as Available' }}
                </button>
                <router-link to="/profile" class="btn btn-primary">
                    <i class="bi bi-gear me-2"></i> Manage Schedule
                </router-link>
            </div>
        </div>
        
        <!-- Stats Cards -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted mb-1">Today's Appointments</h6>
                                <h3 class="mb-0">{{ todayStats.appointments }}</h3>
                            </div>
                            <div class="bg-light p-3 rounded">
                                <i class="bi bi-calendar-check text-primary" style="font-size: 1.5rem;"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-3">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted mb-1">Pending Appointments</h6>
                                <h3 class="mb-0">{{ stats.pending }}</h3>
                            </div>
                            <div class="bg-light p-3 rounded">
                                <i class="bi bi-hourglass-split text-warning" style="font-size: 1.5rem;"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-3">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted mb-1">Total Patients</h6>
                                <h3 class="mb-0">{{ stats.totalPatients }}</h3>
                            </div>
                            <div class="bg-light p-3 rounded">
                                <i class="bi bi-people text-success" style="font-size: 1.5rem;"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-3">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted mb-1">Average Rating</h6>
                                <h3 class="mb-0">{{ stats.averageRating }}/5</h3>
                            </div>
                            <div class="bg-light p-3 rounded">
                                <i class="bi bi-star-fill text-warning" style="font-size: 1.5rem;"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-8">
                <!-- Today's Appointments -->
                <div class="card mb-4">
                    <div class="card-header bg-white d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Today's Appointments</h5>
                        <router-link to="/appointments" class="btn btn-sm btn-outline-primary">View All</router-link>
                    </div>
                    <div class="card-body">
                        <div v-if="loading" class="text-center py-3">
                            <div class="spinner-border" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                        
                        <div v-else-if="todayAppointments.length === 0" class="text-center py-4">
                            <div class="mb-3">
                                <i class="bi bi-calendar-x" style="font-size: 2rem;"></i>
                            </div>
                            <p class="mb-0">You don't have any appointments scheduled for today.</p>
                        </div>
                        
                        <div v-else>
                            <div v-for="appointment in todayAppointments" :key="appointment._id" 
                                 class="d-flex align-items-start mb-3 pb-3 border-bottom">
                                <div class="flex-shrink-0">
                                    <div class="appointment-time text-center p-2 rounded bg-light">
                                        <div class="fw-bold">{{ appointment.time }}</div>
                                    </div>
                                </div>
                                <div class="ms-3 flex-grow-1">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h6 class="mb-1">{{ appointment.patient?.name }}</h6>
                                            <p class="text-muted mb-1">
                                                {{ getPatientAge(appointment.patient?.dob) }} years
                                                <span v-if="appointment.patient?.gender">, {{ appointment.patient?.gender }}</span>
                                            </p>
                                            <div>
                                                <span :class="getStatusBadgeClass(appointment.status)" class="me-2">
                                                    {{ appointment.status }}
                                                </span>
                                                <span :class="appointment.is_telemedicine ? 'badge bg-info text-dark' : 'badge bg-secondary'">
                                                    {{ appointment.is_telemedicine ? 'Telemedicine' : 'In-person' }}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <button v-if="appointment.status === 'scheduled'" 
                                                    class="btn btn-sm btn-success me-2" 
                                                    @click="startAppointment(appointment._id)">
                                                Start
                                            </button>
                                            <router-link :to="'/appointments/' + appointment._id" class="btn btn-sm btn-outline-primary">
                                                View
                                            </router-link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Upcoming Appointments -->
                <div class="card">
                    <div class="card-header bg-white d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Upcoming Appointments</h5>
                    </div>
                    <div class="card-body">
                        <div v-if="loadingUpcoming" class="text-center py-3">
                            <div class="spinner-border" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                        
                        <div v-else-if="upcomingAppointments.length === 0" class="text-center py-4">
                            <div class="mb-3">
                                <i class="bi bi-calendar" style="font-size: 2rem;"></i>
                            </div>
                            <p class="mb-0">You don't have any upcoming appointments scheduled.</p>
                        </div>
                        
                        <div v-else>
                            <div v-for="appointment in upcomingAppointments" :key="appointment._id" 
                                 class="d-flex align-items-start mb-3 pb-3 border-bottom">
                                <div class="flex-shrink-0">
                                    <div class="appointment-date text-center p-2 rounded bg-light">
                                        <div class="small text-uppercase">{{ formatMonth(appointment.date) }}</div>
                                        <div class="fw-bold fs-4">{{ formatDay(appointment.date) }}</div>
                                    </div>
                                </div>
                                <div class="ms-3 flex-grow-1">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h6 class="mb-1">{{ appointment.patient?.name }}</h6>
                                            <p class="text-muted mb-1">
                                                {{ appointment.time }} • 
                                                {{ appointment.is_telemedicine ? 'Telemedicine' : 'In-person' }}
                                            </p>
                                        </div>
                                        <router-link :to="'/appointments/' + appointment._id" class="btn btn-sm btn-outline-primary">
                                            View
                                        </router-link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-4">
                <!-- Profile Summary -->
                <div class="card mb-4">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">Profile Summary</h5>
                    </div>
                    <div class="card-body">
                        <div class="text-center mb-3">
                            <img :src="user.profile_image || '/img/default-doctor.png'" 
                                 class="rounded-circle" width="80" height="80" alt="Profile">
                            <h5 class="mt-2 mb-0">Dr. {{ user.name }}</h5>
                            <p class="text-muted">{{ user.specialization }}</p>
                            <div>
                                <span class="badge" :class="user.is_available ? 'bg-success' : 'bg-danger'">
                                    {{ user.is_available ? 'Available' : 'Unavailable' }}
                                </span>
                            </div>
                        </div>
                        
                        <div class="mb-2">
                            <div class="text-muted small">Email</div>
                            <div>{{ user.email }}</div>
                        </div>
                        
                        <div class="mb-2">
                            <div class="text-muted small">Phone</div>
                            <div>{{ user.phone || 'Not provided' }}</div>
                        </div>
                        
                        <div class="d-grid gap-2 mt-3">
                            <router-link to="/profile" class="btn btn-outline-primary">
                                <i class="bi bi-pencil me-2"></i> Update Profile
                            </router-link>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Reviews -->
                <div class="card">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">Recent Reviews</h5>
                    </div>
                    <div class="card-body">
                        <div v-if="loadingReviews" class="text-center py-3">
                            <div class="spinner-border" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                        
                        <div v-else-if="recentReviews.length === 0" class="text-center py-4">
                            <div class="mb-3">
                                <i class="bi bi-star" style="font-size: 2rem;"></i>
                            </div>
                            <p class="mb-0">No reviews yet.</p>
                        </div>
                        
                        <div v-else>
                            <div v-for="review in recentReviews" :key="review._id" class="mb-3 pb-3 border-bottom">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <div class="mb-1">
                                            <i v-for="i in 5" :key="i" class="bi" 
                                               :class="i <= review.rating ? 'bi-star-fill text-warning' : 'bi-star'"></i>
                                        </div>
                                        <p class="mb-1">{{ review.comment }}</p>
                                        <p class="text-muted small mb-0">{{ review.patient?.name }} • {{ formatDate(review.created_at) }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            user: {},
            loading: true,
            loadingUpcoming: true,
            loadingReviews: true,
            todayAppointments: [],
            upcomingAppointments: [],
            recentReviews: [],
            todayStats: {
                appointments: 0
            },
            stats: {
                pending: 0,
                totalPatients: 0,
                averageRating: 0
            }
        }
    },
    created() {
        // Get user data from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            this.user = JSON.parse(userData);
        }
        
        this.fetchTodayAppointments();
        this.fetchUpcomingAppointments();
        this.fetchRecentReviews();
        this.fetchStats();
    },
    methods: {
        async fetchTodayAppointments() {
            this.loading = true;
            
            try {
                const token = localStorage.getItem('token');
                const today = new Date().toISOString().split('T')[0];
                
                const response = await axios.get('/api/appointments', {
                    params: {
                        date: today,
                        status: 'scheduled,in-progress'
                    },
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                this.todayAppointments = response.data.appointments;
                this.todayStats.appointments = this.todayAppointments.length;
            } catch (error) {
                console.error('Error fetching today\'s appointments:', error);
            } finally {
                this.loading = false;
            }
        },
        
        async fetchUpcomingAppointments() {
            this.loadingUpcoming = true;
            
            try {
                const token = localStorage.getItem('token');
                
                const response = await axios.get('/api/appointments', {
                    params: {
                        status: 'scheduled,in-progress',
                        date: { $gt: new Date().toISOString().split('T')[0] }
                    },
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                this.upcomingAppointments = response.data.appointments;
            } catch (error) {
                console.error('Error fetching upcoming appointments:', error);
            } finally {
                this.loadingUpcoming = false;
            }
        },
        
        async fetchRecentReviews() {
            this.loadingReviews = true;
            
            try {
                const token = localStorage.getItem('token');
                
                const response = await axios.get('/api/reviews', {
                    params: {
                        doctor_id: this.user._id
                    },
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                this.recentReviews = response.data.reviews;
            } catch (error) {
                console.error('Error fetching recent reviews:', error);
            } finally {
                this.loadingReviews = false;
            }
        },
        
        async fetchStats() {
            try {
                const token = localStorage.getItem('token');
                
                const response = await axios.get('/api/stats', {
                    params: {
                        doctor_id: this.user._id
                    },
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                this.stats = response.data.stats;
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        },
        
        toggleAvailability() {
            this.user.is_available = !this.user.is_available;
        },
        
        getPatientAge(dob) {
            const today = new Date();
            const birthDate = new Date(dob);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDifference = today.getMonth() - birthDate.getMonth();
            if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        },
        
        formatDate(date) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(date).toLocaleDateString(undefined, options);
        },
        
        formatMonth(date) {
            const options = { month: 'short' };
            return new Date(date).toLocaleDateString(undefined, options);
        },
        
        formatDay(date) {
            const options = { day: 'numeric' };
            return new Date(date).toLocaleDateString(undefined, options);
        },
        
        getStatusBadgeClass(status) {
            switch (status) {
                case 'scheduled':
                    return 'badge bg-primary';
                case 'in-progress':
                    return 'badge bg-warning';
                case 'completed':
                    return 'badge bg-success';
                case 'cancelled':
                    return 'badge bg-danger';
                default:
                    return 'badge bg-secondary';
            }
        },
        
        startAppointment(appointmentId) {
            // Logic to start the appointment
        }
    }
}
