export default {
    template: `
    <div class="container">
        <div v-if="loading" class="text-center my-5">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
        
        <div v-else-if="error" class="alert alert-danger my-5">
            {{ error }}
        </div>
        
        <div v-else>
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Appointment Details</h2>
                <router-link to="/appointments" class="btn btn-outline-secondary">
                    <i class="bi bi-arrow-left"></i> Back to Appointments
                </router-link>
            </div>
            
            <div class="card mb-4">
                <div class="card-header bg-white">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                            <span :class="getStatusBadgeClass(appointment.status)" class="me-2">
                                {{ appointment.status }}
                            </span>
                            {{ userRole === 'patient' ? 'Appointment with Dr. ' + appointment.doctor?.name : 'Appointment with ' + appointment.patient?.name }}
                        </h5>
                        
                        <div>
                            <!-- Patient actions -->
                            <button v-if="userRole === 'patient' && canCancel(appointment)" 
                                    class="btn btn-outline-danger" 
                                    @click="cancelAppointment()">
                                Cancel Appointment
                            </button>
                            
                            <!-- Doctor actions -->
                            <button v-if="userRole === 'doctor' && appointment.status === 'scheduled' && isToday(appointment.date)" 
                                    class="btn btn-success me-2" 
                                    @click="startAppointment()">
                                Start Appointment
                            </button>
                            
                            <button v-if="userRole === 'doctor' && appointment.status === 'in-progress'" 
                                    class="btn btn-primary me-2" 
                                    @click="completeAppointment()">
                                Complete Appointment
                            </button>
                            
                            <button v-if="userRole === 'doctor' && appointment.status === 'scheduled' && !isToday(appointment.date)" 
                                    class="btn btn-outline-danger" 
                                    @click="cancelAppointment()">
                                Cancel Appointment
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6 class="mb-3">Appointment Information</h6>
                            <table class="table table-borderless">
                                <tbody>
                                    <tr>
                                        <th scope="row" class="ps-0">Date:</th>
                                        <td>{{ formatDate(appointment.date) }}</td>
                                    </tr>
                                    <tr>
                                        <th scope="row" class="ps-0">Time:</th>
                                        <td>{{ appointment.time }}</td>
                                    </tr>
                                    <tr>
                                        <th scope="row" class="ps-0">Type:</th>
                                        <td>
                                            <span :class="appointment.is_telemedicine ? 'badge bg-info text-dark' : 'badge bg-secondary'">
                                                {{ appointment.is_telemedicine ? 'Telemedicine' : 'In-person' }}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row" class="ps-0">Reason:</th>
                                        <td>{{ appointment.reason || 'Not specified' }}</td>
                                    </tr>
                                    <tr v-if="appointment.is_telemedicine && appointment.status === 'in-progress'">
                                        <th scope="row" class="ps-0">Video Link:</th>
                                        <td>
                                            <a :href="appointment.video_link" target="_blank" class="btn btn-sm btn-primary">
                                                <i class="bi bi-camera-video me-1"></i> Join Video Call
                                            </a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="col-md-6">
                            <h6 class="mb-3">{{ userRole === 'patient' ? 'Doctor' : 'Patient' }} Information</h6>
                            <div v-if="userRole === 'patient'" class="d-flex mb-3">
                                <div class="flex-shrink-0">
                                    <img :src="appointment.doctor?.profile_image || '/img/default-doctor.png'" 
                                         class="rounded-circle" width="60" height="60" alt="Doctor profile">
                                </div>
                                <div class="ms-3">
                                    <h5 class="mb-0">Dr. {{ appointment.doctor?.name }}</h5>
                                    <p class="text-muted">{{ appointment.doctor?.specialization }}</p>
                                </div>
                            </div>
                            
                            <div v-else class="d-flex mb-3">
                                <div class="flex-shrink-0">
                                    <img :src="appointment.patient?.profile_image || '/img/default-patient.png'" 
                                         class="rounded-circle" width="60" height="60" alt="Patient profile">
                                </div>
                                <div class="ms-3">
                                    <h5 class="mb-0">{{ appointment.patient?.name }}</h5>
                                    <p class="text-muted">
                                        {{ getPatientAge(appointment.patient?.dob) }} years old
                                        <span v-if="appointment.patient?.gender">, {{ appointment.patient?.gender }}</span>
                                    </p>
                                </div>
                            </div>
                            
                            <table class="table table-borderless">
                                <tbody v-if="userRole === 'patient'">
                                    <tr>
                                        <th scope="row" class="ps-0">Email:</th>
                                        <td>{{ appointment.doctor?.email }}</td>
                                    </tr>
                                    <tr>
                                        <th scope="row" class="ps-0">Phone:</th>
                                        <td>{{ appointment.doctor?.phone || 'Not available' }}</td>
                                    </tr>
                                    <tr>
                                        <th scope="row" class="ps-0">Address:</th>
                                        <td>{{ appointment.doctor?.address || 'Not available' }}</td>
                                    </tr>
                                </tbody>
                                
                                <tbody v-else>
                                    <tr>
                                        <th scope="row" class="ps-0">Email:</th>
                                        <td>{{ appointment.patient?.email }}</td>
                                    </tr>
                                    <tr>
                                        <th scope="row" class="ps-0">Phone:</th>
                                        <td>{{ appointment.patient?.phone || 'Not available' }}</td>
                                    </tr>
                                    <tr>
                                        <th scope="row" class="ps-0">Emergency Contact:</th>
                                        <td>{{ appointment.patient?.emergency_contact || 'Not available' }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <!-- Medical Notes (Doctor only) -->
                    <div v-if="userRole === 'doctor'" class="mt-4">
                        <h6 class="mb-3">Medical Notes</h6>
                        
                        <div v-if="appointment.status === 'scheduled'">
                            <div class="alert alert-info">
                                Medical notes can be added once the appointment has started.
                            </div>
                        </div>
                        
                        <div v-else>
                            <div class="mb-3">
                                <label for="medicalNotes" class="form-label">Notes</label>
                                <textarea class="form-control" id="medicalNotes" rows="4" 
                                          v-model="medicalNotes" 
                                          :disabled="appointment.status === 'completed' || appointment.status === 'cancelled'"></textarea>
                            </div>
                            
                            <div class="mb-3">
                                <label for="diagnosis" class="form-label">Diagnosis</label>
                                <input type="text" class="form-control" id="diagnosis" 
                                       v-model="diagnosis" 
                                       :disabled="appointment.status === 'completed' || appointment.status === 'cancelled'">
                            </div>
                            
                            <div class="mb-3">
                                <label for="prescription" class="form-label">Prescription</label>
                                <textarea class="form-control" id="prescription" rows="3" 
                                          v-model="prescription" 
                                          :disabled="appointment.status === 'completed' || appointment.status === 'cancelled'"></textarea>
                            </div>
                            
                            <div v-if="appointment.status === 'in-progress'" class="d-grid gap-2">
                                <button class="btn btn-primary" @click="saveMedicalNotes" :disabled="savingNotes">
                                    <span v-if="savingNotes">
                                        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        Saving...
                                    </span>
                                    <span v-else>Save Medical Notes</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Medical Records (Patient view) -->
                    <div v-if="userRole === 'patient' && (appointment.status === 'completed' || appointment.status === 'in-progress') && appointment.medical_notes">
                        <div class="mt-4">
                            <h6 class="mb-3">Medical Records</h6>
                            
                            <div class="card bg-light">
                                <div class="card-body">
                                    <div v-if="appointment.diagnosis" class="mb-3">
                                        <h6>Diagnosis</h6>
                                        <p>{{ appointment.diagnosis }}</p>
                                    </div>
                                    
                                    <div v-if="appointment.medical_notes" class="mb-3">
                                        <h6>Doctor's Notes</h6>
                                        <p>{{ appointment.medical_notes }}</p>
                                    </div>
                                    
                                    <div v-if="appointment.prescription">
                                        <h6>Prescription</h6>
                                        <p>{{ appointment.prescription }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Add review section for completed appointments (Patient only) -->
            <div v-if="userRole === 'patient' && appointment.status === 'completed' && !appointment.has_review" class="card">
                <div class="card-header bg-white">
                    <h5 class="mb-0">Leave a Review</h5>
                </div>
                <div class="card-body">
                    <form @submit.prevent="submitReview">
                        <div class="mb-3">
                            <label class="form-label">Rating</label>
                            <div>
                                <div class="rating">
                                    <i v-for="i in 5" :key="i" class="bi" 
                                       :class="i <= rating ? 'bi-star-fill text-warning' : 'bi-star'" 
                                       style="font-size: 1.5rem; cursor: pointer;"
                                       @click="rating = i"></i>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="reviewComments" class="form-label">Comments</label>
                            <textarea class="form-control" id="reviewComments" rows="3" v-model="reviewComments" required></textarea>
                        </div>
                        
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-primary" :disabled="submittingReview || rating === 0">
                                <span v-if="submittingReview">
                                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Submitting...
                                </span>
                                <span v-else>Submit Review</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            appointment: {},
            loading: true,
            error: null,
            userRole: '',
            
            // Medical notes (doctor only)
            medicalNotes: '',
            diagnosis: '',
            prescription: '',
            savingNotes: false,
            
            // Review (patient only)
            rating: 0,
            reviewComments: '',
            submittingReview: false
        }
    },
    created() {
        // Get user role from localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        this.userRole = user?.role || '';
        
        this.fetchAppointmentDetails();
    },
    methods: {
        async fetchAppointmentDetails() {
            this.loading = true;
            this.error = null;
            
            try {
                const token = localStorage.getItem('token');
                const appointmentId = this.$route.params.id;
                
                const response = await axios.get(`/api/appointments/${appointmentId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                this.appointment = response.data;
                
                // Initialize medical notes if available
                if (this.userRole === 'doctor') {
                    this.medicalNotes = this.appointment.medical_notes || '';
                    this.diagnosis = this.appointment.diagnosis || '';
                    this.prescription = this.appointment.prescription || '';
                }
            } catch (error) {
                console.error('Error fetching appointment details:', error);
                this.error = 'Failed to load appointment details. Please try again later.';
            } finally {
                this.loading = false;
            }
        },
        formatDate(dateString) {
            if (!dateString) return '';
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        },
        getStatusBadgeClass(status) {
            const classes = {
                'scheduled': 'badge bg-primary',
                'in-progress': 'badge bg-warning',
                'completed': 'badge bg-success',
                'cancelled': 'badge bg-danger'
            }
            return classes[status] || 'badge bg-secondary'
        }
    }
}
