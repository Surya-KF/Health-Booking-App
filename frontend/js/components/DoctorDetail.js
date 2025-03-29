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
                <h2>Doctor Profile</h2>
                <router-link to="/doctors" class="btn btn-outline-secondary">
                    <i class="bi bi-arrow-left"></i> Back to Doctors
                </router-link>
            </div>
            
            <div class="row">
                <div class="col-md-4 mb-4">
                    <div class="card">
                        <div class="card-body text-center">
                            <img :src="doctor.profile_image || '/img/default-doctor.png'" 
                                 class="rounded-circle mb-3" width="150" height="150" alt="Doctor profile">
                            
                            <h4>Dr. {{ doctor.name }}</h4>
                            <p class="text-muted">{{ doctor.specialization }}</p>
                            
                            <div class="d-flex justify-content-center mb-3">
                                <div class="me-2">
                                    <i class="bi bi-star-fill text-warning"></i>
                                    <strong>{{ doctor.rating || '0.0' }}</strong>
                                </div>
                                <div class="text-muted">({{ doctor.reviews_count || 0 }} reviews)</div>
                            </div>
                            
                            <div class="d-grid gap-2">
                                <button class="btn btn-primary" @click="scrollToBooking">
                                    Book Appointment
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card mt-4">
                        <div class="card-header bg-white">
                            <h5 class="mb-0">Contact Information</h5>
                        </div>
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-3">
                                <div class="me-3">
                                    <i class="bi bi-envelope" style="font-size: 1.2rem;"></i>
                                </div>
                                <div>
                                    <div class="text-muted small">Email</div>
                                    <div>{{ doctor.email }}</div>
                                </div>
                            </div>
                            
                            <div class="d-flex align-items-center mb-3">
                                <div class="me-3">
                                    <i class="bi bi-telephone" style="font-size: 1.2rem;"></i>
                                </div>
                                <div>
                                    <div class="text-muted small">Phone</div>
                                    <div>{{ doctor.phone || 'Not available' }}</div>
                                </div>
                            </div>
                            
                            <div class="d-flex align-items-center">
                                <div class="me-3">
                                    <i class="bi bi-geo-alt" style="font-size: 1.2rem;"></i>
                                </div>
                                <div>
                                    <div class="text-muted small">Address</div>
                                    <div>{{ doctor.address || 'Not available' }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-8">
                    <div class="card mb-4">
                        <div class="card-header bg-white">
                            <h5 class="mb-0">About Dr. {{ doctor.name }}</h5>
                        </div>
                        <div class="card-body">
                            <p>{{ doctor.bio || 'No biography available.' }}</p>
                            
                            <hr>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <h6>Education</h6>
                                    <ul class="list-unstyled">
                                        <li v-for="(edu, index) in doctor.education" :key="index" class="mb-2">
                                            <div class="fw-bold">{{ edu.degree }}</div>
                                            <div class="text-muted">{{ edu.institution }}, {{ edu.year }}</div>
                                        </li>
                                        <li v-if="!doctor.education || doctor.education.length === 0">
                                            <div class="text-muted">No education information available</div>
                                        </li>
                                    </ul>
                                </div>
                                
                                <div class="col-md-6 mb-3">
                                    <h6>Experience</h6>
                                    <ul class="list-unstyled">
                                        <li v-for="(exp, index) in doctor.experience" :key="index" class="mb-2">
                                            <div class="fw-bold">{{ exp.position }}</div>
                                            <div class="text-muted">{{ exp.institution }}, {{ exp.duration }}</div>
                                        </li>
                                        <li v-if="!doctor.experience || doctor.experience.length === 0">
                                            <div class="text-muted">No experience information available</div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            
                            <hr>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <h6>Specialties</h6>
                                    <div v-if="doctor.specialties && doctor.specialties.length > 0">
                                        <span v-for="specialty in doctor.specialties" :key="specialty" 
                                              class="badge bg-light text-dark me-2 mb-2">
                                            {{ specialty }}
                                        </span>
                                    </div>
                                    <div v-else class="text-muted">No specialties listed</div>
                                </div>
                                
                                <div class="col-md-6 mb-3">
                                    <h6>Languages</h6>
                                    <div v-if="doctor.languages && doctor.languages.length > 0">
                                        <span v-for="language in doctor.languages" :key="language" 
                                              class="badge bg-light text-dark me-2 mb-2">
                                            {{ language }}
                                        </span>
                                    </div>
                                    <div v-else class="text-muted">No languages listed</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card mb-4">
                        <div class="card-header bg-white">
                            <h5 class="mb-0">Reviews</h5>
                        </div>
                        <div class="card-body">
                            <div v-if="reviews.length === 0" class="text-center py-4">
                                <div class="mb-3">
                                    <i class="bi bi-chat-square-text" style="font-size: 2rem;"></i>
                                </div>
                                <p class="text-muted">No reviews yet</p>
                            </div>
                            
                            <div v-else>
                                <div v-for="review in reviews" :key="review._id" class="mb-4">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <div class="d-flex align-items-center">
                                            <img :src="review.patient?.profile_image || '/img/default-patient.png'" 
                                                 class="rounded-circle me-2" width="40" height="40" alt="Patient profile">
                                            <div>
                                                <div class="fw-bold">{{ review.patient?.name || 'Anonymous' }}</div>
                                                <div class="text-muted small">{{ formatDate(review.created_at) }}</div>
                                            </div>
                                        </div>
                                        <div>
                                            <i v-for="i in 5" :key="i" class="bi" 
                                               :class="i <= review.rating ? 'bi-star-fill text-warning' : 'bi-star'"></i>
                                        </div>
                                    </div>
                                    <p>{{ review.comments }}</p>
                                    <hr v-if="!review.isLast">
                                </div>
                                
                                <div v-if="totalReviews > reviewsPerPage" class="text-center mt-3">
                                    <button class="btn btn-outline-primary" @click="loadMoreReviews" 
                                            :disabled="reviews.length >= totalReviews">
                                        Load More Reviews
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="booking-section" class="card">
                        <div class="card-header bg-white">
                            <h5 class="mb-0">Book an Appointment</h5>
                        </div>
                        <div class="card-body">
                            <div v-if="!isLoggedIn" class="text-center py-4">
                                <div class="mb-3">
                                    <i class="bi bi-lock" style="font-size: 2rem;"></i>
                                </div>
                                <h5>Login Required</h5>
                                <p class="text-muted">Please login to book an appointment with Dr. {{ doctor.name }}</p>
                                <router-link to="/login" class="btn btn-primary mt-2">Login</router-link>
                            </div>
                            
                            <div v-else>
                                <div class="mb-4">
                                    <h6>Select Appointment Type</h6>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input" type="radio" name="appointmentType" 
                                               id="inPerson" value="false" v-model="isTelemedicine">
                                        <label class="form-check-label" for="inPerson">In-Person</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input" type="radio" name="appointmentType" 
                                               id="telemedicine" value="true" v-model="isTelemedicine">
                                        <label class="form-check-label" for="telemedicine">Telemedicine</label>
                                    </div>
                                </div>
                                
                                <div class="mb-4">
                                    <h6>Select Date</h6>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <input type="date" class="form-control" v-model="selectedDate" 
                                                   :min="minDate" @change="fetchAvailableSlots">
                                        </div>
                                    </div>
                                </div>
                                
                                <div v-if="selectedDate" class="mb-4">
                                    <h6>Select Time</h6>
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
                                            <button class="btn btn-outline-primary w-100" 
                                                    :class="{ active: selectedTime === slot }"
                                                    @click="selectedTime = slot">
                                                {{ slot }}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div v-if="selectedDate && selectedTime" class="mb-4">
                                    <h6>Reason for Visit</h6>
                                    <textarea class="form-control" rows="3" v-model="reason" 
                                              placeholder="Briefly describe your symptoms or reason for the appointment"></textarea>
                                </div>
                                
                                <div v-if="selectedDate && selectedTime" class="d-grid gap-2">
                                    <button class="btn btn-primary" @click="bookAppointment" :disabled="bookingInProgress">
                                        <span v-if="bookingInProgress">
                                            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            Booking...
                                        </span>
                                        <span v-else>Confirm Appointment</span>
                                    </button>
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
            doctor: {},
            reviews: [],
            loading: true,
            error: null,
            
            // Reviews pagination
            reviewsPage: 1,
            reviewsPerPage: 3,
            totalReviews: 0,
            
            // Booking
            isLoggedIn: false,
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
        // Check if user is logged in
        const token = localStorage.getItem('token');
        this.isLoggedIn = !!token;
        
        this.fetchDoctorDetails();
        this.fetchReviews();
    },
    methods: {
        async fetchDoctorDetails() {
            this.loading = true;
            this.error = null;
            
            try {
                const doctorId = this.$route.params.id;
                const response = await axios.get(`/api/doctors/${doctorId}`);
                this.doctor = response.data;
            } catch (error) {
                console.error('Error fetching doctor details:', error);
                this.error = 'Failed to load doctor details. Please try again later.';
            } finally {
                this.loading = false;
            }
        },
        
        async fetchReviews() {
            try {
                const doctorId = this.$route.params.id;
                const response = await axios.get(`/api/doctors/${doctorId}/reviews`, {
                    params: {
                        page: this.reviewsPage,
                        limit: this.reviewsPerPage
                    }
                });
                
                const data = response.data;
                
                // Mark the last review to avoid showing a divider
                if (data.reviews.length > 0) {
                    data.reviews[data.reviews.length - 1].isLast = true;
                }
                
                this.reviews = [...this.reviews, ...data.reviews];
                this.totalReviews = data.total;
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        },
        
        loadMoreReviews() {
            this.reviewsPage++;
            this.fetchReviews();
        },
        
        formatDate(dateString) {
            if (!dateString) return '';
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        },
        
        scrollToBooking() {
            const element = document.getElementById('booking-section');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        },
        
        async fetchAvailableSlots() {
            if (!this.selectedDate) return;
            
            this.loadingSlots = true;
            this.availableSlots = [];
            this.selectedTime = '';
            
            try {
                const doctorId = this.$route.params.id;
                const response = await axios.get(`/api/doctors/${doctorId}/availability`, {
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
                const doctorId = this.$route.params.id;
                
                const appointmentData = {
                    doctor_id: doctorId,
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
