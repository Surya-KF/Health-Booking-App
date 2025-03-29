export default {
    template: `
    <div class="container">
        <h2 class="mb-4">My Appointments</h2>
        
        <div v-if="loading" class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
        
        <div v-else>
            <div class="card mb-4">
                <div class="card-header bg-white">
                    <div class="row align-items-center">
                        <div class="col-md-6">
                            <ul class="nav nav-pills">
                                <li class="nav-item">
                                    <a class="nav-link" :class="{ active: activeTab === 'upcoming' }" href="#" @click.prevent="activeTab = 'upcoming'">
                                        Upcoming
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" :class="{ active: activeTab === 'past' }" href="#" @click.prevent="activeTab = 'past'">
                                        Past
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" :class="{ active: activeTab === 'cancelled' }" href="#" @click.prevent="activeTab = 'cancelled'">
                                        Cancelled
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div class="col-md-6">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Search appointments..." v-model="searchQuery">
                                <button class="btn btn-outline-secondary" type="button">
                                    <i class="bi bi-search"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div v-if="filteredAppointments.length === 0" class="text-center py-5">
                        <div class="mb-3">
                            <i class="bi bi-calendar-x" style="font-size: 3rem;"></i>
                        </div>
                        <h5>No appointments found</h5>
                        <p class="text-muted">{{ getEmptyStateMessage() }}</p>
                        <div v-if="userRole === 'patient' && activeTab === 'upcoming'">
                            <router-link to="/doctors" class="btn btn-primary mt-2">Book an Appointment</router-link>
                        </div>
                    </div>
                    
                    <div v-else>
                        <!-- Calendar View (for upcoming appointments) -->
                        <div v-if="activeTab === 'upcoming' && viewMode === 'calendar'" class="mb-4">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5>{{ currentMonthYear }}</h5>
                                <div>
                                    <button class="btn btn-sm btn-outline-secondary me-2" @click="previousMonth">
                                        <i class="bi bi-chevron-left"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-secondary" @click="nextMonth">
                                        <i class="bi bi-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="calendar-grid">
                                <!-- Calendar implementation would go here -->
                                <p class="text-center text-muted">Calendar view implementation</p>
                            </div>
                        </div>
                        
                        <!-- List View -->
                        <div v-else>
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>{{ userRole === 'patient' ? 'Doctor' : 'Patient' }}</th>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>Type</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="appointment in filteredAppointments" :key="appointment._id">
                                            <td>
                                                <div v-if="userRole === 'patient'">
                                                    Dr. {{ appointment.doctor?.name }}
                                                    <div class="text-muted small">{{ appointment.doctor?.specialization }}</div>
                                                </div>
                                                <div v-else>
                                                    {{ appointment.patient?.name }}
                                                    <div class="text-muted small">{{ getPatientAge(appointment.patient?.dob) }} years</div>
                                                </div>
                                            </td>
                                            <td>{{ formatDate(appointment.date) }}</td>
                                            <td>{{ appointment.time }}</td>
                                            <td>
                                                <span :class="appointment.is_telemedicine ? 'badge bg-info text-dark' : 'badge bg-secondary'">
                                                    {{ appointment.is_telemedicine ? 'Telemedicine' : 'In-person' }}
                                                </span>
                                            </td>
                                            <td>
                                                <span :class="getStatusBadgeClass(appointment.status)">
                                                    {{ appointment.status }}
                                                </span>
                                            </td>
                                            <td>
                                                <div class="btn-group">
                                                    <router-link :to="'/appointments/' + appointment._id" class="btn btn-sm btn-primary">
                                                        View
                                                    </router-link>
                                                    
                                                    <!-- Patient actions -->
                                                    <button v-if="userRole === 'patient' && canCancel(appointment)" 
                                                            class="btn btn-sm btn-outline-danger" 
                                                            @click="cancelAppointment(appointment._id)">
                                                        Cancel
                                                    </button>
                                                    
                                                    <!-- Doctor actions -->
                                                    <button v-if="userRole === 'doctor' && appointment.status === 'scheduled' && isToday(appointment.date)" 
                                                            class="btn btn-sm btn-success" 
                                                            @click="startAppointment(appointment._id)">
                                                        Start
                                                    </button>
                                                    
                                                    <button v-if="userRole === 'doctor' && appointment.status === 'scheduled' && !isToday(appointment.date)" 
                                                            class="btn btn-sm btn-outline-danger" 
                                                            @click="cancelAppointment(appointment._id)">
                                                        Cancel
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            <!-- Pagination -->
                            <nav v-if="totalPages > 1" aria-label="Appointments pagination" class="mt-4">
                                <ul class="pagination justify-content-center">
                                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                        <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Previous</a>
                                    </li>
                                    <li v-for="page in paginationRange" class="page-item" :class="{ active: page === currentPage }">
                                        <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                                    </li>
                                    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                        <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Next</a>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            appointments: [],
            activeTab: 'upcoming',
            searchQuery: '',
            loading: true,
            userRole: '',
            viewMode: 'list', // 'list' or 'calendar'
            currentPage: 1,
            itemsPerPage: 10,
            totalItems: 0,
            totalPages: 0,
            
            // Calendar related data
            currentMonth: new Date().getMonth(),
            currentYear: new Date().getFullYear()
        }
    },
    computed: {
        filteredAppointments() {
            let filtered = [];
            
            // Filter by tab
            if (this.activeTab === 'upcoming') {
                filtered = this.appointments.filter(a => 
                    a.status === 'scheduled' || a.status === 'in-progress'
                );
            } else if (this.activeTab === 'past') {
                filtered = this.appointments.filter(a => 
                    a.status === 'completed' || a.status === 'no-show'
                );
            } else if (this.activeTab === 'cancelled') {
                filtered = this.appointments.filter(a => a.status === 'cancelled');
            }
            
            // Filter by search query
            if (this.searchQuery.trim()) {
                const query = this.searchQuery.toLowerCase();
                filtered = filtered.filter(a => {
                    const doctorName = a.doctor?.name?.toLowerCase() || '';
                    const patientName = a.patient?.name?.toLowerCase() || '';
                    const date = this.formatDate(a.date).toLowerCase();
                    
                    return doctorName.includes(query) || 
                           patientName.includes(query) || 
                           date.includes(query) ||
                           a.time.toLowerCase().includes(query);
                });
            }
            
            return filtered;
        },
        currentMonthYear() {
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
            return `${months[this.currentMonth]} ${this.currentYear}`;
        },
        paginationRange() {
            const range = [];
            const maxVisiblePages = 5;
            
            let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
            
            if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }
            
            for (let i = startPage; i <= endPage; i++) {
                range.push(i);
            }
            
            return range;
        }
    },
    watch: {
        activeTab() {
            this.currentPage = 1;
            this.fetchAppointments();
        },
        searchQuery() {
            this.currentPage = 1;
        }
    },
    created() {
        // Get user role from localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        this.userRole = user?.role || '';
        
        this.fetchAppointments();
    },
    methods: {
        async fetchAppointments() {
            this.loading = true;
            
            try {
                const token = localStorage.getItem('token');
                
                // Construct query parameters
                const params = {
                    page: this.currentPage,
                    limit: this.itemsPerPage,
                    status: this.getStatusFilter()
                };
                
                const response = await axios.get('/api/appointments', {
                    params,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const data = response.data;
                this.appointments = data.appointments;
                this.totalItems = data.total;
                this.totalPages = data.pages;
            } catch (error) {
                console.error('Error fetching appointments:', error);
            } finally {
                this.loading = false;
            }
        },
        getStatusFilter() {
            if (this.activeTab === 'upcoming') {
                return 'scheduled,in-progress';
            } else if (this.activeTab === 'past') {
                return 'completed,no-show';
            } else if (this.activeTab === 'cancelled') {
                return 'cancelled';
            }
            return '';
        },
        formatDate(dateString) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        },
        getStatusBadgeClass(status) {
            const classes = {
                'scheduled': 'badge bg-primary',
                'completed': 'badge bg-success',
                'cancelled': 'badge bg-danger',
                'no-show': 'badge bg-warning text-dark',
                'in-progress': 'badge bg-info text-dark'
            };
            
            return classes[status] || 'badge bg-secondary';
        },
        getPatientAge(dob) {
            if (!dob) return 'N/A';
            
            const birthDate = new Date(dob);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            return age;
        },
        canCancel(appointment) {
            if (!appointment || appointment.status !== 'scheduled') {
                return false;
            }
            
            // Check if appointment is at least 24 hours away
            const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
            const now = new Date();
            const hoursDiff = (appointmentDate - now) / (1000 * 60 * 60);
            
            return hoursDiff >= 24;
        },
        isToday(dateString) {
            const today = new Date();
            const appointmentDate = new Date(dateString);
            
            return today.getDate() === appointmentDate.getDate() &&
                   today.getMonth() === appointmentDate.getMonth() &&
                   today.getFullYear() === appointmentDate.getFullYear();
        },
        async cancelAppointment(appointmentId) {
            if (!confirm('Are you sure you want to cancel this appointment?')) {
                return;
            }
            
            try {
                const token = localStorage.getItem('token');
                
                await axios.put(`/api/appointments/${appointmentId}/cancel`, {}, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                // Refresh appointments
                this.fetchAppointments();
                
                alert('Appointment cancelled successfully.');
            } catch (error) {
                console.error('Error cancelling appointment:', error);
                alert('Failed to cancel appointment. Please try again.');
            }
        },
        
        async startAppointment(appointmentId) {
            try {
                const token = localStorage.getItem('token');
                
                await axios.put(`/api/appointments/${appointmentId}/start`, {}, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                // Redirect to appointment detail page
                this.$router.push(`/appointments/${appointmentId}`);
            } catch (error) {
                console.error('Error starting appointment:', error);
                alert('Failed to start appointment. Please try again.');
            }
        },
        
        changePage(page) {
            if (page < 1 || page > this.totalPages) {
                return;
            }
            
            this.currentPage = page;
            this.fetchAppointments();
        },
        
        previousMonth() {
            if (this.currentMonth === 0) {
                this.currentMonth = 11;
                this.currentYear--;
            } else {
                this.currentMonth--;
            }
        },
        
        nextMonth() {
            if (this.currentMonth === 11) {
                this.currentMonth = 0;
                this.currentYear++;
            } else {
                this.currentMonth++;
            }
        },
        
        getEmptyStateMessage() {
            if (this.activeTab === 'upcoming') {
                return this.userRole === 'patient' 
                    ? 'You don\'t have any upcoming appointments. Book an appointment with a doctor.'
                    : 'You don\'t have any upcoming appointments scheduled.';
            } else if (this.activeTab === 'past') {
                return 'You don\'t have any past appointments.';
            } else {
                return 'You don\'t have any cancelled appointments.';
            }
        }
    }
}