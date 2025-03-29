export default {
    template: `
    <nav class="navbar navbar-expand-lg navbar-dark mb-4">
        <div class="container">
            <a class="navbar-brand" href="#">Health Booking System</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item" v-if="isLoggedIn">
                        <router-link class="nav-link" to="/dashboard">Dashboard</router-link>
                    </li>
                    <li class="nav-item" v-if="isLoggedIn && userRole === 'patient'">
                        <router-link class="nav-link" to="/doctors">Find Doctors</router-link>
                    </li>
                    <li class="nav-item" v-if="isLoggedIn">
                        <router-link class="nav-link" to="/appointments">My Appointments</router-link>
                    </li>
                    <li class="nav-item" v-if="isLoggedIn && userRole === 'doctor'">
                        <router-link class="nav-link" to="/availability">My Availability</router-link>
                    </li>
                </ul>
                <ul class="navbar-nav">
                    <li class="nav-item" v-if="!isLoggedIn">
                        <router-link class="nav-link" to="/login">Login</router-link>
                    </li>
                    <li class="nav-item" v-if="!isLoggedIn">
                        <router-link class="nav-link" to="/register">Register</router-link>
                    </li>
                    <li class="nav-item" v-if="isLoggedIn">
                        <router-link class="nav-link" to="/profile">Profile</router-link>
                    </li>
                    <li class="nav-item" v-if="isLoggedIn">
                        <a class="nav-link" href="#" @click.prevent="logout">Logout</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
    `,
    data() {
        return {
            isLoggedIn: false,
            userRole: null
        }
    },
    created() {
        this.checkAuth()
        // Listen for auth changes
        window.addEventListener('auth-changed', this.checkAuth)
    },
    methods: {
        checkAuth() {
            const token = localStorage.getItem('token')
            const userData = JSON.parse(localStorage.getItem('user') || '{}')
            this.isLoggedIn = !!token
            this.userRole = userData.role || null
        },
        logout() {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            // Dispatch event for other components
            window.dispatchEvent(new Event('auth-changed'))
            this.$router.push('/login')
        }
    }
}