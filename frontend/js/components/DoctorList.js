export default {
    template: `
    <div class="container">
        <h2 class="mb-4">Find a Doctor</h2>
        
        <div class="row mb-4">
            <div class="col-md-8">
                <div class="input-group">
                    <input type="text" class="form-control" placeholder="Search by name or specialization..." v-model="searchQuery">
                    <button class="btn btn-primary" type="button" @click="searchDoctors">
                        <i class="bi bi-search"></i> Search
                    </button>
                </div>
            </div>
            <div class="col-md-4">
                <select class="form-select" v-model="selectedSpecialization">
                    <option value="">All Specializations</option>
                    <option v-for="specialization in specializations" :key="specialization" :value="specialization">
                        {{ specialization }}
                    </option>
                </select>
            </div>
        </div>
        
        <div v-if="loading" class="text-center my-5">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
        
        <div v-else-if="error" class="alert alert-danger">
            {{ error }}
        </div>
        
        <div v-else-if="doctors.length === 0" class="text-center my-5">
            <div class="mb-3">
                <i class="bi bi-search" style="font-size: 3rem;"></i>
            </div>
            <h5>No doctors found</h5>
            <p class="text-muted">Try adjusting your search criteria</p>
        </div>
        
        <div v-else>
            <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                <div v-for="doctor in doctors" :key="doctor._id" class="col">
                    <div class="card h-100">
                        <div class="card-body">
                            <div class="d-flex mb-3">
                                <div class="flex-shrink-0">
                                    <img :src="doctor.profile_image || '/img/default-doctor.png'" 
                                         class="rounded-circle" width="60" height="60" alt="Doctor profile">
                                </div>
                                <div class="ms-3">
                                    <h5 class="card-title mb-0">Dr. {{ doctor.name }}</h5>
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
                            
                            <p class="card-text">{{ doctor.bio ? truncateBio(doctor.bio) : 'No bio available' }}</p>
                        </div>
                        <div class="card-footer bg-white border-top-0">
                            <div class="d-grid gap-2">
                                <router-link :to="'/doctors/' + doctor._id" class="btn btn-outline-primary">View Profile</router-link>
                                <button class="btn btn-primary" @click="bookAppointment(doctor._id)">Book Appointment</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Pagination -->
            <nav v-if="totalPages > 1" aria-label="Doctor pagination" class="mt-4">
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
    `,
    data() {
        return {
            doctors: [],
            specializations: [],
            loading: true,
            error: null,
            searchQuery: '',
            selectedSpecialization: '',
            currentPage: 1,
            itemsPerPage: 9,
            totalItems: 0,
            totalPages: 0
        }
    },
    computed: {
        paginationRange() {
            const range = []
            const maxVisiblePages = 5
            
            let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2))
            let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1)
            
            if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1)
            }
            
            for (let i = startPage; i <= endPage; i++) {
                range.push(i)
            }
            
            return range
        }
    },
    created() {
        this.fetchSpecializations()
        this.fetchDoctors()
    },
    methods: {
        async fetchSpecializations() {
            try {
                const response = await axios.get('/api/specializations')
                this.specializations = response.data
            } catch (error) {
                console.error('Error fetching specializations:', error)
            }
        },
        
        async fetchDoctors() {
            this.loading = true
            this.error = null
            
            try {
                // Construct query parameters
                const params = {
                    page: this.currentPage,
                    limit: this.itemsPerPage,
                    search: this.searchQuery,
                    specialization: this.selectedSpecialization
                }
                
                const response = await axios.get('/api/doctors', { params })
                
                const data = response.data
                this.doctors = data.doctors
                this.totalItems = data.total
                this.totalPages = data.pages
            } catch (error) {
                console.error('Error fetching doctors:', error)
                this.error = 'Failed to load doctors. Please try again later.'
            } finally {
                this.loading = false
            }
        },
        
        searchDoctors() {
            this.currentPage = 1
            this.fetchDoctors()
        },
        
        changePage(page) {
            if (page < 1 || page > this.totalPages) {
                return
            }
            
            this.currentPage = page
            this.fetchDoctors()
        },
        
        truncateBio(bio) {
            return bio.length > 100 ? bio.substring(0, 100) + '...' : bio
        },
        
        bookAppointment(doctorId) {
            this.$router.push(`/doctors/${doctorId}/book`)
        }
    },
    watch: {
        selectedSpecialization() {
            this.currentPage = 1
            this.fetchDoctors()
        }
    }
}