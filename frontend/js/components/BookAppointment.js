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
                <h2>Book an Appointment</h2>
                <router-link :to="'/doctors/' + doctorId" class="btn btn-outline-secondary">
                    <i class="bi bi-arrow-left"></i> Back to Doctor Profile
                </router-link>
            </div>
            
            <div class="row">
                <div class="col-lg-4 mb-4">
                    <div class="card">
                        <div class="card-header bg-white">
                            <h5 class="mb-0">Doctor Information</h5>
                        </div>
                        <div class="card-body">
                            <div class="d-flex mb-3">
                                <div class="flex-shrink-0">
                                    <img :src="doctor.profile_image || '/img/default-doctor.png'" 
                                         class="rounded-circle" width="60" height="60" alt="Doctor profile">
                                </div>
                                <div class="ms-3">
                                    <h5 class="mb-0">Dr. {{ doctor.name }}</h5>
                                    <p class="text-muted">{{ doctor.specialization }}</p>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <div class="d-flex align-items-center mb-1">
                                    <div class="me-2">
                                        <i class="bi bi-star-fill text-warning"></i>
                                    </div>
                                    <div>
                                        <strong>{{ doctor.rating || '0.0' }}</strong> 
                                        <span class="text-muted">({{ doctor.reviews_count || 0 }} reviews)</span>
                                    </div>
                                </div>
                                
                                <div class="d-flex align-items-center mb-1">
                                    <div class="me-2">
                                        <i class="bi bi-geo-alt"></i>
                                    </div>
                                    <div>{{ doctor.address || 'Location not specified' }}</div>
                                </div>
                                
                                <div class="d-flex align-items-center">
                                    <div class="me-2">
                                        <i class="bi bi-currency-dollar"></i>
                                    </div>
                                    <div>{{ doctor.consultation_fee ? '$' + doctor.consultation_fee : 'Fee not specified' }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-8">
                    <div class="card">
                        <div class="card-header bg-white">
                            <h5 class="mb-0">Appointment Details</h5>
                        </div>
                        <div class="card-body">
                            <form @submit.prevent="bookAppointment">
                                <div class="mb-4">
                                    <label class="form-label">Appointment Type</label>
                                    <div class="d-flex">
                                        <div class="form-check me-4">
                                            <input class="form-check-input" type="radio" name="appointmentType" 
                                                   id="inPerson" value="false" v-model="isTelemedicine">
                                            <label class="form-check-label" for="inPerson">
                                                <i class="bi bi-hospital me-2"></i> In-Person Visit
                                            </label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="appointmentType" 
                                                   id="telemedicine" value="true" v-model="isTelemedicine">
                                            <label class="form-check-label" for="telemedicine">
                                                <i class="bi bi-camera-video me-2"></i> Video Consultation
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row mb-4">
                                    <div class="col-md-6">
                                        <label for="appointmentDate" class="form-label">Select Date</label>
                                        <input type="date" class="form-control" id="appointmentDate" 
                                               v-model="selectedDate" :min="minDate" @change="fetchAvailableSlots" required>
                                    </div>
                                </div>
                                
                                <div v-if="selectedDate" class="mb-4">
                                    <label class="form-label">Select Time</label>
                                    
                                    <div v-if="loadingSlots" class="text-center py-3">
                                        <div class="spinner-border spinner-border-sm" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                        </div>
                                        <span class="ms-2">Loading available slots...</span>
                                    </div>
                                    
                                    <div v-else-if="availableSlots.length === 0" class="alert alert-info">
                                        No available slots for the selected date. Please choose another date.
                                    </div>
                                    
                                    <div v-else class="row">
                                        <div v-for="slot in availableSlots" :key="slot" class="col-md-3 col-6 mb-2">
                                            <button type="button" class="btn btn-outline-primary w-100" 
                                                    :class="{ active: selectedTime === slot }"
                                                    @click="selectedTime = slot">
                                                {{ slot }}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div v-if="selectedTime" class="form-text text-success mt-2">
                                        <i class="bi bi-check-circle-fill"></i> 
                                        You've selected an appointment on {{ formatDate(selectedDate) }} at {{ selectedTime }}
                                    </div>
                                </div>
                                
                                <div class="mb-4">
                                    <label for="reason" class="form-label">Reason for Visit</label>
                                    <textarea class="form-control" id="reason" rows="3" v-model="reason" 
                                              placeholder="Briefly describe your symptoms or reason for the appointment" required></textarea>
                                </div>
                                
                                <div class="mb-4">
                                    <label class="form-label">Patient Information</label>
                                    <div class="card bg-light">
                                        <div class="card-body">
                                            <div class="row">
                                                <div class="col-md-6 mb-3">
                                                    <div class="fw-bold">Name:</div>
                                                    <div>{{ patient.name }}</div>
                                                </div>
                                                <div class="col-md-6 mb-3">
                                                    <div class="fw-bold">Email:</div>
                                                    <div>{{ patient.email }}</div>
                                                </div>
                                                <div class="col-md-6 mb-3">
                                                    <div class="fw-bold">Phone:</div>
                                                    <div>{{ patient.phone || 'Not provided' }}</div>
                                                </div>
                                                <div class="col-md-6 mb-3">
                                                    <div class="fw-bold">Date of Birth:</div>
                                                    <div>{{ formatDate(patient.dob) || 'Not provided' }}</div>
                                                </div>
                                            </div>
                                            <div class="mt-2">
                                                <router-link to="/profile" class="btn btn-sm btn-outline-secondary">
                                                    Update Profile
                                                </router-link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="d-grid gap-2">
                                    <button type="submit" class="btn btn-primary" 
                                            :disabled="!selectedDate || !selectedTime || bookingInProgress">
                                        <span v-if="bookingInProgress">
                                            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            Booking...
                                        </span>
                                        <span v-else>Confirm Appointment</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            doctorId: '',
            doctor: {},
            patient: {},
            loading: true,
            error: null,
            
            // Booking
            isTelemedicine: "false",
            selectedDate: "",
            selectedTime: "",
            reason: "",
            availableSlots: [],
            loadingSlots: false,
            bookingInProgress: false
        }
    },
    computed: {
        minDate() {
            const today = new Date();
            return today.toISOString().split('T')[0];
        }
    },
    created() {
        this.doctorId = this.$route.params.id;
        
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
            this.$router.push('/login');
            return;
        }
        
        this.fetchDoctorDetails();
        this.fetchPatientProfile();
    },
    methods: {
        async fetchDoctorDetails() {
            this.loading = true;
            this.error = null;
            
            try {
                const response = await axios.get(`/api/doctors/${this.doctorId}`);
                this.doctor = response.data;
            } catch (error) {
                console.error('Error fetching doctor details:', error);
                this.error = 'Failed to load doctor details. Please try again later.';
            } finally {
                this.loading = false;
            }
        },
        
        async fetchPatientProfile() {
            try {
                const token = localStorage.getItem('token');
                
                const response = await axios.get('/api/patients/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                this.patient = response.data;
            } catch (error) {
                console.error('Error fetching patient profile:', error);
            }
        },
        
        formatDate(dateString) {
            if (!dateString) return '';
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        },
        
        async fetchAvailableSlots() {
            if (!this.selectedDate) return;
            
            this.loadingSlots = true;
            this.availableSlots = [];
            this.selectedTime = '';
            
            try {
                const response = await axios.get(`/api/doctors/${this.doctorId}/availability`, {
                    params: {
                        date: this.selectedDate,
                        is_telemedicine: this.isTelemedicine === "true"
                    }
                });
                
                this.availableSlots = response.data.available_slots;
            } catch (error) {
                console.error('Error fetching available slots:', error);
            } finally {
                this.loadingSlots = false;
            }
        },
        async bookAppointment() {
            if (!this.selectedDate || !this.selectedTime) {
                alert('Please select a date and time for your appointment.');
                return;
            }
            
            this.bookingInProgress = true;
            
            try {
                const token = localStorage.getItem('token');
                
                const appointmentData = {
                    doctor_id: this.doctorId,
                    date: this.selectedDate,
                    time: this.selectedTime,
                    is_telemedicine: this.isTelemedicine === "true",
                    reason: this.reason
                };
                
                const response = await axios.post('/api/appointments', appointmentData, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                // Redirect to appointment details page
                this.$router.push(`/appointments/${response.data._id}`);
                
            } catch (error) {
                console.error('Error booking appointment:', error);
                alert('Failed to book appointment. Please try again.');
            } finally {
                this.bookingInProgress = false;
            }
        }
    },
    watch: {
        isTelemedicine() {
            if (this.selectedDate) {
                this.fetchAvailableSlots();
            }
        }
    }
}