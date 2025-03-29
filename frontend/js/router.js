import AppointmentList from './components/AppointmentList.js';
import AppointmentDetail from './components/AppointmentDetail.js';
import DoctorList from './components/DoctorList.js';
import DoctorDetail from './components/DoctorDetail.js';
import BookAppointment from './components/BookAppointment.js';
import UserProfile from './components/UserProfile.js';
import Login from './components/Login.js';
import Register from './components/Register.js';
import Dashboard from './components/Dashboard.js';
import DoctorDashboard from './components/DoctorDashboard.js';

const routes = [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { 
        path: '/dashboard', 
        component: Dashboard,
        meta: { requiresAuth: true, role: 'patient' }
    },
    { 
        path: '/doctor/dashboard', 
        component: DoctorDashboard,
        meta: { requiresAuth: true, role: 'doctor' }
    },
    { 
        path: '/appointments', 
        component: AppointmentList,
        meta: { requiresAuth: true }
    },
    { 
        path: '/appointments/:id', 
        component: AppointmentDetail,
        meta: { requiresAuth: true }
    },
    { 
        path: '/doctors', 
        component: DoctorList,
        meta: { requiresAuth: true, role: 'patient' }
    },
    { 
        path: '/doctors/:id', 
        component: DoctorDetail,
        meta: { requiresAuth: true, role: 'patient' }
    },
    { 
        path: '/doctors/:id/book', 
        component: BookAppointment,
        meta: { requiresAuth: true, role: 'patient' }
    },
    { 
        path: '/profile', 
        component: UserProfile,
        meta: { requiresAuth: true }
    }
];

const router = new VueRouter({
    routes
});

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const roleRestriction = to.matched.find(record => record.meta.role);
    
    if (requiresAuth && !token) {
        next('/login');
    } else if (roleRestriction && roleRestriction.meta.role !== user.role) {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'doctor') {
            next('/doctor/dashboard');
        } else if (user.role === 'patient') {
            next('/dashboard');
        } else {
            next('/login');
        }
    } else {
        next();
    }
});

export default router;
