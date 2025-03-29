export default {
    template: `
    <div class="container">
        <h2 class="mb-4">My Appointments</h2>
        
        <div class="mb-4">
            <ul class="nav nav-tabs">
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
        
        <div v-if="loading" class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
        
        <div v-else>
            <div v-if="filteredAppointments.length === 0" class="alert alert-info">
                No appointments found.
            </div>
            
            <div v-else class="row">
                <div v-for="appointment in filteredAppointments" :key="appointment._id" class="col-md-6 mb-3">
                    <div class="card appointment-card" :class="{ 'completed': appointment.status === 'completed', 'cancelled': appointment.status === 'cancelled' }">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h5 class="card-title">
                                        {{ userRole === 'patient' ? appointment.doctor?.name : appointment.patient?.name }}
                                    </h5>
                                    <h6 class="card-subtitle mb-2 text-muted">
                                        {{ userRole === 'patient' ? appointment.doctor?.specialization : '' }}
                                    </h6>
                                </div>
                                <span class="badge" :class="{
                                    'bg-success': appointment.status === 'completed',
                                    'bg-danger': appointment.status === 'cancelled',
                                    'bg-primary': appointment.status === 'scheduled'
                                }">
                                    {{ appointment.status }}
                                </span>
                            </div>
                            
                            <p class="card-text">
                                <strong>Date:</strong> {{ formatDate(appointment.date) }}<br>
                                <strong>Time:</strong> {{ appointment.time }}<br>
                                <strong>Type:</strong> {{ appointment.is_telemedicine ? 'Telemedicine' : 'In-person' }}
                            </p>
                            
                            <div class="mt-3">
                                <router-link :to="'/appointments/' + appointment._id" class="btn btn-sm btn-primary">
                                    View Details
                                </router-link>
                                
                                <button v-if="appointment.status === 'scheduled'" 
                                        @click="cancelAppointment(appointment._id)" 
                                        class="btn btn-sm btn-danger ms-2">
                                    Cancel
                                </button>
                                
                                <button v-if="userRole === 'doctor' && appointment.status === 'scheduled'" 
                                        @click="completeAppointment(appointment._id)" 
                                        class="btn btn-sm btn-success ms-2">
                                    Complete
                                </button>
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
            appointments: [],
            activeTab: 'upcoming',
            userRole: null,
            loading: false
        }
    },
    computed: {
        filteredAppointments() {
            const today = new Date().setHours(0, 0, 0, 0);
            
            if (this.activeTab === 'upcoming') {
                return this.appointments.filter(appt => 
                    appt.status === 'scheduled' && new Date(appt.date) >= today
                );
            } else if (this.activeTab === 'past') {
                return this.appointments.filter(appt => 
                    appt.status === 'completed' || (appt.status === 'scheduled' && new Date(appt.date) < today)
                );
            } else if (this.activeTab === 'cancelled') {
                return this.appointments.filter(appt => appt.status === 'cancelled');
            }
            
            return this.appointments;
        }
    },
    created() {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        this.userRole = userData.role;
        
        this.fetchAppointments();
    },
    methods: {
        async fetchAppointments() {
            this.loading = true;
            
            try {
                const response = await axios.get('/api/appointments', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                this.appointments = response.data;
            } catch (error) {
                console.error('Error fetching appointments:', error);
            } finally {
                this.loading = false;
            }
        },
        async cancelAppointment(appointmentId) {
            if (!confirm('Are you sure you want to cancel this appointment?')) {
                return;
            }
            
            try {
                await axios.put(`/api/appointments/${appointmentId}/cancel`, {}, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                // Refresh the appointments list
                this.fetchAppointments();
            } catch (error) {
                console.error('Error cancelling appointment:', error);
            }
        },
        async completeAppointment(appointmentId) {
            try {
                await axios.put(`/api/appointments/${appointmentId}/complete`, {}, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                // Refresh the appointments list
                this.fetchAppointments();
            } catch (error) {
                console.error('Error completing appointment:', error);
            }
        },
        formatDate(dateString) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        }
    }
}