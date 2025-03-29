export default {
    template: `
    <div class="container py-4">
        <div class="row mb-4">
            <div class="col-md-6">
                <h2>Welcome, {{ user.name }}!</h2>
                <p class="text-muted">Here's an overview of your health appointments and activities.</p>
            </div>
            <div class="col-md-6 text-md-end">
                <router-link to="/doctors" class="btn btn-primary">
                    <i class="bi bi-plus-circle me-2"></i> Book New Appointment
                </router-link>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-8">
                <!-- Upcoming Appointments -->
                <div class="card mb-4">
                    <div class="card-header bg-white d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Upcoming Appointments</h5>
                        <router-link to="/appointments" class="btn btn-sm btn-outline-primary">View All</router-link>
                    </div>
                    <div class="card-body">
                        <div v-if="loading" class="text-center py-3">
                            <div class="spinner-border" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                        
                        <div v-else-if="upcomingAppointments.length === 0" class="text-center py-4">
                            <div class="mb-3">
                                <i class="bi bi-calendar-x" style="font-size: 2rem;"></i>
                            </div>
                            <p class="mb-0">You don't have any upcoming appointments.</p>
                            <router-link to="/doctors" class="btn btn-primary mt-2">Book an Appointment</router-link>
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
                                            <h6 class="mb-1">Dr. {{ appointment.doctor?.name }}</h6>
                                            <p class="text-muted mb-1">{{ appointment.doctor?.specialization }}</p>
                                            <div>
                                                <span class="badge bg-primary me-2">{{ appointment.time }}</span>
                                                <span :class="appointment.is_telemedicine ? 'badge bg-info text-dark' : 'badge bg-secondary'">
                                                    {{ appointment.is_telemedicine ? 'Telemedicine' : 'In-person' }}
                                                </span>
                                            </div>
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
                
                <!-- Recent Medical Records -->
                <div class="card">
                    <div class="card-header bg-white d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Recent Medical Records</h5>
                    </div>
                    <div class="card-body">
                        <div v-if="loadingRecords" class="text-center py-3">
                            <div class="spinner-border" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                        
                        <div v-else-if="recentRecords.length === 0" class="text-center py-4">
                            <div class="mb-3">
                                <i class="bi bi-file-earmark-medical" style="font-size: 2rem;"></i>
                            </div>
                            <p class="mb-0">No recent medical records found.</p>
                        </div>
                        
                        <div v-else>
                            <div v-for="record in recentRecords" :key="record._id" class="mb-3 pb-3 border-bottom">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h6 class="mb-1">{{ record.diagnosis || 'Consultation' }}</h6>
                                        <p class="text-muted mb-1">Dr. {{ record.doctor?.name }} • {{ formatDate(record.date) }}</p>
                                    </div>
                                    <router-link :to="'/appointments/' + record.appointment_id" class="btn btn-sm btn-outline-secondary">
                                        View Details
                                    </router-link>
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
                            <img :src="user.profile_image || '/img/default-avatar.png'" 
                                 class="rounded-circle" width="80" height="80" alt="Profile">
                            <h5 class="mt-2 mb-0">{{ user.name }}</h5>
                            <p class="text-muted small">Patient ID: {{ user._id }}</p>
                        </div>
                        
                        <div class="mb-2">
                            <div class="text-muted small">Email</div>
                            <div>{{ user.email }}</div>
                        </div>
                        
                        <div class="mb-2">
                            <div class="text-muted small">Phone</div>
                            <div>{{ user.phone || 'Not provided' }}</div>
                        </div>
                        
                        <div class="mb-2">
                            <div class="text-muted small">Date of Birth</div>
                            <div>{{ formatDate(user.dob) || 'Not provided' }}</div>
                        </div>
                        
                        <div class="d-grid gap-2 mt-3">
                            <router-link to="/profile" class="btn btn-outline-primary">
                                <i class="bi bi-pencil me-2"></i> Update Profile
                            </router-link>
                        </div>
                    </div>
                </div>
                
                <!-- Health Tips -->
                <div class="card">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">Health Tips</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3 pb-3 border-bottom">
                            <h6>Stay Hydrated</h6>
                            <p class="mb-0 small">Drinking enough water each day is crucial for many reasons: to regulate body temperature, keep joints lubricated, prevent infections, deliver nutrients to cells, and keep organs functioning properly.</p>
                        </div>
                        
                        <div class="mb-3 pb-3 border-bottom">
                            <h6>Regular Exercise</h6>
                            <p class="mb-0 small">Aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous aerobic activity a week, or a combination of both.</p>
                        </div>
                        
                        <div>
                            <h6>Balanced Diet</h6>
                            <p class="mb-0 small">Eat a variety of foods, including fruits, vegetables, lean proteins, whole grains, and healthy fats to get a wide range of nutrients.</p>
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
            loadingRecords: true,
            upcomingAppointments: [],
            recentRecords: []
        }
    },
    created() {
        // Get user data from localStorage
        const userData = localStorage.getItem('user')
        if (userData) {
            this.user = JSON.parse(userData)
        }
        
        this.fetchUpcomingAppointments()
        this.fetch
    },
    methods: {
        async fetchDashboardData() {
            this.loading = true
            
            try {
                // Get user role from localStorage or from API
                const token = localStorage.getItem('token')
                const user = JSON.parse(localStorage.getItem('user'))
                this.userRole = user?.role || ''
                
                // Fetch dashboard data based on user role
                const response = await axios.get(`/api/dashboard/${this.userRole}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                
                const data = response.data
                
                // Set stats
                this.stats = data.stats
                
                // Set appointments data based on user role
                if (this.userRole === 'patient') {
                    this.nextAppointment = data.next_appointment
                    this.recentAppointments = data.recent_appointments
                } else if (this.userRole === 'doctor') {
                    this.todayAppointments = data.today_appointments
                    this.upcomingAppointments = data.upcoming_appointments
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error)
            } finally {
                this.loading = false
            }
        },
        formatDate(dateString) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' }
            return new Date(dateString).toLocaleDateString(undefined, options)
        },
        getStatusBadgeClass(status) {
            const classes = {
                'scheduled': 'badge bg-primary',
                'completed': 'badge bg-success',
                'cancelled': 'badge bg-danger',
                'no-show': 'badge bg-warning text-dark',
                'in-progress': 'badge bg-info text-dark'
            }
            
            return classes[status] || 'badge bg-secondary'
        },
        canCancel(appointment) {
            if (!appointment || appointment.status !== 'scheduled') {
                return false
            }
            
            // Check if appointment is at least 24 hours away
            const appointmentDate = new Date(`${appointment.date}T${appointment.time}`)
            const now = new Date()
            const hoursDiff = (appointmentDate - now) / (1000 * 60 * 60)
            
            return hoursDiff >= 24
        },
        async cancelAppointment(appointmentId) {
            if (!confirm('Are you sure you want to cancel this appointment?')) {
                return
            }
        }
    }
}