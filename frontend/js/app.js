import router from './router.js';

// Global axios configuration
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // Clear local storage and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
        }
        return Promise.reject(error);
    }
);

const app = new Vue({
    el: '#app',
    router,
    data: {
        user: null,
        isLoggedIn: false
    },
    template: `
    <div>
        <!-- Navigation -->
        <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
            <div class="container">
                <router-link class="navbar-brand" to="/">
                    <img src="/img/logo.png" alt="HealthBook" height="40">
                </router-link>
                
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                
                <div class="collapse navbar-collapse" id="navbarNav">
                    <!-- Not logged in -->
                    <ul v-if="!isLoggedIn" class="navbar-nav ms-auto">
                        <li class="nav-item">
                            <router-link class="nav-link" to="/login">Sign In</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link class="nav-link btn btn-primary text-white px-3 ms-2" to="/register">Sign Up</router-link>
                        </li>
                    </ul>
                    
                    <!-- Logged in as Patient -->
                    <ul v-else-if="user && user.role === 'patient'" class="navbar-nav">
                        <li class="nav-item">
                            <router-link class="nav-link" to="/dashboard">Dashboard</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link class="nav-link" to="/appointments">My Appointments</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link class="nav-link" to="/doctors">Find Doctors</router-link>
                        </li>
                    </ul>
                    
                    <!-- Logged in as Doctor -->
                    <ul v-else-if="user && user.role === 'doctor'" class="navbar-nav">
                        <li class="nav-item">
                            <router-link class="nav-link" to="/doctor/dashboard">Dashboard</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link class="nav-link" to="/appointments">Appointments</router-link>
                        </li>
                    </ul>
                    
                    <!-- User dropdown (for logged in users) -->
                    <ul v-if="isLoggedIn" class="navbar-nav ms-auto">
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="navbarDropdown" 
                               role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <img :src="user.profile_image || '/img/default-avatar.png'" 
                                     class="rounded-circle me-2" width="30" height="30" alt="Profile">
                                {{ user.name }}
                            </a>
                            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                                <li>
                                    <router-link class="dropdown-item" to="/profile">
                                        <i class="bi bi-person me-2"></i> My Profile
                                    </router-link>
                                </li>
                                <li><hr class="dropdown-divider"></li>
                                <li>
                                    <a class="dropdown-item" href="#" @click.prevent="logout">
                                        <i class="bi bi-box-arrow-right me-2"></i> Sign Out
                                    </a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
        
        <!-- Main Content -->
        <main>
            <router-view @login-success="updateUserData"></router-view>
        </main>
        
        <!-- Footer -->
        <footer class="bg-light py-4 mt-5">
            <div class="container">
                <div class="row">
                    <div class="col-md-6">
                        <p class="mb-0">© 2023 HealthBook. All rights reserved.</p>
                    </div>
                    <div class="col-md-6 text-md-end">
                        <a href="#" class="text-decoration-none me-3">Privacy Policy</a>
                        <a href="#" class="text-decoration-none me-3">Terms of Service</a>
                        <a href="#" class="text-decoration-none">Contact Us</a>
                    </div>
                </div>
            </div>
        </footer>
    </div>
    `,
    created() {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            this.user = JSON.parse(userData);
            this.isLoggedIn = true;
        }
    },
    methods: {
        logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            this.user = null;
            this.isLoggedIn = false;
            this.$router.push('/login');
        },
        updateUserData(userData) {
            this.user = userData;
            this.isLoggedIn = true;
        }
    }
});
