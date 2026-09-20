import client from './client'

// --- Auth ---
export const registerUser = (payload) => client.post('/auth/register/', payload)
export const loginUser = (payload) => client.post('/auth/login/', payload)
export const fetchMe = () => client.get('/auth/me/')
export const updateMe = (payload) => client.patch('/auth/me/', payload)

// --- Jobs ---
export const fetchJobs = (params) => client.get('/jobs/', { params })
export const fetchJob = (id) => client.get(`/jobs/${id}/`)
export const createJob = (payload) => client.post('/jobs/', payload)
export const applyToJob = (id, payload) => client.post(`/jobs/${id}/apply/`, payload)
export const fetchJobApplications = (id) => client.get(`/jobs/${id}/applications/`)
export const fetchMyApplications = () => client.get('/jobs/applications/')
export const updateApplicationStage = (id, stage) =>
  client.patch(`/jobs/applications/${id}/`, { stage })
export const rateJobSeeker = (id, payload) => client.post(`/jobs/applications/${id}/rate/`, payload)
export const fetchApplicationMessages = (id) => client.get(`/jobs/applications/${id}/messages/`)
export const sendApplicationMessage = (id, body) => client.post(`/jobs/applications/${id}/messages/`, { body })

// --- Gigs ---
export const fetchGigs = (params) => client.get('/gigs/', { params })
export const fetchGig = (id) => client.get(`/gigs/${id}/`)
export const createGig = (payload) => client.post('/gigs/', payload)
export const proposeToGig = (id, payload) => client.post(`/gigs/${id}/propose/`, payload)

// --- Employers ---
export const fetchHiringDashboard = () => client.get('/employers/dashboard/')
export const fetchMyCompanyProfile = () => client.get('/employers/profile/')
export const createCompanyProfile = (payload) => client.post('/employers/profile/', payload)
