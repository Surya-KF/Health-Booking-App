export default {
    template: `
    <div class="container">
        <h2 class="mb-4">Manage Availability</h2>
        
        <div v-if="loading" class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
        
        <div v-else>
            <div class="alert alert-info mb-4">
                <p class="mb-0">Set your available time slots for appointments. Patients will only be able to book appointments during these times.</p>
            </div>
            
            <div class="card mb-4">
                <div class="card-header bg-primary text-white">
                    <h4 class="mb-0">Weekly Schedule</h4>
                </div>
                <div class="card-body">
                    <div v-for="(day, index) in weekDays" :key="day" class="mb-4">
                        <div class="d-flex align-items-center mb-2">
                            <h5 class="mb-0">{{ day }}</h5>
                            <div class="form-check form-switch ms-3">
                                <input class="form-check-input" type="checkbox" :id="'day-' + index" v-model="schedule[index].isAvailable">
                                <label class="form-check-label" :for="'day-' + index">Available</label>
                            </div>
                        </div>
                        
                        <div v-if="schedule[index].isAvailable" class="row">
                            <div class="col-md-5">
                                <div class="mb-3">
                                    <label :for="'start-time-' + index" class="form-label">Start Time</label>
                                    <input type="time" class="form-control" :id="'start-time-' + index" v-model="schedule[index].startTime">
                                </div>
                            </div>
                            <div class="col-md-5">
                                <div class="mb-3">
                                    <label :for="'end-time-' + index" class="form-label">End Time</label>
                                    <input type="time" class="form-control" :id="'end-time-' + index" v-model="schedule[index].endTime">
                                </div>
                            </div>
                            <div class="col-md-2">
                                <div class="mb-3">
                                    <label :for="'slot-duration-' + index" class="form-label">Duration (min)</label>
                                    <select class="form-select" :id="'slot-duration-' + index" v-model="schedule[index].slotDuration">
                                        <option value="15">15</option>
                                        <option value="30">30</option>
                                        <option value="45">45</option>
                                        <option value="60">60</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button @click="saveSchedule" class="btn btn-primary" :disabled="savingSchedule">
                        {{ savingSchedule ? 'Saving...' : 'Save Schedule' }}
                    </button>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <h4 class="mb-0">Unavailable Dates</h4>
                </div>
                <div class="card-body">
                    <p>Mark specific dates as unavailable (e.g., holidays, vacations, etc.)</p>
                    
                    <div class="row mb-4">
                        <div class="col-md-4">
                            <div class="mb-3">
                                <label for="unavailable-date" class="form-label">Date</label>
                                <input type="date" class="form-control" id="unavailable-date" v-model="newUnavailableDate" :min="minDate">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="unavailable-reason" class="form-label">Reason (optional)</label>
                                <input type="text" class="form-control" id="unavailable-reason" v-model="newUnavailableReason">
                            </div>
                        </div>
                        <div class="col-md-2 d-flex align-items-end">
                            <button @click="addUnavailableDate" class="btn btn-primary mb-3" :disabled="!newUnavailableDate">Add</button>
                        </div>
                    </div>
                    
                    <div v-if="unavailableDates.length === 0" class="alert alert-info">
                        No unavailable dates set.
                    </div>
                    
                    <div v-else class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Reason</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(date, index) in unavailableDates" :key="index">
                                    <td>{{ formatDate(date.date) }}</td>
                                    <td>{{ date.reason || 'Not specified' }}</td>
                                    <td>
                                        <button @click="removeUnavailableDate(index)" class="btn btn-sm btn-danger">
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            weekDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            schedule: [
                { isAvailable: false, startTime: '09:00', endTime: '17:00', slotDuration: '30' },
                { isAvailable: false, startTime: '09:00', endTime: '17:00', slotDuration: '30' },
                { isAvailable: false, startTime: '09:00', endTime: '17:00', slotDuration: '30' },
                { isAvailable: false, startTime: '09:00', endTime: '17:00', slotDuration: '30' },
                { isAvailable: false, startTime: '09:00', endTime: '17:00', slotDuration: '30' },
                { isAvailable: false, startTime: '09:00', endTime: '17:00', slotDuration: '30' },
                { isAvailable: false, startTime: '09:00', endTime: '17:00', slotDuration: '30' }
            ],
            unavailableDates: [],
            newUnavailableDate: '',
            newUnavailableReason: '',
            loading: true,
            savingSchedule: false
        }
    },
    computed: {
        minDate() {
            const today = new Date()
            return today.toISOString().split('T')[0]
        }
    },
    created() {
        this.fetchAvailability()
    },
    methods: {
        async fetchAvailability() {
            this.loading = true
            
            try {
                const response = await axios.get('/api/doctors/availability', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                
                const data = response.data
                
                // Set weekly schedule
                if (data.weekly_schedule && data.weekly_schedule.length === 7) {
                    this.schedule = data.weekly_schedule.map(day => ({
                        isAvailable: day.is_available,
                        startTime: day.start_time || '09:00',
                        endTime: day.end_time || '17:00',
                        slotDuration: day.slot_duration.toString() || '30'
                    }))
                }
                
                // Set unavailable dates
                if (data.unavailable_dates) {
                    this.unavailableDates = data.unavailable_dates
                }
            } catch (error) {
                console.error('Error fetching availability:', error)
            } finally {
                this.loading = false
            }
        },
        async saveSchedule() {
            this.savingSchedule = true
            
            try {
                const weeklySchedule = this.schedule.map(day => ({
                    is_available: day.isAvailable,
                    start_time: day.startTime,
                    end_time: day.endTime,
                    slot_duration: parseInt(day.slotDuration)
                }))
                
                await axios.put('/api/doctors/availability', {
                    weekly_schedule: weeklySchedule,
                    unavailable_dates: this.unavailableDates
                }, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                
                alert('Schedule saved successfully!')
            } catch (error) {
                console.error('Error saving schedule:', error)
                alert('Failed to save schedule. Please try again.')
            } finally {
                this.savingSchedule = false
            }
        },
        addUnavailableDate() {
            if (!this.newUnavailableDate) return
            
            this.unavailableDates.push({
                date: this.newUnavailableDate,
                reason: this.newUnavailableReason
            })
            
            // Sort dates in ascending order
            this.unavailableDates.sort((a, b) => new Date(a.date) - new Date(b.date))
            
            // Reset form
            this.newUnavailableDate = ''
            this.newUnavailableReason = ''
        },
        removeUnavailableDate(index) {
            this.unavailableDates.splice(index, 1)
        },
        formatDate(dateString) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' }
            return new Date(dateString).toLocaleDateString(undefined, options)
        }
    }
}