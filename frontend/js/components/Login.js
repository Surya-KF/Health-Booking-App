export default {
    template: `
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-6 col-lg-5">
                <div class="card shadow-sm mt-5">
                    <div class="card-body p-5">
                        <div class="text-center mb-4">
                            <h2 class="fw-bold">Welcome Back</h2>
                            <p class="text-muted">Sign in to your account</p>
                        </div>
                        
                        <div v-if="error" class="alert alert-danger" role="alert">
                            {{ error }}
                        </div>
                        
                        <form @submit.prevent="login">
                            <div class="mb-3">
                                <label for="email" class="form-label">Email</label>
                                <input type="email" class="form-control" id="email" v-model="email" required>
                            </div>
                            
                            <div class="mb-3">
                                <label for="password" class="form-label">Password</label>
                                <input type="password" class="form-control" id="password" v-model="password" required>
                            </div>
                            
                            <div class="mb-3 form-check">
                                <input type="checkbox" class="form-check-input" id="rememberMe" v-model="rememberMe">
                                <label class="form-check-label" for="rememberMe">Remember me</label>
                            </div>
                            
                            <div class="d-grid gap-2">
                                <button type="submit" class="btn btn-primary" :disabled="loading">
                                    <span v-if="loading">
                                        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        Signing in...
                                    </span>
                                    <span v-else>Sign In</span>
                                </button>
                            </div>
                        </form>
                        
                        <div class="text-center mt-4">
                            <p>Don't have an account? <router-link to="/register">Sign up</router-link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            email: '',
            password: '',
            rememberMe: false,
            loading: false,
            error: null
        }
    },
    methods: {
        async login() {
            this.loading = true;
            this.error = null;
            
            try {
                const response = await axios.post('/api/auth/login', {
                    email: this.email,
                    password: this.password
                });
                
                const { token, user } = response.data;
                
                // Store token and user data
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                
                // Redirect based on user role
                if (user.role === 'doctor') {
                    this.$router.push('/doctor/dashboard');
                } else if (user.role === 'patient') {
                    this.$router.push('/dashboard');
                } else if (user.role === 'admin') {
                    this.$router.push('/admin/dashboard');
                }
            } catch (error) {
                console.error('Login error:', error);
                this.error = error.response?.data?.message || 'Failed to sign in. Please check your credentials.';
            } finally {
                this.loading = false;
            }
        }
    }
}
