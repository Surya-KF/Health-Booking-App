export default {
    template: `
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-8 col-lg-6">
                <div class="card shadow-sm my-5">
                    <div class="card-body p-5">
                        <div class="text-center mb-4">
                            <h2 class="fw-bold">Create an Account</h2>
                            <p class="text-muted">Join our healthcare platform</p>
                        </div>
                        
                        <div v-if="error" class="alert alert-danger" role="alert">
                            {{ error }}
                        </div>
                        
                        <form @submit.prevent="register">
                            <div class="mb-3">
                                <label class="form-label">Account Type</label>
                                <div class="d-flex">
                                    <div class="form-check me-4">
                                        <input class="form-check-input" type="radio" name="accountType" 
                                               id="patientType" value="patient" v-model="accountType" checked>
                                        <label class="form-check-label" for="patientType">
                                            Patient
                                        </label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="accountType" 
                                               id="doctorType" value="doctor" v-model="accountType">
                                        <label class="form-check-label" for="doctorType">
                                            Doctor
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="name" class="form-label">Full Name</label>
                                <input type="text" class="form-control" id="name" v-model="name" required>
                            </div>
                            
                            <div class="mb-3">
                                <label for="email" class="form-label">Email</label>
                                <input type="email" class="form-control" id="email" v-model="email" required>
                            </div>
                            
                            <div v-if="accountType === 'doctor'" class="mb-3">
                                <label for="specialization" class="form-label">Specialization</label>
                                <select class="form-select" id="specialization" v-model="specialization" required>
                                    <option value="">Select Specialization</option>
                                    <option v-for="spec in specializations" :key="spec" :value="spec">{{ spec }}</option>
                                </select>
                            </div>
                            
                            <div class="mb-3">
                                <label for="password" class="form-label">Password</label>
                                <input type="password" class="form-control" id="password" v-model="password" 
                                       required minlength="8">
                                <div class="form-text">Password must be at least 8 characters long</div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="confirmPassword" class="form-label">Confirm Password</label>
                                <input type="password" class="form-control" id="confirmPassword" 
                                       v-model="confirmPassword" required>
                                <div v-if="password && confirmPassword && password !== confirmPassword" 
                                     class="text-danger mt-1">
                                    Passwords do not match
                                </div>
                            </div>
                            
                            <div class="mb-3 form-check">
                                <input type="checkbox" class="form-check-input" id="termsAgreed" 
                                       v-model="termsAgreed" required>
                                <label class="form-check-label" for="termsAgreed">
                                    I agree to the <a href="#" @click.prevent="showTerms">Terms and Conditions</a>
                                </label>
                            </div>
                            
                            <div class="d-grid gap-2">
                                <button type="submit" class="btn btn-primary" 
                                        :disabled="loading || !isFormValid">
                                    <span v-if="loading">
                                        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        Creating account...
                                    </span>
                                    <span v-else>Create Account</span>
                                </button>
                            </div>
                        </form>
                        
                        <div class="text-center mt-4">
                            <p>Already have an account? <router-link to="/login">Sign in</router-link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            accountType: 'patient',
            name: '',
            email: '',
            specialization: '',
            password: '',
            confirmPassword: '',
            termsAgreed: false,
            loading: false,
            error: null,
            specializations: [
                'Cardiology',
                'Dermatology',
                'Endocrinology',
                'Gastroenterology',
                'Neurology',
                'Obstetrics and Gynecology',
                'Oncology',
                'Ophthalmology',
                'Orthopedics',
                'Pediatrics',
                'Psychiatry',
                'Pulmonology',
                'Radiology',
                'Urology'
            ]
        }
    },
    computed: {
        isFormValid() {
            return this.name && 
                   this.email && 
                   this.password && 
                   this.password === this.confirmPassword && 
                   this.termsAgreed && 
                   (this.accountType !== 'doctor' || this.specialization);
        }
    },
    methods: {
        async register() {
            if (!this.isFormValid) return;
            
            this.loading = true;
            this.error = null;
            
            try {
                const userData = {
                    name: this.name,
                    email: this.email,
                    password: this.password,
                    role: this.accountType
                };
                
                if (this.accountType === 'doctor') {
                    userData.specialization = this.specialization;
                }
                
                const response = await axios.post('/api/auth/register', userData);
                
                // Automatically log in the user
                const loginResponse = await axios.post('/api/auth/login', {
                    email: this.email,
                    password: this.password
                });
                
                const { token, user } = loginResponse.data;
                
                // Store token and user data
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                
                // Redirect to complete profile page
                this.$router.push('/complete-profile');
                
            } catch (error) {
                console.error('Registration error:', error);
                this.error = error.response?.data?.message || 'Failed to create account. Please try again.';
            } finally {
                this.loading = false;
            }
        },
        
        showTerms() {
            alert('Terms and Conditions would be displayed here.');
        }
    }
}
