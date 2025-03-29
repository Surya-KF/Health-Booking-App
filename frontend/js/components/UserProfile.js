export default {
    template: `
    <div class="container">
        <div v-if="loading" class="text-center my-5">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
        
        <div v-else>
            <h2 class="mb-4">My Profile</h2>
            
            <div class="row">
                <div class="col-md-4 mb-4">
                    <div class="card">
                        <div class="card-body text-center">
                            <div class="position-relative mb-3 mx-auto" style="width: 150px; height: 150px;">
                                <img :src="user.profile_image || '/img/default-avatar.png'" 
                                     class="rounded-circle w-100 h-100 object-fit-cover" alt="Profile image">
                                <button class="btn btn-sm btn-primary position-absolute bottom-0 end-0" 
                                        @click="triggerFileInput">
                                    <i class="bi bi-camera"></i>
                                </button>
                                <input type="file" ref="fileInput" class="d-none" accept="image/*" @change="handleFileUpload">
                            </div>
                            
                            <h4>{{ user.name }}</h4>
                            <p class="text-muted">{{ userRole === 'doctor' ? user.specialization : '' }}</p>
                            
                            <div class="d-grid gap-2 mt-3">
                                <button class="btn btn-outline-danger" @click="showChangePasswordModal">
                                    <i class="bi bi-lock"></i> Change Password
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card mt-4">
                        <div class="card-header bg-white">
                            <h5 class="mb-0">Account Information</h5>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <div class="text-muted small">Email</div>
                                <div>{{ user.email }}</div>
                            </div>
                            
                            <div class="mb-3">
                                <div class="text-muted small">Account Type</div>
                                <div class="badge bg-primary">{{ userRole === 'doctor' ? 'Doctor' : 'Patient' }}</div>
                            </div>
                            
                            <div>
                                <div class="text-muted small">Member Since</div>
                                <div>{{ formatDate(user.created_at) }}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Personal Information</h5>
                            <button class="btn btn-sm btn-primary" @click="toggleEditMode">
                                {{ isEditing ? 'Cancel' : 'Edit Profile' }}
                            </button>
                        </div>
                        <div class="card-body">
                            <form @submit.prevent="updateProfile">
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="name" class="form-label">Full Name</label>
                                        <input type="text" class="form-control" id="name" v-model="formData.name" 
                                               :disabled="!isEditing" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="phone" class="form-label">Phone Number</label>
                                        <input type="tel" class="form-control" id="phone" v-model="formData.phone" 
                                               :disabled="!isEditing">
                                    </div>
                                </div>
                                
                                <!-- Patient-specific fields -->
                                <div v-if="userRole === 'patient'">
                                    <div class="row mb-3">
                                        <div class="col-md-6">
                                            <label for="dob" class="form-label">Date of Birth</label>
                                            <input type="date" class="form-control" id="dob" v-model="formData.dob" 
                                                   :disabled="!isEditing">
                                        </div>
                                        <div class="col-md-6">
                                            <label for="gender" class="form-label">Gender</label>
                                            <select class="form-select" id="gender" v-model="formData.gender" 
                                                    :disabled="!isEditing">
                                                <option value="">Select Gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label for="address" class="form-label">Address</label>
                                        <textarea class="form-control" id="address" rows="2" v-model="formData.address" 
                                                  :disabled="!isEditing"></textarea>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label for="emergency_contact" class="form-label">Emergency Contact</label>
                                        <input type="text" class="form-control" id="emergency_contact" 
                                               v-model="formData.emergency_contact" :disabled="!isEditing">
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label for="medical_history" class="form-label">Medical History</label>
                                        <textarea class="form-control" id="medical_history" rows="3" 
                                                  v-model="formData.medical_history" :disabled="!isEditing"></textarea>
                                    </div>
                                </div>
                                
                                <!-- Doctor-specific fields -->
                                <div v-if="userRole === 'doctor'">
                                    <div class="mb-3">
                                        <label for="specialization" class="form-label">Specialization</label>
                                        <select class="form-select" id="specialization" v-model="formData.specialization" 
                                                :disabled="!isEditing">
                                            <option value="">Select Specialization</option>
                                            <option v-for="specialization in specializations" :key="specialization" 
                                                    :value="specialization">
                                                {{ specialization }}
                                            </option>
                                        </select>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label for="bio" class="form-label">Biography</label>
                                        <textarea class="form-control" id="bio" rows="3" v-model="formData.bio" 
                                                  :disabled="!isEditing"></textarea>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label for="consultation_fee" class="form-label">Consultation Fee ($)</label>
                                        <input type="number" class="form-control" id="consultation_fee" 
                                               v-model="formData.consultation_fee" :disabled="!isEditing">
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label for="address" class="form-label">Office Address</label>
                                        <textarea class="form-control" id="address" rows="2" v-model="formData.address" 
                                                  :disabled="!isEditing"></textarea>
                                    </div>
                                </div>
                                
                                <div v-if="isEditing" class="d-grid gap-2 mt-4">
                                    <button type="submit" class="btn btn-primary" :disabled="updating">
                                        <span v-if="updating">
                                            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            Updating...
                                        </span>
                                        <span v-else>Save Changes</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Change Password Modal -->
        <div class="modal fade" id="changePasswordModal" tabindex="-1" aria-labelledby="changePasswordModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="changePasswordModalLabel">Change Password</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="changePassword">
                            <div class="mb-3">
                                <label for="currentPassword" class="form-label">Current Password</label>
                                <input type="password" class="form-control" id="currentPassword" v-model="passwordData.currentPassword" required>
                            </div>
                            <div class="mb-3">
                                <label for="newPassword" class="form-label">New Password</label>
                                <input type="password" class="form-control" id="newPassword" v-model="passwordData.newPassword" required>
                            </div>
                            <div class="mb-3">
                                <label for="confirmPassword" class="form-label">Confirm New Password</label>
                                <input type="password" class="form-control" id="confirmPassword" v-model="passwordData.confirmPassword" required>
                                <div v-if="passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword" 
                                     class="text-danger mt-1">
                                    Passwords do not match
                                </div>
                            </div>
                            <div class="d-grid">
                                <button type="submit" class="btn btn-primary" 
                                        :disabled="changingPassword || !passwordData.currentPassword || !passwordData.newPassword || 
                                                   !passwordData.confirmPassword || passwordData.newPassword !== passwordData.confirmPassword">
                                    <span v-if="changingPassword">
                                        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        Updating...
                                    </span>
                                    <span v-else>Change Password</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            user: {},
            userRole: '',
            loading: true,
            isEditing: false,
            updating: false,
            formData: {
                name: '',
                phone: '',
                dob: '',
                gender: '',
                address: '',
                emergency_contact: '',
                medical_history: '',
                specialization: '',
                bio: '',
                consultation_fee: '',
            },
            specializations: [],
            passwordData: {
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            },
            changingPassword: false,
            passwordModal: null
        }
    },
    created() {
        // Get user role from localStorage
        const user = JSON.parse(localStorage.getItem('user'))
        this.userRole = user?.role || ''
        
        this.fetchUserProfile()
        
        if (this.userRole === 'doctor') {
            this.fetchSpecializations()
        }
    },
    mounted() {
        // Initialize Bootstrap modal
        this.passwordModal = new bootstrap.Modal(document.getElementById('changePasswordModal'))
    },
    methods: {
        async fetchUserProfile() {
            this.loading = true
            
            try {
                const token = localStorage.getItem('token')
                let endpoint = ''
                
                if (this.userRole === 'doctor') {
                    endpoint = '/api/doctors/profile'
                } else {
                    endpoint = '/api/patients/profile'
                }
                
                const response = await axios.get(endpoint, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                
                this.user = response.data
                
                // Initialize form data with user data
                this.formData = {
                    name: this.user.name || '',
                    phone: this.user.phone || '',
                    dob: this.user.dob || '',
                    gender: this.user.gender || '',
                    address: this.user.address || '',
                    emergency_contact: this.user.emergency_contact || '',
                    medical_history: this.user.medical_history || '',
                    specialization: this.user.specialization || '',
                    bio: this.user.bio || '',
                    consultation_fee: this.user.consultation_fee || '',
                }
            } catch (error) {
                console.error('Error fetching user profile:', error)
            } finally {
                this.loading = false
            }
        },
        async updateProfile() {
            this.updatingProfile = true
            
            try {
                await axios.put('/api/users/profile', this.profileForm, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                
                // Refresh user data
                await this.fetchUserProfile()
                
                alert('Profile updated successfully!')
            } catch (error) {
                console.error('Error updating profile:', error)
                alert('Failed to update profile. Please try again.')
            } finally {
                this.updatingProfile = false
            }
        },
        async changePassword() {
            // Validate passwords match
            if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
                this.passwordError = 'New passwords do not match'
                return
            }
            
            this.changingPassword = true
            this.passwordError = ''
            
            try {
                await axios.put('/api/users/password', {
                    current_password: this.passwordForm.currentPassword,
                    new_password: this.passwordForm.newPassword
                }, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                
                // Reset form
                this.passwordForm = {
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }
                
                alert('Password changed successfully!')
            } catch (error) {
                if (error.response && error.response.data) {
                    this.passwordError = error.response.data.message || 'Failed to change password'
                } else {
                    this.passwordError = 'An error occurred while changing password'
                }
            } finally {
                this.changingPassword = false
            }
        },
        async updateProfessionalInfo() {
            this.updatingProfessional = true
            
            try {
                await axios.put('/api/doctors/profile', this.professionalForm, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                
                // Refresh user data
                await this.fetchUserProfile()
                
                alert('Professional information updated successfully!')
            } catch (error) {
                console.error('Error updating professional information:', error)
                alert('Failed to update professional information. Please try again.')
            } finally {
                this.updatingProfessional = false
            }
        }
    }
}